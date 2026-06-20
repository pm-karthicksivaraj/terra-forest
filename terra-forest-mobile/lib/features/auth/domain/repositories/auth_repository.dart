import 'package:equatable/equatable.dart';

/// Represents a user in the Terra Forest MRV system.
class User extends Equatable {
  final String id;
  final String name;
  final String email;
  final String? avatarUrl;
  final String? provinceId;
  final String? organizationId;
  final List<UserRole> roles;
  final bool isActive;
  final bool mfaEnabled;

  const User({
    required this.id,
    required this.name,
    required this.email,
    this.avatarUrl,
    this.provinceId,
    this.organizationId,
    this.roles = const [],
    this.isActive = true,
    this.mfaEnabled = false,
  });

  /// Check if user has a specific role by name
  bool hasRole(String roleName) => roles.any((r) => r.name == roleName);

  /// Check if user has a specific permission across any role
  bool hasPermission(String permission) =>
      roles.any((r) => r.permissions.contains(permission));

  /// Convenience getters for role checks
  bool get isRanger => hasRole('ranger');
  bool get isTeamLead => hasRole('team_lead');
  bool get isOpsManager => hasRole('operations_manager');
  bool get isSystemAdmin => hasRole('system_admin');
  bool get isAuditor => hasRole('auditor');

  /// Get the primary (first) role name, defaults to 'ranger'
  String get primaryRole => roles.isNotEmpty ? roles.first.name : 'ranger';

  /// Create a copy of this user with optional field overrides
  User copyWith({
    String? id,
    String? name,
    String? email,
    String? avatarUrl,
    String? provinceId,
    String? organizationId,
    List<UserRole>? roles,
    bool? isActive,
    bool? mfaEnabled,
  }) {
    return User(
      id: id ?? this.id,
      name: name ?? this.name,
      email: email ?? this.email,
      avatarUrl: avatarUrl ?? this.avatarUrl,
      provinceId: provinceId ?? this.provinceId,
      organizationId: organizationId ?? this.organizationId,
      roles: roles ?? this.roles,
      isActive: isActive ?? this.isActive,
      mfaEnabled: mfaEnabled ?? this.mfaEnabled,
    );
  }

  /// Create User from JSON map
  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: (json['id'] ?? '').toString(),
      name: (json['name'] ?? '') as String,
      email: (json['email'] ?? '') as String,
      avatarUrl: json['avatar_url'] as String?,
      provinceId: json['province_id'] as String?,
      organizationId: json['organization_id'] as String?,
      roles: (json['roles'] as List<dynamic>?)
              ?.map((e) => UserRole.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      isActive: json['is_active'] as bool? ?? json['isActive'] as bool? ?? true,
      mfaEnabled: json['mfa_enabled'] as bool? ?? json['mfaEnabled'] as bool? ?? false,
    );
  }

  /// Convert User to JSON map
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'avatar_url': avatarUrl,
      'province_id': provinceId,
      'organization_id': organizationId,
      'roles': roles.map((e) => e.toJson()).toList(),
      'is_active': isActive,
      'mfa_enabled': mfaEnabled,
    };
  }

  @override
  List<Object?> get props => [id, email, roles, isActive];
}

/// Represents a user role with associated permissions
class UserRole extends Equatable {
  final String name;
  final List<String> permissions;

  const UserRole({required this.name, this.permissions = const []});

  /// Create UserRole from JSON map
  factory UserRole.fromJson(Map<String, dynamic> json) {
    return UserRole(
      name: json['name'] as String,
      permissions: (json['permissions'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          [],
    );
  }

  /// Convert UserRole to JSON map
  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'permissions': permissions,
    };
  }

  @override
  List<Object?> get props => [name, permissions];
}

/// Abstract repository interface for authentication operations
abstract class AuthRepository {
  /// Authenticate user with email and password
  /// Returns the authenticated [User] on success
  /// Throws [AuthException] on failure
  Future<User> login(String email, String password);

  /// Logout the current user and clear stored credentials
  Future<void> logout();

  /// Get the currently authenticated user, if any
  /// Returns null if no user is authenticated
  Future<User?> getCurrentUser();

  /// Get the stored access token
  /// Returns null if no token is stored
  Future<String?> getAccessToken();

  /// Refresh the access token using the stored refresh token
  /// Throws [AuthException] if refresh fails
  Future<void> refreshToken();

  /// Authenticate user using biometrics (fingerprint/face)
  /// Returns true if authentication succeeds
  /// Throws [AuthException] if biometrics are not available or auth fails
  Future<bool> authenticateWithBiometrics();

  /// Register a device for push notifications and tracking
  Future<void> registerDevice({
    required String deviceUuid,
    required String platform,
    required String osVersion,
    required String fcmToken,
  });

  /// Send an SOS emergency alert with location
  Future<void> sendSosAlert({
    required double lat,
    required double lng,
    required String message,
  });
}

/// Custom exception for authentication errors
class AuthException implements Exception {
  final String message;
  final String? code;
  final int? statusCode;

  const AuthException({
    required this.message,
    this.code,
    this.statusCode,
  });

  @override
  String toString() => 'AuthException($code): $message';
}

/// Token pair model for JWT authentication
class TokenPair extends Equatable {
  final String accessToken;
  final String refreshToken;
  final DateTime expiresAt;

  const TokenPair({
    required this.accessToken,
    required this.refreshToken,
    required this.expiresAt,
  });

  /// Check if the access token is expired
  bool get isExpired => DateTime.now().isAfter(expiresAt);

  /// Check if the access token will expire within the given duration
  bool willExpireWithin(Duration duration) =>
      DateTime.now().add(duration).isAfter(expiresAt);

  /// Create TokenPair from JSON map
  factory TokenPair.fromJson(Map<String, dynamic> json) {
    return TokenPair(
      accessToken: json['access_token'] as String,
      refreshToken: json['refresh_token'] as String,
      expiresAt: DateTime.fromMillisecondsSinceEpoch(
        (json['expires_at'] as int) * 1000,
      ),
    );
  }

  /// Convert TokenPair to JSON map
  Map<String, dynamic> toJson() {
    return {
      'access_token': accessToken,
      'refresh_token': refreshToken,
      'expires_at': expiresAt.millisecondsSinceEpoch ~/ 1000,
    };
  }

  @override
  List<Object?> get props => [accessToken, refreshToken, expiresAt];
}
