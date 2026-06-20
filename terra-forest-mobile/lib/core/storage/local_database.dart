import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart' as p;

/// Local SQLite database for Terra Forest MRV offline-first architecture.
/// Provides CRUD, bulk sync, and query methods for all entities.
class LocalDatabase {
  static const String _dbName = 'terra_forest.db';
  static const int _dbVersion = 1;

  static LocalDatabase? _instance;
  Database? _database;

  LocalDatabase._();

  static LocalDatabase get instance {
    _instance ??= LocalDatabase._();
    return _instance!;
  }

  Future<Database> get database async {
    _database ??= await _initDatabase();
    return _database!;
  }

  // ---------------------------------------------------------------------------
  // Initialization & Migration
  // ---------------------------------------------------------------------------

  Future<Database> _initDatabase() async {
    final dbPath = await getDatabasesPath();
    final path = p.join(dbPath, _dbName);

    return openDatabase(
      path,
      version: _dbVersion,
      onCreate: _onCreate,
      onUpgrade: _onUpgrade,
    );
  }

  Future<void> _onCreate(Database db, int version) async {
    await db.execute('''
      CREATE TABLE users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        avatar_url TEXT,
        roles_json TEXT,
        province_id TEXT,
        is_active INTEGER NOT NULL DEFAULT 1,
        last_synced TEXT
      )
    ''');

    await db.execute('''
      CREATE TABLE patrols (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        leader_id TEXT,
        plot_id TEXT,
        start_time TEXT,
        end_time TEXT,
        status TEXT NOT NULL DEFAULT 'planned',
        route_geojson TEXT,
        sync_status TEXT NOT NULL DEFAULT 'synced',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    ''');

    await db.execute('''
      CREATE TABLE patrol_members (
        id TEXT PRIMARY KEY,
        patrol_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'member',
        joined_at TEXT NOT NULL
      )
    ''');

    await db.execute('''
      CREATE TABLE field_observations (
        id TEXT PRIMARY KEY,
        patrol_id TEXT NOT NULL,
        obs_type TEXT NOT NULL,
        description TEXT,
        photo_path TEXT,
        latitude REAL,
        longitude REAL,
        accuracy REAL,
        recorded_at TEXT NOT NULL,
        sync_status TEXT NOT NULL DEFAULT 'pending'
      )
    ''');

    await db.execute('''
      CREATE TABLE task_proofs (
        id TEXT PRIMARY KEY,
        task_id TEXT NOT NULL,
        uploaded_by TEXT NOT NULL,
        proof_type TEXT NOT NULL,
        file_path TEXT NOT NULL,
        file_size INTEGER,
        mime_type TEXT,
        thumbnail_path TEXT,
        duration_secs INTEGER,
        latitude REAL,
        longitude REAL,
        description TEXT,
        metadata_json TEXT,
        recorded_at TEXT NOT NULL,
        sync_status TEXT NOT NULL DEFAULT 'pending'
      )
    ''');

    await db.execute('''
      CREATE TABLE ranger_tasks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        team_id TEXT,
        assigned_to TEXT,
        task_type TEXT,
        priority TEXT NOT NULL DEFAULT 'medium',
        status TEXT NOT NULL DEFAULT 'assigned',
        due_date TEXT,
        location_lat REAL,
        location_lng REAL,
        location_geojson TEXT,
        created_by TEXT,
        sync_status TEXT NOT NULL DEFAULT 'synced'
      )
    ''');

    await db.execute('''
      CREATE TABLE alerts (
        id TEXT PRIMARY KEY,
        plot_id TEXT,
        alert_type TEXT NOT NULL,
        severity TEXT NOT NULL DEFAULT 'info',
        status TEXT NOT NULL DEFAULT 'active',
        message TEXT,
        message_vi TEXT,
        detected_at TEXT NOT NULL,
        acknowledged_by TEXT,
        acknowledged_at TEXT,
        sync_status TEXT NOT NULL DEFAULT 'synced'
      )
    ''');

    await db.execute('''
      CREATE TABLE forest_plots (
        id TEXT PRIMARY KEY,
        plot_code TEXT NOT NULL,
        province_id TEXT,
        area_ha REAL,
        forest_type TEXT,
        status TEXT NOT NULL DEFAULT 'active',
        centroid_lat REAL,
        centroid_lng REAL,
        fire_risk TEXT,
        geometry_json TEXT,
        sync_status TEXT NOT NULL DEFAULT 'synced'
      )
    ''');

    await db.execute('''
      CREATE TABLE geofences (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        name_vi TEXT,
        type TEXT NOT NULL,
        geometry_json TEXT NOT NULL,
        center_lat REAL,
        center_lng REAL,
        radius_m REAL,
        is_active INTEGER NOT NULL DEFAULT 1,
        color TEXT,
        created_at TEXT NOT NULL
      )
    ''');

    await db.execute('''
      CREATE TABLE device_locations (
        id TEXT PRIMARY KEY,
        device_id TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        accuracy_m REAL,
        altitude_m REAL,
        speed_kph REAL,
        bearing REAL,
        battery_pct INTEGER,
        recorded_at TEXT NOT NULL,
        sync_status TEXT NOT NULL DEFAULT 'pending'
      )
    ''');

    await db.execute('''
      CREATE TABLE sync_queue (
        id TEXT PRIMARY KEY,
        entity_type TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        action TEXT NOT NULL,
        payload_json TEXT NOT NULL,
        attempts INTEGER NOT NULL DEFAULT 0,
        max_attempts INTEGER NOT NULL DEFAULT 3,
        last_error TEXT,
        created_at TEXT NOT NULL,
        next_retry_at TEXT NOT NULL
      )
    ''');

    await db.execute('''
      CREATE TABLE app_settings (
        key TEXT PRIMARY KEY,
        value TEXT
      )
    ''');

    // Create indexes for common queries
    await db.execute(
        'CREATE INDEX idx_patrols_sync_status ON patrols(sync_status)');
    await db.execute(
        'CREATE INDEX idx_patrols_leader_id ON patrols(leader_id)');
    await db.execute(
        'CREATE INDEX idx_patrol_members_patrol_id ON patrol_members(patrol_id)');
    await db.execute(
        'CREATE INDEX idx_field_observations_patrol_id ON field_observations(patrol_id)');
    await db.execute(
        'CREATE INDEX idx_field_observations_sync_status ON field_observations(sync_status)');
    await db.execute(
        'CREATE INDEX idx_field_observations_obs_type ON field_observations(obs_type)');
    await db.execute(
        'CREATE INDEX idx_field_observations_recorded_at ON field_observations(recorded_at)');
    await db.execute(
        'CREATE INDEX idx_task_proofs_task_id ON task_proofs(task_id)');
    await db.execute(
        'CREATE INDEX idx_task_proofs_sync_status ON task_proofs(sync_status)');
    await db.execute(
        'CREATE INDEX idx_ranger_tasks_assigned_to ON ranger_tasks(assigned_to)');
    await db.execute(
        'CREATE INDEX idx_ranger_tasks_sync_status ON ranger_tasks(sync_status)');
    await db.execute('CREATE INDEX idx_alerts_status ON alerts(status)');
    await db.execute(
        'CREATE INDEX idx_alerts_sync_status ON alerts(sync_status)');
    await db.execute(
        'CREATE INDEX idx_forest_plots_province_id ON forest_plots(province_id)');
    await db.execute(
        'CREATE INDEX idx_device_locations_device_id ON device_locations(device_id)');
    await db.execute(
        'CREATE INDEX idx_device_locations_sync_status ON device_locations(sync_status)');
    await db.execute(
        'CREATE INDEX idx_device_locations_recorded_at ON device_locations(recorded_at)');
    await db.execute(
        'CREATE INDEX idx_sync_queue_entity ON sync_queue(entity_type, entity_id)');
    await db.execute(
        'CREATE INDEX idx_sync_queue_next_retry ON sync_queue(next_retry_at)');
    await db.execute(
        'CREATE INDEX idx_geofences_is_active ON geofences(is_active)');
  }

  Future<void> _onUpgrade(Database db, int oldVersion, int newVersion) async {
    // Future migration logic goes here
    // For now, only version 1 exists
    if (oldVersion < 2) {
      // Example future migration:
      // await db.execute('ALTER TABLE users ADD COLUMN phone TEXT');
    }
  }

  // ---------------------------------------------------------------------------
  // Generic Helpers
  // ---------------------------------------------------------------------------

  Future<int> insert(String table, Map<String, dynamic> values) async {
    final db = await database;
    return db.insert(table, values);
  }

  Future<int> update(
    String table,
    Map<String, dynamic> values,
    String where,
    List<Object?> whereArgs,
  ) async {
    final db = await database;
    return db.update(table, values, where: where, whereArgs: whereArgs);
  }

  Future<int> delete(
    String table,
    String where,
    List<Object?> whereArgs,
  ) async {
    final db = await database;
    return db.delete(table, where: where, whereArgs: whereArgs);
  }

  Future<List<Map<String, dynamic>>> query(
    String table, {
    bool? distinct,
    List<String>? columns,
    String? where,
    List<Object?>? whereArgs,
    String? groupBy,
    String? having,
    String? orderBy,
    int? limit,
    int? offset,
  }) async {
    final db = await database;
    return db.query(
      table,
      distinct: distinct,
      columns: columns,
      where: where,
      whereArgs: whereArgs,
      groupBy: groupBy,
      having: having,
      orderBy: orderBy,
      limit: limit,
      offset: offset,
    );
  }

  // ---------------------------------------------------------------------------
  // Users CRUD
  // ---------------------------------------------------------------------------

  Future<void> insertUser(Map<String, dynamic> user) async {
    await insert('users', user);
  }

  Future<Map<String, dynamic>?> getUserById(String id) async {
    final results = await query('users', where: 'id = ?', whereArgs: [id]);
    return results.isNotEmpty ? results.first : null;
  }

  Future<List<Map<String, dynamic>>> getAllUsers() async {
    return query('users', orderBy: 'name ASC');
  }

  Future<void> updateUser(Map<String, dynamic> user) async {
    await update('users', user, 'id = ?', [user['id']]);
  }

  Future<void> deleteUser(String id) async {
    await delete('users', 'id = ?', [id]);
  }

  Future<void> upsertUser(Map<String, dynamic> user) async {
    final db = await database;
    await db.insert('users', user,
        conflictAlgorithm: ConflictAlgorithm.replace);
  }

  // ---------------------------------------------------------------------------
  // Patrols CRUD
  // ---------------------------------------------------------------------------

  Future<void> insertPatrol(Map<String, dynamic> patrol) async {
    await insert('patrols', patrol);
  }

  Future<Map<String, dynamic>?> getPatrolById(String id) async {
    final results = await query('patrols', where: 'id = ?', whereArgs: [id]);
    return results.isNotEmpty ? results.first : null;
  }

  Future<List<Map<String, dynamic>>> getPatrolsByLeader(String leaderId) async {
    return query('patrols',
        where: 'leader_id = ?', whereArgs: [leaderId], orderBy: 'created_at DESC');
  }

  Future<List<Map<String, dynamic>>> getPatrolsByStatus(String status) async {
    return query('patrols',
        where: 'status = ?', whereArgs: [status], orderBy: 'start_time DESC');
  }

  Future<List<Map<String, dynamic>>> getAllPatrols() async {
    return query('patrols', orderBy: 'created_at DESC');
  }

  Future<void> updatePatrol(Map<String, dynamic> patrol) async {
    await update('patrols', patrol, 'id = ?', [patrol['id']]);
  }

  Future<void> deletePatrol(String id) async {
    await delete('patrols', 'id = ?', [id]);
  }

  Future<void> upsertPatrol(Map<String, dynamic> patrol) async {
    final db = await database;
    await db.insert('patrols', patrol,
        conflictAlgorithm: ConflictAlgorithm.replace);
  }

  // ---------------------------------------------------------------------------
  // Patrol Members CRUD
  // ---------------------------------------------------------------------------

  Future<void> insertPatrolMember(Map<String, dynamic> member) async {
    await insert('patrol_members', member);
  }

  Future<List<Map<String, dynamic>>> getMembersByPatrol(String patrolId) async {
    return query('patrol_members',
        where: 'patrol_id = ?', whereArgs: [patrolId]);
  }

  Future<List<Map<String, dynamic>>> getPatrolsByMember(String userId) async {
    return query('patrol_members',
        where: 'user_id = ?', whereArgs: [userId]);
  }

  Future<void> deletePatrolMember(String id) async {
    await delete('patrol_members', 'id = ?', [id]);
  }

  Future<void> deleteMembersByPatrol(String patrolId) async {
    await delete('patrol_members', 'patrol_id = ?', [patrolId]);
  }

  Future<void> upsertPatrolMember(Map<String, dynamic> member) async {
    final db = await database;
    await db.insert('patrol_members', member,
        conflictAlgorithm: ConflictAlgorithm.replace);
  }

  // ---------------------------------------------------------------------------
  // Field Observations CRUD
  // ---------------------------------------------------------------------------

  Future<void> insertObservation(Map<String, dynamic> observation) async {
    await insert('field_observations', observation);
  }

  Future<Map<String, dynamic>?> getObservationById(String id) async {
    final results =
        await query('field_observations', where: 'id = ?', whereArgs: [id]);
    return results.isNotEmpty ? results.first : null;
  }

  Future<List<Map<String, dynamic>>> getObservationsByPatrol(
      String patrolId) async {
    return query('field_observations',
        where: 'patrol_id = ?',
        whereArgs: [patrolId],
        orderBy: 'recorded_at DESC');
  }

  Future<List<Map<String, dynamic>>> getObservationsByType(String obsType) async {
    return query('field_observations',
        where: 'obs_type = ?',
        whereArgs: [obsType],
        orderBy: 'recorded_at DESC');
  }

  Future<List<Map<String, dynamic>>> searchObservations({
    String? obsType,
    String? startDate,
    String? endDate,
    int? limit,
  }) async {
    final conditions = <String>[];
    final args = <Object?>[];

    if (obsType != null) {
      conditions.add('obs_type = ?');
      args.add(obsType);
    }
    if (startDate != null) {
      conditions.add('recorded_at >= ?');
      args.add(startDate);
    }
    if (endDate != null) {
      conditions.add('recorded_at <= ?');
      args.add(endDate);
    }

    final whereClause =
        conditions.isNotEmpty ? conditions.join(' AND ') : null;

    return query(
      'field_observations',
      where: whereClause,
      whereArgs: args.isNotEmpty ? args : null,
      orderBy: 'recorded_at DESC',
      limit: limit,
    );
  }

  Future<void> updateObservation(Map<String, dynamic> observation) async {
    await update('field_observations', observation, 'id = ?',
        [observation['id']]);
  }

  Future<void> deleteObservation(String id) async {
    await delete('field_observations', 'id = ?', [id]);
  }

  Future<void> upsertObservation(Map<String, dynamic> observation) async {
    final db = await database;
    await db.insert('field_observations', observation,
        conflictAlgorithm: ConflictAlgorithm.replace);
  }

  // ---------------------------------------------------------------------------
  // Task Proofs CRUD
  // ---------------------------------------------------------------------------

  Future<void> insertTaskProof(Map<String, dynamic> proof) async {
    await insert('task_proofs', proof);
  }

  Future<List<Map<String, dynamic>>> getProofsByTask(String taskId) async {
    return query('task_proofs',
        where: 'task_id = ?', whereArgs: [taskId], orderBy: 'recorded_at DESC');
  }

  Future<Map<String, dynamic>?> getTaskProofById(String id) async {
    final results =
        await query('task_proofs', where: 'id = ?', whereArgs: [id]);
    return results.isNotEmpty ? results.first : null;
  }

  Future<void> updateTaskProof(Map<String, dynamic> proof) async {
    await update('task_proofs', proof, 'id = ?', [proof['id']]);
  }

  Future<void> deleteTaskProof(String id) async {
    await delete('task_proofs', 'id = ?', [id]);
  }

  Future<void> upsertTaskProof(Map<String, dynamic> proof) async {
    final db = await database;
    await db.insert('task_proofs', proof,
        conflictAlgorithm: ConflictAlgorithm.replace);
  }

  // ---------------------------------------------------------------------------
  // Ranger Tasks CRUD
  // ---------------------------------------------------------------------------

  Future<void> insertRangerTask(Map<String, dynamic> task) async {
    await insert('ranger_tasks', task);
  }

  Future<Map<String, dynamic>?> getRangerTaskById(String id) async {
    final results =
        await query('ranger_tasks', where: 'id = ?', whereArgs: [id]);
    return results.isNotEmpty ? results.first : null;
  }

  Future<List<Map<String, dynamic>>> getTasksByAssignee(String userId) async {
    return query('ranger_tasks',
        where: 'assigned_to = ?',
        whereArgs: [userId],
        orderBy: 'due_date ASC');
  }

  Future<List<Map<String, dynamic>>> getTasksByStatus(String status) async {
    return query('ranger_tasks',
        where: 'status = ?', whereArgs: [status], orderBy: 'due_date ASC');
  }

  Future<List<Map<String, dynamic>>> getAllRangerTasks() async {
    return query('ranger_tasks', orderBy: 'due_date ASC');
  }

  Future<void> updateRangerTask(Map<String, dynamic> task) async {
    await update('ranger_tasks', task, 'id = ?', [task['id']]);
  }

  Future<void> deleteRangerTask(String id) async {
    await delete('ranger_tasks', 'id = ?', [id]);
  }

  Future<void> upsertRangerTask(Map<String, dynamic> task) async {
    final db = await database;
    await db.insert('ranger_tasks', task,
        conflictAlgorithm: ConflictAlgorithm.replace);
  }

  // ---------------------------------------------------------------------------
  // Alerts CRUD
  // ---------------------------------------------------------------------------

  Future<void> insertAlert(Map<String, dynamic> alert) async {
    await insert('alerts', alert);
  }

  Future<Map<String, dynamic>?> getAlertById(String id) async {
    final results = await query('alerts', where: 'id = ?', whereArgs: [id]);
    return results.isNotEmpty ? results.first : null;
  }

  Future<List<Map<String, dynamic>>> getAlertsByPlot(String plotId) async {
    return query('alerts',
        where: 'plot_id = ?',
        whereArgs: [plotId],
        orderBy: 'detected_at DESC');
  }

  Future<List<Map<String, dynamic>>> getActiveAlerts() async {
    return query('alerts',
        where: 'status = ?',
        whereArgs: ['active'],
        orderBy: 'detected_at DESC');
  }

  Future<List<Map<String, dynamic>>> getAlertsBySeverity(String severity) async {
    return query('alerts',
        where: 'severity = ?',
        whereArgs: [severity],
        orderBy: 'detected_at DESC');
  }

  Future<List<Map<String, dynamic>>> getAllAlerts() async {
    return query('alerts', orderBy: 'detected_at DESC');
  }

  Future<void> updateAlert(Map<String, dynamic> alert) async {
    await update('alerts', alert, 'id = ?', [alert['id']]);
  }

  Future<void> deleteAlert(String id) async {
    await delete('alerts', 'id = ?', [id]);
  }

  Future<void> upsertAlert(Map<String, dynamic> alert) async {
    final db = await database;
    await db.insert('alerts', alert,
        conflictAlgorithm: ConflictAlgorithm.replace);
  }

  // ---------------------------------------------------------------------------
  // Forest Plots CRUD
  // ---------------------------------------------------------------------------

  Future<void> insertForestPlot(Map<String, dynamic> plot) async {
    await insert('forest_plots', plot);
  }

  Future<Map<String, dynamic>?> getForestPlotById(String id) async {
    final results =
        await query('forest_plots', where: 'id = ?', whereArgs: [id]);
    return results.isNotEmpty ? results.first : null;
  }

  Future<List<Map<String, dynamic>>> getForestPlotsByProvince(
      String provinceId) async {
    return query('forest_plots',
        where: 'province_id = ?', whereArgs: [provinceId]);
  }

  Future<List<Map<String, dynamic>>> getForestPlotsByFireRisk(
      String riskLevel) async {
    return query('forest_plots',
        where: 'fire_risk = ?', whereArgs: [riskLevel]);
  }

  Future<List<Map<String, dynamic>>> getAllForestPlots() async {
    return query('forest_plots', orderBy: 'plot_code ASC');
  }

  Future<void> updateForestPlot(Map<String, dynamic> plot) async {
    await update('forest_plots', plot, 'id = ?', [plot['id']]);
  }

  Future<void> deleteForestPlot(String id) async {
    await delete('forest_plots', 'id = ?', [id]);
  }

  Future<void> upsertForestPlot(Map<String, dynamic> plot) async {
    final db = await database;
    await db.insert('forest_plots', plot,
        conflictAlgorithm: ConflictAlgorithm.replace);
  }

  // ---------------------------------------------------------------------------
  // Geofences CRUD
  // ---------------------------------------------------------------------------

  Future<void> insertGeofence(Map<String, dynamic> geofence) async {
    await insert('geofences', geofence);
  }

  Future<Map<String, dynamic>?> getGeofenceById(String id) async {
    final results =
        await query('geofences', where: 'id = ?', whereArgs: [id]);
    return results.isNotEmpty ? results.first : null;
  }

  Future<List<Map<String, dynamic>>> getActiveGeofences() async {
    return query('geofences',
        where: 'is_active = ?', whereArgs: [1], orderBy: 'name ASC');
  }

  Future<List<Map<String, dynamic>>> getGeofencesByType(String type) async {
    return query('geofences',
        where: 'type = ? AND is_active = ?', whereArgs: [type, 1]);
  }

  Future<List<Map<String, dynamic>>> getAllGeofences() async {
    return query('geofences', orderBy: 'name ASC');
  }

  Future<void> updateGeofence(Map<String, dynamic> geofence) async {
    await update('geofences', geofence, 'id = ?', [geofence['id']]);
  }

  Future<void> deleteGeofence(String id) async {
    await delete('geofences', 'id = ?', [id]);
  }

  Future<void> upsertGeofence(Map<String, dynamic> geofence) async {
    final db = await database;
    await db.insert('geofences', geofence,
        conflictAlgorithm: ConflictAlgorithm.replace);
  }

  // ---------------------------------------------------------------------------
  // Device Locations CRUD
  // ---------------------------------------------------------------------------

  Future<void> insertDeviceLocation(Map<String, dynamic> location) async {
    await insert('device_locations', location);
  }

  Future<List<Map<String, dynamic>>> getDeviceLocations({
    required String deviceId,
    String? startDate,
    String? endDate,
    int? limit,
  }) async {
    final conditions = <String>['device_id = ?'];
    final args = <Object?>[deviceId];

    if (startDate != null) {
      conditions.add('recorded_at >= ?');
      args.add(startDate);
    }
    if (endDate != null) {
      conditions.add('recorded_at <= ?');
      args.add(endDate);
    }

    return query(
      'device_locations',
      where: conditions.join(' AND '),
      whereArgs: args,
      orderBy: 'recorded_at DESC',
      limit: limit,
    );
  }

  Future<void> deleteDeviceLocationsOlderThan(String cutoffDate) async {
    await delete('device_locations',
        'recorded_at < ? AND sync_status = ?', [cutoffDate, 'synced']);
  }

  Future<void> upsertDeviceLocation(Map<String, dynamic> location) async {
    final db = await database;
    await db.insert('device_locations', location,
        conflictAlgorithm: ConflictAlgorithm.replace);
  }

  // ---------------------------------------------------------------------------
  // Sync Queue CRUD
  // ---------------------------------------------------------------------------

  Future<void> insertSyncQueueItem(Map<String, dynamic> item) async {
    await insert('sync_queue', item);
  }

  Future<List<Map<String, dynamic>>> getPendingSyncItems({
    int? limit,
  }) async {
    final now = DateTime.now().toUtc().toIso8601String();
    return query(
      'sync_queue',
      where: 'attempts < max_attempts AND next_retry_at <= ?',
      whereArgs: [now],
      orderBy: 'created_at ASC',
      limit: limit,
    );
  }

  Future<List<Map<String, dynamic>>> getAllSyncQueueItems() async {
    return query('sync_queue', orderBy: 'created_at ASC');
  }

  Future<void> updateSyncQueueItem(Map<String, dynamic> item) async {
    await update('sync_queue', item, 'id = ?', [item['id']]);
  }

  Future<void> deleteSyncQueueItem(String id) async {
    await delete('sync_queue', 'id = ?', [id]);
  }

  Future<void> clearSyncQueue() async {
    final db = await database;
    await db.delete('sync_queue');
  }

  // ---------------------------------------------------------------------------
  // App Settings CRUD
  // ---------------------------------------------------------------------------

  Future<void> setSetting(String key, String value) async {
    final db = await database;
    await db.insert(
      'app_settings',
      {'key': key, 'value': value},
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  Future<String?> getSetting(String key) async {
    final results =
        await query('app_settings', where: 'key = ?', whereArgs: [key]);
    return results.isNotEmpty ? results.first['value'] as String? : null;
  }

  Future<void> deleteSetting(String key) async {
    await delete('app_settings', 'key = ?', [key]);
  }

  Future<Map<String, String>> getAllSettings() async {
    final results = await query('app_settings');
    return {for (var row in results) row['key'] as String: row['value'] as String};
  }

  // ---------------------------------------------------------------------------
  // Bulk Insert / Replace for Sync
  // ---------------------------------------------------------------------------

  Future<void> bulkReplaceUsers(List<Map<String, dynamic>> users) async {
    final db = await database;
    final batch = db.batch();
    for (final user in users) {
      batch.insert('users', user, conflictAlgorithm: ConflictAlgorithm.replace);
    }
    await batch.commit(noResult: true);
  }

  Future<void> bulkReplacePatrols(List<Map<String, dynamic>> patrols) async {
    final db = await database;
    final batch = db.batch();
    for (final patrol in patrols) {
      batch.insert('patrols', patrol,
          conflictAlgorithm: ConflictAlgorithm.replace);
    }
    await batch.commit(noResult: true);
  }

  Future<void> bulkReplacePatrolMembers(
      List<Map<String, dynamic>> members) async {
    final db = await database;
    final batch = db.batch();
    for (final member in members) {
      batch.insert('patrol_members', member,
          conflictAlgorithm: ConflictAlgorithm.replace);
    }
    await batch.commit(noResult: true);
  }

  Future<void> bulkReplaceObservations(
      List<Map<String, dynamic>> observations) async {
    final db = await database;
    final batch = db.batch();
    for (final obs in observations) {
      batch.insert('field_observations', obs,
          conflictAlgorithm: ConflictAlgorithm.replace);
    }
    await batch.commit(noResult: true);
  }

  Future<void> bulkReplaceTaskProofs(List<Map<String, dynamic>> proofs) async {
    final db = await database;
    final batch = db.batch();
    for (final proof in proofs) {
      batch.insert('task_proofs', proof,
          conflictAlgorithm: ConflictAlgorithm.replace);
    }
    await batch.commit(noResult: true);
  }

  Future<void> bulkReplaceRangerTasks(
      List<Map<String, dynamic>> tasks) async {
    final db = await database;
    final batch = db.batch();
    for (final task in tasks) {
      batch.insert('ranger_tasks', task,
          conflictAlgorithm: ConflictAlgorithm.replace);
    }
    await batch.commit(noResult: true);
  }

  Future<void> bulkReplaceAlerts(List<Map<String, dynamic>> alerts) async {
    final db = await database;
    final batch = db.batch();
    for (final alert in alerts) {
      batch.insert('alerts', alert,
          conflictAlgorithm: ConflictAlgorithm.replace);
    }
    await batch.commit(noResult: true);
  }

  Future<void> bulkReplaceForestPlots(
      List<Map<String, dynamic>> plots) async {
    final db = await database;
    final batch = db.batch();
    for (final plot in plots) {
      batch.insert('forest_plots', plot,
          conflictAlgorithm: ConflictAlgorithm.replace);
    }
    await batch.commit(noResult: true);
  }

  Future<void> bulkReplaceGeofences(
      List<Map<String, dynamic>> geofences) async {
    final db = await database;
    final batch = db.batch();
    for (final geofence in geofences) {
      batch.insert('geofences', geofence,
          conflictAlgorithm: ConflictAlgorithm.replace);
    }
    await batch.commit(noResult: true);
  }

  Future<void> bulkReplaceDeviceLocations(
      List<Map<String, dynamic>> locations) async {
    final db = await database;
    final batch = db.batch();
    for (final location in locations) {
      batch.insert('device_locations', location,
          conflictAlgorithm: ConflictAlgorithm.replace);
    }
    await batch.commit(noResult: true);
  }

  // ---------------------------------------------------------------------------
  // Mark as Synced
  // ---------------------------------------------------------------------------

  Future<void> markPatrolSynced(String id) async {
    await update('patrols', {'sync_status': 'synced'}, 'id = ?', [id]);
  }

  Future<void> markObservationSynced(String id) async {
    await update(
        'field_observations', {'sync_status': 'synced'}, 'id = ?', [id]);
  }

  Future<void> markTaskProofSynced(String id) async {
    await update('task_proofs', {'sync_status': 'synced'}, 'id = ?', [id]);
  }

  Future<void> markRangerTaskSynced(String id) async {
    await update('ranger_tasks', {'sync_status': 'synced'}, 'id = ?', [id]);
  }

  Future<void> markAlertSynced(String id) async {
    await update('alerts', {'sync_status': 'synced'}, 'id = ?', [id]);
  }

  Future<void> markForestPlotSynced(String id) async {
    await update('forest_plots', {'sync_status': 'synced'}, 'id = ?', [id]);
  }

  Future<void> markDeviceLocationSynced(String id) async {
    await update(
        'device_locations', {'sync_status': 'synced'}, 'id = ?', [id]);
  }

  Future<void> markAllDeviceLocationsSynced(String deviceId) async {
    await update('device_locations', {'sync_status': 'synced'},
        'device_id = ? AND sync_status = ?', [deviceId, 'pending']);
  }

  // ---------------------------------------------------------------------------
  // Get Pending Sync Items
  // ---------------------------------------------------------------------------

  Future<List<Map<String, dynamic>>> getPendingObservations() async {
    return query('field_observations',
        where: 'sync_status = ?',
        whereArgs: ['pending'],
        orderBy: 'recorded_at ASC');
  }

  Future<List<Map<String, dynamic>>> getPendingTaskProofs() async {
    return query('task_proofs',
        where: 'sync_status = ?',
        whereArgs: ['pending'],
        orderBy: 'recorded_at ASC');
  }

  Future<List<Map<String, dynamic>>> getPendingDeviceLocations() async {
    return query('device_locations',
        where: 'sync_status = ?',
        whereArgs: ['pending'],
        orderBy: 'recorded_at ASC');
  }

  Future<List<Map<String, dynamic>>> getPendingPatrols() async {
    return query('patrols',
        where: 'sync_status = ?',
        whereArgs: ['pending'],
        orderBy: 'created_at ASC');
  }

  Future<List<Map<String, dynamic>>> getPendingRangerTasks() async {
    return query('ranger_tasks',
        where: 'sync_status = ?',
        whereArgs: ['pending'],
        orderBy: 'due_date ASC');
  }

  // ---------------------------------------------------------------------------
  // Clear All Data
  // ---------------------------------------------------------------------------

  Future<void> clearAllData() async {
    final db = await database;
    final batch = db.batch();
    const tables = [
      'users',
      'patrols',
      'patrol_members',
      'field_observations',
      'task_proofs',
      'ranger_tasks',
      'alerts',
      'forest_plots',
      'geofences',
      'device_locations',
      'sync_queue',
    ];
    for (final table in tables) {
      batch.delete(table);
    }
    await batch.commit(noResult: true);
  }

  // ---------------------------------------------------------------------------
  // Sync Statistics
  // ---------------------------------------------------------------------------

  Future<Map<String, int>> getSyncStatistics() async {
    final db = await database;
    final stats = <String, int>{};

    const tableNames = [
      'patrols',
      'field_observations',
      'task_proofs',
      'ranger_tasks',
      'alerts',
      'forest_plots',
      'device_locations',
    ];

    for (final table in tableNames) {
      // Pending count
      final pendingResult = await db.rawQuery(
        'SELECT COUNT(*) as count FROM $table WHERE sync_status = ?',
        ['pending'],
      );
      stats['${table}_pending'] =
          Sqflite.firstIntValue(pendingResult) ?? 0;

      // Synced count
      final syncedResult = await db.rawQuery(
        'SELECT COUNT(*) as count FROM $table WHERE sync_status = ?',
        ['synced'],
      );
      stats['${table}_synced'] =
          Sqflite.firstIntValue(syncedResult) ?? 0;

      // Total count
      final totalResult = await db
          .rawQuery('SELECT COUNT(*) as count FROM $table');
      stats['${table}_total'] =
          Sqflite.firstIntValue(totalResult) ?? 0;
    }

    // Sync queue stats
    final queueTotal = await db
        .rawQuery('SELECT COUNT(*) as count FROM sync_queue');
    stats['sync_queue_total'] =
        Sqflite.firstIntValue(queueTotal) ?? 0;

    final queuePending = await db.rawQuery(
      'SELECT COUNT(*) as count FROM sync_queue WHERE attempts < max_attempts',
    );
    stats['sync_queue_pending'] =
        Sqflite.firstIntValue(queuePending) ?? 0;

    final queueFailed = await db.rawQuery(
      'SELECT COUNT(*) as count FROM sync_queue WHERE attempts >= max_attempts',
    );
    stats['sync_queue_failed'] =
        Sqflite.firstIntValue(queueFailed) ?? 0;

    return stats;
  }

  // ---------------------------------------------------------------------------
  // Raw Query (for advanced usage)
  // ---------------------------------------------------------------------------

  Future<List<Map<String, dynamic>>> rawQuery(String sql,
      [List<Object?>? arguments]) async {
    final db = await database;
    return db.rawQuery(sql, arguments);
  }

  Future<int> rawInsert(String sql, [List<Object?>? arguments]) async {
    final db = await database;
    return db.rawInsert(sql, arguments);
  }

  Future<int> rawUpdate(String sql, [List<Object?>? arguments]) async {
    final db = await database;
    return db.rawUpdate(sql, arguments);
  }

  Future<int> rawDelete(String sql, [List<Object?>? arguments]) async {
    final db = await database;
    return db.rawDelete(sql, arguments);
  }

  // ---------------------------------------------------------------------------
  // Close Database
  // ---------------------------------------------------------------------------

  Future<void> close() async {
    if (_database != null && _database!.isOpen) {
      await _database!.close();
      _database = null;
    }
  }
}
