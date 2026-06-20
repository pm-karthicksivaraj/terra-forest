import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../domain/entities/patrol.dart';
import '../../domain/entities/observation.dart';
import '../bloc/patrol_bloc.dart';
import '../widgets/patrol_widgets.dart';

/// THE KEY PAGE — Active patrol for rangers in the field.
///
/// Features:
/// - Top bar: patrol title, elapsed timer (HH:MM:SS), SOS button (red)
/// - Mini map showing current position and route traced so far
/// - Quick action buttons row: Chụp ảnh, Ghi âm, Quan sát
/// - Current task card (if assigned)
/// - Recent observations list (scrollable)
/// - Check-out button at bottom (large, red "Kết thúc tuần tra")
/// - Location accuracy indicator
/// - Battery indicator
/// - Offline mode banner
/// - Camera capture, voice recording, observation form
class ActivePatrolPage extends StatefulWidget {
  const ActivePatrolPage({super.key});

  @override
  State<ActivePatrolPage> createState() => _ActivePatrolPageState();
}

class _ActivePatrolPageState extends State<ActivePatrolPage> {
  Timer? _elapsedTimer;
  Duration _elapsed = Duration.zero;
  DateTime? _patrolStartTime;

  @override
  void initState() {
    super.initState();
    // Determine start time from the active patrol
    final state = context.read<PatrolBloc>().state;
    if (state is PatrolsLoaded && state.activePatrol != null) {
      _patrolStartTime = state.activePatrol!.startTime;
      if (_patrolStartTime != null) {
        _elapsed = DateTime.now().difference(_patrolStartTime!);
      }
    }
    _startElapsedTimer();
  }

  void _startElapsedTimer() {
    _elapsedTimer?.cancel();
    _elapsedTimer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (_patrolStartTime != null) {
        setState(() {
          _elapsed = DateTime.now().difference(_patrolStartTime!);
        });
      } else {
        setState(() {
          _elapsed += const Duration(seconds: 1);
        });
      }
    });
  }

  @override
  void dispose() {
    _elapsedTimer?.cancel();
    super.dispose();
  }

  String _formatElapsed(Duration d) {
    final hours = d.inHours.toString().padLeft(2, '0');
    final minutes = (d.inMinutes % 60).toString().padLeft(2, '0');
    final seconds = (d.inSeconds % 60).toString().padLeft(2, '0');
    return '$hours:$minutes:$seconds';
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, _) {
        if (!didPop) {
          _showConfirmExitDialog(context);
        }
      },
      child: Scaffold(
        body: BlocBuilder<PatrolBloc, PatrolState>(
          builder: (context, state) {
            final patrolsLoaded = state is PatrolsLoaded ? state : null;
            final activePatrol = patrolsLoaded?.activePatrol;
            final observations = patrolsLoaded?.observations ?? [];
            final isOffline = patrolsLoaded?.isOffline ?? false;
            final currentLat = patrolsLoaded?.currentLatitude;
            final currentLng = patrolsLoaded?.currentLongitude;
            final currentAcc = patrolsLoaded?.currentAccuracy;

            return Column(
              children: [
                // ── Offline banner ────────────────────────────────────────
                if (isOffline)
                  const OfflineBanner(
                      message: 'Chế độ ngoại tuyến – dữ liệu sẽ đồng bộ khi có mạng'),

                // ── Top Bar ──────────────────────────────────────────────
                _ActivePatrolTopBar(
                  title: activePatrol?.title ?? 'Tuần tra',
                  elapsed: _formatElapsed(_elapsed),
                  onSosPressed: () => _onSosPressed(context, activePatrol),
                ),

                // ── Location & Battery Indicators ────────────────────────
                _StatusIndicators(
                  latitude: currentLat,
                  longitude: currentLng,
                  accuracy: currentAcc,
                ),

                // ── Mini Map ─────────────────────────────────────────────
                PatrolRouteMiniMap(
                  routeGeojson: activePatrol?.routeGeojson,
                  currentLatitude: currentLat,
                  currentLongitude: currentLng,
                  height: 180,
                ),

                // ── Quick Action Buttons ─────────────────────────────────
                QuickActionButtons(
                  onCameraPressed: () => _onCameraPressed(context, activePatrol),
                  onVoicePressed: () => _onVoicePressed(context, activePatrol),
                  onObservationPressed: () =>
                      _onObservationPressed(context, activePatrol),
                ),

                // ── Current Task Card ────────────────────────────────────
                if (activePatrol?.description != null &&
                    activePatrol!.description!.isNotEmpty)
                  _CurrentTaskCard(description: activePatrol.description!),

                // ── Recent Observations ──────────────────────────────────
                Expanded(
                  child: observations.isEmpty
                      ? _EmptyObservationsState()
                      : ListView.separated(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 16, vertical: 8),
                          itemCount: observations.length > 10
                              ? 10
                              : observations.length,
                          separatorBuilder: (_, __) =>
                              const SizedBox(height: 8),
                          itemBuilder: (context, index) {
                            return ObservationCard(
                              observation: observations[index],
                              compact: true,
                            );
                          },
                        ),
                ),

                // ── Check-out Button ─────────────────────────────────────
                _CheckOutButton(
                  onPressed: () => _onCheckOut(context, activePatrol),
                ),
              ],
            );
          },
        ),
      ),
    );
  }

  void _onSosPressed(BuildContext context, Patrol? activePatrol) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Row(
          children: const [
            Icon(Icons.emergency, color: Colors.red),
            SizedBox(width: 8),
            Text('SOS Khẩn cấp'),
          ],
        ),
        content: const Text(
          'Bạn có chắc chắn muốn gửi tín hiệu SOS? Vị trí hiện tại của bạn sẽ được chia sẻ ngay lập tức.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('Huỷ'),
          ),
          FilledButton(
            style: FilledButton.styleFrom(backgroundColor: Colors.red),
            onPressed: () {
              Navigator.of(ctx).pop();
              context
                  .read<PatrolBloc>()
                  .add(SOSPressed(patrolId: activePatrol?.id));
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('SOS đã được gửi! Vị trí đang được chia sẻ.'),
                  backgroundColor: Colors.red,
                ),
              );
            },
            child: const Text('Gửi SOS'),
          ),
        ],
      ),
    );
  }

  void _onCameraPressed(BuildContext context, Patrol? activePatrol) {
    if (activePatrol == null) return;
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (_) => EvidenceCaptureBottomSheet(
        patrolId: activePatrol.id,
        captureType: ObservationType.photo,
        onCaptured: (observation) {
          context.read<PatrolBloc>().add(AddObservation(observation: observation));
        },
      ),
    );
  }

  void _onVoicePressed(BuildContext context, Patrol? activePatrol) {
    if (activePatrol == null) return;
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (_) => EvidenceCaptureBottomSheet(
        patrolId: activePatrol.id,
        captureType: ObservationType.voiceNote,
        onCaptured: (observation) {
          context.read<PatrolBloc>().add(AddObservation(observation: observation));
        },
      ),
    );
  }

  void _onObservationPressed(BuildContext context, Patrol? activePatrol) {
    if (activePatrol == null) return;
    showDialog(
      context: context,
      builder: (_) => ObservationFormDialog(
        patrolId: activePatrol.id,
        onSubmit: (observation) {
          context.read<PatrolBloc>().add(AddObservation(observation: observation));
        },
      ),
    );
  }

  void _onCheckOut(BuildContext context, Patrol? activePatrol) {
    if (activePatrol == null) return;

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Kết thúc tuần tra'),
        content: const Text(
          'Bạn có chắc chắn muốn kết thúc chuyến tuần tra này? Hành động này không thể hoàn tác.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('Tiếp tục tuần tra'),
          ),
          FilledButton(
            style: FilledButton.styleFrom(backgroundColor: Colors.red),
            onPressed: () {
              Navigator.of(ctx).pop();
              context.read<PatrolBloc>().add(CompletePatrol(
                    patrolId: activePatrol.id,
                    routeGeojson: activePatrol.routeGeojson ?? '',
                  ));
              Navigator.of(context).pop();
            },
            child: const Text('Kết thúc'),
          ),
        ],
      ),
    );
  }

  void _showConfirmExitDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Rời trang?'),
        content: const Text(
          'Tuần tra vẫn đang hoạt động. Bạn có thể quay lại sau.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('Ở lại'),
          ),
          FilledButton(
            onPressed: () {
              Navigator.of(ctx).pop();
              Navigator.of(context).pop();
            },
            child: const Text('Rời đi'),
          ),
        ],
      ),
    );
  }
}

/// Top bar with patrol title, elapsed timer, and SOS button.
class _ActivePatrolTopBar extends StatelessWidget {
  final String title;
  final String elapsed;
  final VoidCallback onSosPressed;

  const _ActivePatrolTopBar({
    required this.title,
    required this.elapsed,
    required this.onSosPressed,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
      color: Theme.of(context).colorScheme.primaryContainer.withOpacity(0.3),
      child: SafeArea(
        bottom: false,
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 2),
                  Row(
                    children: [
                      Icon(
                        Icons.timer,
                        size: 16,
                        color: Theme.of(context).colorScheme.primary,
                      ),
                      const SizedBox(width: 4),
                      PatrolTimer(elapsed: elapsed),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(width: 12),
            // SOS Button
            Material(
              color: Colors.red,
              borderRadius: BorderRadius.circular(28),
              child: InkWell(
                onTap: onSosPressed,
                borderRadius: BorderRadius.circular(28),
                child: Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: const [
                      Icon(Icons.emergency, color: Colors.white, size: 20),
                      SizedBox(width: 6),
                      Text(
                        'SOS',
                        style: TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Row of status indicators (GPS accuracy, battery).
class _StatusIndicators extends StatelessWidget {
  final double? latitude;
  final double? longitude;
  final double? accuracy;

  const _StatusIndicators({
    this.latitude,
    this.longitude,
    this.accuracy,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      child: Row(
        children: [
          // GPS indicator
          Icon(
            latitude != null ? Icons.gps_fixed : Icons.gps_not_fixed,
            size: 16,
            color: latitude != null ? Colors.green : Colors.orange,
          ),
          const SizedBox(width: 4),
          Text(
            latitude != null
                ? 'GPS: ${accuracy != null ? '${accuracy!.toStringAsFixed(0)}m' : 'Tốt'}'
                : 'GPS: Đang tìm...',
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: latitude != null ? Colors.green : Colors.orange,
                ),
          ),
          const Spacer(),
          // Battery indicator (placeholder)
          Icon(
            Icons.battery_std,
            size: 16,
            color: Theme.of(context).colorScheme.onSurfaceVariant,
          ),
          const SizedBox(width: 4),
          Text(
            'Pin',
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: Theme.of(context).colorScheme.onSurfaceVariant,
                ),
          ),
        ],
      ),
    );
  }
}

/// Current task card.
class _CurrentTaskCard extends StatelessWidget {
  final String description;

  const _CurrentTaskCard({required this.description});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.primaryContainer.withOpacity(0.3),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(
          color: Theme.of(context).colorScheme.primary.withOpacity(0.3),
        ),
      ),
      child: Row(
        children: [
          Icon(
            Icons.assignment,
            color: Theme.of(context).colorScheme.primary,
            size: 20,
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Nhiệm vụ hiện tại',
                  style: Theme.of(context).textTheme.labelMedium?.copyWith(
                        color: Theme.of(context).colorScheme.primary,
                      ),
                ),
                const SizedBox(height: 2),
                Text(
                  description,
                  style: Theme.of(context).textTheme.bodySmall,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

/// Empty state for observations section.
class _EmptyObservationsState extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.visibility_outlined,
            size: 48,
            color: Theme.of(context)
                .colorScheme
                .onSurfaceVariant
                .withOpacity(0.4),
          ),
          const SizedBox(height: 8),
          Text(
            'Chưa có quan sát nào',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: Theme.of(context).colorScheme.onSurfaceVariant,
                ),
          ),
          const SizedBox(height: 4),
          Text(
            'Sử dụng các nút bên trên để ghi nhận',
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: Theme.of(context).colorScheme.onSurfaceVariant,
                ),
          ),
        ],
      ),
    );
  }
}

/// Large red check-out button at the bottom.
class _CheckOutButton extends StatelessWidget {
  final VoidCallback onPressed;

  const _CheckOutButton({required this.onPressed});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
      child: SizedBox(
        width: double.infinity,
        height: 52,
        child: FilledButton.icon(
          style: FilledButton.styleFrom(
            backgroundColor: Colors.red,
            foregroundColor: Colors.white,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
          ),
          onPressed: onPressed,
          icon: const Icon(Icons.stop_circle, size: 24),
          label: const Text(
            'Kết thúc tuần tra',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
          ),
        ),
      ),
    );
  }
}
