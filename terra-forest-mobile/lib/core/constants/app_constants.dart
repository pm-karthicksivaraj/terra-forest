import 'package:flutter/material.dart';

/// Central constants for the Terra Forest MRV mobile application.
/// All values are aligned with the web platform configuration.
class AppConstants {
  AppConstants._();

  // ─── API Configuration ────────────────────────────────────────────────────

  /// Base URL for API requests.
  /// Production: Terra Forest web app deployed on Vercel.
  /// For local dev with the Next.js backend running on your machine:
  ///   - Android emulator:  http://10.0.2.2:3000
  ///   - iOS simulator:     http://localhost:3000
  ///   - Physical device:   http://192.168.x.x:3000 (your LAN IP)
  static const String apiBaseUrl = 'https://terra-forest.vercel.app';

  /// iOS simulator localhost (kept for local-dev override).
  static const String apiBaseUrlIOS = 'https://terra-forest.vercel.app';

  /// API version prefix.
  static const String apiVersionPrefix = '/api/v1';

  // ─── Authentication ───────────────────────────────────────────────────────

  /// Secure storage key for JWT access token.
  static const String jwtStorageKey = 'terra_forest_jwt_token';

  /// Secure storage key for refresh token.
  static const String refreshTokenKey = 'terra_forest_refresh_token';

  /// JWT token expiry duration in seconds (24 hours).
  static const int jwtExpirySeconds = 86400;

  /// Refresh token expiry duration in seconds (30 days).
  static const int refreshTokenExpirySeconds = 2592000;

  // ─── Sync Configuration ───────────────────────────────────────────────────

  /// Sync task name for patrol data.
  static const String syncTaskPatrol = 'patrol_sync';

  /// Sync task name for observation data.
  static const String syncTaskObservation = 'observation_sync';

  /// Sync task name for evidence data.
  static const String syncTaskEvidence = 'evidence_sync';

  /// Sync task name for alert data.
  static const String syncTaskAlert = 'alert_sync';

  /// Sync task name for location data.
  static const String syncTaskLocation = 'location_sync';

  /// Default sync interval in minutes.
  static const int syncIntervalMinutes = 15;

  /// Minimum sync interval in minutes.
  static const int syncMinIntervalMinutes = 5;

  /// Maximum sync interval in minutes when on metered connection.
  static const int syncMeteredIntervalMinutes = 60;

  // ─── Map Defaults ─────────────────────────────────────────────────────────

  /// Default map center latitude — Bu Gia Map National Park.
  static const double mapDefaultLatitude = 11.97;

  /// Default map center longitude — Bu Gia Map National Park.
  static const double mapDefaultLongitude = 107.22;

  /// Default map zoom level.
  static const double mapDefaultZoom = 10.0;

  /// Minimum map zoom level.
  static const double mapMinZoom = 5.0;

  /// Maximum map zoom level.
  static const double mapMaxZoom = 18.0;

  /// Map tile provider URL for forest satellite overlay.
  static const String mapTileUrl =
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

  /// Map style URL for vector maps.
  static const String mapStyleUrl =
      'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

  // ─── Workmanager Task Names ─────────────────────────────────────────────

  /// Workmanager task name for background data sync.
  static const String syncTaskName = 'backgroundSync';

  /// Workmanager task name for background location tracking.
  static const String locationTaskName = 'locationTracking';

  /// Workmanager task name for OTA update check.
  static const String otaCheckTaskName = 'otaCheck';

  // ─── Localization ─────────────────────────────────────────────────────────

  /// Default language code.
  static const String defaultLanguage = 'vi';

  /// Supported language codes.
  static const List<String> supportedLanguages = ['vi', 'en'];

  /// Vietnamese language display name.
  static const String vietnameseName = 'Tiếng Việt';

  /// English language display name.
  static const String englishName = 'English';

  // ─── Offline & Caching ───────────────────────────────────────────────────

  /// Offline cache duration in hours.
  static const int offlineCacheDurationHours = 24;

  /// Maximum offline evidence storage in megabytes.
  static const int maxOfflineEvidenceStorageMB = 500;

  /// Maximum offline cache entries count.
  static const int maxOfflineCacheEntries = 1000;

  /// Offline database name.
  static const String offlineDbName = 'terra_forest_offline.db';

  // ─── Location & Tracking ──────────────────────────────────────────────────

  /// Background location update interval in minutes.
  static const int backgroundLocationIntervalMinutes = 5;

  /// Minimum distance between location updates in meters.
  static const double locationMinDistanceMeters = 10.0;

  /// Location accuracy desired (in meters).
  static const double locationAccuracyMeters = 5.0;

  /// Maximum GPS track points before auto-compression.
  static const int maxGpsTrackPoints = 5000;

  // ─── SOS & Emergency ─────────────────────────────────────────────────────

  /// SOS alert API endpoint.
  static const String sosAlertEndpoint = '/api/v1/sos/alert';

  /// SOS location share interval in seconds.
  static const int sosLocationShareIntervalSeconds = 30;

  /// SOS max retry attempts.
  static const int sosMaxRetries = 5;

  /// SOS alert sound file.
  static const String sosAlertSoundFile = 'sos_alert.mp3';

  // ─── Device Registration ─────────────────────────────────────────────────

  /// Device registration API endpoint.
  static const String deviceRegistrationEndpoint = '/api/v1/devices/register';

  /// Device token storage key.
  static const String deviceTokenKey = 'terra_forest_device_token';

  /// OTA update check endpoint.
  static const String otaCheckEndpoint = '/api/v1/devices/ota/check';

  // ─── Role Names ───────────────────────────────────────────────────────────

  static const String roleSystemAdmin = 'system_admin';
  static const String roleOperationsManager = 'operations_manager';
  static const String roleTeamLead = 'team_lead';
  static const String roleRanger = 'ranger';
  static const String roleAuditor = 'auditor';

  /// All role names.
  static const List<String> allRoles = [
    roleSystemAdmin,
    roleOperationsManager,
    roleTeamLead,
    roleRanger,
    roleAuditor,
  ];

  /// Role display names mapping.
  static const Map<String, String> roleDisplayNames = {
    roleSystemAdmin: 'Quản trị hệ thống',
    roleOperationsManager: 'Quản lý vận hành',
    roleTeamLead: 'Trưởng nhóm',
    roleRanger: 'Kiểm lâm',
    roleAuditor: 'Kiểm toán viên',
  };

  // ─── Permissions ──────────────────────────────────────────────────────────

  static const String permPatrolCheckin = 'patrol_checkin';
  static const String permSubmitObservation = 'submit_observation';
  static const String permCaptureEvidence = 'capture_evidence';
  static const String permViewMap = 'view_map';
  static const String permViewAlerts = 'view_alerts';
  static const String permManageTeam = 'manage_team';
  static const String permApproveTask = 'approve_task';
  static const String permVerifyEvidence = 'verify_evidence';
  static const String permOtaInstall = 'ota_install';
  static const String permSosTrigger = 'sos_trigger';

  /// All mobile permission names.
  static const List<String> allPermissions = [
    permPatrolCheckin,
    permSubmitObservation,
    permCaptureEvidence,
    permViewMap,
    permViewAlerts,
    permManageTeam,
    permApproveTask,
    permVerifyEvidence,
    permOtaInstall,
    permSosTrigger,
  ];

  /// Permission display names.
  static const Map<String, String> permDisplayNames = {
    permPatrolCheckin: 'Điểm danh tuần tra',
    permSubmitObservation: 'Gửi quan sát',
    permCaptureEvidence: 'Thu thập bằng chứng',
    permViewMap: 'Xem bản đồ',
    permViewAlerts: 'Xem cảnh báo',
    permManageTeam: 'Quản lý nhóm',
    permApproveTask: 'Phê duyệt nhiệm vụ',
    permVerifyEvidence: 'Xác minh bằng chứng',
    permOtaInstall: 'Cài đặt cập nhật OTA',
    permSosTrigger: 'Kích hoạt SOS',
  };

  /// Role-to-permissions mapping.
  static const Map<String, List<String>> rolePermissions = {
    roleSystemAdmin: [
      permPatrolCheckin,
      permSubmitObservation,
      permCaptureEvidence,
      permViewMap,
      permViewAlerts,
      permManageTeam,
      permApproveTask,
      permVerifyEvidence,
      permOtaInstall,
      permSosTrigger,
    ],
    roleOperationsManager: [
      permPatrolCheckin,
      permSubmitObservation,
      permCaptureEvidence,
      permViewMap,
      permViewAlerts,
      permManageTeam,
      permApproveTask,
      permVerifyEvidence,
      permSosTrigger,
    ],
    roleTeamLead: [
      permPatrolCheckin,
      permSubmitObservation,
      permCaptureEvidence,
      permViewMap,
      permViewAlerts,
      permManageTeam,
      permSosTrigger,
    ],
    roleRanger: [
      permPatrolCheckin,
      permSubmitObservation,
      permCaptureEvidence,
      permViewMap,
      permViewAlerts,
      permSosTrigger,
    ],
    roleAuditor: [
      permViewMap,
      permViewAlerts,
      permVerifyEvidence,
    ],
  };

  // ─── Vietnamese Province Codes ────────────────────────────────────────────

  static const String provinceDakNong = 'DN';
  static const String provinceBinhPhuoc = 'BP';
  static const String provinceDakLak = 'DL';
  static const String provinceLamDong = 'LD';
  static const String provinceCaMau = 'CM';

  /// All Vietnamese province codes relevant to forest monitoring.
  static const List<String> provinceCodes = [
    provinceDakNong,
    provinceBinhPhuoc,
    provinceDakLak,
    provinceLamDong,
    provinceCaMau,
  ];

  /// Province code to display name mapping.
  static const Map<String, String> provinceNames = {
    provinceDakNong: 'Đắk Nông',
    provinceBinhPhuoc: 'Bình Phước',
    provinceDakLak: 'Đắk Lắk',
    provinceLamDong: 'Lâm Đồng',
    provinceCaMau: 'Cà Mau',
  };

  // ─── Task Types ───────────────────────────────────────────────────────────

  static const String taskPatrol = 'patrol';
  static const String taskObservation = 'observation';
  static const String taskFireCheck = 'fire_check';
  static const String taskBoundarySurvey = 'boundary_survey';
  static const String taskSpeciesCount = 'species_count';
  static const String taskEvidenceCollection = 'evidence_collection';

  /// All task type identifiers.
  static const List<String> taskTypes = [
    taskPatrol,
    taskObservation,
    taskFireCheck,
    taskBoundarySurvey,
    taskSpeciesCount,
    taskEvidenceCollection,
  ];

  /// Task type display names.
  static const Map<String, String> taskTypeDisplayNames = {
    taskPatrol: 'Tuần tra',
    taskObservation: 'Quan sát',
    taskFireCheck: 'Kiểm tra cháy',
    taskBoundarySurvey: 'Khảo sát ranh giới',
    taskSpeciesCount: 'Đếm loài',
    taskEvidenceCollection: 'Thu thập bằng chứng',
  };

  /// Task type icon mapping (Material Icons code points).
  static const Map<String, int> taskTypeIcons = {
    taskPatrol: 0xE565, // Icons.directions_walk
    taskObservation: 0xE417, // Icons.visibility
    taskFireCheck: 0xEF55, // Icons.local_fire_department
    taskBoundarySurvey: 0xE55F, // Icons.edit_location_alt
    taskSpeciesCount: 0xE6B8, // Icons.pets
    taskEvidenceCollection: 0xE3AF, // Icons.camera_alt
  };

  // ─── Alert Types ──────────────────────────────────────────────────────────

  static const String alertFireRisk = 'fire_risk';
  static const String alertDeforestation = 'deforestation';
  static const String alertForestChange = 'forest_change';
  static const String alertDisease = 'disease';
  static const String alertAiDetection = 'ai_detection';

  /// All alert type identifiers.
  static const List<String> alertTypes = [
    alertFireRisk,
    alertDeforestation,
    alertForestChange,
    alertDisease,
    alertAiDetection,
  ];

  /// Alert type display names.
  static const Map<String, String> alertTypeDisplayNames = {
    alertFireRisk: 'Rủi ro cháy rừng',
    alertDeforestation: 'Phá rừng',
    alertForestChange: 'Thay đổi rừng',
    alertDisease: 'Bệnh dịch',
    alertAiDetection: 'Phát hiện AI',
  };

  /// Alert type icon mapping (Material Icons code points).
  static const Map<String, int> alertTypeIcons = {
    alertFireRisk: 0xEF55, // Icons.local_fire_department
    alertDeforestation: 0xE8B2, // Icons.forest
    alertForestChange: 0xE87D, // Icons.compare
    alertDisease: 0xE8E5, // Icons.coronavirus
    alertAiDetection: 0xE7A5, // Icons.psychology
  };

  // ─── Alert Severities ─────────────────────────────────────────────────────

  static const String severityCritical = 'critical';
  static const String severityHigh = 'high';
  static const String severityMedium = 'medium';
  static const String severityLow = 'low';

  /// All alert severity levels in descending order.
  static const List<String> alertSeverities = [
    severityCritical,
    severityHigh,
    severityMedium,
    severityLow,
  ];

  /// Severity display names.
  static const Map<String, String> severityDisplayNames = {
    severityCritical: 'Nghiêm trọng',
    severityHigh: 'Cao',
    severityMedium: 'Trung bình',
    severityLow: 'Thấp',
  };

  /// Severity colors matching web platform status indicators.
  static const Map<String, Color> severityColors = {
    severityCritical: Color(0xFFDC2626), // red-600
    severityHigh: Color(0xFFEA580C),     // orange-600
    severityMedium: Color(0xFFD97706),   // amber-600
    severityLow: Color(0xFF16A34A),      // green-600
  };

  /// Severity light background colors.
  static const Map<String, Color> severityLightColors = {
    severityCritical: Color(0xFFFEE2E2), // red-100
    severityHigh: Color(0xFFFFEDD5),     // orange-100
    severityMedium: Color(0xFFFEF3C7),   // amber-100
    severityLow: Color(0xFFDCFCE7),      // green-100
  };

  /// Severity priority for sorting (higher number = more urgent).
  static const Map<String, int> severityPriority = {
    severityCritical: 4,
    severityHigh: 3,
    severityMedium: 2,
    severityLow: 1,
  };

  // ─── Evidence Types ───────────────────────────────────────────────────────

  static const String evidencePhoto = 'photo';
  static const String evidenceVideo = 'video';
  static const String evidenceVoiceNote = 'voice_note';
  static const String evidenceDocument = 'document';
  static const String evidenceGpsTrack = 'gps_track';

  /// All evidence type identifiers.
  static const List<String> evidenceTypes = [
    evidencePhoto,
    evidenceVideo,
    evidenceVoiceNote,
    evidenceDocument,
    evidenceGpsTrack,
  ];

  /// Evidence type display names.
  static const Map<String, String> evidenceTypeDisplayNames = {
    evidencePhoto: 'Ảnh',
    evidenceVideo: 'Video',
    evidenceVoiceNote: 'Ghi âm',
    evidenceDocument: 'Tài liệu',
    evidenceGpsTrack: 'Đường GPS',
  };

  /// Evidence type icon mapping (Material Icons code points).
  static const Map<String, int> evidenceTypeIcons = {
    evidencePhoto: 0xE3AF,    // Icons.camera_alt
    evidenceVideo: 0xE04B,    // Icons.videocam
    evidenceVoiceNote: 0xE029, // Icons.mic
    evidenceDocument: 0xE80D, // Icons.description
    evidenceGpsTrack: 0xE56C, // Icons.route
  };

  /// Maximum file sizes per evidence type in megabytes.
  static const Map<String, int> evidenceMaxSizeMB = {
    evidencePhoto: 10,
    evidenceVideo: 100,
    evidenceVoiceNote: 25,
    evidenceDocument: 20,
    evidenceGpsTrack: 5,
  };

  // ─── Forest Types ─────────────────────────────────────────────────────────

  static const String forestNatural = 'natural';
  static const String forestPlanted = 'planted';
  static const String forestProtection = 'protection';
  static const String forestMangrove = 'mangrove';

  /// All forest type identifiers.
  static const List<String> forestTypes = [
    forestNatural,
    forestPlanted,
    forestProtection,
    forestMangrove,
  ];

  /// Forest type display names.
  static const Map<String, String> forestTypeDisplayNames = {
    forestNatural: 'Rừng tự nhiên',
    forestPlanted: 'Rừng trồng',
    forestProtection: 'Rừng phòng hộ',
    forestMangrove: 'Rừng ngập mặn',
  };

  /// Forest type color mapping for map visualization.
  static const Map<String, Color> forestTypeColors = {
    forestNatural: Color(0xFF2D6A4F),   // forest-600
    forestPlanted: Color(0xFF52B788),    // forest-400
    forestProtection: Color(0xFF1B5A38), // forest-700
    forestMangrove: Color(0xFF0277BD),   // water-700
  };

  // ─── Conservation Statuses ────────────────────────────────────────────────

  static const String conservationCR = 'CR';
  static const String conservationEN = 'EN';
  static const String conservationVU = 'VU';
  static const String conservationNT = 'NT';
  static const String conservationLC = 'LC';

  /// All conservation status codes in descending risk order.
  static const List<String> conservationStatuses = [
    conservationCR,
    conservationEN,
    conservationVU,
    conservationNT,
    conservationLC,
  ];

  /// Conservation status full names.
  static const Map<String, String> conservationStatusNames = {
    conservationCR: 'Critically Endangered',
    conservationEN: 'Endangered',
    conservationVU: 'Vulnerable',
    conservationNT: 'Near Threatened',
    conservationLC: 'Least Concern',
  };

  /// Conservation status Vietnamese names.
  static const Map<String, String> conservationStatusNamesVi = {
    conservationCR: 'Cực kỳ nguy cấp',
    conservationEN: 'Nguy cấp',
    conservationVU: 'Dễ bị tổn thương',
    conservationNT: 'Sắp bị đe dọa',
    conservationLC: 'Ít quan tâm',
  };

  /// Conservation status colors matching the web platform.
  static const Map<String, Color> conservationStatusColors = {
    conservationCR: Color(0xFFDC2626), // red-600 - Critical
    conservationEN: Color(0xFFEA580C), // orange-600 - Endangered
    conservationVU: Color(0xFFD97706), // amber-600 - Vulnerable
    conservationNT: Color(0xFF0284C7), // sky-600 - Near Threatened
    conservationLC: Color(0xFF16A34A), // green-600 - Least Concern
  };

  /// Conservation status light background colors.
  static const Map<String, Color> conservationStatusLightColors = {
    conservationCR: Color(0xFFFEE2E2), // red-100
    conservationEN: Color(0xFFFFEDD5), // orange-100
    conservationVU: Color(0xFFFEF3C7), // amber-100
    conservationNT: Color(0xFFE0F2FE), // sky-100
    conservationLC: Color(0xFFDCFCE7), // green-100
  };

  /// Conservation status priority for sorting.
  static const Map<String, int> conservationStatusPriority = {
    conservationCR: 5,
    conservationEN: 4,
    conservationVU: 3,
    conservationNT: 2,
    conservationLC: 1,
  };

  // ─── Pagination ───────────────────────────────────────────────────────────

  /// Default page size for paginated API requests.
  static const int defaultPageSize = 20;

  /// Maximum page size allowed.
  static const int maxPageSize = 100;

  // ─── Animation Durations ──────────────────────────────────────────────────

  /// Short animation duration in milliseconds.
  static const int animDurationShort = 150;

  /// Medium animation duration in milliseconds.
  static const int animDurationMedium = 300;

  /// Long animation duration in milliseconds.
  static const int animDurationLong = 500;

  // ─── Date Formats ─────────────────────────────────────────────────────────

  /// Standard date format for display.
  static const String dateFormatDisplay = 'dd/MM/yyyy';

  /// Date-time format for display.
  static const String dateTimeFormatDisplay = 'dd/MM/yyyy HH:mm';

  /// Date format for API requests.
  static const String dateFormatApi = 'yyyy-MM-dd';

  /// Date-time format for API requests.
  static const String dateTimeFormatApi = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'";

  // ─── Notification Channels ────────────────────────────────────────────────

  /// Android notification channel ID for alerts.
  static const String notificationChannelAlerts = 'terra_forest_alerts';

  /// Android notification channel name for alerts.
  static const String notificationChannelAlertsName = 'Cảnh báo rừng';

  /// Android notification channel ID for SOS.
  static const String notificationChannelSOS = 'terra_forest_sos';

  /// Android notification channel name for SOS.
  static const String notificationChannelSOSName = 'SOS Khẩn cấp';

  /// Android notification channel ID for patrol reminders.
  static const String notificationChannelPatrol = 'terra_forest_patrol';

  /// Android notification channel name for patrol reminders.
  static const String notificationChannelPatrolName = 'Nhắc nhở tuần tra';

  // ─── Shared Preferences Keys ──────────────────────────────────────────────

  static const String prefKeyThemeMode = 'terra_forest_theme_mode';
  static const String prefKeyLanguage = 'terra_forest_language';
  static const String prefKeyOnboardingComplete = 'terra_forest_onboarding';
  static const String prefKeyLastSyncTime = 'terra_forest_last_sync';
  static const String prefKeyUserId = 'terra_forest_user_id';
  static const String prefKeyUserRole = 'terra_forest_user_role';
  static const String prefKeyFcmToken = 'terra_forest_fcm_token';
  static const String prefKeyLocationPermissionAsked = 'terra_forest_loc_perm';
  static const String prefKeyNotificationPermissionAsked = 'terra_forest_notif_perm';
}
