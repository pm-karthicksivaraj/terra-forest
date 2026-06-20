import 'observation.dart';

/// Enum representing the current status of a patrol.
enum PatrolStatus {
  planned,
  active,
  completed,
  cancelled;

  String get displayName {
    switch (this) {
      case PatrolStatus.planned:
        return 'Đã lên kế hoạch';
      case PatrolStatus.active:
        return 'Đang hoạt động';
      case PatrolStatus.completed:
        return 'Đã hoàn thành';
      case PatrolStatus.cancelled:
        return 'Đã huỷ';
    }
  }

  String get apiValue {
    switch (this) {
      case PatrolStatus.planned:
        return 'planned';
      case PatrolStatus.active:
        return 'active';
      case PatrolStatus.completed:
        return 'completed';
      case PatrolStatus.cancelled:
        return 'cancelled';
    }
  }

  static PatrolStatus fromApiValue(String value) {
    switch (value.toLowerCase()) {
      case 'active':
        return PatrolStatus.active;
      case 'completed':
        return PatrolStatus.completed;
      case 'cancelled':
        return PatrolStatus.cancelled;
      case 'planned':
      default:
        return PatrolStatus.planned;
    }
  }
}

/// Enum representing sync status of a local entity.
enum SyncStatus {
  synced,
  pending,
  failed;

  String get apiValue {
    switch (this) {
      case SyncStatus.synced:
        return 'synced';
      case SyncStatus.pending:
        return 'pending';
      case SyncStatus.failed:
        return 'failed';
    }
  }

  static SyncStatus fromApiValue(String value) {
    switch (value.toLowerCase()) {
      case 'synced':
        return SyncStatus.synced;
      case 'failed':
        return SyncStatus.failed;
      case 'pending':
      default:
        return SyncStatus.pending;
    }
  }
}

/// A patrol member with role information.
class PatrolMember {
  final String id;
  final String userId;
  final String name;
  final String? avatarUrl;
  final String role; // 'leader' | 'member'
  final DateTime joinedAt;

  const PatrolMember({
    required this.id,
    required this.userId,
    required this.name,
    this.avatarUrl,
    required this.role,
    required this.joinedAt,
  });

  PatrolMember copyWith({
    String? id,
    String? userId,
    String? name,
    String? avatarUrl,
    String? role,
    DateTime? joinedAt,
  }) {
    return PatrolMember(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      name: name ?? this.name,
      avatarUrl: avatarUrl ?? this.avatarUrl,
      role: role ?? this.role,
      joinedAt: joinedAt ?? this.joinedAt,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'user_id': userId,
        'name': name,
        'avatar_url': avatarUrl,
        'role': role,
        'joined_at': joinedAt.toIso8601String(),
      };

  factory PatrolMember.fromJson(Map<String, dynamic> json) => PatrolMember(
        id: json['id'] as String,
        userId: json['user_id'] as String? ?? json['userId'] as String? ?? '',
        name: json['name'] as String? ?? '',
        avatarUrl: json['avatar_url'] as String?,
        role: json['role'] as String? ?? 'member',
        joinedAt: json['joined_at'] != null
            ? DateTime.parse(json['joined_at'] as String)
            : DateTime.now(),
      );

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is PatrolMember && runtimeType == other.runtimeType && id == other.id;

  @override
  int get hashCode => id.hashCode;
}

/// Core Patrol entity used across domain, data, and presentation layers.
class Patrol {
  final String id;
  final String title;
  final String? description;
  final String leaderId;
  final String? plotId;
  final DateTime? startTime;
  final DateTime? endTime;
  final PatrolStatus status;
  final String? routeGeojson;
  final List<PatrolMember> members;
  final List<Observation> observations;
  final SyncStatus syncStatus;

  const Patrol({
    required this.id,
    required this.title,
    this.description,
    required this.leaderId,
    this.plotId,
    this.startTime,
    this.endTime,
    this.status = PatrolStatus.planned,
    this.routeGeojson,
    this.members = const [],
    this.observations = const [],
    this.syncStatus = SyncStatus.synced,
  });

  /// The leader name, resolved from members list if available.
  String get leaderName {
    final leader = members.where((m) => m.role == 'leader').firstOrNull;
    return leader?.name ?? leaderId;
  }

  /// Number of members in the patrol.
  int get memberCount => members.length;

  /// Number of observations collected.
  int get observationCount => observations.length;

  /// Count of photo-type observations.
  int get photoCount =>
      observations.where((o) => o.obsType == ObservationType.photo).length;

  /// Count of video-type observations.
  int get videoCount =>
      observations.where((o) => o.obsType == ObservationType.video).length;

  /// Count of voice-note observations.
  int get voiceNoteCount =>
      observations.where((o) => o.obsType == ObservationType.voiceNote).length;

  /// Duration of patrol, or null if not yet completed.
  Duration? get duration {
    if (startTime == null) return null;
    final end = endTime ?? DateTime.now();
    return end.difference(startTime!);
  }

  /// Whether this patrol is currently active.
  bool get isActive => status == PatrolStatus.active;

  /// Whether this patrol is in a completed/planned state for viewing details.
  bool get isViewable =>
      status == PatrolStatus.completed || status == PatrolStatus.planned;

  Patrol copyWith({
    String? id,
    String? title,
    String? description,
    String? leaderId,
    String? plotId,
    DateTime? startTime,
    DateTime? endTime,
    PatrolStatus? status,
    String? routeGeojson,
    List<PatrolMember>? members,
    List<Observation>? observations,
    SyncStatus? syncStatus,
  }) {
    return Patrol(
      id: id ?? this.id,
      title: title ?? this.title,
      description: description ?? this.description,
      leaderId: leaderId ?? this.leaderId,
      plotId: plotId ?? this.plotId,
      startTime: startTime ?? this.startTime,
      endTime: endTime ?? this.endTime,
      status: status ?? this.status,
      routeGeojson: routeGeojson ?? this.routeGeojson,
      members: members ?? this.members,
      observations: observations ?? this.observations,
      syncStatus: syncStatus ?? this.syncStatus,
    );
  }

  /// Serialize to JSON matching the API and local DB schema.
  Map<String, dynamic> toJson() => {
        'id': id,
        'title': title,
        'description': description,
        'leader_id': leaderId,
        'plot_id': plotId,
        'start_time': startTime?.toIso8601String(),
        'end_time': endTime?.toIso8601String(),
        'status': status.apiValue,
        'route_geojson': routeGeojson,
        'sync_status': syncStatus.apiValue,
        'created_at': (startTime ?? DateTime.now()).toIso8601String(),
        'updated_at': DateTime.now().toIso8601String(),
      };

  /// Deserialize from API / local DB map.
  factory Patrol.fromJson(Map<String, dynamic> json) => Patrol(
        id: json['id'] as String,
        title: json['title'] as String? ?? '',
        description: json['description'] as String?,
        leaderId: json['leader_id'] as String? ?? '',
        plotId: json['plot_id'] as String?,
        startTime: json['start_time'] != null
            ? DateTime.parse(json['start_time'] as String)
            : null,
        endTime: json['end_time'] != null
            ? DateTime.parse(json['end_time'] as String)
            : null,
        status: PatrolStatus.fromApiValue(
            json['status'] as String? ?? 'planned'),
        routeGeojson: json['route_geojson'] as String?,
        members: (json['members'] as List?)
                ?.map((m) => PatrolMember.fromJson(m as Map<String, dynamic>))
                .toList() ??
            [],
        observations: (json['observations'] as List?)
                ?.map(
                    (o) => Observation.fromJson(o as Map<String, dynamic>))
                .toList() ??
            [],
        syncStatus: SyncStatus.fromApiValue(
            json['sync_status'] as String? ?? 'synced'),
      );

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is Patrol && runtimeType == other.runtimeType && id == other.id;

  @override
  int get hashCode => id.hashCode;
}
