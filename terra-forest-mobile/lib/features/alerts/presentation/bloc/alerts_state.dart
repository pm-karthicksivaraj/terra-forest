part of 'alerts_bloc.dart';

abstract class AlertsState extends Equatable {
  const AlertsState();

  @override
  List<Object?> get props => [];
}

class AlertsInitial extends AlertsState {}

class AlertsLoading extends AlertsState {}

class AlertsLoaded extends AlertsState {
  final List<Map<String, dynamic>> alerts;
  final String? filterType;
  final String? filterSeverity;
  final String? filterStatus;

  const AlertsLoaded({
    required this.alerts,
    this.filterType,
    this.filterSeverity,
    this.filterStatus,
  });

  List<Map<String, dynamic>> get filteredAlerts {
    var result = alerts;
    if (filterType != null && filterType!.isNotEmpty) {
      result = result.where((a) => a['alert_type'] == filterType).toList();
    }
    if (filterSeverity != null && filterSeverity!.isNotEmpty) {
      result = result.where((a) => a['severity'] == filterSeverity).toList();
    }
    if (filterStatus != null && filterStatus!.isNotEmpty) {
      result = result.where((a) => a['status'] == filterStatus).toList();
    }
    return result;
  }

  @override
  List<Object?> get props => [alerts, filterType, filterSeverity, filterStatus];
}

class AlertsError extends AlertsState {
  final String message;

  const AlertsError({required this.message});

  @override
  List<Object?> get props => [message];
}
