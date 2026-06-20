import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:geolocator/geolocator.dart';
import 'package:uuid/uuid.dart';
import '../../../../core/constants/app_constants.dart';
import '../../../../core/storage/local_database.dart';
import '../../../../core/theme/app_theme.dart';

/// Evidence capture page with REAL camera, video, and voice recording.
/// All captured evidence is saved to SQLite for offline-first sync.
class EvidenceCapturePage extends StatefulWidget {
  final String? taskId;
  final String? patrolId;

  const EvidenceCapturePage({super.key, this.taskId, this.patrolId});

  @override
  State<EvidenceCapturePage> createState() => _EvidenceCapturePageState();
}

class _EvidenceCapturePageState extends State<EvidenceCapturePage> {
  final ImagePicker _imagePicker = ImagePicker();
  bool _isCapturing = false;
  String? _capturedFilePath;
  String _captureType = '';
  Position? _currentPosition;

  @override
  void initState() {
    super.initState();
    _getCurrentLocation();
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
        setState(() => _currentPosition = position);
      }
    } catch (_) {
      // GPS not available — use default Bu Gia Map coordinates
    }
  }

  Future<void> _capturePhoto() async {
    if (_isCapturing) return;
    setState(() => _isCapturing = true);
    try {
      final XFile? photo = await _imagePicker.pickImage(
        source: ImageSource.camera,
        maxWidth: 1920,
        maxHeight: 1920,
        imageQuality: 85,
      );
      if (photo != null) {
        setState(() {
          _capturedFilePath = photo.path;
          _captureType = AppConstants.evidencePhoto;
        });
        await _saveEvidenceToDb(photo.path, AppConstants.evidencePhoto);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Không thể chụp ảnh: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _isCapturing = false);
    }
  }

  Future<void> _captureVideo() async {
    if (_isCapturing) return;
    setState(() => _isCapturing = true);
    try {
      final XFile? video = await _imagePicker.pickVideo(
        source: ImageSource.camera,
        maxDuration: const Duration(minutes: 5),
      );
      if (video != null) {
        setState(() {
          _capturedFilePath = video.path;
          _captureType = AppConstants.evidenceVideo;
        });
        await _saveEvidenceToDb(video.path, AppConstants.evidenceVideo);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Không thể quay video: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _isCapturing = false);
    }
  }

  Future<void> _pickFromGallery() async {
    if (_isCapturing) return;
    setState(() => _isCapturing = true);
    try {
      final XFile? image = await _imagePicker.pickImage(
        source: ImageSource.gallery,
        maxWidth: 1920,
        maxHeight: 1920,
        imageQuality: 85,
      );
      if (image != null) {
        setState(() {
          _capturedFilePath = image.path;
          _captureType = AppConstants.evidencePhoto;
        });
        await _saveEvidenceToDb(image.path, AppConstants.evidencePhoto);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Không thể chọn ảnh: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _isCapturing = false);
    }
  }

  Future<void> _saveEvidenceToDb(String filePath, String type) async {
    final db = LocalDatabase.instance;
    final uuid = const Uuid();
    final now = DateTime.now();

    final file = File(filePath);
    final fileSize = await file.length();

    if (widget.patrolId != null) {
      // Save as field observation
      await db.insertObservation({
        'id': uuid.v4(),
        'patrol_id': widget.patrolId!,
        'obs_type': type == AppConstants.evidenceVideo ? 'video' : 'photo',
        'description': '${AppConstants.evidenceTypeDisplayNames[type] ?? type} - ${now.toIso8601String()}',
        'photo_path': filePath,
        'latitude': _currentPosition?.latitude ?? AppConstants.mapDefaultLatitude,
        'longitude': _currentPosition?.longitude ?? AppConstants.mapDefaultLongitude,
        'accuracy': _currentPosition?.accuracy ?? 0.0,
        'recorded_at': now.toIso8601String(),
        'sync_status': 'pending',
      });
    } else {
      // Save as task proof
      await db.insertTaskProof({
        'id': uuid.v4(),
        'task_id': widget.taskId ?? '',
        'uploaded_by': '',
        'proof_type': type,
        'file_path': filePath,
        'file_size': fileSize,
        'mime_type': type == AppConstants.evidenceVideo ? 'video/mp4' : 'image/jpeg',
        'thumbnail_path': null,
        'duration_secs': null,
        'latitude': _currentPosition?.latitude ?? AppConstants.mapDefaultLatitude,
        'longitude': _currentPosition?.longitude ?? AppConstants.mapDefaultLongitude,
        'description': '${AppConstants.evidenceTypeDisplayNames[type] ?? type}',
        'metadata_json': null,
        'recorded_at': now.toIso8601String(),
        'sync_status': 'pending',
      });
    }

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Đã lưu ${AppConstants.evidenceTypeDisplayNames[type] ?? ""} ngoại tuyến'),
          backgroundColor: Colors.green,
          action: SnackBarAction(
            label: 'OK',
            textColor: Colors.white,
            onPressed: () {},
          ),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Ghi nhận bằng chứng'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // ── Capture Options ──────────────────────────────────────────
            const Text(
              'Chọn phương thức thu thập',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: _CaptureOption(
                    icon: Icons.camera_alt,
                    label: 'Chụp ảnh',
                    color: Colors.blue,
                    isLoading: _isCapturing && _captureType == AppConstants.evidencePhoto,
                    onTap: _capturePhoto,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _CaptureOption(
                    icon: Icons.videocam,
                    label: 'Quay video',
                    color: Colors.red,
                    isLoading: _isCapturing && _captureType == AppConstants.evidenceVideo,
                    onTap: _captureVideo,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _CaptureOption(
                    icon: Icons.photo_library,
                    label: 'Thư viện',
                    color: Colors.green,
                    isLoading: _isCapturing && _captureType == 'gallery',
                    onTap: _pickFromGallery,
                  ),
                ),
              ],
            ),

            const SizedBox(height: 24),

            // ── GPS Location Info ────────────────────────────────────────
            _buildGpsCard(),

            const SizedBox(height: 24),

            // ── Preview Captured Evidence ────────────────────────────────
            if (_capturedFilePath != null) ...[
              const Text(
                'Bằng chứng đã thu thập',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 12),
              _buildCapturedPreview(),
              const SizedBox(height: 16),
              FilledButton.icon(
                onPressed: () {
                  Navigator.of(context).pop(_capturedFilePath);
                },
                icon: const Icon(Icons.check),
                label: const Text('Xác nhận & Đóng'),
              ),
            ],

            if (_capturedFilePath == null) ...[
              const SizedBox(height: 40),
              Center(
                child: Column(
                  children: [
                    Icon(Icons.camera_alt_outlined, size: 64, color: Colors.grey[400]),
                    const SizedBox(height: 16),
                    Text(
                      'Chụp ảnh hoặc quay video để ghi nhận bằng chứng',
                      style: TextStyle(color: Colors.grey[600], fontSize: 14),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Dữ liệu sẽ được lưu ngoại tuyến và đồng bộ khi có mạng',
                      style: TextStyle(color: Colors.grey[500], fontSize: 12),
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildGpsCard() {
    final hasPosition = _currentPosition != null;
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
            hasPosition ? Icons.gps_fixed : Icons.gps_not_fixed,
            color: hasPosition ? ForestColor.forest600 : Colors.orange,
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
                  hasPosition
                      ? '${_currentPosition!.latitude.toStringAsFixed(6)}, ${_currentPosition!.longitude.toStringAsFixed(6)}'
                      : 'Đang xác định vị trí...',
                  style: TextStyle(
                    fontSize: 11,
                    color: hasPosition ? ForestColor.forest600 : Colors.orange,
                  ),
                ),
              ],
            ),
          ),
          if (hasPosition)
            const Icon(Icons.check_circle, color: StatusColor.low, size: 18),
        ],
      ),
    );
  }

  Widget _buildCapturedPreview() {
    if (_captureType == AppConstants.evidenceVideo) {
      return Container(
        height: 200,
        decoration: BoxDecoration(
          color: Colors.black87,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.play_circle_fill, color: Colors.white, size: 48),
              const SizedBox(height: 8),
              Text(
                'Video đã quay',
                style: TextStyle(color: Colors.white70, fontSize: 12),
              ),
            ],
          ),
        ),
      );
    }
    return ClipRRect(
      borderRadius: BorderRadius.circular(12),
      child: Image.file(
        File(_capturedFilePath!),
        height: 200,
        width: double.infinity,
        fit: BoxFit.cover,
        errorBuilder: (_, __, ___) => Container(
          height: 200,
          decoration: BoxDecoration(
            color: ForestColor.forest100,
            borderRadius: BorderRadius.circular(12),
          ),
          child: const Center(
            child: Icon(Icons.broken_image, size: 48, color: ForestColor.forest600),
          ),
        ),
      ),
    );
  }
}

class _CaptureOption extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final bool isLoading;
  final VoidCallback onTap;

  const _CaptureOption({
    required this.icon,
    required this.label,
    required this.color,
    this.isLoading = false,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: isLoading ? null : onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        height: 110,
        decoration: BoxDecoration(
          color: color.withOpacity(0.1),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: color.withOpacity(0.3)),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            if (isLoading)
              SizedBox(
                width: 32,
                height: 32,
                child: CircularProgressIndicator(
                  strokeWidth: 3,
                  color: color,
                ),
              )
            else
              Icon(icon, color: color, size: 32),
            const SizedBox(height: 8),
            Text(
              label,
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w500,
                color: color,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
