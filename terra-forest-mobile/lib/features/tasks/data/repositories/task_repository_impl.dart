import '../../domain/entities/ranger_task.dart';
import '../../domain/repositories/task_repository.dart';
import '../datasources/task_remote_datasource.dart';
import '../datasources/task_local_datasource.dart';

class TaskRepositoryImpl implements TaskRepository {
  final TaskRemoteDatasource _remoteDs = TaskRemoteDatasource();
  final TaskLocalDatasource _localDs = TaskLocalDatasource();

  @override
  Future<List<RangerTask>> getTasks({
    String? status,
    String? type,
    String? priority,
  }) async {
    try {
      final remoteTasks = await _remoteDs.getTasks(
        status: status,
        type: type,
        priority: priority,
      );
      for (final task in remoteTasks) {
        await _localDs.insertTask(task);
      }
      return remoteTasks.map((e) => RangerTask.fromJson(e)).toList();
    } catch (_) {
      final localTasks = await _localDs.getTasks(
        status: status,
        type: type,
        priority: priority,
      );
      return localTasks.map((e) => RangerTask.fromJson(e)).toList();
    }
  }

  @override
  Future<RangerTask> getTaskById(String id) async {
    try {
      final remoteTask = await _remoteDs.getTaskById(id);
      await _localDs.insertTask(remoteTask);
      return RangerTask.fromJson(remoteTask);
    } catch (_) {
      final localTask = await _localDs.getTaskById(id);
      if (localTask != null) {
        return RangerTask.fromJson(localTask);
      }
      throw Exception('Không tìm thấy nhiệm vụ');
    }
  }

  @override
  Future<RangerTask> updateTaskStatus(String id, String status) async {
    await _localDs.updateTaskStatus(id, status);
    try {
      final remoteResult = await _remoteDs.updateTaskStatus(id, status);
      await _localDs.insertTask(remoteResult);
      return RangerTask.fromJson(remoteResult);
    } catch (_) {
      final localTask = await _localDs.getTaskById(id);
      if (localTask != null) {
        return RangerTask.fromJson(localTask);
      }
      throw Exception('Không thể cập nhật trạng thái nhiệm vụ');
    }
  }

  @override
  Future<void> addProof(String taskId, Map<String, dynamic> proof) async {
    try {
      await _remoteDs.addProof(taskId, proof);
    } catch (_) {
      await _localDs.updateTask({
        'id': taskId,
        'sync_status': 'pending',
      });
    }
  }

  @override
  Future<void> syncPendingProofs() async {
    final pendingTasks = await _localDs.getPendingTasks();
    for (final task in pendingTasks) {
      try {
        final result = await _remoteDs.updateTaskStatus(
          task['id'] as String,
          task['status'] as String,
        );
        await _localDs.insertTask(result);
        await _localDs.markTaskSynced(task['id'] as String);
      } catch (_) {
        continue;
      }
    }
  }
}
