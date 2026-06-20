part of 'patrol_bloc.dart';

abstract class PatrolState extends Equatable {
  const PatrolState();

  @override
  List<Object?> get props => [];
}

/// Initial state before any data is loaded.
class PatrolInitial extends PatrolState {}

/// Loading state while fetching data.
class PatrolLoading extends PatrolState {}

/// Patrols have been loaded successfully.
class PatrolsLoaded extends PatrolState {
  final List<Patrol> patrols;
  final Patrol? activePatrol;
  final List<Observation> observations;
  final PatrolStatus? statusFilter;
  final double? currentLatitude;
  final double? currentLongitude;
  final double? currentAccuracy;
  final bool isOffline;

  const PatrolsLoaded({
    required this.patrols,
    this.activePatrol,
    this.observations = const [],
    this.statusFilter,
    this.currentLatitude,
    this.currentLongitude,
    this.currentAccuracy,
    this.isOffline = false,
  });

  /// Filtered patrols based on the status filter.
  List<Patrol> get filteredPatrols {
    if (statusFilter == null) return patrols;
    return patrols.where((p) => p.status == statusFilter).toList();
  }

  PatrolsLoaded copyWith({
    List<Patrol>? patrols,
    Patrol? activePatrol,
    List<Observation>? observations,
    PatrolStatus? statusFilter,
    double? currentLatitude,
    double? currentLongitude,
    double? currentAccuracy,
    bool? isOffline,
  }) {
    return PatrolsLoaded(
      patrols: patrols ?? this.patrols,
      activePatrol: activePatrol ?? this.activePatrol,
      observations: observations ?? this.observations,
      statusFilter: statusFilter ?? this.statusFilter,
      currentLatitude: currentLatitude ?? this.currentLatitude,
      currentLongitude: currentLongitude ?? this.currentLongitude,
      currentAccuracy: currentAccuracy ?? this.currentAccuracy,
      isOffline: isOffline ?? this.isOffline,
    );
  }

  @override
  List<Object?> get props => [
        patrols,
        activePatrol,
        observations,
        statusFilter,
        currentLatitude,
        currentLongitude,
        currentAccuracy,
        isOffline,
      ];
}

/// Error state with a user-facing message.
class PatrolError extends PatrolState {
  final String message;

  const PatrolError({required this.message});

  @override
  List<Object?> get props => [message];
}

/// Check-in succeeded.
class PatrolCheckInSuccess extends PatrolState {
  final String patrolId;

  const PatrolCheckInSuccess({required this.patrolId});

  @override
  List<Object?> get props => [patrolId];
}

/// Check-out succeeded.
class PatrolCheckOutSuccess extends PatrolState {
  final String patrolId;

  const PatrolCheckOutSuccess({required this.patrolId});

  @override
  List<Object?> get props => [patrolId];
}
