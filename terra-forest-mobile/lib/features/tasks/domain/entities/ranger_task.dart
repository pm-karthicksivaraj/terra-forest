import 'package:equatable/equatable.dart';

class RangerTask extends Equatable {
  final String id;
  final String title;
  final String? description;
  final String? teamId;
  final String? assignedTo;
  final String taskType;
  final String priority;
  final String status;
  final DateTime? dueDate;
  final double? locationLat;
  final double? locationLng;
  final String? locationGeojson;
  final String? createdBy;
  final List<String> proofs;
  final String syncStatus;

  const RangerTask({
    required this.id,
    required this.title,
    this.description,
    this.teamId,
    this.assignedTo,
    required this.taskType,
    this.priority = 'medium',
    this.status = 'assigned',
    this.dueDate,
    this.locationLat,
    this.locationLng,
    this.locationGeojson,
    this.createdBy,
    this.proofs = const [],
    this.syncStatus = 'synced',
  });

  factory RangerTask.fromJson(Map<String, dynamic> json) {
    return RangerTask(
      id: json['id'] as String? ?? '',
      title: json['title'] as String? ?? '',
      description: json['description'] as String?,
      teamId: json['team_id'] as String?,
      assignedTo: json['assigned_to'] as String?,
      taskType: json['task_type'] as String? ?? 'patrol',
      priority: json['priority'] as String? ?? 'medium',
      status: json['status'] as String? ?? 'assigned',
      dueDate: json['due_date'] != null ? DateTime.tryParse(json['due_date'] as String) : null,
      locationLat: (json['location_lat'] as num?)?.toDouble(),
      locationLng: (json['location_lng'] as num?)?.toDouble(),
      locationGeojson: json['location_geojson'] as String?,
      createdBy: json['created_by'] as String?,
      proofs: (json['proofs'] as List<dynamic>?)?.map((e) => e as String).toList() ?? [],
      syncStatus: json['sync_status'] as String? ?? 'synced',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'team_id': teamId,
      'assigned_to': assignedTo,
      'task_type': taskType,
      'priority': priority,
      'status': status,
      'due_date': dueDate?.toIso8601String(),
      'location_lat': locationLat,
      'location_lng': locationLng,
      'location_geojson': locationGeojson,
      'created_by': createdBy,
      'proofs': proofs,
      'sync_status': syncStatus,
    };
  }

  RangerTask copyWith({
    String? status,
    String? syncStatus,
    List<String>? proofs,
  }) {
    return RangerTask(
      id: id,
      title: title,
      description: description,
      teamId: teamId,
      assignedTo: assignedTo,
      taskType: taskType,
      priority: priority,
      status: status ?? this.status,
      dueDate: dueDate,
      locationLat: locationLat,
      locationLng: locationLng,
      locationGeojson: locationGeojson,
      createdBy: createdBy,
      proofs: proofs ?? this.proofs,
      syncStatus: syncStatus ?? this.syncStatus,
    );
  }

  @override
  List<Object?> get props => [id, title, status, priority, taskType, syncStatus];
}
