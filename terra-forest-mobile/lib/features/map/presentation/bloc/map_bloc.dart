import 'dart:async';

import 'package:equatable/equatable.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../domain/models/map_models.dart';

part 'map_event.dart';
part 'map_state.dart';

/// Sentinel value for copyWith — allows distinguishing "not provided" from null.
const _unset = Object();

/// BLoC managing all map state and interactions.
class MapBloc extends Bloc<MapEvent, MapState> {
  MapBloc() : super(const MapState()) {
    on<MapLoaded>(_onMapLoaded);
    on<MapStyleLoaded>(_onMapStyleLoaded);
    on<MapLongPressed>(_onMapLongPressed);
    on<MapPolygonTapped>(_onMapPolygonTapped);
    on<MapMarkerTapped>(_onMapMarkerTapped);
    on<LocationChanged>(_onLocationChanged);
    on<ToggleLayer>(_onToggleLayer);
    on<StartDrawingPolygon>(_onStartDrawingPolygon);
    on<CancelDrawing>(_onCancelDrawing);
    on<UndoLastPoint>(_onUndoLastPoint);
    on<CompleteDrawing>(_onCompleteDrawing);
    on<DeletePolygon>(_onDeletePolygon);
    on<LoadGeofences>(_onLoadGeofences);
    on<LoadForestPlots>(_onLoadForestPlots);
    on<LoadPatrolRoute>(_onLoadPatrolRoute);
    on<SetMapCenter>(_onSetMapCenter);
    on<SearchLocation>(_onSearchLocation);
    on<EnableOfflineMode>(_onEnableOfflineMode);
    on<DownloadRegion>(_onDownloadRegion);
    on<NdviOverlayToggled>(_onNdviOverlayToggled);
  }

  int _polygonCounter = 0;

  String _generatePolygonId() {
    _polygonCounter++;
    return 'polygon_$_polygonCounter';
  }

  void _onMapLoaded(MapLoaded event, Emitter<MapState> emit) {
    emit(state.copyWith(mapReady: true));
  }

  void _onMapStyleLoaded(MapStyleLoaded event, Emitter<MapState> emit) {
    emit(state.copyWith(mapReady: true, isLoading: false));
  }

  void _onMapLongPressed(MapLongPressed event, Emitter<MapState> emit) {
    if (state.drawingMode) {
      // Add a point to the current drawing.
      final newPoints = List<LatLng>.from(state.currentDrawingPoints)
        ..add(LatLng(event.latitude, event.longitude));
      emit(state.copyWith(currentDrawingPoints: newPoints));
    }
  }

  void _onMapPolygonTapped(
      MapPolygonTapped event, Emitter<MapState> emit) {
    final polygon = state.polygons.where((p) => p.id == event.polygonId).firstOrNull;
    if (polygon != null) {
      emit(state.copyWith(
        selectedFeature: MapFeature(
          id: polygon.id,
          name: polygon.name,
          type: polygon.type.jsonValue,
          position: polygon.points.isNotEmpty ? polygon.points.first : const LatLng(0, 0),
          properties: {
            'type': polygon.type.jsonValue,
            'color': polygon.color.value.toRadixString(16),
            'points': polygon.points.length,
            'area_ha': polygon.areaHectares.toStringAsFixed(2),
          },
        ),
      ));
    }
  }

  void _onMapMarkerTapped(MapMarkerTapped event, Emitter<MapState> emit) {
    // Search forest plots for the feature.
    final plot = state.forestPlots.where((p) => p.id == event.featureId).firstOrNull;
    if (plot != null) {
      emit(state.copyWith(
        selectedFeature: MapFeature(
          id: plot.id,
          name: plot.name,
          type: 'forest_plot',
          position: plot.position,
          properties: {
            'plot_type': plot.plotType.jsonValue,
            'plot_type_label': plot.plotType.label,
            'area_ha': plot.areaHectares.toStringAsFixed(2),
          },
        ),
      ));
      return;
    }

    // Search geofences for the feature.
    final geofence = state.geofences.where((g) => g.id == event.featureId).firstOrNull;
    if (geofence != null) {
      emit(state.copyWith(
        selectedFeature: MapFeature(
          id: geofence.id,
          name: geofence.name,
          type: 'geofence',
          position: geofence.boundary.isNotEmpty
              ? geofence.boundary.first
              : const LatLng(0, 0),
          properties: {
            'is_active': geofence.isActive.toString(),
            'boundary_points': geofence.boundary.length,
          },
        ),
      ));
    }
  }

  void _onLocationChanged(LocationChanged event, Emitter<MapState> emit) {
    emit(state.copyWith(
      position: LatLng(event.latitude, event.longitude),
    ));
  }

  void _onToggleLayer(ToggleLayer event, Emitter<MapState> emit) {
    final newLayers = Map<String, bool>.from(state.layers);
    newLayers[event.layerName] = event.visible;
    emit(state.copyWith(layers: newLayers));
  }

  void _onStartDrawingPolygon(
      StartDrawingPolygon event, Emitter<MapState> emit) {
    emit(state.copyWith(
      drawingMode: true,
      currentDrawingPoints: [],
      clearSelectedFeature: true,
    ));
  }

  void _onCancelDrawing(CancelDrawing event, Emitter<MapState> emit) {
    emit(state.copyWith(
      drawingMode: false,
      currentDrawingPoints: [],
    ));
  }

  void _onUndoLastPoint(UndoLastPoint event, Emitter<MapState> emit) {
    if (state.currentDrawingPoints.isNotEmpty) {
      final newPoints = List<LatLng>.from(state.currentDrawingPoints)..removeLast();
      emit(state.copyWith(currentDrawingPoints: newPoints));
    }
  }

  void _onCompleteDrawing(CompleteDrawing event, Emitter<MapState> emit) {
    if (state.currentDrawingPoints.length < 3) return;

    final polygon = MapPolygon(
      id: _generatePolygonId(),
      name: event.name,
      type: event.type,
      points: List<LatLng>.from(state.currentDrawingPoints),
      color: event.color,
      isDrawing: false,
    );

    final newPolygons = List<MapPolygon>.from(state.polygons)..add(polygon);
    emit(state.copyWith(
      polygons: newPolygons,
      drawingMode: false,
      currentDrawingPoints: [],
    ));
  }

  void _onDeletePolygon(DeletePolygon event, Emitter<MapState> emit) {
    final newPolygons =
        state.polygons.where((p) => p.id != event.id).toList();
    emit(state.copyWith(
      polygons: newPolygons,
      clearSelectedFeature: state.selectedFeature?.id == event.id,
    ));
  }

  Future<void> _onLoadGeofences(
      LoadGeofences event, Emitter<MapState> emit) async {
    emit(state.copyWith(isLoading: true));
    try {
      // Simulate loading geofences for Bu Gia Map National Park.
      await Future.delayed(const Duration(milliseconds: 300));
      final geofences = [
        Geofence(
          id: 'gf_001',
          name: 'Khu vực lõi VQG Bù Gia Mập',
          boundary: [
            const LatLng(12.02, 107.18),
            const LatLng(12.02, 107.26),
            const LatLng(11.92, 107.26),
            const LatLng(11.92, 107.18),
          ],
          color: const Color(0xFFFF9800),
          isActive: true,
        ),
        Geofence(
          id: 'gf_002',
          name: 'Vùng đệm phía Bắc',
          boundary: [
            const LatLng(12.05, 107.15),
            const LatLng(12.05, 107.28),
            const LatLng(12.02, 107.28),
            const LatLng(12.02, 107.15),
          ],
          color: const Color(0xFF4CAF50),
          isActive: true,
        ),
        Geofence(
          id: 'gf_003',
          name: 'Vùng đệm phía Nam',
          boundary: [
            const LatLng(11.92, 107.15),
            const LatLng(11.92, 107.28),
            const LatLng(11.88, 107.28),
            const LatLng(11.88, 107.15),
          ],
          color: const Color(0xFF4CAF50),
          isActive: true,
        ),
      ];
      emit(state.copyWith(geofences: geofences, isLoading: false));
    } catch (e) {
      emit(state.copyWith(isLoading: false, error: e.toString()));
    }
  }

  Future<void> _onLoadForestPlots(
      LoadForestPlots event, Emitter<MapState> emit) async {
    emit(state.copyWith(isLoading: true));
    try {
      // Simulate loading forest plots for the national park.
      await Future.delayed(const Duration(milliseconds: 300));
      final plots = [
        ForestPlotMarker(
          id: 'fp_001',
          name: 'Lô rừng tự nhiên A1',
          plotType: ForestPlotType.natural,
          position: const LatLng(11.98, 107.20),
          areaHectares: 125.5,
        ),
        ForestPlotMarker(
          id: 'fp_002',
          name: 'Lô rừng trồng B3',
          plotType: ForestPlotType.planted,
          position: const LatLng(11.95, 107.24),
          areaHectares: 45.2,
        ),
        ForestPlotMarker(
          id: 'fp_003',
          name: 'Rừng phòng hộ C2',
          plotType: ForestPlotType.protection,
          position: const LatLng(12.00, 107.22),
          areaHectares: 210.0,
        ),
        ForestPlotMarker(
          id: 'fp_004',
          name: 'Rừng ngập mặn D1',
          plotType: ForestPlotType.mangrove,
          position: const LatLng(11.93, 107.18),
          areaHectares: 67.8,
        ),
        ForestPlotMarker(
          id: 'fp_005',
          name: 'Lô rừng tự nhiên A2',
          plotType: ForestPlotType.natural,
          position: const LatLng(11.99, 107.25),
          areaHectares: 89.3,
        ),
        ForestPlotMarker(
          id: 'fp_006',
          name: 'Lô rừng trồng B1',
          plotType: ForestPlotType.planted,
          position: const LatLng(11.96, 107.19),
          areaHectares: 55.7,
        ),
      ];
      emit(state.copyWith(forestPlots: plots, isLoading: false));
    } catch (e) {
      emit(state.copyWith(isLoading: false, error: e.toString()));
    }
  }

  Future<void> _onLoadPatrolRoute(
      LoadPatrolRoute event, Emitter<MapState> emit) async {
    emit(state.copyWith(isLoading: true));
    try {
      // Simulate loading a patrol route.
      await Future.delayed(const Duration(milliseconds: 200));
      // In a real app, this would load route points from an API.
      emit(state.copyWith(isLoading: false));
    } catch (e) {
      emit(state.copyWith(isLoading: false, error: e.toString()));
    }
  }

  void _onSetMapCenter(SetMapCenter event, Emitter<MapState> emit) {
    emit(state.copyWith(
      position: LatLng(event.latitude, event.longitude),
      zoom: event.zoom,
    ));
  }

  Future<void> _onSearchLocation(
      SearchLocation event, Emitter<MapState> emit) async {
    if (event.query.trim().isEmpty) return;
    emit(state.copyWith(isLoading: true));
    try {
      // Simulate geocoding search.
      await Future.delayed(const Duration(milliseconds: 500));
      // For demo, center on Bu Gia Map National Park area.
      if (event.query.toLowerCase().contains('bù gia mập') ||
          event.query.toLowerCase().contains('bu gia map')) {
        emit(state.copyWith(
          position: const LatLng(11.97, 107.22),
          zoom: 13.0,
          isLoading: false,
        ));
      } else {
        // Default: keep current position, just clear loading.
        emit(state.copyWith(isLoading: false));
      }
    } catch (e) {
      emit(state.copyWith(isLoading: false, error: e.toString()));
    }
  }

  void _onEnableOfflineMode(
      EnableOfflineMode event, Emitter<MapState> emit) {
    emit(state.copyWith(offlineMode: true));
  }

  Future<void> _onDownloadRegion(
      DownloadRegion event, Emitter<MapState> emit) async {
    emit(state.copyWith(downloadProgress: 0.0));
    try {
      // Simulate progressive download.
      for (int i = 1; i <= 10; i++) {
        await Future.delayed(const Duration(milliseconds: 300));
        emit(state.copyWith(downloadProgress: i / 10.0));
      }
      emit(state.copyWith(downloadProgress: 1.0));
    } catch (e) {
      emit(state.copyWith(error: e.toString(), downloadProgress: 0.0));
    }
  }

  void _onNdviOverlayToggled(
      NdviOverlayToggled event, Emitter<MapState> emit) {
    final newLayers = Map<String, bool>.from(state.layers);
    newLayers['ndvi'] = event.enabled;
    emit(state.copyWith(layers: newLayers));
  }
}
