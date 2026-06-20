part of 'map_bloc.dart';

/// Base class for all map events.
abstract class MapEvent extends Equatable {
  const MapEvent();

  @override
  List<Object?> get props => [];
}

/// Fired when the MapLibre map controller has been initialized.
class MapLoaded extends MapEvent {
  const MapLoaded();
}

/// Fired when the map style has been fully loaded.
class MapStyleLoaded extends MapEvent {
  const MapStyleLoaded();
}

/// Fired when the user long-presses on the map.
class MapLongPressed extends MapEvent {
  final double latitude;
  final double longitude;

  const MapLongPressed(this.latitude, this.longitude);

  @override
  List<Object?> get props => [latitude, longitude];
}

/// Fired when a polygon annotation is tapped.
class MapPolygonTapped extends MapEvent {
  final String polygonId;

  const MapPolygonTapped(this.polygonId);

  @override
  List<Object?> get props => [polygonId];
}

/// Fired when a feature marker is tapped.
class MapMarkerTapped extends MapEvent {
  final String featureId;

  const MapMarkerTapped(this.featureId);

  @override
  List<Object?> get props => [featureId];
}

/// Fired when the GPS location changes.
class LocationChanged extends MapEvent {
  final double latitude;
  final double longitude;
  final double accuracy;

  const LocationChanged({
    required this.latitude,
    required this.longitude,
    required this.accuracy,
  });

  @override
  List<Object?> get props => [latitude, longitude, accuracy];
}

/// Toggle visibility of a map layer.
class ToggleLayer extends MapEvent {
  final String layerName;
  final bool visible;

  const ToggleLayer(this.layerName, this.visible);

  @override
  List<Object?> get props => [layerName, visible];
}

/// Start polygon drawing mode.
class StartDrawingPolygon extends MapEvent {
  const StartDrawingPolygon();
}

/// Cancel the current drawing operation.
class CancelDrawing extends MapEvent {
  const CancelDrawing();
}

/// Remove the last point from the current drawing.
class UndoLastPoint extends MapEvent {
  const UndoLastPoint();
}

/// Complete polygon drawing with metadata.
class CompleteDrawing extends MapEvent {
  final String name;
  final PolygonType type;
  final Color color;

  const CompleteDrawing({
    required this.name,
    required this.type,
    required this.color,
  });

  @override
  List<Object?> get props => [name, type, color];
}

/// Delete a polygon by ID.
class DeletePolygon extends MapEvent {
  final String id;

  const DeletePolygon(this.id);

  @override
  List<Object?> get props => [id];
}

/// Load all geofence zones from data source.
class LoadGeofences extends MapEvent {
  const LoadGeofences();
}

/// Load all forest plot markers.
class LoadForestPlots extends MapEvent {
  const LoadForestPlots();
}

/// Load a specific patrol route.
class LoadPatrolRoute extends MapEvent {
  final String patrolId;

  const LoadPatrolRoute(this.patrolId);

  @override
  List<Object?> get props => [patrolId];
}

/// Center the map on a specific coordinate with zoom level.
class SetMapCenter extends MapEvent {
  final double latitude;
  final double longitude;
  final double zoom;

  const SetMapCenter({
    required this.latitude,
    required this.longitude,
    required this.zoom,
  });

  @override
  List<Object?> get props => [latitude, longitude, zoom];
}

/// Search for a location by query string.
class SearchLocation extends MapEvent {
  final String query;

  const SearchLocation(this.query);

  @override
  List<Object?> get props => [query];
}

/// Enable offline map tile mode.
class EnableOfflineMode extends MapEvent {
  const EnableOfflineMode();
}

/// Download a map region for offline use.
class DownloadRegion extends MapEvent {
  final GeoBounds bounds;
  final String name;

  const DownloadRegion({
    required this.bounds,
    required this.name,
  });

  @override
  List<Object?> get props => [bounds, name];
}

/// Toggle NDVI overlay on/off.
class NdviOverlayToggled extends MapEvent {
  final bool enabled;

  const NdviOverlayToggled(this.enabled);

  @override
  List<Object?> get props => [enabled];
}
