import 'dart:io';
import '../../domain/entities/evidence.dart';
import '../../domain/repositories/evidence_repository.dart';
import '../datasources/evidence_remote_datasource.dart';
import '../datasources/evidence_local_datasource.dart';

class EvidenceRepositoryImpl implements EvidenceRepository {
  final EvidenceRemoteDatasource _remoteDs = EvidenceRemoteDatasource();
  final EvidenceLocalDatasource _localDs = EvidenceLocalDatasource();

  @override
  Future<List<Evidence>> getEvidence(String taskId) async {
    try {
      final remoteData = await _remoteDs.getEvidenceByTask(taskId);
      for (final item in remoteData) {
        await _localDs.insertEvidence(item);
      }
      return remoteData.map((e) => Evidence.fromJson(e)).toList();
    } catch (_) {
      final localData = await _localDs.getEvidenceByTask(taskId);
      return localData.map((e) => Evidence.fromJson(e)).toList();
    }
  }

  @override
  Future<Evidence> uploadEvidence(Evidence evidence) async {
    final localPath = evidence.filePath;
    if (localPath != null && localPath.isNotEmpty) {
      try {
        final savedPath = await _localDs.saveFileLocally(localPath, evidence.id);
        final updatedEvidence = evidence.copyWith(filePath: savedPath);
        await _localDs.insertEvidence(updatedEvidence.toJson());

        if (File(savedPath).existsSync()) {
          final result = await _remoteDs.uploadEvidence(
            file: File(savedPath),
            taskId: evidence.taskId,
            proofType: evidence.proofType,
            description: evidence.description,
            latitude: evidence.latitude,
            longitude: evidence.longitude,
          );
          await _localDs.markEvidenceSynced(evidence.id);
          return Evidence.fromJson(result);
        }
      } catch (_) {
        await _localDs.insertEvidence({
          ...evidence.toJson(),
          'sync_status': 'pending',
        });
        return evidence;
      }
    }
    await _localDs.insertEvidence({
      ...evidence.toJson(),
      'sync_status': 'pending',
    });
    return evidence;
  }

  @override
  Future<List<Evidence>> getPendingUploads() async {
    final pendingData = await _localDs.getPendingUploads();
    return pendingData.map((e) => Evidence.fromJson(e)).toList();
  }

  @override
  Future<void> syncPendingUploads() async {
    final pendingItems = await _localDs.getPendingUploads();
    for (final item in pendingItems) {
      try {
        final filePath = item['file_path'] as String?;
        if (filePath != null && File(filePath).existsSync()) {
          await _remoteDs.uploadEvidence(
            file: File(filePath),
            taskId: item['task_id'] as String,
            proofType: item['proof_type'] as String,
            description: item['description'] as String?,
            latitude: (item['latitude'] as num?)?.toDouble(),
            longitude: (item['longitude'] as num?)?.toDouble(),
          );
          await _localDs.markEvidenceSynced(item['id'] as String);
        }
      } catch (_) {
        continue;
      }
    }
  }

  @override
  Future<void> deleteEvidence(String id) async {
    await _localDs.deleteEvidence(id);
    try {
      await _remoteDs.deleteEvidence(id);
    } catch (_) {}
  }
}
