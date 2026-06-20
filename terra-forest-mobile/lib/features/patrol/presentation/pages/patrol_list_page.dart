import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../domain/entities/patrol.dart';
import '../bloc/patrol_bloc.dart';
import '../widgets/patrol_widgets.dart';
import 'active_patrol_page.dart';
import 'patrol_detail_page.dart';

/// Page displaying a filterable list of patrols.
///
/// Features:
/// - Filter tabs: Tất cả, Đang hoạt động, Đã hoàn thành, Đã lên kế hoạch
/// - Each patrol card shows: title, leader name, start time, status badge, member count
/// - Pull to refresh
/// - FAB "Bắt đầu tuần tra" (Start Patrol)
/// - Empty state with tree illustration and "Chưa có chuyến tuần tra nào" text
/// - Offline indicator when not connected
class PatrolListPage extends StatefulWidget {
  const PatrolListPage({super.key});

  @override
  State<PatrolListPage> createState() => _PatrolListPageState();
}

class _PatrolListPageState extends State<PatrolListPage>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  static const _tabs = [
    Tab(text: 'Tất cả'),
    Tab(text: 'Đang hoạt động'),
    Tab(text: 'Đã hoàn thành'),
    Tab(text: 'Đã lên kế hoạch'),
  ];

  static const _tabStatuses = <PatrolStatus?>[
    null,
    PatrolStatus.active,
    PatrolStatus.completed,
    PatrolStatus.planned,
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: _tabs.length, vsync: this);
    _tabController.addListener(_onTabChanged);
    context.read<PatrolBloc>().add(const LoadPatrols());
  }

  void _onTabChanged() {
    if (_tabController.indexIsChanging) return;
    final status = _tabStatuses[_tabController.index];
    context.read<PatrolBloc>().add(LoadPatrols(statusFilter: status));
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Tuần tra'),
        bottom: TabBar(
          controller: _tabController,
          tabs: _tabs,
          isScrollable: true,
          labelStyle: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
          ),
          unselectedLabelStyle: const TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w400,
          ),
        ),
        actions: [
          BlocBuilder<PatrolBloc, PatrolState>(
            builder: (context, state) {
              final isOffline = state is PatrolsLoaded && state.isOffline;
              return IconButton(
                icon: Icon(
                  isOffline ? Icons.cloud_off : Icons.cloud_done,
                  color: isOffline ? Colors.orange : Colors.green,
                ),
                onPressed: () {
                  if (isOffline) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Không có kết nối mạng. Dữ liệu có thể không cập nhật.'),
                      ),
                    );
                  }
                },
              );
            },
          ),
        ],
      ),
      body: TabBarView(
        controller: _tabController,
        children: _tabStatuses.map((status) {
          return _PatrolListTabContent(statusFilter: status);
        }).toList(),
      ),
      floatingActionButton: FloatingActionButton.extended(
        heroTag: 'start_patrol_fab',
        onPressed: () => _showStartPatrolDialog(context),
        icon: const Icon(Icons.add),
        label: const Text('Bắt đầu tuần tra'),
      ),
    );
  }

  void _showStartPatrolDialog(BuildContext context) {
    final titleController = TextEditingController();
    final descController = TextEditingController();

    showDialog(
      context: context,
      builder: (dialogContext) {
        return AlertDialog(
          title: const Text('Bắt đầu tuần tra mới'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: titleController,
                decoration: const InputDecoration(
                  labelText: 'Tên chuyến tuần tra',
                  hintText: 'VD: Tuần tra Khu A1',
                  prefixIcon: Icon(Icons.edit_location_alt),
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: descController,
                decoration: const InputDecoration(
                  labelText: 'Mô tả (tuỳ chọn)',
                  hintText: 'Mô tả mục đích tuần tra',
                  prefixIcon: Icon(Icons.description),
                ),
                maxLines: 3,
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(dialogContext).pop(),
              child: const Text('Huỷ'),
            ),
            FilledButton(
              onPressed: () {
                if (titleController.text.trim().isEmpty) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Vui lòng nhập tên chuyến tuần tra')),
                  );
                  return;
                }
                context.read<PatrolBloc>().add(StartPatrol(
                      patrol: Patrol(
                        id: 'patrol_${DateTime.now().millisecondsSinceEpoch}',
                        title: titleController.text.trim(),
                        description: descController.text.trim().isEmpty
                            ? null
                            : descController.text.trim(),
                        leaderId: 'current_user',
                        startTime: DateTime.now(),
                        status: PatrolStatus.active,
                        syncStatus: SyncStatus.pending,
                      ),
                    ));
                Navigator.of(dialogContext).pop();
              },
              child: const Text('Bắt đầu'),
            ),
          ],
        );
      },
    );
  }
}

/// Inner content for a single tab showing a filtered list of patrols.
class _PatrolListTabContent extends StatelessWidget {
  final PatrolStatus? statusFilter;

  const _PatrolListTabContent({this.statusFilter});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<PatrolBloc, PatrolState>(
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
                Text(
                  state.message,
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
                const SizedBox(height: 16),
                FilledButton.icon(
                  onPressed: () => context
                      .read<PatrolBloc>()
                      .add(LoadPatrols(statusFilter: statusFilter)),
                  icon: const Icon(Icons.refresh),
                  label: const Text('Thử lại'),
                ),
              ],
            ),
          );
        }

        if (state is PatrolsLoaded) {
          final patrols = statusFilter == null
              ? state.patrols
              : state.patrols
                  .where((p) => p.status == statusFilter)
                  .toList();

          // Offline banner
          return Column(
            children: [
              if (state.isOffline)
                const OfflineBanner(message: 'Không có kết nối – hiển thị dữ liệu nội bộ'),
              Expanded(
                child: patrols.isEmpty
                    ? _EmptyPatrolState()
                    : RefreshIndicator(
                        onRefresh: () async {
                          context.read<PatrolBloc>().add(
                                LoadPatrols(statusFilter: statusFilter),
                              );
                        },
                        child: ListView.separated(
                          padding: const EdgeInsets.fromLTRB(16, 16, 16, 80),
                          itemCount: patrols.length,
                          separatorBuilder: (_, __) => const SizedBox(height: 12),
                          itemBuilder: (context, index) {
                            final patrol = patrols[index];
                            return PatrolCard(
                              patrol: patrol,
                              onTap: () {
                                if (patrol.isActive) {
                                  Navigator.of(context).push(
                                    MaterialPageRoute(
                                      builder: (_) => BlocProvider.value(
                                        value: context.read<PatrolBloc>(),
                                        child: const ActivePatrolPage(),
                                      ),
                                    ),
                                  );
                                } else {
                                  Navigator.of(context).push(
                                    MaterialPageRoute(
                                      builder: (_) => BlocProvider.value(
                                        value: context.read<PatrolBloc>(),
                                        child: PatrolDetailPage(
                                            patrolId: patrol.id),
                                      ),
                                    ),
                                  );
                                }
                              },
                            );
                          },
                        ),
                      ),
              ),
            ],
          );
        }

        return const SizedBox.shrink();
      },
    );
  }
}

/// Empty state widget shown when there are no patrols.
class _EmptyPatrolState extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.park_outlined,
              size: 80,
              color: Theme.of(context).colorScheme.primary.withOpacity(0.3),
            ),
            const SizedBox(height: 16),
            Text(
              'Chưa có chuyến tuần tra nào',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    color: Theme.of(context).colorScheme.onSurfaceVariant,
                  ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              'Nhấn nút "Bắt đầu tuần tra" để tạo chuyến tuần tra mới',
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: Theme.of(context).colorScheme.onSurfaceVariant,
                  ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}
