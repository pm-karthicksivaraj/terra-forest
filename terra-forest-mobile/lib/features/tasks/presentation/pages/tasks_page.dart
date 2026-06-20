import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/constants/app_constants.dart';
import '../bloc/tasks_bloc.dart';
import '../widgets/tasks_widgets.dart';
import 'task_detail_page.dart';

class TasksPage extends StatelessWidget {
  const TasksPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Nhiệm vụ'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () {
              context.read<TasksBloc>().add(const LoadTasks());
            },
          ),
        ],
      ),
      body: Column(
        children: [
          const _TaskFilterTabs(),
          Expanded(
            child: BlocConsumer<TasksBloc, TasksState>(
              listener: (context, state) {
                if (state is TasksError) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text(state.message)),
                  );
                }
              },
              builder: (context, state) {
                if (state is TasksLoading) {
                  return const Center(child: CircularProgressIndicator());
                }

                if (state is TasksLoaded) {
                  final filteredTasks = state.filteredTasks;

                  if (filteredTasks.isEmpty) {
                    return Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.assignment_outlined,
                            size: 64,
                            color: Colors.grey[400],
                          ),
                          const SizedBox(height: 16),
                          const Text(
                            'Không có nhiệm vụ nào',
                            style: TextStyle(
                              color: Colors.grey,
                              fontSize: 16,
                            ),
                          ),
                        ],
                      ),
                    );
                  }

                  return RefreshIndicator(
                    onRefresh: () async {
                      context.read<TasksBloc>().add(const LoadTasks());
                    },
                    child: ListView.separated(
                      padding: const EdgeInsets.all(16),
                      itemCount: filteredTasks.length,
                      separatorBuilder: (_, __) => const SizedBox(height: 8),
                      itemBuilder: (context, index) {
                        final task = filteredTasks[index];
                        return TaskCard(
                          task: task,
                          onTap: () {
                            Navigator.of(context).push(
                              MaterialPageRoute(
                                builder: (_) => TaskDetailPage(task: task),
                              ),
                            );
                          },
                        );
                      },
                    ),
                  );
                }

                return const SizedBox.shrink();
              },
            ),
          ),
        ],
      ),
    );
  }
}

class _TaskFilterTabs extends StatelessWidget {
  const _TaskFilterTabs();

  @override
  Widget build(BuildContext context) {
    final state = context.watch<TasksBloc>().state;
    final currentFilter = state is TasksLoaded ? state.filterStatus : null;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Row(
          children: [
            _filterChip(context, null, 'Tất cả', currentFilter),
            const SizedBox(width: 6),
            _filterChip(context, 'assigned', 'Đã giao', currentFilter),
            const SizedBox(width: 6),
            _filterChip(context, 'in_progress', 'Đang thực hiện', currentFilter),
            const SizedBox(width: 6),
            _filterChip(context, 'completed', 'Đã hoàn thành', currentFilter),
            const SizedBox(width: 6),
            _filterChip(context, 'verified', 'Đã xác minh', currentFilter),
          ],
        ),
      ),
    );
  }

  Widget _filterChip(BuildContext context, String? status, String label, String? current) {
    final isSelected = current == status || (current == null && status == null);
    return FilterChip(
      selected: isSelected,
      label: Text(label, style: const TextStyle(fontSize: 12)),
      onSelected: (_) {
        context.read<TasksBloc>().add(FilterTasks(
              status: isSelected ? '' : status,
            ));
      },
    );
  }
}
