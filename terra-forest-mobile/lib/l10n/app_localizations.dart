import 'package:flutter/material.dart';

/// Stub implementation of AppLocalizations for development.
/// This will be replaced by the generated version when running `flutter gen-l10n`.
class AppLocalizations {
  static const LocalizationsDelegate<AppLocalizations> delegate =
      _AppLocalizationsDelegate();

  static const List<Locale> supportedLocales = [
    Locale('vi'),
    Locale('en'),
  ];

  static AppLocalizations of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations) ??
        AppLocalizations();
  }

  String get appTitle => 'Terra Forest';
  String get login => 'Đăng nhập';
  String get email => 'Email';
  String get password => 'Mật khẩu';
  String get home => 'Trang chủ';
  String get map => 'Bản đồ';
  String get patrol => 'Tuần tra';
  String get alerts => 'Cảnh báo';
  String get tasks => 'Nhiệm vụ';
  String get settings => 'Cài đặt';
  String get syncStatus => 'Trạng thái đồng bộ';
  String get synced => 'đã đồng bộ';
  String get startPatrol => 'Bắt đầu tuần tra';
  String get endPatrol => 'Kết thúc tuần tra';
  String get capturePhoto => 'Chụp ảnh';
  String get recordVideo => 'Quay video';
  String get recordAudio => 'Ghi âm';
  String get addNote => 'Ghi chú';
  String get biodiversity => 'Đa dạng sinh học';
  String get fireWeather => 'Cháy rừng & Thời tiết';
  String get devices => 'Thiết bị';
  String get update => 'Cập nhật';
  String get logout => 'Đăng xuất';
  String get noAlerts => 'Không có cảnh báo';
  String get noTasks => 'Không có nhiệm vụ';
  String get noPatrols => 'Chưa có chuyến tuần tra';
  String get recentActivity => 'Hoạt động gần đây';
  String get quickActions => 'Hành động nhanh';
  String get loginToContinue => 'Đăng nhập để tiếp tục';
  String get enterEmail => 'Vui lòng nhập email';
  String get enterPassword => 'Vui lòng nhập mật khẩu';
}

class _AppLocalizationsDelegate
    extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  bool isSupported(Locale locale) {
    return ['vi', 'en'].contains(locale.languageCode);
  }

  @override
  Future<AppLocalizations> load(Locale locale) async {
    return AppLocalizations();
  }

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}
