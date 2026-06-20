import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:uuid/uuid.dart';

import '../../../../core/constants/app_constants.dart';
import '../../../../core/network/api_client.dart';
import '../../../../core/storage/local_database.dart';
import '../../../../core/storage/sync_manager.dart';

part 'biodiversity_event.dart';
part 'biodiversity_state.dart';

/// BLoC managing biodiversity species list and observation recording.
///
/// Loads species from local database first, then attempts API fetch when online.
/// Falls back to mock species data for first launch without server.
/// Observations are saved to local SQLite and queued for sync via SyncManager.
class BiodiversityBloc extends Bloc<BiodiversityEvent, BiodiversityState> {
  final ApiClient _apiClient = ApiClient.instance;
  final LocalDatabase _localDb = LocalDatabase.instance;
  final SyncManager _syncManager = SyncManager.instance;
  final Uuid _uuid = const Uuid();

  BiodiversityBloc() : super(const BiodiversityInitial()) {
    on<LoadBiodiversity>(_onLoadBiodiversity);
    on<RefreshBiodiversity>(_onRefreshBiodiversity);
    on<FilterBiodiversity>(_onFilterBiodiversity);
    on<SearchBiodiversity>(_onSearchBiodiversity);
    on<AddObservation>(_onAddObservation);
  }

  Future<void> _onLoadBiodiversity(
    LoadBiodiversity event,
    Emitter<BiodiversityState> emit,
  ) async {
    emit(const BiodiversityLoading());
    try {
      final species = await _loadSpeciesData();
      emit(BiodiversityLoaded(species: species));
    } catch (e) {
      emit(BiodiversityError(message: 'Không thể tải dữ liệu đa dạng sinh học: $e'));
    }
  }

  Future<void> _onRefreshBiodiversity(
    RefreshBiodiversity event,
    Emitter<BiodiversityState> emit,
  ) async {
    try {
      final species = await _loadSpeciesData(forceApi: true);
      final currentState = state;
      if (currentState is BiodiversityLoaded) {
        emit(currentState.copyWith(species: species));
      } else {
        emit(BiodiversityLoaded(species: species));
      }
    } catch (e) {
      emit(BiodiversityError(message: 'Không thể làm mới: $e'));
    }
  }

  Future<void> _onFilterBiodiversity(
    FilterBiodiversity event,
    Emitter<BiodiversityState> emit,
  ) async {
    final currentState = state;
    if (currentState is BiodiversityLoaded) {
      emit(currentState.copyWith(filterCategory: event.category));
    }
  }

  Future<void> _onSearchBiodiversity(
    SearchBiodiversity event,
    Emitter<BiodiversityState> emit,
  ) async {
    final currentState = state;
    if (currentState is BiodiversityLoaded) {
      emit(currentState.copyWith(searchQuery: event.query));
    }
  }

  Future<void> _onAddObservation(
    AddObservation event,
    Emitter<BiodiversityState> emit,
  ) async {
    try {
      final observationId = _uuid.v4();
      final now = DateTime.now().toUtc().toIso8601String();

      final observation = {
        'id': observationId,
        'patrol_id': event.patrolId,
        'obs_type': 'biodiversity',
        'description': '${event.speciesId}: ${event.notes}',
        'photo_path': event.photoPath,
        'latitude': event.latitude,
        'longitude': event.longitude,
        'accuracy': null,
        'recorded_at': now,
        'sync_status': 'pending',
      };

      // Save to local SQLite
      await _localDb.insertObservation(observation);

      // Queue for sync
      await _syncManager.queueForSync(
        'field_observations',
        observationId,
        'create',
        observation,
      );

      emit(ObservationAdded(speciesId: event.speciesId, observationId: observationId));

      // Re-emit loaded state after brief ObservationAdded
      final species = await _loadSpeciesData();
      emit(BiodiversityLoaded(species: species));
    } catch (e) {
      emit(BiodiversityError(message: 'Không thể lưu quan sát: $e'));
    }
  }

  /// Load species data: try local DB first, then API, then mock fallback
  Future<List<Map<String, dynamic>>> _loadSpeciesData({bool forceApi = false}) async {
    List<Map<String, dynamic>> species = [];

    if (!forceApi) {
      // Try loading observations of type biodiversity from local DB
      final localObservations = await _localDb.getObservationsByType('biodiversity');
      if (localObservations.isNotEmpty) {
        // Extract unique species from observations
        final speciesMap = <String, Map<String, dynamic>>{};
        for (final obs in localObservations) {
          final desc = obs['description'] as String? ?? '';
          final speciesId = desc.split(':').first.trim();
          if (!speciesMap.containsKey(speciesId)) {
            speciesMap[speciesId] = _speciesFromObservation(obs);
          }
        }
        species = speciesMap.values.toList();
      }
    }

    // Try API fetch when online
    try {
      final isOnline = await _apiClient.isConnected();
      if (isOnline) {
        final response = await _apiClient.get('/api/v1/biodiversity/species');
        final data = response.data as List<dynamic>;
        final apiSpecies = data.map((e) => e as Map<String, dynamic>).toList();
        if (apiSpecies.isNotEmpty) {
          return apiSpecies;
        }
      }
    } catch (_) {
      // API failed, continue with local or mock
    }

    // Fallback to mock data if nothing else available
    if (species.isEmpty) {
      species = _getMockSpecies();
    }

    return species;
  }

  /// Convert an observation record to a species summary map
  Map<String, dynamic> _speciesFromObservation(Map<String, dynamic> obs) {
    final desc = obs['description'] as String? ?? '';
    final parts = desc.split(':');
    return {
      'id': parts.isNotEmpty ? parts.first.trim() : 'unknown',
      'name_vi': 'Loài đã quan sát',
      'scientific_name': '',
      'common_name': '',
      'iucn_status': AppConstants.conservationLC,
      'category': 'animal',
      'observation_count': 1,
      'observations': [
        {
          'date': obs['recorded_at'] != null
              ? (obs['recorded_at'] as String).substring(0, 10)
              : '',
          'location': 'GPS',
          'count': 1,
        },
      ],
    };
  }

  /// Mock species data for Bu Gia Map National Park area
  static List<Map<String, dynamic>> _getMockSpecies() {
    return [
      {
        'id': 'sp_001',
        'name_vi': 'Vọoc chà vá chân nâu',
        'scientific_name': 'Pygathrix nemaeus',
        'common_name': 'Red-shanked Douc',
        'iucn_status': AppConstants.conservationCR,
        'category': 'animal',
        'observation_count': 12,
        'observations': [
          {'date': '2025-02-20', 'location': 'Lô BP-001', 'count': 3},
          {'date': '2025-01-15', 'location': 'Lô BP-003', 'count': 5},
        ],
      },
      {
        'id': 'sp_002',
        'name_vi': 'Gấu ngựa',
        'scientific_name': 'Helarctos malayanus',
        'common_name': 'Sun Bear',
        'iucn_status': AppConstants.conservationVU,
        'category': 'animal',
        'observation_count': 4,
        'observations': [
          {'date': '2025-02-10', 'location': 'Lô DN-002', 'count': 1},
        ],
      },
      {
        'id': 'sp_003',
        'name_vi': 'Cây giáng hương',
        'scientific_name': 'Pterocarpus macrocarpus',
        'common_name': 'Burmese Rosewood',
        'iucn_status': AppConstants.conservationEN,
        'category': 'plant',
        'observation_count': 28,
        'observations': [
          {'date': '2025-02-18', 'location': 'Lô LD-001', 'count': 15},
          {'date': '2025-01-25', 'location': 'Lô LD-003', 'count': 13},
        ],
      },
      {
        'id': 'sp_004',
        'name_vi': 'Trầm hương',
        'scientific_name': 'Aquilaria crassna',
        'common_name': 'Agarwood',
        'iucn_status': AppConstants.conservationCR,
        'category': 'medicinal',
        'observation_count': 6,
        'observations': [
          {'date': '2025-02-05', 'location': 'Lô DL-002', 'count': 2},
        ],
      },
      {
        'id': 'sp_005',
        'name_vi': 'Voọc bạc Đông Dương',
        'scientific_name': 'Trachypithecus germaini',
        'common_name': 'Indochinese Silvered Langur',
        'iucn_status': AppConstants.conservationEN,
        'category': 'animal',
        'observation_count': 8,
        'observations': [
          {'date': '2025-02-15', 'location': 'Lô CM-001', 'count': 4},
        ],
      },
      {
        'id': 'sp_006',
        'name_vi': 'Cây sao đen',
        'scientific_name': 'Dalbergia oliveri',
        'common_name': 'Burmese Rosewood',
        'iucn_status': AppConstants.conservationEN,
        'category': 'plant',
        'observation_count': 15,
        'observations': [
          {'date': '2025-02-12', 'location': 'Lô BP-002', 'count': 8},
        ],
      },
      {
        'id': 'sp_007',
        'name_vi': 'Ba kích',
        'scientific_name': 'Morinda officinalis',
        'common_name': 'Indian Mulberry',
        'iucn_status': AppConstants.conservationNT,
        'category': 'medicinal',
        'observation_count': 22,
        'observations': [
          {'date': '2025-02-08', 'location': 'Lô LD-002', 'count': 10},
        ],
      },
      {
        'id': 'sp_008',
        'name_vi': 'Hổ Đông Dương',
        'scientific_name': 'Panthera tigris corbetti',
        'common_name': 'Indochinese Tiger',
        'iucn_status': AppConstants.conservationEN,
        'category': 'animal',
        'observation_count': 1,
        'observations': [
          {'date': '2024-12-20', 'location': 'Lô DN-005', 'count': 1},
        ],
      },
    ];
  }
}
