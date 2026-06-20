import 'package:flutter/material.dart';
import '../../../../core/constants/app_constants.dart';
import '../../../../core/theme/app_theme.dart';
import '../../domain/entities/evidence.dart';

class EvidenceThumbnail extends StatelessWidget {
  final Evidence evidence;
  final VoidCallback onTap;
  final VoidCallback? onDelete;

  const EvidenceThumbnail({
    super.key,
    required this.evidence,
    required this.onTap,
    this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    final typeColor = _typeColor(evidence.proofType);
    final typeName = AppConstants.evidenceTypeDisplayNames[evidence.proofType] ?? evidence.proofType;
    final isSynced = evidence.syncStatus == 'synced';

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
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: typeColor.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Center(
                child: _buildThumbnailContent(typeColor),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text(
                        typeName,
                        style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
                      ),
                      const Spacer(),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: isSynced ? StatusColor.low.withOpacity(0.15) : StatusColor.medium.withOpacity(0.15),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          isSynced ? 'Đã đồng bộ' : 'Chờ tải lên',
                          style: TextStyle(
                            fontSize: 9,
                            fontWeight: FontWeight.w700,
                            color: isSynced ? StatusColor.low : StatusColor.medium,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  if (evidence.description != null && evidence.description!.isNotEmpty)
                    Text(
                      evidence.description!,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(fontSize: 12),
                    ),
                  const SizedBox(height: 2),
                  Row(
                    children: [
                      Text(
                        evidence.fileSizeFormatted,
                        style: TextStyle(fontSize: 11, color: Colors.grey[600]),
                      ),
                      if (evidence.durationSecs != null) ...[
                        const SizedBox(width: 8),
                        Icon(Icons.timer, size: 12, color: Colors.grey[600]),
                        const SizedBox(width: 2),
                        Text(
                          _formatDuration(evidence.durationSecs!),
                          style: TextStyle(fontSize: 11, color: Colors.grey[600]),
                        ),
                      ],
                      const Spacer(),
                      Text(
                        _timeAgo(evidence.recordedAt),
                        style: TextStyle(fontSize: 11, color: Colors.grey[600]),
                      ),
                    ],
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

  Widget _buildThumbnailContent(Color typeColor) {
    switch (evidence.proofType) {
      case 'photo':
        return Icon(Icons.image, color: typeColor, size: 24);
      case 'video':
        return Stack(
          alignment: Alignment.center,
          children: [
            Icon(Icons.play_circle_filled, color: typeColor, size: 28),
          ],
        );
      case 'voice_note':
        return Icon(Icons.graphic_eq, color: typeColor, size: 24);
      case 'document':
        return Icon(Icons.description, color: typeColor, size: 24);
      case 'gps_track':
        return Icon(Icons.route, color: typeColor, size: 24);
      default:
        return Icon(Icons.insert_drive_file, color: typeColor, size: 24);
    }
  }

  Color _typeColor(String type) {
    switch (type) {
      case 'photo':
        return const Color(0xFF0284C7);
      case 'video':
        return StatusColor.critical;
      case 'voice_note':
        return StatusColor.medium;
      case 'document':
        return ForestColor.forest600;
      case 'gps_track':
        return const Color(0xFF7C3AED);
      default:
        return ForestColor.forest600;
    }
  }

  String _formatDuration(int secs) {
    final m = secs ~/ 60;
    final s = secs % 60;
    return '${m.toString().padLeft(2, '0')}:${s.toString().padLeft(2, '0')}';
  }

  String _timeAgo(DateTime dt) {
    final diff = DateTime.now().difference(dt);
    if (diff.inMinutes < 1) return 'Vừa xong';
    if (diff.inMinutes < 60) return '${diff.inMinutes} phút trước';
    if (diff.inHours < 24) return '${diff.inHours} giờ trước';
    return '${diff.inDays} ngày trước';
  }
}

class EvidencePlayer extends StatelessWidget {
  final Evidence evidence;
  final VoidCallback onPlay;
  final VoidCallback onPause;
  final bool isPlaying;

  const EvidencePlayer({
    super.key,
    required this.evidence,
    required this.onPlay,
    required this.onPause,
    this.isPlaying = false,
  });

  @override
  Widget build(BuildContext context) {
    final isVideo = evidence.proofType == AppConstants.evidenceVideo;
    final isAudio = evidence.proofType == AppConstants.evidenceVoiceNote;

    if (!isVideo && !isAudio) {
      return const SizedBox.shrink();
    }

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: Theme.of(context).dividerColor),
      ),
      child: Row(
        children: [
          IconButton(
            icon: Icon(isPlaying ? Icons.pause_circle : Icons.play_circle_filled),
            iconSize: 36,
            color: Theme.of(context).colorScheme.primary,
            onPressed: isPlaying ? onPause : onPlay,
          ),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(4),
                  child: LinearProgressIndicator(
                    value: 0.3,
                    backgroundColor: Theme.of(context).dividerColor,
                  ),
                ),
                const SizedBox(height: 4),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      '0:15',
                      style: TextStyle(fontSize: 11, color: Colors.grey[600]),
                    ),
                    Text(
                      evidence.durationSecs != null
                          ? _formatDuration(evidence.durationSecs!)
                          : '--:--',
                      style: TextStyle(fontSize: 11, color: Colors.grey[600]),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  String _formatDuration(int secs) {
    final m = secs ~/ 60;
    final s = secs % 60;
    return '${m.toString().padLeft(2, '0')}:${s.toString().padLeft(2, '0')}';
  }
}

class UploadProgressCard extends StatelessWidget {
  final String fileName;
  final double progress;
  final String status;
  final VoidCallback? onRetry;

  const UploadProgressCard({
    super.key,
    required this.fileName,
    required this.progress,
    required this.status,
    this.onRetry,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      margin: const EdgeInsets.only(bottom: 8),
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
              Expanded(
                child: Text(
                  fileName,
                  style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              Text(
                status,
                style: TextStyle(
                  fontSize: 11,
                  color: progress >= 1.0 ? StatusColor.low : StatusColor.medium,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: progress,
              backgroundColor: Theme.of(context).dividerColor,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            '${(progress * 100).toStringAsFixed(0)}%',
            style: TextStyle(fontSize: 11, color: Colors.grey[600]),
          ),
          if (progress < 1.0 && onRetry != null)
            Align(
              alignment: Alignment.centerRight,
              child: TextButton(
                onPressed: onRetry,
                child: const Text('Thử lại', style: TextStyle(fontSize: 12)),
              ),
            ),
        ],
      ),
    );
  }
}

class EvidenceTypeSelector extends StatelessWidget {
  final String selectedType;
  final ValueChanged<String> onTypeSelected;

  const EvidenceTypeSelector({
    super.key,
    required this.selectedType,
    required this.onTypeSelected,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        _typeButton(context, AppConstants.evidencePhoto, Icons.camera_alt, 'Chụp ảnh', const Color(0xFF0284C7)),
        const SizedBox(width: 8),
        _typeButton(context, AppConstants.evidenceVideo, Icons.videocam, 'Quay video', StatusColor.critical),
        const SizedBox(width: 8),
        _typeButton(context, AppConstants.evidenceVoiceNote, Icons.mic, 'Ghi âm', StatusColor.medium),
        const SizedBox(width: 8),
        _typeButton(context, AppConstants.evidenceDocument, Icons.photo_library, 'Thư viện', ForestColor.forest600),
      ],
    );
  }

  Widget _typeButton(BuildContext context, String type, IconData icon, String label, Color color) {
    final isSelected = selectedType == type;
    return Expanded(
      child: InkWell(
        onTap: () => onTypeSelected(type),
        borderRadius: BorderRadius.circular(10),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 12),
          decoration: BoxDecoration(
            color: isSelected ? color.withOpacity(0.15) : color.withOpacity(0.05),
            borderRadius: BorderRadius.circular(10),
            border: Border.all(
              color: isSelected ? color : color.withOpacity(0.2),
              width: isSelected ? 2 : 1,
            ),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(icon, color: isSelected ? color : color.withOpacity(0.7), size: 24),
              const SizedBox(height: 4),
              Text(
                label,
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                  color: isSelected ? color : color.withOpacity(0.7),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class CaptureButton extends StatelessWidget {
  final String type;
  final VoidCallback onTap;

  const CaptureButton({
    super.key,
    required this.type,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final icon = AppConstants.evidenceTypeIcons[type];
    final color = _typeColor(type);

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(40),
      child: Container(
        width: 72,
        height: 72,
        decoration: BoxDecoration(
          color: color.withOpacity(0.1),
          shape: BoxShape.circle,
          border: Border.all(color: color, width: 3),
        ),
        child: Icon(
          icon ?? Icons.camera_alt,
          color: color,
          size: 32,
        ),
      ),
    );
  }

  Color _typeColor(String type) {
    switch (type) {
      case 'photo':
        return const Color(0xFF0284C7);
      case 'video':
        return StatusColor.critical;
      case 'voice_note':
        return StatusColor.medium;
      case 'document':
        return ForestColor.forest600;
      case 'gps_track':
        return const Color(0xFF7C3AED);
      default:
        return ForestColor.forest600;
    }
  }
}
