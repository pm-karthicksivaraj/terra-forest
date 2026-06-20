import 'package:equatable/equatable.dart';

class OtaUpdate extends Equatable {
  final String id;
  final String version;
  final String platform;
  final String releaseNotes;
  final String downloadUrl;
  final int fileSize;
  final String checksum;
  final bool isMandatory;
  final String status;
  final int rolloutPct;
  final DateTime releasedAt;

  const OtaUpdate({
    required this.id,
    required this.version,
    required this.platform,
    required this.releaseNotes,
    required this.downloadUrl,
    required this.fileSize,
    required this.checksum,
    this.isMandatory = false,
    this.status = 'available',
    this.rolloutPct = 100,
    required this.releasedAt,
  });

  factory OtaUpdate.fromJson(Map<String, dynamic> json) {
    return OtaUpdate(
      id: json['id'] as String? ?? '',
      version: json['version'] as String? ?? '',
      platform: json['platform'] as String? ?? 'android',
      releaseNotes: json['release_notes'] as String? ?? '',
      downloadUrl: json['download_url'] as String? ?? '',
      fileSize: json['file_size'] as int? ?? 0,
      checksum: json['checksum'] as String? ?? '',
      isMandatory: json['is_mandatory'] as bool? ?? false,
      status: json['status'] as String? ?? 'available',
      rolloutPct: json['rollout_pct'] as int? ?? 100,
      releasedAt: json['released_at'] != null
          ? DateTime.parse(json['released_at'] as String)
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'version': version,
      'platform': platform,
      'release_notes': releaseNotes,
      'download_url': downloadUrl,
      'file_size': fileSize,
      'checksum': checksum,
      'is_mandatory': isMandatory,
      'status': status,
      'rollout_pct': rolloutPct,
      'released_at': releasedAt.toIso8601String(),
    };
  }

  String get fileSizeFormatted {
    if (fileSize < 1024) return '$fileSize B';
    if (fileSize < 1024 * 1024) return '${(fileSize / 1024).toStringAsFixed(1)} KB';
    return '${(fileSize / (1024 * 1024)).toStringAsFixed(1)} MB';
  }

  OtaUpdate copyWith({String? status}) {
    return OtaUpdate(
      id: id,
      version: version,
      platform: platform,
      releaseNotes: releaseNotes,
      downloadUrl: downloadUrl,
      fileSize: fileSize,
      checksum: checksum,
      isMandatory: isMandatory,
      status: status ?? this.status,
      rolloutPct: rolloutPct,
      releasedAt: releasedAt,
    );
  }

  @override
  List<Object?> get props => [id, version, status];
}
