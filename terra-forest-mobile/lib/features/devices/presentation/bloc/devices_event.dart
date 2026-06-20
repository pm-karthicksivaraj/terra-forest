import 'package:equatable/equatable.dart';

abstract class DevicesEvent extends Equatable {
  const DevicesEvent();

  @override
  List<Object?> get props => [];
}

/// Load all registered devices
class LoadDevices extends DevicesEvent {
  const LoadDevices();
}

/// Refresh devices list (force API call when online)
class RefreshDevices extends DevicesEvent {
  const RefreshDevices();
}

/// Register a new device
class RegisterDevice extends DevicesEvent {
  final String name;
  final String platform;
  final String osVersion;

  const RegisterDevice({
    required this.name,
    required this.platform,
    required this.osVersion,
  });

  @override
  List<Object?> get props => [name, platform, osVersion];
}

/// Get detail for a specific device
class LoadDeviceDetail extends DevicesEvent {
  final String deviceId;

  const LoadDeviceDetail(this.deviceId);

  @override
  List<Object?> get props => [deviceId];
}

/// Filter devices by status: 'all', 'online', 'offline'
class FilterDevices extends DevicesEvent {
  final String statusFilter;

  const FilterDevices(this.statusFilter);

  @override
  List<Object?> get props => [statusFilter];
}
