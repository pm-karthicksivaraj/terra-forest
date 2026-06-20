import '../../../../core/storage/local_database.dart';

class TaskLocalDatasource {
  final LocalDatabase _localDb = LocalDatabase.instance;

  Future<List<Map<String, dynamic>>> getTasks({
    String? status,
    String? type,
    String? priority,
  }) async {
    final conditions = <String>[];
    final args = <Object?>[];

    if (status != null && status.isNotEmpty) {
      conditions.add('status = ?');
      args.add(status);
    }
    if (type != null && type.isNotEmpty) {
      conditions.add('task_type = ?');
      args.add(type);
    }
    if (priority != null && priority.isNotEmpty) {
      conditions.add('priority = ?');
      args.add(priority);
    }

    final whereClause = conditions.isNotEmpty ? conditions.join(' AND ') : null;
    return _localDb.query(
      'ranger_tasks',
      where: whereClause,
      whereArgs: args.isNotEmpty ? args : null,
      orderBy: 'due_date ASC',
    );
  }

  Future<Map<String, dynamic>?> getTaskById(String id) async {
    final results = await _localDb.query(
      'ranger_tasks',
      where: 'id = ?',
      whereArgs: [id],
    );
    return results.isNotEmpty ? results.first : null;
  }

  Future<void> insertTask(Map<String, dynamic> task) async {
    await _localDb.upsertRangerTask(task);
  }

  Future<void> updateTask(Map<String, dynamic> task) async {
    await _localDb.updateRangerTask(task);
  }

  Future<void> updateTaskStatus(String id, String status) async {
    await _localDb.update(
      'ranger_tasks',
      {'status': status, 'sync_status': 'pending'},
      'id = ?',
      [id],
    );
  }

  Future<void> deleteTask(String id) async {
    await _localDb.deleteRangerTask(id);
  }

  Future<List<Map<String, dynamic>>> getPendingTasks() async {
    return _localDb.query(
      'ranger_tasks',
      where: 'sync_status = ?',
      whereArgs: ['pending'],
      orderBy: 'due_date ASC',
    );
  }

  Future<void> markTaskSynced(String id) async {
    await _localDb.update(
      'ranger_tasks',
      {'sync_status': 'synced'},
      'id = ?',
      [id],
    );
  }
}
