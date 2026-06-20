import 'dart:async';

import 'package:flutter/material.dart';

import '../../domain/entities/patrol.dart';
import '../../domain/entities/observation.dart';

// ─── PatrolCard ─────────────────────────────────────────────────────────────

/// Card displaying a patrol summary in the list view.
class PatrolCard extends StatelessWidget {
  final Patrol patrol;
  final VoidCallback? onTap;

  const PatrolCard({
    super.key,
    required this.patrol,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Card(
      margin: EdgeInsets.zero,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Text(
                      patrol.title,
                      style: theme.textTheme.titleSmall?.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  const SizedBox(width: 8),
                  StatusBadge(status: patrol.status),
                ],
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  Icon(Icons.person_outline,
                      size: 16, color: theme.colorScheme.onSurfaceVariant),
                  const SizedBox(width: 4),
                  Text(
                    patrol.leaderName,
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: theme.colorScheme.onSurfaceVariant,
                    ),
                  ),
                  const SizedBox(width: 16),
                  Icon(Icons.access_time,
                      size: 16, color: theme.colorScheme.onSurfaceVariant),
                  const SizedBox(width: 4),
                  Text(
                    patrol.startTime != null
                        ? _formatDateTime(patrol.startTime!)
                        : 'Chưa bắt đầu',
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: theme.colorScheme.onSurfaceVariant,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  Icon(Icons.group_outlined,
                      size: 16, color: theme.colorScheme.primary),
                  const SizedBox(width: 4),
                  Text(
                    '${patrol.memberCount} thành viên',
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: theme.colorScheme.primary,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const Spacer(),
                  if (patrol.observationCount > 0) ...[
                    Icon(Icons.visibility_outlined,
                        size: 16, color: theme.colorScheme.onSurfaceVariant),
                    const SizedBox(width: 4),
                    Text(
                      '${patrol.observationCount} quan sát',
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: theme.colorScheme.onSurfaceVariant,
                      ),
                    ),
                  ],
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  String _formatDateTime(DateTime dt) {
    return '${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')} ${dt.day.toString().padLeft(2, '0')}/${dt.month.toString().padLeft(2, '0')}';
  }
}

// ─── StatusBadge ────────────────────────────────────────────────────────────

/// Badge displaying the patrol status with color coding.
class StatusBadge extends StatelessWidget {
  final PatrolStatus status;

  const StatusBadge({super.key, required this.status});

  @override
  Widget build(BuildContext context) {
    final (Color bg, Color fg) = _statusColors(context);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        status.displayName,
        style: TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w600,
          color: fg,
        ),
      ),
    );
  }

  (Color, Color) _statusColors(BuildContext context) {
    switch (status) {
      case PatrolStatus.active:
        return (Colors.green.withOpacity(0.15), Colors.green.shade800);
      case PatrolStatus.completed:
        return (Colors.blue.withOpacity(0.15), Colors.blue.shade800);
      case PatrolStatus.planned:
        return (Colors.orange.withOpacity(0.15), Colors.orange.shade800);
      case PatrolStatus.cancelled:
        return (Colors.red.withOpacity(0.15), Colors.red.shade800);
    }
  }
}

// ─── SyncStatusChip ─────────────────────────────────────────────────────────

/// Small chip indicating the sync status of an entity.
class SyncStatusChip extends StatelessWidget {
  final SyncStatus syncStatus;

  const SyncStatusChip({super.key, required this.syncStatus});

  @override
  Widget build(BuildContext context) {
    final (icon, color, label) = switch (syncStatus) {
      SyncStatus.synced => (Icons.cloud_done, Colors.green, 'Đã đồng bộ'),
      SyncStatus.pending => (Icons.cloud_upload, Colors.orange, 'Chờ đồng bộ'),
      SyncStatus.failed => (Icons.cloud_off, Colors.red, 'Lỗi đồng bộ'),
    };

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: color.withOpacity(0.12),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: color),
          const SizedBox(width: 4),
          Text(
            label,
            style: TextStyle(fontSize: 11, color: color, fontWeight: FontWeight.w500),
          ),
        ],
      ),
    );
  }
}

// ─── ObservationCard ────────────────────────────────────────────────────────

/// Card displaying a field observation in a list or timeline.
class ObservationCard extends StatelessWidget {
  final Observation observation;
  final bool compact;

  const ObservationCard({
    super.key,
    required this.observation,
    this.compact = false,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final typeColor = _obsTypeColor(observation.obsType);

    if (compact) {
      return _buildCompact(context, theme, typeColor);
    }
    return _buildFull(context, theme, typeColor);
  }

  Widget _buildCompact(BuildContext context, ThemeData theme, Color typeColor) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: typeColor.withOpacity(0.06),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: typeColor.withOpacity(0.2)),
      ),
      child: Row(
        children: [
          Icon(observation.obsType._icon, color: typeColor, size: 20),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  observation.obsType.displayName,
                  style: theme.textTheme.labelMedium?.copyWith(
                    color: typeColor,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                if (observation.description != null &&
                    observation.description!.isNotEmpty)
                  Text(
                    observation.description!,
                    style: theme.textTheme.bodySmall,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
              ],
            ),
          ),
          Text(
            _formatTime(observation.recordedAt),
            style: theme.textTheme.bodySmall?.copyWith(
              color: theme.colorScheme.onSurfaceVariant,
            ),
          ),
          if (observation.needsSync) ...[
            const SizedBox(width: 6),
            Icon(Icons.cloud_upload,
                size: 14, color: Colors.orange.shade700),
          ],
        ],
      ),
    );
  }

  Widget _buildFull(BuildContext context, ThemeData theme, Color typeColor) {
    return Card(
      margin: EdgeInsets.zero,
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: typeColor.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child:
                      Icon(observation.obsType._icon, color: typeColor, size: 20),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        observation.obsType.displayName,
                        style: theme.textTheme.titleSmall?.copyWith(
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      Text(
                        _formatDateTime(observation.recordedAt),
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: theme.colorScheme.onSurfaceVariant,
                        ),
                      ),
                    ],
                  ),
                ),
                SyncStatusChip(
                    syncStatus: observation.syncStatus == ObservationSyncStatus.synced
                        ? SyncStatus.synced
                        : SyncStatus.pending),
              ],
            ),
            if (observation.description != null &&
                observation.description!.isNotEmpty) ...[
              const SizedBox(height: 8),
              Text(
                observation.description!,
                style: theme.textTheme.bodyMedium,
              ),
            ],
            if (observation.hasMedia) ...[
              const SizedBox(height: 8),
              Container(
                height: 120,
                decoration: BoxDecoration(
                  color: theme.colorScheme.surfaceContainerHighest,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Center(
                  child: Icon(
                    observation.obsType == ObservationType.video
                        ? Icons.play_circle_outline
                        : observation.obsType == ObservationType.voiceNote
                            ? Icons.audiotrack
                            : Icons.image,
                    size: 36,
                    color: typeColor.withOpacity(0.5),
                  ),
                ),
              ),
            ],
            if (observation.hasLocation) ...[
              const SizedBox(height: 8),
              Row(
                children: [
                  Icon(Icons.location_on,
                      size: 14, color: theme.colorScheme.onSurfaceVariant),
                  const SizedBox(width: 4),
                  Text(
                    '${observation.latitude!.toStringAsFixed(5)}, ${observation.longitude!.toStringAsFixed(5)}',
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: theme.colorScheme.onSurfaceVariant,
                    ),
                  ),
                  if (observation.accuracy != null) ...[
                    const SizedBox(width: 8),
                    Text(
                      '±${observation.accuracy!.toStringAsFixed(0)}m',
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: theme.colorScheme.onSurfaceVariant,
                      ),
                    ),
                  ],
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }

  Color _obsTypeColor(ObservationType type) {
    switch (type) {
      case ObservationType.photo:
        return Colors.blue;
      case ObservationType.video:
        return Colors.purple;
      case ObservationType.voiceNote:
        return Colors.orange;
      case ObservationType.logging:
        return Colors.red;
      case ObservationType.fire:
        return Colors.deepOrange;
      case ObservationType.wildlife:
        return Colors.teal;
      case ObservationType.boundary:
        return Colors.brown;
      case ObservationType.vegetation:
        return Colors.green;
      case ObservationType.other:
        return Colors.grey;
    }
  }

  String _formatTime(DateTime dt) =>
      '${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')}';

  String _formatDateTime(DateTime dt) =>
      '${dt.day.toString().padLeft(2, '0')}/${dt.month.toString().padLeft(2, '0')}/${dt.year} ${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')}';
}

// ─── PatrolTimer ────────────────────────────────────────────────────────────

/// Widget displaying the elapsed time in HH:MM:SS format.
class PatrolTimer extends StatelessWidget {
  final String elapsed;

  const PatrolTimer({super.key, required this.elapsed});

  @override
  Widget build(BuildContext context) {
    return Text(
      elapsed,
      style: TextStyle(
        fontFeatures: [const FontFeature.tabularFigures()],
        fontSize: 14,
        fontWeight: FontWeight.w600,
        color: Theme.of(context).colorScheme.primary,
      ),
    );
  }
}

// ─── QuickActionButtons ─────────────────────────────────────────────────────

/// Row of three quick action buttons: Camera, Voice, Observation.
class QuickActionButtons extends StatelessWidget {
  final VoidCallback? onCameraPressed;
  final VoidCallback? onVoicePressed;
  final VoidCallback? onObservationPressed;

  const QuickActionButtons({
    super.key,
    this.onCameraPressed,
    this.onVoicePressed,
    this.onObservationPressed,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Row(
        children: [
          Expanded(
            child: _QuickActionButton(
              icon: Icons.camera_alt,
              label: 'Chụp ảnh',
              color: Colors.blue,
              onPressed: onCameraPressed,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: _QuickActionButton(
              icon: Icons.mic,
              label: 'Ghi âm',
              color: Colors.orange,
              onPressed: onVoicePressed,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: _QuickActionButton(
              icon: Icons.visibility,
              label: 'Quan sát',
              color: Colors.green,
              onPressed: onObservationPressed,
            ),
          ),
        ],
      ),
    );
  }
}

class _QuickActionButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback? onPressed;

  const _QuickActionButton({
    required this.icon,
    required this.label,
    required this.color,
    this.onPressed,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: color.withOpacity(0.1),
      borderRadius: BorderRadius.circular(12),
      child: InkWell(
        onTap: onPressed,
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 12),
          child: Column(
            children: [
              Icon(icon, color: color, size: 24),
              const SizedBox(height: 6),
              Text(
                label,
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: color,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ─── ObservationFormDialog ──────────────────────────────────────────────────

/// Dialog form for adding a new observation.
class ObservationFormDialog extends StatefulWidget {
  final String patrolId;
  final ValueChanged<Observation> onSubmit;

  const ObservationFormDialog({
    super.key,
    required this.patrolId,
    required this.onSubmit,
  });

  @override
  State<ObservationFormDialog> createState() => _ObservationFormDialogState();
}

class _ObservationFormDialogState extends State<ObservationFormDialog> {
  ObservationType _selectedType = ObservationType.other;
  final _descriptionController = TextEditingController();

  static const _typeOptions = [
    ObservationType.logging,
    ObservationType.fire,
    ObservationType.wildlife,
    ObservationType.boundary,
    ObservationType.vegetation,
    ObservationType.other,
  ];

  @override
  void dispose() {
    _descriptionController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Thêm quan sát'),
      content: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Type dropdown
            Text(
              'Loại quan sát',
              style: Theme.of(context).textTheme.labelMedium,
            ),
            const SizedBox(height: 6),
            DropdownButtonFormField<ObservationType>(
              value: _selectedType,
              decoration: const InputDecoration(
                prefixIcon: Icon(Icons.category),
              ),
              items: _typeOptions
                  .map((t) => DropdownMenuItem(
                        value: t,
                        child: Text(t.displayName),
                      ))
                  .toList(),
              onChanged: (val) {
                if (val != null) setState(() => _selectedType = val);
              },
            ),
            const SizedBox(height: 16),
            // Description
            Text(
              'Mô tả',
              style: Theme.of(context).textTheme.labelMedium,
            ),
            const SizedBox(height: 6),
            TextField(
              controller: _descriptionController,
              maxLines: 4,
              decoration: const InputDecoration(
                hintText: 'Mô tả chi tiết quan sát của bạn...',
                alignLabelWithHint: true,
              ),
            ),
            const SizedBox(height: 12),
            // Add photo button
            OutlinedButton.icon(
              onPressed: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Chức năng chụp ảnh sẽ được mở')),
                );
              },
              icon: const Icon(Icons.camera_alt, size: 18),
              label: const Text('Thêm ảnh'),
            ),
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(context).pop(),
          child: const Text('Huỷ'),
        ),
        FilledButton(
          onPressed: () {
            final observation = Observation(
              id: 'obs_${DateTime.now().millisecondsSinceEpoch}',
              patrolId: widget.patrolId,
              obsType: _selectedType,
              description: _descriptionController.text.trim().isEmpty
                  ? null
                  : _descriptionController.text.trim(),
              recordedAt: DateTime.now(),
              syncStatus: ObservationSyncStatus.pending,
            );
            widget.onSubmit(observation);
            Navigator.of(context).pop();
          },
          child: const Text('Lưu'),
        ),
      ],
    );
  }
}

// ─── EvidenceCaptureBottomSheet ─────────────────────────────────────────────

/// Bottom sheet for capturing photos or voice notes.
class EvidenceCaptureBottomSheet extends StatefulWidget {
  final String patrolId;
  final ObservationType captureType;
  final ValueChanged<Observation> onCaptured;

  const EvidenceCaptureBottomSheet({
    super.key,
    required this.patrolId,
    required this.captureType,
    required this.onCaptured,
  });

  @override
  State<EvidenceCaptureBottomSheet> createState() =>
      _EvidenceCaptureBottomSheetState();
}

class _EvidenceCaptureBottomSheetState
    extends State<EvidenceCaptureBottomSheet> {
  bool _isRecording = false;
  int _recordingSeconds = 0;
  Timer? _recordingTimer;

  @override
  void dispose() {
    _recordingTimer?.cancel();
    super.dispose();
  }

  void _startRecording() {
    setState(() {
      _isRecording = true;
      _recordingSeconds = 0;
    });
    _recordingTimer = Timer.periodic(const Duration(seconds: 1), (_) {
      setState(() => _recordingSeconds++);
    });
  }

  void _stopRecording() {
    _recordingTimer?.cancel();
    setState(() => _isRecording = false);

    final observation = Observation(
      id: 'obs_${DateTime.now().millisecondsSinceEpoch}',
      patrolId: widget.patrolId,
      obsType: widget.captureType,
      description: widget.captureType == ObservationType.voiceNote
          ? 'Ghi âm ${_formatDuration(_recordingSeconds)}'
          : 'Ảnh chụp tại hiện trường',
      recordedAt: DateTime.now(),
      syncStatus: ObservationSyncStatus.pending,
    );
    widget.onCaptured(observation);
    Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    final isPhoto = widget.captureType == ObservationType.photo;

    return Container(
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Drag handle
          Container(
            width: 40,
            height: 4,
            decoration: BoxDecoration(
              color: Colors.grey[300],
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const SizedBox(height: 24),
          Text(
            isPhoto ? 'Chụp ảnh bằng chứng' : 'Ghi âm',
            style: Theme.of(context).textTheme.titleLarge,
          ),
          const SizedBox(height: 24),
          if (isPhoto) ...[
            // Photo capture UI
            Container(
              height: 200,
              decoration: BoxDecoration(
                color: Colors.grey[200],
                borderRadius: BorderRadius.circular(16),
              ),
              child: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.camera_alt, size: 48, color: Colors.grey),
                    const SizedBox(height: 8),
                    Text(
                      'Nhấn để chụp ảnh',
                      style: TextStyle(color: Colors.grey[600]),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: FilledButton.icon(
                onPressed: _stopRecording,
                icon: const Icon(Icons.camera),
                label: const Text('Chụp ảnh'),
              ),
            ),
          ] else ...[
            // Voice recording UI
            Container(
              height: 120,
              decoration: BoxDecoration(
                color: Colors.orange.withOpacity(0.1),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      _isRecording ? Icons.mic : Icons.mic_none,
                      size: 48,
                      color: _isRecording ? Colors.red : Colors.orange,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      _isRecording
                          ? _formatDuration(_recordingSeconds)
                          : 'Nhấn để bắt đầu ghi âm',
                      style: TextStyle(
                        color: _isRecording ? Colors.red : Colors.orange,
                        fontWeight: FontWeight.w600,
                        fontSize: 16,
                        fontFeatures: [const FontFeature.tabularFigures()],
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: FilledButton.icon(
                style: FilledButton.styleFrom(
                  backgroundColor:
                      _isRecording ? Colors.red : Colors.orange,
                ),
                onPressed: _isRecording ? _stopRecording : _startRecording,
                icon: Icon(_isRecording ? Icons.stop : Icons.mic),
                label: Text(_isRecording ? 'Dừng ghi âm' : 'Bắt đầu ghi âm'),
              ),
            ),
          ],
        ],
      ),
    );
  }

  String _formatDuration(int seconds) {
    final m = (seconds ~/ 60).toString().padLeft(2, '0');
    final s = (seconds % 60).toString().padLeft(2, '0');
    return '$m:$s';
  }
}

// ─── PatrolRouteMiniMap ─────────────────────────────────────────────────────

/// Mini map widget showing the patrol route and current position.
/// Placeholder implementation – in production, integrate MapLibre/Google Maps.
class PatrolRouteMiniMap extends StatelessWidget {
  final String? routeGeojson;
  final double? currentLatitude;
  final double? currentLongitude;
  final double height;

  const PatrolRouteMiniMap({
    super.key,
    this.routeGeojson,
    this.currentLatitude,
    this.currentLongitude,
    this.height = 200,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      height: height,
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surfaceContainerHighest,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: Theme.of(context).colorScheme.outlineVariant,
        ),
      ),
      child: Stack(
        children: [
          // Map placeholder
          Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.map,
                  size: 40,
                  color: Theme.of(context)
                      .colorScheme
                      .onSurfaceVariant
                      .withOpacity(0.4),
                ),
                const SizedBox(height: 4),
                Text(
                  'Bản đồ tuần tra',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: Theme.of(context).colorScheme.onSurfaceVariant,
                      ),
                ),
              ],
            ),
          ),
          // Current position dot
          if (currentLatitude != null && currentLongitude != null)
            Positioned(
              right: 16,
              bottom: 16,
              child: Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(8),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.15),
                      blurRadius: 6,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 10,
                      height: 10,
                      decoration: const BoxDecoration(
                        color: Colors.blue,
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 6),
                    Text(
                      '${currentLatitude!.toStringAsFixed(4)}, ${currentLongitude!.toStringAsFixed(4)}',
                      style: const TextStyle(fontSize: 11),
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }
}

// ─── MemberAvatarStack ──────────────────────────────────────────────────────

/// Stack of member avatars for the patrol detail view.
class MemberAvatarStack extends StatelessWidget {
  final List<PatrolMember> members;
  final int maxVisible;

  const MemberAvatarStack({
    super.key,
    required this.members,
    this.maxVisible = 5,
  });

  @override
  Widget build(BuildContext context) {
    final visible = members.take(maxVisible).toList();
    final remaining = members.length - maxVisible;

    return Wrap(
      spacing: -8,
      runSpacing: 4,
      children: [
        ...visible.map((member) => _AvatarChip(member: member)),
        if (remaining > 0)
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.surfaceContainerHighest,
              shape: BoxShape.circle,
              border: Border.all(
                color: Theme.of(context).colorScheme.outline,
                width: 2,
              ),
            ),
            child: Center(
              child: Text(
                '+$remaining',
                style: Theme.of(context).textTheme.labelSmall,
              ),
            ),
          ),
      ],
    );
  }
}

class _AvatarChip extends StatelessWidget {
  final PatrolMember member;

  const _AvatarChip({required this.member});

  @override
  Widget build(BuildContext context) {
    final isLeader = member.role == 'leader';
    return Container(
      width: 36,
      height: 36,
      decoration: BoxDecoration(
        color: isLeader
            ? Theme.of(context).colorScheme.primary
            : Theme.of(context).colorScheme.surfaceContainerHighest,
        shape: BoxShape.circle,
        border: Border.all(
          color: isLeader
              ? Theme.of(context).colorScheme.primary
              : Theme.of(context).colorScheme.outline,
          width: 2,
        ),
      ),
      child: Center(
        child: member.name.isNotEmpty
            ? Text(
                member.name[0].toUpperCase(),
                style: TextStyle(
                  color: isLeader ? Colors.white : null,
                  fontWeight: FontWeight.bold,
                  fontSize: 14,
                ),
              )
            : Icon(
                Icons.person,
                size: 18,
                color: isLeader ? Colors.white : null,
              ),
      ),
    );
  }
}

// ─── OfflineBanner ──────────────────────────────────────────────────────────

/// Banner shown when the device is offline.
class OfflineBanner extends StatelessWidget {
  final String message;

  const OfflineBanner({super.key, required this.message});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      color: Colors.orange.shade100,
      child: Row(
        children: [
          const Icon(Icons.cloud_off, color: Colors.orange, size: 18),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              message,
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w500,
                color: Colors.orange.shade900,
              ),
            ),
          ),
          TextButton(
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Đang đồng bộ...')),
              );
            },
            style: TextButton.styleFrom(
              padding: const EdgeInsets.symmetric(horizontal: 8),
              minimumSize: Size.zero,
              tapTargetSize: MaterialTapTargetSize.shrinkWrap,
            ),
            child: Text(
              'Đồng bộ',
              style: TextStyle(
                fontSize: 12,
                color: Colors.orange.shade900,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ─── Extension on ObservationType for icon ──────────────────────────────────

extension ObservationTypeIcon on ObservationType {
  IconData get _icon {
    switch (this) {
      case ObservationType.photo:
        return Icons.camera_alt;
      case ObservationType.video:
        return Icons.videocam;
      case ObservationType.voiceNote:
        return Icons.mic;
      case ObservationType.logging:
        return Icons.forest;
      case ObservationType.fire:
        return Icons.local_fire_department;
      case ObservationType.wildlife:
        return Icons.pets;
      case ObservationType.boundary:
        return Icons.edit_location_alt;
      case ObservationType.vegetation:
        return Icons.grass;
      case ObservationType.other:
        return Icons.info_outline;
    }
  }
}

// ─── Timer import ───────────────────────────────────────────────────────────
// Note: Timer is from dart:async, imported at the top of each file that uses it.
// We reference it here via the evidence_capture_bottom_sheet.
