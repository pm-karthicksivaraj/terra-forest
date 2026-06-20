import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/app_constants.dart';
import '../../../../core/storage/local_database.dart';
import '../../../../core/storage/sync_manager.dart';
import '../bloc/auth_bloc.dart';
import '../bloc/auth_event.dart';
import '../bloc/auth_state.dart';

/// Profile page with user info, sync status, offline data management, and logout.
class ProfilePage extends StatefulWidget {
  const ProfilePage({super.key});

  @override
  State<ProfilePage> createState() => _ProfilePageState();
}

class _ProfilePageState extends State<ProfilePage> {
  Map<String, dynamic>? _syncStats;
  SyncStatus _syncStatus = SyncStatus.idle;
  Stream<SyncStatus>? _syncStream;

  @override
  void initState() {
    super.initState();
    _loadSyncStats();
    _syncStream = SyncManager.instance.getSyncStatus();
    _syncStream?.listen((status) {
      if (mounted) {
        setState(() => _syncStatus = status);
        if (status == SyncStatus.idle) _loadSyncStats();
      }
    });
  }

  Future<void> _loadSyncStats() async {
    try {
      final stats = await LocalDatabase.instance.getSyncStatistics();
      if (mounted) {
        setState(() => _syncStats = stats);
      }
    } catch (_) {}
  }

  Future<void> _forceSync() async {
    try {
      await SyncManager.instance.forceSyncAll();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Đồng bộ hoàn tất!'), backgroundColor: Colors.green),
        );
        _loadSyncStats();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Lỗi đồng bộ: $e'), backgroundColor: Colors.red),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final authState = context.watch<AuthBloc>().state;
    final user = authState is AuthAuthenticated ? authState.user : null;
    final primaryRole = user?.roles.isNotEmpty == true ? user!.roles.first.name : 'ranger';
    final roleDisplay = AppConstants.roleDisplayNames[primaryRole] ?? primaryRole;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Hồ sơ'),
        actions: [
          IconButton(
            icon: const Icon(Icons.sync),
            onPressed: _syncStatus == SyncStatus.syncing ? null : _forceSync,
            tooltip: 'Đồng bộ ngay',
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          _loadSyncStats();
          await Future.delayed(const Duration(milliseconds: 500));
        },
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // User info card
            Card(
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  children: [
                    CircleAvatar(
                      radius: 40,
                      backgroundColor: const Color(0xFF2E7D32),
                      child: Text(
                        (user?.name.isNotEmpty == true ? user!.name[0] : '?').toUpperCase(),
                        style: const TextStyle(fontSize: 32, color: Colors.white, fontWeight: FontWeight.bold),
                      ),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      user?.name ?? 'Người dùng',
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      user?.email ?? '',
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: Colors.grey[600]),
                    ),
                    const SizedBox(height: 8),
                    Chip(
                      avatar: const Icon(Icons.badge, size: 16),
                      label: Text(roleDisplay, style: const TextStyle(fontSize: 13)),
                      backgroundColor: const Color(0xFFE8F5E9),
                      side: const BorderSide(color: Color(0xFFC8E6C9)),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Sync status card
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(_syncStatusIcon, color: _syncStatusColor, size: 20),
                        const SizedBox(width: 8),
                        Text('Trạng thái đồng bộ', style: Theme.of(context).textTheme.titleMedium),
                        const Spacer(),
                        if (_syncStatus == SyncStatus.syncing)
                          const SizedBox(
                            width: 16,
                            height: 16,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Text(_syncStatusLabel, style: TextStyle(color: _syncStatusColor, fontWeight: FontWeight.w500)),
                    const SizedBox(height: 16),

                    // Sync statistics
                    if (_syncStats != null) ...[
                      _buildSyncStatRow('Dữ liệu chờ gửi', '${_syncStats!['pendingCount'] ?? 0} mục', Icons.cloud_upload_outlined),
                      const SizedBox(height: 8),
                      _buildSyncStatRow('Đã đồng bộ', '${_syncStats!['syncedCount'] ?? 0} mục', Icons.cloud_done_outlined),
                      const SizedBox(height: 8),
                      _buildSyncStatRow('Lỗi đồng bộ', '${_syncStats!['errorCount'] ?? 0} mục', Icons.error_outline),
                    ],
                    const SizedBox(height: 16),
                    SizedBox(
                      width: double.infinity,
                      child: FilledButton.icon(
                        onPressed: _syncStatus == SyncStatus.syncing ? null : _forceSync,
                        icon: const Icon(Icons.sync, size: 18),
                        label: const Text('Đồng bộ ngay'),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Offline data card
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Dữ liệu ngoại tuyến', style: Theme.of(context).textTheme.titleMedium),
                    const SizedBox(height: 12),
                    _buildOfflineInfoRow('Tuần tra đang hoạt động', '${_syncStats?['pendingPatrols'] ?? 0}'),
                    const SizedBox(height: 6),
                    _buildOfflineInfoRow('Quan sát chưa gửi', '${_syncStats?['pendingObservations'] ?? 0}'),
                    const SizedBox(height: 6),
                    _buildOfflineInfoRow('Bằng chứng chưa gửi', '${_syncStats?['pendingProofs'] ?? 0}'),
                    const SizedBox(height: 6),
                    _buildOfflineInfoRow('Vị trí GPS chưa gửi', '${_syncStats?['pendingLocations'] ?? 0}'),
                    const SizedBox(height: 16),
                    Text(
                      'Dữ liệu sẽ được tự động gửi khi có kết nối mạng.',
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(color: Colors.grey[600]),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Quick actions
            Card(
              child: Column(
                children: [
                  ListTile(
                    leading: const Icon(Icons.map_outlined, color: Color(0xFF2E7D32)),
                    title: const Text('Tải bản đồ ngoại tuyến'),
                    subtitle: const Text('Lưu bản đồ khu vực để dùng khi không có mạng'),
                    trailing: const Icon(Icons.download_outlined),
                    onTap: () => context.go('/map'),
                  ),
                  const Divider(height: 1),
                  ListTile(
                    leading: const Icon(Icons.info_outline, color: Color(0xFF2E7D32)),
                    title: const Text('Về ứng dụng'),
                    subtitle: const Text('Terra Forest MRV v1.0.0'),
                    trailing: const Icon(Icons.chevron_right),
                    onTap: () {
                      showAboutDialog(
                        context: context,
                        applicationName: 'Terra Forest MRV',
                        applicationVersion: '1.0.0',
                        applicationIcon: const Icon(Icons.forest, size: 48, color: Color(0xFF2E7D32)),
                        children: [
                          const Text('Nền tảng MRV Số cho Lâm nghiệp Việt Nam\nVườn Quốc gia Bù Gia Mập, Đồng Nai'),
                        ],
                      );
                    },
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Logout button
            SizedBox(
              width: double.infinity,
              child: OutlinedButton.icon(
                onPressed: () {
                  showDialog(
                    context: context,
                    builder: (ctx) => AlertDialog(
                      title: const Text('Đăng xuất?'),
                      content: const Text('Bạn có chắc muốn đăng xuất? Dữ liệu chưa đồng bộ sẽ được giữ lại trên thiết bị.'),
                      actions: [
                        TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Hủy')),
                        FilledButton(
                          onPressed: () {
                            Navigator.pop(ctx);
                            context.read<AuthBloc>().add(const LogoutRequested());
                          },
                          style: FilledButton.styleFrom(backgroundColor: Colors.red),
                          child: const Text('Đăng xuất'),
                        ),
                      ],
                    ),
                  );
                },
                icon: const Icon(Icons.logout, color: Colors.red),
                label: const Text('Đăng xuất', style: TextStyle(color: Colors.red)),
                style: OutlinedButton.styleFrom(side: const BorderSide(color: Colors.red)),
              ),
            ),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  Widget _buildSyncStatRow(String label, String value, IconData icon) {
    return Row(
      children: [
        Icon(icon, size: 18, color: Colors.grey[600]),
        const SizedBox(width: 8),
        Expanded(child: Text(label, style: const TextStyle(fontSize: 14))),
        Text(value, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
      ],
    );
  }

  Widget _buildOfflineInfoRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(fontSize: 14)),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
          decoration: BoxDecoration(
            color: int.parse(value) > 0 ? Colors.orange.shade50 : Colors.green.shade50,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Text(
            value,
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: int.parse(value) > 0 ? Colors.orange.shade700 : Colors.green.shade700,
            ),
          ),
        ),
      ],
    );
  }

  IconData get _syncStatusIcon {
    switch (_syncStatus) {
      case SyncStatus.syncing:
        return Icons.sync;
      case SyncStatus.idle:
        return Icons.cloud_done_outlined;
      case SyncStatus.error:
        return Icons.cloud_off_outlined;
      case SyncStatus.offline:
        return Icons.cloud_off_outlined;
    }
  }

  Color get _syncStatusColor {
    switch (_syncStatus) {
      case SyncStatus.syncing:
        return Colors.blue;
      case SyncStatus.idle:
        return Colors.green;
      case SyncStatus.error:
        return Colors.red;
      case SyncStatus.offline:
        return Colors.orange;
    }
  }

  String get _syncStatusLabel {
    switch (_syncStatus) {
      case SyncStatus.syncing:
        return 'Đang đồng bộ...';
      case SyncStatus.idle:
        return 'Đã đồng bộ';
      case SyncStatus.error:
        return 'Lỗi đồng bộ';
      case SyncStatus.offline:
        return 'Không có kết nối mạng';
    }
  }
}
