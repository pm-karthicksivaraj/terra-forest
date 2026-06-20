import 'package:flutter/material.dart';
import '../../../../core/constants/app_constants.dart';
import '../../../../core/theme/app_theme.dart';
import '../../domain/entities/ranger_task.dart';

class TaskCard extends StatelessWidget {
  final RangerTask task;
  final VoidCallback onTap;

  const TaskCard({
    super.key,
    required this.task,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final priorityColor = AppConstants.severityColors[task.priority] ?? StatusColor.low;

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        decoration: BoxDecoration(
          color: Theme.of(context).cardColor,
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 4,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          children: [
            Container(
              width: 4,
              height: 80,
              decoration: BoxDecoration(
                color: priorityColor,
                borderRadius: const BorderRadius.only(
                  topLeft: Radius.circular(12),
                  bottomLeft: Radius.circular(12),
                ),
              ),
            ),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        TaskTypeIcon(type: task.taskType, size: 16),
                        const SizedBox(width: 6),
                        TaskPriorityBadge(priority: task.priority),
                        const SizedBox(width: 6),
                        TaskStatusBadge(status: task.status),
                        const Spacer(),
                        if (task.dueDate != null)
                          Text(
                            _formatDueDate(task.dueDate!),
                            style: TextStyle(
                              fontSize: 11,
                              color: _isOverdue(task.dueDate!) ? StatusColor.critical : Theme.of(context).textTheme.bodySmall?.color,
                            ),
                          ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Text(
                      task.title,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        Icon(
                          Icons.person_outline,
                          size: 14,
                          color: Theme.of(context).textTheme.bodySmall?.color,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          task.assignedTo ?? 'Chưa giao',
                          style: TextStyle(
                            fontSize: 12,
                            color: Theme.of(context).textTheme.bodySmall?.color,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  bool _isOverdue(DateTime dueDate) {
    return dueDate.isBefore(DateTime.now()) && task.status != 'completed' && task.status != 'verified';
  }

  String _formatDueDate(DateTime dueDate) {
    final diff = dueDate.difference(DateTime.now());
    if (diff.inDays < 0) return 'Quá hạn ${-diff.inDays} ngày';
    if (diff.inDays == 0) return 'Hôm nay';
    if (diff.inDays == 1) return 'Ngày mai';
    return '${diff.inDays} ngày nữa';
  }
}

class TaskPriorityBadge extends StatelessWidget {
  final String priority;

  const TaskPriorityBadge({super.key, required this.priority});

  @override
  Widget build(BuildContext context) {
    final color = AppConstants.severityColors[priority] ?? StatusColor.low;
    final lightColor = AppConstants.severityLightColors[priority] ?? StatusColor.lowLight;
    final name = AppConstants.severityDisplayNames[priority] ?? priority;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: lightColor,
        borderRadius: BorderRadius.circular(4),
      ),
      child: Text(
        name,
        style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: color),
      ),
    );
  }
}

class TaskStatusBadge extends StatelessWidget {
  final String status;

  const TaskStatusBadge({super.key, required this.status});

  @override
  Widget build(BuildContext context) {
    final color = _statusColor(status);
    final label = _statusLabel(status);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: color.withOpacity(0.15),
        borderRadius: BorderRadius.circular(4),
      ),
      child: Text(
        label,
        style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: color),
      ),
    );
  }

  Color _statusColor(String status) {
    switch (status) {
      case 'assigned':
        return StatusColor.medium;
      case 'in_progress':
        return const Color(0xFF0284C7);
      case 'completed':
        return StatusColor.low;
      case 'verified':
        return ForestColor.forest600;
      default:
        return StatusColor.medium;
    }
  }

  String _statusLabel(String status) {
    switch (status) {
      case 'assigned':
        return 'Đã giao';
      case 'in_progress':
        return 'Đang thực hiện';
      case 'completed':
        return 'Hoàn thành';
      case 'verified':
        return 'Đã xác minh';
      default:
        return status;
    }
  }
}

class TaskTypeIcon extends StatelessWidget {
  final String type;
  final double size;

  const TaskTypeIcon({super.key, required this.type, this.size = 24});

  @override
  Widget build(BuildContext context) {
    final iconCode = AppConstants.taskTypeIcons[type];
    final color = _typeColor(type);
    return Icon(
      iconCode != null ? IconData(iconCode, fontFamily: 'MaterialIcons') : Icons.assignment,
      size: size,
      color: color,
    );
  }

  Color _typeColor(String type) {
    switch (type) {
      case 'patrol':
        return ForestColor.forest600;
      case 'observation':
        return const Color(0xFF0284C7);
      case 'fire_check':
        return StatusColor.critical;
      case 'boundary_survey':
        return StatusColor.medium;
      case 'species_count':
        return const Color(0xFF7C3AED);
      case 'evidence_collection':
        return StatusColor.high;
      default:
        return ForestColor.forest600;
    }
  }
}

class ProofUploadSection extends StatelessWidget {
  final String taskId;

  const ProofUploadSection({super.key, required this.taskId});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        _captureButton(context, Icons.camera_alt, 'Chụp ảnh', const Color(0xFF0284C7)),
        const SizedBox(width: 8),
        _captureButton(context, Icons.videocam, 'Quay video', StatusColor.critical),
        const SizedBox(width: 8),
        _captureButton(context, Icons.mic, 'Ghi âm', StatusColor.medium),
        const SizedBox(width: 8),
        _captureButton(context, Icons.photo_library, 'Thư viện', ForestColor.forest600),
      ],
    );
  }

  Widget _captureButton(BuildContext context, IconData icon, String label, Color color) {
    return Expanded(
      child: InkWell(
        onTap: () {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('$label - Đang phát triển')),
          );
        },
        borderRadius: BorderRadius.circular(10),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            color: color.withOpacity(0.08),
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: color.withOpacity(0.3)),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(icon, color: color, size: 22),
              const SizedBox(height: 4),
              Text(
                label,
                style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: color),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class ProofListItem extends StatelessWidget {
  final String proofId;
  final VoidCallback onTap;

  const ProofListItem({
    super.key,
    required this.proofId,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return ListTile(
      dense: true,
      leading: Container(
        width: 40,
        height: 40,
        decoration: BoxDecoration(
          color: ForestColor.forest100,
          borderRadius: BorderRadius.circular(8),
        ),
        child: const Icon(Icons.description_outlined, color: ForestColor.forest600, size: 20),
      ),
      title: Text(
        proofId,
        style: const TextStyle(fontSize: 13),
      ),
      subtitle: const Text(
        'Đã đồng bộ',
        style: TextStyle(fontSize: 11, color: StatusColor.low),
      ),
      trailing: const Icon(Icons.chevron_right, size: 18),
      onTap: onTap,
    );
  }
}
