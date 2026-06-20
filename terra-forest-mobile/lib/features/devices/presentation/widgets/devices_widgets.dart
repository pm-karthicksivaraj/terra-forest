import 'dart:math' as math;
import 'package:flutter/material.dart';
import '../../../../core/constants/app_constants.dart';
import '../../../../core/theme/app_theme.dart';

class DeviceCard extends StatelessWidget {
  final Map<String, dynamic> device;
  final VoidCallback onTap;

  const DeviceCard({
    super.key,
    required this.device,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final status = device['status'] as String? ?? 'offline';
    final battery = device['battery'] as int? ?? 0;

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Theme.of(context).cardColor,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Theme.of(context).dividerColor),
        ),
        child: Row(
          children: [
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                color: status == 'online'
                    ? ForestColor.forest100
                    : ForestColor.earth600.withOpacity(0.1),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(
                Icons.phone_android,
                color: status == 'online' ? ForestColor.forest600 : ForestColor.earth600,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          device['name'] as String? ?? '',
                          style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      DeviceStatusBadge(status: status),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Text(
                        '${device['platform']} • ${device['app_version']}',
                        style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                      ),
                      const Spacer(),
                      BatteryIndicator(battery: battery),
                    ],
                  ),
                  const SizedBox(height: 2),
                  Text(
                    'Hoạt động cuối: ${device['last_active']}',
                    style: TextStyle(fontSize: 11, color: Colors.grey[500]),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 8),
            const Icon(Icons.chevron_right, size: 18),
          ],
        ),
      ),
    );
  }
}

class DeviceStatusBadge extends StatelessWidget {
  final String status;

  const DeviceStatusBadge({super.key, required this.status});

  @override
  Widget build(BuildContext context) {
    final isOnline = status == 'online';
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: isOnline ? StatusColor.low.withOpacity(0.15) : Colors.grey.withOpacity(0.15),
        borderRadius: BorderRadius.circular(4),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 6,
            height: 6,
            decoration: BoxDecoration(
              color: isOnline ? StatusColor.low : Colors.grey,
              shape: BoxShape.circle,
            ),
          ),
          const SizedBox(width: 4),
          Text(
            isOnline ? 'Trực tuyến' : 'Ngoại tuyến',
            style: TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.w700,
              color: isOnline ? StatusColor.low : Colors.grey,
            ),
          ),
        ],
      ),
    );
  }
}

class BatteryIndicator extends StatelessWidget {
  final int battery;

  const BatteryIndicator({super.key, required this.battery});

  @override
  Widget build(BuildContext context) {
    final color = _batteryColor(battery);
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(
          battery > 50
              ? Icons.battery_std
              : battery > 20
                  ? Icons.battery_alert
                  : Icons.battery_0_bar,
          size: 16,
          color: color,
        ),
        const SizedBox(width: 2),
        Text(
          '$battery%',
          style: TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w600,
            color: color,
          ),
        ),
      ],
    );
  }

  Color _batteryColor(int level) {
    if (level > 50) return StatusColor.low;
    if (level > 20) return StatusColor.medium;
    return StatusColor.critical;
  }
}

class ActivityChart extends StatelessWidget {
  const ActivityChart({super.key});

  @override
  Widget build(BuildContext context) {
    final activityData = [3.0, 5.0, 2.0, 7.0, 4.0, 6.0, 3.0];
    final dayLabels = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
    final maxVal = activityData.reduce(math.max);

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: Theme.of(context).dividerColor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Số giờ hoạt động/ngày',
            style: TextStyle(fontSize: 11, color: Colors.grey[600]),
          ),
          const SizedBox(height: 8),
          SizedBox(
            height: 100,
            child: CustomPaint(
              painter: _ActivityBarPainter(
                data: activityData,
                labels: dayLabels,
                maxValue: maxVal,
                color: ForestColor.forest600,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _ActivityBarPainter extends CustomPainter {
  final List<double> data;
  final List<String> labels;
  final double maxValue;
  final Color color;

  _ActivityBarPainter({
    required this.data,
    required this.labels,
    required this.maxValue,
    required this.color,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final barWidth = size.width / data.length;
    final chartHeight = size.height - 20;

    for (var i = 0; i < data.length; i++) {
      final x = barWidth * i + barWidth / 2;
      final ratio = maxValue > 0 ? data[i] / maxValue : 0.0;
      final barHeight = chartHeight * ratio;

      final rect = Rect.fromLTWH(
        x - 8,
        chartHeight - barHeight,
        16,
        barHeight,
      );
      canvas.drawRRect(
        RRect.fromRectAndRadius(rect, const Radius.circular(4)),
        Paint()..color = color,
      );

      // Label
      final textSpan = TextSpan(
        text: labels[i],
        style: TextStyle(fontSize: 9, color: Colors.grey[600]),
      );
      final tp = TextPainter(text: textSpan, textDirection: TextDirection.ltr);
      tp.layout();
      tp.paint(canvas, Offset(x - tp.width / 2, chartHeight + 4));
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
