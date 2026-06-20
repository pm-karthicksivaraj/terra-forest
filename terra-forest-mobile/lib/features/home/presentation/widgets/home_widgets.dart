import 'package:flutter/material.dart';

import '../bloc/home_bloc.dart';

// ─── KpiCard ────────────────────────────────────────────────────────────────

/// KPI card displaying a key metric with icon, value, label, and optional trend.
class KpiCard extends StatelessWidget {
  final IconData icon;
  final String value;
  final String label;
  final Color color;
  final String? trend;
  final bool trendUp;

  const KpiCard({
    super.key,
    required this.icon,
    required this.value,
    required this.label,
    required this.color,
    this.trend,
    this.trendUp = true,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 140,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: color.withOpacity(0.08),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: color.withOpacity(0.2)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: color.withOpacity(0.15),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(icon, color: color, size: 22),
          ),
          const SizedBox(height: 10),
          Text(
            value,
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            label,
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: Theme.of(context).colorScheme.onSurfaceVariant,
                  fontSize: 11,
                ),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
          if (trend != null) ...[
            const SizedBox(height: 4),
            Row(
              children: [
                Icon(
                  trendUp ? Icons.trending_up : Icons.trending_down,
                  size: 14,
                  color: trendUp ? Colors.green : Colors.red,
                ),
                const SizedBox(width: 2),
                Text(
                  trend!,
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w600,
                    color: trendUp ? Colors.green : Colors.red,
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }
}

// ─── QuickActionGrid ────────────────────────────────────────────────────────

/// 2x3 grid of quick action buttons.
class QuickActionGrid extends StatelessWidget {
  final VoidCallback? onMapTap;
  final VoidCallback? onPatrolTap;
  final VoidCallback? onTaskTap;
  final VoidCallback? onAlertTap;
  final VoidCallback? onCameraTap;
  final VoidCallback? onSosTap;

  const QuickActionGrid({
    super.key,
    this.onMapTap,
    this.onPatrolTap,
    this.onTaskTap,
    this.onAlertTap,
    this.onCameraTap,
    this.onSosTap,
  });

  @override
  Widget build(BuildContext context) {
    final actions = [
      _QuickAction(
        icon: Icons.map,
        label: 'Bản đồ',
        color: const Color(0xFF2D6A4F),
        onTap: onMapTap,
      ),
      _QuickAction(
        icon: Icons.directions_walk,
        label: 'Tuần tra',
        color: const Color(0xFF40916C),
        onTap: onPatrolTap,
      ),
      _QuickAction(
        icon: Icons.assignment,
        label: 'Nhiệm vụ',
        color: const Color(0xFF52B788),
        onTap: onTaskTap,
      ),
      _QuickAction(
        icon: Icons.notifications_active,
        label: 'Cảnh báo',
        color: const Color(0xFFE65100),
        onTap: onAlertTap,
      ),
      _QuickAction(
        icon: Icons.camera_alt,
        label: 'Chụp ảnh',
        color: const Color(0xFF0277BD),
        onTap: onCameraTap,
      ),
      _QuickAction(
        icon: Icons.emergency,
        label: 'SOS',
        color: const Color(0xFFDC2626),
        onTap: onSosTap,
      ),
    ];

    return GridView.count(
      crossAxisCount: 3,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      mainAxisSpacing: 12,
      crossAxisSpacing: 12,
      childAspectRatio: 1.0,
      children: actions,
    );
  }
}

class _QuickAction extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback? onTap;

  const _QuickAction({
    required this.icon,
    required this.label,
    required this.color,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: color.withOpacity(0.08),
      borderRadius: BorderRadius.circular(14),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(14),
        child: Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: color.withOpacity(0.2)),
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: color.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(icon, color: color, size: 26),
              ),
              const SizedBox(height: 8),
              Text(
                label,
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: color,
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ─── AlertSummaryCard ───────────────────────────────────────────────────────

/// Card displaying a single alert in the recent alerts section.
class AlertSummaryCard extends StatelessWidget {
  final AlertSummary alert;
  final VoidCallback? onTap;

  const AlertSummaryCard({
    super.key,
    required this.alert,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: EdgeInsets.zero,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: alert.severityLightColor,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(alert.icon, color: alert.severityColor, size: 22),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      alert.displayMessage,
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            fontWeight: FontWeight.w500,
                          ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      _formatTimeAgo(alert.detectedAt),
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: Theme.of(context).colorScheme.onSurfaceVariant,
                          ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: alert.severityLightColor,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  alert.severityLabel,
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w600,
                    color: alert.severityColor,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  String _formatTimeAgo(DateTime dt) {
    final diff = DateTime.now().difference(dt);
    if (diff.inMinutes < 1) return 'Vừa xong';
    if (diff.inMinutes < 60) return '${diff.inMinutes} phút trước';
    if (diff.inHours < 24) return '${diff.inHours} giờ trước';
    return '${diff.inDays} ngày trước';
  }
}

// ─── TaskSummaryCard ────────────────────────────────────────────────────────

/// Card displaying a single task in the pending tasks section.
class TaskSummaryCard extends StatelessWidget {
  final TaskSummary task;
  final VoidCallback? onTap;

  const TaskSummaryCard({
    super.key,
    required this.task,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: EdgeInsets.zero,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: task.priorityColor.withOpacity(0.12),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(task.icon, color: task.priorityColor, size: 22),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      task.title,
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            fontWeight: FontWeight.w500,
                          ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),
                    if (task.dueDate != null)
                      Text(
                        'Hạn: ${task.dueDate!.day.toString().padLeft(2, '0')}/${task.dueDate!.month.toString().padLeft(2, '0')}',
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                              color: Theme.of(context).colorScheme.onSurfaceVariant,
                            ),
                      ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: task.priorityColor.withOpacity(0.12),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  task.priorityLabel,
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w600,
                    color: task.priorityColor,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ─── WeatherWidget ──────────────────────────────────────────────────────────

/// Widget displaying weather information and fire risk level.
class WeatherWidget extends StatelessWidget {
  final WeatherData weather;

  const WeatherWidget({super.key, required this.weather});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: EdgeInsets.zero,
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.wb_sunny, color: Colors.orange, size: 20),
                const SizedBox(width: 8),
                Text(
                  'Thời tiết',
                  style: Theme.of(context).textTheme.titleSmall?.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                ),
                const Spacer(),
                Text(
                  '${weather.temperature.toStringAsFixed(1)}°C',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                ),
              ],
            ),
            const SizedBox(height: 10),
            Row(
              children: [
                // Humidity
                Expanded(
                  child: _WeatherStat(
                    icon: Icons.water_drop,
                    label: 'Độ ẩm',
                    value: '${weather.humidity.toStringAsFixed(0)}%',
                    color: Colors.blue,
                  ),
                ),
                const SizedBox(width: 12),
                // Fire risk
                Expanded(
                  child: _WeatherStat(
                    icon: Icons.local_fire_department,
                    label: 'Rủi ro cháy',
                    value: weather.fireRiskLabel,
                    color: weather.fireRiskColor,
                  ),
                ),
              ],
            ),
            if (weather.description != null) ...[
              const SizedBox(height: 8),
              Text(
                weather.description!,
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: Theme.of(context).colorScheme.onSurfaceVariant,
                    ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _WeatherStat extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final Color color;

  const _WeatherStat({
    required this.icon,
    required this.label,
    required this.value,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: color.withOpacity(0.08),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Row(
        children: [
          Icon(icon, color: color, size: 18),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: Theme.of(context).colorScheme.onSurfaceVariant,
                        fontSize: 10,
                      ),
                ),
                Text(
                  value,
                  style: TextStyle(
                    fontWeight: FontWeight.w600,
                    fontSize: 13,
                    color: color,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ─── SyncStatusIndicator ────────────────────────────────────────────────────

/// Small dot indicator showing the current sync status.
class SyncStatusIndicator extends StatelessWidget {
  final HomeSyncStatus syncStatus;

  const SyncStatusIndicator({super.key, required this.syncStatus});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 8,
          height: 8,
          decoration: BoxDecoration(
            color: syncStatus.color,
            shape: BoxShape.circle,
          ),
        ),
        const SizedBox(width: 4),
        Text(
          syncStatus.label,
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: syncStatus.color,
                fontWeight: FontWeight.w500,
                fontSize: 11,
              ),
        ),
      ],
    );
  }
}

// ─── OfflineBanner ──────────────────────────────────────────────────────────

/// Full-width banner shown when the device is offline.
class OfflineBanner extends StatelessWidget {
  final VoidCallback? onSyncTap;

  const OfflineBanner({super.key, this.onSyncTap});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      color: Colors.orange.shade100,
      child: Row(
        children: [
          const Icon(Icons.cloud_off, color: Colors.orange, size: 20),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              'Dữ liệu ngoại tuyến – một số thông tin có thể chưa cập nhật',
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w500,
                color: Colors.orange.shade900,
              ),
            ),
          ),
          const SizedBox(width: 8),
          TextButton(
            onPressed: onSyncTap,
            style: TextButton.styleFrom(
              padding: const EdgeInsets.symmetric(horizontal: 12),
              minimumSize: Size.zero,
              tapTargetSize: MaterialTapTargetSize.shrinkWrap,
            ),
            child: Text(
              'Đồng bộ',
              style: TextStyle(
                fontSize: 13,
                color: Colors.orange.shade900,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ─── GreetingHeader ─────────────────────────────────────────────────────────

/// Top greeting header with user name and role badge.
class GreetingHeader extends StatelessWidget {
  final String userName;
  final String roleLabel;
  final HomeSyncStatus syncStatus;

  const GreetingHeader({
    super.key,
    required this.userName,
    required this.roleLabel,
    required this.syncStatus,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Xin chào, $userName',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                ),
                const SizedBox(height: 2),
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(
                        color: Theme.of(context)
                            .colorScheme
                            .primary
                            .withOpacity(0.12),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        roleLabel,
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                              color: Theme.of(context).colorScheme.primary,
                              fontWeight: FontWeight.w600,
                              fontSize: 11,
                            ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    SyncStatusIndicator(syncStatus: syncStatus),
                  ],
                ),
              ],
            ),
          ),
          CircleAvatar(
            radius: 24,
            backgroundColor: Theme.of(context).colorScheme.primary,
            child: Text(
              userName.isNotEmpty ? userName[0].toUpperCase() : '?',
              style: TextStyle(
                color: Theme.of(context).colorScheme.onPrimary,
                fontWeight: FontWeight.bold,
                fontSize: 20,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
