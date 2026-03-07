import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/auth/auth_provider.dart';
import '../../../core/theme/socelle_theme.dart';
import '../../../core/shared/loading_widget.dart';

/// Account creation screen with email, password, and optional full name.
class SignupScreen extends ConsumerStatefulWidget {
  const SignupScreen({super.key});

  @override
  ConsumerState<SignupScreen> createState() => _SignupScreenState();
}

class _SignupScreenState extends ConsumerState<SignupScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  bool _obscurePassword = true;
  bool _obscureConfirm = true;

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  Future<void> _handleSignup() async {
    if (!_formKey.currentState!.validate()) return;

    final success = await ref.read(authNotifierProvider.notifier).signUpWithEmail(
      _emailController.text.trim(),
      _passwordController.text,
      fullName: _nameController.text.trim().isNotEmpty
          ? _nameController.text.trim()
          : null,
    );

    if (success && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Account created. Please check your email to confirm.'),
        ),
      );
      context.go('/login');
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
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text(
                  'Create Account',
                  style: SocelleTheme.headlineLarge,
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: SocelleTheme.spacingSm),
                Text(
                  'Join the professional beauty intelligence platform',
                  style: SocelleTheme.bodyMedium.copyWith(color: SocelleTheme.accent),
                  textAlign: TextAlign.center,
                ),

                const SizedBox(height: SocelleTheme.spacingXl),

                // Full name
                TextFormField(
                  controller: _nameController,
                  textInputAction: TextInputAction.next,
                  textCapitalization: TextCapitalization.words,
                  decoration: const InputDecoration(
                    labelText: 'Full Name',
                    hintText: 'Jane Doe',
                    prefixIcon: Icon(Icons.person_outline_rounded, size: 20),
                  ),
                ),

                const SizedBox(height: SocelleTheme.spacingMd),

                // Email
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

                // Password
                TextFormField(
                  controller: _passwordController,
                  obscureText: _obscurePassword,
                  textInputAction: TextInputAction.next,
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
                      onPressed: () =>
                          setState(() => _obscurePassword = !_obscurePassword),
                    ),
                  ),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Password is required';
                    }
                    if (value.length < 8) {
                      return 'Password must be at least 8 characters';
                    }
                    return null;
                  },
                ),

                const SizedBox(height: SocelleTheme.spacingMd),

                // Confirm password
                TextFormField(
                  controller: _confirmPasswordController,
                  obscureText: _obscureConfirm,
                  textInputAction: TextInputAction.done,
                  onFieldSubmitted: (_) => _handleSignup(),
                  decoration: InputDecoration(
                    labelText: 'Confirm Password',
                    prefixIcon: const Icon(Icons.lock_outline_rounded, size: 20),
                    suffixIcon: IconButton(
                      icon: Icon(
                        _obscureConfirm
                            ? Icons.visibility_outlined
                            : Icons.visibility_off_outlined,
                        size: 20,
                        color: SocelleTheme.textMuted,
                      ),
                      onPressed: () =>
                          setState(() => _obscureConfirm = !_obscureConfirm),
                    ),
                  ),
                  validator: (value) {
                    if (value != _passwordController.text) {
                      return 'Passwords do not match';
                    }
                    return null;
                  },
                ),

                const SizedBox(height: SocelleTheme.spacingLg),

                // Error
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

                // Sign up button
                FilledButton(
                  onPressed: isLoading ? null : _handleSignup,
                  child: isLoading
                      ? const SocelleLoadingWidget(compact: true)
                      : const Text('Create Account'),
                ),

                const SizedBox(height: SocelleTheme.spacingMd),

                // Back to login
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text('Already have an account? ', style: SocelleTheme.bodyMedium),
                    TextButton(
                      onPressed: () => context.pop(),
                      child: Text(
                        'Sign In',
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
