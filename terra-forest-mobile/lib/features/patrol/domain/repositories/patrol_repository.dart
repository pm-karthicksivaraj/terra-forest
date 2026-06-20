import '../entities/patrol.dart';
import '../entities/observation.dart';

/// Abstract repository defining the contract for patrol data operations.
/// Implementations must handle offline-first sync with the remote server.
abstract class PatrolRepository {
  /// Fetch all patrols (from local cache, optionally refreshed from remote).
  Future<List<Patrol>> getPatrols();

  /// Fetch a single patrol by its ID.
  Future<Patrol?> getPatrolById(String id);

  /// Start a new patrol – creates it locally and queues for sync.
  Future<Patrol> startPatrol(Patrol patrol);

  /// Complete an active patrol with the final route GeoJSON.
  Future<Patrol> completePatrol(String id, String routeGeojson);

  /// Add a field observation to a patrol.
  Future<Observation> addObservation(Observation observation);

  /// Get all observations for a given patrol.
  Future<List<Observation>> getObservations(String patrolId);

  /// Sync all pending observations to the remote server.
  Future<void> syncPendingObservations();

  /// Check-in to a patrol (mark the current user as having joined).
  Future<void> checkIn(String patrolId);

  /// Check-out from a patrol (mark the current user as having left).
  Future<void> checkOut(String patrolId);

  /// Send an SOS alert for the given patrol.
  Future<void> sendSos(String patrolId);

  /// Get the count of currently active patrols.
  Future<int> getActivePatrolCount();
}
