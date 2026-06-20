import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:intl/intl.dart' as intl;

import 'app_localizations_en.dart';
import 'app_localizations_vi.dart';

// ignore_for_file: type=lint

/// Callers can lookup localized strings with an instance of AppLocalizations
/// returned by `AppLocalizations.of(context)`.
///
/// Applications need to include `AppLocalizations.delegate()` in their app's
/// `localizationDelegates` list, and the locales they support in the app's
/// `supportedLocales` list. For example:
///
/// ```dart
/// import 'generated/app_localizations.dart';
///
/// return MaterialApp(
///   localizationsDelegates: AppLocalizations.localizationsDelegates,
///   supportedLocales: AppLocalizations.supportedLocales,
///   home: MyApplicationHome(),
/// );
/// ```
///
/// ## Update pubspec.yaml
///
/// Please make sure to update your pubspec.yaml to include the following
/// packages:
///
/// ```yaml
/// dependencies:
///   # Internationalization support.
///   flutter_localizations:
///     sdk: flutter
///   intl: any # Use the pinned version from flutter_localizations
///
///   # Rest of dependencies
/// ```
///
/// ## iOS Applications
///
/// iOS applications define key application metadata, including supported
/// locales, in an Info.plist file that is built into the application bundle.
/// To configure the locales supported by your app, you’ll need to edit this
/// file.
///
/// First, open your project’s ios/Runner.xcworkspace Xcode workspace file.
/// Then, in the Project Navigator, open the Info.plist file under the Runner
/// project’s Runner folder.
///
/// Next, select the Information Property List item, select Add Item from the
/// Editor menu, then select Localizations from the pop-up menu.
///
/// Select and expand the newly-created Localizations item then, for each
/// locale your application supports, add a new item and select the locale
/// you wish to add from the pop-up menu in the Value field. This list should
/// be consistent with the languages listed in the AppLocalizations.supportedLocales
/// property.
abstract class AppLocalizations {
  AppLocalizations(String locale)
      : localeName = intl.Intl.canonicalizedLocale(locale.toString());

  final String localeName;

  static AppLocalizations? of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations);
  }

  static const LocalizationsDelegate<AppLocalizations> delegate =
      _AppLocalizationsDelegate();

  /// A list of this localizations delegate along with the default localizations
  /// delegates.
  ///
  /// Returns a list of localizations delegates containing this delegate along with
  /// GlobalMaterialLocalizations.delegate, GlobalCupertinoLocalizations.delegate,
  /// and GlobalWidgetsLocalizations.delegate.
  ///
  /// Additional delegates can be added by appending to this list in
  /// MaterialApp. This list does not have to be used at all if a custom list
  /// of delegates is preferred or required.
  static const List<LocalizationsDelegate<dynamic>> localizationsDelegates =
      <LocalizationsDelegate<dynamic>>[
    delegate,
    GlobalMaterialLocalizations.delegate,
    GlobalCupertinoLocalizations.delegate,
    GlobalWidgetsLocalizations.delegate,
  ];

  /// A list of this localizations delegate's supported locales.
  static const List<Locale> supportedLocales = <Locale>[
    Locale('en'),
    Locale('vi')
  ];

  /// Application name
  ///
  /// In vi, this message translates to:
  /// **'Terra Forest MRV'**
  String get appName;

  /// Application tagline
  ///
  /// In vi, this message translates to:
  /// **'Nền tảng MRV Số cho Lâm nghiệp Việt Nam'**
  String get appTagline;

  /// Application description
  ///
  /// In vi, this message translates to:
  /// **'Hệ thống Giám sát, Báo cáo và Xác minh rừng'**
  String get appDescription;

  /// Navigation: Home
  ///
  /// In vi, this message translates to:
  /// **'Trang chủ'**
  String get navHome;

  /// Navigation: Map
  ///
  /// In vi, this message translates to:
  /// **'Bản đồ'**
  String get navMap;

  /// Navigation: Patrol
  ///
  /// In vi, this message translates to:
  /// **'Tuần tra'**
  String get navPatrol;

  /// Navigation: Alerts
  ///
  /// In vi, this message translates to:
  /// **'Cảnh báo'**
  String get navAlerts;

  /// Navigation: Biodiversity
  ///
  /// In vi, this message translates to:
  /// **'Sinh thái'**
  String get navBiodiversity;

  /// Navigation: Fire & Weather
  ///
  /// In vi, this message translates to:
  /// **'Thời tiết & Cháy rừng'**
  String get navFireWeather;

  /// Navigation: Tasks
  ///
  /// In vi, this message translates to:
  /// **'Nhiệm vụ'**
  String get navTasks;

  /// Navigation: Evidence
  ///
  /// In vi, this message translates to:
  /// **'Bằng chứng'**
  String get navEvidence;

  /// Navigation: Settings
  ///
  /// In vi, this message translates to:
  /// **'Cài đặt'**
  String get navSettings;

  /// Navigation: Profile
  ///
  /// In vi, this message translates to:
  /// **'Hồ sơ'**
  String get navProfile;

  /// Navigation: Devices
  ///
  /// In vi, this message translates to:
  /// **'Thiết bị'**
  String get navDevices;

  /// Login button text
  ///
  /// In vi, this message translates to:
  /// **'Đăng nhập'**
  String get authLogin;

  /// Logout button text
  ///
  /// In vi, this message translates to:
  /// **'Đăng xuất'**
  String get authLogout;

  /// Email field label
  ///
  /// In vi, this message translates to:
  /// **'Email'**
  String get authEmail;

  /// Password field label
  ///
  /// In vi, this message translates to:
  /// **'Mật khẩu'**
  String get authPassword;

  /// Confirm password field label
  ///
  /// In vi, this message translates to:
  /// **'Xác nhận mật khẩu'**
  String get authConfirmPassword;

  /// Forgot password link
  ///
  /// In vi, this message translates to:
  /// **'Quên mật khẩu?'**
  String get authForgotPassword;

  /// Biometric login button
  ///
  /// In vi, this message translates to:
  /// **'Đăng nhập bằng vân tay'**
  String get authBiometricLogin;

  /// Face ID login button
  ///
  /// In vi, this message translates to:
  /// **'Đăng nhập khuôn mặt'**
  String get authFaceIdLogin;

  /// Login success message
  ///
  /// In vi, this message translates to:
  /// **'Đăng nhập thành công'**
  String get authLoginSuccess;

  /// Login failed message
  ///
  /// In vi, this message translates to:
  /// **'Đăng nhập thất bại'**
  String get authLoginFailed;

  /// Logout confirmation
  ///
  /// In vi, this message translates to:
  /// **'Bạn có chắc muốn đăng xuất?'**
  String get authLogoutConfirm;

  /// Session expired message
  ///
  /// In vi, this message translates to:
  /// **'Phiên đăng nhập đã hết hạn'**
  String get authSessionExpired;

  /// Invalid credentials message
  ///
  /// In vi, this message translates to:
  /// **'Email hoặc mật khẩu không đúng'**
  String get authInvalidCredentials;

  /// Email required validation
  ///
  /// In vi, this message translates to:
  /// **'Vui lòng nhập email'**
  String get authEmailRequired;

  /// Password required validation
  ///
  /// In vi, this message translates to:
  /// **'Vui lòng nhập mật khẩu'**
  String get authPasswordRequired;

  /// Password mismatch validation
  ///
  /// In vi, this message translates to:
  /// **'Mật khẩu không khớp'**
  String get authPasswordMismatch;

  /// Reset password button
  ///
  /// In vi, this message translates to:
  /// **'Đặt lại mật khẩu'**
  String get authResetPassword;

  /// Reset password email sent
  ///
  /// In vi, this message translates to:
  /// **'Liên kết đặt lại mật khẩu đã được gửi'**
  String get authResetPasswordSent;

  /// System Administrator role
  ///
  /// In vi, this message translates to:
  /// **'Quản trị viên hệ thống'**
  String get roleSystemAdmin;

  /// Operations Manager role
  ///
  /// In vi, this message translates to:
  /// **'Quản lý vận hành'**
  String get roleOpsManager;

  /// Team Lead role
  ///
  /// In vi, this message translates to:
  /// **'Trưởng đội'**
  String get roleTeamLead;

  /// Ranger role
  ///
  /// In vi, this message translates to:
  /// **'Kiểm lâm'**
  String get roleRanger;

  /// Auditor/Verifier role
  ///
  /// In vi, this message translates to:
  /// **'Kiểm toán viên/Xác minh'**
  String get roleAuditor;

  /// Dashboard overview
  ///
  /// In vi, this message translates to:
  /// **'Tổng quan'**
  String get dashOverview;

  /// Online activity count
  ///
  /// In vi, this message translates to:
  /// **'Hoạt động trực tuyến'**
  String get dashOnlineActivity;

  /// Forest area
  ///
  /// In vi, this message translates to:
  /// **'Diện tích rừng'**
  String get dashForestArea;

  /// Carbon credits issued
  ///
  /// In vi, this message translates to:
  /// **'Phát hành cácbon'**
  String get dashCarbonIssued;

  /// Alerts today count
  ///
  /// In vi, this message translates to:
  /// **'Cảnh báo hôm nay'**
  String get dashAlertsToday;

  /// Tasks to do
  ///
  /// In vi, this message translates to:
  /// **'Nhiệm vụ cần làm'**
  String get dashTasksTodo;

  /// Weather stations
  ///
  /// In vi, this message translates to:
  /// **'Trạm thời tiết'**
  String get dashWeatherStations;

  /// Fire risk index
  ///
  /// In vi, this message translates to:
  /// **'Chỉ số nguy cơ cháy'**
  String get dashFireRiskIndex;

  /// Active patrols count
  ///
  /// In vi, this message translates to:
  /// **'Tuần tra đang hoạt động'**
  String get dashActivePatrols;

  /// Recent activity
  ///
  /// In vi, this message translates to:
  /// **'Hoạt động gần đây'**
  String get dashRecentActivity;

  /// Forest map title
  ///
  /// In vi, this message translates to:
  /// **'Bản đồ rừng'**
  String get mapForestMap;

  /// Draw polygon on map
  ///
  /// In vi, this message translates to:
  /// **'Vẽ đa giác'**
  String get mapDrawPolygon;

  /// Current location button
  ///
  /// In vi, this message translates to:
  /// **'Vị trí hiện tại'**
  String get mapCurrentLocation;

  /// Map search
  ///
  /// In vi, this message translates to:
  /// **'Tìm kiếm'**
  String get mapSearch;

  /// Data layers toggle
  ///
  /// In vi, this message translates to:
  /// **'Lớp dữ liệu'**
  String get mapDataLayers;

  /// Observation point
  ///
  /// In vi, this message translates to:
  /// **'Vị trí quan sát'**
  String get mapObservationPoint;

  /// Boundaries layer
  ///
  /// In vi, this message translates to:
  /// **'Ranh giới'**
  String get mapBoundaries;

  /// NDVI layer
  ///
  /// In vi, this message translates to:
  /// **'NDVI'**
  String get mapNdvi;

  /// Hotspot detection
  ///
  /// In vi, this message translates to:
  /// **'Chấm đen'**
  String get mapHotspot;

  /// Satellite view
  ///
  /// In vi, this message translates to:
  /// **'Vệ tinh'**
  String get mapSatellite;

  /// Terrain view
  ///
  /// In vi, this message translates to:
  /// **'Địa hình'**
  String get mapTerrain;

  /// Hybrid view
  ///
  /// In vi, this message translates to:
  /// **'Lai'**
  String get mapHybrid;

  /// Start patrol button
  ///
  /// In vi, this message translates to:
  /// **'Bắt đầu tuần tra'**
  String get patrolStart;

  /// End patrol button
  ///
  /// In vi, this message translates to:
  /// **'Kết thúc tuần tra'**
  String get patrolEnd;

  /// Active patrol status
  ///
  /// In vi, this message translates to:
  /// **'Tuần tra đang hoạt động'**
  String get patrolActive;

  /// Enter location
  ///
  /// In vi, this message translates to:
  /// **'Nhập vị trí'**
  String get patrolEnterLocation;

  /// New observation
  ///
  /// In vi, this message translates to:
  /// **'Quan sát mới'**
  String get patrolNewObservation;

  /// Take photo
  ///
  /// In vi, this message translates to:
  /// **'Chụp ảnh'**
  String get patrolTakePhoto;

  /// Record audio
  ///
  /// In vi, this message translates to:
  /// **'Ghi âm'**
  String get patrolRecordAudio;

  /// Submit patrol data
  ///
  /// In vi, this message translates to:
  /// **'Gửi'**
  String get patrolSubmit;

  /// Patrol list
  ///
  /// In vi, this message translates to:
  /// **'Danh sách tuần tra'**
  String get patrolList;

  /// Patrol duration
  ///
  /// In vi, this message translates to:
  /// **'Thời gian tuần tra'**
  String get patrolDuration;

  /// Patrol distance
  ///
  /// In vi, this message translates to:
  /// **'Khoảng cách'**
  String get patrolDistance;

  /// Patrol checkpoint
  ///
  /// In vi, this message translates to:
  /// **'Điểm kiểm tra'**
  String get patrolCheckpoint;

  /// Patrol history
  ///
  /// In vi, this message translates to:
  /// **'Lịch sử tuần tra'**
  String get patrolHistory;

  /// No active patrol message
  ///
  /// In vi, this message translates to:
  /// **'Không có tuần tra nào đang hoạt động'**
  String get patrolNoActivePatrol;

  /// Alerts & Incidents title
  ///
  /// In vi, this message translates to:
  /// **'Cảnh báo & Sự cố'**
  String get alertTitle;

  /// Fire risk alert type
  ///
  /// In vi, this message translates to:
  /// **'Nguy cơ cháy'**
  String get alertFireRisk;

  /// Deforestation alert type
  ///
  /// In vi, this message translates to:
  /// **'Phá rừng'**
  String get alertDeforestation;

  /// Forest change alert type
  ///
  /// In vi, this message translates to:
  /// **'Thay đổi rừng'**
  String get alertForestChange;

  /// Disease alert type
  ///
  /// In vi, this message translates to:
  /// **'Bệnh'**
  String get alertDisease;

  /// AI detection alert type
  ///
  /// In vi, this message translates to:
  /// **'Phát hiện AI'**
  String get alertAIDetection;

  /// Critical severity
  ///
  /// In vi, this message translates to:
  /// **'Nghiêm trọng'**
  String get alertCritical;

  /// High severity
  ///
  /// In vi, this message translates to:
  /// **'Cao'**
  String get alertHigh;

  /// Medium severity
  ///
  /// In vi, this message translates to:
  /// **'Trung bình'**
  String get alertMedium;

  /// Low severity
  ///
  /// In vi, this message translates to:
  /// **'Thấp'**
  String get alertLow;

  /// Acknowledge alert
  ///
  /// In vi, this message translates to:
  /// **'Xác nhận'**
  String get alertAcknowledge;

  /// Handle alert
  ///
  /// In vi, this message translates to:
  /// **'Xử lý'**
  String get alertHandle;

  /// Alert resolved status
  ///
  /// In vi, this message translates to:
  /// **'Đã giải quyết'**
  String get alertResolved;

  /// Alert pending status
  ///
  /// In vi, this message translates to:
  /// **'Chờ xử lý'**
  String get alertPending;

  /// Alert detail
  ///
  /// In vi, this message translates to:
  /// **'Chi tiết cảnh báo'**
  String get alertDetail;

  /// No alerts message
  ///
  /// In vi, this message translates to:
  /// **'Không có cảnh báo nào'**
  String get alertNoAlerts;

  /// Filter by severity
  ///
  /// In vi, this message translates to:
  /// **'Lọc theo mức độ'**
  String get alertFilterBySeverity;

  /// Filter by type
  ///
  /// In vi, this message translates to:
  /// **'Lọc theo loại'**
  String get alertFilterByType;

  /// Biodiversity survey
  ///
  /// In vi, this message translates to:
  /// **'Khảo sát sinh thái'**
  String get bioSurvey;

  /// Critically endangered species
  ///
  /// In vi, this message translates to:
  /// **'Loài nguy cấp'**
  String get bioCriticallyEndangered;

  /// Endangered species
  ///
  /// In vi, this message translates to:
  /// **'Loài đang nguy'**
  String get bioEndangered;

  /// Vulnerable species
  ///
  /// In vi, this message translates to:
  /// **'Loài de dọa'**
  String get bioVulnerable;

  /// Least concern species
  ///
  /// In vi, this message translates to:
  /// **'Loài ít quan tâm'**
  String get bioLeastConcern;

  /// Record species
  ///
  /// In vi, this message translates to:
  /// **'Ghi nhận loài'**
  String get bioRecordSpecies;

  /// Species count
  ///
  /// In vi, this message translates to:
  /// **'Số lượng loài'**
  String get bioSpeciesCount;

  /// Flora
  ///
  /// In vi, this message translates to:
  /// **'Thực vật'**
  String get bioFlora;

  /// Fauna
  ///
  /// In vi, this message translates to:
  /// **'Động vật'**
  String get bioFauna;

  /// Habitat
  ///
  /// In vi, this message translates to:
  /// **'Môi trường sống'**
  String get bioHabitat;

  /// Fire & Weather title
  ///
  /// In vi, this message translates to:
  /// **'Thời tiết & Cháy rừng'**
  String get fireWeatherTitle;

  /// Temperature
  ///
  /// In vi, this message translates to:
  /// **'Nhiệt độ'**
  String get fireTemperature;

  /// Humidity
  ///
  /// In vi, this message translates to:
  /// **'Độ ẩm'**
  String get fireHumidity;

  /// Wind speed
  ///
  /// In vi, this message translates to:
  /// **'Tốc độ gió'**
  String get fireWindSpeed;

  /// Rainfall
  ///
  /// In vi, this message translates to:
  /// **'Lượng mưa'**
  String get fireRainfall;

  /// Fire Weather Index
  ///
  /// In vi, this message translates to:
  /// **'Chỉ số FWI'**
  String get fireFwiIndex;

  /// Low fire risk
  ///
  /// In vi, this message translates to:
  /// **'Nguy cơ thấp'**
  String get fireRiskLow;

  /// Medium fire risk
  ///
  /// In vi, this message translates to:
  /// **'Nguy cơ trung bình'**
  String get fireRiskMedium;

  /// High fire risk
  ///
  /// In vi, this message translates to:
  /// **'Nguy cơ cao'**
  String get fireRiskHigh;

  /// Critical fire risk
  ///
  /// In vi, this message translates to:
  /// **'Nguy cơ nghiêm trọng'**
  String get fireRiskCritical;

  /// Fire forecast
  ///
  /// In vi, this message translates to:
  /// **'Dự báo cháy'**
  String get fireForecast;

  /// Historical fire data
  ///
  /// In vi, this message translates to:
  /// **'Dữ liệu lịch sử'**
  String get fireHistoryData;

  /// Nearby weather station
  ///
  /// In vi, this message translates to:
  /// **'Trạm gần nhất'**
  String get fireStationNearby;

  /// Tasks title
  ///
  /// In vi, this message translates to:
  /// **'Nhiệm vụ'**
  String get taskTitle;

  /// Assign task
  ///
  /// In vi, this message translates to:
  /// **'Giao việc'**
  String get taskAssign;

  /// Task in progress status
  ///
  /// In vi, this message translates to:
  /// **'Đang thực hiện'**
  String get taskInProgress;

  /// Task completed status
  ///
  /// In vi, this message translates to:
  /// **'Hoàn thành'**
  String get taskCompleted;

  /// Task verified status
  ///
  /// In vi, this message translates to:
  /// **'Đã xác minh'**
  String get taskVerified;

  /// Task failed status
  ///
  /// In vi, this message translates to:
  /// **'Không thành công'**
  String get taskFailed;

  /// Task cancelled status
  ///
  /// In vi, this message translates to:
  /// **'Hủy'**
  String get taskCancelled;

  /// Task detail
  ///
  /// In vi, this message translates to:
  /// **'Chi tiết nhiệm vụ'**
  String get taskDetail;

  /// Task due date
  ///
  /// In vi, this message translates to:
  /// **'Hạn hoàn thành'**
  String get taskDueDate;

  /// Task priority
  ///
  /// In vi, this message translates to:
  /// **'Mức ưu tiên'**
  String get taskPriority;

  /// Task assignee
  ///
  /// In vi, this message translates to:
  /// **'Người thực hiện'**
  String get taskAssignee;

  /// No tasks message
  ///
  /// In vi, this message translates to:
  /// **'Không có nhiệm vụ nào'**
  String get taskNoTasks;

  /// Evidence title
  ///
  /// In vi, this message translates to:
  /// **'Bằng chứng'**
  String get evidenceTitle;

  /// Photo evidence type
  ///
  /// In vi, this message translates to:
  /// **'Ảnh'**
  String get evidencePhoto;

  /// Video evidence type
  ///
  /// In vi, this message translates to:
  /// **'Video'**
  String get evidenceVideo;

  /// Audio evidence type
  ///
  /// In vi, this message translates to:
  /// **'Ghi âm'**
  String get evidenceAudio;

  /// Document evidence type
  ///
  /// In vi, this message translates to:
  /// **'Tài liệu'**
  String get evidenceDocument;

  /// GPS data evidence type
  ///
  /// In vi, this message translates to:
  /// **'Dữ liệu GPS'**
  String get evidenceGpsData;

  /// Upload evidence
  ///
  /// In vi, this message translates to:
  /// **'Tải lên'**
  String get evidenceUpload;

  /// Evidence under review status
  ///
  /// In vi, this message translates to:
  /// **'Đang xem xét'**
  String get evidenceUnderReview;

  /// Evidence approved status
  ///
  /// In vi, this message translates to:
  /// **'Đã duyệt'**
  String get evidenceApproved;

  /// Evidence rejected status
  ///
  /// In vi, this message translates to:
  /// **'Đã từ chối'**
  String get evidenceRejected;

  /// No evidence message
  ///
  /// In vi, this message translates to:
  /// **'Không có bằng chứng nào'**
  String get evidenceNoEvidence;

  /// OTA update title
  ///
  /// In vi, this message translates to:
  /// **'Cập nhật ứng dụng'**
  String get otaUpdate;

  /// New version available
  ///
  /// In vi, this message translates to:
  /// **'Phiên bản mới'**
  String get otaNewVersion;

  /// Downloading update
  ///
  /// In vi, this message translates to:
  /// **'Đang tải'**
  String get otaDownloading;

  /// Installing update
  ///
  /// In vi, this message translates to:
  /// **'Đang cài đặt'**
  String get otaInstalling;

  /// Install update button
  ///
  /// In vi, this message translates to:
  /// **'Cài đặt'**
  String get otaInstall;

  /// Restart app button
  ///
  /// In vi, this message translates to:
  /// **'Khởi động lại'**
  String get otaRestart;

  /// Mandatory update
  ///
  /// In vi, this message translates to:
  /// **'Bắt buộc cập nhật'**
  String get otaMandatory;

  /// Current version
  ///
  /// In vi, this message translates to:
  /// **'Phiên bản hiện tại'**
  String get otaCurrentVersion;

  /// Changelog
  ///
  /// In vi, this message translates to:
  /// **'Nhật ký thay đổi'**
  String get otaChangelog;

  /// No connection message
  ///
  /// In vi, this message translates to:
  /// **'Không có kết nối'**
  String get offlineNoConnection;

  /// Offline mode title
  ///
  /// In vi, this message translates to:
  /// **'Chế độ ngoại tuyến'**
  String get offlineMode;

  /// Sync data button
  ///
  /// In vi, this message translates to:
  /// **'Đồng bộ dữ liệu'**
  String get offlineSyncData;

  /// Syncing progress
  ///
  /// In vi, this message translates to:
  /// **'Đang đồng bộ'**
  String get offlineSyncing;

  /// Sync error message
  ///
  /// In vi, this message translates to:
  /// **'Lỗi đồng bộ'**
  String get offlineSyncError;

  /// Sync complete message
  ///
  /// In vi, this message translates to:
  /// **'Đồng bộ hoàn tất'**
  String get offlineSyncComplete;

  /// Pending sync items
  ///
  /// In vi, this message translates to:
  /// **'Mục chờ đồng bộ'**
  String get offlinePendingItems;

  /// Last sync time
  ///
  /// In vi, this message translates to:
  /// **'Lần đồng bộ cuối'**
  String get offlineLastSync;

  /// Save button
  ///
  /// In vi, this message translates to:
  /// **'Lưu'**
  String get commonSave;

  /// Cancel button
  ///
  /// In vi, this message translates to:
  /// **'Hủy'**
  String get commonCancel;

  /// Delete button
  ///
  /// In vi, this message translates to:
  /// **'Xóa'**
  String get commonDelete;

  /// Edit button
  ///
  /// In vi, this message translates to:
  /// **'Chỉnh sửa'**
  String get commonEdit;

  /// Search
  ///
  /// In vi, this message translates to:
  /// **'Tìm kiếm'**
  String get commonSearch;

  /// Filter
  ///
  /// In vi, this message translates to:
  /// **'Bộ lọc'**
  String get commonFilter;

  /// Sort
  ///
  /// In vi, this message translates to:
  /// **'Sắp xếp'**
  String get commonSort;

  /// Add new
  ///
  /// In vi, this message translates to:
  /// **'Thêm mới'**
  String get commonAddNew;

  /// Detail
  ///
  /// In vi, this message translates to:
  /// **'Chi tiết'**
  String get commonDetail;

  /// Back button
  ///
  /// In vi, this message translates to:
  /// **'Trở lại'**
  String get commonBack;

  /// Close button
  ///
  /// In vi, this message translates to:
  /// **'Đóng'**
  String get commonClose;

  /// Confirm button
  ///
  /// In vi, this message translates to:
  /// **'Xác nhận'**
  String get commonConfirm;

  /// Success message
  ///
  /// In vi, this message translates to:
  /// **'Thành công'**
  String get commonSuccess;

  /// Error message
  ///
  /// In vi, this message translates to:
  /// **'Lỗi'**
  String get commonError;

  /// Loading message
  ///
  /// In vi, this message translates to:
  /// **'Đang tải'**
  String get commonLoading;

  /// Retry button
  ///
  /// In vi, this message translates to:
  /// **'Thử lại'**
  String get commonRetry;

  /// No data message
  ///
  /// In vi, this message translates to:
  /// **'Không có dữ liệu'**
  String get commonNoData;

  /// Refresh
  ///
  /// In vi, this message translates to:
  /// **'Làm mới'**
  String get commonRefresh;

  /// Yes
  ///
  /// In vi, this message translates to:
  /// **'Có'**
  String get commonYes;

  /// No
  ///
  /// In vi, this message translates to:
  /// **'Không'**
  String get commonNo;

  /// OK
  ///
  /// In vi, this message translates to:
  /// **'Đồng ý'**
  String get commonOk;

  /// Required field
  ///
  /// In vi, this message translates to:
  /// **'Bắt buộc'**
  String get commonRequired;

  /// Optional field
  ///
  /// In vi, this message translates to:
  /// **'Tùy chọn'**
  String get commonOptional;

  /// Location permission
  ///
  /// In vi, this message translates to:
  /// **'Quyền truy cập vị trí'**
  String get permLocation;

  /// Camera permission
  ///
  /// In vi, this message translates to:
  /// **'Quyền sử dụng camera'**
  String get permCamera;

  /// Microphone permission
  ///
  /// In vi, this message translates to:
  /// **'Quyền ghi âm'**
  String get permMicrophone;

  /// Notification permission
  ///
  /// In vi, this message translates to:
  /// **'Quyền thông báo'**
  String get permNotification;

  /// Permission denied
  ///
  /// In vi, this message translates to:
  /// **'Từ chối'**
  String get permDenied;

  /// Permission granted
  ///
  /// In vi, this message translates to:
  /// **'Chấp nhận'**
  String get permGranted;

  /// Permission required message
  ///
  /// In vi, this message translates to:
  /// **'Quyền này là bắt buộc để sử dụng tính năng'**
  String get permRequired;

  /// Open settings button
  ///
  /// In vi, this message translates to:
  /// **'Mở cài đặt'**
  String get permOpenSettings;

  /// Device title
  ///
  /// In vi, this message translates to:
  /// **'Thiết bị'**
  String get deviceTitle;

  /// Register device
  ///
  /// In vi, this message translates to:
  /// **'Đăng ký thiết bị'**
  String get deviceRegister;

  /// Device status
  ///
  /// In vi, this message translates to:
  /// **'Trạng thái'**
  String get deviceStatus;

  /// Device battery
  ///
  /// In vi, this message translates to:
  /// **'Pin'**
  String get deviceBattery;

  /// Device last location
  ///
  /// In vi, this message translates to:
  /// **'Vị trí cuối'**
  String get deviceLastLocation;

  /// Device online
  ///
  /// In vi, this message translates to:
  /// **'Trực tuyến'**
  String get deviceOnline;

  /// Device offline
  ///
  /// In vi, this message translates to:
  /// **'Ngoại tuyến'**
  String get deviceOffline;

  /// Device ID
  ///
  /// In vi, this message translates to:
  /// **'Mã thiết bị'**
  String get deviceId;

  /// SOS Emergency title
  ///
  /// In vi, this message translates to:
  /// **'Khẩn cấp'**
  String get sosEmergency;

  /// Send SOS signal
  ///
  /// In vi, this message translates to:
  /// **'Gửi tín hiệu SOS'**
  String get sosSend;

  /// SOS location
  ///
  /// In vi, this message translates to:
  /// **'Vị trí SOS'**
  String get sosLocation;

  /// SOS sent message
  ///
  /// In vi, this message translates to:
  /// **'Tín hiệu SOS đã được gửi'**
  String get sosSent;

  /// SOS failed message
  ///
  /// In vi, this message translates to:
  /// **'Gửi SOS thất bại. Vui lòng thử lại.'**
  String get sosFailed;

  /// SOS message field
  ///
  /// In vi, this message translates to:
  /// **'Tin nhắn khẩn cấp'**
  String get sosMessage;

  /// Call rescue button
  ///
  /// In vi, this message translates to:
  /// **'Gọi cứu hộ'**
  String get sosCallRescue;

  /// Settings title
  ///
  /// In vi, this message translates to:
  /// **'Cài đặt'**
  String get settingsTitle;

  /// Language setting
  ///
  /// In vi, this message translates to:
  /// **'Ngôn ngữ'**
  String get settingsLanguage;

  /// Theme setting
  ///
  /// In vi, this message translates to:
  /// **'Giao diện'**
  String get settingsTheme;

  /// Notifications setting
  ///
  /// In vi, this message translates to:
  /// **'Thông báo'**
  String get settingsNotifications;

  /// Offline mode setting
  ///
  /// In vi, this message translates to:
  /// **'Chế độ ngoại tuyến'**
  String get settingsOfflineMode;

  /// About app
  ///
  /// In vi, this message translates to:
  /// **'Về ứng dụng'**
  String get settingsAbout;

  /// Version info
  ///
  /// In vi, this message translates to:
  /// **'Phiên bản'**
  String get settingsVersion;

  /// Clear cache
  ///
  /// In vi, this message translates to:
  /// **'Xóa bộ nhớ đệm'**
  String get settingsClearCache;

  /// Dark mode toggle
  ///
  /// In vi, this message translates to:
  /// **'Chế độ tối'**
  String get settingsDarkMode;

  /// Profile title
  ///
  /// In vi, this message translates to:
  /// **'Hồ sơ'**
  String get profileTitle;

  /// Profile name
  ///
  /// In vi, this message translates to:
  /// **'Họ tên'**
  String get profileName;

  /// Profile email
  ///
  /// In vi, this message translates to:
  /// **'Email'**
  String get profileEmail;

  /// Profile phone
  ///
  /// In vi, this message translates to:
  /// **'Số điện thoại'**
  String get profilePhone;

  /// Profile organization
  ///
  /// In vi, this message translates to:
  /// **'Tổ chức'**
  String get profileOrganization;

  /// Profile province
  ///
  /// In vi, this message translates to:
  /// **'Tỉnh/Thành'**
  String get profileProvince;

  /// Edit profile
  ///
  /// In vi, this message translates to:
  /// **'Chỉnh sửa hồ sơ'**
  String get profileEdit;

  /// Change password
  ///
  /// In vi, this message translates to:
  /// **'Đổi mật khẩu'**
  String get profileChangePassword;
}

class _AppLocalizationsDelegate
    extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  Future<AppLocalizations> load(Locale locale) {
    return SynchronousFuture<AppLocalizations>(lookupAppLocalizations(locale));
  }

  @override
  bool isSupported(Locale locale) =>
      <String>['en', 'vi'].contains(locale.languageCode);

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}

AppLocalizations lookupAppLocalizations(Locale locale) {
  // Lookup logic when only language code is specified.
  switch (locale.languageCode) {
    case 'en':
      return AppLocalizationsEn();
    case 'vi':
      return AppLocalizationsVi();
  }

  throw FlutterError(
      'AppLocalizations.delegate failed to load unsupported locale "$locale". This is likely '
      'an issue with the localizations generation tool. Please file an issue '
      'on GitHub with a reproducible sample app and the gen-l10n configuration '
      'that was used.');
}
