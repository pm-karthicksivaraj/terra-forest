import 'package:flutter/material.dart';
import '../../../../core/constants/app_constants.dart';
import '../../../../core/theme/app_theme.dart';
import '../widgets/fire_weather_widgets.dart';

class FireWeatherPage extends StatefulWidget {
  const FireWeatherPage({super.key});

  @override
  State<FireWeatherPage> createState() => _FireWeatherPageState();
}

class _FireWeatherPageState extends State<FireWeatherPage> {
  String _selectedStation = 'Trạm Bu Gia Map';
  final List<String> _stations = [
    'Trạm Bu Gia Map',
    'Trạm Đắk Nông',
    'Trạm Lâm Đồng',
    'Trạm Cà Mau',
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Thời tiết cháy rừng'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            StationSelector(
              stations: _stations,
              selectedStation: _selectedStation,
              onStationChanged: (station) {
                setState(() => _selectedStation = station);
              },
            ),
            const SizedBox(height: 16),
            _buildCurrentConditions(),
            const SizedBox(height: 16),
            const FireRiskGauge(fwiIndex: 28.5, riskLevel: 'high'),
            const SizedBox(height: 16),
            const Text(
              'Dự báo 7 ngày',
              style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 8),
            const WeatherChart(),
            const SizedBox(height: 16),
            _buildWeatherAlerts(),
          ],
        ),
      ),
    );
  }

  Widget _buildCurrentConditions() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Điều kiện hiện tại',
          style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
        ),
        const SizedBox(height: 8),
        Row(
          children: [
            Expanded(
              child: WeatherConditionCard(
                icon: Icons.thermostat,
                label: 'Nhiệt độ',
                value: '38°C',
                color: StatusColor.critical,
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: WeatherConditionCard(
                icon: Icons.water_drop,
                label: 'Độ ẩm',
                value: '18%',
                color: StatusColor.high,
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        Row(
          children: [
            Expanded(
              child: WeatherConditionCard(
                icon: Icons.air,
                label: 'Gió',
                value: '15 km/h',
                color: StatusColor.medium,
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: WeatherConditionCard(
                icon: Icons.grain,
                label: 'Lượng mưa',
                value: '0 mm',
                color: StatusColor.high,
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        WeatherConditionCard(
          icon: Icons.local_fire_department,
          label: 'Chỉ số FWI',
          value: '28.5',
          color: StatusColor.critical,
        ),
      ],
    );
  }

  Widget _buildWeatherAlerts() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Cảnh báo thời tiết',
          style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
        ),
        const SizedBox(height: 8),
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: StatusColor.criticalLight,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: StatusColor.critical.withOpacity(0.3)),
          ),
          child: const Row(
            children: [
              Icon(Icons.warning_amber, color: StatusColor.critical, size: 24),
              SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Cảnh báo cháy rừng cấp cao',
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        color: StatusColor.critical,
                      ),
                    ),
                    SizedBox(height: 2),
                    Text(
                      'Nhiệt độ cao kết hợp độ ẩm thấp tạo nguy cơ cháy rừng rất cao. Hạn chế các hoạt động trong khu vực rừng.',
                      style: TextStyle(fontSize: 12, color: StatusColor.critical),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 8),
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: StatusColor.mediumLight,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: StatusColor.medium.withOpacity(0.3)),
          ),
          child: const Row(
            children: [
              Icon(Icons.air, color: StatusColor.medium, size: 24),
              SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Gió mạnh dự báo',
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        color: StatusColor.medium,
                      ),
                    ),
                    SizedBox(height: 2),
                    Text(
                      'Dự báo gió mạnh trong 24 giờ tới, có thể làm lan rộng cháy nếu xảy ra.',
                      style: TextStyle(fontSize: 12, color: StatusColor.medium),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
