part of 'tasks_bloc.dart';

abstract class TasksState extends Equatable {
  const TasksState();

  @override
  List<Object?> get props => [];
}

class TasksInitial extends TasksState {}

class TasksLoading extends TasksState {}

class TasksLoaded extends TasksState {
  final List<RangerTask> tasks;
  final String? filterStatus;
  final String? filterType;

  const TasksLoaded({
    required this.tasks,
    this.filterStatus,
    this.filterType,
  });

  List<RangerTask> get filteredTasks {
    var result = tasks;
    if (filterStatus != null && filterStatus!.isNotEmpty) {
      result = result.where((t) => t.status == filterStatus).toList();
    }
    if (filterType != null && filterType!.isNotEmpty) {
      result = result.where((t) => t.taskType == filterType).toList();
    }
    return result;
  }

  @override
  List<Object?> get props => [tasks, filterStatus, filterType];
}

class TasksError extends TasksState {
  final String message;

  const TasksError({required this.message});

  @override
  List<Object?> get props => [message];
}
