import 'dart:io';
import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:image_picker/image_picker.dart';
import 'package:uuid/uuid.dart';
import '../../../../core/constants/app_constants.dart';
import '../../../../core/storage/local_database.dart';
import '../../../../core/theme/app_theme.dart';
import '../bloc/evidence_bloc.dart';
import '../widgets/evidence_widgets.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class EvidenceUploadPage extends StatefulWidget {
  final String taskId;

  const EvidenceUploadPage({super.key, required this.taskId});

  @override
  State<EvidenceUploadPage> createState() => _EvidenceUploadPageState();
}

class _EvidenceUploadPageState extends State<EvidenceUploadPage> {
  String _selectedType = AppConstants.evidencePhoto;
  final _descriptionController = TextEditingController();
  bool _isUploading = false;
  double? _capturedLat;
  double? _capturedLng;
  String? _capturedFilePath;

  @override
  void initState() {
    super.initState();
    _getCurrentLocation();
  }

  @override
  void dispose() {
    _descriptionController.dispose();
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
          _capturedLat = position.latitude;
          _capturedLng = position.longitude;
        });
      }
    } catch (_) {
      // Use default Bu Gia Map coordinates if GPS unavailable
      if (mounted) {
        setState(() {
          _capturedLat = AppConstants.mapDefaultLatitude;
          _capturedLng = AppConstants.mapDefaultLongitude;
        });
      }
    }
  }

  Future<void> _captureMedia() async {
    try {
      final picker = ImagePicker();
      if (_selectedType == AppConstants.evidencePhoto) {
        final XFile? photo = await picker.pickImage(
          source: ImageSource.camera,
          maxWidth: 1920,
          maxHeight: 1920,
          imageQuality: 85,
        );
        if (photo != null) {
          setState(() => _capturedFilePath = photo.path);
        }
      } else if (_selectedType == AppConstants.evidenceVideo) {
        final XFile? video = await picker.pickVideo(
          source: ImageSource.camera,
          maxDuration: const Duration(minutes: 5),
        );
        if (video != null) {
          setState(() => _capturedFilePath = video.path);
        }
      } else if (_selectedType == AppConstants.evidenceVoiceNote) {
        // Voice recording - save placeholder for now
        // Full record package can be added later
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Ghi âm sẽ khả dụng trong phiên bản tới')),
        );
      } else {
        // Document - pick from gallery
        final XFile? doc = await picker.pickImage(
          source: ImageSource.gallery,
        );
        if (doc != null) {
          setState(() => _capturedFilePath = doc.path);
        }
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Không thể thu thập: $e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Tải lên bằng chứng'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Chọn loại bằng chứng',
              style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 12),
            EvidenceTypeSelector(
              selectedType: _selectedType,
              onTypeSelected: (type) {
                setState(() => _selectedType = type);
              },
            ),
            const SizedBox(height: 20),
            _buildPreview(),
            const SizedBox(height: 20),
            const Text(
              'Mô tả',
              style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: _descriptionController,
              maxLines: 3,
              decoration: const InputDecoration(
                hintText: 'Nhập mô tả về bằng chứng...',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 16),
            _buildGpsTag(),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              height: 48,
              child: ElevatedButton.icon(
                onPressed: _isUploading ? null : _handleUpload,
                icon: _isUploading
                    ? const SizedBox(
                        width: 18,
                        height: 18,
                        child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                      )
                    : const Icon(Icons.cloud_upload),
                label: Text(_isUploading ? 'Đang lưu...' : 'Lưu & Tải lên'),
              ),
            ),
            const SizedBox(height: 8),
            SizedBox(
              width: double.infinity,
              height: 48,
              child: OutlinedButton.icon(
                onPressed: _isUploading ? null : _handleSaveOffline,
                icon: const Icon(Icons.save),
                label: const Text('Lưu ngoại tuyến'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPreview() {
    if (_capturedFilePath != null) {
      final isVideo = _selectedType == AppConstants.evidenceVideo;
      return Container(
        height: 200,
        width: double.infinity,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: ForestColor.forest300),
        ),
        child: isVideo
            ? Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.play_circle_fill, size: 48, color: ForestColor.forest600),
                    const SizedBox(height: 8),
                    Text('Video đã quay', style: TextStyle(color: Colors.grey[600])),
                  ],
                ),
              )
            : ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: Image.file(
                  File(_capturedFilePath!),
                  height: 200,
                  width: double.infinity,
                  fit: BoxFit.cover,
                  errorBuilder: (_, __, ___) => Center(
                    child: Icon(Icons.broken_image, size: 48, color: Colors.grey[400]),
                  ),
                ),
              ),
      );
    }

    return Container(
      height: 200,
      width: double.infinity,
      decoration: BoxDecoration(
        color: ForestColor.forest100,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: ForestColor.forest300),
      ),
      child: InkWell(
        onTap: _captureMedia,
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                _getTypeIcon(),
                size: 48,
                color: ForestColor.forest600,
              ),
              const SizedBox(height: 8),
              Text(
                'Nhấn để ${_captureLabel()}',
                style: TextStyle(fontSize: 13, color: Colors.grey[600]),
              ),
            ],
          ),
        ),
      ),
    );
  }

  IconData _getTypeIcon() {
    switch (_selectedType) {
      case 'photo':
        return Icons.camera_alt;
      case 'video':
        return Icons.videocam;
      case 'voice_note':
        return Icons.mic;
      case 'document':
        return Icons.description;
      case 'gps_track':
        return Icons.route;
      default:
        return Icons.add_a_photo;
    }
  }

  String _captureLabel() {
    switch (_selectedType) {
      case 'photo':
        return 'chụp ảnh';
      case 'video':
        return 'quay video';
      case 'voice_note':
        return 'ghi âm';
      case 'document':
        return 'chọn tài liệu';
      case 'gps_track':
        return 'bắt đầu ghi đường';
      default:
        return 'thu thập';
    }
  }

  Widget _buildGpsTag() {
    final hasGps = _capturedLat != null && _capturedLng != null;
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: ForestColor.forest100.withOpacity(0.5),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: ForestColor.forest300),
      ),
      child: Row(
        children: [
          Icon(
            hasGps ? Icons.gps_fixed : Icons.gps_not_fixed,
            color: hasGps ? ForestColor.forest600 : Colors.orange,
            size: 20,
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Vị trí GPS tự động',
                  style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
                ),
                Text(
                  hasGps
                      ? '${_capturedLat!.toStringAsFixed(6)}, ${_capturedLng!.toStringAsFixed(6)}'
                      : 'Đang xác định vị trí...',
                  style: TextStyle(
                    fontSize: 11,
                    color: hasGps ? ForestColor.forest600 : Colors.orange,
                  ),
                ),
              ],
            ),
          ),
          if (hasGps)
            const Icon(Icons.check_circle, color: StatusColor.low, size: 18),
        ],
      ),
    );
  }

  Future<void> _handleUpload() async {
    if (_capturedFilePath == null) {
      // Try to capture first
      await _captureMedia();
      if (_capturedFilePath == null) return;
    }

    setState(() => _isUploading = true);
    try {
      final file = File(_capturedFilePath!);
      final fileSize = await file.length();
      final db = LocalDatabase.instance;
      final uuid = const Uuid();
      final now = DateTime.now();

      await db.insertTaskProof({
        'id': uuid.v4(),
        'task_id': widget.taskId,
        'uploaded_by': '',
        'proof_type': _selectedType,
        'file_path': _capturedFilePath!,
        'file_size': fileSize,
        'mime_type': _selectedType == AppConstants.evidenceVideo ? 'video/mp4' : 'image/jpeg',
        'thumbnail_path': null,
        'duration_secs': null,
        'latitude': _capturedLat ?? AppConstants.mapDefaultLatitude,
        'longitude': _capturedLng ?? AppConstants.mapDefaultLongitude,
        'description': _descriptionController.text.trim(),
        'metadata_json': null,
        'recorded_at': now.toIso8601String(),
        'sync_status': 'pending',
      });

      EvidenceEvent event;
      switch (_selectedType) {
        case 'video':
          event = RecordVideo(taskId: widget.taskId);
          break;
        case 'voice_note':
          event = RecordVoice(taskId: widget.taskId);
          break;
        default:
          event = CapturePhoto(taskId: widget.taskId);
      }
      context.read<EvidenceBloc>().add(event);

      if (mounted) {
        setState(() => _isUploading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Bằng chứng đã được tải lên'),
            backgroundColor: Colors.green,
          ),
        );
        Navigator.of(context).pop();
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isUploading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Lỗi: $e')),
        );
      }
    }
  }

  Future<void> _handleSaveOffline() async {
    if (_capturedFilePath == null) {
      await _captureMedia();
      if (_capturedFilePath == null) return;
    }

    try {
      final file = File(_capturedFilePath!);
      final fileSize = await file.length();
      final db = LocalDatabase.instance;
      final uuid = const Uuid();
      final now = DateTime.now();

      await db.insertTaskProof({
        'id': uuid.v4(),
        'task_id': widget.taskId,
        'uploaded_by': '',
        'proof_type': _selectedType,
        'file_path': _capturedFilePath!,
        'file_size': fileSize,
        'mime_type': _selectedType == AppConstants.evidenceVideo ? 'video/mp4' : 'image/jpeg',
        'thumbnail_path': null,
        'duration_secs': null,
        'latitude': _capturedLat ?? AppConstants.mapDefaultLatitude,
        'longitude': _capturedLng ?? AppConstants.mapDefaultLongitude,
        'description': _descriptionController.text.trim(),
        'metadata_json': null,
        'recorded_at': now.toIso8601String(),
        'sync_status': 'pending',
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Bằng chứng đã được lưu ngoại tuyến'),
            backgroundColor: Colors.green,
          ),
        );
        Navigator.of(context).pop();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Lỗi lưu ngoại tuyến: $e')),
        );
      }
    }
  }
}
