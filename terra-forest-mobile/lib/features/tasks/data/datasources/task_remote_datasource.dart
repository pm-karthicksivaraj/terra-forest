import '../../../../core/network/api_client.dart';

class TaskRemoteDatasource {
  final ApiClient _apiClient = ApiClient.instance;

  Future<List<Map<String, dynamic>>> getTasks({
    String? status,
    String? type,
    String? priority,
  }) async {
    final queryParams = <String, dynamic>{};
    if (status != null) queryParams['status'] = status;
    if (type != null) queryParams['type'] = type;
    if (priority != null) queryParams['priority'] = priority;

    final response = await _apiClient.get(
      '/api/v1/tasks',
      queryParameters: queryParams.isNotEmpty ? queryParams : null,
    );
    final data = response.data as List<dynamic>;
    return data.map((e) => e as Map<String, dynamic>).toList();
  }

  Future<Map<String, dynamic>> getTaskById(String id) async {
    final response = await _apiClient.get('/api/v1/tasks/$id');
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> updateTaskStatus(String id, String status) async {
    final response = await _apiClient.put(
      '/api/v1/tasks/$id/status',
      data: {'status': status},
    );
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> addProof(String taskId, Map<String, dynamic> proof) async {
    final response = await _apiClient.post(
      '/api/v1/tasks/$taskId/proofs',
      data: proof,
    );
    return response.data as Map<String, dynamic>;
  }
}
