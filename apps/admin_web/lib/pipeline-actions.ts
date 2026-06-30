'use server';
import { apiPost } from './api';
import { requireActionPermission } from './action-guard';
import { redirectError, redirectSuccess } from './action-result';
export async function discoverSeedTrendsAction() {
 try {
 await requireActionPermission('GENERATE');
 await apiPost('/trends/discover-seed');
 return redirectSuccess('/trends', 'Seed trends discovered successfully.');
 } catch (error) {
 return redirectError(
 '/trends',
 error instanceof Error ? error.message : 'Failed to discover seed trends.'
 );
 }
}
export async function generatePendingScriptsAction() {
 try {
 await requireActionPermission('GENERATE');
 await apiPost('/scripts/generate-pending?take=20');
 return redirectSuccess('/scripts', 'Pending scripts generated successfully.');
 } catch (error) {
 return redirectError(
 '/scripts',
 error instanceof Error ? error.message : 'Failed to generate scripts.'
 );
 }
}
export async function createPendingRenderJobsAction() {
 try {
 await requireActionPermission('GENERATE');
 await apiPost('/render/jobs/create-pending?take=20');
 return redirectSuccess('/videos', 'Pending render jobs created successfully.');
 } catch (error) {
 return redirectError(
 '/videos',
 error instanceof Error ? error.message : 'Failed to create render jobs.'
 );
 }
}
export async function renderPendingVideosAction() {
 try {
 await requireActionPermission('GENERATE');
 await apiPost('/render/videos/render-pending?take=20');
 return redirectSuccess('/videos', 'Pending videos rendered successfully.');
 } catch (error) {
 return redirectError(
 '/videos',
 error instanceof Error ? error.message : 'Failed to render videos.'
 );
 }
}
export async function moderatePendingVideosAction() {
 try {
 await requireActionPermission('MODERATE');
 await apiPost('/moderation/videos/moderate-pending?take=20');
 return redirectSuccess('/moderation', 'Pending videos moderated successfully.');
 } catch (error) {
 return redirectError(
 '/moderation',
 error instanceof Error ? error.message : 'Failed to moderate videos.'
 );
 }
}
export async function publishApprovedVideosAction() {
    try {
        await requireActionPermission('PUBLISH');
        await apiPost('/moderation/videos/publish-approved?take=20');
        return redirectSuccess('/moderation', 'Approved videos published successfully.');
    } catch (error) {
        return redirectError(
            '/moderation',
            error instanceof Error ? error.message : 'Failed to publish videos.'
        );
    }
}