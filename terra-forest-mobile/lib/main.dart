import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:go_router/go_router.dart';

import 'core/theme/app_theme.dart';
import 'core/constants/app_constants.dart';
import 'core/network/api_client.dart';
import 'core/storage/local_database.dart';
import 'core/storage/sync_manager.dart';
import 'core/storage/data_seeder.dart';
import 'core/utils/app_router.dart';
import 'features/auth/data/repositories/auth_repository_impl.dart';
import 'features/auth/domain/repositories/auth_repository.dart';
import 'features/auth/presentation/bloc/auth_bloc.dart';
import 'features/auth/presentation/bloc/auth_event.dart';
import 'features/home/presentation/bloc/home_bloc.dart';
import 'features/map/presentation/bloc/map_bloc.dart';
import 'features/patrol/presentation/bloc/patrol_bloc.dart';
import 'features/alerts/presentation/bloc/alerts_bloc.dart';
import 'features/tasks/presentation/bloc/tasks_bloc.dart';
import 'features/evidence/presentation/bloc/evidence_bloc.dart';
import 'features/ota/presentation/bloc/ota_bloc.dart';
import 'l10n/generated/app_localizations.dart';

/// In-app periodic sync using Timer (no native plugin needed).
/// This runs while the app is in the foreground.
/// For true background sync, add workmanager back when Flutter >=3.32 is available.
class _SyncScheduler {
  static Timer? _syncTimer;
  static Timer? _otaTimer;

  static void start() {
    // Periodic data sync every 15 minutes
    _syncTimer?.cancel();
    _syncTimer = Timer.periodic(const Duration(minutes: 15), (_) async {
      try {
        await SyncManager.instance.performBackgroundSync();
      } catch (_) {}
    });

    // Periodic OTA check every 60 minutes
    _otaTimer?.cancel();
    _otaTimer = Timer.periodic(const Duration(minutes: 60), (_) async {
      try {
        await SyncManager.instance.checkForOtaUpdate();
      } catch (_) {}
    });
  }

  static void stop() {
    _syncTimer?.cancel();
    _syncTimer = null;
    _otaTimer?.cancel();
    _otaTimer = null;
  }
}

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize Firebase (optional — requires google-services.json on Android)
  try {
    await Firebase.initializeApp();
  } catch (e) {
    debugPrint('Firebase initialization skipped: $e');
  }

  // Initialize local database
  await LocalDatabase.instance.database;

  // Seed database with realistic forestry data on first launch
  await DataSeeder.seedIfNeeded();

  // Initialize API client
  ApiClient.instance.setBaseUrl(AppConstants.apiBaseUrl);

  // Start in-app periodic sync (no native plugin = no build issues)
  _SyncScheduler.start();

  runApp(const TerraForestApp());
}

class TerraForestApp extends StatefulWidget {
  const TerraForestApp({super.key});

  @override
  State<TerraForestApp> createState() => _TerraForestAppState();
}

class _TerraForestAppState extends State<TerraForestApp> with WidgetsBindingObserver {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _SyncScheduler.stop();
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    // Pause sync when app goes to background, resume when foregrounded
    if (state == AppLifecycleState.resumed) {
      _SyncScheduler.start();
    } else if (state == AppLifecycleState.paused) {
      _SyncScheduler.stop();
    }
  }

  @override
  Widget build(BuildContext context) {
    return MultiRepositoryProvider(
      providers: [
        RepositoryProvider<AuthRepository>(
          create: (_) => AuthRepositoryImpl(),
        ),
      ],
      child: MultiBlocProvider(
        providers: [
          BlocProvider(create: (ctx) => AuthBloc(authRepository: ctx.read<AuthRepository>())..add(const AppStarted())),
          BlocProvider(create: (_) => HomeBloc.create()),
          BlocProvider(create: (_) => MapBloc()),
          BlocProvider(create: (_) => PatrolBloc.create()),
          BlocProvider(create: (_) => AlertsBloc()),
          BlocProvider(create: (_) => TasksBloc()),
          BlocProvider(create: (_) => EvidenceBloc()),
          BlocProvider(create: (_) => OtaBloc()),
        ],
        child: const _AppView(),
      ),
    );
  }
}

/// Inner widget that creates the GoRouter ONCE.
///
/// The GoRouter uses `refreshListenable` to watch AuthBloc stream changes
/// and `redirect` to handle auth-based navigation — it does NOT need to be
/// rebuilt when auth state changes. Rebuilding it causes the router to reset
/// to `initialLocation` and destroys all page state, which is why the app
/// was stuck on the splash screen.
class _AppView extends StatefulWidget {
  const _AppView();

  @override
  State<_AppView> createState() => _AppViewState();
}

class _AppViewState extends State<_AppView> {
  late final GoRouter _router;

  @override
  void initState() {
    super.initState();
    // Create router ONCE — refreshListenable handles auth state changes
    _router = createAppRouter(context.read<AuthBloc>());
  }

  @override
  void dispose() {
    _router.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'Terra Forest',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: ThemeMode.system,
      locale: const Locale('vi'), // Vietnamese as default
      supportedLocales: AppLocalizations.supportedLocales,
      localizationsDelegates: const [
        AppLocalizations.delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      routerConfig: _router,
    );
  }
}
