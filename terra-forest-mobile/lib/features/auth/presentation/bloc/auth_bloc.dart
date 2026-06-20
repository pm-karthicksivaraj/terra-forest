import 'dart:async';

import 'package:flutter_bloc/flutter_bloc.dart';
import '../../domain/repositories/auth_repository.dart';
import 'auth_event.dart';
import 'auth_state.dart';

/// BLoC managing authentication state for the entire application.
/// Handles login, logout, biometric auth, token refresh, device registration,
/// and SOS emergency alerts.
class AuthBloc extends Bloc<AuthEvent, AuthState> {
  final AuthRepository _authRepository;

  AuthBloc({required AuthRepository authRepository})
      : _authRepository = authRepository,
        super(const AuthInitial()) {
    on<AppStarted>(_onAppStarted);
    on<LoginRequested>(_onLoginRequested);
    on<LoginWithBiometrics>(_onLoginWithBiometrics);
    on<LogoutRequested>(_onLogoutRequested);
    on<TokenRefreshed>(_onTokenRefreshed);
    on<DeviceRegistered>(_onDeviceRegistered);
    on<SosTriggered>(_onSosTriggered);
    on<SessionExpired>(_onSessionExpired);
  }

  /// Handle app start - check for existing authentication.
  /// Includes a 10-second timeout to prevent the app from being stuck
  /// on the splash screen if secure storage or network hangs.
  Future<void> _onAppStarted(
    AppStarted event,
    Emitter<AuthState> emit,
  ) async {
    emit(const AuthLoading(message: 'Đang kiểm tra phiên đăng nhập...'));

    try {
      final user = await _authRepository
          .getCurrentUser()
          .timeout(const Duration(seconds: 10));
      if (user != null && user.isActive) {
        emit(AuthAuthenticated(user));
      } else {
        emit(const AuthUnauthenticated());
      }
    } catch (e) {
      // If we can't check auth (network error, timeout, etc.), treat as unauthenticated
      emit(const AuthUnauthenticated());
    }
  }

  /// Handle login with email and password
  Future<void> _onLoginRequested(
    LoginRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(const AuthLoading(message: 'Đang đăng nhập...'));

    try {
      final user = await _authRepository.login(
        event.email,
        event.password,
      );

      if (user.isActive) {
        emit(AuthAuthenticated(user));
      } else {
        emit(const AuthError(
          message: 'Tài khoản đã bị vô hiệu hóa.',
          code: 'ACCOUNT_INACTIVE',
        ));
      }
    } on AuthException catch (e) {
      emit(AuthError(
        message: e.message,
        code: e.code,
      ));
    } catch (e) {
      emit(const AuthError(
        message: 'Đăng nhập thất bại. Vui lòng thử lại.',
        code: 'LOGIN_FAILED',
      ));
    }
  }

  /// Handle biometric authentication attempt
  Future<void> _onLoginWithBiometrics(
    LoginWithBiometrics event,
    Emitter<AuthState> emit,
  ) async {
    emit(const AuthLoading(message: 'Đang xác thực sinh trắc học...'));

    try {
      final authenticated = await _authRepository.authenticateWithBiometrics();

      if (authenticated) {
        final user = await _authRepository.getCurrentUser();
        if (user != null && user.isActive) {
          emit(AuthAuthenticated(user));
        } else {
          // Biometric passed but no valid user session
          emit(const AuthUnauthenticated());
        }
      } else {
        emit(const AuthError(
          message: 'Xác thực sinh trắc học thất bại.',
          code: 'BIOMETRIC_FAILED',
        ));
      }
    } on AuthException catch (e) {
      if (e.code == 'BIOMETRIC_NOT_AVAILABLE' ||
          e.code == 'BIOMETRIC_NOT_ENABLED') {
        emit(BiometricNotAvailable(reason: e.message));
      } else {
        emit(AuthError(
          message: e.message,
          code: e.code,
        ));
      }
    } catch (e) {
      emit(BiometricNotAvailable(
        reason: 'Xác thực sinh trắc học không khả dụng.',
      ));
    }
  }

  /// Handle logout request
  Future<void> _onLogoutRequested(
    LogoutRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(const AuthLoading(message: 'Đang đăng xuất...'));

    try {
      await _authRepository.logout();
      emit(const AuthUnauthenticated());
    } catch (e) {
      // Even if server logout fails, clear local state
      emit(const AuthUnauthenticated());
    }
  }

  /// Handle token refresh
  Future<void> _onTokenRefreshed(
    TokenRefreshed event,
    Emitter<AuthState> emit,
  ) async {
    try {
      await _authRepository.refreshToken();

      // If refresh succeeds, re-emit current auth state with updated user
      final currentState = state;
      if (currentState is AuthAuthenticated) {
        final user = await _authRepository.getCurrentUser();
        if (user != null) {
          emit(AuthAuthenticated(user));
        }
      }
    } on AuthException catch (_) {
      // Token refresh failed - session is invalid
      emit(const AuthUnauthenticated());
    } catch (_) {
      // Unexpected error during refresh
      emit(const AuthUnauthenticated());
    }
  }

  /// Handle device registration for push notifications
  Future<void> _onDeviceRegistered(
    DeviceRegistered event,
    Emitter<AuthState> emit,
  ) async {
    try {
      await _authRepository.registerDevice(
        deviceUuid: event.deviceUuid,
        platform: event.platform,
        osVersion: event.osVersion,
        fcmToken: event.fcmToken,
      );
    } on AuthException catch (e) {
      // Device registration failure should not block the user
      // Just log it silently
    } catch (_) {
      // Silently ignore device registration failures
    }
  }

  /// Handle SOS emergency alert
  Future<void> _onSosTriggered(
    SosTriggered event,
    Emitter<AuthState> emit,
  ) async {
    try {
      await _authRepository.sendSosAlert(
        lat: event.lat,
        lng: event.lng,
        message: event.message,
      );
    } on AuthException catch (e) {
      // SOS sending failed - could be network issue
      // The implementation already queues it for retry
      emit(AuthError(
        message: e.message,
        code: e.code,
      ));

      // Re-emit current auth state to not disrupt navigation
      final user = await _authRepository.getCurrentUser();
      if (user != null) {
        emit(AuthAuthenticated(user));
      }
    } catch (e) {
      // Re-emit current auth state
      final user = await _authRepository.getCurrentUser();
      if (user != null) {
        emit(AuthAuthenticated(user));
      }
    }
  }

  /// Handle session expiration (e.g., token expired on server)
  Future<void> _onSessionExpired(
    SessionExpired event,
    Emitter<AuthState> emit,
  ) async {
    emit(const AuthError(
      message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
      code: 'SESSION_EXPIRED',
    ));

    // Clear local auth data
    try {
      await _authRepository.logout();
    } catch (_) {
      // Ignore errors during cleanup
    }

    emit(const AuthUnauthenticated());
  }
}
