import 'dart:io';

import 'package:terra_forest_mobile/core/network/api_client.dart';
import 'package:terra_forest_mobile/features/patrol/domain/entities/patrol.dart';
import 'package:terra_forest_mobile/features/patrol/domain/entities/observation.dart';

/// Remote data source for patrol-related API calls.
///
/// Uses the shared [ApiClient] for all network requests.
/// Retrofit-style API client with explicit endpoints.
class PatrolRemoteDatasource {
  final ApiClient _apiClient;

  PatrolRemoteDatasource(this._apiClient);

  // ─── Patrols ─────────────────────────────────────────────────────────────

  /// GET /patrols – Fetch all patrols from the server.
  Future<List<Patrol>> getPatrols() async {
    try {
      final response = await _apiClient.get('/patrols');
      final data = response.data;
      if (data is List) {
        return data
            .map((json) => Patrol.fromJson(json as Map<String, dynamic>))
            .toList();
      }
      return [];
    } catch (e) {
      rethrow;
    }
  }

  /// GET /patrols/:id – Fetch a single patrol by ID.
  Future<Patrol?> getPatrolById(String id) async {
    try {
      final response = await _apiClient.get('/patrols/$id');
      final data = response.data;
      if (data is Map<String, dynamic>) {
        return Patrol.fromJson(data);
      }
      return null;
    } catch (e) {
      rethrow;
    }
  }

  /// POST /patrols – Create a new patrol on the server.
  Future<Patrol> createPatrol(Patrol patrol) async {
    try {
      final response = await _apiClient.post(
        '/patrols',
        data: patrol.toJson(),
      );
      final data = response.data;
      if (data is Map<String, dynamic>) {
        return Patrol.fromJson(data);
      }
      return patrol;
    } catch (e) {
      rethrow;
    }
  }

  /// PUT /patrols/:id/complete – Mark a patrol as completed.
  Future<Patrol> completePatrol(String id, String routeGeojson) async {
    try {
      final response = await _apiClient.put(
        '/patrols/$id/complete',
        data: {
          'route_geojson': routeGeojson,
          'end_time': DateTime.now().toUtc().toIso8601String(),
          'status': 'completed',
        },
      );
      final data = response.data;
      if (data is Map<String, dynamic>) {
        return Patrol.fromJson(data);
      }
      return Patrol(
        id: id,
        title: '',
        leaderId: '',
        status: PatrolStatus.completed,
        routeGeojson: routeGeojson,
        endTime: DateTime.now(),
      );
    } catch (e) {
      rethrow;
    }
  }

  // ─── Observations ────────────────────────────────────────────────────────

  /// POST /patrols/:id/observations – Add an observation to a patrol.
  Future<Observation> addObservation(Observation observation) async {
    try {
      final response = await _apiClient.post(
        '/patrols/${observation.patrolId}/observations',
        data: observation.toJson(),
      );
      final data = response.data;
      if (data is Map<String, dynamic>) {
        return Observation.fromJson(data);
      }
      return observation;
    } catch (e) {
      rethrow;
    }
  }

  /// GET /patrols/:id/observations – Get all observations for a patrol.
  Future<List<Observation>> getObservations(String patrolId) async {
    try {
      final response = await _apiClient.get('/patrols/$patrolId/observations');
      final data = response.data;
      if (data is List) {
        return data
            .map((json) => Observation.fromJson(json as Map<String, dynamic>))
            .toList();
      }
      return [];
    } catch (e) {
      rethrow;
    }
  }

  // ─── Check-in / Check-out ────────────────────────────────────────────────

  /// POST /patrols/:id/checkin – Check-in to a patrol.
  Future<void> checkIn(String patrolId) async {
    try {
      await _apiClient.post('/patrols/$patrolId/checkin', data: {});
    } catch (e) {
      rethrow;
    }
  }

  /// POST /patrols/:id/checkout – Check-out from a patrol.
  Future<void> checkOut(String patrolId) async {
    try {
      await _apiClient.post('/patrols/$patrolId/checkout', data: {});
    } catch (e) {
      rethrow;
    }
  }

  // ─── SOS ─────────────────────────────────────────────────────────────────

  /// POST /patrols/:id/sos – Send an SOS alert.
  Future<void> sendSos(String patrolId) async {
    try {
      await _apiClient.post('/patrols/$patrolId/sos', data: {
        'timestamp': DateTime.now().toUtc().toIso8601String(),
      });
    } catch (e) {
      rethrow;
    }
  }

  // ─── Upload observation media ────────────────────────────────────────────

  /// Upload an observation media file.
  Future<String?> uploadMedia(String filePath) async {
    try {
      final file = File(filePath);
      if (!await file.exists()) return null;
      final response = await _apiClient.uploadFile(
        '/uploads',
        file,
        fieldName: 'file',
      );
      return response.data['url'] as String?;
    } catch (e) {
      return null;
    }
  }
}
