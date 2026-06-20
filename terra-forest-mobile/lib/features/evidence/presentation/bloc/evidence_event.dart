part of 'evidence_bloc.dart';

abstract class EvidenceEvent extends Equatable {
  const EvidenceEvent();

  @override
  List<Object?> get props => [];
}

class LoadEvidence extends EvidenceEvent {
  final String taskId;

  const LoadEvidence({required this.taskId});

  @override
  List<Object?> get props => [taskId];
}

class CapturePhoto extends EvidenceEvent {
  final String taskId;

  const CapturePhoto({required this.taskId});

  @override
  List<Object?> get props => [taskId];
}

class RecordVideo extends EvidenceEvent {
  final String taskId;

  const RecordVideo({required this.taskId});

  @override
  List<Object?> get props => [taskId];
}

class RecordVoice extends EvidenceEvent {
  final String taskId;

  const RecordVoice({required this.taskId});

  @override
  List<Object?> get props => [taskId];
}

class UploadPending extends EvidenceEvent {
  const UploadPending();
}

class DeleteEvidence extends EvidenceEvent {
  final String id;

  const DeleteEvidence({required this.id});

  @override
  List<Object?> get props => [id];
}
