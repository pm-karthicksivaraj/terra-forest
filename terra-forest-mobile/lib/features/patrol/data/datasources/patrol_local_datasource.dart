import 'package:terra_forest_mobile/core/storage/local_database.dart';
import 'package:terra_forest_mobile/features/patrol/domain/entities/patrol.dart';
import 'package:terra_forest_mobile/features/patrol/domain/entities/observation.dart';

/// Local data source for patrol-related SQLite operations.
///
/// Uses the shared [LocalDatabase] singleton for all CRUD and query
/// operations. Supports querying pending items for sync and searching
/// by date range.
class PatrolLocalDatasource {
  final LocalDatabase _db;

  PatrolLocalDatasource(this._db);

  // ─── Patrols ─────────────────────────────────────────────────────────────

  /// Insert a new patrol into the local database.
  Future<void> insertPatrol(Patrol patrol) async {
    await _db.upsertPatrol(patrol.toJson());
  }

  /// Get a single patrol by its ID.
  Future<Patrol?> getPatrolById(String id) async {
    final row = await _db.getPatrolById(id);
    if (row == null) return null;
    return Patrol.fromJson(row);
  }

  /// Get all patrols, ordered by creation date descending.
  Future<List<Patrol>> getAllPatrols() async {
    final rows = await _db.getAllPatrols();
    return rows.map((r) => Patrol.fromJson(r)).toList();
  }

  /// Get patrols filtered by status.
  Future<List<Patrol>> getPatrolsByStatus(PatrolStatus status) async {
    final rows = await _db.getPatrolsByStatus(status.apiValue);
    return rows.map((r) => Patrol.fromJson(r)).toList();
  }

  /// Get patrols assigned to a specific leader.
  Future<List<Patrol>> getPatrolsByLeader(String leaderId) async {
    final rows = await _db.getPatrolsByLeader(leaderId);
    return rows.map((r) => Patrol.fromJson(r)).toList();
  }

  /// Update an existing patrol in the local database.
  Future<void> updatePatrol(Patrol patrol) async {
    await _db.upsertPatrol(patrol.toJson());
  }

  /// Delete a patrol from the local database.
  Future<void> deletePatrol(String id) async {
    await _db.deletePatrol(id);
  }

  /// Get patrols with pending sync status.
  Future<List<Patrol>> getPendingPatrols() async {
    final rows = await _db.getPendingPatrols();
    return rows.map((r) => Patrol.fromJson(r)).toList();
  }

  /// Search patrols by date range.
  Future<List<Patrol>> searchPatrolsByDateRange(
    DateTime startDate,
    DateTime endDate,
  ) async {
    final rows = await _db.query(
      'patrols',
      where: 'start_time >= ? AND start_time <= ?',
      whereArgs: [
        startDate.toIso8601String(),
        endDate.toIso8601String(),
      ],
      orderBy: 'start_time DESC',
    );
    return rows.map((r) => Patrol.fromJson(r)).toList();
  }

  /// Mark a patrol as synced in the local database.
  Future<void> markPatrolSynced(String id) async {
    await _db.markPatrolSynced(id);
  }

  // ─── Patrol Members ──────────────────────────────────────────────────────

  /// Insert a patrol member.
  Future<void> insertPatrolMember(Map<String, dynamic> member) async {
    await _db.upsertPatrolMember(member);
  }

  /// Get all members of a patrol.
  Future<List<Map<String, dynamic>>> getMembersByPatrol(String patrolId) async {
    return _db.getMembersByPatrol(patrolId);
  }

  // ─── Observations ────────────────────────────────────────────────────────

  /// Insert a new observation into the local database.
  Future<void> insertObservation(Observation observation) async {
    await _db.upsertObservation(observation.toJson());
  }

  /// Get all observations for a patrol.
  Future<List<Observation>> getObservationsByPatrol(String patrolId) async {
    final rows = await _db.getObservationsByPatrol(patrolId);
    return rows.map((r) => Observation.fromJson(r)).toList();
  }

  /// Get a single observation by ID.
  Future<Observation?> getObservationById(String id) async {
    final row = await _db.getObservationById(id);
    if (row == null) return null;
    return Observation.fromJson(row);
  }

  /// Update an existing observation.
  Future<void> updateObservation(Observation observation) async {
    await _db.upsertObservation(observation.toJson());
  }

  /// Delete an observation.
  Future<void> deleteObservation(String id) async {
    await _db.deleteObservation(id);
  }

  /// Get observations with pending sync status.
  Future<List<Observation>> getPendingObservations() async {
    final rows = await _db.getPendingObservations();
    return rows.map((r) => Observation.fromJson(r)).toList();
  }

  /// Search observations by date range and optional type filter.
  Future<List<Observation>> searchObservations({
    String? obsType,
    DateTime? startDate,
    DateTime? endDate,
    int? limit,
  }) async {
    final rows = await _db.searchObservations(
      obsType: obsType,
      startDate: startDate?.toIso8601String(),
      endDate: endDate?.toIso8601String(),
      limit: limit,
    );
    return rows.map((r) => Observation.fromJson(r)).toList();
  }

  /// Mark an observation as synced in the local database.
  Future<void> markObservationSynced(String id) async {
    await _db.markObservationSynced(id);
  }

  // ─── Sync Queue ──────────────────────────────────────────────────────────

  /// Queue a patrol for sync.
  Future<void> queuePatrolForSync(Patrol patrol) async {
    await _db.insertSyncQueueItem({
      'id': 'sync_${patrol.id}_${DateTime.now().millisecondsSinceEpoch}',
      'entity_type': 'patrols',
      'entity_id': patrol.id,
      'action': 'create',
      'payload_json': '{}',
      'attempts': 0,
      'max_attempts': 3,
      'last_error': null,
      'created_at': DateTime.now().toUtc().toIso8601String(),
      'next_retry_at': DateTime.now().toUtc().toIso8601String(),
    });
  }

  /// Queue an observation for sync.
  Future<void> queueObservationForSync(Observation observation) async {
    await _db.insertSyncQueueItem({
      'id': 'sync_${observation.id}_${DateTime.now().millisecondsSinceEpoch}',
      'entity_type': 'field_observations',
      'entity_id': observation.id,
      'action': 'create',
      'payload_json': '{}',
      'attempts': 0,
      'max_attempts': 3,
      'last_error': null,
      'created_at': DateTime.now().toUtc().toIso8601String(),
      'next_retry_at': DateTime.now().toUtc().toIso8601String(),
    });
  }
}
