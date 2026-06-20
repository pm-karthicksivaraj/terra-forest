import 'package:flutter/material.dart';
import '../../../../core/constants/app_constants.dart';
import '../../../../core/theme/app_theme.dart';
import '../widgets/alerts_widgets.dart';

class AlertDetailPage extends StatelessWidget {
  final Map<String, dynamic> alert;

  const AlertDetailPage({super.key, required this.alert});

  @override
  Widget build(BuildContext context) {
    final severity = alert['severity'] as String? ?? AppConstants.severityLow;
    final alertType = alert['alert_type'] as String? ?? '';
    final status = alert['status'] as String? ?? 'active';
    final message = alert['message_vi'] as String? ?? alert['message'] as String? ?? '';
    final plotId = alert['plot_id'] as String? ?? '';
    final detectedAt = alert['detected_at'] as String? ?? '';
    final severityColor = AppConstants.severityColors[severity] ?? StatusColor.low;
    final severityName = AppConstants.severityDisplayNames[severity] ?? severity;
    final typeName = AppConstants.alertTypeDisplayNames[alertType] ?? alertType;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Chi tiết cảnh báo'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: severityColor.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: severityColor.withOpacity(0.3)),
              ),
              child: Row(
                children: [
                  AlertTypeIcon(type: alertType, size: 36),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            AlertSeverityBadge(severity: severity),
                            const SizedBox(width: 8),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                              decoration: BoxDecoration(
                                color: _statusColor(status).withOpacity(0.15),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text(
                                _statusLabel(status),
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w600,
                                  color: _statusColor(status),
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 4),
                        Text(
                          typeName,
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            const Text(
              'Nội dung cảnh báo',
              style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 8),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Theme.of(context).cardColor,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(
                  color: Theme.of(context).dividerColor,
                ),
              ),
              child: Text(
                message,
                style: const TextStyle(fontSize: 14),
              ),
            ),
            const SizedBox(height: 16),
            const Text(
              'Vị trí',
              style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 8),
            Container(
              height: 160,
              width: double.infinity,
              decoration: BoxDecoration(
                color: ForestColor.forest100,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: ForestColor.forest300),
              ),
              child: Stack(
                children: [
                  Center(
                    child: Icon(
                      Icons.location_on,
                      color: severityColor,
                      size: 40,
                    ),
                  ),
                  Positioned(
                    bottom: 8,
                    left: 8,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.9),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        'Lô: $plotId',
                        style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            _InfoRow(
              label: 'Thời gian phát hiện',
              value: _formatDateTime(detectedAt),
            ),
            if (alert['acknowledged_by'] != null) ...[
              _InfoRow(
                label: 'Người xác nhận',
                value: alert['acknowledged_by'] as String,
              ),
              _InfoRow(
                label: 'Thời gian xác nhận',
                value: _formatDateTime(alert['acknowledged_at'] as String? ?? ''),
              ),
            ],
            _InfoRow(
              label: 'Mức độ',
              value: severityName,
            ),
            _InfoRow(
              label: 'Loại cảnh báo',
              value: typeName,
            ),
            const SizedBox(height: 16),
            const Text(
              'Lịch sử trạng thái',
              style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 8),
            AlertTimeline(
              events: [
                {
                  'status': 'active',
                  'label': 'Phát hiện cảnh báo',
                  'time': detectedAt,
                },
                if (status == 'acknowledged' || status == 'resolved')
                  {
                    'status': 'acknowledged',
                    'label': 'Xác nhận cảnh báo',
                    'time': alert['acknowledged_at'] as String? ?? '',
                  },
                if (status == 'resolved')
                  {
                    'status': 'resolved',
                    'label': 'Đã giải quyết',
                    'time': '',
                  },
              ],
            ),
            const SizedBox(height: 24),
            _buildActionButtons(context, status),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }

  Widget _buildActionButtons(BuildContext context, String status) {
    return Row(
      children: [
        if (status == 'active')
          Expanded(
            child: ElevatedButton.icon(
              onPressed: () {
                Navigator.of(context).pop();
              },
              icon: const Icon(Icons.check_circle_outline),
              label: const Text('Xác nhận'),
            ),
          ),
        if (status == 'acknowledged') ...[
          Expanded(
            child: OutlinedButton.icon(
              onPressed: () {},
              icon: const Icon(Icons.send_outlined),
              label: const Text('Phân công'),
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: ElevatedButton.icon(
              onPressed: () {},
              icon: const Icon(Icons.task_alt),
              label: const Text('Giải quyết'),
            ),
          ),
        ],
        if (status == 'resolved')
          Expanded(
            child: ElevatedButton.icon(
              onPressed: null,
              icon: const Icon(Icons.check_circle),
              label: const Text('Đã giải quyết'),
            ),
          ),
      ],
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
        return StatusColor.low;
    }
  }

  String _statusLabel(String status) {
    switch (status) {
      case 'active':
        return 'Đang hoạt động';
      case 'acknowledged':
        return 'Đã xác nhận';
      case 'resolved':
        return 'Đã giải quyết';
      default:
        return status;
    }
  }

  String _formatDateTime(String isoString) {
    if (isoString.isEmpty) return '--';
    try {
      final dt = DateTime.parse(isoString);
      return '${dt.day.toString().padLeft(2, '0')}/${dt.month.toString().padLeft(2, '0')}/${dt.year} ${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')}';
    } catch (_) {
      return isoString;
    }
  }
}

class _InfoRow extends StatelessWidget {
  final String label;
  final String value;

  const _InfoRow({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 140,
            child: Text(
              label,
              style: TextStyle(
                fontSize: 13,
                color: Theme.of(context).textTheme.bodySmall?.color,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500),
            ),
          ),
        ],
      ),
    );
  }
}
