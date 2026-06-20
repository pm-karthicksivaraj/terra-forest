import 'package:terra_forest_mobile/core/network/api_client.dart';
import 'package:terra_forest_mobile/features/patrol/domain/entities/patrol.dart';
import 'package:terra_forest_mobile/features/patrol/domain/entities/observation.dart';
import 'package:terra_forest_mobile/features/patrol/domain/repositories/patrol_repository.dart';
import 'package:terra_forest_mobile/features/patrol/data/datasources/patrol_remote_datasource.dart';
import 'package:terra_forest_mobile/features/patrol/data/datasources/patrol_local_datasource.dart';

/// Offline-first implementation of [PatrolRepository].
///
/// Strategy:
/// - **Reads**: Try remote first, fall back to local cache on failure.
/// - **Writes**: Save locally first, queue for sync, try remote.
/// - **Sync**: Process pending items when connectivity is restored.
class PatrolRepositoryImpl implements PatrolRepository {
  final PatrolRemoteDatasource _remoteDatasource;
  final PatrolLocalDatasource _localDatasource;
  final ApiClient _apiClient;

  PatrolRepositoryImpl({
    required PatrolRemoteDatasource remoteDatasource,
    required PatrolLocalDatasource localDatasource,
    required ApiClient apiClient,
  })  : _remoteDatasource = remoteDatasource,
        _localDatasource = localDatasource,
        _apiClient = apiClient;

  // ─── Reads (offline-first) ───────────────────────────────────────────────

  @override
  Future<List<Patrol>> getPatrols() async {
    try {
      final isOnline = await _apiClient.isConnected();
      if (isOnline) {
        try {
          final remotePatrols = await _remoteDatasource.getPatrols();
          // Cache remote data locally
          for (final patrol in remotePatrols) {
            await _localDatasource.insertPatrol(patrol);
          }
          return remotePatrols;
        } catch (e) {
          // Remote failed, fall back to local
        }
      }
      return _localDatasource.getAllPatrols();
    } catch (e) {
      return _localDatasource.getAllPatrols();
    }
  }

  @override
  Future<Patrol?> getPatrolById(String id) async {
    try {
      final isOnline = await _apiClient.isConnected();
      if (isOnline) {
        try {
          final remotePatrol = await _remoteDatasource.getPatrolById(id);
          if (remotePatrol != null) {
            await _localDatasource.insertPatrol(remotePatrol);
          }
          return remotePatrol;
        } catch (e) {
          // Remote failed, fall back to local
        }
      }
      return _localDatasource.getPatrolById(id);
    } catch (e) {
      return _localDatasource.getPatrolById(id);
    }
  }

  // ─── Writes (local-first, queue for sync) ────────────────────────────────

  @override
  Future<Patrol> startPatrol(Patrol patrol) async {
    // 1. Save locally first
    await _localDatasource.insertPatrol(patrol);
    await _localDatasource.queuePatrolForSync(patrol);

    // 2. Try to push to remote
    try {
      final isOnline = await _apiClient.isConnected();
      if (isOnline) {
        final remotePatrol = await _remoteDatasource.createPatrol(patrol);
        await _localDatasource.updatePatrol(remotePatrol);
        await _localDatasource.markPatrolSynced(remotePatrol.id);
        return remotePatrol;
      }
    } catch (_) {
      // Will be synced later
    }

    return patrol;
  }

  @override
  Future<Patrol> completePatrol(String id, String routeGeojson) async {
    // 1. Update locally first
    final localPatrol = await _localDatasource.getPatrolById(id);
    if (localPatrol == null) {
      throw Exception('Patrol not found: $id');
    }

    final completedPatrol = localPatrol.copyWith(
      status: PatrolStatus.completed,
      routeGeojson: routeGeojson,
      endTime: DateTime.now(),
      syncStatus: SyncStatus.pending,
    );

    await _localDatasource.updatePatrol(completedPatrol);
    await _localDatasource.queuePatrolForSync(completedPatrol);

    // 2. Try to push to remote
    try {
      final isOnline = await _apiClient.isConnected();
      if (isOnline) {
        final remotePatrol =
            await _remoteDatasource.completePatrol(id, routeGeojson);
        await _localDatasource.updatePatrol(remotePatrol);
        await _localDatasource.markPatrolSynced(id);
        return remotePatrol;
      }
    } catch (_) {
      // Will be synced later
    }

    return completedPatrol;
  }

  @override
  Future<Observation> addObservation(Observation observation) async {
    // 1. Save locally first
    await _localDatasource.insertObservation(observation);
    await _localDatasource.queueObservationForSync(observation);

    // 2. Try to push to remote
    try {
      final isOnline = await _apiClient.isConnected();
      if (isOnline) {
        // Upload media first if present
        Observation obsToSync = observation;
        if (observation.hasMedia && observation.photoPath != null) {
          final mediaUrl =
              await _remoteDatasource.uploadMedia(observation.photoPath!);
          if (mediaUrl != null) {
            obsToSync = observation.copyWith(photoPath: mediaUrl);
          }
        }

        final remoteObs =
            await _remoteDatasource.addObservation(obsToSync);
        await _localDatasource.updateObservation(remoteObs);
        await _localDatasource.markObservationSynced(remoteObs.id);
        return remoteObs;
      }
    } catch (_) {
      // Will be synced later
    }

    return observation;
  }

  @override
  Future<List<Observation>> getObservations(String patrolId) async {
    try {
      final isOnline = await _apiClient.isConnected();
      if (isOnline) {
        try {
          final remoteObs =
              await _remoteDatasource.getObservations(patrolId);
          // Cache locally
          for (final obs in remoteObs) {
            await _localDatasource.insertObservation(obs);
          }
          return remoteObs;
        } catch (_) {
          // Fall back to local
        }
      }
      return _localDatasource.getObservationsByPatrol(patrolId);
    } catch (_) {
      return _localDatasource.getObservationsByPatrol(patrolId);
    }
  }

  @override
  Future<void> syncPendingObservations() async {
    final pendingObs = await _localDatasource.getPendingObservations();
    if (pendingObs.isEmpty) return;

    final isOnline = await _apiClient.isConnected();
    if (!isOnline) return;

    for (final obs in pendingObs) {
      try {
        // Upload media if present
        Observation obsToSync = obs;
        if (obs.hasMedia && obs.photoPath != null) {
          final mediaUrl = await _remoteDatasource.uploadMedia(obs.photoPath!);
          if (mediaUrl != null) {
            obsToSync = obs.copyWith(photoPath: mediaUrl);
          }
        }

        await _remoteDatasource.addObservation(obsToSync);
        await _localDatasource.markObservationSynced(obs.id);
      } catch (_) {
        // Will retry on next sync cycle
      }
    }
  }

  @override
  Future<void> checkIn(String patrolId) async {
    try {
      final isOnline = await _apiClient.isConnected();
      if (isOnline) {
        await _remoteDatasource.checkIn(patrolId);
      }
    } catch (_) {
      // Queue for later
    }
  }

  @override
  Future<void> checkOut(String patrolId) async {
    try {
      final isOnline = await _apiClient.isConnected();
      if (isOnline) {
        await _remoteDatasource.checkOut(patrolId);
      }
    } catch (_) {
      // Queue for later
    }
  }

  @override
  Future<void> sendSos(String patrolId) async {
    try {
      await _remoteDatasource.sendSos(patrolId);
    } catch (_) {
      // SOS should try harder — queue for immediate retry
    }
  }

  @override
  Future<int> getActivePatrolCount() async {
    final patrols = await _localDatasource.getPatrolsByStatus(
        PatrolStatus.active);
    return patrols.length;
  }
}
