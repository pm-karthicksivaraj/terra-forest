import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/constants/app_constants.dart';
import '../../../../core/network/api_client.dart';
import '../../../../core/storage/local_database.dart';

part 'alerts_event.dart';
part 'alerts_state.dart';

class AlertsBloc extends Bloc<AlertsEvent, AlertsState> {
  final ApiClient _apiClient = ApiClient.instance;
  final LocalDatabase _localDb = LocalDatabase.instance;

  AlertsBloc() : super(AlertsInitial()) {
    on<LoadAlerts>(_onLoadAlerts);
    on<FilterAlerts>(_onFilterAlerts);
    on<AcknowledgeAlert>(_onAcknowledgeAlert);
    on<RefreshAlerts>(_onRefreshAlerts);
    on<AlertReceived>(_onAlertReceived);
  }

  Future<void> _onLoadAlerts(
    LoadAlerts event,
    Emitter<AlertsState> emit,
  ) async {
    emit(AlertsLoading());
    try {
      final localAlerts = await _localDb.getAllAlerts();
      if (localAlerts.isNotEmpty) {
        emit(AlertsLoaded(alerts: localAlerts));
      }
      try {
        final response = await _apiClient.get('/api/v1/alerts');
        final data = response.data as List<dynamic>;
        final alerts = data.map((e) => e as Map<String, dynamic>).toList();
        for (final alert in alerts) {
          await _localDb.upsertAlert(alert);
        }
        final updatedAlerts = await _localDb.getAllAlerts();
        emit(AlertsLoaded(alerts: updatedAlerts));
      } catch (e) {
        if (localAlerts.isEmpty) {
          emit(AlertsLoaded(alerts: _getMockAlerts()));
        }
      }
    } catch (e) {
      emit(AlertsLoaded(alerts: _getMockAlerts()));
    }
  }

  Future<void> _onFilterAlerts(
    FilterAlerts event,
    Emitter<AlertsState> emit,
  ) async {
    final currentState = state;
    if (currentState is AlertsLoaded) {
      emit(AlertsLoaded(
        alerts: currentState.alerts,
        filterType: event.type,
        filterSeverity: event.severity,
        filterStatus: event.status,
      ));
    }
  }

  Future<void> _onAcknowledgeAlert(
    AcknowledgeAlert event,
    Emitter<AlertsState> emit,
  ) async {
    final currentState = state;
    if (currentState is AlertsLoaded) {
      final updatedAlerts = currentState.alerts.map((alert) {
        if (alert['id'] == event.id) {
          return {
            ...alert,
            'status': 'acknowledged',
            'acknowledged_at': DateTime.now().toUtc().toIso8601String(),
          };
        }
        return alert;
      }).toList();

      await _localDb.updateAlert({
        'id': event.id,
        'status': 'acknowledged',
        'acknowledged_at': DateTime.now().toUtc().toIso8601String(),
      });

      try {
        await _apiClient.put('/api/v1/alerts/${event.id}/acknowledge');
      } catch (_) {}

      emit(AlertsLoaded(
        alerts: updatedAlerts,
        filterType: currentState.filterType,
        filterSeverity: currentState.filterSeverity,
        filterStatus: currentState.filterStatus,
      ));
    }
  }

  Future<void> _onRefreshAlerts(
    RefreshAlerts event,
    Emitter<AlertsState> emit,
  ) async {
    try {
      final response = await _apiClient.get('/api/v1/alerts');
      final data = response.data as List<dynamic>;
      final alerts = data.map((e) => e as Map<String, dynamic>).toList();
      for (final alert in alerts) {
        await _localDb.upsertAlert(alert);
      }
      final updatedAlerts = await _localDb.getAllAlerts();
      final currentState = state;
      if (currentState is AlertsLoaded) {
        emit(AlertsLoaded(
          alerts: updatedAlerts,
          filterType: currentState.filterType,
          filterSeverity: currentState.filterSeverity,
          filterStatus: currentState.filterStatus,
        ));
      } else {
        emit(AlertsLoaded(alerts: updatedAlerts));
      }
    } catch (e) {
      final localAlerts = await _localDb.getAllAlerts();
      if (localAlerts.isNotEmpty) {
        emit(AlertsLoaded(alerts: localAlerts));
      } else {
        emit(AlertsError(message: 'Không thể làm mới cảnh báo: $e'));
      }
    }
  }

  Future<void> _onAlertReceived(
    AlertReceived event,
    Emitter<AlertsState> emit,
  ) async {
    final currentState = state;
    await _localDb.upsertAlert(event.alert);
    if (currentState is AlertsLoaded) {
      final updatedAlerts = [event.alert, ...currentState.alerts];
      emit(AlertsLoaded(
        alerts: updatedAlerts,
        filterType: currentState.filterType,
        filterSeverity: currentState.filterSeverity,
        filterStatus: currentState.filterStatus,
      ));
    } else {
      emit(AlertsLoaded(alerts: [event.alert]));
    }
  }

  List<Map<String, dynamic>> _getMockAlerts() {
    final now = DateTime.now();
    return [
      {
        'id': 'alert_001',
        'plot_id': 'plot_BP_001',
        'alert_type': AppConstants.alertFireRisk,
        'severity': AppConstants.severityCritical,
        'status': 'active',
        'message': 'Phát hiện nguy cơ cháy rừng cấp cao tại lô BP-001',
        'message_vi': 'Phát hiện nguy cơ cháy rừng cấp cao tại lô BP-001. Nhiệt độ vượt ngưỡng 40°C, độ ẩm dưới 20%.',
        'detected_at': now.subtract(const Duration(minutes: 15)).toIso8601String(),
        'acknowledged_by': null,
        'acknowledged_at': null,
      },
      {
        'id': 'alert_002',
        'plot_id': 'plot_DN_003',
        'alert_type': AppConstants.alertDeforestation,
        'severity': AppConstants.severityHigh,
        'status': 'active',
        'message': 'Phát hiện phá rừng bất hợp pháp tại lô DN-003',
        'message_vi': 'Phát hiện phá rừng bất hợp pháp tại lô DN-003. Ảnh vệ tinh cho thấy mất 2.5ha rừng trong 7 ngày qua.',
        'detected_at': now.subtract(const Duration(hours: 2)).toIso8601String(),
        'acknowledged_by': null,
        'acknowledged_at': null,
      },
      {
        'id': 'alert_003',
        'plot_id': 'plot_DL_002',
        'alert_type': AppConstants.alertForestChange,
        'severity': AppConstants.severityMedium,
        'status': 'active',
        'message': 'Thay đổi lớp phủ rừng tại lô DL-002',
        'message_vi': 'Thay đổi lớp phủ rừng phát hiện tại lô DL-002. Chuyển đổi từ rừng tự nhiên sang đất nông nghiệp ước tính 1.2ha.',
        'detected_at': now.subtract(const Duration(hours: 6)).toIso8601String(),
        'acknowledged_by': null,
        'acknowledged_at': null,
      },
      {
        'id': 'alert_004',
        'plot_id': 'plot_LD_001',
        'alert_type': AppConstants.alertDisease,
        'severity': AppConstants.severityMedium,
        'status': 'acknowledged',
        'message': 'Phát hiện bệnh dịch trên cây trồng tại lô LD-001',
        'message_vi': 'Phát hiện dấu hiệu bệnh cháy lá trên cây thông tại lô LD-001. Cần kiểm tra thực địa.',
        'detected_at': now.subtract(const Duration(days: 1)).toIso8601String(),
        'acknowledged_by': 'user_005',
        'acknowledged_at': now.subtract(const Duration(hours: 20)).toIso8601String(),
      },
      {
        'id': 'alert_005',
        'plot_id': 'plot_CM_002',
        'alert_type': AppConstants.alertAiDetection,
        'severity': AppConstants.severityHigh,
        'status': 'active',
        'message': 'AI phát hiện hoạt động bất thường tại lô CM-002',
        'message_vi': 'Hệ thống AI phát hiện hoạt động khai thác bất thường tại lô CM-002. Độ tin cậy 94%.',
        'detected_at': now.subtract(const Duration(hours: 3)).toIso8601String(),
        'acknowledged_by': null,
        'acknowledged_at': null,
      },
      {
        'id': 'alert_006',
        'plot_id': 'plot_BP_005',
        'alert_type': AppConstants.alertFireRisk,
        'severity': AppConstants.severityLow,
        'status': 'resolved',
        'message': 'Nguy cơ cháy rừng giảm tại lô BP-005',
        'message_vi': 'Nguy cơ cháy rừng đã giảm xuống mức thấp tại lô BP-005 sau mưa lớn.',
        'detected_at': now.subtract(const Duration(days: 2)).toIso8601String(),
        'acknowledged_by': 'user_003',
        'acknowledged_at': now.subtract(const Duration(days: 1, hours: 20)).toIso8601String(),
      },
    ];
  }
}
