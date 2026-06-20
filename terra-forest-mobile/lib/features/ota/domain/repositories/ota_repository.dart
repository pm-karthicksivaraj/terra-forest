import '../entities/ota_update.dart';

abstract class OtaRepository {
  Future<OtaUpdate?> checkForUpdate();
  Future<void> downloadUpdate(OtaUpdate update, {void Function(double progress)? onProgress});
  Future<void> installUpdate();
  Future<String> getInstallationStatus();
}
