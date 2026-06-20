import 'dart:convert';

import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:local_auth/local_auth.dart';

import '../../domain/repositories/auth_repository.dart';
import '../datasources/auth_remote_datasource.dart';

/// Implementation of [AuthRepository] with Dio HTTP, FlutterSecureStorage,
/// SharedPreferences offline cache, and local_auth biometric support.
class AuthRepositoryImpl implements AuthRepository {
  final AuthRemoteDataSource _remoteDataSource;
  final FlutterSecureStorage _secureStorage;
  final LocalAuthentication _localAuth;

  // Lazy SharedPreferences — initialized on first access
  SharedPreferences? _prefs;
  Future<SharedPreferences> get prefs async {
    return _prefs ??= await SharedPreferences.getInstance();
  }

  // Secure storage keys
  static const _accessTokenKey = 'auth_access_token';
  static const _refreshTokenKey = 'auth_refresh_token';
  static const _tokenExpiryKey = 'auth_token_expiry';
  static const _cachedUserKey = 'auth_cached_user';
  static const _biometricEnabledKey = 'auth_biometric_enabled';

  // SharedPreferences keys
  static const _prefsUserKey = 'cached_user';
  static const _prefsAccessTokenKey = 'cached_access_token';
  static const _sosQueueKey = 'sos_queue';

  AuthRepositoryImpl({
    AuthRemoteDataSource? remoteDataSource,
    FlutterSecureStorage? secureStorage,
    LocalAuthentication? localAuth,
  })  : _remoteDataSource = remoteDataSource ?? AuthRemoteDataSource(),
        _secureStorage = secureStorage ?? const FlutterSecureStorage(),
        _localAuth = localAuth ?? LocalAuthentication();

  @override
  Future<User> login(String email, String password) async {
    try {
      final response = await _remoteDataSource.login(
        email: email,
        password: password,
      );

      // API returns: { data: { token: "...", user: { ... } } }
      final data = response['data'] as Map<String, dynamic>;

      // Store the access token (API returns a single JWT, no refresh token)
      final accessToken = data['token'] as String;
      await _storeAccessToken(accessToken);

      // Parse and cache user
      final user = User.fromJson(data['user'] as Map<String, dynamic>);
      await _cacheUser(user);

      return user;
    } on AuthException {
      rethrow;
    } catch (e) {
      throw AuthException(
        message: 'Đăng nhập thất bại. Vui lòng thử lại.',
        code: 'LOGIN_FAILED',
      );
    }
  }

  @override
  Future<void> logout() async {
    try {
      // Attempt to notify server about logout
      await _remoteDataSource.logout();
    } catch (_) {
      // Ignore server errors during logout, proceed with local cleanup
    } finally {
      // Always clear local data
      await _clearLocalData();
    }
  }

  @override
  Future<User?> getCurrentUser() async {
    try {
      // First try to get from server
      final accessToken = await getAccessToken();
      if (accessToken == null) {
        return _getCachedUser();
      }

      // API returns: { data: { id, name, email, roles: [...] } }
      final response = await _remoteDataSource.getCurrentUser();
      final userData = response['data'] as Map<String, dynamic>;
      final user = User.fromJson(userData);
      await _cacheUser(user);
      return user;
    } on AuthException catch (e) {
      // If token is expired/invalid, clear tokens and return cached user
      if (e.statusCode == 401) {
        await _clearLocalData();
      }
      return _getCachedUser();
    } catch (e) {
      // Any other error - fall back to cached user
      return _getCachedUser();
    }
  }

  @override
  Future<String?> getAccessToken() async {
    try {
      // Try secure storage first
      final token = await _secureStorage.read(key: _accessTokenKey);
      if (token != null) return token;

      // Fall back to SharedPreferences cache
      return (await prefs).getString(_prefsAccessTokenKey);
    } catch (_) {
      return null;
    }
  }

  @override
  Future<void> refreshToken() async {
    // The current API only returns a single JWT access token without refresh tokens.
    // Refresh is not supported — caller should handle re-login instead.
    throw const AuthException(
      message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
      code: 'NO_REFRESH_TOKEN',
    );
  }

  @override
  Future<bool> authenticateWithBiometrics() async {
    try {
      // Check if biometrics are available
      final isAvailable = await _localAuth.canCheckBiometrics;
      final isDeviceSupported = await _localAuth.isDeviceSupported();

      if (!isAvailable || !isDeviceSupported) {
        throw const AuthException(
          message: 'Thiết bị không hỗ trợ sinh trắc học.',
          code: 'BIOMETRIC_NOT_AVAILABLE',
        );
      }

      // Check if biometric login is enabled for this user
      final biometricEnabled = await _secureStorage.read(key: _biometricEnabledKey);
      if (biometricEnabled != 'true') {
        throw const AuthException(
          message: 'Đăng nhập sinh trắc học chưa được bật.',
          code: 'BIOMETRIC_NOT_ENABLED',
        );
      }

      // Authenticate with biometrics
      final authenticated = await _localAuth.authenticate(
        localizedReason: 'Xác thực để đăng nhập Terra Forest MRV',
        options: const AuthenticationOptions(
          stickyAuth: true,
          biometricOnly: true,
        ),
      );

      if (authenticated) {
        // Validate stored token is still valid
        final accessToken = await getAccessToken();
        if (accessToken != null) {
          // Token exists, biometric auth successful
          return true;
        }
      }

      return false;
    } on AuthException {
      rethrow;
    } catch (e) {
      throw AuthException(
        message: 'Xác thực sinh trắc học thất bại.',
        code: 'BIOMETRIC_AUTH_FAILED',
      );
    }
  }

  @override
  Future<void> registerDevice({
    required String deviceUuid,
    required String platform,
    required String osVersion,
    required String fcmToken,
  }) async {
    try {
      await _remoteDataSource.registerDevice(
        deviceUuid: deviceUuid,
        platform: platform,
        osVersion: osVersion,
        fcmToken: fcmToken,
      );
    } on AuthException {
      rethrow;
    } catch (e) {
      throw AuthException(
        message: 'Đăng ký thiết bị thất bại.',
        code: 'DEVICE_REGISTER_FAILED',
      );
    }
  }

  @override
  Future<void> sendSosAlert({
    required double lat,
    required double lng,
    required String message,
  }) async {
    try {
      await _remoteDataSource.sendSosAlert(
        lat: lat,
        lng: lng,
        message: message,
      );
    } on AuthException {
      rethrow;
    } catch (e) {
      // Cache SOS for offline sending using SharedPreferences
      try {
        final p = await prefs;
        final queueJson = p.getString(_sosQueueKey);
        final queue = queueJson != null
            ? List<Map<String, dynamic>>.from(jsonDecode(queueJson) as List)
            : <Map<String, dynamic>>[];
        queue.add({
          'lat': lat,
          'lng': lng,
          'message': message,
          'timestamp': DateTime.now().toIso8601String(),
        });
        await p.setString(_sosQueueKey, jsonEncode(queue));
      } catch (_) {
        // Ignore cache errors for SOS
      }
      throw AuthException(
        message: 'Gửi SOS thất bại. Đã lưu để gửi lại khi có mạng.',
        code: 'SOS_QUEUED',
      );
    }
  }

  /// Store a single access token in secure storage and SharedPreferences cache
  Future<void> _storeAccessToken(String accessToken) async {
    // Store in FlutterSecureStorage (primary)
    await _secureStorage.write(key: _accessTokenKey, value: accessToken);

    // Also cache in SharedPreferences for offline access
    final p = await prefs;
    await p.setString(_prefsAccessTokenKey, accessToken);
  }

  /// Cache user data in both secure storage and SharedPreferences
  Future<void> _cacheUser(User user) async {
    final userJson = jsonEncode(user.toJson());

    // Store in FlutterSecureStorage
    await _secureStorage.write(key: _cachedUserKey, value: userJson);

    // Also store in SharedPreferences for offline access
    final p = await prefs;
    await p.setString(_prefsUserKey, userJson);
  }

  /// Get cached user from SharedPreferences or secure storage (offline fallback)
  Future<User?> _getCachedUser() async {
    try {
      // Try SharedPreferences first (faster)
      final p = await prefs;
      final prefsUser = p.getString(_prefsUserKey);
      if (prefsUser != null) {
        final userMap = jsonDecode(prefsUser) as Map<String, dynamic>;
        return User.fromJson(userMap);
      }

      // Fall back to secure storage
      final secureUser = await _secureStorage.read(key: _cachedUserKey);
      if (secureUser != null) {
        final userMap = jsonDecode(secureUser) as Map<String, dynamic>;
        return User.fromJson(userMap);
      }

      return null;
    } catch (_) {
      return null;
    }
  }

  /// Clear all local authentication data
  Future<void> _clearLocalData() async {
    // Clear secure storage
    await _secureStorage.delete(key: _accessTokenKey);
    await _secureStorage.delete(key: _refreshTokenKey);
    await _secureStorage.delete(key: _tokenExpiryKey);
    await _secureStorage.delete(key: _cachedUserKey);
    await _secureStorage.delete(key: _biometricEnabledKey);

    // Clear SharedPreferences cache
    final p = await prefs;
    await p.remove(_prefsUserKey);
    await p.remove(_prefsAccessTokenKey);
  }

  /// Enable biometric login for the current user
  Future<void> enableBiometricLogin() async {
    final isAvailable = await _localAuth.canCheckBiometrics;
    if (!isAvailable) {
      throw const AuthException(
        message: 'Thiết bị không hỗ trợ sinh trắc học.',
        code: 'BIOMETRIC_NOT_AVAILABLE',
      );
    }
    await _secureStorage.write(key: _biometricEnabledKey, value: 'true');
  }

  /// Disable biometric login for the current user
  Future<void> disableBiometricLogin() async {
    await _secureStorage.delete(key: _biometricEnabledKey);
  }

  /// Check if biometric login is enabled
  Future<bool> isBiometricLoginEnabled() async {
    final value = await _secureStorage.read(key: _biometricEnabledKey);
    return value == 'true';
  }

  /// Check if device supports biometric authentication
  Future<bool> isBiometricAvailable() async {
    try {
      return await _localAuth.canCheckBiometrics &&
          await _localAuth.isDeviceSupported();
    } catch (_) {
      return false;
    }
  }

  /// Get available biometric types on the device
  Future<List<BiometricType>> getAvailableBiometrics() async {
    try {
      return await _localAuth.getAvailableBiometrics();
    } catch (_) {
      return [];
    }
  }
}
