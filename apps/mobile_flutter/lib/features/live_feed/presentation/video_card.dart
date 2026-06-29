import 'package:flutter/material.dart';
import '../data/video_model.dart';

class VideoCard extends StatelessWidget {
  final VideoModel video;
  final VoidCallback? onComplete;

  const VideoCard({
    super.key,
    required this.video,
    this.onComplete,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onDoubleTap: onComplete,
      child: Container(
        color: Colors.black,
        child: Stack(
          children: [
            Center(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Text(
                  video.title,
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 28,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
            Positioned(
              left: 16,
              right: 80,
              bottom: 48,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    video.category.toUpperCase(),
                    style: const TextStyle(
                      color: Colors.white70,
                      fontSize: 12,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    video.title,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                    ),
                  ),
                  const SizedBox(height: 8),
                  // ✅ Updated: Display Rank and Viral scores
                  Text(
                    '${video.region ?? 'Global'} • Rank ${video.rankScore} • Viral ${video.viralProbability}',
                    style: const TextStyle(
                      color: Colors.white54,
                      fontSize: 13,
                    ),
                  ),
                ],
              ),
            ),
            Positioned(
              right: 16,
              bottom: 80,
              child: Column(
                children: const [
                  Icon(Icons.favorite_border, color: Colors.white, size: 34),
                  SizedBox(height: 22),
                  Icon(Icons.comment, color: Colors.white, size: 34),
                  SizedBox(height: 22),
                  Icon(Icons.share, color: Colors.white, size: 34),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}