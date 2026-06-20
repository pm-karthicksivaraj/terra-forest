import 'dart:async';

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'package:terra_forest_mobile/features/auth/presentation/bloc/auth_bloc.dart';
import 'package:terra_forest_mobile/features/auth/presentation/bloc/auth_state.dart';
import 'package:terra_forest_mobile/features/auth/presentation/pages/login_page.dart';
import 'package:terra_forest_mobile/features/auth/presentation/pages/splash_page.dart';
import 'package:terra_forest_mobile/features/auth/presentation/pages/sos_page.dart';
import 'package:terra_forest_mobile/features/auth/presentation/pages/profile_page.dart';
import 'package:terra_forest_mobile/features/home/presentation/pages/home_page.dart';
import 'package:terra_forest_mobile/features/map/presentation/pages/map_page.dart';
import 'package:terra_forest_mobile/features/patrol/presentation/pages/patrol_list_page.dart';
import 'package:terra_forest_mobile/features/patrol/presentation/pages/patrol_detail_page.dart';
import 'package:terra_forest_mobile/features/alerts/presentation/pages/alerts_page.dart';
import 'package:terra_forest_mobile/features/alerts/presentation/pages/alert_detail_page.dart';
import 'package:terra_forest_mobile/features/tasks/presentation/pages/tasks_page.dart';
import 'package:terra_forest_mobile/features/tasks/presentation/pages/task_detail_page.dart';
import 'package:terra_forest_mobile/features/evidence/presentation/pages/evidence_page.dart';
import 'package:terra_forest_mobile/features/evidence/presentation/pages/evidence_capture_page.dart';
import 'package:terra_forest_mobile/features/evidence/presentation/pages/evidence_upload_page.dart';
import 'package:terra_forest_mobile/features/devices/presentation/pages/devices_page.dart';
import 'package:terra_forest_mobile/features/settings/presentation/pages/settings_page.dart';
import 'package:terra_forest_mobile/features/biodiversity/presentation/pages/biodiversity_page.dart';
import 'package:terra_forest_mobile/features/fire_weather/presentation/pages/fire_weather_page.dart';
import 'package:terra_forest_mobile/features/ota/presentation/pages/ota_page.dart';
import 'package:terra_forest_mobile/features/data_collection/presentation/pages/tree_measurement_page.dart';
import 'package:terra_forest_mobile/features/data_collection/presentation/pages/violation_report_page.dart';

/// Navigation item configuration for role-based bottom navigation
class NavItem {
  final String path;
  final IconData icon;
  final IconData activeIcon;
  final String label;

  const NavItem({
    required this.path,
    required this.icon,
    required this.activeIcon,
    required this.label,
  });
}

/// Role-based navigation configuration
/// Role names must match the database: admin, analyst, gov_viewer, field_officer
class RoleNavConfig {
  static const _navItems = <String, List<NavItem>>{
    'field_officer': [
      NavItem(path: '/home', icon: Icons.home_outlined, activeIcon: Icons.home, label: 'Trang chủ'),
      NavItem(path: '/map', icon: Icons.map_outlined, activeIcon: Icons.map, label: 'Bản đồ'),
      NavItem(path: '/patrol', icon: Icons.directions_walk_outlined, activeIcon: Icons.directions_walk, label: 'Tuần tra'),
      NavItem(path: '/alerts', icon: Icons.notifications_outlined, activeIcon: Icons.notifications, label: 'Cảnh báo'),
      NavItem(path: '/profile', icon: Icons.person_outline, activeIcon: Icons.person, label: 'Hồ sơ'),
    ],
    'analyst': [
      NavItem(path: '/home', icon: Icons.home_outlined, activeIcon: Icons.home, label: 'Trang chủ'),
      NavItem(path: '/map', icon: Icons.map_outlined, activeIcon: Icons.map, label: 'Bản đồ'),
      NavItem(path: '/patrol', icon: Icons.directions_walk_outlined, activeIcon: Icons.directions_walk, label: 'Tuần tra'),
      NavItem(path: '/tasks', icon: Icons.assignment_outlined, activeIcon: Icons.assignment, label: 'Nhiệm vụ'),
      NavItem(path: '/evidence', icon: Icons.folder_outlined, activeIcon: Icons.folder, label: 'Bằng chứng'),
      NavItem(path: '/alerts', icon: Icons.notifications_outlined, activeIcon: Icons.notifications, label: 'Cảnh báo'),
      NavItem(path: '/profile', icon: Icons.person_outline, activeIcon: Icons.person, label: 'Hồ sơ'),
    ],
    'admin': [
      NavItem(path: '/home', icon: Icons.home_outlined, activeIcon: Icons.home, label: 'Trang chủ'),
      NavItem(path: '/map', icon: Icons.map_outlined, activeIcon: Icons.map, label: 'Bản đồ'),
      NavItem(path: '/alerts', icon: Icons.notifications_outlined, activeIcon: Icons.notifications, label: 'Cảnh báo'),
      NavItem(path: '/devices', icon: Icons.devices_outlined, activeIcon: Icons.devices, label: 'Thiết bị'),
      NavItem(path: '/settings', icon: Icons.settings_outlined, activeIcon: Icons.settings, label: 'Cài đặt'),
      NavItem(path: '/profile', icon: Icons.person_outline, activeIcon: Icons.person, label: 'Hồ sơ'),
    ],
    'gov_viewer': [
      NavItem(path: '/home', icon: Icons.home_outlined, activeIcon: Icons.home, label: 'Trang chủ'),
      NavItem(path: '/map', icon: Icons.map_outlined, activeIcon: Icons.map, label: 'Bản đồ'),
      NavItem(path: '/evidence', icon: Icons.folder_outlined, activeIcon: Icons.folder, label: 'Bằng chứng'),
      NavItem(path: '/alerts', icon: Icons.notifications_outlined, activeIcon: Icons.notifications, label: 'Cảnh báo'),
      NavItem(path: '/profile', icon: Icons.person_outline, activeIcon: Icons.person, label: 'Hồ sơ'),
    ],
  };

  /// Get navigation items for a specific role
  static List<NavItem> getNavItems(String role) {
    return _navItems[role] ?? _navItems['field_officer']!;
  }

  /// Get all primary role names
  static List<String> get roles => _navItems.keys.toList();
}

/// Bottom navigation shell that wraps authenticated routes
class BottomNavigationShell extends StatelessWidget {
  final StatefulNavigationShell navigationShell;
  const BottomNavigationShell({super.key, required this.navigationShell});

  @override
  Widget build(BuildContext context) {
    final authState = context.watch<AuthBloc>().state;
    final user = authState is AuthAuthenticated ? authState.user : null;
    final primaryRole = user?.roles.isNotEmpty == true ? user!.roles.first.name : 'field_officer';
    final navItems = RoleNavConfig.getNavItems(primaryRole);

    return Scaffold(
      body: navigationShell,
      bottomNavigationBar: NavigationBar(
        selectedIndex: _calculateSelectedIndex(context, navItems),
        destinations: navItems.map((item) {
          return NavigationDestination(
            icon: Icon(item.icon),
            selectedIcon: Icon(item.activeIcon),
            label: item.label,
          );
        }).toList(),
        onDestinationSelected: (index) {
          navigationShell.goBranch(
            _findBranchIndex(targetPath: navItems[index].path, navItems: navItems),
          );
        },
      ),
      floatingActionButton: _buildSosButton(context),
    );
  }

  int _calculateSelectedIndex(BuildContext context, List<NavItem> navItems) {
    final currentPath = GoRouterState.of(context).matchedLocation;
    for (int i = 0; i < navItems.length; i++) {
      if (currentPath.startsWith(navItems[i].path)) {
        return i;
      }
    }
    return 0;
  }

  int _findBranchIndex({required String targetPath, required List<NavItem> navItems}) {
    for (int i = 0; i < navItems.length; i++) {
      if (navItems[i].path == targetPath) {
        return i;
      }
    }
    return 0;
  }

  Widget? _buildSosButton(BuildContext context) {
    return FloatingActionButton.small(
      heroTag: 'sos',
      backgroundColor: Colors.red,
      foregroundColor: Colors.white,
      child: const Icon(Icons.emergency),
      onPressed: () => context.go('/sos'),
    );
  }
}

/// Custom transition page with slide animation for forward navigation
CustomTransitionPage<void> _slideTransition({
  required GoRouterState state,
  required Widget child,
}) {
  return CustomTransitionPage<void>(
    key: state.pageKey,
    child: child,
    transitionsBuilder: (context, animation, secondaryAnimation, child) {
      final tween = Tween(begin: const Offset(1.0, 0.0), end: Offset.zero)
          .chain(CurveTween(curve: Curves.easeInOutCubic));
      return SlideTransition(position: animation.drive(tween), child: child);
    },
  );
}

/// Auth guard redirect logic
String? _authGuardRedirect(GoRouterState state, AuthState authState) {
  final path = state.matchedLocation;
  final isLoginRoute = path == '/login';
  final isSplashRoute = path == '/splash';
  final isSosRoute = path == '/sos';

  // Deep link redirect: /alert/:id -> /alerts/:id, /task/:id -> /tasks/:id
  if (path.startsWith('/alert/')) {
    final id = path.split('/').last;
    return '/alerts/$id';
  }
  if (path.startsWith('/task/')) {
    final id = path.split('/').last;
    return '/tasks/$id';
  }

  // --- Auth state is determined: navigate away from splash/login ---

  if (authState is AuthAuthenticated) {
    if (isSplashRoute) return '/home';
    if (isLoginRoute) return '/home';
    return null; // allow all other routes
  }

  if (authState is AuthUnauthenticated || authState is AuthError || authState is BiometricNotAvailable) {
    if (isSplashRoute) return '/login';
    if (isLoginRoute) return null;
    if (isSosRoute) return null;  // SOS is always accessible
    return '/login';
  }

  // --- Auth state still loading/initial: stay on current page ---
  if (authState is AuthLoading || authState is AuthInitial) {
    if (isLoginRoute) return null;
    if (isSplashRoute) return null;
    if (isSosRoute) return null;
    return '/splash';
  }

  // Fallback
  if (isSplashRoute || isSosRoute) return null;
  return '/splash';
}

/// Global router key for navigation without context
final rootNavigatorKey = GlobalKey<NavigatorState>();
final shellNavigatorKey = GlobalKey<NavigatorState>();

/// Create the app router with auth guard — all real feature pages wired in
GoRouter createAppRouter(AuthBloc authBloc) {
  return GoRouter(
    navigatorKey: rootNavigatorKey,
    initialLocation: '/splash',
    debugLogDiagnostics: true,
    refreshListenable: _GoRouterRefreshStream(authBloc.stream),
    redirect: (context, state) {
      final authState = authBloc.state;
      return _authGuardRedirect(state, authState);
    },
    routes: [
      // Splash route - outside shell
      GoRoute(
        path: '/splash',
        builder: (context, state) => const SplashPage(),
      ),

      // Login route - outside shell
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginPage(),
      ),

      // SOS route - outside shell, accessible without auth
      GoRoute(
        path: '/sos',
        builder: (context, state) => const SosPage(),
      ),

      // Main authenticated shell with bottom navigation
      StatefulShellRoute.indexedStack(
        builder: (context, state, navigationShell) {
          return BottomNavigationShell(navigationShell: navigationShell);
        },
        branches: [
          // ═══════════════════════════════════════════════════════════
          // Home branch — Dashboard with KPIs, alerts, tasks, weather
          // ═══════════════════════════════════════════════════════════
          StatefulShellBranch(
            navigatorKey: shellNavigatorKey,
            routes: [
              GoRoute(
                path: '/home',
                builder: (context, state) => const HomePage(),
                routes: [
                  GoRoute(
                    path: 'biodiversity',
                    pageBuilder: (context, state) => _slideTransition(
                      state: state,
                      child: const BiodiversityPage(),
                    ),
                  ),
                  GoRoute(
                    path: 'fire-weather',
                    pageBuilder: (context, state) => _slideTransition(
                      state: state,
                      child: const FireWeatherPage(),
                    ),
                  ),
                  GoRoute(
                    path: 'tree-measurement',
                    pageBuilder: (context, state) => _slideTransition(
                      state: state,
                      child: const TreeMeasurementPage(),
                    ),
                  ),
                  GoRoute(
                    path: 'violation-report',
                    pageBuilder: (context, state) => _slideTransition(
                      state: state,
                      child: const ViolationReportPage(),
                    ),
                  ),
                ],
              ),
            ],
          ),

          // ═══════════════════════════════════════════════════════════
          // Map branch — Forest map with plots, geofences, GPS
          // ═══════════════════════════════════════════════════════════
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/map',
                builder: (context, state) => const MapPage(),
              ),
            ],
          ),

          // ═══════════════════════════════════════════════════════════
          // Patrol branch — Start/stop patrols, GPS tracking, observations
          // ═══════════════════════════════════════════════════════════
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/patrol',
                builder: (context, state) => const PatrolListPage(),
                routes: [
                  GoRoute(
                    path: ':id',
                    pageBuilder: (context, state) {
                      final patrolId = state.pathParameters['id']!;
                      return _slideTransition(
                        state: state,
                        child: PatrolDetailPage(patrolId: patrolId),
                      );
                    },
                  ),
                ],
              ),
            ],
          ),

          // ═══════════════════════════════════════════════════════════
          // Tasks branch — Assigned tasks with status management
          // ═══════════════════════════════════════════════════════════
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/tasks',
                builder: (context, state) => const TasksPage(),
                routes: [
                  GoRoute(
                    path: ':id',
                    pageBuilder: (context, state) {
                      // Task detail requires the task object — pass via extra
                      final task = state.extra;
                      if (task != null) {
                        return _slideTransition(
                          state: state,
                          child: TaskDetailPage(task: task as dynamic),
                        );
                      }
                      // Fallback: show tasks list if no task data
                      return _slideTransition(
                        state: state,
                        child: const TasksPage(),
                      );
                    },
                  ),
                ],
              ),
            ],
          ),

          // ═══════════════════════════════════════════════════════════
          // Evidence branch — Capture & upload evidence for tasks
          // ═══════════════════════════════════════════════════════════
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/evidence',
                builder: (context, state) {
                  // Evidence page requires a taskId — use empty string as default
                  final taskId = state.uri.queryParameters['taskId'] ?? '';
                  return EvidencePage(taskId: taskId);
                },
                routes: [
                  GoRoute(
                    path: 'capture',
                    pageBuilder: (context, state) => _slideTransition(
                      state: state,
                      child: const EvidenceCapturePage(),
                    ),
                  ),
                  GoRoute(
                    path: 'upload',
                    pageBuilder: (context, state) {
                      final taskId = state.uri.queryParameters['taskId'] ?? '';
                      return _slideTransition(
                        state: state,
                        child: EvidenceUploadPage(taskId: taskId),
                      );
                    },
                  ),
                ],
              ),
            ],
          ),

          // ═══════════════════════════════════════════════════════════
          // Alerts branch — Forest alerts with severity, acknowledge
          // ═══════════════════════════════════════════════════════════
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/alerts',
                builder: (context, state) => const AlertsPage(),
                routes: [
                  GoRoute(
                    path: ':id',
                    pageBuilder: (context, state) {
                      // Alert detail requires the alert map — pass via extra
                      final alert = state.extra;
                      if (alert != null) {
                        return _slideTransition(
                          state: state,
                          child: AlertDetailPage(alert: alert as Map<String, dynamic>),
                        );
                      }
                      // Fallback: show alerts list if no alert data
                      return _slideTransition(
                        state: state,
                        child: const AlertsPage(),
                      );
                    },
                  ),
                ],
              ),
            ],
          ),

          // ═══════════════════════════════════════════════════════════
          // Devices branch — Device management (for system_admin)
          // ═══════════════════════════════════════════════════════════
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/devices',
                builder: (context, state) => const DevicesPage(),
              ),
            ],
          ),

          // ═══════════════════════════════════════════════════════════
          // Settings branch — App settings & OTA (for system_admin)
          // ═══════════════════════════════════════════════════════════
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/settings',
                builder: (context, state) => const SettingsPage(),
                routes: [
                  GoRoute(
                    path: 'ota',
                    pageBuilder: (context, state) => _slideTransition(
                      state: state,
                      child: const OtaPage(),
                    ),
                  ),
                ],
              ),
            ],
          ),

          // ═══════════════════════════════════════════════════════════
          // Profile branch — User info, sync status, offline data, logout
          // ═══════════════════════════════════════════════════════════
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/profile',
                builder: (context, state) => const ProfilePage(),
              ),
            ],
          ),
        ],
      ),
    ],

    errorBuilder: (context, state) => Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, size: 64, color: Colors.red),
            const SizedBox(height: 16),
            Text(
              'Không tìm thấy trang',
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            const SizedBox(height: 8),
            Text(
              '${state.error}',
              style: Theme.of(context).textTheme.bodyMedium,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            FilledButton.icon(
              onPressed: () => context.go('/home'),
              icon: const Icon(Icons.home),
              label: const Text('Về trang chủ'),
            ),
          ],
        ),
      ),
    ),
  );
}

/// Helper class to convert Bloc stream into Listenable for GoRouter
class _GoRouterRefreshStream extends ChangeNotifier {
  _GoRouterRefreshStream(Stream<dynamic> stream) {
    _subscription = stream.listen(
      (_) => notifyListeners(),
      onError: (_) => notifyListeners(),
    );
  }

  late final StreamSubscription<dynamic> _subscription;

  @override
  void dispose() {
    _subscription.cancel();
    super.dispose();
  }
}
