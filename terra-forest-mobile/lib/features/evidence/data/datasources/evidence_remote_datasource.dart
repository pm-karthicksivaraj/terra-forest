import 'dart:io';
import '../../../../core/network/api_client.dart';

class EvidenceRemoteDatasource {
  final ApiClient _apiClient = ApiClient.instance;

  Future<List<Map<String, dynamic>>> getEvidenceByTask(String taskId) async {
    final response = await _apiClient.get('/api/v1/evidence', queryParameters: {'task_id': taskId});
    final data = response.data as List<dynamic>;
    return data.map((e) => e as Map<String, dynamic>).toList();
  }

  Future<Map<String, dynamic>> uploadEvidence({
    required File file,
    required String taskId,
    required String proofType,
    String? description,
    double? latitude,
    double? longitude,
  }) async {
    final response = await _apiClient.uploadFile(
      '/api/v1/evidence/upload',
      file,
      fieldName: 'file',
      extraData: {
        'task_id': taskId,
        'proof_type': proofType,
        if (description != null) 'description': description,
        if (latitude != null) 'latitude': latitude.toString(),
        if (longitude != null) 'longitude': longitude.toString(),
      },
    );
    return response.data as Map<String, dynamic>;
  }

  Future<void> deleteEvidence(String id) async {
    await _apiClient.delete('/api/v1/evidence/$id');
  }
}
