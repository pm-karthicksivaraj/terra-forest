import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../domain/entities/ranger_task.dart';
import '../../domain/repositories/task_repository.dart';
import '../../data/repositories/task_repository_impl.dart';
import '../../../../core/constants/app_constants.dart';

part 'tasks_event.dart';
part 'tasks_state.dart';

class TasksBloc extends Bloc<TasksEvent, TasksState> {
  final TaskRepository _taskRepository = TaskRepositoryImpl();

  TasksBloc() : super(TasksInitial()) {
    on<LoadTasks>(_onLoadTasks);
    on<FilterTasks>(_onFilterTasks);
    on<UpdateTaskStatus>(_onUpdateTaskStatus);
    on<UploadProof>(_onUploadProof);
    on<StartTask>(_onStartTask);
    on<CompleteTask>(_onCompleteTask);
  }

  Future<void> _onLoadTasks(
    LoadTasks event,
    Emitter<TasksState> emit,
  ) async {
    emit(TasksLoading());
    try {
      final tasks = await _taskRepository.getTasks();
      if (tasks.isEmpty) {
        emit(TasksLoaded(tasks: _getMockTasks()));
      } else {
        emit(TasksLoaded(tasks: tasks));
      }
    } catch (e) {
      emit(TasksLoaded(tasks: _getMockTasks()));
    }
  }

  Future<void> _onFilterTasks(
    FilterTasks event,
    Emitter<TasksState> emit,
  ) async {
    final currentState = state;
    if (currentState is TasksLoaded) {
      emit(TasksLoaded(
        tasks: currentState.tasks,
        filterStatus: event.status,
        filterType: event.type,
      ));
    }
  }

  Future<void> _onUpdateTaskStatus(
    UpdateTaskStatus event,
    Emitter<TasksState> emit,
  ) async {
    final currentState = state;
    if (currentState is TasksLoaded) {
      try {
        await _taskRepository.updateTaskStatus(event.id, event.status);
        final updatedTasks = currentState.tasks.map((task) {
          if (task.id == event.id) {
            return task.copyWith(status: event.status);
          }
          return task;
        }).toList();
        emit(TasksLoaded(
          tasks: updatedTasks,
          filterStatus: currentState.filterStatus,
          filterType: currentState.filterType,
        ));
      } catch (e) {
        emit(TasksError(message: 'Không thể cập nhật trạng thái: $e'));
        emit(currentState);
      }
    }
  }

  Future<void> _onUploadProof(
    UploadProof event,
    Emitter<TasksState> emit,
  ) async {
    try {
      await _taskRepository.addProof(event.taskId, event.proof);
    } catch (_) {}
  }

  Future<void> _onStartTask(
    StartTask event,
    Emitter<TasksState> emit,
  ) async {
    add(UpdateTaskStatus(id: event.id, status: 'in_progress'));
  }

  Future<void> _onCompleteTask(
    CompleteTask event,
    Emitter<TasksState> emit,
  ) async {
    add(UpdateTaskStatus(id: event.id, status: 'completed'));
  }

  List<RangerTask> _getMockTasks() {
    final now = DateTime.now();
    return [
      RangerTask(
        id: 'task_001',
        title: 'Tuần tra lô BP-001',
        description: 'Kiểm tra tình trạng rừng tại lô BP-001, khu vực Bình Phước',
        taskType: AppConstants.taskPatrol,
        priority: AppConstants.severityHigh,
        status: 'assigned',
        dueDate: now.add(const Duration(days: 1)),
        assignedTo: 'user_003',
        locationLat: 11.5,
        locationLng: 106.9,
        createdBy: 'user_001',
      ),
      RangerTask(
        id: 'task_002',
        title: 'Kiểm tra cháy rừng khu vực Đắk Nông',
        description: 'Kiểm tra và báo cáo tình trạng cháy rừng tại lô DN-003',
        taskType: AppConstants.taskFireCheck,
        priority: AppConstants.severityCritical,
        status: 'in_progress',
        dueDate: now.add(const Duration(hours: 6)),
        assignedTo: 'user_004',
        locationLat: 12.0,
        locationLng: 107.5,
        createdBy: 'user_001',
      ),
      RangerTask(
        id: 'task_003',
        title: 'Quan sát đa dạng sinh học LD-002',
        description: 'Ghi nhận và báo cáo các loài động thực vật tại lô LD-002',
        taskType: AppConstants.taskObservation,
        priority: AppConstants.severityMedium,
        status: 'assigned',
        dueDate: now.add(const Duration(days: 3)),
        assignedTo: 'user_005',
        locationLat: 11.9,
        locationLng: 108.4,
        createdBy: 'user_002',
      ),
      RangerTask(
        id: 'task_004',
        title: 'Khảo sát ranh giới lô CM-001',
        description: 'Xác minh ranh giới lô rừng CM-001, Cà Mau',
        taskType: AppConstants.taskBoundarySurvey,
        priority: AppConstants.severityLow,
        status: 'completed',
        dueDate: now.subtract(const Duration(days: 1)),
        assignedTo: 'user_003',
        locationLat: 9.2,
        locationLng: 105.1,
        createdBy: 'user_001',
      ),
      RangerTask(
        id: 'task_005',
        title: 'Thu thập bằng chứng phá rừng',
        description: 'Chụp ảnh và ghi nhận hiện trường phá rừng tại khu vực lô DL-004',
        taskType: AppConstants.taskEvidenceCollection,
        priority: AppConstants.severityHigh,
        status: 'verified',
        dueDate: now.subtract(const Duration(days: 2)),
        assignedTo: 'user_004',
        locationLat: 12.7,
        locationLng: 108.0,
        createdBy: 'user_002',
      ),
      RangerTask(
        id: 'task_006',
        title: 'Đếm loài chim trú đông',
        description: 'Đếm và phân loại các loài chim trú đông tại khu vực Đắk Lắk',
        taskType: AppConstants.taskSpeciesCount,
        priority: AppConstants.severityMedium,
        status: 'in_progress',
        dueDate: now.add(const Duration(days: 5)),
        assignedTo: 'user_005',
        locationLat: 12.7,
        locationLng: 108.0,
        createdBy: 'user_001',
      ),
    ];
  }
}
