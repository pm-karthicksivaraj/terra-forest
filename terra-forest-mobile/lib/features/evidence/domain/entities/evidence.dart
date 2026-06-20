import 'package:equatable/equatable.dart';

class Evidence extends Equatable {
  final String id;
  final String taskId;
  final String uploadedBy;
  final String proofType;
  final String? filePath;
  final int? fileSize;
  final String? mimeType;
  final String? thumbnailPath;
  final int? durationSecs;
  final double? latitude;
  final double? longitude;
  final String? description;
  final String? metadataJson;
  final DateTime recordedAt;
  final String syncStatus;

  const Evidence({
    required this.id,
    required this.taskId,
    required this.uploadedBy,
    required this.proofType,
    this.filePath,
    this.fileSize,
    this.mimeType,
    this.thumbnailPath,
    this.durationSecs,
    this.latitude,
    this.longitude,
    this.description,
    this.metadataJson,
    required this.recordedAt,
    this.syncStatus = 'pending',
  });

  factory Evidence.fromJson(Map<String, dynamic> json) {
    return Evidence(
      id: json['id'] as String? ?? '',
      taskId: json['task_id'] as String? ?? '',
      uploadedBy: json['uploaded_by'] as String? ?? '',
      proofType: json['proof_type'] as String? ?? 'photo',
      filePath: json['file_path'] as String?,
      fileSize: json['file_size'] as int?,
      mimeType: json['mime_type'] as String?,
      thumbnailPath: json['thumbnail_path'] as String?,
      durationSecs: json['duration_secs'] as int?,
      latitude: (json['latitude'] as num?)?.toDouble(),
      longitude: (json['longitude'] as num?)?.toDouble(),
      description: json['description'] as String?,
      metadataJson: json['metadata_json'] as String?,
      recordedAt: json['recorded_at'] != null
          ? DateTime.parse(json['recorded_at'] as String)
          : DateTime.now(),
      syncStatus: json['sync_status'] as String? ?? 'pending',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'task_id': taskId,
      'uploaded_by': uploadedBy,
      'proof_type': proofType,
      'file_path': filePath,
      'file_size': fileSize,
      'mime_type': mimeType,
      'thumbnail_path': thumbnailPath,
      'duration_secs': durationSecs,
      'latitude': latitude,
      'longitude': longitude,
      'description': description,
      'metadata_json': metadataJson,
      'recorded_at': recordedAt.toIso8601String(),
      'sync_status': syncStatus,
    };
  }

  Evidence copyWith({
    String? syncStatus,
    String? filePath,
    String? thumbnailPath,
  }) {
    return Evidence(
      id: id,
      taskId: taskId,
      uploadedBy: uploadedBy,
      proofType: proofType,
      filePath: filePath ?? this.filePath,
      fileSize: fileSize,
      mimeType: mimeType,
      thumbnailPath: thumbnailPath ?? this.thumbnailPath,
      durationSecs: durationSecs,
      latitude: latitude,
      longitude: longitude,
      description: description,
      metadataJson: metadataJson,
      recordedAt: recordedAt,
      syncStatus: syncStatus ?? this.syncStatus,
    );
  }

  String get fileSizeFormatted {
    if (fileSize == null) return '--';
    if (fileSize! < 1024) return '$fileSize B';
    if (fileSize! < 1024 * 1024) return '${(fileSize! / 1024).toStringAsFixed(1)} KB';
    return '${(fileSize! / (1024 * 1024)).toStringAsFixed(1)} MB';
  }

  @override
  List<Object?> get props => [id, taskId, proofType, syncStatus];
}
