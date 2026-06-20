import '../entities/patrol.dart';
import '../repositories/patrol_repository.dart';

/// Use case: Start a new patrol session.
///
/// Creates the patrol locally in SQLite, queues it for remote sync,
/// and returns the created [Patrol] entity with status [PatrolStatus.active].
class StartPatrolUseCase {
  final PatrolRepository _repository;

  StartPatrolUseCase(this._repository);

  /// Execute the use case.
  ///
  /// [title] – patrol title / name.
  /// [leaderId] – the user ID of the patrol leader.
  /// [plotId] – optional forest plot being patrolled.
  /// [description] – optional description.
  Future<Patrol> call({
    required String title,
    required String leaderId,
    String? plotId,
    String? description,
  }) async {
    final now = DateTime.now();
    final patrol = Patrol(
      id: _generateId(),
      title: title,
      description: description,
      leaderId: leaderId,
      plotId: plotId,
      startTime: now,
      status: PatrolStatus.active,
      members: [
        PatrolMember(
          id: _generateId(),
          userId: leaderId,
          name: '',
          role: 'leader',
          joinedAt: now,
        ),
      ],
      syncStatus: SyncStatus.pending,
    );

    return _repository.startPatrol(patrol);
  }

  /// Generate a simple unique ID.
  /// In production, use UUID or similar.
  String _generateId() {
    return 'patrol_${DateTime.now().millisecondsSinceEpoch}';
  }
}
