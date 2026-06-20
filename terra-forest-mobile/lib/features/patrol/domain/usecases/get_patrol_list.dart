import '../entities/patrol.dart';
import '../repositories/patrol_repository.dart';

/// Use case: Retrieve a list of patrols.
///
/// Supports optional filtering by [PatrolStatus].
/// Returns data from the offline-first repository.
class GetPatrolListUseCase {
  final PatrolRepository _repository;

  GetPatrolListUseCase(this._repository);

  /// Execute the use case.
  ///
  /// [status] – optional filter; if null, returns all patrols.
  Future<List<Patrol>> call({PatrolStatus? status}) async {
    final patrols = await _repository.getPatrols();
    if (status == null) return patrols;
    return patrols.where((p) => p.status == status).toList();
  }

  /// Get only active patrols.
  Future<List<Patrol>> getActive() => call(status: PatrolStatus.active);

  /// Get only completed patrols.
  Future<List<Patrol>> getCompleted() =>
      call(status: PatrolStatus.completed);

  /// Get only planned patrols.
  Future<List<Patrol>> getPlanned() => call(status: PatrolStatus.planned);
}
