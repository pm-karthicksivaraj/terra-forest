import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../domain/entities/patrol.dart';
import '../../domain/entities/observation.dart';
import '../../domain/usecases/start_patrol.dart';
import '../../domain/usecases/complete_patrol.dart';
import '../../domain/usecases/get_patrol_list.dart';
import '../../domain/repositories/patrol_repository.dart';
import 'package:terra_forest_mobile/core/network/api_client.dart';
import 'package:terra_forest_mobile/core/storage/local_database.dart';
import 'package:terra_forest_mobile/features/patrol/data/datasources/patrol_remote_datasource.dart';
import 'package:terra_forest_mobile/features/patrol/data/datasources/patrol_local_datasource.dart';
import 'package:terra_forest_mobile/features/patrol/data/repositories/patrol_repository_impl.dart';

part 'patrol_event.dart';
part 'patrol_state.dart';

/// BLoC managing the patrol feature's state.
///
/// Handles loading patrols, starting/completing patrols,
/// adding observations, location updates, check-in/out, and SOS.
class PatrolBloc extends Bloc<PatrolEvent, PatrolState> {
  final PatrolRepository _repository;

  PatrolBloc({required PatrolRepository repository})
      : _repository = repository,
        super(PatrolInitial()) {
    on<LoadPatrols>(_onLoadPatrols);
    on<StartPatrol>(_onStartPatrol);
    on<CompletePatrol>(_onCompletePatrol);
    on<AddObservation>(_onAddObservation);
    on<LoadObservations>(_onLoadObservations);
    on<UpdateLocation>(_onUpdateLocation);
    on<PatrolCheckIn>(_onPatrolCheckIn);
    on<PatrolCheckOut>(_onPatrolCheckOut);
    on<SOSPressed>(_onSOSPressed);
  }

  /// Convenience factory that wires up all dependencies.
  factory PatrolBloc.create() {
    final apiClient = ApiClient.instance;
    final localDb = LocalDatabase.instance;
    final remoteDs = PatrolRemoteDatasource(apiClient);
    final localDs = PatrolLocalDatasource(localDb);
    final repo = PatrolRepositoryImpl(
      remoteDatasource: remoteDs,
      localDatasource: localDs,
      apiClient: apiClient,
    );
    return PatrolBloc(repository: repo);
  }

  // ─── Event Handlers ──────────────────────────────────────────────────────

  Future<void> _onLoadPatrols(
    LoadPatrols event,
    Emitter<PatrolState> emit,
  ) async {
    emit(PatrolLoading());
    try {
      final patrols = await _repository.getPatrols();
      final isOnline = await ApiClient.instance.isConnected();
      final activePatrol = patrols
          .where((p) => p.status == PatrolStatus.active)
          .firstOrNull;

      emit(PatrolsLoaded(
        patrols: patrols,
        activePatrol: activePatrol,
        statusFilter: event.statusFilter,
        isOffline: !isOnline,
      ));
    } catch (e) {
      emit(PatrolError(message: 'Không thể tải danh sách tuần tra: $e'));
    }
  }

  Future<void> _onStartPatrol(
    StartPatrol event,
    Emitter<PatrolState> emit,
  ) async {
    try {
      final createdPatrol = await _repository.startPatrol(event.patrol);

      // Reload patrols list with the new patrol
      final patrols = await _repository.getPatrols();
      emit(PatrolsLoaded(
        patrols: patrols,
        activePatrol: createdPatrol,
      ));
    } catch (e) {
      emit(PatrolError(message: 'Không thể bắt đầu tuần tra: $e'));
    }
  }

  Future<void> _onCompletePatrol(
    CompletePatrol event,
    Emitter<PatrolState> emit,
  ) async {
    try {
      await _repository.completePatrol(
        event.patrolId,
        event.routeGeojson,
      );

      // Reload patrols list
      final patrols = await _repository.getPatrols();
      emit(PatrolsLoaded(
        patrols: patrols,
        activePatrol: null,
      ));
    } catch (e) {
      emit(PatrolError(message: 'Không thể kết thúc tuần tra: $e'));
    }
  }

  Future<void> _onAddObservation(
    AddObservation event,
    Emitter<PatrolState> emit,
  ) async {
    try {
      await _repository.addObservation(event.observation);

      // If we have a current loaded state, append the observation
      if (state is PatrolsLoaded) {
        final current = state as PatrolsLoaded;
        final updatedObs = [...current.observations, event.observation];
        emit(current.copyWith(observations: updatedObs));
      }
    } catch (e) {
      emit(PatrolError(message: 'Không thể thêm quan sát: $e'));
    }
  }

  Future<void> _onLoadObservations(
    LoadObservations event,
    Emitter<PatrolState> emit,
  ) async {
    try {
      final observations =
          await _repository.getObservations(event.patrolId);

      if (state is PatrolsLoaded) {
        final current = state as PatrolsLoaded;
        emit(current.copyWith(observations: observations));
      } else {
        emit(PatrolsLoaded(
          patrols: [],
          observations: observations,
        ));
      }
    } catch (e) {
      emit(PatrolError(message: 'Không thể tải quan sát: $e'));
    }
  }

  Future<void> _onUpdateLocation(
    UpdateLocation event,
    Emitter<PatrolState> emit,
  ) async {
    if (state is PatrolsLoaded) {
      final current = state as PatrolsLoaded;
      emit(current.copyWith(
        currentLatitude: event.latitude,
        currentLongitude: event.longitude,
        currentAccuracy: event.accuracy,
      ));
    }
  }

  Future<void> _onPatrolCheckIn(
    PatrolCheckIn event,
    Emitter<PatrolState> emit,
  ) async {
    try {
      await _repository.checkIn(event.patrolId);
      emit(PatrolCheckInSuccess(patrolId: event.patrolId));
    } catch (e) {
      emit(PatrolError(message: 'Không thể điểm danh: $e'));
    }
  }

  Future<void> _onPatrolCheckOut(
    PatrolCheckOut event,
    Emitter<PatrolState> emit,
  ) async {
    try {
      await _repository.checkOut(event.patrolId);
      emit(PatrolCheckOutSuccess(patrolId: event.patrolId));
    } catch (e) {
      emit(PatrolError(message: 'Không thể kết thúc điểm danh: $e'));
    }
  }

  Future<void> _onSOSPressed(
    SOSPressed event,
    Emitter<PatrolState> emit,
  ) async {
    try {
      if (event.patrolId != null) {
        await _repository.sendSos(event.patrolId!);
      }
    } catch (e) {
      emit(PatrolError(message: 'Không thể gửi SOS: $e'));
    }
  }
}
