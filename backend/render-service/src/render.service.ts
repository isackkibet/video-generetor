import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma.service';
import { publishEvent } from '../../shared/kafka';
import { env } from '../../shared/env';
import { KafkaTopics } from '../../../contracts/kafka-events';
import {
 CreateVideoJobRequest,
 RenderVideoRequest
} from '../../../contracts/api-contracts';
@Injectable()
export class RenderService {
 constructor(private readonly prisma: PrismaService) {}
 async createVideoJob(input: CreateVideoJobRequest) {
 const script = await this.prisma.script.findUnique({
 where: { id: input.scriptId },
 include: {
 trend: true
 }
 });
 if (!script) {
 throw new NotFoundException(`Script not found: ${input.scriptId}`);
 }
 let avatarId = input.avatarId;
 if (!avatarId) {
 const avatar = await this.prisma.avatar.findFirst({
 where: {
 isActive: true,
 OR: [
 { category: script.trend?.category || 'general' },
 { category: 'general' },
 { category: 'motivation' }
 ]
 },
 orderBy: {
 createdAt: 'asc'
 }
 });
 avatarId = avatar?.id;
 }
 const video = await this.prisma.video.create({
 data: {
 creatorId: input.creatorId,
 avatarId,
 scriptId: script.id,
 title: script.title,
 category: script.trend?.category || 'seed_content',
 region: script.trend?.region,
 country: script.trend?.country,
 language: script.language,
 durationSeconds: script.durationHint,
 isSeedContent: true,
 status: 'SCRIPTED'
 }
 });
 await publishEvent(
 KafkaTopics.VIDEO_RENDER_REQUESTED,
 {
 videoId: video.id,
 scriptId: script.id,
 avatarId
 },
 video.id
 );
 return video;
 }
 async createJobsForUnrenderedScripts(take = 20) {
 const scripts = await this.prisma.script.findMany({
 where: {
 videos: {
 none: {}
 }
 },
 include: {
 trend: true
 },
 orderBy: {
 createdAt: 'desc'
 },
 take
 });
 const created = [];
 for (const script of scripts) {
 created.push(
 await this.createVideoJob({
 scriptId: script.id
 })
 );
 }
 return created;
 }
 async renderVideo(input: RenderVideoRequest) {
 const video = await this.prisma.video.findUnique({
 where: { id: input.videoId },
 include: {
 script: true,
 avatar: true
 }
 });
 if (!video) {
 throw new NotFoundException(`Video not found: ${input.videoId}`);
 }
 await this.prisma.video.update({
 where: { id: video.id },
 data: {
 status: 'RENDERING'
 }
 });
 const mockVideoUrl = `${env.cdnBaseUrl}/videos/${video.id}.mp4`;
 const mockThumbnailUrl = `${env.cdnBaseUrl}/thumbnails/${video.id}.jpg`;
 const rendered = await this.prisma.video.update({
 where: { id: video.id },
 data: {
 status: 'MODERATION',
 videoUrl: mockVideoUrl,
 thumbnailUrl: mockThumbnailUrl,
 durationSeconds: video.durationSeconds || 45
 }
 });
 await publishEvent(
 KafkaTopics.VIDEO_RENDERED,
 {
 videoId: rendered.id,
 videoUrl: rendered.videoUrl,
 thumbnailUrl: rendered.thumbnailUrl,
 durationSeconds: rendered.durationSeconds || 45
 },
 rendered.id
 );
 return {
 video: rendered,
 renderProvider: env.videoRenderProvider,
 note:
 'Mock render completed. Replace this with real TTS, avatar renderer, subtitle compositor, and video
encoder in the AI media pipeline.'
 };
 }
 async renderPendingVideos(take = 20) {
 const videos = await this.prisma.video.findMany({
 where: {
 status: 'SCRIPTED'
 },
 orderBy: {
 createdAt: 'asc'
 },
 take
 });
 const rendered = [];
 for (const video of videos) {
 rendered.push(
 await this.renderVideo({
 videoId: video.id
 })
 );
 }
 return rendered;
 }
 async listVideos(params: {
 status?: 'DRAFT' | 'SCRIPTED' | 'RENDERING' | 'MODERATION' | 'APPROVED' | 'PUBLISHED' | 'REJECTED' |
'FAILED';
 category?: string;
 region?: string;
 country?: string;
 take?: number;
 }) {
 return this.prisma.video.findMany({
 where: {
 status: params.status,
 category: params.category,
 region: params.region,
 country: params.country
 },
 include: {
 script: true,
 avatar: true,
 creator: true,
 score: true,
 moderationLogs: true
 },
 orderBy: {
 createdAt: 'desc'
 },
 take: params.take || 50
 });
 }
 async getVideo(id: string) {
 const video = await this.prisma.video.findUnique({
 where: { id },
 include: {
 script: true,
 avatar: true,
 creator: true,
 score: true,
 moderationLogs: true
 }
 });
 if (!video) {
 throw new NotFoundException(`Video not found: ${id}`);
 }
 return video;
 }
}