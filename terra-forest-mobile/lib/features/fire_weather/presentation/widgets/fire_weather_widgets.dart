import 'dart:math' as math;
import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';

class WeatherConditionCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final Color color;

  const WeatherConditionCard({
    super.key,
    required this.icon,
    required this.label,
    required this.value,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: Theme.of(context).dividerColor),
      ),
      child: Row(
        children: [
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(icon, color: color, size: 20),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: TextStyle(fontSize: 11, color: Colors.grey[600]),
                ),
                Text(
                  value,
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: color),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class FireRiskGauge extends StatelessWidget {
  final double fwiIndex;
  final String riskLevel;

  const FireRiskGauge({
    super.key,
    required this.fwiIndex,
    required this.riskLevel,
  });

  @override
  Widget build(BuildContext context) {
    final riskColor = _riskColor(riskLevel);
    final riskLabel = _riskLabel(riskLevel);

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: riskColor.withOpacity(0.3)),
      ),
      child: Column(
        children: [
          const Text(
            'Mức nguy cơ cháy',
            style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: 180,
            height: 180,
            child: CustomPaint(
              painter: _GaugePainter(
                value: fwiIndex,
                maxValue: 50,
                color: riskColor,
              ),
              child: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      fwiIndex.toStringAsFixed(1),
                      style: TextStyle(
                        fontSize: 36,
                        fontWeight: FontWeight.w800,
                        color: riskColor,
                      ),
                    ),
                    Text(
                      'FWI',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: Colors.grey[600],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
            decoration: BoxDecoration(
              color: riskColor.withOpacity(0.15),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text(
              riskLabel,
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w700,
                color: riskColor,
              ),
            ),
          ),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _riskIndicator(StatusColor.low, 'Thấp'),
              _riskIndicator(StatusColor.medium, 'TBình'),
              _riskIndicator(StatusColor.high, 'Cao'),
              _riskIndicator(StatusColor.critical, 'NGhiêm'),
            ],
          ),
        ],
      ),
    );
  }

  Widget _riskIndicator(Color color, String label) {
    return Column(
      children: [
        Container(
          width: 12,
          height: 12,
          decoration: BoxDecoration(
            color: color,
            shape: BoxShape.circle,
          ),
        ),
        const SizedBox(height: 2),
        Text(label, style: TextStyle(fontSize: 9, color: Colors.grey[600])),
      ],
    );
  }

  Color _riskColor(String level) {
    switch (level) {
      case 'low':
        return StatusColor.low;
      case 'medium':
        return StatusColor.medium;
      case 'high':
        return StatusColor.high;
      case 'critical':
        return StatusColor.critical;
      default:
        return StatusColor.medium;
    }
  }

  String _riskLabel(String level) {
    switch (level) {
      case 'low':
        return 'Nguy cơ thấp';
      case 'medium':
        return 'Nguy cơ trung bình';
      case 'high':
        return 'Nguy cơ cao';
      case 'critical':
        return 'Nguy cơ nghiêm trọng';
      default:
        return 'Không xác định';
    }
  }
}

class _GaugePainter extends CustomPainter {
  final double value;
  final double maxValue;
  final Color color;

  _GaugePainter({
    required this.value,
    required this.maxValue,
    required this.color,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = math.min(size.width, size.height) / 2 - 12;

    // Background arc
    final bgPaint = Paint()
      ..color = Colors.grey[200]!
      ..style = PaintingStyle.stroke
      ..strokeWidth = 12
      ..strokeCap = StrokeCap.round;

    canvas.drawArc(
      Rect.fromCircle(center: center, radius: radius),
      math.pi * 0.75,
      math.pi * 1.5,
      false,
      bgPaint,
    );

    // Value arc
    final progress = (value / maxValue).clamp(0.0, 1.0);
    final valuePaint = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeWidth = 12
      ..strokeCap = StrokeCap.round;

    canvas.drawArc(
      Rect.fromCircle(center: center, radius: radius),
      math.pi * 0.75,
      math.pi * 1.5 * progress,
      false,
      valuePaint,
    );
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}

class WeatherChart extends StatelessWidget {
  const WeatherChart({super.key});

  @override
  Widget build(BuildContext context) {
    final days = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
    final temps = [38.0, 39.0, 37.0, 36.0, 35.0, 37.0, 38.0];
    final rainfalls = [0.0, 0.0, 2.0, 5.0, 8.0, 1.0, 0.0];
    final maxTemp = temps.reduce(math.max);

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
          Row(
            children: [
              _chartLegend(StatusColor.critical, 'Nhiệt độ (°C)'),
              const SizedBox(width: 16),
              _chartLegend(const Color(0xFF0284C7), 'Lượng mưa (mm)'),
            ],
          ),
          const SizedBox(height: 12),
          SizedBox(
            height: 160,
            child: CustomPaint(
              painter: _SimpleBarChartPainter(
                days: days,
                temps: temps,
                rainfalls: rainfalls,
                maxTemp: maxTemp,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _chartLegend(Color color, String label) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 8,
          height: 8,
          decoration: BoxDecoration(color: color, shape: BoxShape.circle),
        ),
        const SizedBox(width: 4),
        Text(label, style: const TextStyle(fontSize: 10)),
      ],
    );
  }
}

class _SimpleBarChartPainter extends CustomPainter {
  final List<String> days;
  final List<double> temps;
  final List<double> rainfalls;
  final double maxTemp;

  _SimpleBarChartPainter({
    required this.days,
    required this.temps,
    required this.rainfalls,
    required this.maxTemp,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final barWidth = size.width / days.length;
    final chartHeight = size.height - 24;

    // Grid lines
    final gridPaint = Paint()
      ..color = Colors.grey[300]!
      ..strokeWidth = 0.5;

    for (var i = 0; i <= 4; i++) {
      final y = chartHeight * i / 4;
      canvas.drawLine(Offset(0, y), Offset(size.width, y), gridPaint);
    }

    for (var i = 0; i < days.length; i++) {
      final x = barWidth * i + barWidth / 2;

      // Temperature bar
      final tempRatio = temps[i] / (maxTemp + 5);
      final tempBarHeight = chartHeight * tempRatio;
      final tempRect = Rect.fromLTWH(
        x - 14,
        chartHeight - tempBarHeight,
        10,
        tempBarHeight,
      );
      canvas.drawRRect(
        RRect.fromRectAndRadius(tempRect, const Radius.circular(3)),
        Paint()..color = StatusColor.critical,
      );

      // Rainfall bar
      final maxRain = rainfalls.reduce((a, b) => a > b ? a : b);
      final rainRatio = maxRain > 0 ? rainfalls[i] / maxRain : 0.0;
      final rainBarHeight = chartHeight * rainRatio * 0.6;
      final rainRect = Rect.fromLTWH(
        x + 4,
        chartHeight - rainBarHeight,
        10,
        rainBarHeight,
      );
      canvas.drawRRect(
        RRect.fromRectAndRadius(rainRect, const Radius.circular(3)),
        Paint()..color = const Color(0xFF0284C7),
      );

      // Day label
      final textSpan = TextSpan(
        text: days[i],
        style: TextStyle(fontSize: 10, color: Colors.grey[600]),
      );
      final tp = TextPainter(text: textSpan, textDirection: TextDirection.ltr);
      tp.layout();
      tp.paint(canvas, Offset(x - tp.width / 2, chartHeight + 4));
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class StationSelector extends StatelessWidget {
  final List<String> stations;
  final String selectedStation;
  final ValueChanged<String> onStationChanged;

  const StationSelector({
    super.key,
    required this.stations,
    required this.selectedStation,
    required this.onStationChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: Theme.of(context).dividerColor),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<String>(
          value: selectedStation,
          isExpanded: true,
          icon: const Icon(Icons.location_on, color: ForestColor.forest600),
          items: stations.map((station) {
            return DropdownMenuItem<String>(
              value: station,
              child: Text(station, style: const TextStyle(fontSize: 14)),
            );
          }).toList(),
          onChanged: (value) {
            if (value != null) onStationChanged(value);
          },
        ),
      ),
    );
  }
}
