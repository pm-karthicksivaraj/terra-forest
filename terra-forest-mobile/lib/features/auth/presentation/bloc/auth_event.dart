import 'package:equatable/equatable.dart';

/// Base class for all authentication events
abstract class AuthEvent extends Equatable {
  const AuthEvent();

  @override
  List<Object?> get props => [];
}

/// Event fired when the app starts to check for existing authentication
class AppStarted extends AuthEvent {
  const AppStarted();
}

/// Event fired when user submits login credentials
class LoginRequested extends AuthEvent {
  final String email;
  final String password;

  const LoginRequested({
    required this.email,
    required this.password,
  });

  @override
  List<Object?> get props => [email, password];
}

/// Event fired when user attempts biometric authentication
class LoginWithBiometrics extends AuthEvent {
  const LoginWithBiometrics();
}

/// Event fired when user requests logout
class LogoutRequested extends AuthEvent {
  const LogoutRequested();
}

/// Event fired when token needs to be refreshed
class TokenRefreshed extends AuthEvent {
  const TokenRefreshed();
}

/// Event fired when device should be registered for push notifications
class DeviceRegistered extends AuthEvent {
  final String deviceUuid;
  final String platform;
  final String osVersion;
  final String fcmToken;

  const DeviceRegistered({
    required this.deviceUuid,
    required this.platform,
    required this.osVersion,
    required this.fcmToken,
  });

  @override
  List<Object?> get props => [deviceUuid, platform, osVersion, fcmToken];
}

/// Event fired when user triggers SOS emergency alert
class SosTriggered extends AuthEvent {
  final double lat;
  final double lng;
  final String message;

  const SosTriggered({
    required this.lat,
    required this.lng,
    required this.message,
  });

  @override
  List<Object?> get props => [lat, lng, message];
}

/// Event fired when the user's session is detected as expired
class SessionExpired extends AuthEvent {
  const SessionExpired();
}
