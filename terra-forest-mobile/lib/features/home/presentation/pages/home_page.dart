import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../bloc/home_bloc.dart';
import '../widgets/home_widgets.dart';

/// Role-adaptive home dashboard page.
///
/// Features:
/// - Top greeting: "Xin chào, {name}" with role badge
/// - Sync status indicator (green dot=synced, orange=syncing, red=offline)
/// - KPI cards row (horizontal scroll)
/// - Quick Actions grid (2x3)
/// - Recent Alerts section (latest 3)
/// - Pending Tasks section (latest 3)
/// - Weather widget (if data available)
/// - "Dữ liệu ngoại tuyến" banner when offline
/// - Pull to refresh
class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: BlocBuilder<HomeBloc, HomeState>(
        builder: (context, state) {
          if (state is HomeLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          if (state is HomeError) {
            return _ErrorState(message: state.message);
          }

          if (state is HomeLoaded) {
            return _HomeContent(state: state);
          }

          // Initial state – trigger load
          context.read<HomeBloc>().add(HomeLoadRequested());
          return const Center(child: CircularProgressIndicator());
        },
      ),
    );
  }
}

/// Error state widget with retry button.
class _ErrorState extends StatelessWidget {
  final String message;

  const _ErrorState({required this.message});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, size: 64, color: Colors.red),
            const SizedBox(height: 16),
            Text(
              'Không thể tải dữ liệu',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 8),
            Text(
              message,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: Theme.of(context).colorScheme.onSurfaceVariant,
                  ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            FilledButton.icon(
              onPressed: () =>
                  context.read<HomeBloc>().add(HomeLoadRequested()),
              icon: const Icon(Icons.refresh),
              label: const Text('Thử lại'),
            ),
          ],
        ),
      ),
    );
  }
}

/// Main content of the home page when data is loaded.
class _HomeContent extends StatelessWidget {
  final HomeLoaded state;

  const _HomeContent({required this.state});

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: () async {
        context.read<HomeBloc>().add(RefreshHome());
      },
      child: CustomScrollView(
        slivers: [
          // ── Offline banner (if needed) ──────────────────────────────────
          if (state.isOffline)
            SliverToBoxAdapter(
              child: OfflineBanner(
                onSyncTap: () =>
                    context.read<HomeBloc>().add(SyncRequested()),
              ),
            ),

          // ── Greeting Header ─────────────────────────────────────────────
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.only(top: 16),
              child: GreetingHeader(
                userName: state.userName,
                roleLabel: state.roleLabel,
                syncStatus: state.syncStatus,
              ),
            ),
          ),

          // ── KPI Cards Row ───────────────────────────────────────────────
          SliverToBoxAdapter(
            child: _KpiCardsRow(stats: state.stats),
          ),

          // ── Quick Actions ──────────────────────────────────────────────
          SliverToBoxAdapter(
            child: _QuickActionsSection(),
          ),

          // ── Recent Alerts ──────────────────────────────────────────────
          if (state.recentAlerts.isNotEmpty)
            SliverToBoxAdapter(
              child: _AlertsSection(alerts: state.recentAlerts),
            ),

          // ── Pending Tasks ──────────────────────────────────────────────
          if (state.pendingTasks.isNotEmpty)
            SliverToBoxAdapter(
              child: _TasksSection(tasks: state.pendingTasks),
            ),

          // ── Weather Widget ─────────────────────────────────────────────
          if (state.weatherData != null)
            SliverToBoxAdapter(
              child: _WeatherSection(weather: state.weatherData!),
            ),

          // ── Bottom spacing ─────────────────────────────────────────────
          const SliverToBoxAdapter(
            child: SizedBox(height: 32),
          ),
        ],
      ),
    );
  }
}

/// Horizontal scrolling row of KPI cards.
class _KpiCardsRow extends StatelessWidget {
  final HomeStats stats;

  const _KpiCardsRow({required this.stats});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 140,
      child: ListView(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        children: [
          KpiCard(
            icon: Icons.park,
            value: _formatNumber(stats.forestArea),
            label: 'Diện tích rừng (ha)',
            color: const Color(0xFF52B788), // forest-400
            trend: '+2.1%',
            trendUp: true,
          ),
          const SizedBox(width: 12),
          KpiCard(
            icon: Icons.eco,
            value: _formatNumber(stats.carbonCredits),
            label: 'Phát hành các-bon (tCO2e)',
            color: const Color(0xFF2D6A4F), // forest-600
            trend: '+5.3%',
            trendUp: true,
          ),
          const SizedBox(width: 12),
          KpiCard(
            icon: Icons.local_fire_department,
            value: '${stats.todayAlerts}',
            label: 'Cảnh báo hôm nay',
            color: const Color(0xFFE65100), // fire-700
          ),
          const SizedBox(width: 12),
          KpiCard(
            icon: Icons.directions_walk,
            value: '${stats.activePatrols}',
            label: 'Tuần tra đang hoạt động',
            color: const Color(0xFF0277BD), // water-700
          ),
        ],
      ),
    );
  }

  String _formatNumber(double value) {
    if (value >= 1000) {
      return '${(value / 1000).toStringAsFixed(1)}k';
    }
    return value.toStringAsFixed(0);
  }
}

/// Quick actions section with a 2x3 grid.
class _QuickActionsSection extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 4, 16, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Truy cập nhanh',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
          ),
          const SizedBox(height: 12),
          QuickActionGrid(
            onMapTap: () {
              context.go('/map');
            },
            onPatrolTap: () {
              context.go('/patrol');
            },
            onTaskTap: () {
              context.go('/tasks');
            },
            onAlertTap: () {
              context.go('/alerts');
            },
            onCameraTap: () {
              context.go('/home/tree-measurement');
            },
            onSosTap: () {
              _showSosConfirmation(context);
            },
          ),
        ],
      ),
    );
  }

  void _showSosConfirmation(BuildContext context) {
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
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('SOS đã được gửi!'),
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
}

/// Recent alerts section.
class _AlertsSection extends StatelessWidget {
  final List<AlertSummary> alerts;

  const _AlertsSection({required this.alerts});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(
                'Cảnh báo gần đây',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
              ),
              const Spacer(),
              TextButton(
                onPressed: () {
                  context.go('/alerts');
                },
                child: const Text('Xem tất cả'),
              ),
            ],
          ),
          const SizedBox(height: 8),
          ...alerts.map((alert) => Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: AlertSummaryCard(
                  alert: alert,
                  onTap: () {
                    context
                        .read<HomeBloc>()
                        .add(NavigateToAlert(alertId: alert.id));
                  },
                ),
              )),
        ],
      ),
    );
  }
}

/// Pending tasks section.
class _TasksSection extends StatelessWidget {
  final List<TaskSummary> tasks;

  const _TasksSection({required this.tasks});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(
                'Nhiệm vụ đang chờ',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
              ),
              const Spacer(),
              TextButton(
                onPressed: () {
                  context.go('/tasks');
                },
                child: const Text('Xem tất cả'),
              ),
            ],
          ),
          const SizedBox(height: 8),
          ...tasks.map((task) => Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: TaskSummaryCard(
                  task: task,
                  onTap: () {
                    context
                        .read<HomeBloc>()
                        .add(NavigateToTask(taskId: task.id));
                  },
                ),
              )),
        ],
      ),
    );
  }
}

/// Weather section.
class _WeatherSection extends StatelessWidget {
  final WeatherData weather;

  const _WeatherSection({required this.weather});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Thời tiết & Cháy rừng',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
          ),
          const SizedBox(height: 8),
          WeatherWidget(weather: weather),
        ],
      ),
    );
  }
}
