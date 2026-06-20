import 'package:flutter/material.dart';
import '../../../../core/constants/app_constants.dart';
import '../../../../core/theme/app_theme.dart';
import '../widgets/devices_widgets.dart';

class DevicesPage extends StatefulWidget {
  const DevicesPage({super.key});

  @override
  State<DevicesPage> createState() => _DevicesPageState();
}

class _DevicesPageState extends State<DevicesPage> {
  final List<Map<String, dynamic>> _devices = _getMockDevices();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Thiết bị'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: _registerNewDevice,
          ),
        ],
      ),
      body: ListView.separated(
        padding: const EdgeInsets.all(16),
        itemCount: _devices.length,
        separatorBuilder: (_, __) => const SizedBox(height: 8),
        itemBuilder: (context, index) {
          final device = _devices[index];
          return DeviceCard(
            device: device,
            onTap: () => _showDeviceDetail(context, device),
          );
        },
      ),
    );
  }

  void _showDeviceDetail(BuildContext context, Map<String, dynamic> device) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (ctx) {
        return DraggableScrollableSheet(
          initialChildSize: 0.65,
          minChildSize: 0.3,
          maxChildSize: 0.9,
          expand: false,
          builder: (_, scrollController) {
            return SingleChildScrollView(
              controller: scrollController,
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Center(
                    child: Container(
                      width: 40,
                      height: 4,
                      decoration: BoxDecoration(
                        color: Colors.grey[300],
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              device['name'] as String,
                              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700),
                            ),
                            const SizedBox(height: 4),
                            DeviceStatusBadge(status: device['status'] as String),
                          ],
                        ),
                      ),
                      BatteryIndicator(battery: device['battery'] as int),
                    ],
                  ),
                  const SizedBox(height: 16),
                  const Divider(),
                  const SizedBox(height: 8),
                  _detailRow('Nền tảng', device['platform'] as String),
                  _detailRow('Phiên bản OS', device['os_version'] as String),
                  _detailRow('Phiên bản ứng dụng', device['app_version'] as String),
                  _detailRow('Hoạt động cuối', device['last_active'] as String),
                  const SizedBox(height: 16),
                  const Text(
                    'Hoạt động 7 ngày gần nhất',
                    style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(height: 8),
                  const ActivityChart(),
                  const SizedBox(height: 16),
                  const Text(
                    'Vị trí gần đây',
                    style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(height: 8),
                  Container(
                    height: 120,
                    width: double.infinity,
                    decoration: BoxDecoration(
                      color: ForestColor.forest100,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: ForestColor.forest300),
                    ),
                    child: Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.location_on, color: ForestColor.forest600, size: 32),
                          const SizedBox(height: 4),
                          Text(
                            'Lô: ${device['last_plot'] ?? '--'}',
                            style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  Widget _detailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          SizedBox(
            width: 140,
            child: Text(label, style: TextStyle(fontSize: 13, color: Colors.grey[600])),
          ),
          Expanded(
            child: Text(value, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500)),
          ),
        ],
      ),
    );
  }

  void _registerNewDevice() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Đăng ký thiết bị mới - Đang phát triển')),
    );
  }

  static List<Map<String, dynamic>> _getMockDevices() {
    return [
      {
        'id': 'device_001',
        'name': 'Kiểm lâm Nguyễn Văn A',
        'platform': 'Android',
        'os_version': 'Android 14',
        'app_version': '1.1.0',
        'status': 'online',
        'last_active': '5 phút trước',
        'battery': 78,
        'last_plot': 'BP-001',
      },
      {
        'id': 'device_002',
        'name': 'Kiểm lâm Trần Thị B',
        'platform': 'Android',
        'os_version': 'Android 13',
        'app_version': '1.1.0',
        'status': 'online',
        'last_active': '12 phút trước',
        'battery': 45,
        'last_plot': 'DN-003',
      },
      {
        'id': 'device_003',
        'name': 'Trưởng nhóm Lê Văn C',
        'platform': 'iOS',
        'os_version': 'iOS 17.3',
        'app_version': '1.1.0',
        'status': 'offline',
        'last_active': '2 giờ trước',
        'battery': 15,
        'last_plot': 'LD-002',
      },
      {
        'id': 'device_004',
        'name': 'Kiểm lâm Phạm Văn D',
        'platform': 'Android',
        'os_version': 'Android 14',
        'app_version': '1.0.9',
        'status': 'offline',
        'last_active': '1 ngày trước',
        'battery': 5,
        'last_plot': 'CM-001',
      },
    ];
  }
}
