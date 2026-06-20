// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for English (`en`).
class AppLocalizationsEn extends AppLocalizations {
  AppLocalizationsEn([String locale = 'en']) : super(locale);

  @override
  String get appName => 'Terra Forest MRV';

  @override
  String get appTagline => 'Digital MRV Platform for Vietnam Forestry';

  @override
  String get appDescription =>
      'Forest Monitoring, Reporting and Verification System';

  @override
  String get navHome => 'Home';

  @override
  String get navMap => 'Map';

  @override
  String get navPatrol => 'Patrol';

  @override
  String get navAlerts => 'Alerts';

  @override
  String get navBiodiversity => 'Biodiversity';

  @override
  String get navFireWeather => 'Fire & Weather';

  @override
  String get navTasks => 'Tasks';

  @override
  String get navEvidence => 'Evidence';

  @override
  String get navSettings => 'Settings';

  @override
  String get navProfile => 'Profile';

  @override
  String get navDevices => 'Devices';

  @override
  String get authLogin => 'Login';

  @override
  String get authLogout => 'Logout';

  @override
  String get authEmail => 'Email';

  @override
  String get authPassword => 'Password';

  @override
  String get authConfirmPassword => 'Confirm Password';

  @override
  String get authForgotPassword => 'Forgot Password?';

  @override
  String get authBiometricLogin => 'Login with Fingerprint';

  @override
  String get authFaceIdLogin => 'Login with Face ID';

  @override
  String get authLoginSuccess => 'Login successful';

  @override
  String get authLoginFailed => 'Login failed';

  @override
  String get authLogoutConfirm => 'Are you sure you want to logout?';

  @override
  String get authSessionExpired => 'Session has expired';

  @override
  String get authInvalidCredentials => 'Invalid email or password';

  @override
  String get authEmailRequired => 'Please enter your email';

  @override
  String get authPasswordRequired => 'Please enter your password';

  @override
  String get authPasswordMismatch => 'Passwords do not match';

  @override
  String get authResetPassword => 'Reset Password';

  @override
  String get authResetPasswordSent => 'Password reset link has been sent';

  @override
  String get roleSystemAdmin => 'System Administrator';

  @override
  String get roleOpsManager => 'Operations Manager';

  @override
  String get roleTeamLead => 'Team Lead';

  @override
  String get roleRanger => 'Ranger';

  @override
  String get roleAuditor => 'Auditor/Verifier';

  @override
  String get dashOverview => 'Overview';

  @override
  String get dashOnlineActivity => 'Online Activity';

  @override
  String get dashForestArea => 'Forest Area';

  @override
  String get dashCarbonIssued => 'Carbon Issued';

  @override
  String get dashAlertsToday => 'Alerts Today';

  @override
  String get dashTasksTodo => 'Tasks To Do';

  @override
  String get dashWeatherStations => 'Weather Stations';

  @override
  String get dashFireRiskIndex => 'Fire Risk Index';

  @override
  String get dashActivePatrols => 'Active Patrols';

  @override
  String get dashRecentActivity => 'Recent Activity';

  @override
  String get mapForestMap => 'Forest Map';

  @override
  String get mapDrawPolygon => 'Draw Polygon';

  @override
  String get mapCurrentLocation => 'Current Location';

  @override
  String get mapSearch => 'Search';

  @override
  String get mapDataLayers => 'Data Layers';

  @override
  String get mapObservationPoint => 'Observation Point';

  @override
  String get mapBoundaries => 'Boundaries';

  @override
  String get mapNdvi => 'NDVI';

  @override
  String get mapHotspot => 'Hotspot';

  @override
  String get mapSatellite => 'Satellite';

  @override
  String get mapTerrain => 'Terrain';

  @override
  String get mapHybrid => 'Hybrid';

  @override
  String get patrolStart => 'Start Patrol';

  @override
  String get patrolEnd => 'End Patrol';

  @override
  String get patrolActive => 'Active Patrol';

  @override
  String get patrolEnterLocation => 'Enter Location';

  @override
  String get patrolNewObservation => 'New Observation';

  @override
  String get patrolTakePhoto => 'Take Photo';

  @override
  String get patrolRecordAudio => 'Record Audio';

  @override
  String get patrolSubmit => 'Submit';

  @override
  String get patrolList => 'Patrol List';

  @override
  String get patrolDuration => 'Patrol Duration';

  @override
  String get patrolDistance => 'Distance';

  @override
  String get patrolCheckpoint => 'Checkpoint';

  @override
  String get patrolHistory => 'Patrol History';

  @override
  String get patrolNoActivePatrol => 'No active patrols';

  @override
  String get alertTitle => 'Alerts & Incidents';

  @override
  String get alertFireRisk => 'Fire Risk';

  @override
  String get alertDeforestation => 'Deforestation';

  @override
  String get alertForestChange => 'Forest Change';

  @override
  String get alertDisease => 'Disease';

  @override
  String get alertAIDetection => 'AI Detection';

  @override
  String get alertCritical => 'Critical';

  @override
  String get alertHigh => 'High';

  @override
  String get alertMedium => 'Medium';

  @override
  String get alertLow => 'Low';

  @override
  String get alertAcknowledge => 'Acknowledge';

  @override
  String get alertHandle => 'Handle';

  @override
  String get alertResolved => 'Resolved';

  @override
  String get alertPending => 'Pending';

  @override
  String get alertDetail => 'Alert Detail';

  @override
  String get alertNoAlerts => 'No alerts';

  @override
  String get alertFilterBySeverity => 'Filter by Severity';

  @override
  String get alertFilterByType => 'Filter by Type';

  @override
  String get bioSurvey => 'Biodiversity Survey';

  @override
  String get bioCriticallyEndangered => 'Critically Endangered';

  @override
  String get bioEndangered => 'Endangered';

  @override
  String get bioVulnerable => 'Vulnerable';

  @override
  String get bioLeastConcern => 'Least Concern';

  @override
  String get bioRecordSpecies => 'Record Species';

  @override
  String get bioSpeciesCount => 'Species Count';

  @override
  String get bioFlora => 'Flora';

  @override
  String get bioFauna => 'Fauna';

  @override
  String get bioHabitat => 'Habitat';

  @override
  String get fireWeatherTitle => 'Fire & Weather';

  @override
  String get fireTemperature => 'Temperature';

  @override
  String get fireHumidity => 'Humidity';

  @override
  String get fireWindSpeed => 'Wind Speed';

  @override
  String get fireRainfall => 'Rainfall';

  @override
  String get fireFwiIndex => 'FWI Index';

  @override
  String get fireRiskLow => 'Low Risk';

  @override
  String get fireRiskMedium => 'Medium Risk';

  @override
  String get fireRiskHigh => 'High Risk';

  @override
  String get fireRiskCritical => 'Critical Risk';

  @override
  String get fireForecast => 'Fire Forecast';

  @override
  String get fireHistoryData => 'Historical Data';

  @override
  String get fireStationNearby => 'Nearest Station';

  @override
  String get taskTitle => 'Tasks';

  @override
  String get taskAssign => 'Assign Task';

  @override
  String get taskInProgress => 'In Progress';

  @override
  String get taskCompleted => 'Completed';

  @override
  String get taskVerified => 'Verified';

  @override
  String get taskFailed => 'Failed';

  @override
  String get taskCancelled => 'Cancelled';

  @override
  String get taskDetail => 'Task Detail';

  @override
  String get taskDueDate => 'Due Date';

  @override
  String get taskPriority => 'Priority';

  @override
  String get taskAssignee => 'Assignee';

  @override
  String get taskNoTasks => 'No tasks';

  @override
  String get evidenceTitle => 'Evidence';

  @override
  String get evidencePhoto => 'Photo';

  @override
  String get evidenceVideo => 'Video';

  @override
  String get evidenceAudio => 'Audio';

  @override
  String get evidenceDocument => 'Document';

  @override
  String get evidenceGpsData => 'GPS Data';

  @override
  String get evidenceUpload => 'Upload';

  @override
  String get evidenceUnderReview => 'Under Review';

  @override
  String get evidenceApproved => 'Approved';

  @override
  String get evidenceRejected => 'Rejected';

  @override
  String get evidenceNoEvidence => 'No evidence';

  @override
  String get otaUpdate => 'App Update';

  @override
  String get otaNewVersion => 'New Version';

  @override
  String get otaDownloading => 'Downloading';

  @override
  String get otaInstalling => 'Installing';

  @override
  String get otaInstall => 'Install';

  @override
  String get otaRestart => 'Restart';

  @override
  String get otaMandatory => 'Mandatory Update';

  @override
  String get otaCurrentVersion => 'Current Version';

  @override
  String get otaChangelog => 'Changelog';

  @override
  String get offlineNoConnection => 'No Connection';

  @override
  String get offlineMode => 'Offline Mode';

  @override
  String get offlineSyncData => 'Sync Data';

  @override
  String get offlineSyncing => 'Syncing';

  @override
  String get offlineSyncError => 'Sync Error';

  @override
  String get offlineSyncComplete => 'Sync Complete';

  @override
  String get offlinePendingItems => 'Pending Sync Items';

  @override
  String get offlineLastSync => 'Last Sync';

  @override
  String get commonSave => 'Save';

  @override
  String get commonCancel => 'Cancel';

  @override
  String get commonDelete => 'Delete';

  @override
  String get commonEdit => 'Edit';

  @override
  String get commonSearch => 'Search';

  @override
  String get commonFilter => 'Filter';

  @override
  String get commonSort => 'Sort';

  @override
  String get commonAddNew => 'Add New';

  @override
  String get commonDetail => 'Detail';

  @override
  String get commonBack => 'Back';

  @override
  String get commonClose => 'Close';

  @override
  String get commonConfirm => 'Confirm';

  @override
  String get commonSuccess => 'Success';

  @override
  String get commonError => 'Error';

  @override
  String get commonLoading => 'Loading';

  @override
  String get commonRetry => 'Retry';

  @override
  String get commonNoData => 'No Data';

  @override
  String get commonRefresh => 'Refresh';

  @override
  String get commonYes => 'Yes';

  @override
  String get commonNo => 'No';

  @override
  String get commonOk => 'OK';

  @override
  String get commonRequired => 'Required';

  @override
  String get commonOptional => 'Optional';

  @override
  String get permLocation => 'Location Permission';

  @override
  String get permCamera => 'Camera Permission';

  @override
  String get permMicrophone => 'Microphone Permission';

  @override
  String get permNotification => 'Notification Permission';

  @override
  String get permDenied => 'Denied';

  @override
  String get permGranted => 'Granted';

  @override
  String get permRequired => 'This permission is required to use this feature';

  @override
  String get permOpenSettings => 'Open Settings';

  @override
  String get deviceTitle => 'Devices';

  @override
  String get deviceRegister => 'Register Device';

  @override
  String get deviceStatus => 'Status';

  @override
  String get deviceBattery => 'Battery';

  @override
  String get deviceLastLocation => 'Last Location';

  @override
  String get deviceOnline => 'Online';

  @override
  String get deviceOffline => 'Offline';

  @override
  String get deviceId => 'Device ID';

  @override
  String get sosEmergency => 'Emergency';

  @override
  String get sosSend => 'Send SOS Signal';

  @override
  String get sosLocation => 'SOS Location';

  @override
  String get sosSent => 'SOS signal has been sent';

  @override
  String get sosFailed => 'Failed to send SOS. Please try again.';

  @override
  String get sosMessage => 'Emergency Message';

  @override
  String get sosCallRescue => 'Call Rescue';

  @override
  String get settingsTitle => 'Settings';

  @override
  String get settingsLanguage => 'Language';

  @override
  String get settingsTheme => 'Theme';

  @override
  String get settingsNotifications => 'Notifications';

  @override
  String get settingsOfflineMode => 'Offline Mode';

  @override
  String get settingsAbout => 'About';

  @override
  String get settingsVersion => 'Version';

  @override
  String get settingsClearCache => 'Clear Cache';

  @override
  String get settingsDarkMode => 'Dark Mode';

  @override
  String get profileTitle => 'Profile';

  @override
  String get profileName => 'Full Name';

  @override
  String get profileEmail => 'Email';

  @override
  String get profilePhone => 'Phone';

  @override
  String get profileOrganization => 'Organization';

  @override
  String get profileProvince => 'Province';

  @override
  String get profileEdit => 'Edit Profile';

  @override
  String get profileChangePassword => 'Change Password';
}
