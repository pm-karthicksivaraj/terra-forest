part of 'home_bloc.dart';

abstract class HomeEvent extends Equatable {
  const HomeEvent();

  @override
  List<Object?> get props => [];
}

/// Initial load of the home dashboard data.
class HomeLoadRequested extends HomeEvent {}

/// Pull-to-refresh of the home dashboard.
class RefreshHome extends HomeEvent {}

/// Navigate to a specific alert.
class NavigateToAlert extends HomeEvent {
  final String alertId;

  const NavigateToAlert({required this.alertId});

  @override
  List<Object?> get props => [alertId];
}

/// Navigate to a specific task.
class NavigateToTask extends HomeEvent {
  final String taskId;

  const NavigateToTask({required this.taskId});

  @override
  List<Object?> get props => [taskId];
}

/// User requested a manual sync.
class SyncRequested extends HomeEvent {}
