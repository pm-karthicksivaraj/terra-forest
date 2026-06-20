import '../../../../core/network/api_client.dart';

class OtaRemoteDatasource {
  final ApiClient _apiClient = ApiClient.instance;

  Future<Map<String, dynamic>?> getLatestUpdate() async {
    final response = await _apiClient.get('/api/v1/ota/latest');
    return response.data as Map<String, dynamic>?;
  }

  Future<Map<String, dynamic>> reportInstallation(String updateId) async {
    final response = await _apiClient.post(
      '/api/v1/ota/$updateId/install',
      data: {'status': 'installed'},
    );
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> getInstallationStatus(String updateId) async {
    final response = await _apiClient.get('/api/v1/ota/$updateId/status');
    return response.data as Map<String, dynamic>;
  }
}
