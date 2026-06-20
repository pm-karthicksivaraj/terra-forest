import 'package:equatable/equatable.dart';

abstract class BiodiversityEvent extends Equatable {
  const BiodiversityEvent();

  @override
  List<Object?> get props => [];
}

/// Request to load species list from local DB / API
class LoadBiodiversity extends BiodiversityEvent {
  const LoadBiodiversity();
}

/// Refresh species list (force API call when online)
class RefreshBiodiversity extends BiodiversityEvent {
  const RefreshBiodiversity();
}

/// Filter species by category: 'all', 'animal', 'plant', 'medicinal'
class FilterBiodiversity extends BiodiversityEvent {
  final String category;

  const FilterBiodiversity(this.category);

  @override
  List<Object?> get props => [category];
}

/// Search species by Vietnamese name, scientific name, or common name
class SearchBiodiversity extends BiodiversityEvent {
  final String query;

  const SearchBiodiversity(this.query);

  @override
  List<Object?> get props => [query];
}

/// Add a new observation for a species (saved locally, queued for sync)
class AddObservation extends BiodiversityEvent {
  final String speciesId;
  final String patrolId;
  final double? latitude;
  final double? longitude;
  final int count;
  final String notes;
  final String? photoPath;

  const AddObservation({
    required this.speciesId,
    required this.patrolId,
    this.latitude,
    this.longitude,
    this.count = 1,
    this.notes = '',
    this.photoPath,
  });

  @override
  List<Object?> get props => [speciesId, patrolId, latitude, longitude, count, notes, photoPath];
}
