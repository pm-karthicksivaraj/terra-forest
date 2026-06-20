import 'dart:async';
import 'dart:math';

import 'package:geolocator/geolocator.dart';
import 'dart:convert';

import '../storage/local_database.dart';

/// Location accuracy configuration for different use cases
enum LocationAccuracyPreset {
  /// Best for SOS and precise recording
  navigation,

  /// Best for patrol tracking
  tracking,

  /// Best for general area display
  general,

  /// Lowest power, approximate only
  passive,
}

/// Geofence event types
enum GeofenceEventType {
  enter,
  exit,
}

/// Geofence event data
class GeofenceEvent {
  final String geofenceId;
  final String geofenceName;
  final GeofenceEventType eventType;
  final Position position;
  final DateTime timestamp;

  GeofenceEvent({
    required this.geofenceId,
    required this.geofenceName,
    required this.eventType,
    required this.position,
    required this.timestamp,
  });
}

/// Complete location service wrapping Geolocator with geofencing,
/// background tracking, battery awareness, and SOS support.
class LocationService {
  static LocationService? _instance;

  static LocationService get instance {
    _instance ??= LocationService._();
    return _instance!;
  }

  LocationService._();

  final LocalDatabase _db = LocalDatabase.instance;

  StreamSubscription<Position>? _positionStreamSubscription;
  StreamController<Position>? _positionController;
  StreamController<GeofenceEvent>? _geofenceEventController;

  /// Current active geofences loaded from database
  List<Map<String, dynamic>> _activeGeofences = [];

  /// Set of geofence IDs the user is currently inside
  final Set<String> _currentGeofenceIds = {};

  /// Last known position for distance calculations
  Position? _lastKnownPosition;

  /// Battery-aware: reduce update frequency when battery low
  bool _isBatteryLow = false;

  /// Stream of position updates for UI consumption
  Stream<Position> get positionStream {
    _positionController ??= StreamController<Position>.broadcast();
    return _positionController!.stream;
  }

  /// Stream of geofence events for UI consumption
  Stream<GeofenceEvent> get geofenceEventStream {
    _geofenceEventController ??=
        StreamController<GeofenceEvent>.broadcast();
    return _geofenceEventController!.stream;
  }

  /// Last known position
  Position? get lastKnownPosition => _lastKnownPosition;

  // ---------------------------------------------------------------------------
  // Permission Handling
  // ---------------------------------------------------------------------------

  /// Check if location permission is granted
  Future<bool> hasPermission() async {
    final permission = await Geolocator.checkPermission();
    return permission == LocationPermission.always ||
        permission == LocationPermission.whileInUse;
  }

  /// Check if location services are enabled
  Future<bool> isLocationServiceEnabled() async {
    return Geolocator.isLocationServiceEnabled();
  }

  /// Request location permission with Vietnamese rationale
  Future<bool> requestPermission() async {
    // Check if location services are enabled
    final serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      // Location services are not enabled, can't request permission
      return false;
    }

    var permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        return false;
      }
    }

    if (permission == LocationPermission.deniedForever) {
      // Permissions are denied forever, handle appropriately
      await Geolocator.openAppSettings();
      return false;
    }

    return permission == LocationPermission.always ||
        permission == LocationPermission.whileInUse;
  }

  /// Request always-on permission for background tracking
  Future<bool> requestBackgroundPermission() async {
    var permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.whileInUse) {
      // On Android, request 'always' permission for background location
      permission = await Geolocator.requestPermission();
    }
    return permission == LocationPermission.always;
  }

  // ---------------------------------------------------------------------------
  // Get Current Position
  // ---------------------------------------------------------------------------

  /// Get current position with specified accuracy settings
  Future<Position?> getCurrentPosition({
    LocationAccuracyPreset accuracyPreset = LocationAccuracyPreset.tracking,
    Duration timeout = const Duration(seconds: 30),
  }) async {
    final hasPerm = await requestPermission();
    if (!hasPerm) return null;

    final serviceEnabled = await isLocationServiceEnabled();
    if (!serviceEnabled) return null;

    try {
      final accuracy = _mapAccuracyPreset(accuracyPreset);
      final position = await Geolocator.getCurrentPosition(
        locationSettings: LocationSettings(
          accuracy: accuracy,
          timeLimit: timeout,
        ),
      );

      _lastKnownPosition = position;

      // Emit to stream
      if (_positionController != null && !_positionController!.isClosed) {
        _positionController!.add(position);
      }

      return position;
    } catch (e) {
      return null;
    }
  }

  /// Get the last known position (cached)
  Future<Position?> getLastKnownPosition() async {
    try {
      final position = await Geolocator.getLastKnownPosition();
      if (position != null) {
        _lastKnownPosition = position;
      }
      return position;
    } catch (e) {
      return _lastKnownPosition;
    }
  }

  LocationAccuracy _mapAccuracyPreset(LocationAccuracyPreset preset) {
    switch (preset) {
      case LocationAccuracyPreset.navigation:
        return LocationAccuracy.bestForNavigation;
      case LocationAccuracyPreset.tracking:
        return LocationAccuracy.high;
      case LocationAccuracyPreset.general:
        return LocationAccuracy.medium;
      case LocationAccuracyPreset.passive:
        return LocationAccuracy.low;
    }
  }

  // ---------------------------------------------------------------------------
  // Stream Position Updates (for patrol tracking)
  // ---------------------------------------------------------------------------

  /// Start streaming position updates
  /// [accuracyPreset] controls GPS accuracy and power usage
  /// [distanceFilter] minimum distance (meters) between updates
  Future<void> startPositionStream({
    LocationAccuracyPreset accuracyPreset = LocationAccuracyPreset.tracking,
    int distanceFilter = 10,
  }) async {
    await stopPositionStream();

    final hasPerm = await requestPermission();
    if (!hasPerm) return;

    final accuracy = _mapAccuracyPreset(accuracyPreset);
    final adjustedDistanceFilter =
        _isBatteryLow ? distanceFilter * 3 : distanceFilter;

    final locationSettings = LocationSettings(
      accuracy: accuracy,
      distanceFilter: adjustedDistanceFilter,
    );

    _positionStreamSubscription =
        Geolocator.getPositionStream(locationSettings: locationSettings).listen(
      (Position position) {
        _lastKnownPosition = position;

        // Emit to stream
        if (_positionController != null && !_positionController!.isClosed) {
          _positionController!.add(position);
        }

        // Check geofences
        _checkGeofences(position);
      },
      onError: (error) {
        // Handle stream errors silently - position updates are best-effort
      },
    );
  }

  /// Stop streaming position updates
  Future<void> stopPositionStream() async {
    await _positionStreamSubscription?.cancel();
    _positionStreamSubscription = null;
  }

  // ---------------------------------------------------------------------------
  // Background Location Tracking
  // ---------------------------------------------------------------------------

  /// Start background location tracking with low power consumption
  Future<void> startBackgroundTracking() async {
    final hasPerm = await requestBackgroundPermission();
    if (!hasPerm) return;

    await startPositionStream(
      accuracyPreset: LocationAccuracyPreset.passive,
      distanceFilter: 50,
    );
  }

  /// Stop background location tracking
  Future<void> stopBackgroundTracking() async {
    await stopPositionStream();
  }

  // ---------------------------------------------------------------------------
  // Distance Calculation
  // ---------------------------------------------------------------------------

  /// Calculate distance between two points in meters
  double distanceBetween(
    double startLat,
    double startLng,
    double endLat,
    double endLng,
  ) {
    return Geolocator.distanceBetween(startLat, startLng, endLat, endLng);
  }

  /// Calculate bearing (direction) between two points in degrees
  double bearingBetween(
    double startLat,
    double startLng,
    double endLat,
    double endLng,
  ) {
    return Geolocator.bearingBetween(startLat, startLng, endLat, endLng);
  }

  /// Calculate distance from current position to a target point
  Future<double?> distanceTo(double targetLat, double targetLng) async {
    final position = await getCurrentPosition();
    if (position == null) return null;

    return distanceBetween(
      position.latitude,
      position.longitude,
      targetLat,
      targetLng,
    );
  }

  // ---------------------------------------------------------------------------
  // Geofence - Point in Polygon (Ray Casting Algorithm)
  // ---------------------------------------------------------------------------

  /// Check if a point is inside a polygon using ray casting algorithm.
  /// [polygon] is a list of [latitude, longitude] coordinate pairs.
  /// [point] is [latitude, longitude] to check.
  bool isPointInPolygon(List<List<double>> polygon, List<double> point) {
    if (polygon.length < 3) return false;

    final pointLat = point[0];
    final pointLng = point[1];
    int intersectCount = 0;

    for (int i = 0; i < polygon.length; i++) {
      final j = (i + 1) % polygon.length;

      final lat1 = polygon[i][0];
      final lng1 = polygon[i][1];
      final lat2 = polygon[j][0];
      final lng2 = polygon[j][1];

      // Check if the ray from point intersects with the edge
      if (_rayIntersectsEdge(
          pointLat, pointLng, lat1, lng1, lat2, lng2)) {
        intersectCount++;
      }
    }

    // Odd number of intersections means point is inside
    return intersectCount % 2 == 1;
  }

  /// Check if a point is inside a circular geofence
  bool isPointInCircle(
    double pointLat,
    double pointLng,
    double centerLat,
    double centerLng,
    double radiusMeters,
  ) {
    final distance = distanceBetween(
      pointLat,
      pointLng,
      centerLat,
      centerLng,
    );
    return distance <= radiusMeters;
  }

  /// Ray casting edge intersection test
  bool _rayIntersectsEdge(
    double px,
    double py,
    double lat1,
    double lng1,
    double lat2,
    double lng2,
  ) {
    // Check if the edge crosses the horizontal ray from point going right
    if ((lat1 <= py && lat2 > py) || (lat2 <= py && lat1 > py)) {
      // Calculate the x-coordinate of the intersection
      final xIntersect =
          lng1 + (py - lat1) / (lat2 - lat1) * (lng2 - lng1);

      // If intersection is to the right of the point
      if (px < xIntersect) {
        return true;
      }
    }
    return false;
  }

  // ---------------------------------------------------------------------------
  // Geofence Monitoring
  // ---------------------------------------------------------------------------

  /// Load active geofences from database for monitoring
  Future<void> loadGeofences() async {
    _activeGeofences = await _db.getActiveGeofences();

    // Initialize current geofence membership
    if (_lastKnownPosition != null) {
      for (final geofence in _activeGeofences) {
        final inside = _isPositionInGeofence(
          _lastKnownPosition!.latitude,
          _lastKnownPosition!.longitude,
          geofence,
        );
        if (inside) {
          _currentGeofenceIds.add(geofence['id'] as String);
        }
      }
    }
  }

  /// Check if current position triggers any geofence enter/exit events
  void _checkGeofences(Position position) {
    for (final geofence in _activeGeofences) {
      final geofenceId = geofence['id'] as String;
      final geofenceName = (geofence['name_vi'] as String?) ??
          (geofence['name'] as String?) ??
          'Unknown';

      final isInside = _isPositionInGeofence(
        position.latitude,
        position.longitude,
        geofence,
      );

      final wasInside = _currentGeofenceIds.contains(geofenceId);

      if (isInside && !wasInside) {
        // Entered geofence
        _currentGeofenceIds.add(geofenceId);
        _emitGeofenceEvent(
          geofenceId: geofenceId,
          geofenceName: geofenceName,
          eventType: GeofenceEventType.enter,
          position: position,
        );
      } else if (!isInside && wasInside) {
        // Exited geofence
        _currentGeofenceIds.remove(geofenceId);
        _emitGeofenceEvent(
          geofenceId: geofenceId,
          geofenceName: geofenceName,
          eventType: GeofenceEventType.exit,
          position: position,
        );
      }
    }
  }

  /// Check if a position is inside a specific geofence
  bool _isPositionInGeofence(
    double latitude,
    double longitude,
    Map<String, dynamic> geofence,
  ) {
    final type = geofence['type'] as String?;

    if (type == 'circle') {
      final centerLat = (geofence['center_lat'] as num?)?.toDouble();
      final centerLng = (geofence['center_lng'] as num?)?.toDouble();
      final radiusM = (geofence['radius_m'] as num?)?.toDouble();

      if (centerLat != null && centerLng != null && radiusM != null) {
        return isPointInCircle(
          latitude,
          longitude,
          centerLat,
          centerLng,
          radiusM,
        );
      }
    }

    // Polygon geofence - parse geometry_json
    final geometryJson = geofence['geometry_json'] as String?;
    if (geometryJson != null) {
      try {
        final geometry = jsonDecode(geometryJson);
        if (geometry is Map<String, dynamic>) {
          final coordinates = _extractPolygonCoordinates(geometry);
          if (coordinates.isNotEmpty) {
            return isPointInPolygon(coordinates, [latitude, longitude]);
          }
        }
      } catch (_) {}
    }

    return false;
  }

  /// Extract polygon coordinates from GeoJSON geometry
  List<List<double>> _extractPolygonCoordinates(Map<String, dynamic> geometry) {
    final type = geometry['type'] as String?;

    if (type == 'Polygon') {
      final coords = geometry['coordinates'] as List?;
      if (coords != null && coords.isNotEmpty) {
        final ring = coords[0] as List;
        return ring
            .map<List<double>>((coord) => [
                  (coord as List)[1] as double, // latitude
                  coord[0] as double, // longitude
                ])
            .toList();
      }
    }

    if (type == 'MultiPolygon') {
      final coords = geometry['coordinates'] as List?;
      if (coords != null && coords.isNotEmpty) {
        // Use the first polygon
        final firstPolygon = coords[0] as List;
        if (firstPolygon.isNotEmpty) {
          final ring = firstPolygon[0] as List;
          return ring
              .map<List<double>>((coord) => [
                    (coord as List)[1] as double,
                    coord[0] as double,
                  ])
              .toList();
        }
      }
    }

    return [];
  }

  void _emitGeofenceEvent({
    required String geofenceId,
    required String geofenceName,
    required GeofenceEventType eventType,
    required Position position,
  }) {
    final event = GeofenceEvent(
      geofenceId: geofenceId,
      geofenceName: geofenceName,
      eventType: eventType,
      position: position,
      timestamp: DateTime.now(),
    );

    if (_geofenceEventController != null &&
        !_geofenceEventController!.isClosed) {
      _geofenceEventController!.add(event);
    }
  }

  /// Get list of geofence IDs the user is currently inside
  Set<String> get currentGeofenceIds => Set.unmodifiable(_currentGeofenceIds);

  /// Check if currently inside a specific geofence
  bool isInsideGeofence(String geofenceId) {
    return _currentGeofenceIds.contains(geofenceId);
  }

  // ---------------------------------------------------------------------------
  // SOS Location Capture
  // ---------------------------------------------------------------------------

  /// Capture high-accuracy position for SOS alert
  Future<Position?> captureSosLocation() async {
    final position = await getCurrentPosition(
      accuracyPreset: LocationAccuracyPreset.navigation,
      timeout: const Duration(seconds: 20),
    );

    if (position != null) {
      // Also try to get a more accurate reading
      try {
        final betterPosition = await getCurrentPosition(
          accuracyPreset: LocationAccuracyPreset.navigation,
          timeout: const Duration(seconds: 15),
        );
        return betterPosition ?? position;
      } catch (_) {
        return position;
      }
    }

    // Fallback to last known position
    return _lastKnownPosition;
  }

  // ---------------------------------------------------------------------------
  // Battery-Aware Location Updates
  // ---------------------------------------------------------------------------

  /// Update battery status to adjust location update frequency
  void updateBatteryLevel(int batteryPercentage) {
    final wasLow = _isBatteryLow;
    _isBatteryLow = batteryPercentage < 20;

    // If battery state changed and we're tracking, restart with new settings
    if (wasLow != _isBatteryLow && _positionStreamSubscription != null) {
      startPositionStream(
        accuracyPreset: _isBatteryLow
            ? LocationAccuracyPreset.general
            : LocationAccuracyPreset.tracking,
        distanceFilter: _isBatteryLow ? 30 : 10,
      );
    }
  }

  /// Get current tracking accuracy based on battery state
  LocationAccuracyPreset get currentAccuracyPreset {
    return _isBatteryLow
        ? LocationAccuracyPreset.general
        : LocationAccuracyPreset.tracking;
  }

  /// Get recommended distance filter based on battery state
  int get recommendedDistanceFilter {
    return _isBatteryLow ? 30 : 10;
  }

  // ---------------------------------------------------------------------------
  // Utility Methods
  // ---------------------------------------------------------------------------

  /// Calculate the area of a polygon in square meters using the Shoelace formula
  /// adapted for geographic coordinates
  double calculatePolygonArea(List<List<double>> polygon) {
    if (polygon.length < 3) return 0.0;

    double area = 0.0;
    const earthRadius = 6371000.0; // Earth radius in meters

    for (int i = 0; i < polygon.length; i++) {
      final j = (i + 1) % polygon.length;
      final lat1 = polygon[i][0] * pi / 180;
      final lng1 = polygon[i][1] * pi / 180;
      final lat2 = polygon[j][0] * pi / 180;
      final lng2 = polygon[j][1] * pi / 180;

      area += (lng2 - lng1) * (2 + sin(lat1) + sin(lat2));
    }

    area = (area * earthRadius * earthRadius / 2).abs();
    return area;
  }

  /// Format coordinate as DMS (degrees, minutes, seconds) string
  String formatCoordinateDMS(double latitude, double longitude) {
    final latDir = latitude >= 0 ? 'N' : 'S';
    final lngDir = longitude >= 0 ? 'E' : 'W';

    final latAbs = latitude.abs();
    final lngAbs = longitude.abs();

    final latDeg = latAbs.floor();
    final latMin = ((latAbs - latDeg) * 60).floor();
    final latSec = ((latAbs - latDeg - latMin / 60) * 3600).toStringAsFixed(1);

    final lngDeg = lngAbs.floor();
    final lngMin = ((lngAbs - lngDeg) * 60).floor();
    final lngSec =
        ((lngAbs - lngDeg - lngMin / 60) * 3600).toStringAsFixed(1);

    return '$latDeg°$latMin\'$latSec" $latDir, $lngDeg°$lngMin\'$lngSec" $lngDir';
  }

  /// Format coordinate as decimal degrees string
  String formatCoordinateDD(double latitude, double longitude) {
    return '${latitude.toStringAsFixed(6)}, ${longitude.toStringAsFixed(6)}';
  }

  // ---------------------------------------------------------------------------
  // Dispose
  // ---------------------------------------------------------------------------

  void dispose() {
    _positionStreamSubscription?.cancel();
    _positionController?.close();
    _geofenceEventController?.close();
    _activeGeofences.clear();
    _currentGeofenceIds.clear();
  }
}
