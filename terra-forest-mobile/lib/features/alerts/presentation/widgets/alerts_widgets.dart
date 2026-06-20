import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/constants/app_constants.dart';
import '../../../../core/theme/app_theme.dart';
import '../bloc/alerts_bloc.dart';

class AlertCard extends StatelessWidget {
  final Map<String, dynamic> alert;
  final VoidCallback onAcknowledge;
  final VoidCallback onTap;

  const AlertCard({
    super.key,
    required this.alert,
    required this.onAcknowledge,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final severity = alert['severity'] as String? ?? AppConstants.severityLow;
    final alertType = alert['alert_type'] as String? ?? '';
    final status = alert['status'] as String? ?? 'active';
    final message = alert['message_vi'] as String? ?? alert['message'] as String? ?? '';
    final detectedAt = alert['detected_at'] as String? ?? '';
    final plotId = alert['plot_id'] as String? ?? '';
    final severityColor = AppConstants.severityColors[severity] ?? StatusColor.low;

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        decoration: BoxDecoration(
          color: Theme.of(context).cardColor,
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 4,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          children: [
            Container(
              width: 4,
              height: 90,
              decoration: BoxDecoration(
                color: severityColor,
                borderRadius: const BorderRadius.only(
                  topLeft: Radius.circular(12),
                  bottomLeft: Radius.circular(12),
                ),
              ),
            ),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        AlertTypeIcon(type: alertType, size: 18),
                        const SizedBox(width: 6),
                        AlertSeverityBadge(severity: severity),
                        const Spacer(),
                        Text(
                          _timeAgo(detectedAt),
                          style: TextStyle(
                            fontSize: 11,
                            color: Theme.of(context).textTheme.bodySmall?.color,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Text(
                      message,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(fontSize: 13),
                    ),
                    const SizedBox(height: 6),
                    Row(
                      children: [
                        Icon(
                          Icons.location_on_outlined,
                          size: 14,
                          color: Theme.of(context).textTheme.bodySmall?.color,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          plotId.isNotEmpty ? 'Lô: $plotId' : '',
                          style: TextStyle(
                            fontSize: 11,
                            color: Theme.of(context).textTheme.bodySmall?.color,
                          ),
                        ),
                        const Spacer(),
                        if (status == 'active')
                          SizedBox(
                            height: 28,
                            child: TextButton(
                              onPressed: onAcknowledge,
                              style: TextButton.styleFrom(
                                padding: const EdgeInsets.symmetric(horizontal: 10),
                                minimumSize: Size.zero,
                              ),
                              child: const Text(
                                'Xác nhận',
                                style: TextStyle(fontSize: 12),
                              ),
                            ),
                          ),
                        if (status == 'acknowledged')
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color: StatusColor.medium.withOpacity(0.15),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: const Text(
                              'Đã xác nhận',
                              style: TextStyle(
                                fontSize: 11,
                                color: StatusColor.medium,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                        if (status == 'resolved')
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color: StatusColor.low.withOpacity(0.15),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: const Text(
                              'Đã giải quyết',
                              style: TextStyle(
                                fontSize: 11,
                                color: StatusColor.low,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _timeAgo(String isoString) {
    if (isoString.isEmpty) return '';
    try {
      final dt = DateTime.parse(isoString);
      final diff = DateTime.now().difference(dt);
      if (diff.inMinutes < 1) return 'Vừa xong';
      if (diff.inMinutes < 60) return '${diff.inMinutes} phút trước';
      if (diff.inHours < 24) return '${diff.inHours} giờ trước';
      if (diff.inDays < 7) return '${diff.inDays} ngày trước';
      return '${dt.day}/${dt.month}/${dt.year}';
    } catch (_) {
      return '';
    }
  }
}

class AlertSeverityBadge extends StatelessWidget {
  final String severity;

  const AlertSeverityBadge({super.key, required this.severity});

  @override
  Widget build(BuildContext context) {
    final color = AppConstants.severityColors[severity] ?? StatusColor.low;
    final lightColor = AppConstants.severityLightColors[severity] ?? StatusColor.lowLight;
    final name = AppConstants.severityDisplayNames[severity] ?? severity;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: lightColor,
        borderRadius: BorderRadius.circular(4),
      ),
      child: Text(
        name,
        style: TextStyle(
          fontSize: 10,
          fontWeight: FontWeight.w700,
          color: color,
        ),
      ),
    );
  }
}

class AlertTypeIcon extends StatelessWidget {
  final String type;
  final double size;

  const AlertTypeIcon({super.key, required this.type, this.size = 24});

  @override
  Widget build(BuildContext context) {
    final iconCode = AppConstants.alertTypeIcons[type];
    final color = _typeColor(type);
    return Icon(
      iconCode != null ? IconData(iconCode, fontFamily: 'MaterialIcons') : Icons.warning_amber,
      size: size,
      color: color,
    );
  }

  Color _typeColor(String type) {
    switch (type) {
      case 'fire_risk':
        return StatusColor.critical;
      case 'deforestation':
        return StatusColor.high;
      case 'forest_change':
        return StatusColor.medium;
      case 'disease':
        return const Color(0xFF7C3AED);
      case 'ai_detection':
        return const Color(0xFF0284C7);
      default:
        return StatusColor.medium;
    }
  }
}

class AlertFilterChips extends StatelessWidget {
  const AlertFilterChips({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            height: 36,
            child: ListView(
              scrollDirection: Axis.horizontal,
              children: [
                _buildTypeChip(context, null, 'Tất cả'),
                const SizedBox(width: 6),
                _buildTypeChip(context, AppConstants.alertFireRisk, 'Nguy cơ cháy'),
                const SizedBox(width: 6),
                _buildTypeChip(context, AppConstants.alertDeforestation, 'Phá rừng'),
                const SizedBox(width: 6),
                _buildTypeChip(context, AppConstants.alertForestChange, 'Thay đổi rừng'),
                const SizedBox(width: 6),
                _buildTypeChip(context, AppConstants.alertDisease, 'Bệnh'),
                const SizedBox(width: 6),
                _buildTypeChip(context, AppConstants.alertAiDetection, 'Phát hiện AI'),
              ],
            ),
          ),
          const SizedBox(height: 6),
          SizedBox(
            height: 32,
            child: ListView(
              scrollDirection: Axis.horizontal,
              children: [
                _buildSeverityChip(context, null, 'Tất cả mức'),
                const SizedBox(width: 6),
                _buildSeverityChip(context, AppConstants.severityCritical, 'Nghiêm trọng'),
                const SizedBox(width: 6),
                _buildSeverityChip(context, AppConstants.severityHigh, 'Cao'),
                const SizedBox(width: 6),
                _buildSeverityChip(context, AppConstants.severityMedium, 'Trung bình'),
                const SizedBox(width: 6),
                _buildSeverityChip(context, AppConstants.severityLow, 'Thấp'),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTypeChip(BuildContext context, String? type, String label) {
    final state = context.watch<AlertsBloc>().state;
    final isSelected = state is AlertsLoaded && state.filterType == type;
    return FilterChip(
      selected: isSelected,
      label: Text(label, style: const TextStyle(fontSize: 12)),
      onSelected: (_) {
        context.read<AlertsBloc>().add(FilterAlerts(
              type: isSelected ? '' : type,
              severity: state is AlertsLoaded ? state.filterSeverity : null,
              status: state is AlertsLoaded ? state.filterStatus : null,
            ));
      },
    );
  }

  Widget _buildSeverityChip(BuildContext context, String? severity, String label) {
    final state = context.watch<AlertsBloc>().state;
    final isSelected = state is AlertsLoaded && state.filterSeverity == severity;
    return FilterChip(
      selected: isSelected,
      label: Text(label, style: const TextStyle(fontSize: 11)),
      onSelected: (_) {
        context.read<AlertsBloc>().add(FilterAlerts(
              type: state is AlertsLoaded ? state.filterType : null,
              severity: isSelected ? '' : severity,
              status: state is AlertsLoaded ? state.filterStatus : null,
            ));
      },
    );
  }
}

class AlertTimeline extends StatelessWidget {
  final List<Map<String, String>> events;

  const AlertTimeline({super.key, required this.events});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: events.asMap().entries.map((entry) {
        final index = entry.key;
        final event = entry.value;
        final isLast = index == events.length - 1;
        final status = event['status'] ?? '';
        final color = _statusColor(status);

        return IntrinsicHeight(
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Column(
                children: [
                  Container(
                    width: 12,
                    height: 12,
                    decoration: BoxDecoration(
                      color: color,
                      shape: BoxShape.circle,
                    ),
                  ),
                  if (!isLast)
                    Container(
                      width: 2,
                      height: 24,
                      color: color.withOpacity(0.3),
                    ),
                ],
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      event['label'] ?? '',
                      style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500),
                    ),
                    if (event['time']?.isNotEmpty == true)
                      Text(
                        _formatDateTime(event['time'] ?? ''),
                        style: TextStyle(
                          fontSize: 11,
                          color: Theme.of(context).textTheme.bodySmall?.color,
                        ),
                      ),
                    if (!isLast) const SizedBox(height: 8),
                  ],
                ),
              ),
            ],
          ),
        );
      }).toList(),
    );
  }

  Color _statusColor(String status) {
    switch (status) {
      case 'active':
        return StatusColor.critical;
      case 'acknowledged':
        return StatusColor.medium;
      case 'resolved':
        return StatusColor.low;
      default:
        return StatusColor.medium;
    }
  }

  String _formatDateTime(String isoString) {
    if (isoString.isEmpty) return '';
    try {
      final dt = DateTime.parse(isoString);
      return '${dt.day.toString().padLeft(2, '0')}/${dt.month.toString().padLeft(2, '0')}/${dt.year} ${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')}';
    } catch (_) {
      return isoString;
    }
  }
}
