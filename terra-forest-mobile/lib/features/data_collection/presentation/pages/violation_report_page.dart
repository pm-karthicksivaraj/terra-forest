import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:image_picker/image_picker.dart';
import 'dart:io';
import 'package:uuid/uuid.dart';
import '../../../../core/constants/app_constants.dart';
import '../../../../core/storage/local_database.dart';
import '../../../../core/theme/app_theme.dart';

/// Violation/Incident Report data collection form.
/// Allows rangers to report illegal activities offline.
/// Data is saved to SQLite and synced when online.
class ViolationReportPage extends StatefulWidget {
  const ViolationReportPage({super.key});

  @override
  State<ViolationReportPage> createState() => _ViolationReportPageState();
}

class _ViolationReportPageState extends State<ViolationReportPage> {
  final _formKey = GlobalKey<FormState>();
  final _descriptionController = TextEditingController();
  final _perpetratorController = TextEditingController();
  final _areaController = TextEditingController();

  String _violationType = 'illegal_logging';
  String _severity = 'high';
  Position? _currentPosition;
  bool _isSaving = false;
  bool _gpsLoading = true;
  final List<String> _photoPaths = [];

  static const Map<String, String> _violationTypes = {
    'illegal_logging': 'Khai thác gỗ trái phép',
    'illegal_land_clearing': 'Phá rừng làm đất',
    'wildlife_poaching': 'Săn bắt trái phép',
    'forest_fire_violation': 'Vi phạm phòng cháy',
    'illegal_encroachment': 'Xâm lấn đất rừng',
    'illegal_mining': 'Khai thác khoáng sản trái phép',
    'pollution': 'Xả thải gây ô nhiễm',
    'other': 'Khác',
  };

  @override
  void initState() {
    super.initState();
    _getCurrentLocation();
  }

  @override
  void dispose() {
    _descriptionController.dispose();
    _perpetratorController.dispose();
    _areaController.dispose();
    super.dispose();
  }

  Future<void> _getCurrentLocation() async {
    try {
      final permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        await Geolocator.requestPermission();
      }
      final position = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.high,
          timeLimit: Duration(seconds: 10),
        ),
      );
      if (mounted) {
        setState(() {
          _currentPosition = position;
          _gpsLoading = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _gpsLoading = false);
    }
  }

  Future<void> _takePhoto() async {
    try {
      final picker = ImagePicker();
      final XFile? photo = await picker.pickImage(
        source: ImageSource.camera,
        maxWidth: 1920,
        maxHeight: 1920,
        imageQuality: 85,
      );
      if (photo != null) {
        setState(() => _photoPaths.add(photo.path));
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Không thể chụp ảnh: $e')),
      );
    }
  }

  Future<void> _saveReport() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isSaving = true);

    try {
      final db = LocalDatabase.instance;
      final uuid = const Uuid();
      final now = DateTime.now();

      final description = 'BÁO CÁO VI PHẠM: ${_violationTypes[_violationType]}\n'
          'Mô tả: ${_descriptionController.text}\n'
          'Đối tượng: ${_perpetratorController.text.isNotEmpty ? _perpetratorController.text : "Không xác định"}\n'
          'Diện tích ảnh hưởng: ${_areaController.text.isNotEmpty ? "${_areaController.text} ha" : "Chưa xác định"}\n'
          'Mức độ: ${_severity == 'critical' ? 'Nghiêm trọng' : _severity == 'high' ? 'Cao' : _severity == 'medium' ? 'Trung bình' : 'Thấp'}\n'
          'Số ảnh: ${_photoPaths.length}';

      // Save as field observation
      final obsId = uuid.v4();
      await db.insertObservation({
        'id': obsId,
        'patrol_id': 'standalone',
        'obs_type': 'violation',
        'description': description,
        'photo_path': _photoPaths.isNotEmpty ? _photoPaths.first : null,
        'latitude': _currentPosition?.latitude ?? AppConstants.mapDefaultLatitude,
        'longitude': _currentPosition?.longitude ?? AppConstants.mapDefaultLongitude,
        'accuracy': _currentPosition?.accuracy ?? 0.0,
        'recorded_at': now.toIso8601String(),
        'sync_status': 'pending',
      });

      // Also create an alert for this violation
      await db.insertAlert({
        'id': uuid.v4(),
        'plot_id': null,
        'alert_type': AppConstants.alertDeforestation,
        'severity': _severity,
        'status': 'active',
        'message': 'Violation report',
        'message_vi': '${_violationTypes[_violationType]} - ${_descriptionController.text.substring(0, _descriptionController.text.length > 100 ? 100 : _descriptionController.text.length)}',
        'detected_at': now.toIso8601String(),
        'acknowledged_by': null,
        'acknowledged_at': null,
        'sync_status': 'pending',
      });

      // Add to sync queue
      await db.insertSyncQueueItem({
        'id': uuid.v4(),
        'entity_type': 'violation_report',
        'entity_id': obsId,
        'action': 'create',
        'payload_json': description,
        'attempts': 0,
        'max_attempts': 3,
        'last_error': null,
        'created_at': now.toIso8601String(),
        'next_retry_at': now.toIso8601String(),
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Báo cáo vi phạm đã được lưu ngoại tuyến! Sẽ đồng bộ khi có mạng.'),
            backgroundColor: Colors.green,
            duration: Duration(seconds: 3),
          ),
        );
        _formKey.currentState!.reset();
        _descriptionController.clear();
        _perpetratorController.clear();
        _areaController.clear();
        setState(() {
          _violationType = 'illegal_logging';
          _severity = 'high';
          _photoPaths.clear();
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Lỗi lưu báo cáo: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Báo cáo vi phạm'),
        backgroundColor: StatusColor.critical,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.history),
            onPressed: () => _showReportHistory(context),
            tooltip: 'Lịch sử báo cáo',
          ),
        ],
      ),
      body: Form(
        key: _formKey,
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // ── GPS Status ──────────────────────────────────────────────
              _buildGpsCard(),
              const SizedBox(height: 20),

              // ── Violation Type ──────────────────────────────────────────
              const Text(
                'Loại vi phạm *',
                style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 8),
              DropdownButtonFormField<String>(
                value: _violationType,
                decoration: const InputDecoration(
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(Icons.warning_amber),
                ),
                items: _violationTypes.entries.map((e) {
                  return DropdownMenuItem(value: e.key, child: Text(e.value));
                }).toList(),
                onChanged: (value) {
                  if (value != null) setState(() => _violationType = value);
                },
              ),
              const SizedBox(height: 16),

              // ── Severity ────────────────────────────────────────────────
              const Text(
                'Mức độ nghiêm trọng *',
                style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 8),
              SegmentedButton<String>(
                segments: const [
                  ButtonSegment(value: 'critical', label: Text('Nghiêm trọng', style: TextStyle(fontSize: 11)), icon: Icon(Icons.error, size: 16)),
                  ButtonSegment(value: 'high', label: Text('Cao', style: TextStyle(fontSize: 11)), icon: Icon(Icons.warning, size: 16)),
                  ButtonSegment(value: 'medium', label: Text('TBình', style: TextStyle(fontSize: 11))),
                  ButtonSegment(value: 'low', label: Text('Thấp', style: TextStyle(fontSize: 11))),
                ],
                selected: {_severity},
                onSelectionChanged: (selection) {
                  setState(() => _severity = selection.first);
                },
              ),
              const SizedBox(height: 16),

              // ── Description ─────────────────────────────────────────────
              TextFormField(
                controller: _descriptionController,
                maxLines: 4,
                decoration: const InputDecoration(
                  labelText: 'Mô tả chi tiết vi phạm *',
                  hintText: 'Mô tả chi tiết tình trạng, địa điểm, bằng chứng...',
                  prefixIcon: Icon(Icons.description),
                  border: OutlineInputBorder(),
                  alignLabelWithHint: true,
                ),
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return 'Vui lòng mô tả vi phạm';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),

              // ── Perpetrator info ────────────────────────────────────────
              TextFormField(
                controller: _perpetratorController,
                decoration: const InputDecoration(
                  labelText: 'Đối tượng vi phạm (nếu biết)',
                  hintText: 'Mô tả đối tượng, phương tiện...',
                  prefixIcon: Icon(Icons.person_search),
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 16),

              // ── Affected Area ───────────────────────────────────────────
              TextFormField(
                controller: _areaController,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(
                  labelText: 'Diện tích ảnh hưởng (ha)',
                  hintText: 'VD: 2.5',
                  prefixIcon: Icon(Icons.landscape),
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 16),

              // ── Photo Evidence ──────────────────────────────────────────
              Row(
                children: [
                  const Text(
                    'Bằng chứng ảnh',
                    style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
                  ),
                  const Spacer(),
                  FilledButton.tonalIcon(
                    onPressed: _takePhoto,
                    icon: const Icon(Icons.camera_alt, size: 18),
                    label: const Text('Chụp ảnh'),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              if (_photoPaths.isEmpty)
                Container(
                  height: 80,
                  decoration: BoxDecoration(
                    color: Colors.grey[100],
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: Colors.grey[300]!),
                  ),
                  child: Center(
                    child: Text('Chưa có ảnh', style: TextStyle(color: Colors.grey[500])),
                  ),
                )
              else
                SizedBox(
                  height: 80,
                  child: ListView.separated(
                    scrollDirection: Axis.horizontal,
                    itemCount: _photoPaths.length + 1,
                    separatorBuilder: (_, __) => const SizedBox(width: 8),
                    itemBuilder: (context, index) {
                      if (index == _photoPaths.length) {
                        return InkWell(
                          onTap: _takePhoto,
                          child: Container(
                            width: 80,
                            height: 80,
                            decoration: BoxDecoration(
                              color: Colors.grey[100],
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(color: Colors.grey[300]!, style: BorderStyle.solid),
                            ),
                            child: const Icon(Icons.add_a_photo, color: Colors.grey),
                          ),
                        );
                      }
                      return Stack(
                        children: [
                          ClipRRect(
                            borderRadius: BorderRadius.circular(8),
                            child: Image.file(
                              File(_photoPaths[index]),
                              width: 80,
                              height: 80,
                              fit: BoxFit.cover,
                              errorBuilder: (_, __, ___) => Container(
                                width: 80,
                                height: 80,
                                color: Colors.grey[200],
                                child: const Icon(Icons.broken_image),
                              ),
                            ),
                          ),
                          Positioned(
                            top: 2,
                            right: 2,
                            child: GestureDetector(
                              onTap: () {
                                setState(() => _photoPaths.removeAt(index));
                              },
                              child: Container(
                                decoration: const BoxDecoration(
                                  color: Colors.red,
                                  shape: BoxShape.circle,
                                ),
                                child: const Icon(Icons.close, size: 14, color: Colors.white),
                              ),
                            ),
                          ),
                        ],
                      );
                    },
                  ),
                ),
              const SizedBox(height: 24),

              // ── Save Button ─────────────────────────────────────────────
              SizedBox(
                width: double.infinity,
                height: 48,
                child: FilledButton.icon(
                  onPressed: _isSaving ? null : _saveReport,
                  style: FilledButton.styleFrom(
                    backgroundColor: StatusColor.critical,
                  ),
                  icon: _isSaving
                      ? const SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                        )
                      : const Icon(Icons.report),
                  label: Text(_isSaving ? 'Đang lưu...' : 'Gửi báo cáo vi phạm'),
                ),
              ),
              const SizedBox(height: 8),
              Center(
                child: Text(
                  'Báo cáo sẽ được lưu ngoại tuyến và đồng bộ khi có mạng',
                  style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                  textAlign: TextAlign.center,
                ),
              ),
              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildGpsCard() {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: StatusColor.criticalLight,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: StatusColor.critical.withOpacity(0.3)),
      ),
      child: Row(
        children: [
          if (_gpsLoading)
            const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2))
          else
            Icon(
              _currentPosition != null ? Icons.gps_fixed : Icons.gps_not_fixed,
              color: _currentPosition != null ? ForestColor.forest600 : Colors.orange,
              size: 20,
            ),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Vị trí GPS', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                Text(
                  _currentPosition != null
                      ? '${_currentPosition!.latitude.toStringAsFixed(6)}, ${_currentPosition!.longitude.toStringAsFixed(6)}'
                      : _gpsLoading ? 'Đang xác định...' : 'Không thể xác định',
                  style: TextStyle(
                    fontSize: 11,
                    color: _currentPosition != null ? ForestColor.forest600 : Colors.orange,
                  ),
                ),
              ],
            ),
          ),
          if (_currentPosition != null)
            const Icon(Icons.check_circle, color: StatusColor.low, size: 18),
        ],
      ),
    );
  }

  void _showReportHistory(BuildContext context) async {
    final db = LocalDatabase.instance;
    final reports = await db.getObservationsByType('violation');

    if (!mounted) return;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (ctx) {
        return DraggableScrollableSheet(
          initialChildSize: 0.6,
          minChildSize: 0.3,
          maxChildSize: 0.95,
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
                      decoration: BoxDecoration(color: Colors.grey[300], borderRadius: BorderRadius.circular(2)),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Lịch sử báo cáo vi phạm (${reports.length})',
                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(height: 12),
                  if (reports.isEmpty)
                    const Center(child: Padding(padding: EdgeInsets.all(32), child: Text('Chưa có báo cáo nào')))
                  else
                    ...reports.map((report) => Card(
                      margin: const EdgeInsets.only(bottom: 8),
                      child: ListTile(
                        leading: const Icon(Icons.warning_amber, color: StatusColor.critical),
                        title: Text(report['description'] ?? '', maxLines: 2, overflow: TextOverflow.ellipsis),
                        subtitle: Text(
                          '${report['recorded_at'] ?? ''} • ${report['sync_status'] == 'pending' ? 'Chờ đồng bộ' : 'Đã đồng bộ'}',
                          style: TextStyle(fontSize: 11, color: Colors.grey[600]),
                        ),
                        trailing: report['sync_status'] == 'pending'
                            ? const Icon(Icons.cloud_off, color: Colors.orange, size: 20)
                            : const Icon(Icons.cloud_done, color: Colors.green, size: 20),
                      ),
                    )),
                ],
              ),
            );
          },
        );
      },
    );
  }
}
