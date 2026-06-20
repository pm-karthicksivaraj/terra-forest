import 'dart:async';
import 'dart:io';

import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:path/path.dart' as p;

/// Custom API exception for structured error handling
class ApiException implements Exception {
  final String message;
  final int? statusCode;
  final String? endpoint;
  final dynamic responseData;
  final StackTrace? stackTrace;

  ApiException({
    required this.message,
    this.statusCode,
    this.endpoint,
    this.responseData,
    this.stackTrace,
  });

  factory ApiException.fromDioError(DioException error, {String? endpoint}) {
    String message;
    int? statusCode;

    switch (error.type) {
      case DioExceptionType.connectionTimeout:
        message = 'Connection timed out. Please check your internet connection.';
        statusCode = null;
        break;
      case DioExceptionType.sendTimeout:
        message = 'Request send timed out. Please try again.';
        statusCode = null;
        break;
      case DioExceptionType.receiveTimeout:
        message = 'Server response timed out. Please try again.';
        statusCode = null;
        break;
      case DioExceptionType.badResponse:
        statusCode = error.response?.statusCode;
        message = _extractErrorMessage(error.response);
        break;
      case DioExceptionType.cancel:
        message = 'Request was cancelled.';
        statusCode = null;
        break;
      case DioExceptionType.connectionError:
        message = 'No internet connection. Please check your network settings.';
        statusCode = null;
        break;
      case DioExceptionType.badCertificate:
        message = 'SSL certificate verification failed.';
        statusCode = null;
        break;
      case DioExceptionType.unknown:
        message = 'An unexpected error occurred: ${error.message}';
        statusCode = null;
        break;
    }

    return ApiException(
      message: message,
      statusCode: statusCode,
      endpoint: endpoint,
      responseData: error.response?.data,
      stackTrace: error.stackTrace,
    );
  }

  static String _extractErrorMessage(Response? response) {
    if (response?.data == null) {
      return 'Server returned an error (${response?.statusCode})';
    }

    try {
      final data = response!.data;
      if (data is Map<String, dynamic>) {
        return data['message'] ??
            data['error'] ??
            data['detail'] ??
            'Server error (${response.statusCode})';
      }
      if (data is String) {
        return data;
      }
    } catch (_) {}

    return 'Server error (${response?.statusCode})';
  }

  bool get isAuthError => statusCode == 401 || statusCode == 403;
  bool get isNotFound => statusCode == 404;
  bool get isServerError => statusCode != null && statusCode! >= 500;
  bool get isClientError =>
      statusCode != null && statusCode! >= 400 && statusCode! < 500;

  @override
  String toString() =>
      'ApiException($statusCode): $message${endpoint != null ? ' [$endpoint]' : ''}';
}

/// Dio-based API client with auth, caching, and offline support.
class ApiClient {
  static ApiClient? _instance;

  static ApiClient get instance {
    _instance ??= ApiClient._();
    return _instance!;
  }

  ApiClient._() {
    _dio = _createDio();
  }

  late final Dio _dio;
  final FlutterSecureStorage _secureStorage = const FlutterSecureStorage();

  /// Public getter for the configured Dio instance (used by data sources)
  Dio get dio => _dio;

  String _baseUrl = 'https://api.terraforest.example.com';
  static const String _accessTokenKey = 'auth_access_token';
  static const String _refreshTokenKey = 'auth_refresh_token';

  // In-memory cache for offline GET responses
  final Map<String, _CacheEntry> _cache = {};
  static const Duration _cacheMaxAge = Duration(hours: 24);
  static const int _maxCacheSize = 200;

  /// Update base URL (e.g., when switching environments)
  void setBaseUrl(String url) {
    _baseUrl = url;
    _dio.options.baseUrl = _baseUrl;
    _cache.clear();
  }

  /// Get current base URL
  String get baseUrl => _baseUrl;

  // ---------------------------------------------------------------------------
  // Dio Instance Setup
  // ---------------------------------------------------------------------------

  Dio _createDio() {
    final dio = Dio(
      BaseOptions(
        baseUrl: _baseUrl,
        connectTimeout: const Duration(seconds: 15),
        receiveTimeout: const Duration(seconds: 30),
        sendTimeout: const Duration(seconds: 60), // Longer for uploads
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Client-Version': '1.0.0',
          'X-Platform': Platform.isAndroid ? 'android' : 'ios',
        },
      ),
    );

    // Add interceptors in order
    dio.interceptors.addAll([
      _AuthInterceptor(this),
      _TokenRefreshInterceptor(this),
      _CacheInterceptor(this),
      _LoggingInterceptor(),
    ]);

    return dio;
  }

  // ---------------------------------------------------------------------------
  // Token Management
  // ---------------------------------------------------------------------------

  Future<String?> get accessToken async {
    return _secureStorage.read(key: _accessTokenKey);
  }

  Future<String?> get refreshToken async {
    return _secureStorage.read(key: _refreshTokenKey);
  }

  Future<void> setTokens({
    required String accessToken,
    required String refreshToken,
  }) async {
    await _secureStorage.write(key: _accessTokenKey, value: accessToken);
    await _secureStorage.write(key: _refreshTokenKey, value: refreshToken);
  }

  Future<void> clearTokens() async {
    await _secureStorage.delete(key: _accessTokenKey);
    await _secureStorage.delete(key: _refreshTokenKey);
  }

  // ---------------------------------------------------------------------------
  // Connectivity Check
  // ---------------------------------------------------------------------------

  Future<bool> isConnected() async {
    final result = await Connectivity().checkConnectivity();
    return result.any((r) => r != ConnectivityResult.none);
  }

  Future<void> _requireConnection() async {
    final connected = await isConnected();
    if (!connected) {
      throw ApiException(
        message: 'No internet connection available.',
        statusCode: 0,
      );
    }
  }

  // ---------------------------------------------------------------------------
  // HTTP Methods
  // ---------------------------------------------------------------------------

  Future<Response> get(
    String path, {
    Map<String, dynamic>? queryParameters,
    Options? options,
    CancelToken? cancelToken,
  }) async {
    try {
      await _requireConnection();
      return await _dio.get(
        path,
        queryParameters: queryParameters,
        options: options,
        cancelToken: cancelToken,
      );
    } on DioException catch (e) {
      throw ApiException.fromDioError(e, endpoint: path);
    }
  }

  Future<Response> post(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
    CancelToken? cancelToken,
    void Function(int, int)? onSendProgress,
    void Function(int, int)? onReceiveProgress,
  }) async {
    try {
      await _requireConnection();
      return await _dio.post(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
        cancelToken: cancelToken,
        onSendProgress: onSendProgress,
        onReceiveProgress: onReceiveProgress,
      );
    } on DioException catch (e) {
      throw ApiException.fromDioError(e, endpoint: path);
    }
  }

  Future<Response> put(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
    CancelToken? cancelToken,
  }) async {
    try {
      await _requireConnection();
      return await _dio.put(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
        cancelToken: cancelToken,
      );
    } on DioException catch (e) {
      throw ApiException.fromDioError(e, endpoint: path);
    }
  }

  Future<Response> patch(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
    CancelToken? cancelToken,
  }) async {
    try {
      await _requireConnection();
      return await _dio.patch(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
        cancelToken: cancelToken,
      );
    } on DioException catch (e) {
      throw ApiException.fromDioError(e, endpoint: path);
    }
  }

  Future<Response> delete(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
    CancelToken? cancelToken,
  }) async {
    try {
      await _requireConnection();
      return await _dio.delete(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
        cancelToken: cancelToken,
      );
    } on DioException catch (e) {
      throw ApiException.fromDioError(e, endpoint: path);
    }
  }

  // ---------------------------------------------------------------------------
  // File Upload (Multipart)
  // ---------------------------------------------------------------------------

  Future<Response> uploadFile(
    String path,
    File file, {
    String fieldName = 'file',
    Map<String, dynamic>? extraData,
    CancelToken? cancelToken,
    void Function(int, int)? onSendProgress,
  }) async {
    try {
      await _requireConnection();

      final fileName = p.basename(file.path);
      final formData = FormData();

      // Add the file
      formData.files.add(
        MapEntry(
          fieldName,
          await MultipartFile.fromFile(
            file.path,
            filename: fileName,
          ),
        ),
      );

      // Add extra fields
      if (extraData != null) {
        extraData.forEach((key, value) {
          formData.fields.add(MapEntry(key, value.toString()));
        });
      }

      return await _dio.post(
        path,
        data: formData,
        options: Options(
          contentType: 'multipart/form-data',
        ),
        cancelToken: cancelToken,
        onSendProgress: onSendProgress,
      );
    } on DioException catch (e) {
      throw ApiException.fromDioError(e, endpoint: path);
    }
  }

  /// Upload multiple files at once
  Future<Response> uploadMultipleFiles(
    String path,
    List<File> files, {
    String fieldName = 'files',
    Map<String, dynamic>? extraData,
    CancelToken? cancelToken,
    void Function(int, int)? onSendProgress,
  }) async {
    try {
      await _requireConnection();

      final formData = FormData();

      for (final file in files) {
        final fileName = p.basename(file.path);
        formData.files.add(
          MapEntry(
            fieldName,
            await MultipartFile.fromFile(
              file.path,
              filename: fileName,
            ),
          ),
        );
      }

      if (extraData != null) {
        extraData.forEach((key, value) {
          formData.fields.add(MapEntry(key, value.toString()));
        });
      }

      return await _dio.post(
        path,
        data: formData,
        options: Options(
          contentType: 'multipart/form-data',
        ),
        cancelToken: cancelToken,
        onSendProgress: onSendProgress,
      );
    } on DioException catch (e) {
      throw ApiException.fromDioError(e, endpoint: path);
    }
  }

  // ---------------------------------------------------------------------------
  // File Download
  // ---------------------------------------------------------------------------

  Future<Response> downloadFile(
    String urlPath,
    String savePath, {
    CancelToken? cancelToken,
    void Function(int, int)? onReceiveProgress,
    Options? options,
  }) async {
    try {
      await _requireConnection();

      return await _dio.download(
        urlPath,
        savePath,
        cancelToken: cancelToken,
        onReceiveProgress: onReceiveProgress,
        options: options,
      );
    } on DioException catch (e) {
      throw ApiException.fromDioError(e, endpoint: urlPath);
    }
  }

  // ---------------------------------------------------------------------------
  // Cache Management
  // ---------------------------------------------------------------------------

  /// Clear all cached responses
  void clearCache() {
    _cache.clear();
  }

  /// Clear expired cache entries
  void cleanExpiredCache() {
    final now = DateTime.now();
    _cache.removeWhere((key, entry) {
      return now.difference(entry.cachedAt) > _cacheMaxAge;
    });
  }

  /// Get cache entry count
  int get cacheSize => _cache.length;

  void _addToCache(String key, Response response) {
    // Evict oldest entries if cache is full
    if (_cache.length >= _maxCacheSize) {
      final oldestKey = _cache.entries
          .reduce((a, b) => a.value.cachedAt.isBefore(b.value.cachedAt) ? a : b)
          .key;
      _cache.remove(oldestKey);
    }

    _cache[key] = _CacheEntry(
      data: response.data,
      statusCode: response.statusCode,
      headers: response.headers.map,
      cachedAt: DateTime.now(),
    );
  }

  Response? _getFromCache(String key) {
    final entry = _cache[key];
    if (entry == null) return null;

    if (DateTime.now().difference(entry.cachedAt) > _cacheMaxAge) {
      _cache.remove(key);
      return null;
    }

    return Response(
      requestOptions: RequestOptions(path: ''),
      data: entry.data,
      statusCode: entry.statusCode,
      headers: Headers.fromMap(entry.headers),
    );
  }
}

// =============================================================================
// Auth Interceptor - Add Bearer token to every request
// =============================================================================

class _AuthInterceptor extends Interceptor {
  final ApiClient _client;

  _AuthInterceptor(this._client);

  @override
  Future<void> onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    // Skip auth for login/refresh endpoints
    final path = options.path;
    if (path.contains('/auth/login') || path.contains('/auth/refresh')) {
      handler.next(options);
      return;
    }

    final token = await _client.accessToken;
    if (token != null && token.isNotEmpty) {
      options.headers['Authorization'] = 'Bearer $token';
    }

    handler.next(options);
  }
}

// =============================================================================
// Token Refresh Interceptor - On 401, clear tokens (no refresh endpoint)
// The current API only returns a single JWT without refresh tokens,
// so we clear local auth data and let the app redirect to login.
// =============================================================================

class _TokenRefreshInterceptor extends Interceptor {
  final ApiClient _client;

  _TokenRefreshInterceptor(this._client);

  @override
  void onError(
    DioException err,
    ErrorInterceptorHandler handler,
  ) async {
    if (err.response?.statusCode != 401) {
      handler.next(err);
      return;
    }

    // On 401, clear tokens so the app redirects to login
    await _client.clearTokens();
    handler.next(err);
  }
}

// =============================================================================
// Cache Interceptor - Cache GET responses for offline use
// =============================================================================

class _CacheInterceptor extends Interceptor {
  final ApiClient _client;

  _CacheInterceptor(this._client);

  @override
  void onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    // Only cache GET requests
    if (options.method.toUpperCase() != 'GET') {
      handler.next(options);
      return;
    }

    // Check if offline - serve from cache if available
    final connectivityResult = await Connectivity().checkConnectivity();
    final isOffline = connectivityResult.every((r) => r == ConnectivityResult.none);

    if (isOffline) {
      final cacheKey = _generateCacheKey(options);
      final cachedResponse = _client._getFromCache(cacheKey);
      if (cachedResponse != null) {
        handler.resolve(cachedResponse);
        return;
      }

      // No cache and offline - return error
      handler.next(options);
      return;
    }

    // Online - proceed with request but add cache headers
    options.headers['If-None-Match'] = '';
    handler.next(options);
  }

  @override
  void onResponse(
    Response response,
    ResponseInterceptorHandler handler,
  ) {
    // Cache successful GET responses
    if (response.requestOptions.method.toUpperCase() == 'GET' &&
        response.statusCode != null &&
        response.statusCode! >= 200 &&
        response.statusCode! < 300) {
      final cacheKey = _generateCacheKey(response.requestOptions);
      _client._addToCache(cacheKey, response);
    }

    handler.next(response);
  }

  @override
  void onError(
    DioException err,
    ErrorInterceptorHandler handler,
  ) async {
    // On network error for GET, try to serve from cache
    if (err.requestOptions.method.toUpperCase() == 'GET') {
      final cacheKey = _generateCacheKey(err.requestOptions);
      final cachedResponse = _client._getFromCache(cacheKey);
      if (cachedResponse != null) {
        handler.resolve(cachedResponse);
        return;
      }
    }

    handler.next(err);
  }

  String _generateCacheKey(RequestOptions options) {
    final uri = options.uri.toString();
    final params = options.queryParameters.toString();
    return '$uri|$params';
  }
}

// =============================================================================
// Logging Interceptor - Debug mode request/response logging
// =============================================================================

class _LoggingInterceptor extends Interceptor {
  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    if (kDebugMode) {
      debugPrint(
        '┌──────────────────────────────────────────────────────\n'
        '│ REQUEST: ${options.method} ${options.uri}\n'
        '│ Headers: ${_formatHeaders(options.headers)}\n'
        '│ Data: ${_truncate(options.data?.toString() ?? 'null', 500)}\n'
        '└──────────────────────────────────────────────────────',
      );
    }
    handler.next(options);
  }

  @override
  void onResponse(
      Response response, ResponseInterceptorHandler handler) {
    if (kDebugMode) {
      debugPrint(
        '┌──────────────────────────────────────────────────────\n'
        '│ RESPONSE: ${response.statusCode} ${response.requestOptions.method} ${response.requestOptions.uri}\n'
        '│ Data: ${_truncate(response.data?.toString() ?? 'null', 500)}\n'
        '└──────────────────────────────────────────────────────',
      );
    }
    handler.next(response);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    if (kDebugMode) {
      debugPrint(
        '┌──────────────────────────────────────────────────────\n'
        '│ ERROR: ${err.type} ${err.requestOptions.method} ${err.requestOptions.uri}\n'
        '│ Status: ${err.response?.statusCode}\n'
        '│ Message: ${err.message}\n'
        '│ Response: ${_truncate(err.response?.data?.toString() ?? 'null', 500)}\n'
        '└──────────────────────────────────────────────────────',
      );
    }
    handler.next(err);
  }

  String _formatHeaders(Map<String, dynamic> headers) {
    final sanitized = Map<String, dynamic>.from(headers);
    if (sanitized.containsKey('Authorization')) {
      final auth = sanitized['Authorization'] as String?;
      if (auth != null && auth.length > 15) {
        sanitized['Authorization'] = '${auth.substring(0, 15)}...';
      }
    }
    return sanitized.toString();
  }

  String _truncate(String text, int maxLength) {
    if (text.length <= maxLength) return text;
    return '${text.substring(0, maxLength)}... (truncated)';
  }
}

// =============================================================================
// Cache Entry
// =============================================================================

class _CacheEntry {
  final dynamic data;
  final int? statusCode;
  final Map<String, List<String>> headers;
  final DateTime cachedAt;

  _CacheEntry({
    required this.data,
    required this.statusCode,
    required this.headers,
    required this.cachedAt,
  });
}
