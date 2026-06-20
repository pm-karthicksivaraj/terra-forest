import 'dart:io';
import '../../../../core/storage/local_database.dart';
import 'package:path_provider/path_provider.dart';
import 'package:path/path.dart' as p;

class EvidenceLocalDatasource {
  final LocalDatabase _localDb = LocalDatabase.instance;

  Future<List<Map<String, dynamic>>> getEvidenceByTask(String taskId) async {
    return _localDb.query(
      'task_proofs',
      where: 'task_id = ?',
      whereArgs: [taskId],
      orderBy: 'recorded_at DESC',
    );
  }

  Future<Map<String, dynamic>?> getEvidenceById(String id) async {
    final results = await _localDb.query(
      'task_proofs',
      where: 'id = ?',
      whereArgs: [id],
    );
    return results.isNotEmpty ? results.first : null;
  }

  Future<void> insertEvidence(Map<String, dynamic> evidence) async {
    await _localDb.upsertTaskProof(evidence);
  }

  Future<void> updateEvidence(Map<String, dynamic> evidence) async {
    await _localDb.updateTaskProof(evidence);
  }

  Future<void> deleteEvidence(String id) async {
    await _localDb.deleteTaskProof(id);
  }

  Future<List<Map<String, dynamic>>> getPendingUploads() async {
    return _localDb.query(
      'task_proofs',
      where: 'sync_status = ?',
      whereArgs: ['pending'],
      orderBy: 'recorded_at ASC',
    );
  }

  Future<void> markEvidenceSynced(String id) async {
    await _localDb.update(
      'task_proofs',
      {'sync_status': 'synced'},
      'id = ?',
      [id],
    );
  }

  Future<String> getEvidenceDirectory() async {
    final appDir = await getApplicationDocumentsDirectory();
    final evidenceDir = Directory(p.join(appDir.path, 'evidence'));
    if (!await evidenceDir.exists()) {
      await evidenceDir.create(recursive: true);
    }
    return evidenceDir.path;
  }

  Future<String> saveFileLocally(String sourcePath, String evidenceId) async {
    final evidenceDir = await getEvidenceDirectory();
    final ext = p.extension(sourcePath);
    final destPath = p.join(evidenceDir, '$evidenceId$ext');
    final sourceFile = File(sourcePath);
    if (await sourceFile.exists()) {
      await sourceFile.copy(destPath);
    }
    return destPath;
  }

  Future<int> getLocalStorageSize() async {
    final evidenceDir = await getEvidenceDirectory();
    final dir = Directory(evidenceDir);
    if (!await dir.exists()) return 0;
    int totalSize = 0;
    await for (final entity in dir.list(recursive: true)) {
      if (entity is File) {
        totalSize += await entity.length();
      }
    }
    return totalSize;
  }
}
