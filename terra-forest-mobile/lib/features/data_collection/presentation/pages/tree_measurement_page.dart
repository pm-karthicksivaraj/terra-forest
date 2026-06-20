import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:uuid/uuid.dart';
import '../../../../core/constants/app_constants.dart';
import '../../../../core/storage/local_database.dart';
import '../../../../core/theme/app_theme.dart';

/// Tree Measurement data collection form.
/// Allows field officers to record tree measurements offline.
/// Data is saved to SQLite and synced when online.
class TreeMeasurementPage extends StatefulWidget {
  const TreeMeasurementPage({super.key});

  @override
  State<TreeMeasurementPage> createState() => _TreeMeasurementPageState();
}

class _TreeMeasurementPageState extends State<TreeMeasurementPage> {
  final _formKey = GlobalKey<FormState>();
  final _speciesController = TextEditingController();
  final _dbhController = TextEditingController();
  final _heightController = TextEditingController();
  final _crownController = TextEditingController();
  final _notesController = TextEditingController();

  String _forestType = AppConstants.forestNatural;
  String _healthStatus = 'healthy';
  Position? _currentPosition;
  bool _isSaving = false;
  bool _gpsLoading = true;

  @override
  void initState() {
    super.initState();
    _getCurrentLocation();
  }

  @override
  void dispose() {
    _speciesController.dispose();
    _dbhController.dispose();
    _heightController.dispose();
    _crownController.dispose();
    _notesController.dispose();
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
      if (mounted) {
        setState(() => _gpsLoading = false);
      }
    }
  }

  Future<void> _saveMeasurement() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isSaving = true);

    try {
      final db = LocalDatabase.instance;
      final uuid = const Uuid();
      final now = DateTime.now();

      final description = 'Đo kính cây: ${_speciesController.text}, '
          'DBH=${_dbhController.text}cm, '
          'H=${_heightController.text}m, '
          'Tán=${_crownController.text}m, '
          'Loại rừng=${AppConstants.forestTypeDisplayNames[_forestType]}, '
          'Sức khỏe=$_healthStatus';

      await db.insertObservation({
        'id': uuid.v4(),
        'patrol_id': 'standalone',
        'obs_type': 'tree_measurement',
        'description': description,
        'photo_path': null,
        'latitude': _currentPosition?.latitude ?? AppConstants.mapDefaultLatitude,
        'longitude': _currentPosition?.longitude ?? AppConstants.mapDefaultLongitude,
        'accuracy': _currentPosition?.accuracy ?? 0.0,
        'recorded_at': now.toIso8601String(),
        'sync_status': 'pending',
      });

      // Also add to sync queue
      await db.insertSyncQueueItem({
        'id': uuid.v4(),
        'entity_type': 'tree_measurement',
        'entity_id': uuid.v4(),
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
            content: Text('Đã lưu số liệu cây ngoại tuyến! Dữ liệu sẽ đồng bộ khi có mạng.'),
            backgroundColor: Colors.green,
            duration: Duration(seconds: 3),
          ),
        );
        _formKey.currentState!.reset();
        _speciesController.clear();
        _dbhController.clear();
        _heightController.clear();
        _crownController.clear();
        _notesController.clear();
        setState(() {
          _forestType = AppConstants.forestNatural;
          _healthStatus = 'healthy';
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Lỗi lưu dữ liệu: $e')),
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
        title: const Text('Đo kính cây'),
        actions: [
          IconButton(
            icon: const Icon(Icons.history),
            onPressed: () {
              _showMeasurementHistory(context);
            },
            tooltip: 'Lịch sử đo',
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
              // ── GPS Status Card ──────────────────────────────────────────
              _buildGpsCard(),
              const SizedBox(height: 20),

              // ── Species Name ─────────────────────────────────────────────
              TextFormField(
                controller: _speciesController,
                decoration: const InputDecoration(
                  labelText: 'Tên loài cây *',
                  hintText: 'VD: Giáng hương, Sao đen, Trầm hương...',
                  prefixIcon: Icon(Icons.nature),
                  border: OutlineInputBorder(),
                ),
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return 'Vui lòng nhập tên loài cây';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),

              // ── DBH and Height ───────────────────────────────────────────
              Row(
                children: [
                  Expanded(
                    child: TextFormField(
                      controller: _dbhController,
                      keyboardType: TextInputType.number,
                      decoration: const InputDecoration(
                        labelText: 'Đường kính (DBH) cm *',
                        hintText: 'VD: 45',
                        prefixIcon: Icon(Icons.straighten),
                        border: OutlineInputBorder(),
                      ),
                      validator: (value) {
                        if (value == null || value.trim().isEmpty) {
                          return 'Bắt buộc';
                        }
                        final num = double.tryParse(value);
                        if (num == null || num <= 0) return 'Số không hợp lệ';
                        return null;
                      },
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: TextFormField(
                      controller: _heightController,
                      keyboardType: TextInputType.number,
                      decoration: const InputDecoration(
                        labelText: 'Chiều cao (m) *',
                        hintText: 'VD: 22',
                        prefixIcon: Icon(Icons.height),
                        border: OutlineInputBorder(),
                      ),
                      validator: (value) {
                        if (value == null || value.trim().isEmpty) {
                          return 'Bắt buộc';
                        }
                        final num = double.tryParse(value);
                        if (num == null || num <= 0) return 'Số không hợp lệ';
                        return null;
                      },
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // ── Crown Diameter ───────────────────────────────────────────
              TextFormField(
                controller: _crownController,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(
                  labelText: 'Đường kính tán (m)',
                  hintText: 'VD: 8',
                  prefixIcon: Icon(Icons.circle_outlined),
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 16),

              // ── Forest Type ──────────────────────────────────────────────
              const Text(
                'Loại rừng',
                style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 8),
              SegmentedButton<String>(
                segments: AppConstants.forestTypes.map((type) {
                  return ButtonSegment<String>(
                    value: type,
                    label: Text(
                      AppConstants.forestTypeDisplayNames[type] ?? type,
                      style: const TextStyle(fontSize: 11),
                    ),
                  );
                }).toList(),
                selected: {_forestType},
                onSelectionChanged: (selection) {
                  setState(() => _forestType = selection.first);
                },
              ),
              const SizedBox(height: 16),

              // ── Health Status ────────────────────────────────────────────
              const Text(
                'Tình trạng sức khỏe',
                style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 8),
              DropdownButtonFormField<String>(
                value: _healthStatus,
                decoration: const InputDecoration(
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(Icons.local_hospital_outlined),
                ),
                items: const [
                  DropdownMenuItem(value: 'healthy', child: Text('Khỏe mạnh')),
                  DropdownMenuItem(value: 'stressed', child: Text('Bị stress')),
                  DropdownMenuItem(value: 'diseased', child: Text('Bệnh')),
                  DropdownMenuItem(value: 'dead', child: Text('Đã chết')),
                  DropdownMenuItem(value: 'damaged', child: Text('Bị tổn thương')),
                ],
                onChanged: (value) {
                  if (value != null) setState(() => _healthStatus = value);
                },
              ),
              const SizedBox(height: 16),

              // ── Notes ────────────────────────────────────────────────────
              TextFormField(
                controller: _notesController,
                maxLines: 3,
                decoration: const InputDecoration(
                  labelText: 'Ghi chú thêm',
                  hintText: 'Mô tả thêm về cây, môi trường xung quanh...',
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 24),

              // ── Save Button ──────────────────────────────────────────────
              SizedBox(
                width: double.infinity,
                height: 48,
                child: FilledButton.icon(
                  onPressed: _isSaving ? null : _saveMeasurement,
                  icon: _isSaving
                      ? const SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                        )
                      : const Icon(Icons.save),
                  label: Text(_isSaving ? 'Đang lưu...' : 'Lưu số liệu'),
                ),
              ),
              const SizedBox(height: 8),
              Center(
                child: Text(
                  'Dữ liệu sẽ được lưu ngoại tuyến và đồng bộ khi có mạng',
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
        color: ForestColor.forest100.withOpacity(0.5),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: ForestColor.forest300),
      ),
      child: Row(
        children: [
          if (_gpsLoading)
            const SizedBox(
              width: 20,
              height: 20,
              child: CircularProgressIndicator(strokeWidth: 2),
            )
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
                const Text(
                  'Vị trí GPS',
                  style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
                ),
                Text(
                  _currentPosition != null
                      ? '${_currentPosition!.latitude.toStringAsFixed(6)}, ${_currentPosition!.longitude.toStringAsFixed(6)}'
                      : _gpsLoading
                          ? 'Đang xác định...'
                          : 'Không thể xác định vị trí',
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

  void _showMeasurementHistory(BuildContext context) async {
    final db = LocalDatabase.instance;
    final observations = await db.getObservationsByType('tree_measurement');

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
                      decoration: BoxDecoration(
                        color: Colors.grey[300],
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Lịch sử đo kính cây (${observations.length})',
                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(height: 12),
                  if (observations.isEmpty)
                    const Center(
                      child: Padding(
                        padding: EdgeInsets.all(32),
                        child: Text('Chưa có số liệu đo nào'),
                      ),
                    )
                  else
                    ...observations.map((obs) => Card(
                      margin: const EdgeInsets.only(bottom: 8),
                      child: ListTile(
                        leading: const Icon(Icons.nature, color: ForestColor.forest600),
                        title: Text(obs['description'] ?? '', maxLines: 2, overflow: TextOverflow.ellipsis),
                        subtitle: Text(
                          '${obs['recorded_at'] ?? ''} • ${obs['sync_status'] == 'pending' ? 'Chờ đồng bộ' : 'Đã đồng bộ'}',
                          style: TextStyle(fontSize: 11, color: Colors.grey[600]),
                        ),
                        trailing: obs['sync_status'] == 'pending'
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
