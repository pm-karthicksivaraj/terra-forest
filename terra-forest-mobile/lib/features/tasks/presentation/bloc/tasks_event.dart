part of 'tasks_bloc.dart';

abstract class TasksEvent extends Equatable {
  const TasksEvent();

  @override
  List<Object?> get props => [];
}

class LoadTasks extends TasksEvent {
  const LoadTasks();
}

class FilterTasks extends TasksEvent {
  final String? status;
  final String? type;
  final String? priority;

  const FilterTasks({this.status, this.type, this.priority});

  @override
  List<Object?> get props => [status, type, priority];
}

class UpdateTaskStatus extends TasksEvent {
  final String id;
  final String status;

  const UpdateTaskStatus({required this.id, required this.status});

  @override
  List<Object?> get props => [id, status];
}

class UploadProof extends TasksEvent {
  final String taskId;
  final Map<String, dynamic> proof;

  const UploadProof({required this.taskId, required this.proof});

  @override
  List<Object?> get props => [taskId, proof];
}

class StartTask extends TasksEvent {
  final String id;

  const StartTask({required this.id});

  @override
  List<Object?> get props => [id];
}

class CompleteTask extends TasksEvent {
  final String id;

  const CompleteTask({required this.id});

  @override
  List<Object?> get props => [id];
}
