import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/constants/app_constants.dart';
import '../../../../core/theme/app_theme.dart';
import '../../domain/entities/ranger_task.dart';
import '../bloc/tasks_bloc.dart';
import '../widgets/tasks_widgets.dart';

class TaskDetailPage extends StatelessWidget {
  final RangerTask task;

  const TaskDetailPage({super.key, required this.task});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Chi tiết nhiệm vụ'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildHeader(context),
            const SizedBox(height: 16),
            _buildDescription(context),
            const SizedBox(height: 16),
            _buildLocation(context),
            const SizedBox(height: 16),
            _buildAssignmentInfo(context),
            const SizedBox(height: 16),
            _buildStatusTimeline(context),
            const SizedBox(height: 16),
            _buildActionButtons(context),
            const SizedBox(height: 16),
            const Divider(),
            const SizedBox(height: 8),
            const Text(
              'Bằng chứng',
              style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 8),
            ProofUploadSection(taskId: task.id),
            const SizedBox(height: 8),
            _buildProofsList(context),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Theme.of(context).dividerColor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              TaskTypeIcon(type: task.taskType, size: 28),
              const SizedBox(width: 10),
              TaskPriorityBadge(priority: task.priority),
              const SizedBox(width: 8),
              TaskStatusBadge(status: task.status),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            task.title,
            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
          ),
        ],
      ),
    );
  }

  Widget _buildDescription(BuildContext context) {
    if (task.description == null || task.description!.isEmpty) {
      return const SizedBox.shrink();
    }
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Mô tả',
          style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
        ),
        const SizedBox(height: 6),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: Theme.of(context).cardColor,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: Theme.of(context).dividerColor),
          ),
          child: Text(task.description!, style: const TextStyle(fontSize: 14)),
        ),
      ],
    );
  }

  Widget _buildLocation(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Vị trí',
          style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
        ),
        const SizedBox(height: 6),
        Container(
          height: 140,
          width: double.infinity,
          decoration: BoxDecoration(
            color: ForestColor.forest100,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: ForestColor.forest300),
          ),
          child: Stack(
            children: [
              Center(
                child: Icon(
                  Icons.location_on,
                  color: Theme.of(context).colorScheme.primary,
                  size: 36,
                ),
              ),
              if (task.locationLat != null && task.locationLng != null)
                Positioned(
                  bottom: 8,
                  left: 8,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.9),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      '${task.locationLat!.toStringAsFixed(4)}, ${task.locationLng!.toStringAsFixed(4)}',
                      style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w500),
                    ),
                  ),
                ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildAssignmentInfo(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Phân công',
          style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
        ),
        const SizedBox(height: 6),
        _infoRow(context, Icons.person_outline, 'Người thực hiện', task.assignedTo ?? 'Chưa giao'),
        _infoRow(context, Icons.person_pin_outlined, 'Người tạo', task.createdBy ?? '--'),
        _infoRow(
          context,
          Icons.calendar_today_outlined,
          'Hạn hoàn thành',
          task.dueDate != null
              ? '${task.dueDate!.day.toString().padLeft(2, '0')}/${task.dueDate!.month.toString().padLeft(2, '0')}/${task.dueDate!.year}'
              : '--',
        ),
      ],
    );
  }

  Widget _infoRow(BuildContext context, IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Row(
        children: [
          Icon(icon, size: 16, color: Theme.of(context).textTheme.bodySmall?.color),
          const SizedBox(width: 8),
          SizedBox(
            width: 120,
            child: Text(
              label,
              style: TextStyle(fontSize: 13, color: Theme.of(context).textTheme.bodySmall?.color),
            ),
          ),
          Expanded(
            child: Text(value, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500)),
          ),
        ],
      ),
    );
  }

  Widget _buildStatusTimeline(BuildContext context) {
    final events = <Map<String, String>>[
      {'status': 'assigned', 'label': 'Đã giao nhiệm vụ', 'time': ''},
    ];
    if (task.status == 'in_progress' || task.status == 'completed' || task.status == 'verified') {
      events.add({'status': 'in_progress', 'label': 'Đang thực hiện', 'time': ''});
    }
    if (task.status == 'completed' || task.status == 'verified') {
      events.add({'status': 'completed', 'label': 'Đã hoàn thành', 'time': ''});
    }
    if (task.status == 'verified') {
      events.add({'status': 'verified', 'label': 'Đã xác minh', 'time': ''});
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Lịch sử trạng thái',
          style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
        ),
        const SizedBox(height: 8),
        Column(
          children: events.asMap().entries.map((entry) {
            final index = entry.key;
            final event = entry.value;
            final isLast = index == events.length - 1;
            final color = _statusColor(event['status'] ?? '');

            return IntrinsicHeight(
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Column(
                    children: [
                      Container(
                        width: 12,
                        height: 12,
                        decoration: BoxDecoration(color: color, shape: BoxShape.circle),
                      ),
                      if (!isLast)
                        Container(width: 2, height: 24, color: color.withOpacity(0.3)),
                    ],
                  ),
                  const SizedBox(width: 8),
                  Text(
                    event['label'] ?? '',
                    style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500),
                  ),
                ],
              ),
            );
          }).toList(),
        ),
      ],
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

  Widget _buildActionButtons(BuildContext context) {
    return Row(
      children: [
        if (task.status == 'assigned')
          Expanded(
            child: ElevatedButton.icon(
              onPressed: () {
                context.read<TasksBloc>().add(StartTask(id: task.id));
              },
              icon: const Icon(Icons.play_arrow),
              label: const Text('Bắt đầu'),
            ),
          ),
        if (task.status == 'in_progress')
          Expanded(
            child: ElevatedButton.icon(
              onPressed: () {
                context.read<TasksBloc>().add(CompleteTask(id: task.id));
              },
              icon: const Icon(Icons.check_circle_outline),
              label: const Text('Hoàn thành'),
            ),
          ),
        if (task.status == 'completed')
          Expanded(
            child: ElevatedButton.icon(
              onPressed: null,
              icon: const Icon(Icons.check_circle),
              label: const Text('Đã hoàn thành'),
            ),
          ),
        if (task.status == 'verified')
          Expanded(
            child: ElevatedButton.icon(
              onPressed: null,
              icon: const Icon(Icons.verified),
              label: const Text('Đã xác minh'),
            ),
          ),
      ],
    );
  }

  Widget _buildProofsList(BuildContext context) {
    if (task.proofs.isEmpty) {
      return const Padding(
        padding: EdgeInsets.symmetric(vertical: 12),
        child: Text(
          'Chưa có bằng chứng nào',
          style: TextStyle(color: Colors.grey, fontSize: 13),
        ),
      );
    }

    return Column(
      children: task.proofs.map((proofId) {
        return ProofListItem(
          proofId: proofId,
          onTap: () {},
        );
      }).toList(),
    );
  }
}
