part of 'home_bloc.dart';

/// KPI stats for the home dashboard.
class HomeStats {
  final double forestArea;
  final double carbonCredits;
  final int todayAlerts;
  final int activePatrols;
  final int pendingTasks;
  final int completedPatrols;

  const HomeStats({
    this.forestArea = 26037.0,
    this.carbonCredits = 12450.0,
    this.todayAlerts = 0,
    this.activePatrols = 0,
    this.pendingTasks = 0,
    this.completedPatrols = 0,
  });

  HomeStats copyWith({
    double? forestArea,
    double? carbonCredits,
    int? todayAlerts,
    int? activePatrols,
    int? pendingTasks,
    int? completedPatrols,
  }) {
    return HomeStats(
      forestArea: forestArea ?? this.forestArea,
      carbonCredits: carbonCredits ?? this.carbonCredits,
      todayAlerts: todayAlerts ?? this.todayAlerts,
      activePatrols: activePatrols ?? this.activePatrols,
      pendingTasks: pendingTasks ?? this.pendingTasks,
      completedPatrols: completedPatrols ?? this.completedPatrols,
    );
  }
}

/// Alert summary for the home dashboard.
class AlertSummary {
  final String id;
  final String alertType;
  final String severity;
  final String message;
  final String? messageVi;
  final DateTime detectedAt;

  const AlertSummary({
    required this.id,
    required this.alertType,
    required this.severity,
    required this.message,
    this.messageVi,
    required this.detectedAt,
  });

  String get displayMessage => messageVi ?? message;

  Color get severityColor {
    switch (severity.toLowerCase()) {
      case 'critical':
        return const Color(0xFFDC2626);
      case 'high':
        return const Color(0xFFEA580C);
      case 'medium':
        return const Color(0xFFD97706);
      case 'low':
        return const Color(0xFF16A34A);
      default:
        return const Color(0xFF16A34A);
    }
  }

  Color get severityLightColor {
    switch (severity.toLowerCase()) {
      case 'critical':
        return const Color(0xFFFEE2E2);
      case 'high':
        return const Color(0xFFFFEDD5);
      case 'medium':
        return const Color(0xFFFEF3C7);
      case 'low':
        return const Color(0xFFDCFCE7);
      default:
        return const Color(0xFFDCFCE7);
    }
  }

  String get severityLabel {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'Nghiêm trọng';
      case 'high':
        return 'Cao';
      case 'medium':
        return 'Trung bình';
      case 'low':
        return 'Thấp';
      default:
        return 'Thấp';
    }
  }

  IconData get icon {
    switch (alertType.toLowerCase()) {
      case 'fire_risk':
        return Icons.local_fire_department;
      case 'deforestation':
        return Icons.forest;
      case 'forest_change':
        return Icons.compare;
      case 'disease':
        return Icons.coronavirus;
      case 'ai_detection':
        return Icons.psychology;
      default:
        return Icons.warning_amber;
    }
  }
}

/// Task summary for the home dashboard.
class TaskSummary {
  final String id;
  final String title;
  final String priority;
  final String taskType;
  final DateTime? dueDate;
  final String status;

  const TaskSummary({
    required this.id,
    required this.title,
    required this.priority,
    required this.taskType,
    this.dueDate,
    required this.status,
  });

  Color get priorityColor {
    switch (priority.toLowerCase()) {
      case 'high':
        return const Color(0xFFEA580C);
      case 'medium':
        return const Color(0xFFD97706);
      case 'low':
        return const Color(0xFF16A34A);
      default:
        return const Color(0xFFD97706);
    }
  }

  String get priorityLabel {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'Cao';
      case 'medium':
        return 'Trung bình';
      case 'low':
        return 'Thấp';
      default:
        return 'Trung bình';
    }
  }

  IconData get icon {
    switch (taskType.toLowerCase()) {
      case 'patrol':
        return Icons.directions_walk;
      case 'observation':
        return Icons.visibility;
      case 'fire_check':
        return Icons.local_fire_department;
      case 'boundary_survey':
        return Icons.edit_location_alt;
      case 'species_count':
        return Icons.pets;
      case 'evidence_collection':
        return Icons.camera_alt;
      default:
        return Icons.assignment;
    }
  }
}

/// Weather data for the home dashboard.
class WeatherData {
  final double temperature;
  final double humidity;
  final String fireRisk; // 'low' | 'moderate' | 'high' | 'extreme'
  final String? description;

  const WeatherData({
    this.temperature = 28.0,
    this.humidity = 65.0,
    this.fireRisk = 'low',
    this.description,
  });

  Color get fireRiskColor {
    switch (fireRisk.toLowerCase()) {
      case 'extreme':
        return const Color(0xFFDC2626);
      case 'high':
        return const Color(0xFFEA580C);
      case 'moderate':
        return const Color(0xFFD97706);
      case 'low':
        return const Color(0xFF16A34A);
      default:
        return const Color(0xFF16A34A);
    }
  }

  String get fireRiskLabel {
    switch (fireRisk.toLowerCase()) {
      case 'extreme':
        return 'Cực kỳ cao';
      case 'high':
        return 'Cao';
      case 'moderate':
        return 'Trung bình';
      case 'low':
        return 'Thấp';
      default:
        return 'Thấp';
    }
  }
}

/// Sync status for the home dashboard indicator.
enum HomeSyncStatus {
  synced,
  syncing,
  offline;

  Color get color {
    switch (this) {
      case HomeSyncStatus.synced:
        return Colors.green;
      case HomeSyncStatus.syncing:
        return Colors.orange;
      case HomeSyncStatus.offline:
        return Colors.red;
    }
  }

  IconData get icon {
    switch (this) {
      case HomeSyncStatus.synced:
        return Icons.cloud_done;
      case HomeSyncStatus.syncing:
        return Icons.cloud_sync;
      case HomeSyncStatus.offline:
        return Icons.cloud_off;
    }
  }

  String get label {
    switch (this) {
      case HomeSyncStatus.synced:
        return 'Đã đồng bộ';
      case HomeSyncStatus.syncing:
        return 'Đang đồng bộ';
      case HomeSyncStatus.offline:
        return 'Ngoại tuyến';
    }
  }
}

// ─── States ─────────────────────────────────────────────────────────────────

abstract class HomeState extends Equatable {
  const HomeState();

  @override
  List<Object?> get props => [];
}

class HomeInitial extends HomeState {}

class HomeLoading extends HomeState {}

class HomeLoaded extends HomeState {
  final HomeStats stats;
  final List<AlertSummary> recentAlerts;
  final List<TaskSummary> pendingTasks;
  final WeatherData? weatherData;
  final HomeSyncStatus syncStatus;
  final String userName;
  final String userRole;

  const HomeLoaded({
    required this.stats,
    this.recentAlerts = const [],
    this.pendingTasks = const [],
    this.weatherData,
    this.syncStatus = HomeSyncStatus.synced,
    this.userName = 'Kiểm lâm',
    this.userRole = 'ranger',
  });

  String get roleLabel {
    switch (userRole) {
      case 'system_admin':
        return 'Quản trị hệ thống';
      case 'operations_manager':
        return 'Quản lý vận hành';
      case 'team_lead':
        return 'Trưởng nhóm';
      case 'ranger':
        return 'Kiểm lâm';
      case 'auditor':
        return 'Kiểm toán viên';
      default:
        return 'Kiểm lâm';
    }
  }

  bool get isOffline => syncStatus == HomeSyncStatus.offline;

  HomeLoaded copyWith({
    HomeStats? stats,
    List<AlertSummary>? recentAlerts,
    List<TaskSummary>? pendingTasks,
    WeatherData? weatherData,
    HomeSyncStatus? syncStatus,
    String? userName,
    String? userRole,
  }) {
    return HomeLoaded(
      stats: stats ?? this.stats,
      recentAlerts: recentAlerts ?? this.recentAlerts,
      pendingTasks: pendingTasks ?? this.pendingTasks,
      weatherData: weatherData ?? this.weatherData,
      syncStatus: syncStatus ?? this.syncStatus,
      userName: userName ?? this.userName,
      userRole: userRole ?? this.userRole,
    );
  }

  @override
  List<Object?> get props => [
        stats,
        recentAlerts,
        pendingTasks,
        weatherData,
        syncStatus,
        userName,
        userRole,
      ];
}

class HomeError extends HomeState {
  final String message;

  const HomeError({required this.message});

  @override
  List<Object?> get props => [message];
}
