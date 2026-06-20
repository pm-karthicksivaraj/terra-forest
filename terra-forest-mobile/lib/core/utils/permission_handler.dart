import 'package:permission_handler/permission_handler.dart';
import 'package:flutter/material.dart';

/// Vietnamese rationale messages for each permission
class PermissionRationale {
  static const String location =
      'Terra Forest cần vị trí để theo dõi tuần tra và hiển thị bản đồ';
  static const String camera =
      'Terra Forest cần camera để chụp ảnh bằng chứng';
  static const String microphone =
      'Terra Forest cần microphone để ghi âm bằng chứng';
  static const String notifications =
      'Terra Forest cần thông báo để gửi cảnh báo khẩn cấp';
  static const String storage =
      'Terra Forest cần bộ nhớ để lưu dữ liệu ngoại tuyến';
}

/// Permission status result for batch operations
class PermissionCheckResult {
  final Map<Permission, PermissionStatus> results;
  final bool allCriticalGranted;

  PermissionCheckResult({
    required this.results,
    required this.allCriticalGranted,
  });

  bool isGranted(Permission permission) {
    return results[permission]?.isGranted ?? false;
  }

  List<Permission> get deniedPermissions {
    return results.entries
        .where((e) => !e.value.isGranted)
        .map((e) => e.key)
        .toList();
  }
}

/// Permission request handler with Vietnamese rationale messages.
/// Provides structured permission management for the Terra Forest MRV app.
class AppPermissionHandler {
  static AppPermissionHandler? _instance;

  static AppPermissionHandler get instance {
    _instance ??= AppPermissionHandler._();
    return _instance!;
  }

  AppPermissionHandler._();

  /// Critical permissions that the app cannot function without
  static const List<Permission> _criticalPermissions = [
    Permission.location,
  ];

  /// All permissions the app may need
  static const List<Permission> _allPermissions = [
    Permission.location,
    Permission.camera,
    Permission.microphone,
    Permission.notification,
    Permission.storage,
  ];

  /// Map of permission to its Vietnamese rationale
  static final Map<Permission, String> _rationales = {
    Permission.location: PermissionRationale.location,
    Permission.camera: PermissionRationale.camera,
    Permission.microphone: PermissionRationale.microphone,
    Permission.notification: PermissionRationale.notifications,
    Permission.storage: PermissionRationale.storage,
  };

  // ---------------------------------------------------------------------------
  // Individual Permission Requests
  // ---------------------------------------------------------------------------

  /// Request location permission with Vietnamese rationale
  Future<PermissionStatus> requestLocationPermission({
    BuildContext? context,
  }) async {
    if (context != null) {
      await _showRationaleDialog(
        context,
        PermissionRationale.location,
        'Quyền vị trí',
      );
    }

    var status = await Permission.location.status;

    if (status.isDenied) {
      status = await Permission.location.request();
    }

    if (status.isPermanentlyDenied) {
      await openAppSettings();
      // Re-check after returning from settings
      status = await Permission.location.status;
    }

    return status;
  }

  /// Request camera permission with Vietnamese rationale
  Future<PermissionStatus> requestCameraPermission({
    BuildContext? context,
  }) async {
    if (context != null) {
      await _showRationaleDialog(
        context,
        PermissionRationale.camera,
        'Quyền camera',
      );
    }

    var status = await Permission.camera.status;

    if (status.isDenied) {
      status = await Permission.camera.request();
    }

    if (status.isPermanentlyDenied) {
      await openAppSettings();
      status = await Permission.camera.status;
    }

    return status;
  }

  /// Request microphone permission with Vietnamese rationale
  Future<PermissionStatus> requestMicrophonePermission({
    BuildContext? context,
  }) async {
    if (context != null) {
      await _showRationaleDialog(
        context,
        PermissionRationale.microphone,
        'Quyền microphone',
      );
    }

    var status = await Permission.microphone.status;

    if (status.isDenied) {
      status = await Permission.microphone.request();
    }

    if (status.isPermanentlyDenied) {
      await openAppSettings();
      status = await Permission.microphone.status;
    }

    return status;
  }

  /// Request notification permission with Vietnamese rationale
  Future<PermissionStatus> requestNotificationPermission({
    BuildContext? context,
  }) async {
    if (context != null) {
      await _showRationaleDialog(
        context,
        PermissionRationale.notifications,
        'Quyền thông báo',
      );
    }

    var status = await Permission.notification.status;

    if (status.isDenied) {
      status = await Permission.notification.request();
    }

    if (status.isPermanentlyDenied) {
      await openAppSettings();
      status = await Permission.notification.status;
    }

    return status;
  }

  /// Request storage permission with Vietnamese rationale
  Future<PermissionStatus> requestStoragePermission({
    BuildContext? context,
  }) async {
    if (context != null) {
      await _showRationaleDialog(
        context,
        PermissionRationale.storage,
        'Quyền bộ nhớ',
      );
    }

    var status = await Permission.storage.status;

    if (status.isDenied) {
      status = await Permission.storage.request();
    }

    if (status.isPermanentlyDenied) {
      await openAppSettings();
      status = await Permission.storage.status;
    }

    return status;
  }

  // ---------------------------------------------------------------------------
  // Batch Permission Requests
  // ---------------------------------------------------------------------------

  /// Request all permissions needed for the app
  /// Returns a map of permission to its status
  Future<Map<Permission, PermissionStatus>> requestAllPermissions({
    BuildContext? context,
  }) async {
    final results = <Permission, PermissionStatus>{};

    // Show overall rationale if context is available
    if (context != null) {
      await _showRationaleDialog(
        context,
        'Terra Forest cần các quyền sau để hoạt động đầy đủ:\n\n'
        '• Vị trí: Theo dõi tuần tra và bản đồ\n'
        '• Camera: Chụp ảnh bằng chứng\n'
        '• Microphone: Ghi âm bằng chứng\n'
        '• Thông báo: Cảnh báo khẩn cấp\n'
        '• Bộ nhớ: Lưu dữ liệu ngoại tuyến',
        'Quyền ứng dụng',
      );
    }

    // Request location first (critical)
    results[Permission.location] = await requestLocationPermission();

    // Then request other permissions
    results[Permission.camera] = await requestCameraPermission();
    results[Permission.microphone] = await requestMicrophonePermission();
    results[Permission.notification] = await requestNotificationPermission();
    results[Permission.storage] = await requestStoragePermission();

    return results;
  }

  /// Request only critical permissions (location)
  Future<Map<Permission, PermissionStatus>> requestCriticalPermissions({
    BuildContext? context,
  }) async {
    final results = <Permission, PermissionStatus>{};

    if (context != null) {
      await _showRationaleDialog(
        context,
        PermissionRationale.location,
        'Quyền cần thiết',
      );
    }

    results[Permission.location] = await requestLocationPermission();

    return results;
  }

  // ---------------------------------------------------------------------------
  // Permission Checks
  // ---------------------------------------------------------------------------

  /// Check if all critical permissions are granted
  Future<bool> areCriticalPermissionsGranted() async {
    for (final permission in _criticalPermissions) {
      final status = await permission.status;
      if (!status.isGranted) {
        return false;
      }
    }
    return true;
  }

  /// Check if all app permissions are granted
  Future<bool> areAllPermissionsGranted() async {
    for (final permission in _allPermissions) {
      final status = await permission.status;
      if (!status.isGranted) {
        return false;
      }
    }
    return true;
  }

  /// Check all permissions and return detailed results
  Future<PermissionCheckResult> checkAllPermissions() async {
    final results = <Permission, PermissionStatus>{};

    for (final permission in _allPermissions) {
      results[permission] = await permission.status;
    }

    bool allCriticalGranted = true;
    for (final permission in _criticalPermissions) {
      if (!(results[permission]?.isGranted ?? false)) {
        allCriticalGranted = false;
        break;
      }
    }

    return PermissionCheckResult(
      results: results,
      allCriticalGranted: allCriticalGranted,
    );
  }

  /// Check a specific permission status
  Future<PermissionStatus> checkPermission(Permission permission) async {
    return permission.status;
  }

  /// Check if a specific permission is granted
  Future<bool> isPermissionGranted(Permission permission) async {
    final status = await permission.status;
    return status.isGranted;
  }

  /// Check if a specific permission is permanently denied
  Future<bool> isPermissionPermanentlyDenied(Permission permission) async {
    final status = await permission.status;
    return status.isPermanentlyDenied;
  }

  // ---------------------------------------------------------------------------
  // Permission Info
  // ---------------------------------------------------------------------------

  /// Get the Vietnamese rationale for a permission
  String getRationale(Permission permission) {
    return _rationales[permission] ?? 'Ứng dụng cần quyền này để hoạt động';
  }

  /// Get human-readable name for a permission in Vietnamese
  String getPermissionName(Permission permission) {
    if (permission == Permission.location) return 'Vị trí';
    if (permission == Permission.camera) return 'Camera';
    if (permission == Permission.microphone) return 'Microphone';
    if (permission == Permission.notification) return 'Thông báo';
    if (permission == Permission.storage) return 'Bộ nhớ';
    return permission.toString();
  }

  /// Get list of permissions that are not yet granted
  Future<List<Permission>> getMissingPermissions() async {
    final missing = <Permission>[];
    for (final permission in _allPermissions) {
      final status = await permission.status;
      if (!status.isGranted) {
        missing.add(permission);
      }
    }
    return missing;
  }

  /// Get list of permissions that are permanently denied
  Future<List<Permission>> getPermanentlyDeniedPermissions() async {
    final denied = <Permission>[];
    for (final permission in _allPermissions) {
      final status = await permission.status;
      if (status.isPermanentlyDenied) {
        denied.add(permission);
      }
    }
    return denied;
  }

  // ---------------------------------------------------------------------------
  // App Settings
  // ---------------------------------------------------------------------------

  /// Open app settings so user can manually grant denied permissions
  Future<bool> openPermissionSettings() async {
    return openAppSettings();
  }

  // ---------------------------------------------------------------------------
  // Rationale Dialog
  // ---------------------------------------------------------------------------

  Future<void> _showRationaleDialog(
    BuildContext context,
    String message,
    String title,
  ) async {
    return showDialog(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext ctx) {
        return AlertDialog(
          title: Text(title),
          content: Text(message),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(ctx).pop(),
              child: const Text('Hủy'),
            ),
            ElevatedButton(
              onPressed: () => Navigator.of(ctx).pop(),
              child: const Text('Tiếp tục'),
            ),
          ],
        );
      },
    );
  }

  // ---------------------------------------------------------------------------
  // Permission Status Description (Vietnamese)
  // ---------------------------------------------------------------------------

  /// Get Vietnamese description for a permission status
  String getStatusDescription(PermissionStatus status) {
    if (status.isGranted) {
      return 'Đã cấp quyền';
    } else if (status.isDenied) {
      return 'Chưa cấp quyền';
    } else if (status.isPermanentlyDenied) {
      return 'Đã từ chối vĩnh viễn - Vui lòng cấp quyền trong Cài đặt';
    } else if (status.isRestricted) {
      return 'Bị hạn chế';
    } else if (status.isLimited) {
      return 'Giới hạn';
    } else {
      return 'Không xác định';
    }
  }
}
