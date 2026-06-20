import 'package:terra_forest_mobile/core/constants/app_constants.dart';
import 'package:terra_forest_mobile/core/storage/local_database.dart';

/// Seeds the local SQLite database with realistic Vietnamese forestry data
/// on first launch. This ensures all screens display meaningful content
/// even when the server is unreachable.
class DataSeeder {
  static const String _seededKey = 'data_seeded_v2';

  /// Seed the database if it hasn't been seeded yet.
  /// Returns true if seeding was performed, false if already seeded.
  static Future<bool> seedIfNeeded() async {
    final db = LocalDatabase.instance;
    final alreadySeeded = await db.getSetting(_seededKey);
    if (alreadySeeded == 'true') return false;

    await _seedAll(db);
    await db.setSetting(_seededKey, 'true');
    return true;
  }

  static Future<void> _seedAll(LocalDatabase db) async {
    final now = DateTime.now();

    // ── Users ──────────────────────────────────────────────────────────────
    final users = [
      {'id': 'user_001', 'name': 'Nguyễn Văn An', 'email': 'admin@terraforest.vn', 'avatar_url': null, 'roles_json': '["system_admin"]', 'province_id': AppConstants.provinceBinhPhuoc, 'is_active': 1},
      {'id': 'user_002', 'name': 'Trần Thị Bình', 'email': 'ops@terraforest.vn', 'avatar_url': null, 'roles_json': '["operations_manager"]', 'province_id': AppConstants.provinceDakNong, 'is_active': 1},
      {'id': 'user_003', 'name': 'Lê Hoàng Cường', 'email': 'teamlead@terraforest.vn', 'avatar_url': null, 'roles_json': '["team_lead"]', 'province_id': AppConstants.provinceBinhPhuoc, 'is_active': 1},
      {'id': 'user_004', 'name': 'Phạm Minh Đức', 'email': 'ranger@terraforest.vn', 'avatar_url': null, 'roles_json': '["ranger"]', 'province_id': AppConstants.provinceBinhPhuoc, 'is_active': 1},
      {'id': 'user_005', 'name': 'Hoàng Thị E', 'email': 'fieldofficer@terraforest.vn', 'avatar_url': null, 'roles_json': '["ranger"]', 'province_id': AppConstants.provinceDakLak, 'is_active': 1},
      {'id': 'user_006', 'name': 'Võ Quốc Phú', 'email': 'auditor@terraforest.vn', 'avatar_url': null, 'roles_json': '["auditor"]', 'province_id': AppConstants.provinceLamDong, 'is_active': 1},
    ];
    await db.bulkReplaceUsers(users);

    // ── Forest Plots ───────────────────────────────────────────────────────
    final plots = [
      {'id': 'plot_BP_001', 'plot_code': 'BP-001', 'province_id': AppConstants.provinceBinhPhuoc, 'area_ha': 125.5, 'forest_type': AppConstants.forestNatural, 'status': 'active', 'centroid_lat': 11.98, 'centroid_lng': 107.20, 'fire_risk': AppConstants.severityMedium, 'geometry_json': null, 'sync_status': 'synced'},
      {'id': 'plot_BP_002', 'plot_code': 'BP-002', 'province_id': AppConstants.provinceBinhPhuoc, 'area_ha': 89.3, 'forest_type': AppConstants.forestPlanted, 'status': 'active', 'centroid_lat': 11.95, 'centroid_lng': 107.24, 'fire_risk': AppConstants.severityLow, 'geometry_json': null, 'sync_status': 'synced'},
      {'id': 'plot_DN_003', 'plot_code': 'DN-003', 'province_id': AppConstants.provinceDakNong, 'area_ha': 210.0, 'forest_type': AppConstants.forestProtection, 'status': 'active', 'centroid_lat': 12.00, 'centroid_lng': 107.50, 'fire_risk': AppConstants.severityHigh, 'geometry_json': null, 'sync_status': 'synced'},
      {'id': 'plot_DL_002', 'plot_code': 'DL-002', 'province_id': AppConstants.provinceDakLak, 'area_ha': 67.8, 'forest_type': AppConstants.forestNatural, 'status': 'active', 'centroid_lat': 12.70, 'centroid_lng': 108.04, 'fire_risk': AppConstants.severityMedium, 'geometry_json': null, 'sync_status': 'synced'},
      {'id': 'plot_LD_001', 'plot_code': 'LD-001', 'province_id': AppConstants.provinceLamDong, 'area_ha': 340.2, 'forest_type': AppConstants.forestProtection, 'status': 'active', 'centroid_lat': 11.94, 'centroid_lng': 108.44, 'fire_risk': AppConstants.severityLow, 'geometry_json': null, 'sync_status': 'synced'},
      {'id': 'plot_CM_001', 'plot_code': 'CM-001', 'province_id': AppConstants.provinceCaMau, 'area_ha': 155.0, 'forest_type': AppConstants.forestMangrove, 'status': 'active', 'centroid_lat': 9.20, 'centroid_lng': 105.10, 'fire_risk': AppConstants.severityLow, 'geometry_json': null, 'sync_status': 'synced'},
    ];
    await db.bulkReplaceForestPlots(plots);

    // ── Geofences ──────────────────────────────────────────────────────────
    final geofences = [
      {'id': 'gf_001', 'name': 'Khu vực lõi VQG Bù Gia Mập', 'name_vi': 'Khu vực lõi VQG Bù Gia Mập', 'type': 'core_zone', 'geometry_json': '[[12.02,107.18],[12.02,107.26],[11.92,107.26],[11.92,107.18]]', 'center_lat': 11.97, 'center_lng': 107.22, 'radius_m': null, 'is_active': 1, 'color': '#FF9800', 'created_at': now.toIso8601String()},
      {'id': 'gf_002', 'name': 'Vùng đệm phía Bắc', 'name_vi': 'Vùng đệm phía Bắc', 'type': 'buffer_zone', 'geometry_json': '[[12.05,107.15],[12.05,107.28],[12.02,107.28],[12.02,107.15]]', 'center_lat': 12.035, 'center_lng': 107.215, 'radius_m': null, 'is_active': 1, 'color': '#4CAF50', 'created_at': now.toIso8601String()},
      {'id': 'gf_003', 'name': 'Vùng đệm phía Nam', 'name_vi': 'Vùng đệm phía Nam', 'type': 'buffer_zone', 'geometry_json': '[[11.92,107.15],[11.92,107.28],[11.88,107.28],[11.88,107.15]]', 'center_lat': 11.90, 'center_lng': 107.215, 'radius_m': null, 'is_active': 1, 'color': '#4CAF50', 'created_at': now.toIso8601String()},
    ];
    await db.bulkReplaceGeofences(geofences);

    // ── Alerts ─────────────────────────────────────────────────────────────
    final alerts = [
      {'id': 'alert_001', 'plot_id': 'plot_BP_001', 'alert_type': AppConstants.alertFireRisk, 'severity': AppConstants.severityCritical, 'status': 'active', 'message': 'Critical fire risk at plot BP-001', 'message_vi': 'Phát hiện nguy cơ cháy rừng cấp cao tại lô BP-001. Nhiệt độ vượt ngưỡng 40°C, độ ẩm dưới 20%.', 'detected_at': now.subtract(const Duration(minutes: 15)).toIso8601String(), 'acknowledged_by': null, 'acknowledged_at': null, 'sync_status': 'synced'},
      {'id': 'alert_002', 'plot_id': 'plot_DN_003', 'alert_type': AppConstants.alertDeforestation, 'severity': AppConstants.severityHigh, 'status': 'active', 'message': 'Illegal deforestation detected at plot DN-003', 'message_vi': 'Phát hiện phá rừng bất hợp pháp tại lô DN-003. Ảnh vệ tinh cho thấy mất 2.5ha rừng trong 7 ngày qua.', 'detected_at': now.subtract(const Duration(hours: 2)).toIso8601String(), 'acknowledged_by': null, 'acknowledged_at': null, 'sync_status': 'synced'},
      {'id': 'alert_003', 'plot_id': 'plot_DL_002', 'alert_type': AppConstants.alertForestChange, 'severity': AppConstants.severityMedium, 'status': 'active', 'message': 'Forest cover change at plot DL-002', 'message_vi': 'Thay đổi lớp phủ rừng phát hiện tại lô DL-002. Chuyển đổi từ rừng tự nhiên sang đất nông nghiệp ước tính 1.2ha.', 'detected_at': now.subtract(const Duration(hours: 6)).toIso8601String(), 'acknowledged_by': null, 'acknowledged_at': null, 'sync_status': 'synced'},
      {'id': 'alert_004', 'plot_id': 'plot_LD_001', 'alert_type': AppConstants.alertDisease, 'severity': AppConstants.severityMedium, 'status': 'acknowledged', 'message': 'Disease detected at plot LD-001', 'message_vi': 'Phát hiện dấu hiệu bệnh cháy lá trên cây thông tại lô LD-001. Cần kiểm tra thực địa.', 'detected_at': now.subtract(const Duration(days: 1)).toIso8601String(), 'acknowledged_by': 'user_005', 'acknowledged_at': now.subtract(const Duration(hours: 20)).toIso8601String(), 'sync_status': 'synced'},
      {'id': 'alert_005', 'plot_id': 'plot_CM_001', 'alert_type': AppConstants.alertAiDetection, 'severity': AppConstants.severityHigh, 'status': 'active', 'message': 'AI detected unusual activity at plot CM-001', 'message_vi': 'Hệ thống AI phát hiện hoạt động khai thác bất thường tại lô CM-002. Độ tin cậy 94%.', 'detected_at': now.subtract(const Duration(hours: 3)).toIso8601String(), 'acknowledged_by': null, 'acknowledged_at': null, 'sync_status': 'synced'},
      {'id': 'alert_006', 'plot_id': 'plot_BP_002', 'alert_type': AppConstants.alertFireRisk, 'severity': AppConstants.severityLow, 'status': 'resolved', 'message': 'Fire risk decreased at plot BP-002', 'message_vi': 'Nguy cơ cháy rừng đã giảm xuống mức thấp tại lô BP-005 sau mưa lớn.', 'detected_at': now.subtract(const Duration(days: 2)).toIso8601String(), 'acknowledged_by': 'user_003', 'acknowledged_at': now.subtract(const Duration(days: 1, hours: 20)).toIso8601String(), 'sync_status': 'synced'},
    ];
    await db.bulkReplaceAlerts(alerts);

    // ── Patrols ────────────────────────────────────────────────────────────
    final patrols = [
      {'id': 'patrol_001', 'title': 'Tuần tra khu vực lõi Bù Gia Mập', 'description': 'Tuần tra kiểm tra tình trạng rừng khu vực lõi, phát hiện dấu hiệu khai thác trái phép', 'leader_id': 'user_003', 'plot_id': 'plot_BP_001', 'start_time': now.subtract(const Duration(hours: 5)).toIso8601String(), 'end_time': null, 'status': 'active', 'route_geojson': null, 'sync_status': 'synced', 'created_at': now.subtract(const Duration(hours: 5)).toIso8601String(), 'updated_at': now.subtract(const Duration(hours: 5)).toIso8601String()},
      {'id': 'patrol_002', 'title': 'Tuần tra vùng đệm phía Bắc', 'description': 'Kiểm tra ranh giới vùng đệm, ghi nhận các loài động vật hoang dã', 'leader_id': 'user_004', 'plot_id': 'plot_BP_002', 'start_time': now.subtract(const Duration(days: 1)).toIso8601String(), 'end_time': now.subtract(const Duration(days: 1, hours: 3)).toIso8601String(), 'status': 'completed', 'route_geojson': null, 'sync_status': 'synced', 'created_at': now.subtract(const Duration(days: 1)).toIso8601String(), 'updated_at': now.subtract(const Duration(days: 1, hours: 3)).toIso8601String()},
      {'id': 'patrol_003', 'title': 'Kiểm tra cháy rừng Đắk Nông', 'description': 'Kiểm tra khu vực có nguy cơ cháy cao, đo nhiệt độ và độ ẩm', 'leader_id': 'user_005', 'plot_id': 'plot_DN_003', 'start_time': now.subtract(const Duration(days: 2)).toIso8601String(), 'end_time': now.subtract(const Duration(days: 2, hours: 4)).toIso8601String(), 'status': 'completed', 'route_geojson': null, 'sync_status': 'synced', 'created_at': now.subtract(const Duration(days: 2)).toIso8601String(), 'updated_at': now.subtract(const Duration(days: 2, hours: 4)).toIso8601String()},
      {'id': 'patrol_004', 'title': 'Khảo sát đa dạng sinh học Lâm Đồng', 'description': 'Ghi nhận các loài động thực vật quý hiếm tại khu vực Lâm Đồng', 'leader_id': 'user_003', 'plot_id': 'plot_LD_001', 'start_time': now.add(const Duration(days: 1)).toIso8601String(), 'end_time': null, 'status': 'planned', 'route_geojson': null, 'sync_status': 'synced', 'created_at': now.toIso8601String(), 'updated_at': now.toIso8601String()},
      {'id': 'patrol_005', 'title': 'Tuần tra rừng ngập mặn Cà Mau', 'description': 'Kiểm tra tình trạng rừng ngập mặn, đo mực nước biển', 'leader_id': 'user_004', 'plot_id': 'plot_CM_001', 'start_time': now.add(const Duration(days: 2)).toIso8601String(), 'end_time': null, 'status': 'planned', 'route_geojson': null, 'sync_status': 'synced', 'created_at': now.toIso8601String(), 'updated_at': now.toIso8601String()},
    ];
    await db.bulkReplacePatrols(patrols);

    // ── Patrol Members ─────────────────────────────────────────────────────
    final members = [
      {'id': 'pm_001', 'patrol_id': 'patrol_001', 'user_id': 'user_003', 'role': 'leader', 'joined_at': now.subtract(const Duration(hours: 5)).toIso8601String()},
      {'id': 'pm_002', 'patrol_id': 'patrol_001', 'user_id': 'user_004', 'role': 'member', 'joined_at': now.subtract(const Duration(hours: 5)).toIso8601String()},
      {'id': 'pm_003', 'patrol_id': 'patrol_001', 'user_id': 'user_005', 'role': 'member', 'joined_at': now.subtract(const Duration(hours: 5)).toIso8601String()},
      {'id': 'pm_004', 'patrol_id': 'patrol_002', 'user_id': 'user_004', 'role': 'leader', 'joined_at': now.subtract(const Duration(days: 1)).toIso8601String()},
      {'id': 'pm_005', 'patrol_id': 'patrol_003', 'user_id': 'user_005', 'role': 'leader', 'joined_at': now.subtract(const Duration(days: 2)).toIso8601String()},
    ];
    for (final m in members) {
      await db.upsertPatrolMember(m);
    }

    // ── Field Observations ─────────────────────────────────────────────────
    final observations = [
      {'id': 'obs_001', 'patrol_id': 'patrol_001', 'obs_type': 'tree_measurement', 'description': 'Đo kính cây giáng hương, DBH 45cm, chiều cao 22m', 'photo_path': null, 'latitude': 11.975, 'longitude': 107.205, 'accuracy': 3.5, 'recorded_at': now.subtract(const Duration(hours: 4)).toIso8601String(), 'sync_status': 'synced'},
      {'id': 'obs_002', 'patrol_id': 'patrol_001', 'obs_type': 'wildlife', 'description': 'Phát hiện đàn vọoc chà vá chân nâu (5 cá thể)', 'photo_path': null, 'latitude': 11.978, 'longitude': 107.210, 'accuracy': 5.0, 'recorded_at': now.subtract(const Duration(hours: 3)).toIso8601String(), 'sync_status': 'synced'},
      {'id': 'obs_003', 'patrol_id': 'patrol_001', 'obs_type': 'violation', 'description': 'Phát hiện dấu hiệu khai thác gỗ trái phép, 3 gốc cây bị cắt', 'photo_path': null, 'latitude': 11.982, 'longitude': 107.198, 'accuracy': 4.2, 'recorded_at': now.subtract(const Duration(hours: 2)).toIso8601String(), 'sync_status': 'synced'},
      {'id': 'obs_004', 'patrol_id': 'patrol_002', 'obs_type': 'biodiversity', 'description': 'Quan sát chim trú đông - 12 cá thể cò quăm', 'photo_path': null, 'latitude': 12.03, 'longitude': 107.22, 'accuracy': 6.0, 'recorded_at': now.subtract(const Duration(days: 1, hours: 2)).toIso8601String(), 'sync_status': 'synced'},
      {'id': 'obs_005', 'patrol_id': 'patrol_003', 'obs_type': 'fire_check', 'description': 'Đo nhiệt độ mặt đất 42°C, độ ẩm 15%, nguy cơ cháy cao', 'photo_path': null, 'latitude': 12.01, 'longitude': 107.48, 'accuracy': 3.8, 'recorded_at': now.subtract(const Duration(days: 2, hours: 3)).toIso8601String(), 'sync_status': 'synced'},
    ];
    await db.bulkReplaceObservations(observations);

    // ── Ranger Tasks ───────────────────────────────────────────────────────
    final tasks = [
      {'id': 'task_001', 'title': 'Tuần tra lô BP-001', 'description': 'Kiểm tra tình trạng rừng tại lô BP-001, khu vực Bình Phước', 'team_id': null, 'assigned_to': 'user_004', 'task_type': AppConstants.taskPatrol, 'priority': AppConstants.severityHigh, 'status': 'assigned', 'due_date': now.add(const Duration(days: 1)).toIso8601String(), 'location_lat': 11.98, 'location_lng': 107.20, 'location_geojson': null, 'created_by': 'user_001', 'sync_status': 'synced'},
      {'id': 'task_002', 'title': 'Kiểm tra cháy rừng khu vực Đắk Nông', 'description': 'Kiểm tra và báo cáo tình trạng cháy rừng tại lô DN-003', 'team_id': null, 'assigned_to': 'user_005', 'task_type': AppConstants.taskFireCheck, 'priority': AppConstants.severityCritical, 'status': 'in_progress', 'due_date': now.add(const Duration(hours: 6)).toIso8601String(), 'location_lat': 12.00, 'location_lng': 107.50, 'location_geojson': null, 'created_by': 'user_001', 'sync_status': 'synced'},
      {'id': 'task_003', 'title': 'Quan sát đa dạng sinh học LD-002', 'description': 'Ghi nhận và báo cáo các loài động thực vật tại lô LD-002', 'team_id': null, 'assigned_to': 'user_005', 'task_type': AppConstants.taskObservation, 'priority': AppConstants.severityMedium, 'status': 'assigned', 'due_date': now.add(const Duration(days: 3)).toIso8601String(), 'location_lat': 12.70, 'location_lng': 108.04, 'location_geojson': null, 'created_by': 'user_002', 'sync_status': 'synced'},
      {'id': 'task_004', 'title': 'Khảo sát ranh giới lô CM-001', 'description': 'Xác minh ranh giới lô rừng CM-001, Cà Mau', 'team_id': null, 'assigned_to': 'user_004', 'task_type': AppConstants.taskBoundarySurvey, 'priority': AppConstants.severityLow, 'status': 'completed', 'due_date': now.subtract(const Duration(days: 1)).toIso8601String(), 'location_lat': 9.20, 'location_lng': 105.10, 'location_geojson': null, 'created_by': 'user_001', 'sync_status': 'synced'},
      {'id': 'task_005', 'title': 'Thu thập bằng chứng phá rừng', 'description': 'Chụp ảnh và ghi nhận hiện trường phá rừng tại khu vực lô DL-002', 'team_id': null, 'assigned_to': 'user_005', 'task_type': AppConstants.taskEvidenceCollection, 'priority': AppConstants.severityHigh, 'status': 'verified', 'due_date': now.subtract(const Duration(days: 2)).toIso8601String(), 'location_lat': 12.70, 'location_lng': 108.04, 'location_geojson': null, 'created_by': 'user_002', 'sync_status': 'synced'},
      {'id': 'task_006', 'title': 'Đếm loài chim trú đông', 'description': 'Đếm và phân loại các loài chim trú đông tại khu vực Đắk Lắk', 'team_id': null, 'assigned_to': 'user_004', 'task_type': AppConstants.taskSpeciesCount, 'priority': AppConstants.severityMedium, 'status': 'in_progress', 'due_date': now.add(const Duration(days: 5)).toIso8601String(), 'location_lat': 12.70, 'location_lng': 108.04, 'location_geojson': null, 'created_by': 'user_001', 'sync_status': 'synced'},
    ];
    await db.bulkReplaceRangerTasks(tasks);

    // ── App Settings ───────────────────────────────────────────────────────
    await db.setSetting('user_name', 'Kiểm lâm Đức');
    await db.setSetting('user_role', 'ranger');
    await db.setSetting('last_sync_time', now.toIso8601String());
  }
}
