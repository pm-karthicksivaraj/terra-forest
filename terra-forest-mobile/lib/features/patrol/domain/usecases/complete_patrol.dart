import '../entities/patrol.dart';
import '../repositories/patrol_repository.dart';

/// Use case: Complete an active patrol session.
///
/// Marks the patrol as [PatrolStatus.completed], records the final route
/// as GeoJSON, and queues the update for sync.
class CompletePatrolUseCase {
  final PatrolRepository _repository;

  CompletePatrolUseCase(this._repository);

  /// Execute the use case.
  ///
  /// [patrolId] – ID of the active patrol to complete.
  /// [routeGeojson] – the full GPS trace as a GeoJSON LineString.
  Future<Patrol> call({
    required String patrolId,
    required String routeGeojson,
  }) async {
    return _repository.completePatrol(patrolId, routeGeojson);
  }
}
