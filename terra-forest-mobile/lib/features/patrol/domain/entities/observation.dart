/// Type of field observation collected during a patrol.
enum ObservationType {
  photo,
  video,
  voiceNote,
  logging,     // Illegal logging detection
  fire,        // Fire / burn scar
  wildlife,    // Wildlife sighting
  boundary,    // Boundary marker / encroachment
  vegetation,  // Vegetation change
  other;

  String get displayName {
    switch (this) {
      case ObservationType.photo:
        return 'Ảnh';
      case ObservationType.video:
        return 'Video';
      case ObservationType.voiceNote:
        return 'Ghi âm';
      case ObservationType.logging:
        return 'Phá rừng';
      case ObservationType.fire:
        return 'Cháy rừng';
      case ObservationType.wildlife:
        return 'Động vật hoang dã';
      case ObservationType.boundary:
        return 'Ranh giới';
      case ObservationType.vegetation:
        return 'Thực vật';
      case ObservationType.other:
        return 'Khác';
    }
  }

  String get apiValue {
    switch (this) {
      case ObservationType.photo:
        return 'photo';
      case ObservationType.video:
        return 'video';
      case ObservationType.voiceNote:
        return 'voice_note';
      case ObservationType.logging:
        return 'logging';
      case ObservationType.fire:
        return 'fire';
      case ObservationType.wildlife:
        return 'wildlife';
      case ObservationType.boundary:
        return 'boundary';
      case ObservationType.vegetation:
        return 'vegetation';
      case ObservationType.other:
        return 'other';
    }
  }

  static ObservationType fromApiValue(String value) {
    switch (value.toLowerCase()) {
      case 'photo':
        return ObservationType.photo;
      case 'video':
        return ObservationType.video;
      case 'voice_note':
        return ObservationType.voiceNote;
      case 'logging':
        return ObservationType.logging;
      case 'fire':
        return ObservationType.fire;
      case 'wildlife':
        return ObservationType.wildlife;
      case 'boundary':
        return ObservationType.boundary;
      case 'vegetation':
        return ObservationType.vegetation;
      case 'other':
      default:
        return ObservationType.other;
    }
  }

  /// Whether this observation type involves a media file.
  bool get hasMedia =>
      this == ObservationType.photo ||
      this == ObservationType.video ||
      this == ObservationType.voiceNote;
}

/// Sync status for an observation entity.
enum ObservationSyncStatus {
  synced,
  pending,
  failed;

  String get apiValue {
    switch (this) {
      case ObservationSyncStatus.synced:
        return 'synced';
      case ObservationSyncStatus.pending:
        return 'pending';
      case ObservationSyncStatus.failed:
        return 'failed';
    }
  }

  static ObservationSyncStatus fromApiValue(String value) {
    switch (value.toLowerCase()) {
      case 'synced':
        return ObservationSyncStatus.synced;
      case 'failed':
        return ObservationSyncStatus.failed;
      case 'pending':
      default:
        return ObservationSyncStatus.pending;
    }
  }
}

/// A field observation recorded during a patrol.
class Observation {
  final String id;
  final String patrolId;
  final ObservationType obsType;
  final String? description;
  final String? photoPath;
  final double? latitude;
  final double? longitude;
  final double? accuracy;
  final DateTime recordedAt;
  final ObservationSyncStatus syncStatus;

  const Observation({
    required this.id,
    required this.patrolId,
    required this.obsType,
    this.description,
    this.photoPath,
    this.latitude,
    this.longitude,
    this.accuracy,
    required this.recordedAt,
    this.syncStatus = ObservationSyncStatus.pending,
  });

  /// Whether the observation has GPS coordinates.
  bool get hasLocation => latitude != null && longitude != null;

  /// Whether the observation has an attached media file.
  bool get hasMedia => photoPath != null && photoPath!.isNotEmpty;

  /// Whether this observation still needs to be synced.
  bool get needsSync => syncStatus != ObservationSyncStatus.synced;

  Observation copyWith({
    String? id,
    String? patrolId,
    ObservationType? obsType,
    String? description,
    String? photoPath,
    double? latitude,
    double? longitude,
    double? accuracy,
    DateTime? recordedAt,
    ObservationSyncStatus? syncStatus,
  }) {
    return Observation(
      id: id ?? this.id,
      patrolId: patrolId ?? this.patrolId,
      obsType: obsType ?? this.obsType,
      description: description ?? this.description,
      photoPath: photoPath ?? this.photoPath,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      accuracy: accuracy ?? this.accuracy,
      recordedAt: recordedAt ?? this.recordedAt,
      syncStatus: syncStatus ?? this.syncStatus,
    );
  }

  /// Serialize to JSON matching the API and local DB schema.
  Map<String, dynamic> toJson() => {
        'id': id,
        'patrol_id': patrolId,
        'obs_type': obsType.apiValue,
        'description': description,
        'photo_path': photoPath,
        'latitude': latitude,
        'longitude': longitude,
        'accuracy': accuracy,
        'recorded_at': recordedAt.toIso8601String(),
        'sync_status': syncStatus.apiValue,
      };

  /// Deserialize from API / local DB map.
  factory Observation.fromJson(Map<String, dynamic> json) => Observation(
        id: json['id'] as String,
        patrolId: json['patrol_id'] as String? ?? '',
        obsType: ObservationType.fromApiValue(
            json['obs_type'] as String? ?? 'other'),
        description: json['description'] as String?,
        photoPath: json['photo_path'] as String?,
        latitude: (json['latitude'] as num?)?.toDouble(),
        longitude: (json['longitude'] as num?)?.toDouble(),
        accuracy: (json['accuracy'] as num?)?.toDouble(),
        recordedAt: json['recorded_at'] != null
            ? DateTime.parse(json['recorded_at'] as String)
            : DateTime.now(),
        syncStatus: ObservationSyncStatus.fromApiValue(
            json['sync_status'] as String? ?? 'pending'),
      );

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is Observation && runtimeType == other.runtimeType && id == other.id;

  @override
  int get hashCode => id.hashCode;
}
