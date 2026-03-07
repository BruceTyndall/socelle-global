import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';

import '../../../core/theme/socelle_theme.dart';
import '../../../core/shared/loading_widget.dart';

/// SCORM content player using WebView.
///
/// Loads SCORM packages via a WebView and injects a JavaScript API bridge
/// that intercepts SCORM 1.2 / SCORM 2004 API calls for tracking completion,
/// score, and time spent.
class ScormPlayer extends StatefulWidget {
  const ScormPlayer({
    super.key,
    required this.scormUrl,
    this.onComplete,
    this.onScore,
    this.onProgress,
  });

  /// URL to the SCORM package entry point (index.html).
  final String scormUrl;

  /// Called when the SCORM content reports completion.
  final VoidCallback? onComplete;

  /// Called when the SCORM content reports a score.
  final ValueChanged<double>? onScore;

  /// Called with progress updates (0.0 - 1.0).
  final ValueChanged<double>? onProgress;

  @override
  State<ScormPlayer> createState() => _ScormPlayerState();
}

class _ScormPlayerState extends State<ScormPlayer> {
  late final WebViewController _controller;
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _initWebView();
  }

  void _initWebView() {
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(SocelleTheme.mnBg)
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageStarted: (_) {
            if (mounted) setState(() => _isLoading = true);
          },
          onPageFinished: (_) {
            if (mounted) setState(() => _isLoading = false);
            _injectScormBridge();
          },
          onWebResourceError: (error) {
            if (mounted) {
              setState(() {
                _isLoading = false;
                _error = error.description;
              });
            }
          },
        ),
      )
      ..addJavaScriptChannel(
        'SocelleScormBridge',
        onMessageReceived: _handleScormMessage,
      )
      ..loadRequest(Uri.parse(widget.scormUrl));
  }

  /// Injects a SCORM API bridge that intercepts LMSSetValue / SetValue calls
  /// and forwards them to the Flutter layer via the SocelleScormBridge channel.
  Future<void> _injectScormBridge() async {
    const bridgeJs = '''
      (function() {
        // SCORM 1.2 API
        window.API = window.API || {};
        var originalSetValue12 = window.API.LMSSetValue || function(){};
        window.API.LMSSetValue = function(key, value) {
          SocelleScormBridge.postMessage(JSON.stringify({api: '1.2', key: key, value: value}));
          return originalSetValue12(key, value);
        };
        window.API.LMSInitialize = window.API.LMSInitialize || function() { return 'true'; };
        window.API.LMSGetValue = window.API.LMSGetValue || function() { return ''; };
        window.API.LMSCommit = window.API.LMSCommit || function() { return 'true'; };
        window.API.LMSFinish = window.API.LMSFinish || function() {
          SocelleScormBridge.postMessage(JSON.stringify({api: '1.2', key: 'finish', value: 'true'}));
          return 'true';
        };
        window.API.LMSGetLastError = window.API.LMSGetLastError || function() { return '0'; };
        window.API.LMSGetDiagnostic = window.API.LMSGetDiagnostic || function() { return ''; };
        window.API.LMSGetErrorString = window.API.LMSGetErrorString || function() { return ''; };

        // SCORM 2004 API
        window.API_1484_11 = window.API_1484_11 || {};
        var originalSetValue2004 = window.API_1484_11.SetValue || function(){};
        window.API_1484_11.SetValue = function(key, value) {
          SocelleScormBridge.postMessage(JSON.stringify({api: '2004', key: key, value: value}));
          return originalSetValue2004(key, value);
        };
        window.API_1484_11.Initialize = window.API_1484_11.Initialize || function() { return 'true'; };
        window.API_1484_11.GetValue = window.API_1484_11.GetValue || function() { return ''; };
        window.API_1484_11.Commit = window.API_1484_11.Commit || function() { return 'true'; };
        window.API_1484_11.Terminate = window.API_1484_11.Terminate || function() {
          SocelleScormBridge.postMessage(JSON.stringify({api: '2004', key: 'terminate', value: 'true'}));
          return 'true';
        };
        window.API_1484_11.GetLastError = window.API_1484_11.GetLastError || function() { return '0'; };
        window.API_1484_11.GetDiagnostic = window.API_1484_11.GetDiagnostic || function() { return ''; };
        window.API_1484_11.GetErrorString = window.API_1484_11.GetErrorString || function() { return ''; };
      })();
    ''';
    await _controller.runJavaScript(bridgeJs);
  }

  void _handleScormMessage(JavaScriptMessage message) {
    try {
      // Parse the message as a simple key-value check
      final body = message.message;
      if (body.contains('"cmi.core.lesson_status"') ||
          body.contains('"cmi.completion_status"')) {
        if (body.contains('"completed"') || body.contains('"passed"')) {
          widget.onComplete?.call();
        }
      }
      if (body.contains('"cmi.core.score.raw"') ||
          body.contains('"cmi.score.raw"')) {
        // Extract score value — simple regex approach
        final scoreMatch = RegExp(r'"value"\s*:\s*"(\d+\.?\d*)"').firstMatch(body);
        if (scoreMatch != null) {
          final score = double.tryParse(scoreMatch.group(1)!) ?? 0;
          widget.onScore?.call(score);
        }
      }
      if (body.contains('"cmi.progress_measure"')) {
        final progressMatch =
            RegExp(r'"value"\s*:\s*"([\d.]+)"').firstMatch(body);
        if (progressMatch != null) {
          final progress = double.tryParse(progressMatch.group(1)!) ?? 0;
          widget.onProgress?.call(progress);
        }
      }
    } catch (_) {
      // Non-fatal — SCORM messages can be noisy
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_error != null) {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.error_outline_rounded,
                size: 48, color: SocelleTheme.signalDown),
            const SizedBox(height: SocelleTheme.spacingMd),
            Text('Failed to load SCORM content',
                style: SocelleTheme.titleMedium),
            const SizedBox(height: SocelleTheme.spacingSm),
            Text(_error!, style: SocelleTheme.bodySmall, textAlign: TextAlign.center),
          ],
        ),
      );
    }

    return Stack(
      children: [
        WebViewWidget(controller: _controller),
        if (_isLoading)
          const Positioned.fill(
            child: ColoredBox(
              color: SocelleTheme.mnBg,
              child: SocelleLoadingWidget(message: 'Loading SCORM content...'),
            ),
          ),
      ],
    );
  }
}
