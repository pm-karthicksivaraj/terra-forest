import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:uuid/uuid.dart';

import '../../../../core/network/api_client.dart';
import '../../../../core/storage/local_database.dart';
import '../../../../core/storage/sync_manager.dart';

part 'devices_event.dart';
part 'devices_state.dart';

/// BLoC managing field devices (rangers' mobile devices and IoT sensors).
///
/// Loads devices from API when online, falls back to mock data for offline use.
/// Supports device registration, status filtering, and detail viewing.
/// New device registrations are saved locally and queued for sync.
class DevicesBloc extends Bloc<DevicesEvent, DevicesState> {
  final ApiClient _apiClient = ApiClient.instance;
  final LocalDatabase _localDb = LocalDatabase.instance;
  final SyncManager _syncManager = SyncManager.instance;
  final Uuid _uuid = const Uuid();

  DevicesBloc() : super(const DevicesInitial()) {
    on<LoadDevices>(_onLoadDevices);
    on<RefreshDevices>(_onRefreshDevices);
    on<RegisterDevice>(_onRegisterDevice);
    on<LoadDeviceDetail>(_onLoadDeviceDetail);
    on<FilterDevices>(_onFilterDevices);
  }

  Future<void> _onLoadDevices(
    LoadDevices event,
    Emitter<DevicesState> emit,
  ) async {
    emit(const DevicesLoading());
    try {
      final data = await _loadDevicesData();
      emit(data);
    } catch (e) {
      emit(DevicesError(message: 'Không thể tải danh sách thiết bị: $e'));
    }
  }

  Future<void> _onRefreshDevices(
    RefreshDevices event,
    Emitter<DevicesState> emit,
  ) async {
    try {
      final data = await _loadDevicesData(forceApi: true);
      final currentState = state;
      if (currentState is DevicesLoaded) {
        emit(currentState.copyWith(
          devices: data.devices,
          isOnline: data.isOnline,
        ));
      } else {
        emit(data);
      }
    } catch (e) {
      emit(DevicesError(message: 'Không thể làm mới: $e'));
    }
  }

  Future<void> _onRegisterDevice(
    RegisterDevice event,
    Emitter<DevicesState> emit,
  ) async {
    try {
      final deviceId = _uuid.v4();
      final now = DateTime.now().toUtc().toIso8601String();

      final device = {
        'id': deviceId,
        'name': event.name,
        'platform': event.platform,
        'os_version': event.osVersion,
        'app_version': '1.1.0',
        'status': 'offline',
        'last_active': now,
        'battery': 100,
        'last_plot': null,
      };

      // Save to local DB via app_settings for device tracking
      await _localDb.setSetting('device_$deviceId', device.toString());

      // Queue for sync to register on server
      await _syncManager.queueForSync(
        'devices',
        deviceId,
        'create',
        device,
      );

      emit(DeviceRegistered(deviceId));

      // Reload device list
      final data = await _loadDevicesData();
      emit(data);
    } catch (e) {
      emit(DevicesError(message: 'Không thể đăng ký thiết bị: $e'));
    }
  }

  Future<void> _onLoadDeviceDetail(
    LoadDeviceDetail event,
    Emitter<DevicesState> emit,
  ) async {
    try {
      // Try loading from current loaded state first
      Map<String, dynamic>? device;
      if (state is DevicesLoaded) {
        final devices = (state as DevicesLoaded).devices;
        try {
          device = devices.firstWhere((d) => d['id'] == event.deviceId);
        } catch (_) {}
      }

      // Try API for more detailed data
      if (device == null) {
        try {
          final isOnline = await _apiClient.isConnected();
          if (isOnline) {
            final response = await _apiClient.get('/api/v1/devices/${event.deviceId}');
            device = response.data as Map<String, dynamic>;
          }
        } catch (_) {}
      }

      // Try local DB for device locations
      List<Map<String, dynamic>> recentLocations = [];
      try {
        recentLocations = await _localDb.getDeviceLocations(
          deviceId: event.deviceId,
          limit: 20,
        );
      } catch (_) {}

      if (device != null) {
        emit(DeviceDetailLoaded(
          device: device,
          recentLocations: recentLocations,
        ));
      } else {
        emit(const DevicesError(message: 'Không tìm thấy thiết bị'));
      }
    } catch (e) {
      emit(DevicesError(message: 'Không thể tải chi tiết thiết bị: $e'));
    }
  }

  Future<void> _onFilterDevices(
    FilterDevices event,
    Emitter<DevicesState> emit,
  ) async {
    final currentState = state;
    if (currentState is DevicesLoaded) {
      emit(currentState.copyWith(statusFilter: event.statusFilter));
    }
  }

  /// Load devices data: try API first, then mock fallback
  Future<DevicesLoaded> _loadDevicesData({bool forceApi = false}) async {
    bool isOnline = false;

    try {
      isOnline = await _apiClient.isConnected();
    } catch (_) {}

    // Try API fetch when online
    if (isOnline || forceApi) {
      try {
        final response = await _apiClient.get('/api/v1/devices');
        final data = response.data as List<dynamic>;
        final devices = data.map((e) => e as Map<String, dynamic>).toList();
        if (devices.isNotEmpty) {
          return DevicesLoaded(devices: devices, isOnline: isOnline);
        }
      } catch (_) {
        // API failed, continue with mock
      }
    }

    // Mock data fallback
    return DevicesLoaded(
      devices: _getMockDevices(),
      isOnline: isOnline,
    );
  }

  /// Mock device data representing ranger devices in the field
  static List<Map<String, dynamic>> _getMockDevices() {
    return [
      {
        'id': 'device_001',
        'name': 'Kiểm lâm Nguyễn Văn A',
        'platform': 'Android',
        'os_version': 'Android 14',
        'app_version': '1.1.0',
        'status': 'online',
        'last_active': '5 phút trước',
        'battery': 78,
        'last_plot': 'BP-001',
      },
      {
        'id': 'device_002',
        'name': 'Kiểm lâm Trần Thị B',
        'platform': 'Android',
        'os_version': 'Android 13',
        'app_version': '1.1.0',
        'status': 'online',
        'last_active': '12 phút trước',
        'battery': 45,
        'last_plot': 'DN-003',
      },
      {
        'id': 'device_003',
        'name': 'Trưởng nhóm Lê Văn C',
        'platform': 'iOS',
        'os_version': 'iOS 17.3',
        'app_version': '1.1.0',
        'status': 'offline',
        'last_active': '2 giờ trước',
        'battery': 15,
        'last_plot': 'LD-002',
      },
      {
        'id': 'device_004',
        'name': 'Kiểm lâm Phạm Văn D',
        'platform': 'Android',
        'os_version': 'Android 14',
        'app_version': '1.0.9',
        'status': 'offline',
        'last_active': '1 ngày trước',
        'battery': 5,
        'last_plot': 'CM-001',
      },
    ];
  }
}
