import 'package:equatable/equatable.dart';
import '../../domain/repositories/auth_repository.dart';

/// Base class for all authentication states
abstract class AuthState extends Equatable {
  const AuthState();

  @override
  List<Object?> get props => [];
}

/// Initial state before any auth check has been performed
class AuthInitial extends AuthState {
  const AuthInitial();
}

/// State while authentication operation is in progress
class AuthLoading extends AuthState {
  final String? message;

  const AuthLoading({this.message});

  @override
  List<Object?> get props => [message];
}

/// State when user is successfully authenticated
class AuthAuthenticated extends AuthState {
  final User user;

  const AuthAuthenticated(this.user);

  @override
  List<Object?> get props => [user];
}

/// State when user is not authenticated (no valid session)
class AuthUnauthenticated extends AuthState {
  const AuthUnauthenticated();
}

/// State when an authentication error occurred
class AuthError extends AuthState {
  final String message;
  final String? code;

  const AuthError({
    required this.message,
    this.code,
  });

  @override
  List<Object?> get props => [message, code];
}

/// State when biometric authentication is not available on device
class BiometricNotAvailable extends AuthState {
  final String reason;

  const BiometricNotAvailable({this.reason = 'Thiết bị không hỗ trợ sinh trắc học'});

  @override
  List<Object?> get props => [reason];
}
