import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/auth/auth_provider.dart';
import '../../../core/theme/socelle_theme.dart';
import '../../../core/shared/loading_widget.dart';

/// Password reset screen — sends a reset link via Supabase Auth.
class ForgotPasswordScreen extends ConsumerStatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  ConsumerState<ForgotPasswordScreen> createState() =>
      _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends ConsumerState<ForgotPasswordScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  bool _emailSent = false;

  @override
  void dispose() {
    _emailController.dispose();
    super.dispose();
  }

  Future<void> _handleReset() async {
    if (!_formKey.currentState!.validate()) return;

    final success = await ref
        .read(authNotifierProvider.notifier)
        .resetPassword(_emailController.text.trim());

    if (success && mounted) {
      setState(() => _emailSent = true);
    }
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authNotifierProvider);
    final isLoading = authState.status == AuthStatus.loading;

    return Scaffold(
      backgroundColor: SocelleTheme.mnBg,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
          onPressed: () => context.pop(),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(SocelleTheme.spacingLg),
          child: _emailSent ? _buildSuccessState() : _buildFormState(isLoading, authState),
        ),
      ),
    );
  }

  Widget _buildSuccessState() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const SizedBox(height: SocelleTheme.spacing2xl),
        Icon(
          Icons.mark_email_read_outlined,
          size: 64,
          color: SocelleTheme.signalUp,
        ),
        const SizedBox(height: SocelleTheme.spacingLg),
        Text(
          'Check Your Email',
          style: SocelleTheme.headlineLarge,
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: SocelleTheme.spacingMd),
        Text(
          'We sent a password reset link to\n${_emailController.text.trim()}',
          style: SocelleTheme.bodyMedium,
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: SocelleTheme.spacingXl),
        OutlinedButton(
          onPressed: () => context.go('/login'),
          child: const Text('Back to Sign In'),
        ),
      ],
    );
  }

  Widget _buildFormState(bool isLoading, AuthNotifierState authState) {
    return Form(
      key: _formKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const SizedBox(height: SocelleTheme.spacing2xl),
          Text(
            'Reset Password',
            style: SocelleTheme.headlineLarge,
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: SocelleTheme.spacingSm),
          Text(
            'Enter your email and we will send you a link to reset your password.',
            style: SocelleTheme.bodyMedium,
            textAlign: TextAlign.center,
          ),

          const SizedBox(height: SocelleTheme.spacingXl),

          TextFormField(
            controller: _emailController,
            keyboardType: TextInputType.emailAddress,
            textInputAction: TextInputAction.done,
            autocorrect: false,
            onFieldSubmitted: (_) => _handleReset(),
            decoration: const InputDecoration(
              labelText: 'Email',
              hintText: 'you@example.com',
              prefixIcon: Icon(Icons.email_outlined, size: 20),
            ),
            validator: (value) {
              if (value == null || value.trim().isEmpty) {
                return 'Email is required';
              }
              if (!value.contains('@') || !value.contains('.')) {
                return 'Enter a valid email address';
              }
              return null;
            },
          ),

          const SizedBox(height: SocelleTheme.spacingLg),

          if (authState.errorMessage != null)
            Padding(
              padding: const EdgeInsets.only(bottom: SocelleTheme.spacingMd),
              child: Container(
                padding: const EdgeInsets.all(SocelleTheme.spacingMd),
                decoration: BoxDecoration(
                  color: SocelleTheme.signalDown.withValues(alpha: 0.08),
                  borderRadius: SocelleTheme.borderRadiusMd,
                ),
                child: Text(
                  authState.errorMessage!,
                  style: SocelleTheme.bodySmall.copyWith(
                    color: SocelleTheme.signalDown,
                  ),
                  textAlign: TextAlign.center,
                ),
              ),
            ),

          FilledButton(
            onPressed: isLoading ? null : _handleReset,
            child: isLoading
                ? const SocelleLoadingWidget(compact: true)
                : const Text('Send Reset Link'),
          ),

          const SizedBox(height: SocelleTheme.spacingMd),

          TextButton(
            onPressed: () => context.pop(),
            child: const Text('Back to Sign In'),
          ),
        ],
      ),
    );
  }
}
