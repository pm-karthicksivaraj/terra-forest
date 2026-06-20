// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Vietnamese (`vi`).
class AppLocalizationsVi extends AppLocalizations {
  AppLocalizationsVi([String locale = 'vi']) : super(locale);

  @override
  String get appName => 'Terra Forest MRV';

  @override
  String get appTagline => 'Nền tảng MRV Số cho Lâm nghiệp Việt Nam';

  @override
  String get appDescription => 'Hệ thống Giám sát, Báo cáo và Xác minh rừng';

  @override
  String get navHome => 'Trang chủ';

  @override
  String get navMap => 'Bản đồ';

  @override
  String get navPatrol => 'Tuần tra';

  @override
  String get navAlerts => 'Cảnh báo';

  @override
  String get navBiodiversity => 'Sinh thái';

  @override
  String get navFireWeather => 'Thời tiết & Cháy rừng';

  @override
  String get navTasks => 'Nhiệm vụ';

  @override
  String get navEvidence => 'Bằng chứng';

  @override
  String get navSettings => 'Cài đặt';

  @override
  String get navProfile => 'Hồ sơ';

  @override
  String get navDevices => 'Thiết bị';

  @override
  String get authLogin => 'Đăng nhập';

  @override
  String get authLogout => 'Đăng xuất';

  @override
  String get authEmail => 'Email';

  @override
  String get authPassword => 'Mật khẩu';

  @override
  String get authConfirmPassword => 'Xác nhận mật khẩu';

  @override
  String get authForgotPassword => 'Quên mật khẩu?';

  @override
  String get authBiometricLogin => 'Đăng nhập bằng vân tay';

  @override
  String get authFaceIdLogin => 'Đăng nhập khuôn mặt';

  @override
  String get authLoginSuccess => 'Đăng nhập thành công';

  @override
  String get authLoginFailed => 'Đăng nhập thất bại';

  @override
  String get authLogoutConfirm => 'Bạn có chắc muốn đăng xuất?';

  @override
  String get authSessionExpired => 'Phiên đăng nhập đã hết hạn';

  @override
  String get authInvalidCredentials => 'Email hoặc mật khẩu không đúng';

  @override
  String get authEmailRequired => 'Vui lòng nhập email';

  @override
  String get authPasswordRequired => 'Vui lòng nhập mật khẩu';

  @override
  String get authPasswordMismatch => 'Mật khẩu không khớp';

  @override
  String get authResetPassword => 'Đặt lại mật khẩu';

  @override
  String get authResetPasswordSent => 'Liên kết đặt lại mật khẩu đã được gửi';

  @override
  String get roleSystemAdmin => 'Quản trị viên hệ thống';

  @override
  String get roleOpsManager => 'Quản lý vận hành';

  @override
  String get roleTeamLead => 'Trưởng đội';

  @override
  String get roleRanger => 'Kiểm lâm';

  @override
  String get roleAuditor => 'Kiểm toán viên/Xác minh';

  @override
  String get dashOverview => 'Tổng quan';

  @override
  String get dashOnlineActivity => 'Hoạt động trực tuyến';

  @override
  String get dashForestArea => 'Diện tích rừng';

  @override
  String get dashCarbonIssued => 'Phát hành cácbon';

  @override
  String get dashAlertsToday => 'Cảnh báo hôm nay';

  @override
  String get dashTasksTodo => 'Nhiệm vụ cần làm';

  @override
  String get dashWeatherStations => 'Trạm thời tiết';

  @override
  String get dashFireRiskIndex => 'Chỉ số nguy cơ cháy';

  @override
  String get dashActivePatrols => 'Tuần tra đang hoạt động';

  @override
  String get dashRecentActivity => 'Hoạt động gần đây';

  @override
  String get mapForestMap => 'Bản đồ rừng';

  @override
  String get mapDrawPolygon => 'Vẽ đa giác';

  @override
  String get mapCurrentLocation => 'Vị trí hiện tại';

  @override
  String get mapSearch => 'Tìm kiếm';

  @override
  String get mapDataLayers => 'Lớp dữ liệu';

  @override
  String get mapObservationPoint => 'Vị trí quan sát';

  @override
  String get mapBoundaries => 'Ranh giới';

  @override
  String get mapNdvi => 'NDVI';

  @override
  String get mapHotspot => 'Chấm đen';

  @override
  String get mapSatellite => 'Vệ tinh';

  @override
  String get mapTerrain => 'Địa hình';

  @override
  String get mapHybrid => 'Lai';

  @override
  String get patrolStart => 'Bắt đầu tuần tra';

  @override
  String get patrolEnd => 'Kết thúc tuần tra';

  @override
  String get patrolActive => 'Tuần tra đang hoạt động';

  @override
  String get patrolEnterLocation => 'Nhập vị trí';

  @override
  String get patrolNewObservation => 'Quan sát mới';

  @override
  String get patrolTakePhoto => 'Chụp ảnh';

  @override
  String get patrolRecordAudio => 'Ghi âm';

  @override
  String get patrolSubmit => 'Gửi';

  @override
  String get patrolList => 'Danh sách tuần tra';

  @override
  String get patrolDuration => 'Thời gian tuần tra';

  @override
  String get patrolDistance => 'Khoảng cách';

  @override
  String get patrolCheckpoint => 'Điểm kiểm tra';

  @override
  String get patrolHistory => 'Lịch sử tuần tra';

  @override
  String get patrolNoActivePatrol => 'Không có tuần tra nào đang hoạt động';

  @override
  String get alertTitle => 'Cảnh báo & Sự cố';

  @override
  String get alertFireRisk => 'Nguy cơ cháy';

  @override
  String get alertDeforestation => 'Phá rừng';

  @override
  String get alertForestChange => 'Thay đổi rừng';

  @override
  String get alertDisease => 'Bệnh';

  @override
  String get alertAIDetection => 'Phát hiện AI';

  @override
  String get alertCritical => 'Nghiêm trọng';

  @override
  String get alertHigh => 'Cao';

  @override
  String get alertMedium => 'Trung bình';

  @override
  String get alertLow => 'Thấp';

  @override
  String get alertAcknowledge => 'Xác nhận';

  @override
  String get alertHandle => 'Xử lý';

  @override
  String get alertResolved => 'Đã giải quyết';

  @override
  String get alertPending => 'Chờ xử lý';

  @override
  String get alertDetail => 'Chi tiết cảnh báo';

  @override
  String get alertNoAlerts => 'Không có cảnh báo nào';

  @override
  String get alertFilterBySeverity => 'Lọc theo mức độ';

  @override
  String get alertFilterByType => 'Lọc theo loại';

  @override
  String get bioSurvey => 'Khảo sát sinh thái';

  @override
  String get bioCriticallyEndangered => 'Loài nguy cấp';

  @override
  String get bioEndangered => 'Loài đang nguy';

  @override
  String get bioVulnerable => 'Loài de dọa';

  @override
  String get bioLeastConcern => 'Loài ít quan tâm';

  @override
  String get bioRecordSpecies => 'Ghi nhận loài';

  @override
  String get bioSpeciesCount => 'Số lượng loài';

  @override
  String get bioFlora => 'Thực vật';

  @override
  String get bioFauna => 'Động vật';

  @override
  String get bioHabitat => 'Môi trường sống';

  @override
  String get fireWeatherTitle => 'Thời tiết & Cháy rừng';

  @override
  String get fireTemperature => 'Nhiệt độ';

  @override
  String get fireHumidity => 'Độ ẩm';

  @override
  String get fireWindSpeed => 'Tốc độ gió';

  @override
  String get fireRainfall => 'Lượng mưa';

  @override
  String get fireFwiIndex => 'Chỉ số FWI';

  @override
  String get fireRiskLow => 'Nguy cơ thấp';

  @override
  String get fireRiskMedium => 'Nguy cơ trung bình';

  @override
  String get fireRiskHigh => 'Nguy cơ cao';

  @override
  String get fireRiskCritical => 'Nguy cơ nghiêm trọng';

  @override
  String get fireForecast => 'Dự báo cháy';

  @override
  String get fireHistoryData => 'Dữ liệu lịch sử';

  @override
  String get fireStationNearby => 'Trạm gần nhất';

  @override
  String get taskTitle => 'Nhiệm vụ';

  @override
  String get taskAssign => 'Giao việc';

  @override
  String get taskInProgress => 'Đang thực hiện';

  @override
  String get taskCompleted => 'Hoàn thành';

  @override
  String get taskVerified => 'Đã xác minh';

  @override
  String get taskFailed => 'Không thành công';

  @override
  String get taskCancelled => 'Hủy';

  @override
  String get taskDetail => 'Chi tiết nhiệm vụ';

  @override
  String get taskDueDate => 'Hạn hoàn thành';

  @override
  String get taskPriority => 'Mức ưu tiên';

  @override
  String get taskAssignee => 'Người thực hiện';

  @override
  String get taskNoTasks => 'Không có nhiệm vụ nào';

  @override
  String get evidenceTitle => 'Bằng chứng';

  @override
  String get evidencePhoto => 'Ảnh';

  @override
  String get evidenceVideo => 'Video';

  @override
  String get evidenceAudio => 'Ghi âm';

  @override
  String get evidenceDocument => 'Tài liệu';

  @override
  String get evidenceGpsData => 'Dữ liệu GPS';

  @override
  String get evidenceUpload => 'Tải lên';

  @override
  String get evidenceUnderReview => 'Đang xem xét';

  @override
  String get evidenceApproved => 'Đã duyệt';

  @override
  String get evidenceRejected => 'Đã từ chối';

  @override
  String get evidenceNoEvidence => 'Không có bằng chứng nào';

  @override
  String get otaUpdate => 'Cập nhật ứng dụng';

  @override
  String get otaNewVersion => 'Phiên bản mới';

  @override
  String get otaDownloading => 'Đang tải';

  @override
  String get otaInstalling => 'Đang cài đặt';

  @override
  String get otaInstall => 'Cài đặt';

  @override
  String get otaRestart => 'Khởi động lại';

  @override
  String get otaMandatory => 'Bắt buộc cập nhật';

  @override
  String get otaCurrentVersion => 'Phiên bản hiện tại';

  @override
  String get otaChangelog => 'Nhật ký thay đổi';

  @override
  String get offlineNoConnection => 'Không có kết nối';

  @override
  String get offlineMode => 'Chế độ ngoại tuyến';

  @override
  String get offlineSyncData => 'Đồng bộ dữ liệu';

  @override
  String get offlineSyncing => 'Đang đồng bộ';

  @override
  String get offlineSyncError => 'Lỗi đồng bộ';

  @override
  String get offlineSyncComplete => 'Đồng bộ hoàn tất';

  @override
  String get offlinePendingItems => 'Mục chờ đồng bộ';

  @override
  String get offlineLastSync => 'Lần đồng bộ cuối';

  @override
  String get commonSave => 'Lưu';

  @override
  String get commonCancel => 'Hủy';

  @override
  String get commonDelete => 'Xóa';

  @override
  String get commonEdit => 'Chỉnh sửa';

  @override
  String get commonSearch => 'Tìm kiếm';

  @override
  String get commonFilter => 'Bộ lọc';

  @override
  String get commonSort => 'Sắp xếp';

  @override
  String get commonAddNew => 'Thêm mới';

  @override
  String get commonDetail => 'Chi tiết';

  @override
  String get commonBack => 'Trở lại';

  @override
  String get commonClose => 'Đóng';

  @override
  String get commonConfirm => 'Xác nhận';

  @override
  String get commonSuccess => 'Thành công';

  @override
  String get commonError => 'Lỗi';

  @override
  String get commonLoading => 'Đang tải';

  @override
  String get commonRetry => 'Thử lại';

  @override
  String get commonNoData => 'Không có dữ liệu';

  @override
  String get commonRefresh => 'Làm mới';

  @override
  String get commonYes => 'Có';

  @override
  String get commonNo => 'Không';

  @override
  String get commonOk => 'Đồng ý';

  @override
  String get commonRequired => 'Bắt buộc';

  @override
  String get commonOptional => 'Tùy chọn';

  @override
  String get permLocation => 'Quyền truy cập vị trí';

  @override
  String get permCamera => 'Quyền sử dụng camera';

  @override
  String get permMicrophone => 'Quyền ghi âm';

  @override
  String get permNotification => 'Quyền thông báo';

  @override
  String get permDenied => 'Từ chối';

  @override
  String get permGranted => 'Chấp nhận';

  @override
  String get permRequired => 'Quyền này là bắt buộc để sử dụng tính năng';

  @override
  String get permOpenSettings => 'Mở cài đặt';

  @override
  String get deviceTitle => 'Thiết bị';

  @override
  String get deviceRegister => 'Đăng ký thiết bị';

  @override
  String get deviceStatus => 'Trạng thái';

  @override
  String get deviceBattery => 'Pin';

  @override
  String get deviceLastLocation => 'Vị trí cuối';

  @override
  String get deviceOnline => 'Trực tuyến';

  @override
  String get deviceOffline => 'Ngoại tuyến';

  @override
  String get deviceId => 'Mã thiết bị';

  @override
  String get sosEmergency => 'Khẩn cấp';

  @override
  String get sosSend => 'Gửi tín hiệu SOS';

  @override
  String get sosLocation => 'Vị trí SOS';

  @override
  String get sosSent => 'Tín hiệu SOS đã được gửi';

  @override
  String get sosFailed => 'Gửi SOS thất bại. Vui lòng thử lại.';

  @override
  String get sosMessage => 'Tin nhắn khẩn cấp';

  @override
  String get sosCallRescue => 'Gọi cứu hộ';

  @override
  String get settingsTitle => 'Cài đặt';

  @override
  String get settingsLanguage => 'Ngôn ngữ';

  @override
  String get settingsTheme => 'Giao diện';

  @override
  String get settingsNotifications => 'Thông báo';

  @override
  String get settingsOfflineMode => 'Chế độ ngoại tuyến';

  @override
  String get settingsAbout => 'Về ứng dụng';

  @override
  String get settingsVersion => 'Phiên bản';

  @override
  String get settingsClearCache => 'Xóa bộ nhớ đệm';

  @override
  String get settingsDarkMode => 'Chế độ tối';

  @override
  String get profileTitle => 'Hồ sơ';

  @override
  String get profileName => 'Họ tên';

  @override
  String get profileEmail => 'Email';

  @override
  String get profilePhone => 'Số điện thoại';

  @override
  String get profileOrganization => 'Tổ chức';

  @override
  String get profileProvince => 'Tỉnh/Thành';

  @override
  String get profileEdit => 'Chỉnh sửa hồ sơ';

  @override
  String get profileChangePassword => 'Đổi mật khẩu';
}
