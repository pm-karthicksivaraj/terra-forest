import '../entities/ranger_task.dart';

abstract class TaskRepository {
  Future<List<RangerTask>> getTasks({String? status, String? type, String? priority});
  Future<RangerTask> getTaskById(String id);
  Future<RangerTask> updateTaskStatus(String id, String status);
  Future<void> addProof(String taskId, Map<String, dynamic> proof);
  Future<void> syncPendingProofs();
}
