import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:uuid/uuid.dart';

import '../storage/local_database.dart';
import '../network/api_client.dart';
import '../utils/location_service.dart';

/// Sync status enum for UI feedback
enum SyncStatus {
  idle,
  syncing,
  error,
  offline,
}

/// Progress callback type for UI updates
typedef SyncProgressCallback = void Function(
  SyncStatus status,
  String message,
  double progress,
);

/// Singleton sync engine that handles offline-first data synchronization.
/// Implements FIFO queue processing with exponential backoff and conflict resolution.
class SyncManager {
  static SyncManager? _instance;

  static SyncManager get instance {
    _instance ??= SyncManager._();
    return _instance!;
  }

  SyncManager._();

  final LocalDatabase _db = LocalDatabase.instance;
  final ApiClient _apiClient = ApiClient.instance;
  final LocationService _locationService = LocationService.instance;
  final Uuid _uuid = const Uuid();

  final StreamController<SyncStatus> _statusController =
      StreamController<SyncStatus>.broadcast();

  SyncProgressCallback? _progressCallback;

  SyncStatus _currentStatus = SyncStatus.idle;
  bool _isSyncing = false;
  Timer? _locationPingTimer;
  Timer? _periodicSyncTimer;

  /// Stream of sync status changes for UI consumption
  Stream<SyncStatus> getSyncStatus() => _statusController.stream;

  /// Current sync status
  SyncStatus get currentStatus => _currentStatus;

  /// Set progress callback for UI updates
  void setProgressCallback(SyncProgressCallback callback) {
    _progressCallback = callback;
  }

  void _updateStatus(SyncStatus status, [String message = '', double progress = 0.0]) {
    _currentStatus = status;
    if (!_statusController.isClosed) {
      _statusController.add(status);
    }
    _progressCallback?.call(status, message, progress);
  }

  // ---------------------------------------------------------------------------
  // Connectivity Check
  // ---------------------------------------------------------------------------

  Future<bool> isOnline() async {
    final connectivityResult = await Connectivity().checkConnectivity();
    return connectivityResult.any((r) => r != ConnectivityResult.none);
  }

  Stream<bool> get connectivityStream {
    return Connectivity().onConnectivityChanged.map((results) {
      return results.any((r) => r != ConnectivityResult.none);
    });
  }

  // ---------------------------------------------------------------------------
  // Queue for Sync
  // ---------------------------------------------------------------------------

  /// Add an entity to the sync queue for later processing
  Future<void> queueForSync(
    String entityType,
    String entityId,
    String action,
    Map<String, dynamic> payload,
  ) async {
    final now = DateTime.now().toUtc().toIso8601String();
    final item = {
      'id': _uuid.v4(),
      'entity_type': entityType,
      'entity_id': entityId,
      'action': action, // 'create', 'update', 'delete'
      'payload_json': jsonEncode(payload),
      'attempts': 0,
      'max_attempts': 3,
      'last_error': null,
      'created_at': now,
      'next_retry_at': now,
    };

    await _db.insertSyncQueueItem(item);

    // Also update the entity's sync_status to 'pending' if applicable
    await _markEntityPending(entityType, entityId);

    // Try to sync immediately if online
    if (await isOnline() && !_isSyncing) {
      performBackgroundSync();
    }
  }

  Future<void> _markEntityPending(String entityType, String entityId) async {
    switch (entityType) {
      case 'field_observations':
        await _db.update('field_observations',
            {'sync_status': 'pending'}, 'id = ?', [entityId]);
        break;
      case 'task_proofs':
        await _db.update(
            'task_proofs', {'sync_status': 'pending'}, 'id = ?', [entityId]);
        break;
      case 'device_locations':
        await _db.update('device_locations',
            {'sync_status': 'pending'}, 'id = ?', [entityId]);
        break;
      case 'patrols':
        await _db.update(
            'patrols', {'sync_status': 'pending'}, 'id = ?', [entityId]);
        break;
      case 'ranger_tasks':
        await _db.update('ranger_tasks',
            {'sync_status': 'pending'}, 'id = ?', [entityId]);
        break;
      case 'alerts':
        await _db.update(
            'alerts', {'sync_status': 'pending'}, 'id = ?', [entityId]);
        break;
      case 'forest_plots':
        await _db.update('forest_plots',
            {'sync_status': 'pending'}, 'id = ?', [entityId]);
        break;
    }
  }

  // ---------------------------------------------------------------------------
  // Perform Background Sync
  // ---------------------------------------------------------------------------

  /// Process all pending items in sync_queue with FIFO ordering and retry
  Future<void> performBackgroundSync() async {
    if (_isSyncing) return;

    final online = await isOnline();
    if (!online) {
      _updateStatus(SyncStatus.offline, 'No internet connection');
      return;
    }

    _isSyncing = true;
    _updateStatus(SyncStatus.syncing, 'Starting sync...', 0.0);

    try {
      // 1. Process sync queue (push pending changes)
      await _processSyncQueue();

      // 2. Upload pending observations
      await _uploadPendingObservations();

      // 3. Upload pending task proofs
      await _uploadPendingTaskProofs();

      // 4. Upload pending device locations
      await _uploadPendingDeviceLocations();

      // 5. Download new data from server
      await _downloadServerData();

      _updateStatus(SyncStatus.idle, 'Sync completed', 1.0);
    } catch (e) {
      _updateStatus(SyncStatus.error, 'Sync failed: ${e.toString()}');
    } finally {
      _isSyncing = false;
    }
  }

  // ---------------------------------------------------------------------------
  // Process Sync Queue (FIFO with exponential backoff)
  // ---------------------------------------------------------------------------

  Future<void> _processSyncQueue() async {
    final pendingItems = await _db.getPendingSyncItems();

    if (pendingItems.isEmpty) return;

    final total = pendingItems.length;
    var processed = 0;

    for (final item in pendingItems) {
      try {
        final entityType = item['entity_type'] as String;
        final entityId = item['entity_id'] as String;
        final action = item['action'] as String;
        final payloadJson = item['payload_json'] as String;
        final payload = jsonDecode(payloadJson) as Map<String, dynamic>;

        await _processQueueItem(entityType, entityId, action, payload);

        // Success: remove from queue
        await _db.deleteSyncQueueItem(item['id'] as String);

        // Mark entity as synced
        await _markEntitySynced(entityType, entityId);
      } catch (e) {
        // Failure: increment attempts and schedule retry with exponential backoff
        final attempts = (item['attempts'] as int) + 1;
        final maxAttempts = item['max_attempts'] as int;

        if (attempts >= maxAttempts) {
          // Max attempts reached: mark as permanently failed
          await _db.updateSyncQueueItem({
            'id': item['id'],
            'attempts': attempts,
            'last_error': e.toString(),
          });
        } else {
          // Exponential backoff: 1min, 5min, 30min
          final backoffDuration = _calculateBackoff(attempts);
          final nextRetry = DateTime.now()
              .add(backoffDuration)
              .toUtc()
              .toIso8601String();

          await _db.updateSyncQueueItem({
            'id': item['id'],
            'attempts': attempts,
            'last_error': e.toString(),
            'next_retry_at': nextRetry,
          });
        }
      }

      processed++;
      final progress = processed / total * 0.3; // Reserve 30% for queue processing
      _updateStatus(SyncStatus.syncing, 'Processing sync queue... $processed/$total', progress);
    }
  }

  Duration _calculateBackoff(int attempt) {
    switch (attempt) {
      case 1:
        return const Duration(minutes: 1);
      case 2:
        return const Duration(minutes: 5);
      default:
        return const Duration(minutes: 30);
    }
  }

  Future<void> _processQueueItem(
    String entityType,
    String entityId,
    String action,
    Map<String, dynamic> payload,
  ) async {
    final endpoint = _getEndpointForEntity(entityType);

    switch (action) {
      case 'create':
        await _apiClient.post(endpoint, data: payload);
        break;
      case 'update':
        await _apiClient.put('$endpoint/$entityId', data: payload);
        break;
      case 'delete':
        await _apiClient.delete('$endpoint/$entityId');
        break;
    }
  }

  String _getEndpointForEntity(String entityType) {
    switch (entityType) {
      case 'field_observations':
        return '/api/observations';
      case 'task_proofs':
        return '/api/task-proofs';
      case 'device_locations':
        return '/api/device-locations';
      case 'patrols':
        return '/api/patrols';
      case 'patrol_members':
        return '/api/patrol-members';
      case 'ranger_tasks':
        return '/api/ranger-tasks';
      case 'alerts':
        return '/api/alerts';
      case 'forest_plots':
        return '/api/forest-plots';
      case 'geofences':
        return '/api/geofences';
      case 'users':
        return '/api/users';
      default:
        return '/api/$entityType';
    }
  }

  Future<void> _markEntitySynced(String entityType, String entityId) async {
    switch (entityType) {
      case 'field_observations':
        await _db.markObservationSynced(entityId);
        break;
      case 'task_proofs':
        await _db.markTaskProofSynced(entityId);
        break;
      case 'device_locations':
        await _db.markDeviceLocationSynced(entityId);
        break;
      case 'patrols':
        await _db.markPatrolSynced(entityId);
        break;
      case 'ranger_tasks':
        await _db.markRangerTaskSynced(entityId);
        break;
      case 'alerts':
        await _db.markAlertSynced(entityId);
        break;
      case 'forest_plots':
        await _db.markForestPlotSynced(entityId);
        break;
    }
  }

  // ---------------------------------------------------------------------------
  // Upload Pending Observations
  // ---------------------------------------------------------------------------

  Future<void> _uploadPendingObservations() async {
    final pending = await _db.getPendingObservations();
    if (pending.isEmpty) return;

    final total = pending.length;
    var uploaded = 0;

    for (final obs in pending) {
      try {
        // If observation has a photo, upload it first
        if (obs['photo_path'] != null && (obs['photo_path'] as String).isNotEmpty) {
          final photoPath = obs['photo_path'] as String;
          final file = File(photoPath);
          if (await file.exists()) {
            final uploadResult = await _apiClient.uploadFile(
              '/api/uploads',
              file,
              fieldName: 'file',
            );
            obs['photo_url'] = uploadResult.data['url'];
          }
        }

        await _apiClient.post('/api/observations', data: obs);
        await _db.markObservationSynced(obs['id'] as String);
      } catch (e) {
        // Will be retried in next sync cycle
        continue;
      }

      uploaded++;
      final progress = 0.3 + (uploaded / total) * 0.2;
      _updateStatus(
          SyncStatus.syncing, 'Uploading observations... $uploaded/$total', progress);
    }
  }

  // ---------------------------------------------------------------------------
  // Upload Pending Task Proofs
  // ---------------------------------------------------------------------------

  Future<void> _uploadPendingTaskProofs() async {
    final pending = await _db.getPendingTaskProofs();
    if (pending.isEmpty) return;

    final total = pending.length;
    var uploaded = 0;

    for (final proof in pending) {
      try {
        final filePath = proof['file_path'] as String;
        final file = File(filePath);

        if (await file.exists()) {
          // Upload the proof file
          final uploadResult = await _apiClient.uploadFile(
            '/api/uploads',
            file,
            fieldName: 'file',
            extraData: {
              'task_id': proof['task_id'],
              'proof_type': proof['proof_type'],
              'uploaded_by': proof['uploaded_by'],
              'description': proof['description'] ?? '',
              'latitude': proof['latitude']?.toString() ?? '',
              'longitude': proof['longitude']?.toString() ?? '',
              'recorded_at': proof['recorded_at'],
            },
          );

          // Also upload thumbnail if exists
          if (proof['thumbnail_path'] != null) {
            final thumbnailFile = File(proof['thumbnail_path'] as String);
            if (await thumbnailFile.exists()) {
              await _apiClient.uploadFile(
                '/api/uploads',
                thumbnailFile,
                fieldName: 'thumbnail',
              );
            }
          }
        }

        await _apiClient.post('/api/task-proofs', data: proof);
        await _db.markTaskProofSynced(proof['id'] as String);
      } catch (e) {
        continue;
      }

      uploaded++;
      final progress = 0.5 + (uploaded / total) * 0.15;
      _updateStatus(
          SyncStatus.syncing, 'Uploading evidence... $uploaded/$total', progress);
    }
  }

  // ---------------------------------------------------------------------------
  // Upload Pending Device Locations
  // ---------------------------------------------------------------------------

  Future<void> _uploadPendingDeviceLocations() async {
    final pending = await _db.getPendingDeviceLocations();
    if (pending.isEmpty) return;

    try {
      // Send locations in batch
      final locations = pending
          .map((loc) => {
                'id': loc['id'],
                'device_id': loc['device_id'],
                'latitude': loc['latitude'],
                'longitude': loc['longitude'],
                'accuracy_m': loc['accuracy_m'],
                'altitude_m': loc['altitude_m'],
                'speed_kph': loc['speed_kph'],
                'bearing': loc['bearing'],
                'battery_pct': loc['battery_pct'],
                'recorded_at': loc['recorded_at'],
              })
          .toList();

      await _apiClient.post('/api/device-locations/batch', data: {
        'locations': locations,
      });

      // Mark all as synced
      for (final loc in pending) {
        await _db.markDeviceLocationSynced(loc['id'] as String);
      }
    } catch (e) {
      // Will retry next cycle
    }

    _updateStatus(SyncStatus.syncing, 'Locations uploaded', 0.65);
  }

  // ---------------------------------------------------------------------------
  // Download Server Data
  // ---------------------------------------------------------------------------

  Future<void> _downloadServerData() async {
    // Get last sync timestamps
    final lastAlertSync = await _db.getSetting('last_alert_sync') ?? '';
    final lastTaskSync = await _db.getSetting('last_task_sync') ?? '';
    final lastPatrolSync = await _db.getSetting('last_patrol_sync') ?? '';
    final lastPlotSync = await _db.getSetting('last_plot_sync') ?? '';
    final lastGeofenceSync = await _db.getSetting('last_geofence_sync') ?? '';
    final lastUserSync = await _db.getSetting('last_user_sync') ?? '';

    try {
      // Download alerts
      _updateStatus(SyncStatus.syncing, 'Downloading alerts...', 0.7);
      final alertsResponse = await _apiClient.get(
        '/api/alerts',
        queryParameters: lastAlertSync.isNotEmpty
            ? {'since': lastAlertSync}
            : null,
      );
      final alerts = (alertsResponse.data as List?)?.cast<Map<String, dynamic>>() ?? [];
      // Conflict resolution: server wins for master data (alerts)
      await _db.bulkReplaceAlerts(alerts);
      await _db.setSetting('last_alert_sync', DateTime.now().toUtc().toIso8601String());

      // Download ranger tasks
      _updateStatus(SyncStatus.syncing, 'Downloading tasks...', 0.75);
      final tasksResponse = await _apiClient.get(
        '/api/ranger-tasks',
        queryParameters: lastTaskSync.isNotEmpty
            ? {'since': lastTaskSync}
            : null,
      );
      final tasks = (tasksResponse.data as List?)?.cast<Map<String, dynamic>>() ?? [];
      // Server wins for task assignments
      await _db.bulkReplaceRangerTasks(tasks);
      await _db.setSetting('last_task_sync', DateTime.now().toUtc().toIso8601String());

      // Download patrol assignments
      _updateStatus(SyncStatus.syncing, 'Downloading patrols...', 0.8);
      final patrolsResponse = await _apiClient.get(
        '/api/patrols',
        queryParameters: lastPatrolSync.isNotEmpty
            ? {'since': lastPatrolSync}
            : null,
      );
      final patrols = (patrolsResponse.data as List?)?.cast<Map<String, dynamic>>() ?? [];
      // Server wins for patrol definitions
      await _db.bulkReplacePatrols(patrols);
      await _db.setSetting('last_patrol_sync', DateTime.now().toUtc().toIso8601String());

      // Download patrol members
      if (patrols.isNotEmpty) {
        final membersResponse = await _apiClient.get('/api/patrol-members');
        final members = (membersResponse.data as List?)?.cast<Map<String, dynamic>>() ?? [];
        await _db.bulkReplacePatrolMembers(members);
      }

      // Download forest plots
      _updateStatus(SyncStatus.syncing, 'Downloading forest plots...', 0.85);
      final plotsResponse = await _apiClient.get(
        '/api/forest-plots',
        queryParameters: lastPlotSync.isNotEmpty
            ? {'since': lastPlotSync}
            : null,
      );
      final plots = (plotsResponse.data as List?)?.cast<Map<String, dynamic>>() ?? [];
      await _db.bulkReplaceForestPlots(plots);
      await _db.setSetting('last_plot_sync', DateTime.now().toUtc().toIso8601String());

      // Download geofences
      _updateStatus(SyncStatus.syncing, 'Downloading geofences...', 0.9);
      final geofencesResponse = await _apiClient.get(
        '/api/geofences',
        queryParameters: lastGeofenceSync.isNotEmpty
            ? {'since': lastGeofenceSync}
            : null,
      );
      final geofences = (geofencesResponse.data as List?)?.cast<Map<String, dynamic>>() ?? [];
      await _db.bulkReplaceGeofences(geofences);
      await _db.setSetting('last_geofence_sync', DateTime.now().toUtc().toIso8601String());

      // Download users
      _updateStatus(SyncStatus.syncing, 'Downloading users...', 0.95);
      final usersResponse = await _apiClient.get(
        '/api/users',
        queryParameters: lastUserSync.isNotEmpty
            ? {'since': lastUserSync}
            : null,
      );
      final users = (usersResponse.data as List?)?.cast<Map<String, dynamic>>() ?? [];
      await _db.bulkReplaceUsers(users);
      await _db.setSetting('last_user_sync', DateTime.now().toUtc().toIso8601String());

      _updateStatus(SyncStatus.syncing, 'Download complete', 1.0);
    } catch (e) {
      // Partial download failure is acceptable; next sync will continue
      _updateStatus(SyncStatus.syncing, 'Partial download: ${e.toString()}', 1.0);
    }
  }

  // ---------------------------------------------------------------------------
  // Force Sync All (full pull + push)
  // ---------------------------------------------------------------------------

  Future<void> forceSyncAll() async {
    if (_isSyncing) return;

    final online = await isOnline();
    if (!online) {
      _updateStatus(SyncStatus.offline, 'No internet connection');
      return;
    }

    _isSyncing = true;
    _updateStatus(SyncStatus.syncing, 'Starting full sync...', 0.0);

    try {
      // Push all pending data first
      await _processSyncQueue();
      await _uploadPendingObservations();
      await _uploadPendingTaskProofs();
      await _uploadPendingDeviceLocations();

      // Clear sync timestamps to force full pull
      await _db.setSetting('last_alert_sync', '');
      await _db.setSetting('last_task_sync', '');
      await _db.setSetting('last_patrol_sync', '');
      await _db.setSetting('last_plot_sync', '');
      await _db.setSetting('last_geofence_sync', '');
      await _db.setSetting('last_user_sync', '');

      // Full pull from server
      await _downloadServerData();

      _updateStatus(SyncStatus.idle, 'Full sync completed', 1.0);
    } catch (e) {
      _updateStatus(SyncStatus.error, 'Full sync failed: ${e.toString()}');
    } finally {
      _isSyncing = false;
    }
  }

  // ---------------------------------------------------------------------------
  // Location Ping (every 5 minutes when on patrol)
  // ---------------------------------------------------------------------------

  /// Start periodic location pinging when on patrol
  void startLocationPings({String? deviceId}) {
    _stopLocationPingTimer();

    _locationPingTimer = Timer.periodic(const Duration(minutes: 5), (_) async {
      await sendLocationPing(deviceId: deviceId);
    });

    // Send immediately
    sendLocationPing(deviceId: deviceId);
  }

  /// Stop location pinging
  void stopLocationPings() {
    _stopLocationPingTimer();
  }

  void _stopLocationPingTimer() {
    _locationPingTimer?.cancel();
    _locationPingTimer = null;
  }

  /// POST current GPS to /api/devices/:id/locations
  Future<void> sendLocationPing({String? deviceId}) async {
    try {
      final position = await _locationService.getCurrentPosition(
        accuracyPreset: LocationAccuracyPreset.navigation,
        timeout: const Duration(seconds: 15),
      );

      if (position == null) return;

      final id = deviceId ?? await _db.getSetting('device_id') ?? 'unknown';
      final now = DateTime.now().toUtc().toIso8601String();

      final locationData = {
        'id': _uuid.v4(),
        'device_id': id,
        'latitude': position.latitude,
        'longitude': position.longitude,
        'accuracy_m': position.accuracy,
        'altitude_m': position.altitude,
        'speed_kph': (position.speed * 3.6), // m/s to km/h
        'bearing': position.heading,
        'battery_pct': null, // Would need battery_info package
        'recorded_at': now,
        'sync_status': 'pending',
      };

      // Save locally first
      await _db.insertDeviceLocation(locationData);

      // Try to send immediately if online
      final online = await isOnline();
      if (online) {
        try {
          await _apiClient.post('/api/devices/$id/locations', data: {
            'latitude': position.latitude,
            'longitude': position.longitude,
            'accuracy_m': position.accuracy,
            'altitude_m': position.altitude,
            'speed_kph': position.speed * 3.6,
            'bearing': position.heading,
            'recorded_at': now,
          });
          await _db.markDeviceLocationSynced(locationData['id'] as String);
        } catch (_) {
          // Will be sent during next sync cycle
        }
      }
    } catch (e) {
      // Silently fail - location ping is best-effort
    }
  }

  // ---------------------------------------------------------------------------
  // OTA Update Check
  // ---------------------------------------------------------------------------

  /// GET /api/ota/latest - check for over-the-air updates
  Future<Map<String, dynamic>?> checkForOtaUpdate() async {
    final online = await isOnline();
    if (!online) return null;

    try {
      final response = await _apiClient.get('/api/ota/latest');
      if (response.statusCode == 200 && response.data != null) {
        return response.data as Map<String, dynamic>;
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  // ---------------------------------------------------------------------------
  // Periodic Sync Timer
  // ---------------------------------------------------------------------------

  /// Start periodic sync (every 5 minutes)
  void startPeriodicSync() {
    _periodicSyncTimer?.cancel();
    _periodicSyncTimer = Timer.periodic(const Duration(minutes: 5), (_) async {
      final online = await isOnline();
      if (online && !_isSyncing) {
        await performBackgroundSync();
      }
    });
  }

  /// Stop periodic sync
  void stopPeriodicSync() {
    _periodicSyncTimer?.cancel();
    _periodicSyncTimer = null;
  }

  // ---------------------------------------------------------------------------
  // Cleanup Old Data
  // ---------------------------------------------------------------------------

  /// Clean up old synced device locations (older than 30 days)
  Future<void> cleanupOldData() async {
    final cutoff = DateTime.now()
        .subtract(const Duration(days: 30))
        .toUtc()
        .toIso8601String();
    await _db.deleteDeviceLocationsOlderThan(cutoff);
  }

  // ---------------------------------------------------------------------------
  // Dispose
  // ---------------------------------------------------------------------------

  void dispose() {
    _stopLocationPingTimer();
    _periodicSyncTimer?.cancel();
    _statusController.close();
  }
}
