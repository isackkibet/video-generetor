import 'package:flutter/material.dart';
import 'features/live_feed/presentation/live_feed_screen.dart';

// ✅ Define API base URL depending on environment
// Use localhost:3000 for web/desktop, 10.0.2.2:3000 for Android emulator
const String apiBaseUrl = String.fromEnvironment(
  'API_BASE_URL',
  defaultValue: 'http://localhost:3000',
);

void main() {
  runApp(const YohPalLiveApp());
}

class YohPalLiveApp extends StatelessWidget {
  const YohPalLiveApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'YohPal Live',
      debugShowCheckedModeBanner: false,
      theme: ThemeData.dark(),
      // ✅ Pass apiBaseUrl down to LiveFeedScreen
      home: const LiveFeedScreen(apiBaseUrl: apiBaseUrl),
    );
  }
}
