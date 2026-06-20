part of 'alerts_bloc.dart';

abstract class AlertsEvent extends Equatable {
  const AlertsEvent();

  @override
  List<Object?> get props => [];
}

class LoadAlerts extends AlertsEvent {
  const LoadAlerts();
}

class FilterAlerts extends AlertsEvent {
  final String? type;
  final String? severity;
  final String? status;

  const FilterAlerts({this.type, this.severity, this.status});

  @override
  List<Object?> get props => [type, severity, status];
}

class AcknowledgeAlert extends AlertsEvent {
  final String id;

  const AcknowledgeAlert({required this.id});

  @override
  List<Object?> get props => [id];
}

class RefreshAlerts extends AlertsEvent {
  const RefreshAlerts();
}

class AlertReceived extends AlertsEvent {
  final Map<String, dynamic> alert;

  const AlertReceived({required this.alert});

  @override
  List<Object?> get props => [alert];
}
