import 'package:flutter/material.dart';
import '../data/feed_repository.dart';
import '../data/video_model.dart';
import 'video_card.dart';

class LiveFeedScreen extends StatefulWidget {
  final String apiBaseUrl; // ✅ add this

  const LiveFeedScreen({
    super.key,
    required this.apiBaseUrl, // ✅ require apiBaseUrl
  });

  @override
  State<LiveFeedScreen> createState() => _LiveFeedScreenState();
}

class _LiveFeedScreenState extends State<LiveFeedScreen> {
  late final FeedRepository repository;
  late Future<List<VideoModel>> feedFuture;
  static const String demoUserId = 'demo-user';

  @override
  void initState() {
    super.initState();
    // ✅ initialize repository with apiBaseUrl
    repository = FeedRepository(baseUrl: widget.apiBaseUrl);
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

// ✅ Re‑add ErrorView and EmptyView so they compile
class _ErrorView extends StatelessWidget {
  final String message;
  final VoidCallback onRetry;
  const _ErrorView({required this.message, required this.onRetry});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Text('YohPal Live feed failed to load.'),
          Text(message),
          ElevatedButton(onPressed: onRetry, child: const Text('Retry')),
        ],
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
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Text('No seed videos yet.'),
          ElevatedButton(onPressed: onRetry, child: const Text('Refresh')),
        ],
      ),
    );
  }
}
