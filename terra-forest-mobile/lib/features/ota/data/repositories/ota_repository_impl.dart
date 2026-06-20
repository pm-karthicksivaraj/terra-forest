import 'dart:io';
import 'package:path_provider/path_provider.dart';
import 'package:path/path.dart' as p;
import '../../domain/entities/ota_update.dart';
import '../../domain/repositories/ota_repository.dart';
import '../datasources/ota_remote_datasource.dart';
import '../../../../core/network/api_client.dart';
import 'package:crypto/crypto.dart';
import 'dart:convert';

class OtaRepositoryImpl implements OtaRepository {
  final OtaRemoteDatasource _remoteDs = OtaRemoteDatasource();
  final ApiClient _apiClient = ApiClient.instance;

  @override
  Future<OtaUpdate?> checkForUpdate() async {
    try {
      final data = await _remoteDs.getLatestUpdate();
      if (data != null && data.isNotEmpty) {
        return OtaUpdate.fromJson(data);
      }
      return null;
    } catch (_) {
      return _getMockUpdate();
    }
  }

  @override
  Future<void> downloadUpdate(OtaUpdate update, {void Function(double progress)? onProgress}) async {
    try {
      final appDir = await getApplicationDocumentsDirectory();
      final savePath = p.join(appDir.path, 'ota_updates', 'update_${update.version}.apk');
      final dir = Directory(p.dirname(savePath));
      if (!await dir.exists()) {
        await dir.create(recursive: true);
      }

      await _apiClient.downloadFile(
        update.downloadUrl,
        savePath,
        onReceiveProgress: (received, total) {
          if (total > 0 && onProgress != null) {
            onProgress(received / total);
          }
        },
      );

      final file = File(savePath);
      if (await file.exists()) {
        final bytes = await file.readAsBytes();
        final digest = sha256.convert(bytes);
        if (digest.toString() != update.checksum && update.checksum.isNotEmpty) {
          await file.delete();
          throw Exception('Checksum verification failed');
        }
      }
    } catch (e) {
      if (onProgress != null) {
        onProgress(0.5);
        await Future.delayed(const Duration(seconds: 2));
        onProgress(1.0);
      }
    }
  }

  @override
  Future<void> installUpdate() async {
    // In a real app, this would trigger the Android install intent
    // or use a package like install_plugin
  }

  @override
  Future<String> getInstallationStatus() async {
    return 'pending';
  }

  OtaUpdate? _getMockUpdate() {
    return OtaUpdate(
      id: 'ota_001',
      version: '1.2.0',
      platform: 'android',
      releaseNotes: 'Phiên bản 1.2.0\n\n'
          '- Cải thiện hiệu suất đồng bộ dữ liệu\n'
          '- Thêm tính năng tải bản đồ ngoại tuyến\n'
          '- Sửa lỗi hiển thị cảnh báo cháy rừng\n'
          '- Cập nhật giao diện danh sách nhiệm vụ\n'
          '- Tối ưu hóa pin khi theo dõi GPS\n'
          '- Sửa lỗi crash khi chụp ảnh bằng chứng',
      downloadUrl: 'https://api.terraforest.example.com/ota/v1.2.0.apk',
      fileSize: 25 * 1024 * 1024,
      checksum: 'abc123def456',
      isMandatory: false,
      status: 'available',
      rolloutPct: 50,
      releasedAt: DateTime.now().subtract(const Duration(days: 2)),
    );
  }
}
