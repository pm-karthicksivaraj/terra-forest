import 'package:equatable/equatable.dart';

abstract class DevicesState extends Equatable {
  const DevicesState();

  @override
  List<Object?> get props => [];
}

class DevicesInitial extends DevicesState {
  const DevicesInitial();
}

class DevicesLoading extends DevicesState {
  const DevicesLoading();
}

class DevicesLoaded extends DevicesState {
  final List<Map<String, dynamic>> devices;
  final String statusFilter;
  final bool isOnline;

  const DevicesLoaded({
    required this.devices,
    this.statusFilter = 'all',
    this.isOnline = true,
  });

  /// Apply client-side filtering
  List<Map<String, dynamic>> get filteredDevices {
    if (statusFilter == 'all') return devices;
    return devices.where((d) => d['status'] == statusFilter).toList();
  }

  /// Count of online devices
  int get onlineCount => devices.where((d) => d['status'] == 'online').length;

  /// Count of offline devices
  int get offlineCount => devices.where((d) => d['status'] == 'offline').length;

  /// Average battery across all devices
  double get avgBattery {
    if (devices.isEmpty) return 0;
    return devices.map((d) => (d['battery'] as num?)?.toDouble() ?? 0).reduce((a, b) => a + b) / devices.length;
  }

  DevicesLoaded copyWith({
    List<Map<String, dynamic>>? devices,
    String? statusFilter,
    bool? isOnline,
  }) {
    return DevicesLoaded(
      devices: devices ?? this.devices,
      statusFilter: statusFilter ?? this.statusFilter,
      isOnline: isOnline ?? this.isOnline,
    );
  }

  @override
  List<Object?> get props => [devices, statusFilter, isOnline];
}

class DeviceDetailLoaded extends DevicesState {
  final Map<String, dynamic> device;
  final List<Map<String, dynamic>> recentLocations;

  const DeviceDetailLoaded({
    required this.device,
    this.recentLocations = const [],
  });

  @override
  List<Object?> get props => [device, recentLocations];
}

class DevicesError extends DevicesState {
  final String message;

  const DevicesError({required this.message});

  @override
  List<Object?> get props => [message];
}

class DeviceRegistered extends DevicesState {
  final String deviceId;

  const DeviceRegistered(this.deviceId);

  @override
  List<Object?> get props => [deviceId];
}
