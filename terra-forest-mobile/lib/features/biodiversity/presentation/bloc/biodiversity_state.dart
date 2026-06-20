import 'package:equatable/equatable.dart';

abstract class BiodiversityState extends Equatable {
  const BiodiversityState();

  @override
  List<Object?> get props => [];
}

class BiodiversityInitial extends BiodiversityState {
  const BiodiversityInitial();
}

class BiodiversityLoading extends BiodiversityState {
  const BiodiversityLoading();
}

class BiodiversityLoaded extends BiodiversityState {
  final List<Map<String, dynamic>> species;
  final String filterCategory;
  final String searchQuery;

  const BiodiversityLoaded({
    required this.species,
    this.filterCategory = 'all',
    this.searchQuery = '',
  });

  /// Apply client-side filtering based on category and search query
  List<Map<String, dynamic>> get filteredSpecies {
    var result = species;

    if (filterCategory != 'all') {
      result = result.where((s) => s['category'] == filterCategory).toList();
    }

    if (searchQuery.isNotEmpty) {
      final query = searchQuery.toLowerCase();
      result = result.where((s) {
        final viName = (s['name_vi'] as String? ?? '').toLowerCase();
        final sciName = (s['scientific_name'] as String? ?? '').toLowerCase();
        final commonName = (s['common_name'] as String? ?? '').toLowerCase();
        return viName.contains(query) || sciName.contains(query) || commonName.contains(query);
      }).toList();
    }

    return result;
  }

  BiodiversityLoaded copyWith({
    List<Map<String, dynamic>>? species,
    String? filterCategory,
    String? searchQuery,
  }) {
    return BiodiversityLoaded(
      species: species ?? this.species,
      filterCategory: filterCategory ?? this.filterCategory,
      searchQuery: searchQuery ?? this.searchQuery,
    );
  }

  @override
  List<Object?> get props => [species, filterCategory, searchQuery];
}

class BiodiversityError extends BiodiversityState {
  final String message;

  const BiodiversityError({required this.message});

  @override
  List<Object?> get props => [message];
}

class ObservationAdded extends BiodiversityState {
  final String speciesId;
  final String observationId;

  const ObservationAdded({required this.speciesId, required this.observationId});

  @override
  List<Object?> get props => [speciesId, observationId];
}
