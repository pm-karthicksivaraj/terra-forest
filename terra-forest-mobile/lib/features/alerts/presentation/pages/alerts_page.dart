import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/constants/app_constants.dart';
import '../../../../core/theme/app_theme.dart';
import '../bloc/alerts_bloc.dart';
import '../widgets/alerts_widgets.dart';
import 'alert_detail_page.dart';

class AlertsPage extends StatelessWidget {
  const AlertsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Cảnh báo'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () {
              context.read<AlertsBloc>().add(const RefreshAlerts());
            },
          ),
        ],
      ),
      body: Column(
        children: [
          const AlertFilterChips(),
          Expanded(
            child: BlocConsumer<AlertsBloc, AlertsState>(
              listener: (context, state) {
                if (state is AlertsError) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text(state.message)),
                  );
                }
              },
              builder: (context, state) {
                if (state is AlertsLoading) {
                  return const Center(child: CircularProgressIndicator());
                }

                if (state is AlertsLoaded) {
                  final filteredAlerts = state.filteredAlerts;

                  if (filteredAlerts.isEmpty) {
                    return Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.notifications_none,
                            size: 64,
                            color: Colors.grey[400],
                          ),
                          const SizedBox(height: 16),
                          const Text(
                            'Không có cảnh báo nào',
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
                      context.read<AlertsBloc>().add(const RefreshAlerts());
                    },
                    child: ListView.separated(
                      padding: const EdgeInsets.all(16),
                      itemCount: filteredAlerts.length,
                      separatorBuilder: (_, __) => const SizedBox(height: 8),
                      itemBuilder: (context, index) {
                        final alert = filteredAlerts[index];
                        return AlertCard(
                          alert: alert,
                          onAcknowledge: () {
                            context.read<AlertsBloc>().add(
                                  AcknowledgeAlert(id: alert['id'] as String),
                                );
                          },
                          onTap: () {
                            Navigator.of(context).push(
                              MaterialPageRoute(
                                builder: (_) => AlertDetailPage(alert: alert),
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
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          context.read<AlertsBloc>().add(const LoadAlerts());
        },
        child: const Icon(Icons.refresh),
      ),
    );
  }
}
