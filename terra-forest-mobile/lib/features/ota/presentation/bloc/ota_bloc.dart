import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../domain/entities/ota_update.dart';
import '../../domain/repositories/ota_repository.dart';
import '../../data/repositories/ota_repository_impl.dart';

part 'ota_event.dart';
part 'ota_state.dart';

class OtaBloc extends Bloc<OtaEvent, OtaState> {
  final OtaRepository _otaRepository = OtaRepositoryImpl();
  static const String currentVersion = '1.1.0';

  OtaBloc() : super(OtaInitial()) {
    on<OtaCheckRequested>(_onCheckRequested);
    on<OtaDownloadStarted>(_onDownloadStarted);
    on<OtaInstallRequested>(_onInstallRequested);
    on<OtaCancelDownload>(_onCancelDownload);

    // Auto-check on creation
    add(const OtaCheckRequested());
  }

  Future<void> _onCheckRequested(
    OtaCheckRequested event,
    Emitter<OtaState> emit,
  ) async {
    emit(OtaChecking());
    try {
      final update = await _otaRepository.checkForUpdate();
      if (update != null && _isNewerVersion(update.version, currentVersion)) {
        emit(OtaUpdateAvailable(update: update));
      } else {
        emit(const OtaNoUpdate(currentVersion: currentVersion));
      }
    } catch (e) {
      emit(OtaError(message: 'Không thể kiểm tra cập nhật: $e'));
    }
  }

  Future<void> _onDownloadStarted(
    OtaDownloadStarted event,
    Emitter<OtaState> emit,
  ) async {
    final currentState = state;
    if (currentState is OtaUpdateAvailable) {
      final update = currentState.update;
      try {
        await _otaRepository.downloadUpdate(
          update,
          onProgress: (progress) {
            emit(OtaDownloading(progress: progress, update: update));
          },
        );
        emit(OtaReadyToInstall(update: update));
      } catch (e) {
        emit(OtaError(message: 'Tải xuống thất bại: $e'));
        emit(OtaUpdateAvailable(update: update));
      }
    }
  }

  Future<void> _onInstallRequested(
    OtaInstallRequested event,
    Emitter<OtaState> emit,
  ) async {
    emit(OtaInstalling());
    try {
      await _otaRepository.installUpdate();
      emit(const OtaNoUpdate(currentVersion: currentVersion));
    } catch (e) {
      emit(OtaError(message: 'Cài đặt thất bại: $e'));
    }
  }

  Future<void> _onCancelDownload(
    OtaCancelDownload event,
    Emitter<OtaState> emit,
  ) async {
    final currentState = state;
    if (currentState is OtaDownloading) {
      emit(OtaUpdateAvailable(update: currentState.update));
    }
  }

  bool _isNewerVersion(String remote, String local) {
    final remoteParts = remote.split('.').map(int.parse).toList();
    final localParts = local.split('.').map(int.parse).toList();
    for (var i = 0; i < 3; i++) {
      final r = i < remoteParts.length ? remoteParts[i] : 0;
      final l = i < localParts.length ? localParts[i] : 0;
      if (r > l) return true;
      if (r < l) return false;
    }
    return false;
  }
}
