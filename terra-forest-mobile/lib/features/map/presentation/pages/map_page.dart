import 'dart:math';

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart' as ll;

import '../../domain/models/map_models.dart';
import '../bloc/map_bloc.dart';
import '../widgets/map_widgets.dart';
import '../widgets/polygon_drawing_overlay.dart';

/// Complete map page for Terra Forest MRV, centered on Bu Gia Map National Park.
class MapPage extends StatelessWidget {
  const MapPage({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (context) => MapBloc()
        ..add(const LoadGeofences())
        ..add(const LoadForestPlots()),
      child: const _MapPageView(),
    );
  }
}

class _MapPageView extends StatefulWidget {
  const _MapPageView();

  @override
  State<_MapPageView> createState() => _MapPageViewState();
}

class _MapPageViewState extends State<_MapPageView> {
  final MapController _mapController = MapController();
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();

  /// Bu Gia Map National Park center.
  static const double _initialLat = 11.97;
  static const double _initialLng = 107.22;
  static const double _initialZoom = 11.0;

  @override
  void dispose() {
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      key: _scaffoldKey,
      drawer: const LayerTogglePanel(),
      endDrawer: const LayerTogglePanel(),
      body: BlocBuilder<MapBloc, MapState>(
        builder: (context, state) {
          return Stack(
            children: [
              // ── Flutter Map with OSM tiles ──
              _buildMap(state),

              // ── Polygon drawing overlay (on top of map) ──
              if (state.drawingMode)
                Positioned.fill(
                  child: PolygonDrawingOverlay(
                    drawingPoints: state.currentDrawingPoints,
                    drawingMode: state.drawingMode,
                    zoom: state.zoom,
                    centerLatitude: state.position.latitude,
                    onPointAdded: (latLng) {
                      context.read<MapBloc>().add(
                            MapLongPressed(latLng.latitude, latLng.longitude),
                          );
                    },
                    onPolygonClosed: () {
                      _showCompleteDialog(context, state);
                    },
                  ),
                ),

              // ── Search bar (top) ──
              Positioned(
                top: MediaQuery.of(context).padding.top,
                left: 0,
                right: 0,
                child: MapSearchBar(
                  onDrawerOpen: () {
                    _scaffoldKey.currentState?.openEndDrawer();
                  },
                ),
              ),

              // ── Offline mode banner ──
              Positioned(
                top: MediaQuery.of(context).padding.top + 60,
                left: 0,
                right: 0,
                child: const OfflineModeBanner(),
              ),

              // ── Offline download progress ──
              Positioned(
                top: MediaQuery.of(context).padding.top + 100,
                left: 0,
                right: 0,
                child: const OfflineDownloadProgress(),
              ),

              // ── Compass (top-right below search) ──
              Positioned(
                top: MediaQuery.of(context).padding.top + 68,
                right: 16,
                child: _CompassWidget(
                  onResetNorth: () {
                    _mapController.rotate(0);
                  },
                ),
              ),

              // ── Zoom controls (right side) ──
              Positioned(
                right: 16,
                bottom: state.drawingMode ? 200 : 160,
                child: _ZoomControls(
                  onZoomIn: () {
                    final camera = _mapController.camera;
                    _mapController.move(
                      camera.center,
                      (camera.zoom + 1).clamp(5.0, 18.0),
                    );
                  },
                  onZoomOut: () {
                    final camera = _mapController.camera;
                    _mapController.move(
                      camera.center,
                      (camera.zoom - 1).clamp(5.0, 18.0),
                    );
                  },
                ),
              ),

              // ── GPS location FAB (bottom-right) ──
              Positioned(
                right: 16,
                bottom: state.drawingMode ? 140 : 100,
                child: FloatingActionButton(
                  heroTag: 'gps_btn',
                  mini: true,
                  backgroundColor: Colors.white,
                  foregroundColor: Colors.green[700],
                  elevation: 4,
                  onPressed: () {
                    _mapController.move(
                      ll.LatLng(state.position.latitude, state.position.longitude),
                      15.0,
                    );
                  },
                  child: const Icon(Icons.my_location),
                ),
              ),

              // ── Draw polygon FAB ──
              if (!state.drawingMode)
                Positioned(
                  right: 16,
                  bottom: 52,
                  child: FloatingActionButton(
                    heroTag: 'draw_btn',
                    mini: true,
                    backgroundColor: Colors.green[700],
                    foregroundColor: Colors.white,
                    elevation: 4,
                    onPressed: () {
                      context.read<MapBloc>().add(const StartDrawingPolygon());
                    },
                    child: const Icon(Icons.edit_location_alt),
                  ),
                ),

              // ── NDVI Legend (bottom-left) ──
              if (state.layers['ndvi'] == true)
                Positioned(
                  left: 16,
                  bottom: state.drawingMode ? 160 : 52,
                  child: const NdviLegend(),
                ),

              // ── Scale bar (bottom-left) ──
              Positioned(
                left: 16,
                bottom: state.drawingMode
                    ? (state.layers['ndvi'] == true ? 260 : 160)
                    : (state.layers['ndvi'] == true ? 152 : 52),
                child: _ScaleBarWidget(zoom: state.zoom),
              ),

              // ── Drawing toolbar (bottom) ──
              Positioned(
                left: 0,
                right: 0,
                bottom: 0,
                child: const DrawingToolbar(),
              ),

              // ── Feature info bottom sheet ──
              if (state.selectedFeature != null)
                Positioned(
                  left: 0,
                  right: 0,
                  bottom: 0,
                  child: const FeatureInfoSheet(),
                ),

              // ── Loading overlay ──
              if (state.isLoading)
                Container(
                  color: Colors.black.withValues(alpha: 0.15),
                  child: const Center(
                    child: CircularProgressIndicator(),
                  ),
                ),
            ],
          );
        },
      ),
    );
  }

  /// Build the flutter_map widget with OSM raster tiles.
  Widget _buildMap(MapState state) {
    return FlutterMap(
      mapController: _mapController,
      options: MapOptions(
        initialCenter: const ll.LatLng(_initialLat, _initialLng),
        initialZoom: _initialZoom,
        minZoom: 5.0,
        maxZoom: 18.0,
        onMapReady: () {
          context.read<MapBloc>().add(const MapLoaded());
          context.read<MapBloc>().add(const MapStyleLoaded());
        },
        onLongPress: (point, latLng) {
          if (state.drawingMode) {
            context.read<MapBloc>().add(
                  MapLongPressed(latLng.latitude, latLng.longitude),
                );
          }
        },
        onTap: (point, latLng) {
          // Try to find a feature at the tap location.
          _handleMapTap(state, latLng);
        },
        onPositionChanged: (position, hasGesture) {
          if (hasGesture) {
            context.read<MapBloc>().add(LocationChanged(
                  latitude: position.center.latitude,
                  longitude: position.center.longitude,
                  accuracy: 0.0, // accuracy not available from position change
                ));
          }
        },
      ),
      children: [
        // ── Tile layer: OpenStreetMap raster ──
        TileLayer(
          urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
          userAgentPackageName: 'com.terraforest.mobile',
          maxNativeZoom: 19,
        ),

        // ── Geofence polygons ──
        PolygonLayer(
          polygons: _buildGeofencePolygons(state),
        ),

        // ── User-drawn polygons ──
        PolygonLayer(
          polygons: _buildUserPolygons(state),
        ),

        // ── Forest plot markers ──
        MarkerLayer(
          markers: _buildForestPlotMarkers(state),
        ),

        // ── Geofence label markers ──
        MarkerLayer(
          markers: _buildGeofenceLabelMarkers(state),
        ),

        // ── User polygon label markers ──
        MarkerLayer(
          markers: _buildPolygonLabelMarkers(state),
        ),

        // ── Current drawing points markers ──
        if (state.drawingMode && state.currentDrawingPoints.isNotEmpty)
          MarkerLayer(
            markers: _buildDrawingPointMarkers(state),
          ),
      ],
    );
  }

  /// Handle tap on map to select features.
  void _handleMapTap(MapState state, ll.LatLng latLng) {
    // Check forest plots first (circular hit test).
    for (final plot in state.forestPlots) {
      final distance = _haversineDistance(
        latLng.latitude,
        latLng.longitude,
        plot.position.latitude,
        plot.position.longitude,
      );
      if (distance < 500) {
        // Within 500m
        context.read<MapBloc>().add(MapMarkerTapped(plot.id));
        return;
      }
    }

    // Check geofences (point-in-polygon test).
    for (final geofence in state.geofences) {
      if (_isPointInPolygon(latLng.latitude, latLng.longitude, geofence.boundary)) {
        context.read<MapBloc>().add(MapPolygonTapped(geofence.id));
        return;
      }
    }

    // Check user polygons.
    for (final polygon in state.polygons) {
      if (_isPointInPolygon(latLng.latitude, latLng.longitude, polygon.points)) {
        context.read<MapBloc>().add(MapPolygonTapped(polygon.id));
        return;
      }
    }
  }

  /// Build geofence polygons for the PolygonLayer.
  List<Polygon> _buildGeofencePolygons(MapState state) {
    return state.geofences.map((geofence) {
      return Polygon(
        points: geofence.boundary
            .map((p) => ll.LatLng(p.latitude, p.longitude))
            .toList(),
        color: geofence.color.withValues(alpha: 0.2),
        borderColor: geofence.color,
        borderStrokeWidth: 2.0,
        pattern: StrokePattern.dashed(segments: [6, 4]),
      );
    }).toList();
  }

  /// Build user-drawn polygons for the PolygonLayer.
  List<Polygon> _buildUserPolygons(MapState state) {
    return state.polygons.map((polygon) {
      return Polygon(
        points: polygon.points
            .map((p) => ll.LatLng(p.latitude, p.longitude))
            .toList(),
        color: polygon.color.withValues(alpha: 0.35),
        borderColor: polygon.color,
        borderStrokeWidth: 2.5,
      );
    }).toList();
  }

  /// Build forest plot circle markers.
  List<Marker> _buildForestPlotMarkers(MapState state) {
    return state.forestPlots.map((plot) {
      return Marker(
        point: ll.LatLng(plot.position.latitude, plot.position.longitude),
        width: 24,
        height: 24,
        child: GestureDetector(
          onTap: () {
            context.read<MapBloc>().add(MapMarkerTapped(plot.id));
          },
          child: Container(
            decoration: BoxDecoration(
              color: plot.plotType.color.withValues(alpha: 0.85),
              shape: BoxShape.circle,
              border: Border.all(color: Colors.white, width: 2),
            ),
            child: Center(
              child: Text(
                plot.name.substring(0, 1),
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
        ),
      );
    }).toList();
  }

  /// Build geofence label markers.
  List<Marker> _buildGeofenceLabelMarkers(MapState state) {
    return state.geofences.map((geofence) {
      final centroid = _computeCentroid(geofence.boundary);
      return Marker(
        point: ll.LatLng(centroid.latitude, centroid.longitude),
        width: 200,
        height: 24,
        child: Center(
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.85),
              borderRadius: BorderRadius.circular(4),
            ),
            child: Text(
              geofence.name,
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w600,
                color: geofence.color,
              ),
              overflow: TextOverflow.ellipsis,
              textAlign: TextAlign.center,
            ),
          ),
        ),
      );
    }).toList();
  }

  /// Build polygon label markers.
  List<Marker> _buildPolygonLabelMarkers(MapState state) {
    return state.polygons.map((polygon) {
      final centroid = _computeCentroid(polygon.points);
      return Marker(
        point: ll.LatLng(centroid.latitude, centroid.longitude),
        width: 160,
        height: 24,
        child: Center(
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.85),
              borderRadius: BorderRadius.circular(4),
            ),
            child: Text(
              polygon.name,
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w600,
                color: polygon.color,
              ),
              overflow: TextOverflow.ellipsis,
              textAlign: TextAlign.center,
            ),
          ),
        ),
      );
    }).toList();
  }

  /// Build markers for drawing-mode points.
  List<Marker> _buildDrawingPointMarkers(MapState state) {
    return state.currentDrawingPoints.asMap().entries.map((entry) {
      final index = entry.key;
      final point = entry.value;
      final isFirst = index == 0 && state.currentDrawingPoints.length >= 3;
      return Marker(
        point: ll.LatLng(point.latitude, point.longitude),
        width: isFirst ? 28 : 20,
        height: isFirst ? 28 : 20,
        child: Container(
          decoration: BoxDecoration(
            color: isFirst ? Colors.orange : const Color(0xFF1B5E20),
            shape: BoxShape.circle,
            border: Border.all(color: Colors.white, width: 2),
          ),
          child: Center(
            child: Text(
              '${index + 1}',
              style: const TextStyle(
                color: Colors.white,
                fontSize: 9,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ),
      );
    }).toList();
  }

  /// Show the polygon completion dialog when the user finishes drawing.
  void _showCompleteDialog(BuildContext context, MapState state) {
    showDialog(
      context: context,
      builder: (dialogContext) => BlocProvider.value(
        value: context.read<MapBloc>(),
        child: PolygonCompleteDialog(
          drawingPoints: state.currentDrawingPoints,
        ),
      ),
    );
  }

  /// Compute the centroid of a list of points with latitude/longitude.
  ll.LatLng _computeCentroid(Iterable<dynamic> points) {
    final list = points.toList();
    if (list.isEmpty) return const ll.LatLng(_initialLat, _initialLng);
    double sumLat = 0, sumLng = 0;
    for (final p in list) {
      sumLat += (p as dynamic).latitude as double;
      sumLng += (p as dynamic).longitude as double;
    }
    return ll.LatLng(sumLat / list.length, sumLng / list.length);
  }

  /// Approximate haversine distance in meters between two lat/lng points.
  double _haversineDistance(double lat1, double lng1, double lat2, double lng2) {
    const double earthRadius = 6371000; // meters
    final double dLat = (lat2 - lat1) * pi / 180;
    final double dLng = (lng2 - lng1) * pi / 180;
    final double a = sin(dLat / 2) * sin(dLat / 2) +
        cos(lat1 * pi / 180) * cos(lat2 * pi / 180) *
            sin(dLng / 2) * sin(dLng / 2);
    final double c = 2 * atan2(sqrt(a), sqrt(1 - a));
    return earthRadius * c;
  }

  /// Simple point-in-polygon test using ray casting algorithm.
  /// Accepts any list of objects with .latitude and .longitude properties.
  bool _isPointInPolygon(double testLat, double testLng, List<dynamic> polygon) {
    bool inside = false;
    for (int i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      final double xi = (polygon[i] as dynamic).latitude as double;
      final double yi = (polygon[i] as dynamic).longitude as double;
      final double xj = (polygon[j] as dynamic).latitude as double;
      final double yj = (polygon[j] as dynamic).longitude as double;
      if (((yi > testLng) != (yj > testLng)) &&
          (testLat < (xj - xi) * (testLng - yi) / (yj - yi) + xi)) {
        inside = !inside;
      }
    }
    return inside;
  }
}

/// Compass widget that shows the current map bearing with a reset-north tap.
class _CompassWidget extends StatelessWidget {
  final VoidCallback onResetNorth;

  const _CompassWidget({required this.onResetNorth});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onResetNorth,
      child: Container(
        width: 40,
        height: 40,
        decoration: BoxDecoration(
          color: Colors.white,
          shape: BoxShape.circle,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.15),
              blurRadius: 6,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: const Center(
          child: Icon(
            Icons.explore,
            color: Color(0xFF455A64),
            size: 24,
          ),
        ),
      ),
    );
  }
}

/// Zoom in/out control buttons.
class _ZoomControls extends StatelessWidget {
  final VoidCallback onZoomIn;
  final VoidCallback onZoomOut;

  const _ZoomControls({
    required this.onZoomIn,
    required this.onZoomOut,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.12),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          IconButton(
            icon: const Icon(Icons.add, size: 22),
            onPressed: onZoomIn,
            padding: const EdgeInsets.all(4),
            constraints: const BoxConstraints(minWidth: 36, minHeight: 36),
          ),
          const Divider(height: 1, indent: 6, endIndent: 6),
          IconButton(
            icon: const Icon(Icons.remove, size: 22),
            onPressed: onZoomOut,
            padding: const EdgeInsets.all(4),
            constraints: const BoxConstraints(minWidth: 36, minHeight: 36),
          ),
        ],
      ),
    );
  }
}

/// Scale bar widget showing the approximate distance represented at the
/// current zoom level.
class _ScaleBarWidget extends StatelessWidget {
  final double zoom;

  const _ScaleBarWidget({required this.zoom});

  @override
  Widget build(BuildContext context) {
    final scaleInfo = _computeScale(zoom);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.9),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Scale line.
          Container(
            width: scaleInfo.$2.toDouble(),
            height: 3,
            decoration: BoxDecoration(
              color: Colors.grey[700],
              borderRadius: BorderRadius.circular(1),
            ),
          ),
          const SizedBox(width: 6),
          Text(
            scaleInfo.$1,
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w500,
              color: Colors.grey[700],
            ),
          ),
        ],
      ),
    );
  }

  /// Returns (label, barWidthInPixels) for the current zoom.
  (String, int) _computeScale(double zoom) {
    // Meters per pixel at equator for Web Mercator.
    final double mpp = 156543.03392 * cos(0) / pow(2, zoom);
    // Find a nice round distance that fits in ~100px.
    final double targetMeters = mpp * 100;
    final double niceMeters = _niceNumber(targetMeters);
    final int barWidth = (niceMeters / mpp).round().clamp(30, 150);

    if (niceMeters >= 1000) {
      return ('${(niceMeters / 1000).toStringAsFixed(niceMeters % 1000 == 0 ? 0 : 1)} km', barWidth);
    }
    return ('${niceMeters.round()} m', barWidth);
  }

  /// Round to a nice number (1, 2, 5, 10, 20, 50, etc.).
  double _niceNumber(double value) {
    final double exponent = (log(value) / ln10).floorToDouble();
    final double fraction = value / pow(10, exponent);
    double niceFraction;
    if (fraction < 1.5) {
      niceFraction = 1;
    } else if (fraction < 3) {
      niceFraction = 2;
    } else if (fraction < 7) {
      niceFraction = 5;
    } else {
      niceFraction = 10;
    }
    return niceFraction * pow(10, exponent);
  }
}
