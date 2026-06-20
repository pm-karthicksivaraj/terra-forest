import 'package:dio/dio.dart';
import '../../../../core/network/api_client.dart';
import '../../domain/repositories/auth_repository.dart';

class AuthRemoteDataSource {
  final Dio _dio;

  AuthRemoteDataSource({Dio? dio}) : _dio = dio ?? ApiClient.instance.dio;

  /// Login with email and password
  /// POST /api/auth/login
  Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  }) async {
    try {
      final response = await _dio.post(
        '/api/auth/login',
        data: {
          'email': email,
          'password': password,
        },
      );
      return response.data as Map<String, dynamic>;
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  /// Get current authenticated user
  /// GET /api/auth/me
  Future<Map<String, dynamic>> getCurrentUser() async {
    try {
      final response = await _dio.get('/api/auth/me');
      return response.data as Map<String, dynamic>;
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  /// Refresh access token
  /// POST /api/auth/refresh
  Future<Map<String, dynamic>> refreshToken({
    required String refreshToken,
  }) async {
    try {
      final response = await _dio.post(
        '/api/auth/refresh',
        data: {
          'refresh_token': refreshToken,
        },
      );
      return response.data as Map<String, dynamic>;
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  /// Logout and invalidate tokens
  /// POST /api/auth/logout
  Future<void> logout() async {
    try {
      await _dio.post('/api/auth/logout');
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  /// Register device for push notifications
  /// POST /api/devices
  Future<Map<String, dynamic>> registerDevice({
    required String deviceUuid,
    required String platform,
    required String osVersion,
    required String fcmToken,
  }) async {
    try {
      final response = await _dio.post(
        '/api/devices',
        data: {
          'device_uuid': deviceUuid,
          'platform': platform,
          'os_version': osVersion,
          'fcm_token': fcmToken,
        },
      );
      return response.data as Map<String, dynamic>;
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  /// Send SOS emergency alert
  /// POST /api/sos
  Future<Map<String, dynamic>> sendSosAlert({
    required double lat,
    required double lng,
    required String message,
  }) async {
    try {
      final response = await _dio.post(
        '/api/sos',
        data: {
          'lat': lat,
          'lng': lng,
          'message': message,
        },
      );
      return response.data as Map<String, dynamic>;
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  /// Request password reset
  /// POST /api/auth/forgot-password
  Future<Map<String, dynamic>> forgotPassword({
    required String email,
  }) async {
    try {
      final response = await _dio.post(
        '/api/auth/forgot-password',
        data: {'email': email},
      );
      return response.data as Map<String, dynamic>;
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  /// Reset password with token
  /// POST /api/auth/reset-password
  Future<Map<String, dynamic>> resetPassword({
    required String token,
    required String password,
    required String confirmPassword,
  }) async {
    try {
      final response = await _dio.post(
        '/api/auth/reset-password',
        data: {
          'token': token,
          'password': password,
          'password_confirmation': confirmPassword,
        },
      );
      return response.data as Map<String, dynamic>;
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  /// Change password for authenticated user
  /// POST /api/auth/change-password
  Future<Map<String, dynamic>> changePassword({
    required String currentPassword,
    required String newPassword,
    required String confirmPassword,
  }) async {
    try {
      final response = await _dio.post(
        '/api/auth/change-password',
        data: {
          'current_password': currentPassword,
          'new_password': newPassword,
          'new_password_confirmation': confirmPassword,
        },
      );
      return response.data as Map<String, dynamic>;
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  /// Verify biometric challenge
  /// POST /api/auth/biometric/verify
  Future<Map<String, dynamic>> verifyBiometric({
    required String biometricToken,
  }) async {
    try {
      final response = await _dio.post(
        '/api/auth/biometric/verify',
        data: {'biometric_token': biometricToken},
      );
      return response.data as Map<String, dynamic>;
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  /// Handle Dio errors and convert to AuthException
  AuthException _handleDioError(DioException e) {
    switch (e.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        return const AuthException(
          message: 'Kết nối quá thời gian. Vui lòng thử lại.',
          code: 'TIMEOUT',
        );
      case DioExceptionType.connectionError:
        return const AuthException(
          message: 'Không thể kết nối đến máy chủ.',
          code: 'NO_CONNECTION',
        );
      case DioExceptionType.badResponse:
        final statusCode = e.response?.statusCode;
        final data = e.response?.data;

        if (statusCode == 401) {
          return const AuthException(
            message: 'Email hoặc mật khẩu không đúng.',
            code: 'INVALID_CREDENTIALS',
            statusCode: 401,
          );
        }
        if (statusCode == 403) {
          return const AuthException(
            message: 'Tài khoản đã bị khóa.',
            code: 'ACCOUNT_LOCKED',
            statusCode: 403,
          );
        }
        if (statusCode == 422) {
          final errors = data is Map ? data['errors'] : null;
          final message = errors is Map ? errors.values.first : 'Dữ liệu không hợp lệ';
          return AuthException(
            message: message is List ? message.first.toString() : message.toString(),
            code: 'VALIDATION_ERROR',
            statusCode: statusCode,
          );
        }
        if (statusCode == 429) {
          return const AuthException(
            message: 'Quá nhiều yêu cầu. Vui lòng thử lại sau.',
            code: 'RATE_LIMITED',
            statusCode: 429,
          );
        }
        if (statusCode != null && statusCode >= 500) {
          return const AuthException(
            message: 'Lỗi máy chủ. Vui lòng thử lại sau.',
            code: 'SERVER_ERROR',
            statusCode: 500,
          );
        }
        return AuthException(
          message: data is Map && data['message'] != null
              ? data['message'].toString()
              : 'Đã xảy ra lỗi.',
          code: 'UNKNOWN',
          statusCode: statusCode,
        );
      case DioExceptionType.cancel:
        return const AuthException(
          message: 'Yêu cầu đã bị hủy.',
          code: 'CANCELLED',
        );
      case DioExceptionType.badCertificate:
        return const AuthException(
          message: 'Chứng chỉ bảo mật không hợp lệ.',
          code: 'BAD_CERTIFICATE',
        );
      default:
        return const AuthException(
          message: 'Đã xảy ra lỗi không xác định.',
          code: 'UNKNOWN',
        );
    }
  }
}
