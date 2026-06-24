import 'package:flutter/material.dart';
import '../data/feed_repository.dart';
import '../data/video_model.dart';
import 'video_card.dart';

class LiveFeedScreen extends StatefulWidget {
  const LiveFeedScreen({super.key});
  @override
  State<LiveFeedScreen> createState() => _LiveFeedScreenState();
}

class _LiveFeedScreenState extends State<LiveFeedScreen> {
  final FeedRepository repository = FeedRepository();
  late Future<List<VideoModel>> feedFuture;
  static const String demoUserId = 'demo-user';
  @override
  void initState() {
    super.initState();
    feedFuture = repository.getSeedFeed(userId: demoUserId);
  }

  Future<void> refreshFeed() async {
    setState(() {
      feedFuture = repository.getSeedFeed(userId: demoUserId);
    });
  }

  Future<void> recordComplete(VideoModel video) async {
    await repository.recordEvent(
      userId: demoUserId,
      videoId: video.id,
      action: 'complete',
      watchMs: (video.durationSeconds ?? 45) * 1000,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: FutureBuilder<List<VideoModel>>(
        future: feedFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return _ErrorView(
              message: snapshot.error.toString(),
              onRetry: refreshFeed,
            );
          }
          final videos = snapshot.data ?? [];
          if (videos.isEmpty) {
            return _EmptyView(onRetry: refreshFeed);
          }
          return RefreshIndicator(
            onRefresh: refreshFeed,
            child: PageView.builder(
              scrollDirection: Axis.vertical,
              itemCount: videos.length,
              itemBuilder: (context, index) {
                final video = videos[index];
                return VideoCard(
                  video: video,
                  onComplete: () => recordComplete(video),
                );
              },
            ),
          );
        },
      ),
    );
  }
}

class _ErrorView extends StatelessWidget {
  final String message;
  final VoidCallback onRetry;
  const _ErrorView({required this.message, required this.onRetry});
  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text(
              'YohPal Live feed failed to load.',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 20),
            ),
            const SizedBox(height: 12),
            Text(
              message,
              textAlign: TextAlign.center,
              style: const TextStyle(color: Colors.white60),
            ),
            const SizedBox(height: 24),
            ElevatedButton(onPressed: onRetry, child: const Text('Retry')),
          ],
        ),
      ),
    );
  }
}

class _EmptyView extends StatelessWidget {
  final VoidCallback onRetry;
  const _EmptyView({required this.onRetry});
  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text('No seed videos yet.', style: TextStyle(fontSize: 22)),
            const SizedBox(height: 12),
            const Text(
              'Run the YohPal Live AI seed pipeline first.',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.white60),
            ),
            const SizedBox(height: 24),
            ElevatedButton(onPressed: onRetry, child: const Text('Refresh')),
          ],
        ),
      ),
    );
  }
}
