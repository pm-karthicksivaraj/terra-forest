import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/constants/app_constants.dart';
import '../../../../core/network/api_client.dart';
import '../../../../core/storage/local_database.dart';
import '../../../../core/storage/sync_manager.dart';
import '../../../../core/storage/data_seeder.dart';
import '../../../../core/theme/app_theme.dart';
import '../widgets/settings_widgets.dart';
import 'package:terra_forest_mobile/features/ota/presentation/bloc/ota_bloc.dart';
import 'package:terra_forest_mobile/features/auth/presentation/bloc/auth_bloc.dart';
import 'package:terra_forest_mobile/features/auth/presentation/bloc/auth_event.dart';

class SettingsPage extends StatefulWidget {
  const SettingsPage({super.key});

  @override
  State<SettingsPage> createState() => _SettingsPageState();
}

class _SettingsPageState extends State<SettingsPage> {
  bool _biometricEnabled = false;
  bool _alertNotifications = true;
  bool _notificationSound = true;
  bool _notificationVibration = true;
  String _selectedLanguage = 'vi';
  bool _isSyncing = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Cài đặt'),
      ),
      body: ListView(
        children: [
          SettingsSection(
            title: 'Tài khoản',
            children: [
              SettingsTile(
                icon: Icons.person_outline,
                title: 'Thông tin tài khoản',
                onTap: () {
                  context.go('/profile');
                },
              ),
              SettingsTile(
                icon: Icons.lock_outline,
                title: 'Đổi mật khẩu',
                onTap: () {
                  _showChangePasswordDialog(context);
                },
              ),
              SettingsTile(
                icon: Icons.fingerprint,
                title: 'Xác thực sinh trắc học',
                trailing: Switch(
                  value: _biometricEnabled,
                  onChanged: (val) {
                    setState(() => _biometricEnabled = val);
                  },
                ),
                onTap: () {
                  setState(() => _biometricEnabled = !_biometricEnabled);
                },
              ),
            ],
          ),
          SettingsSection(
            title: 'Đồng bộ',
            children: [
              SyncStatusTile(
                lastSyncTime: _isSyncing ? 'Đang đồng bộ...' : _getLastSyncText(),
                queueSize: 0,
                onForceSync: _handleForceSync,
              ),
              SettingsTile(
                icon: Icons.delete_sweep_outlined,
                title: 'Xóa bộ nhớ đệm',
                subtitle: 'Xóa dữ liệu tạm thời',
                onTap: () {
                  showDialog(
                    context: context,
                    builder: (ctx) => AlertDialog(
                      title: const Text('Xóa bộ nhớ đệm'),
                      content: const Text('Bạn có chắc muốn xóa bộ nhớ đệm? Dữ liệu ngoại tuyến sẽ không bị ảnh hưởng.'),
                      actions: [
                        TextButton(
                          onPressed: () => Navigator.of(ctx).pop(),
                          child: const Text('Hủy'),
                        ),
                        ElevatedButton(
                          onPressed: () {
                            Navigator.of(ctx).pop();
                            ApiClient.instance.clearCache();
                            if (mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                  content: Text('Đã xóa bộ nhớ đệm'),
                                  backgroundColor: Colors.green,
                                ),
                              );
                            }
                          },
                          child: const Text('Xóa'),
                        ),
                      ],
                    ),
                  );
                },
              ),
              SettingsTile(
                icon: Icons.cloud_off_outlined,
                title: 'Xóa dữ liệu cục bộ',
                subtitle: 'Xóa tất cả dữ liệu đã lưu ngoại tuyến',
                onTap: () {
                  showDialog(
                    context: context,
                    builder: (ctx) => AlertDialog(
                      title: const Text('Xóa dữ liệu cục bộ'),
                      content: const Text('Cảnh báo: Tất cả dữ liệu chưa đồng bộ sẽ bị mất. Bạn có chắc muốn tiếp tục?'),
                      actions: [
                        TextButton(
                          onPressed: () => Navigator.of(ctx).pop(),
                          child: const Text('Hủy'),
                        ),
                        ElevatedButton(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: StatusColor.critical,
                          ),
                          onPressed: () async {
                            Navigator.of(ctx).pop();
                            try {
                              await LocalDatabase.instance.clearAllData();
                              await DataSeeder.seedIfNeeded();
                              if (mounted) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(
                                    content: Text('Đã xóa và tải lại dữ liệu'),
                                    backgroundColor: Colors.green,
                                  ),
                                );
                              }
                            } catch (e) {
                              if (mounted) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(content: Text('Lỗi: $e')),
                                );
                              }
                            }
                          },
                          child: const Text('Xóa', style: TextStyle(color: Colors.white)),
                        ),
                      ],
                    ),
                  );
                },
              ),
            ],
          ),
          SettingsSection(
            title: 'Thu thập dữ liệu ngoại tuyến',
            children: [
              SettingsTile(
                icon: Icons.nature_outlined,
                title: 'Đo kính cây',
                subtitle: 'Ghi nhận số liệu cây rừng',
                onTap: () {
                  context.go('/home/tree-measurement');
                },
              ),
              SettingsTile(
                icon: Icons.report_problem_outlined,
                title: 'Báo cáo vi phạm',
                subtitle: 'Ghi nhận phá rừng, khai thác trái phép',
                onTap: () {
                  context.go('/home/violation-report');
                },
              ),
              SettingsTile(
                icon: Icons.pets_outlined,
                title: 'Quan sát sinh học',
                subtitle: 'Ghi nhận loài động thực vật',
                onTap: () {
                  context.go('/home/biodiversity');
                },
              ),
            ],
          ),
          SettingsSection(
            title: 'Bản đồ',
            children: [
              SettingsTile(
                icon: Icons.map_outlined,
                title: 'Bản đồ ngoại tuyến',
                subtitle: 'Quản lý bản đồ đã tải',
                onTap: () {
                  context.go('/map');
                },
              ),
              SettingsTile(
                icon: Icons.storage_outlined,
                title: 'Bộ nhớ tile bản đồ',
                subtitle: '128 MB',
                onTap: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Quản lý bộ nhớ bản đồ - Đang phát triển')),
                  );
                },
              ),
            ],
          ),
          SettingsSection(
            title: 'Ngôn ngữ',
            children: [
              LanguageSelector(
                selectedLanguage: _selectedLanguage,
                onLanguageChanged: (lang) {
                  setState(() => _selectedLanguage = lang);
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(
                        lang == 'vi' ? 'Đã chọn Tiếng Việt' : 'Language set to English',
                      ),
                    ),
                  );
                },
              ),
            ],
          ),
          SettingsSection(
            title: 'Thông báo',
            children: [
              NotificationToggle(
                icon: Icons.notifications_outlined,
                title: 'Thông báo cảnh báo',
                subtitle: 'Nhận thông báo khi có cảnh báo mới',
                value: _alertNotifications,
                onChanged: (val) {
                  setState(() => _alertNotifications = val);
                },
              ),
              NotificationToggle(
                icon: Icons.volume_up_outlined,
                title: 'Âm thanh thông báo',
                value: _notificationSound,
                onChanged: (val) {
                  setState(() => _notificationSound = val);
                },
              ),
              NotificationToggle(
                icon: Icons.vibration,
                title: 'Rung thông báo',
                value: _notificationVibration,
                onChanged: (val) {
                  setState(() => _notificationVibration = val);
                },
              ),
            ],
          ),
          SettingsSection(
            title: 'Ứng dụng',
            children: [
              SettingsTile(
                icon: Icons.info_outline,
                title: 'Phiên bản',
                subtitle: '1.1.0 (build 42)',
                onTap: () {},
              ),
              SettingsTile(
                icon: Icons.system_update_outlined,
                title: 'Kiểm tra cập nhật',
                onTap: () {
                  context.read<OtaBloc>().add(const OtaCheckRequested());
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Đang kiểm tra cập nhật...')),
                  );
                },
              ),
              SettingsTile(
                icon: Icons.description_outlined,
                title: 'Giấy phép nguồn mở',
                onTap: () {
                  showLicensePage(
                    context: context,
                    applicationName: 'Terra Forest MRV',
                    applicationVersion: '1.1.0',
                  );
                },
              ),
            ],
          ),
          const SizedBox(height: 16),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: OutlinedButton.icon(
              onPressed: () {
                showDialog(
                  context: context,
                  builder: (ctx) => AlertDialog(
                    title: const Text('Đăng xuất'),
                    content: const Text('Bạn có chắc muốn đăng xuất khỏi ứng dụng?'),
                    actions: [
                      TextButton(
                        onPressed: () => Navigator.of(ctx).pop(),
                        child: const Text('Hủy'),
                      ),
                      ElevatedButton(
                        onPressed: () {
                          Navigator.of(ctx).pop();
                          context.read<AuthBloc>().add(const LogoutRequested());
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: StatusColor.critical,
                        ),
                        child: const Text('Đăng xuất', style: TextStyle(color: Colors.white)),
                      ),
                    ],
                  ),
                );
              },
              icon: const Icon(Icons.logout, color: StatusColor.critical),
              label: const Text(
                'Đăng xuất',
                style: TextStyle(color: StatusColor.critical),
              ),
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: StatusColor.critical),
                minimumSize: const Size.fromHeight(48),
              ),
            ),
          ),
          const SizedBox(height: 32),
        ],
      ),
    );
  }

  String _getLastSyncText() {
    // In a real app, read from local settings
    return '10 phút trước';
  }

  Future<void> _handleForceSync() async {
    setState(() => _isSyncing = true);
    try {
      await SyncManager.instance.forceSyncAll();
      if (mounted) {
        setState(() => _isSyncing = false);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Đồng bộ thành công'),
            backgroundColor: Colors.green,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isSyncing = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Đồng bộ thất bại: $e'),
            backgroundColor: Colors.orange,
          ),
        );
      }
    }
  }

  void _showChangePasswordDialog(BuildContext context) {
    final controller = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Đổi mật khẩu'),
        content: TextField(
          controller: controller,
          obscureText: true,
          decoration: const InputDecoration(
            hintText: 'Nhập mật khẩu mới',
            border: OutlineInputBorder(),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('Hủy'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.of(ctx).pop();
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Đổi mật khẩu - Cần kết nối máy chủ')),
              );
            },
            child: const Text('Xác nhận'),
          ),
        ],
      ),
    );
  }
}
