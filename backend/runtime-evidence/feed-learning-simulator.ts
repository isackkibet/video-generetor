import { Injectable } from '@nestjs/common';
import { PrismaService } from '../shared/prisma.service';

const actions = ['view', 'like', 'save', 'share', 'skip', 'complete'] as const;

@Injectable()
export class FeedLearningSimulator {
  constructor(private readonly prisma: PrismaService) {}

  async simulateFeedLearning(userId = 'runtime-demo-user') {
    const videos = await this.prisma.video.findMany({
      where: { status: 'PUBLISHED' },
      take: 20,
      orderBy: { createdAt: 'desc' },
    });

    let eventsCreated = 0;

    for (const video of videos) {
      for (const action of actions) {
        await this.prisma.feedEvent.create({
          data: {
            userId,
            videoId: video.id,
            action,
            watchMs: action === 'skip' ? 1500 : 15000,
            region: 'Nairobi',
            metadata: {
              source: 'runtime-evidence',
            },
          } as any,
        });
        eventsCreated++;
      }

      await this.prisma.userInterestProfile.upsert({
        where: {
          userId_category: {
            userId,
            category: video.category,
          },
        } as any,
        update: {
          score: { increment: 0.25 },
          eventCount: { increment: actions.length },
        } as any,
        create: {
          userId,
          category: video.category,
          score: 1.5,
          eventCount: actions.length,
        } as any,
      });
    }

    const profiles = await this.prisma.userInterestProfile.count({
      where: { userId },
    } as any);

    return {
      userId,
      videosUsed: videos.length,
      feedEventsCreated: eventsCreated,
      userInterestProfilesCreated: profiles,
    };
  }
}
