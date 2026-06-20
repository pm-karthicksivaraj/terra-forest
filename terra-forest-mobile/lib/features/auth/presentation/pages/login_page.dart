import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../bloc/auth_bloc.dart';
import '../bloc/auth_event.dart';
import '../bloc/auth_state.dart';

/// Beautiful login page with forest theme gradient background,
/// email/password form, biometric login, and Vietnamese default text.
class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage>
    with SingleTickerProviderStateMixin {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscurePassword = true;
  bool _isFormValid = false;
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    );
    _fadeAnimation = CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeInOut,
    );
    _animationController.forward();

    _emailController.addListener(_validateForm);
    _passwordController.addListener(_validateForm);
  }

  @override
  void dispose() {
    _animationController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _validateForm() {
    final emailValid = _emailController.text.trim().isNotEmpty;
    final passwordValid = _passwordController.text.isNotEmpty;
    final changed = _isFormValid != (emailValid && passwordValid);
    if (changed) {
      setState(() {
        _isFormValid = emailValid && passwordValid;
      });
    }
  }

  void _onLoginPressed() {
    if (_formKey.currentState?.validate() ?? false) {
      // Guard against double submission during loading
      final currentState = context.read<AuthBloc>().state;
      if (currentState is AuthLoading) return;
      context.read<AuthBloc>().add(
            LoginRequested(
              email: _emailController.text.trim(),
              password: _passwordController.text,
            ),
          );
    }
  }

  void _onBiometricPressed() {
    context.read<AuthBloc>().add(const LoginWithBiometrics());
  }

  String? _validateEmail(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'Vui lòng nhập email';
    }
    final emailRegex = RegExp(r'^[^@\s]+@[^@\s]+\.[^@\s]+$');
    if (!emailRegex.hasMatch(value.trim())) {
      return 'Email không hợp lệ';
    }
    return null;
  }

  String? _validatePassword(String? value) {
    if (value == null || value.isEmpty) {
      return 'Vui lòng nhập mật khẩu';
    }
    if (value.length < 6) {
      return 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    return null;
  }

  @override
  Widget build(BuildContext context) {
    return BlocListener<AuthBloc, AuthState>(
      listener: (context, state) {
        if (state is AuthAuthenticated) {
          context.go('/home');
        }
      },
      child: Scaffold(
        body: Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [
                Color(0xFF1B5E20), // Forest green dark
                Color(0xFF2E7D32), // Forest green
                Color(0xFF388E3C), // Forest green light
                Color(0xFFE8F5E9), // Very light green
              ],
              stops: [0.0, 0.35, 0.65, 1.0],
            ),
          ),
          child: SafeArea(
            child: Center(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 24.0),
                child: FadeTransition(
                  opacity: _fadeAnimation,
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const SizedBox(height: 40),
                      _buildLogoSection(),
                      const SizedBox(height: 48),
                      _buildLoginForm(),
                      const SizedBox(height: 24),
                      _buildBiometricButton(),
                      const SizedBox(height: 16),
                      _buildForgotPasswordLink(),
                      const SizedBox(height: 24),
                      _buildErrorDisplay(),
                      const SizedBox(height: 40),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  /// Build the logo and app title section
  Widget _buildLogoSection() {
    return Column(
      children: [
        Container(
          width: 100,
          height: 100,
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.15),
            shape: BoxShape.circle,
            border: Border.all(
              color: Colors.white.withOpacity(0.3),
              width: 2,
            ),
          ),
          child: const Icon(
            Icons.forest,
            size: 56,
            color: Colors.white,
          ),
        ),
        const SizedBox(height: 20),
        const Text(
          'Terra Forest MRV',
          style: TextStyle(
            fontSize: 32,
            fontWeight: FontWeight.bold,
            color: Colors.white,
            letterSpacing: 1.2,
          ),
        ),
        const SizedBox(height: 8),
        const Text(
          'Nền tảng MRV Số cho Lâm nghiệp Việt Nam',
          textAlign: TextAlign.center,
          style: TextStyle(
            fontSize: 14,
            color: Colors.white70,
            fontWeight: FontWeight.w400,
          ),
        ),
      ],
    );
  }

  /// Build the login form with email, password, and submit button
  Widget _buildLoginForm() {
    return BlocBuilder<AuthBloc, AuthState>(
      builder: (context, state) {
        final isLoading = state is AuthLoading;

        return Container(
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(20),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.1),
                blurRadius: 20,
                offset: const Offset(0, 10),
              ),
            ],
          ),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Text(
                  'Đăng nhập',
                  style: TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF1B5E20),
                  ),
                ),
                const SizedBox(height: 24),
                _buildEmailField(isLoading),
                const SizedBox(height: 16),
                _buildPasswordField(isLoading),
                const SizedBox(height: 24),
                _buildLoginButton(isLoading),
              ],
            ),
          ),
        );
      },
    );
  }

  /// Build email input field with tree icon
  Widget _buildEmailField(bool isLoading) {
    return TextFormField(
      controller: _emailController,
      validator: _validateEmail,
      keyboardType: TextInputType.emailAddress,
      textInputAction: TextInputAction.next,
      enabled: !isLoading,
      autocorrect: false,
      decoration: InputDecoration(
        labelText: 'Email',
        hintText: 'example@terraforest.vn',
        prefixIcon: const Icon(
          Icons.park_outlined,
          color: Color(0xFF2E7D32),
        ),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFFC8E6C9)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFFC8E6C9)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFF2E7D32), width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Colors.red),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Colors.red, width: 2),
        ),
        filled: true,
        fillColor: isLoading ? Colors.grey[100] : const Color(0xFFF1F8E9),
      ),
    );
  }

  /// Build password input field with lock icon and visibility toggle
  Widget _buildPasswordField(bool isLoading) {
    return TextFormField(
      controller: _passwordController,
      validator: _validatePassword,
      obscureText: _obscurePassword,
      textInputAction: TextInputAction.done,
      enabled: !isLoading,
      onFieldSubmitted: (_) => _onLoginPressed(),
      decoration: InputDecoration(
        labelText: 'Mật khẩu',
        hintText: 'Nhập mật khẩu',
        prefixIcon: const Icon(
          Icons.lock_outline,
          color: Color(0xFF2E7D32),
        ),
        suffixIcon: IconButton(
          icon: Icon(
            _obscurePassword ? Icons.visibility_off_outlined : Icons.visibility_outlined,
            color: const Color(0xFF2E7D32),
          ),
          onPressed: () {
            setState(() {
              _obscurePassword = !_obscurePassword;
            });
          },
        ),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFFC8E6C9)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFFC8E6C9)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFF2E7D32), width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Colors.red),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Colors.red, width: 2),
        ),
        filled: true,
        fillColor: isLoading ? Colors.grey[100] : const Color(0xFFF1F8E9),
      ),
    );
  }

  /// Build login button with forest green gradient
  Widget _buildLoginButton(bool isLoading) {
    return Container(
      height: 52,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12),
        gradient: const LinearGradient(
          colors: [
            Color(0xFF1B5E20),
            Color(0xFF2E7D32),
            Color(0xFF388E3C),
          ],
        ),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF2E7D32).withOpacity(0.4),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: isLoading ? null : _onLoginPressed,
          borderRadius: BorderRadius.circular(12),
          child: Center(
            child: isLoading
                ? _buildShimmerLoading()
                : const Text(
                    'Đăng nhập',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w600,
                      color: Colors.white,
                      letterSpacing: 0.5,
                    ),
                  ),
          ),
        ),
      ),
    );
  }

  /// Build shimmer loading indicator for login button
  Widget _buildShimmerLoading() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        SizedBox(
          width: 20,
          height: 20,
          child: CircularProgressIndicator(
            strokeWidth: 2.5,
            valueColor: AlwaysStoppedAnimation<Color>(
              Colors.white.withOpacity(0.9),
            ),
          ),
        ),
        const SizedBox(width: 12),
        Text(
          'Đang đăng nhập...',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w500,
            color: Colors.white.withOpacity(0.9),
          ),
        ),
      ],
    );
  }

  /// Build biometric login button
  Widget _buildBiometricButton() {
    return BlocBuilder<AuthBloc, AuthState>(
      builder: (context, state) {
        final isLoading = state is AuthLoading;
        final isBiometricUnavailable = state is BiometricNotAvailable;

        return Container(
          width: double.infinity,
          height: 52,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(12),
            color: Colors.white.withOpacity(0.15),
            border: Border.all(
              color: Colors.white.withOpacity(0.3),
              width: 1.5,
            ),
          ),
          child: Material(
            color: Colors.transparent,
            child: InkWell(
              onTap: isLoading || isBiometricUnavailable
                  ? null
                  : _onBiometricPressed,
              borderRadius: BorderRadius.circular(12),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.fingerprint,
                    size: 28,
                    color: isBiometricUnavailable
                        ? Colors.white38
                        : Colors.white,
                  ),
                  const SizedBox(width: 12),
                  Text(
                    'Đăng nhập bằng vân tay',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w500,
                      color: isBiometricUnavailable
                          ? Colors.white38
                          : Colors.white,
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  /// Build forgot password link
  Widget _buildForgotPasswordLink() {
    return TextButton(
      onPressed: () {
        // Navigate to forgot password page
        // context.go('/forgot-password');
      },
      child: const Text(
        'Quên mật khẩu?',
        style: TextStyle(
          fontSize: 15,
          color: Colors.white,
          decoration: TextDecoration.underline,
          decorationColor: Colors.white70,
        ),
      ),
    );
  }

  /// Build error message display
  Widget _buildErrorDisplay() {
    return BlocBuilder<AuthBloc, AuthState>(
      builder: (context, state) {
        if (state is AuthError) {
          return Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: Colors.red.withOpacity(0.9),
              borderRadius: BorderRadius.circular(12),
              boxShadow: [
                BoxShadow(
                  color: Colors.red.withOpacity(0.3),
                  blurRadius: 8,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Row(
              children: [
                const Icon(
                  Icons.error_outline,
                  color: Colors.white,
                  size: 22,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    state.message,
                    style: const TextStyle(
                      fontSize: 14,
                      color: Colors.white,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
                IconButton(
                  icon: const Icon(
                    Icons.close,
                    color: Colors.white,
                    size: 18,
                  ),
                  onPressed: () {
                    // Re-trigger auth check to clear error state
                    context.read<AuthBloc>().add(const AppStarted());
                  },
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(),
                ),
              ],
            ),
          );
        }

        if (state is BiometricNotAvailable) {
          return Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: Colors.orange.withOpacity(0.9),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              children: [
                const Icon(
                  Icons.warning_amber_rounded,
                  color: Colors.white,
                  size: 22,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    state.reason,
                    style: const TextStyle(
                      fontSize: 14,
                      color: Colors.white,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
              ],
            ),
          );
        }

        return const SizedBox.shrink();
      },
    );
  }
}
