import 'package:equatable/equatable.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'package:terra_forest_mobile/core/network/api_client.dart';
import 'package:terra_forest_mobile/core/storage/local_database.dart';
import 'package:terra_forest_mobile/core/storage/sync_manager.dart';
import 'package:terra_forest_mobile/core/constants/app_constants.dart';

part 'home_event.dart';
part 'home_state.dart';

/// BLoC managing the home dashboard state.
///
/// Loads dashboard stats, recent alerts, pending tasks, and weather data
/// from the local database and remote API (offline-first).
/// Falls back to mock data when both are empty (first launch without server).
class HomeBloc extends Bloc<HomeEvent, HomeState> {
  final LocalDatabase _localDb;
  final ApiClient _apiClient;

  HomeBloc({
    required LocalDatabase localDb,
    required ApiClient apiClient,
  })  : _localDb = localDb,
        _apiClient = apiClient,
        super(HomeInitial()) {
    on<HomeLoadRequested>(_onHomeLoadRequested);
    on<RefreshHome>(_onRefreshHome);
    on<NavigateToAlert>(_onNavigateToAlert);
    on<NavigateToTask>(_onNavigateToTask);
    on<SyncRequested>(_onSyncRequested);
  }

  factory HomeBloc.create() {
    return HomeBloc(
      localDb: LocalDatabase.instance,
      apiClient: ApiClient.instance,
    );
  }

  Future<void> _onHomeLoadRequested(
    HomeLoadRequested event,
    Emitter<HomeState> emit,
  ) async {
    emit(HomeLoading());
    try {
      final data = await _loadHomeData();
      emit(data);
    } catch (e) {
      emit(HomeError(message: 'Không thể tải dữ liệu: $e'));
    }
  }

  Future<void> _onRefreshHome(
    RefreshHome event,
    Emitter<HomeState> emit,
  ) async {
    try {
      final data = await _loadHomeData();
      emit(data);
    } catch (e) {
      emit(HomeError(message: 'Không thể làm mới: $e'));
    }
  }

  Future<void> _onNavigateToAlert(
    NavigateToAlert event,
    Emitter<HomeState> emit,
  ) async {}

  Future<void> _onNavigateToTask(
    NavigateToTask event,
    Emitter<HomeState> emit,
  ) async {}

  Future<void> _onSyncRequested(
    SyncRequested event,
    Emitter<HomeState> emit,
  ) async {
    if (state is HomeLoaded) {
      final current = state as HomeLoaded;
      emit(current.copyWith(syncStatus: HomeSyncStatus.syncing));
      try {
        final isOnline = await _apiClient.isConnected();
        if (!isOnline) {
          emit(current.copyWith(syncStatus: HomeSyncStatus.offline));
          return;
        }
        try {
          await SyncManager.instance.forceSyncAll();
        } catch (_) {}
        final data = await _loadHomeData();
        emit(data);
      } catch (e) {
        emit(current.copyWith(syncStatus: HomeSyncStatus.offline));
      }
    }
  }

  Future<HomeState> _loadHomeData() async {
    final isOnline = await _apiClient.isConnected();
    final syncStatus = isOnline
        ? HomeSyncStatus.synced
        : HomeSyncStatus.offline;

    var activePatrols = await _localDb.getPatrolsByStatus('active');
    var activeAlerts = await _localDb.getActiveAlerts();
    var pendingTasks = await _localDb.getTasksByStatus('assigned');
    var allPatrols = await _localDb.getAllPatrols();

    final useMockFallback = activePatrols.isEmpty &&
        activeAlerts.isEmpty &&
        pendingTasks.isEmpty &&
        allPatrols.isEmpty;

    if (useMockFallback) {
      activePatrols = _getMockActivePatrols();
      activeAlerts = _getMockActiveAlerts();
      pendingTasks = _getMockPendingTasks();
    }

    final completedPatrols = useMockFallback
        ? _getMockCompletedPatrols()
        : await _localDb.getPatrolsByStatus('completed');

    final stats = HomeStats(
      forestArea: 26037.0,
      carbonCredits: 12450.0,
      todayAlerts: activeAlerts.length,
      activePatrols: activePatrols.length,
      pendingTasks: pendingTasks.length,
      completedPatrols: completedPatrols.length,
    );

    final alertSummaries = activeAlerts.take(3).map((alert) {
      return AlertSummary(
        id: alert['id'] as String? ?? '',
        alertType: alert['alert_type'] as String? ?? 'other',
        severity: alert['severity'] as String? ?? 'low',
        message: alert['message'] as String? ?? '',
        messageVi: alert['message_vi'] as String?,
        detectedAt: alert['detected_at'] != null
            ? DateTime.parse(alert['detected_at'] as String)
            : DateTime.now(),
      );
    }).toList();

    final taskSummaries = pendingTasks.take(3).map((task) {
      return TaskSummary(
        id: task['id'] as String? ?? '',
        title: task['title'] as String? ?? '',
        priority: task['priority'] as String? ?? 'medium',
        taskType: task['task_type'] as String? ?? 'other',
        dueDate: task['due_date'] != null
            ? DateTime.parse(task['due_date'] as String)
            : null,
        status: task['status'] as String? ?? 'assigned',
      );
    }).toList();

    const weatherData = WeatherData(
      temperature: 28.5,
      humidity: 72.0,
      fireRisk: 'low',
      description: 'Nắng ít mây',
    );

    final userName = await _localDb.getSetting('user_name') ?? 'Kiểm lâm';
    final userRole = await _localDb.getSetting('user_role') ?? 'ranger';

    return HomeLoaded(
      stats: stats,
      recentAlerts: alertSummaries,
      pendingTasks: taskSummaries,
      weatherData: weatherData,
      syncStatus: syncStatus,
      userName: userName,
      userRole: userRole,
    );
  }

  List<Map<String, dynamic>> _getMockActivePatrols() {
    final now = DateTime.now();
    return [
      {'id': 'patrol_001', 'title': 'Tuần tra khu vực lõi Bù Gia Mập', 'status': 'active', 'leader_id': 'user_003', 'start_time': now.subtract(const Duration(hours: 5)).toIso8601String()},
    ];
  }

  List<Map<String, dynamic>> _getMockCompletedPatrols() {
    final now = DateTime.now();
    return [
      {'id': 'patrol_002', 'title': 'Tuần tra vùng đệm phía Bắc', 'status': 'completed', 'leader_id': 'user_004', 'start_time': now.subtract(const Duration(days: 1)).toIso8601String()},
      {'id': 'patrol_003', 'title': 'Kiểm tra cháy rừng Đắk Nông', 'status': 'completed', 'leader_id': 'user_005', 'start_time': now.subtract(const Duration(days: 2)).toIso8601String()},
    ];
  }

  List<Map<String, dynamic>> _getMockActiveAlerts() {
    final now = DateTime.now();
    return [
      {'id': 'alert_001', 'alert_type': AppConstants.alertFireRisk, 'severity': AppConstants.severityCritical, 'status': 'active', 'message': 'Critical fire risk', 'message_vi': 'Phát hiện nguy cơ cháy rừng cấp cao tại lô BP-001. Nhiệt độ vượt 40°C.', 'detected_at': now.subtract(const Duration(minutes: 15)).toIso8601String()},
      {'id': 'alert_002', 'alert_type': AppConstants.alertDeforestation, 'severity': AppConstants.severityHigh, 'status': 'active', 'message': 'Deforestation detected', 'message_vi': 'Phát hiện phá rừng bất hợp pháp tại lô DN-003. Mất 2.5ha rừng.', 'detected_at': now.subtract(const Duration(hours: 2)).toIso8601String()},
      {'id': 'alert_003', 'alert_type': AppConstants.alertForestChange, 'severity': AppConstants.severityMedium, 'status': 'active', 'message': 'Forest change', 'message_vi': 'Thay đổi lớp phủ rừng tại lô DL-002. 1.2ha bị chuyển đổi.', 'detected_at': now.subtract(const Duration(hours: 6)).toIso8601String()},
      {'id': 'alert_004', 'alert_type': AppConstants.alertDisease, 'severity': AppConstants.severityMedium, 'status': 'acknowledged', 'message': 'Disease detected', 'message_vi': 'Bệnh cháy lá trên cây thông tại lô LD-001.', 'detected_at': now.subtract(const Duration(days: 1)).toIso8601String()},
      {'id': 'alert_005', 'alert_type': AppConstants.alertAiDetection, 'severity': AppConstants.severityHigh, 'status': 'active', 'message': 'AI detection', 'message_vi': 'AI phát hiện khai thác bất thường tại lô CM-002. Tin cậy 94%.', 'detected_at': now.subtract(const Duration(hours: 3)).toIso8601String()},
    ];
  }

  List<Map<String, dynamic>> _getMockPendingTasks() {
    final now = DateTime.now();
    return [
      {'id': 'task_001', 'title': 'Tuần tra lô BP-001', 'task_type': AppConstants.taskPatrol, 'priority': AppConstants.severityHigh, 'status': 'assigned', 'due_date': now.add(const Duration(days: 1)).toIso8601String()},
      {'id': 'task_002', 'title': 'Kiểm tra cháy rừng Đắk Nông', 'task_type': AppConstants.taskFireCheck, 'priority': AppConstants.severityCritical, 'status': 'in_progress', 'due_date': now.add(const Duration(hours: 6)).toIso8601String()},
      {'id': 'task_003', 'title': 'Quan sát đa dạng sinh học', 'task_type': AppConstants.taskObservation, 'priority': AppConstants.severityMedium, 'status': 'assigned', 'due_date': now.add(const Duration(days: 3)).toIso8601String()},
    ];
  }
}
