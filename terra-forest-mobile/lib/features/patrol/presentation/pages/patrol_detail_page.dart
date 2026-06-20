import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../domain/entities/patrol.dart';
import '../../domain/entities/observation.dart';
import '../bloc/patrol_bloc.dart';
import '../widgets/patrol_widgets.dart';

/// Detail view of a completed or planned patrol.
///
/// Features:
/// - Header with status badge and title
/// - Timeline of observations with photos
/// - Map showing patrol route polyline
/// - Member list with avatars
/// - Evidence summary (photos, videos, voice notes counts)
/// - Sync status indicator
class PatrolDetailPage extends StatefulWidget {
  final String patrolId;

  const PatrolDetailPage({super.key, required this.patrolId});

  @override
  State<PatrolDetailPage> createState() => _PatrolDetailPageState();
}

class _PatrolDetailPageState extends State<PatrolDetailPage> {
  @override
  void initState() {
    super.initState();
    context.read<PatrolBloc>().add(LoadObservations(patrolId: widget.patrolId));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Chi tiết tuần tra'),
        actions: [
          BlocBuilder<PatrolBloc, PatrolState>(
            builder: (context, state) {
              if (state is PatrolsLoaded) {
                final patrol = state.patrols
                    .where((p) => p.id == widget.patrolId)
                    .firstOrNull;
                if (patrol != null) {
                  return SyncStatusChip(syncStatus: patrol.syncStatus);
                }
              }
              return const SizedBox.shrink();
            },
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: BlocBuilder<PatrolBloc, PatrolState>(
        builder: (context, state) {
          if (state is PatrolLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          if (state is PatrolError) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.error_outline, size: 48, color: Colors.red),
                  const SizedBox(height: 12),
                  Text(state.message, textAlign: TextAlign.center),
                  const SizedBox(height: 16),
                  FilledButton(
                    onPressed: () => context
                        .read<PatrolBloc>()
                        .add(LoadObservations(patrolId: widget.patrolId)),
                    child: const Text('Thử lại'),
                  ),
                ],
              ),
            );
          }

          if (state is PatrolsLoaded) {
            final patrol = state.patrols
                .where((p) => p.id == widget.patrolId)
                .firstOrNull;

            if (patrol == null) {
              return const Center(
                child: Text('Không tìm thấy thông tin tuần tra'),
              );
            }

            final observations = state.observations;

            return SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // ── Header Card ──────────────────────────────────────────
                  _PatrolHeaderCard(patrol: patrol),

                  const SizedBox(height: 16),

                  // ── Evidence Summary ────────────────────────────────────
                  _EvidenceSummaryCard(patrol: patrol),

                  const SizedBox(height: 16),

                  // ── Patrol Route Map ────────────────────────────────────
                  PatrolRouteMiniMap(
                    routeGeojson: patrol.routeGeojson,
                    height: 200,
                  ),

                  const SizedBox(height: 16),

                  // ── Members ─────────────────────────────────────────────
                  _MembersSection(patrol: patrol),

                  const SizedBox(height: 16),

                  // ── Observations Timeline ───────────────────────────────
                  _ObservationsTimeline(observations: observations),
                ],
              ),
            );
          }

          return const SizedBox.shrink();
        },
      ),
    );
  }
}

/// Header card with status badge, title, and timing info.
class _PatrolHeaderCard extends StatelessWidget {
  final Patrol patrol;

  const _PatrolHeaderCard({required this.patrol});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    patrol.title,
                    style: theme.textTheme.titleLarge,
                  ),
                ),
                StatusBadge(status: patrol.status),
              ],
            ),
            if (patrol.description != null &&
                patrol.description!.isNotEmpty) ...[
              const SizedBox(height: 8),
              Text(
                patrol.description!,
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: theme.colorScheme.onSurfaceVariant,
                ),
              ),
            ],
            const Divider(height: 24),
            _InfoRow(
              icon: Icons.person,
              label: 'Trưởng đoàn',
              value: patrol.leaderName,
            ),
            if (patrol.startTime != null) ...[
              const SizedBox(height: 8),
              _InfoRow(
                icon: Icons.play_arrow,
                label: 'Bắt đầu',
                value: _formatDateTime(patrol.startTime!),
              ),
            ],
            if (patrol.endTime != null) ...[
              const SizedBox(height: 8),
              _InfoRow(
                icon: Icons.stop,
                label: 'Kết thúc',
                value: _formatDateTime(patrol.endTime!),
              ),
            ],
            if (patrol.duration != null) ...[
              const SizedBox(height: 8),
              _InfoRow(
                icon: Icons.timer,
                label: 'Thời lượng',
                value: _formatDuration(patrol.duration!),
              ),
            ],
          ],
        ),
      ),
    );
  }

  String _formatDateTime(DateTime dt) {
    return '${dt.day.toString().padLeft(2, '0')}/${dt.month.toString().padLeft(2, '0')}/${dt.year} ${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')}';
  }

  String _formatDuration(Duration d) {
    final hours = d.inHours.toString().padLeft(2, '0');
    final minutes = (d.inMinutes % 60).toString().padLeft(2, '0');
    return '$hours giờ $minutes phút';
  }
}

/// Row displaying an info item with icon, label, and value.
class _InfoRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;

  const _InfoRow({
    required this.icon,
    required this.label,
    required this.value,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, size: 18, color: Theme.of(context).colorScheme.primary),
        const SizedBox(width: 8),
        Text(
          '$label: ',
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                fontWeight: FontWeight.w600,
              ),
        ),
        Expanded(
          child: Text(
            value,
            style: Theme.of(context).textTheme.bodySmall,
          ),
        ),
      ],
    );
  }
}

/// Card summarizing evidence counts.
class _EvidenceSummaryCard extends StatelessWidget {
  final Patrol patrol;

  const _EvidenceSummaryCard({required this.patrol});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Tổng hợp bằng chứng',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                _EvidenceCountChip(
                  icon: Icons.camera_alt,
                  label: 'Ảnh',
                  count: patrol.photoCount,
                  color: Colors.blue,
                ),
                const SizedBox(width: 12),
                _EvidenceCountChip(
                  icon: Icons.videocam,
                  label: 'Video',
                  count: patrol.videoCount,
                  color: Colors.purple,
                ),
                const SizedBox(width: 12),
                _EvidenceCountChip(
                  icon: Icons.mic,
                  label: 'Ghi âm',
                  count: patrol.voiceNoteCount,
                  color: Colors.orange,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

/// Chip showing evidence count for a specific type.
class _EvidenceCountChip extends StatelessWidget {
  final IconData icon;
  final String label;
  final int count;
  final Color color;

  const _EvidenceCountChip({
    required this.icon,
    required this.label,
    required this.count,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 8),
        decoration: BoxDecoration(
          color: color.withOpacity(0.1),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Column(
          children: [
            Icon(icon, color: color, size: 22),
            const SizedBox(height: 4),
            Text(
              '$count',
              style: TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 18,
                color: color,
              ),
            ),
            Text(
              label,
              style: TextStyle(
                fontSize: 11,
                color: color,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Members section with avatar stack.
class _MembersSection extends StatelessWidget {
  final Patrol patrol;

  const _MembersSection({required this.patrol});

  @override
  Widget build(BuildContext context) {
    if (patrol.members.isEmpty) return const SizedBox.shrink();

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Text(
                  'Thành viên',
                  style: Theme.of(context).textTheme.titleMedium,
                ),
                const SizedBox(width: 8),
                Text(
                  '(${patrol.memberCount})',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: Theme.of(context).colorScheme.onSurfaceVariant,
                      ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            MemberAvatarStack(members: patrol.members),
          ],
        ),
      ),
    );
  }
}

/// Timeline of observations for this patrol.
class _ObservationsTimeline extends StatelessWidget {
  final List<Observation> observations;

  const _ObservationsTimeline({required this.observations});

  @override
  Widget build(BuildContext context) {
    if (observations.isEmpty) {
      return Card(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Center(
            child: Column(
              children: [
                Icon(
                  Icons.visibility_off,
                  size: 40,
                  color: Theme.of(context)
                      .colorScheme
                      .onSurfaceVariant
                      .withOpacity(0.5),
                ),
                const SizedBox(height: 8),
                Text(
                  'Chưa có quan sát nào',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: Theme.of(context).colorScheme.onSurfaceVariant,
                      ),
                ),
              ],
            ),
          ),
        ),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Quan sát (${observations.length})',
          style: Theme.of(context).textTheme.titleMedium,
        ),
        const SizedBox(height: 12),
        ...observations.map((obs) => Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: ObservationCard(observation: obs),
            )),
      ],
    );
  }
}
