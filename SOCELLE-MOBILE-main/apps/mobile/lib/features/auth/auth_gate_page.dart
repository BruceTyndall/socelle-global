import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../../core/theme/socelle_colors.dart';
import '../../services/supabase_client.dart';

/// The Auth Gate is the entry point for users who are NOT yet
/// linked to a permanent Supabase account.
///
/// It offers a clean set of options:
///   - Continue with Google
///   - Continue with Apple
///   - Sign up with email
///   - Log in with email (returning users)
///
/// When sign-in completes, Supabase fires an [AuthChangeEvent.signedIn]
/// event which the [authStateProvider] in the root flow catches, and the
/// app automatically routes to the correct destination.
class AuthGatePage extends ConsumerStatefulWidget {
  const AuthGatePage({super.key});

  @override
  ConsumerState<AuthGatePage> createState() => _AuthGatePageState();
}

class _AuthGatePageState extends ConsumerState<AuthGatePage> {
  bool _isLoading = false;
  String? _errorMessage;

  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _showEmailForm = false;
  bool _isSignUpMode = false;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  // ── OAuth (Google / Apple) ────────────────────────────────────────────────

  Future<void> _signInWithGoogle() async {
    setState(() => _isLoading = true);
    try {
      await SocelleSupabaseClient.client.auth.signInWithOAuth(
        OAuthProvider.google,
        redirectTo: 'io.supabase.socelle://login-callback',
      );
    } on AuthException catch (e) {
      _setError(e.message);
    } catch (e) {
      _setError('Google sign-in failed. Please try again.');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _signInWithApple() async {
    setState(() => _isLoading = true);
    try {
      await SocelleSupabaseClient.client.auth.signInWithOAuth(
        OAuthProvider.apple,
        redirectTo: 'io.supabase.socelle://login-callback',
      );
    } on AuthException catch (e) {
      _setError(e.message);
    } catch (e) {
      _setError('Apple sign-in failed. Please try again.');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  // ── Email / Password ──────────────────────────────────────────────────────

  Future<void> _handleEmailAuth() async {
    final email = _emailController.text.trim();
    final password = _passwordController.text;

    if (email.isEmpty || password.isEmpty) {
      _setError('Please enter your email and password.');
      return;
    }

    setState(() { _isLoading = true; _errorMessage = null; });

    try {
      if (_isSignUpMode) {
        await SocelleSupabaseClient.client.auth.signUp(
          email: email,
          password: password,
        );
      } else {
        await SocelleSupabaseClient.client.auth.signInWithPassword(
          email: email,
          password: password,
        );
      }
      // On success the authStateProvider stream fires signedIn and
      // the root router navigates away automatically — no manual nav needed.
    } on AuthException catch (e) {
      _setError(e.message);
    } catch (e) {
      _setError('Authentication failed. Please try again.');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _setError(String message) {
    if (mounted) setState(() => _errorMessage = message);
  }

  // ── Build ─────────────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: SocelleColors.background,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 28),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 60),
              Text(
                'Socelle',
                style: Theme.of(context).textTheme.headlineLarge?.copyWith(
                      fontWeight: FontWeight.w800,
                      color: SocelleColors.ink,
                      letterSpacing: -1.0,
                    ),
              ),
              const SizedBox(height: 8),
              Text(
                'Your beauty business intelligence platform.',
                style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                      color: SocelleColors.inkMuted,
                    ),
              ),
              const SizedBox(height: 56),

              // ── Error banner ──────────────────────────────────────────────
              if (_errorMessage != null) ...[
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: SocelleColors.leakageSurface,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Text(
                    _errorMessage!,
                    style: TextStyle(
                      color: SocelleColors.leakage,
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
                const SizedBox(height: 16),
              ],

              // ── OAuth Buttons ─────────────────────────────────────────────
              if (!_showEmailForm) ...[
                _OAuthButton(
                  label: 'Continue with Google',
                  icon: Icons.g_mobiledata_rounded,
                  onPressed: _isLoading ? null : _signInWithGoogle,
                  isLoading: _isLoading,
                ),
                const SizedBox(height: 12),
                _OAuthButton(
                  label: 'Continue with Apple',
                  icon: Icons.apple_rounded,
                  onPressed: _isLoading ? null : _signInWithApple,
                  isLoading: false,
                  filled: false,
                ),
                const SizedBox(height: 24),
                const Row(children: [
                  Expanded(child: Divider()),
                  Padding(
                    padding: EdgeInsets.symmetric(horizontal: 12),
                    child: Text('or', style: TextStyle(fontSize: 12)),
                  ),
                  Expanded(child: Divider()),
                ]),
                const SizedBox(height: 24),
                OutlinedButton(
                  onPressed: () => setState(() {
                    _showEmailForm = true;
                    _isSignUpMode = false;
                  }),
                  style: OutlinedButton.styleFrom(
                    minimumSize: const Size(double.infinity, 52),
                  ),
                  child: const Text('Log in with Email'),
                ),
                const SizedBox(height: 10),
                TextButton(
                  onPressed: () => setState(() {
                    _showEmailForm = true;
                    _isSignUpMode = true;
                  }),
                  style: TextButton.styleFrom(
                    minimumSize: const Size(double.infinity, 52),
                  ),
                  child: const Text('Create an account'),
                ),
              ],

              // ── Email / Password Form ─────────────────────────────────────
              if (_showEmailForm) ...[
                Text(
                  _isSignUpMode ? 'Create your account' : 'Welcome back',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.w700,
                      ),
                ),
                const SizedBox(height: 24),
                TextField(
                  controller: _emailController,
                  keyboardType: TextInputType.emailAddress,
                  decoration: const InputDecoration(
                    labelText: 'Email',
                    prefixIcon: Icon(Icons.email_outlined),
                  ),
                ),
                const SizedBox(height: 14),
                TextField(
                  controller: _passwordController,
                  obscureText: true,
                  decoration: const InputDecoration(
                    labelText: 'Password',
                    prefixIcon: Icon(Icons.lock_outline_rounded),
                  ),
                ),
                const SizedBox(height: 24),
                FilledButton(
                  onPressed: _isLoading ? null : _handleEmailAuth,
                  style: FilledButton.styleFrom(
                    minimumSize: const Size(double.infinity, 54),
                  ),
                  child: _isLoading
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Colors.white,
                          ),
                        )
                      : Text(_isSignUpMode ? 'Create Account' : 'Log In'),
                ),
                const SizedBox(height: 12),
                TextButton(
                  onPressed: () => setState(() => _showEmailForm = false),
                  child: const Text('← Back'),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

// ─── Internal OAuth Button Widget ─────────────────────────────────────────────

class _OAuthButton extends StatelessWidget {
  const _OAuthButton({
    required this.label,
    required this.icon,
    required this.onPressed,
    required this.isLoading,
    this.filled = true,
  });

  final String label;
  final IconData icon;
  final VoidCallback? onPressed;
  final bool isLoading;
  final bool filled;

  @override
  Widget build(BuildContext context) {
    final child = isLoading
        ? const SizedBox(
            width: 20,
            height: 20,
            child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
          )
        : Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, size: 22),
              const SizedBox(width: 10),
              Text(label),
            ],
          );

    if (filled) {
      return FilledButton(
        onPressed: onPressed,
        style: FilledButton.styleFrom(
          minimumSize: const Size(double.infinity, 54),
        ),
        child: child,
      );
    }

    return OutlinedButton(
      onPressed: onPressed,
      style: OutlinedButton.styleFrom(
        minimumSize: const Size(double.infinity, 54),
      ),
      child: child,
    );
  }
}
