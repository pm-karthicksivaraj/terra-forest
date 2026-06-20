part of 'patrol_bloc.dart';

abstract class PatrolEvent extends Equatable {
  const PatrolEvent();

  @override
  List<Object?> get props => [];
}

/// Load the list of patrols (with optional status filter).
class LoadPatrols extends PatrolEvent {
  final PatrolStatus? statusFilter;

  const LoadPatrols({this.statusFilter});

  @override
  List<Object?> get props => [statusFilter];
}

/// Start a new patrol session.
class StartPatrol extends PatrolEvent {
  final Patrol patrol;

  const StartPatrol({required this.patrol});

  @override
  List<Object?> get props => [patrol];
}

/// Complete an active patrol with the final route.
class CompletePatrol extends PatrolEvent {
  final String patrolId;
  final String routeGeojson;

  const CompletePatrol({
    required this.patrolId,
    required this.routeGeojson,
  });

  @override
  List<Object?> get props => [patrolId, routeGeojson];
}

/// Add a field observation to the active patrol.
class AddObservation extends PatrolEvent {
  final Observation observation;

  const AddObservation({required this.observation});

  @override
  List<Object?> get props => [observation];
}

/// Load observations for a specific patrol.
class LoadObservations extends PatrolEvent {
  final String patrolId;

  const LoadObservations({required this.patrolId});

  @override
  List<Object?> get props => [patrolId];
}

/// Update the current GPS location during an active patrol.
class UpdateLocation extends PatrolEvent {
  final double latitude;
  final double longitude;
  final double? accuracy;

  const UpdateLocation({
    required this.latitude,
    required this.longitude,
    this.accuracy,
  });

  @override
  List<Object?> get props => [latitude, longitude, accuracy];
}

/// Check-in to a patrol.
class PatrolCheckIn extends PatrolEvent {
  final String patrolId;

  const PatrolCheckIn({required this.patrolId});

  @override
  List<Object?> get props => [patrolId];
}

/// Check-out from a patrol.
class PatrolCheckOut extends PatrolEvent {
  final String patrolId;

  const PatrolCheckOut({required this.patrolId});

  @override
  List<Object?> get props => [patrolId];
}

/// SOS button pressed.
class SOSPressed extends PatrolEvent {
  final String? patrolId;

  const SOSPressed({this.patrolId});

  @override
  List<Object?> get props => [patrolId];
}
