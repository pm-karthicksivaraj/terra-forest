import '../entities/evidence.dart';

abstract class EvidenceRepository {
  Future<List<Evidence>> getEvidence(String taskId);
  Future<Evidence> uploadEvidence(Evidence evidence);
  Future<List<Evidence>> getPendingUploads();
  Future<void> syncPendingUploads();
  Future<void> deleteEvidence(String id);
}
