import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../bloc/auth_bloc.dart';
import '../bloc/auth_state.dart';

/// Splash screen shown on app launch with Terra Forest branding,
/// animated logo (scale + fade), and auto-navigation after 2 seconds
/// based on authentication state.
class SplashPage extends StatefulWidget {
  const SplashPage({super.key});

  @override
  State<SplashPage> createState() => _SplashPageState();
}

class _SplashPageState extends State<SplashPage>
    with TickerProviderStateMixin {
  late AnimationController _logoScaleController;
  late AnimationController _logoFadeController;
  late AnimationController _subtitleFadeController;
  late Animation<double> _scaleAnimation;
  late Animation<double> _logoFadeAnimation;
  late Animation<double> _subtitleFadeAnimation;

  bool _hasNavigated = false;

  @override
  void initState() {
    super.initState();

    // Logo scale animation: bounce from 0.0 to 1.1 then settle to 1.0
    _logoScaleController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1000),
    );
    _scaleAnimation = TweenSequence<double>([
      TweenSequenceItem(
        tween: Tween<double>(begin: 0.0, end: 1.15)
            .chain(CurveTween(curve: Curves.easeOutCubic)),
        weight: 60,
      ),
      TweenSequenceItem(
        tween: Tween<double>(begin: 1.15, end: 1.0)
            .chain(CurveTween(curve: Curves.easeInOut)),
        weight: 40,
      ),
    ]).animate(_logoScaleController);

    // Logo fade animation
    _logoFadeController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    );
    _logoFadeAnimation = CurvedAnimation(
      parent: _logoFadeController,
      curve: Curves.easeIn,
    );

    // Subtitle fade animation (delayed)
    _subtitleFadeController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    );
    _subtitleFadeAnimation = CurvedAnimation(
      parent: _subtitleFadeController,
      curve: Curves.easeIn,
    );

    _startAnimations();
  }

  Future<void> _startAnimations() async {
    // Start logo animations together
    await Future.wait([
      _logoScaleController.forward(),
      _logoFadeController.forward(),
    ]);

    // Delay then show subtitle
    await Future.delayed(const Duration(milliseconds: 200));
    await _subtitleFadeController.forward();

    // Wait for auth state to resolve (AppStarted is fired from main.dart)
    await Future.delayed(const Duration(milliseconds: 800));

    // Navigate based on auth state
    if (mounted && !_hasNavigated) {
      _navigateBasedOnAuth();
    }
  }

  void _navigateBasedOnAuth() {
    if (_hasNavigated) return;
    final state = context.read<AuthBloc>().state;

    if (state is AuthAuthenticated) {
      _hasNavigated = true;
      context.go('/home');
    } else if (state is AuthUnauthenticated) {
      _hasNavigated = true;
      context.go('/login');
    } else if (state is AuthError) {
      _hasNavigated = true;
      context.go('/login');
    } else if (state is BiometricNotAvailable) {
      _hasNavigated = true;
      context.go('/login');
    }
    // If still loading (AuthInitial/AuthLoading), do NOT set _hasNavigated
    // The GoRouter redirect will handle navigation when auth state resolves.
  }

  @override
  void dispose() {
    _logoScaleController.dispose();
    _logoFadeController.dispose();
    _subtitleFadeController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return BlocListener<AuthBloc, AuthState>(
      listener: (context, state) {
        if (!_hasNavigated) {
          if (state is AuthAuthenticated) {
            _hasNavigated = true;
            context.go('/home');
          } else if (state is AuthUnauthenticated) {
            _hasNavigated = true;
            context.go('/login');
          } else if (state is AuthError) {
            _hasNavigated = true;
            context.go('/login');
          } else if (state is BiometricNotAvailable) {
            _hasNavigated = true;
            context.go('/login');
          }
        }
      },
      child: Scaffold(
        body: Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [
                Color(0xFF0D3B0E), // Deep forest dark
                Color(0xFF1B5E20), // Forest green dark
                Color(0xFF2E7D32), // Forest green
                Color(0xFF1B5E20), // Forest green dark
                Color(0xFF0D3B0E), // Deep forest dark
              ],
              stops: [0.0, 0.25, 0.5, 0.75, 1.0],
            ),
          ),
          child: SafeArea(
            child: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Spacer(flex: 3),

                  // Animated logo
                  ScaleTransition(
                    scale: _scaleAnimation,
                    child: FadeTransition(
                      opacity: _logoFadeAnimation,
                      child: Column(
                        children: [
                          // Logo container with glow effect
                          Container(
                            width: 140,
                            height: 140,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: Colors.white.withOpacity(0.08),
                              border: Border.all(
                                color: Colors.white.withOpacity(0.2),
                                width: 3,
                              ),
                              boxShadow: [
                                BoxShadow(
                                  color: const Color(0xFF4CAF50).withOpacity(0.3),
                                  blurRadius: 40,
                                  spreadRadius: 10,
                                ),
                              ],
                            ),
                            child: const Icon(
                              Icons.forest,
                              size: 80,
                              color: Colors.white,
                            ),
                          ),
                          const SizedBox(height: 28),

                          // App name
                          const Text(
                            'Terra Forest',
                            style: TextStyle(
                              fontSize: 38,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                              letterSpacing: 2.0,
                            ),
                          ),
                          const SizedBox(height: 4),
                          const Text(
                            'MRV',
                            style: TextStyle(
                              fontSize: 28,
                              fontWeight: FontWeight.w300,
                              color: Color(0xFF81C784),
                              letterSpacing: 6.0,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),

                  const SizedBox(height: 32),

                  // Animated subtitle
                  FadeTransition(
                    opacity: _subtitleFadeAnimation,
                    child: Column(
                      children: [
                        const Text(
                          'Nền tảng MRV Số cho Lâm nghiệp Việt Nam',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontSize: 16,
                            color: Colors.white70,
                            fontWeight: FontWeight.w400,
                            letterSpacing: 0.5,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Container(
                          width: 60,
                          height: 3,
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(2),
                            gradient: const LinearGradient(
                              colors: [
                                Color(0xFF4CAF50),
                                Color(0xFF81C784),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),

                  const Spacer(flex: 3),

                  // Bottom loading indicator
                  FadeTransition(
                    opacity: _subtitleFadeAnimation,
                    child: Column(
                      children: [
                        SizedBox(
                          width: 24,
                          height: 24,
                          child: CircularProgressIndicator(
                            strokeWidth: 2.5,
                            valueColor: AlwaysStoppedAnimation<Color>(
                              Colors.white.withOpacity(0.6),
                            ),
                          ),
                        ),
                        const SizedBox(height: 16),
                        Text(
                          'Đang tải...',
                          style: TextStyle(
                            fontSize: 13,
                            color: Colors.white.withOpacity(0.5),
                            fontWeight: FontWeight.w400,
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 48),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
