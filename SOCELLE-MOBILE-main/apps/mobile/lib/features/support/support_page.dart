import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../core/theme/socelle_colors.dart';

class SupportPage extends StatelessWidget {
  const SupportPage({super.key});

  static const _supportEmail = 'support@socelle.app';
  static final Uri _supportMailUri = Uri(
    scheme: 'mailto',
    path: _supportEmail,
    queryParameters: <String, String>{
      'subject': 'Socelle Support',
    },
  );

  Future<void> _contactSupport(BuildContext context) async {
    if (await canLaunchUrl(_supportMailUri)) {
      await launchUrl(_supportMailUri);
      return;
    }

    await Clipboard.setData(const ClipboardData(text: _supportEmail));
    if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Support email copied to clipboard.'),
        ),
      );
    }
  }

  Future<void> _copyEmail(BuildContext context) async {
    await Clipboard.setData(const ClipboardData(text: _supportEmail));
    if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Support email copied.')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: SocelleColors.surfaceSoft,
      appBar: AppBar(
        title: const Text('Support & Feedback'),
      ),
      body: Stack(
        children: [
          const _SupportAtmosphere(),
          ListView(
            padding: const EdgeInsets.fromLTRB(16, 10, 16, 24),
            children: [
              _SupportHero(
                supportEmail: _supportEmail,
                onEmailTap: () => _contactSupport(context),
                onCopyTap: () => _copyEmail(context),
              ),
              const SizedBox(height: 14),
              _SupportCard(
                icon: Icons.bug_report_outlined,
                title: 'Report a Bug',
                subtitle:
                    'Tell us what happened, what you expected, and your device model.',
                onTap: () => _contactSupport(context),
              ),
              const SizedBox(height: 10),
              _SupportCard(
                icon: Icons.lightbulb_outline_rounded,
                title: 'Feature Request',
                subtitle: 'Share workflows you want automated or upgraded next.',
                onTap: () => _contactSupport(context),
              ),
              const SizedBox(height: 10),
              _SupportCard(
                icon: Icons.campaign_outlined,
                title: 'Partnerships',
                subtitle:
                    'Interested in collaborating with Socelle? Reach us directly.',
                onTap: () => _contactSupport(context),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _SupportHero extends StatelessWidget {
  const _SupportHero({
    required this.supportEmail,
    required this.onEmailTap,
    required this.onCopyTap,
  });

  final String supportEmail;
  final VoidCallback onEmailTap;
  final VoidCallback onCopyTap;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: SocelleColors.actionGradient,
        ),
        borderRadius: BorderRadius.circular(22),
        boxShadow: [
          BoxShadow(
            color: SocelleColors.primaryDark.withValues(alpha: 0.2),
            blurRadius: 24,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'We answer fast',
            style: TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.w700,
              fontSize: 12,
              letterSpacing: 0.4,
            ),
          ),
          const SizedBox(height: 10),
          Text(
            'Need help or want to shape the roadmap?',
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                  color: Colors.white,
                  fontWeight: FontWeight.w800,
                ),
          ),
          const SizedBox(height: 8),
          Text(
            supportEmail,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: Colors.white.withValues(alpha: 0.9),
                  fontWeight: FontWeight.w700,
                ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: FilledButton.tonalIcon(
                  onPressed: onEmailTap,
                  icon: const Icon(Icons.email_outlined),
                  label: const Text('Email us'),
                  style: FilledButton.styleFrom(
                    backgroundColor: Colors.white.withValues(alpha: 0.2),
                    foregroundColor: Colors.white,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: onCopyTap,
                  icon: const Icon(Icons.copy_rounded, size: 18),
                  label: const Text('Copy email'),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: Colors.white,
                    side: BorderSide(
                      color: Colors.white.withValues(alpha: 0.45),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _SupportCard extends StatelessWidget {
  const _SupportCard({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });

  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      borderRadius: BorderRadius.circular(14),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(14),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 15),
          decoration: BoxDecoration(
            color: Colors.white.withValues(alpha: 0.92),
            border: Border.all(color: SocelleColors.divider),
            borderRadius: BorderRadius.circular(14),
          ),
          child: Row(
            children: [
              Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: SocelleColors.primary.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(11),
                ),
                child: Icon(icon, color: SocelleColors.primaryDark, size: 20),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: Theme.of(context).textTheme.titleSmall?.copyWith(
                            fontWeight: FontWeight.w800,
                          ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      subtitle,
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            fontWeight: FontWeight.w600,
                          ),
                    ),
                  ],
                ),
              ),
              const Icon(
                Icons.chevron_right_rounded,
                color: SocelleColors.textMuted,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _SupportAtmosphere extends StatelessWidget {
  const _SupportAtmosphere();

  @override
  Widget build(BuildContext context) {
    return IgnorePointer(
      child: Stack(
        children: [
          Positioned(
            top: -90,
            left: -80,
            child: _Orb(
              size: 220,
              color: SocelleColors.accentBlue.withValues(alpha: 0.09),
            ),
          ),
          Positioned(
            top: 180,
            right: -70,
            child: _Orb(
              size: 180,
              color: SocelleColors.accentRose.withValues(alpha: 0.1),
            ),
          ),
          Positioned(
            bottom: -70,
            right: -40,
            child: _Orb(
              size: 230,
              color: SocelleColors.accentSun.withValues(alpha: 0.12),
            ),
          ),
        ],
      ),
    );
  }
}

class _Orb extends StatelessWidget {
  const _Orb({required this.size, required this.color});

  final double size;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        gradient: RadialGradient(
          colors: [color, color.withValues(alpha: 0)],
        ),
      ),
    );
  }
}
