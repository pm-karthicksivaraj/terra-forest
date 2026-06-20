import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../domain/entities/evidence.dart';
import '../../domain/repositories/evidence_repository.dart';
import '../../data/repositories/evidence_repository_impl.dart';
import '../../../../core/constants/app_constants.dart';

part 'evidence_event.dart';
part 'evidence_state.dart';

class EvidenceBloc extends Bloc<EvidenceEvent, EvidenceState> {
  final EvidenceRepository _evidenceRepository = EvidenceRepositoryImpl();

  EvidenceBloc() : super(EvidenceInitial()) {
    on<LoadEvidence>(_onLoadEvidence);
    on<CapturePhoto>(_onCapturePhoto);
    on<RecordVideo>(_onRecordVideo);
    on<RecordVoice>(_onRecordVoice);
    on<UploadPending>(_onUploadPending);
    on<DeleteEvidence>(_onDeleteEvidence);
  }

  Future<void> _onLoadEvidence(
    LoadEvidence event,
    Emitter<EvidenceState> emit,
  ) async {
    emit(EvidenceLoading());
    try {
      final evidenceList = await _evidenceRepository.getEvidence(event.taskId);
      final pendingUploads = await _evidenceRepository.getPendingUploads();
      if (evidenceList.isEmpty) {
        emit(EvidenceLoaded(
          evidenceList: _getMockEvidence(event.taskId),
          pendingCount: pendingUploads.length,
        ));
      } else {
        emit(EvidenceLoaded(
          evidenceList: evidenceList,
          pendingCount: pendingUploads.length,
        ));
      }
    } catch (e) {
      emit(EvidenceLoaded(
        evidenceList: _getMockEvidence(event.taskId),
        pendingCount: 0,
      ));
    }
  }

  Future<void> _onCapturePhoto(
    CapturePhoto event,
    Emitter<EvidenceState> emit,
  ) async {
    emit(const EvidenceUploading(progress: 0));
    try {
      final evidence = Evidence(
        id: 'evidence_${DateTime.now().millisecondsSinceEpoch}',
        taskId: event.taskId,
        uploadedBy: 'current_user',
        proofType: AppConstants.evidencePhoto,
        recordedAt: DateTime.now(),
        syncStatus: 'pending',
      );
      await _evidenceRepository.uploadEvidence(evidence);
      emit(const EvidenceUploading(progress: 1.0));
      add(LoadEvidence(taskId: event.taskId));
    } catch (e) {
      emit(EvidenceError(message: 'Không thể chụp ảnh: $e'));
    }
  }

  Future<void> _onRecordVideo(
    RecordVideo event,
    Emitter<EvidenceState> emit,
  ) async {
    emit(const EvidenceUploading(progress: 0));
    try {
      final evidence = Evidence(
        id: 'evidence_${DateTime.now().millisecondsSinceEpoch}',
        taskId: event.taskId,
        uploadedBy: 'current_user',
        proofType: AppConstants.evidenceVideo,
        recordedAt: DateTime.now(),
        syncStatus: 'pending',
      );
      await _evidenceRepository.uploadEvidence(evidence);
      emit(const EvidenceUploading(progress: 1.0));
      add(LoadEvidence(taskId: event.taskId));
    } catch (e) {
      emit(EvidenceError(message: 'Không thể quay video: $e'));
    }
  }

  Future<void> _onRecordVoice(
    RecordVoice event,
    Emitter<EvidenceState> emit,
  ) async {
    emit(const EvidenceUploading(progress: 0));
    try {
      final evidence = Evidence(
        id: 'evidence_${DateTime.now().millisecondsSinceEpoch}',
        taskId: event.taskId,
        uploadedBy: 'current_user',
        proofType: AppConstants.evidenceVoiceNote,
        recordedAt: DateTime.now(),
        syncStatus: 'pending',
      );
      await _evidenceRepository.uploadEvidence(evidence);
      emit(const EvidenceUploading(progress: 1.0));
      add(LoadEvidence(taskId: event.taskId));
    } catch (e) {
      emit(EvidenceError(message: 'Không thể ghi âm: $e'));
    }
  }

  Future<void> _onUploadPending(
    UploadPending event,
    Emitter<EvidenceState> emit,
  ) async {
    try {
      await _evidenceRepository.syncPendingUploads();
      final currentState = state;
      if (currentState is EvidenceLoaded && currentState.evidenceList.isNotEmpty) {
        add(LoadEvidence(taskId: currentState.evidenceList.first.taskId));
      }
    } catch (e) {
      emit(EvidenceError(message: 'Không thể đồng bộ: $e'));
    }
  }

  Future<void> _onDeleteEvidence(
    DeleteEvidence event,
    Emitter<EvidenceState> emit,
  ) async {
    try {
      await _evidenceRepository.deleteEvidence(event.id);
      final currentState = state;
      if (currentState is EvidenceLoaded) {
        final updated = currentState.evidenceList.where((e) => e.id != event.id).toList();
        emit(EvidenceLoaded(
          evidenceList: updated,
          pendingCount: currentState.pendingCount,
        ));
      }
    } catch (e) {
      emit(EvidenceError(message: 'Không thể xóa bằng chứng: $e'));
    }
  }

  List<Evidence> _getMockEvidence(String taskId) {
    final now = DateTime.now();
    return [
      Evidence(
        id: 'ev_001',
        taskId: taskId,
        uploadedBy: 'user_003',
        proofType: AppConstants.evidencePhoto,
        filePath: '/data/evidence/photo_001.jpg',
        fileSize: 2048000,
        mimeType: 'image/jpeg',
        thumbnailPath: '/data/evidence/thumb_001.jpg',
        latitude: 11.97,
        longitude: 107.22,
        description: 'Ảnh hiện trường phá rừng',
        recordedAt: now.subtract(const Duration(hours: 3)),
        syncStatus: 'synced',
      ),
      Evidence(
        id: 'ev_002',
        taskId: taskId,
        uploadedBy: 'user_003',
        proofType: AppConstants.evidenceVideo,
        filePath: '/data/evidence/video_001.mp4',
        fileSize: 15360000,
        mimeType: 'video/mp4',
        thumbnailPath: '/data/evidence/thumb_video_001.jpg',
        durationSecs: 45,
        latitude: 11.97,
        longitude: 107.22,
        description: 'Video hiện trường cháy rừng',
        recordedAt: now.subtract(const Duration(hours: 2)),
        syncStatus: 'synced',
      ),
      Evidence(
        id: 'ev_003',
        taskId: taskId,
        uploadedBy: 'user_004',
        proofType: AppConstants.evidenceVoiceNote,
        filePath: '/data/evidence/voice_001.m4a',
        fileSize: 512000,
        mimeType: 'audio/m4a',
        durationSecs: 120,
        latitude: 11.97,
        longitude: 107.22,
        description: 'Ghi âm mô tả hiện trường',
        recordedAt: now.subtract(const Duration(hours: 1)),
        syncStatus: 'pending',
      ),
      Evidence(
        id: 'ev_004',
        taskId: taskId,
        uploadedBy: 'user_005',
        proofType: AppConstants.evidenceDocument,
        filePath: '/data/evidence/report_001.pdf',
        fileSize: 1024000,
        mimeType: 'application/pdf',
        description: 'Báo cáo kiểm tra hiện trường',
        recordedAt: now.subtract(const Duration(minutes: 30)),
        syncStatus: 'pending',
      ),
    ];
  }
}
