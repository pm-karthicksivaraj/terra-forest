part of 'evidence_bloc.dart';

abstract class EvidenceState extends Equatable {
  const EvidenceState();

  @override
  List<Object?> get props => [];
}

class EvidenceInitial extends EvidenceState {}

class EvidenceLoading extends EvidenceState {}

class EvidenceLoaded extends EvidenceState {
  final List<Evidence> evidenceList;
  final int pendingCount;

  const EvidenceLoaded({
    required this.evidenceList,
    this.pendingCount = 0,
  });

  @override
  List<Object?> get props => [evidenceList, pendingCount];
}

class EvidenceUploading extends EvidenceState {
  final double progress;

  const EvidenceUploading({required this.progress});

  @override
  List<Object?> get props => [progress];
}

class EvidenceError extends EvidenceState {
  final String message;

  const EvidenceError({required this.message});

  @override
  List<Object?> get props => [message];
}
