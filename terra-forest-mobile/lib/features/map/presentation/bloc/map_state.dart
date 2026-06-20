part of 'map_bloc.dart';

/// Complete state for the map feature.
class MapState extends Equatable {
  /// Current center position of the map.
  final LatLng position;

  /// Current zoom level.
  final double zoom;

  /// Whether the map controller is ready.
  final bool mapReady;

  /// Whether data is currently loading.
  final bool isLoading;

  /// Error message, if any.
  final String? error;

  /// Layer visibility map: layer name -> visible.
  final Map<String, bool> layers;

  /// All polygons on the map (including completed and in-progress).
  final List<MapPolygon> polygons;

  /// Whether the user is in polygon drawing mode.
  final bool drawingMode;

  /// Points placed so far during the current drawing operation.
  final List<LatLng> currentDrawingPoints;

  /// Currently selected feature (marker/polygon) for detail view.
  final MapFeature? selectedFeature;

  /// All geofence zones.
  final List<Geofence> geofences;

  /// All forest plot markers.
  final List<ForestPlotMarker> forestPlots;

  /// Whether offline mode is enabled.
  final bool offlineMode;

  /// Progress of the current offline region download (0.0 to 1.0).
  final double downloadProgress;

  const MapState({
    this.position = const LatLng(11.97, 107.22),
    this.zoom = 11.0,
    this.mapReady = false,
    this.isLoading = false,
    this.error,
    this.layers = const {
      'forest_plots': true,
      'alerts': true,
      'geofences': true,
      'ndvi': false,
      'patrol_route': false,
      'observations': true,
      'fire_risk': false,
    },
    this.polygons = const [],
    this.drawingMode = false,
    this.currentDrawingPoints = const [],
    this.selectedFeature,
    this.geofences = const [],
    this.forestPlots = const [],
    this.offlineMode = false,
    this.downloadProgress = 0.0,
  });

  MapState copyWith({
    LatLng? position,
    double? zoom,
    bool? mapReady,
    bool? isLoading,
    Object? error = _unset,
    Map<String, bool>? layers,
    List<MapPolygon>? polygons,
    bool? drawingMode,
    List<LatLng>? currentDrawingPoints,
    MapFeature? selectedFeature,
    bool clearSelectedFeature = false,
    List<Geofence>? geofences,
    List<ForestPlotMarker>? forestPlots,
    bool? offlineMode,
    double? downloadProgress,
  }) {
    return MapState(
      position: position ?? this.position,
      zoom: zoom ?? this.zoom,
      mapReady: mapReady ?? this.mapReady,
      isLoading: isLoading ?? this.isLoading,
      error: error == _unset ? this.error : error as String?,
      layers: layers ?? this.layers,
      polygons: polygons ?? this.polygons,
      drawingMode: drawingMode ?? this.drawingMode,
      currentDrawingPoints: currentDrawingPoints ?? this.currentDrawingPoints,
      selectedFeature:
          clearSelectedFeature ? null : (selectedFeature ?? this.selectedFeature),
      geofences: geofences ?? this.geofences,
      forestPlots: forestPlots ?? this.forestPlots,
      offlineMode: offlineMode ?? this.offlineMode,
      downloadProgress: downloadProgress ?? this.downloadProgress,
    );
  }

  @override
  List<Object?> get props => [
        position,
        zoom,
        mapReady,
        isLoading,
        error,
        layers,
        polygons,
        drawingMode,
        currentDrawingPoints,
        selectedFeature,
        geofences,
        forestPlots,
        offlineMode,
        downloadProgress,
      ];
}
