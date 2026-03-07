import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/auth/auth_provider.dart';
import '../../../core/theme/socelle_theme.dart';
import '../../../core/shared/loading_widget.dart';

/// Email + password login screen.
///
/// Links to signup and forgot-password flows.
class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscurePassword = true;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _handleLogin() async {
    if (!_formKey.currentState!.validate()) return;

    final success = await ref.read(authNotifierProvider.notifier).signInWithEmail(
      _emailController.text.trim(),
      _passwordController.text,
    );

    if (success && mounted) {
      context.go('/');
    }
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authNotifierProvider);
    final isLoading = authState.status == AuthStatus.loading;

    return Scaffold(
      backgroundColor: SocelleTheme.mnBg,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(SocelleTheme.spacingLg),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const SizedBox(height: SocelleTheme.spacing2xl),

                // Wordmark
                Text(
                  'SOCELLE',
                  style: SocelleTheme.displayMedium.copyWith(
                    letterSpacing: 4.0,
                    fontWeight: FontWeight.w700,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: SocelleTheme.spacingSm),
                Text(
                  'Sign in to your account',
                  style: SocelleTheme.bodyMedium.copyWith(
                    color: SocelleTheme.accent,
                  ),
                  textAlign: TextAlign.center,
                ),

                const SizedBox(height: SocelleTheme.spacing2xl),

                // Email field
                TextFormField(
                  controller: _emailController,
                  keyboardType: TextInputType.emailAddress,
                  textInputAction: TextInputAction.next,
                  autocorrect: false,
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

                const SizedBox(height: SocelleTheme.spacingMd),

                // Password field
                TextFormField(
                  controller: _passwordController,
                  obscureText: _obscurePassword,
                  textInputAction: TextInputAction.done,
                  onFieldSubmitted: (_) => _handleLogin(),
                  decoration: InputDecoration(
                    labelText: 'Password',
                    prefixIcon: const Icon(Icons.lock_outline_rounded, size: 20),
                    suffixIcon: IconButton(
                      icon: Icon(
                        _obscurePassword
                            ? Icons.visibility_outlined
                            : Icons.visibility_off_outlined,
                        size: 20,
                        color: SocelleTheme.textMuted,
                      ),
                      onPressed: () {
                        setState(() => _obscurePassword = !_obscurePassword);
                      },
                    ),
                  ),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Password is required';
                    }
                    if (value.length < 6) {
                      return 'Password must be at least 6 characters';
                    }
                    return null;
                  },
                ),

                const SizedBox(height: SocelleTheme.spacingSm),

                // Forgot password link
                Align(
                  alignment: Alignment.centerRight,
                  child: TextButton(
                    onPressed: () => context.push('/forgot-password'),
                    child: Text(
                      'Forgot password?',
                      style: SocelleTheme.bodySmall.copyWith(
                        color: SocelleTheme.accent,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                ),

                const SizedBox(height: SocelleTheme.spacingLg),

                // Error message
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

                // Sign in button
                FilledButton(
                  onPressed: isLoading ? null : _handleLogin,
                  child: isLoading
                      ? const SocelleLoadingWidget(compact: true)
                      : const Text('Sign In'),
                ),

                const SizedBox(height: SocelleTheme.spacingLg),

                // Sign up link
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      "Don't have an account? ",
                      style: SocelleTheme.bodyMedium,
                    ),
                    TextButton(
                      onPressed: () => context.push('/signup'),
                      child: Text(
                        'Sign Up',
                        style: SocelleTheme.bodyMedium.copyWith(
                          color: SocelleTheme.graphite,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
