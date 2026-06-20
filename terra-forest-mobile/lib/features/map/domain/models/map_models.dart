import 'dart:math';
import 'dart:ui';

/// Represents a latitude/longitude coordinate.
class LatLng {
  final double latitude;
  final double longitude;

  const LatLng(this.latitude, this.longitude);

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is LatLng &&
          runtimeType == other.runtimeType &&
          latitude == other.latitude &&
          longitude == other.longitude;

  @override
  int get hashCode => latitude.hashCode ^ longitude.hashCode;

  @override
  String toString() => 'LatLng($latitude, $longitude)';
}

/// Types of polygons that can be drawn on the map.
enum PolygonType {
  geofence,
  observationZone,
  patrolArea,
}

/// Extension to provide Vietnamese labels for polygon types.
extension PolygonTypeExtension on PolygonType {
  String get label {
    switch (this) {
      case PolygonType.geofence:
        return 'Hàng rào địa lý';
      case PolygonType.observationZone:
        return 'Vùng quan sát';
      case PolygonType.patrolArea:
        return 'Khu vực tuần tra';
    }
  }

  String get jsonValue {
    switch (this) {
      case PolygonType.geofence:
        return 'geofence';
      case PolygonType.observationZone:
        return 'observation_zone';
      case PolygonType.patrolArea:
        return 'patrol_area';
    }
  }

  static PolygonType fromJsonValue(String value) {
    switch (value) {
      case 'geofence':
        return PolygonType.geofence;
      case 'observation_zone':
        return PolygonType.observationZone;
      case 'patrol_area':
        return PolygonType.patrolArea;
      default:
        return PolygonType.geofence;
    }
  }
}

/// A polygon drawn on the map.
class MapPolygon {
  final String id;
  final String name;
  final PolygonType type;
  final List<LatLng> points;
  final Color color;
  final bool isDrawing;

  const MapPolygon({
    required this.id,
    required this.name,
    required this.type,
    required this.points,
    required this.color,
    this.isDrawing = false,
  });

  MapPolygon copyWith({
    String? id,
    String? name,
    PolygonType? type,
    List<LatLng>? points,
    Color? color,
    bool? isDrawing,
  }) {
    return MapPolygon(
      id: id ?? this.id,
      name: name ?? this.name,
      type: type ?? this.type,
      points: points ?? this.points,
      color: color ?? this.color,
      isDrawing: isDrawing ?? this.isDrawing,
    );
  }

  /// Calculate approximate area in hectares using the shoelace formula.
  double get areaHectares {
    if (points.length < 3) return 0.0;
    double area = 0.0;
    const double mPerDeg = 111320.0;
    final double latRad = points[0].latitude * 3.141592653589793 / 180.0;
    final double cosLat = cos(latRad);
    for (int i = 0; i < points.length; i++) {
      final int j = (i + 1) % points.length;
      final double xi = points[i].longitude * mPerDeg * cosLat;
      final double yi = points[i].latitude * mPerDeg;
      final double xj = points[j].longitude * mPerDeg * cosLat;
      final double yj = points[j].latitude * mPerDeg;
      area += (xi * yj) - (xj * yi);
    }
    area = (area.abs() / 2.0) / 10000.0; // Convert m² to hectares
    return area;
  }

  @override
  String toString() =>
      'MapPolygon(id: $id, name: $name, type: ${type.jsonValue}, points: ${points.length})';
}

/// A feature displayed on the map (alerts, observations, etc.).
class MapFeature {
  final String id;
  final String name;
  final String type;
  final LatLng position;
  final Map<String, dynamic> properties;

  const MapFeature({
    required this.id,
    required this.name,
    required this.type,
    required this.position,
    this.properties = const {},
  });

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is MapFeature &&
          runtimeType == other.runtimeType &&
          id == other.id;

  @override
  int get hashCode => id.hashCode;
}

/// A geofence zone.
class Geofence {
  final String id;
  final String name;
  final List<LatLng> boundary;
  final Color color;
  final bool isActive;

  const Geofence({
    required this.id,
    required this.name,
    required this.boundary,
    required this.color,
    this.isActive = true,
  });
}

/// Types of forest plots.
enum ForestPlotType {
  natural,
  planted,
  protection,
  mangrove,
}

/// Extension for forest plot colors and Vietnamese labels.
extension ForestPlotTypeExtension on ForestPlotType {
  String get label {
    switch (this) {
      case ForestPlotType.natural:
        return 'Rừng tự nhiên';
      case ForestPlotType.planted:
        return 'Rừng trồng';
      case ForestPlotType.protection:
        return 'Rừng phòng hộ';
      case ForestPlotType.mangrove:
        return 'Rừng ngập mặn';
    }
  }

  Color get color {
    switch (this) {
      case ForestPlotType.natural:
        return const Color(0xFF1B5E20);
      case ForestPlotType.planted:
        return const Color(0xFF66BB6A);
      case ForestPlotType.protection:
        return const Color(0xFF388E3C);
      case ForestPlotType.mangrove:
        return const Color(0xFF00838F);
    }
  }

  String get jsonValue {
    switch (this) {
      case ForestPlotType.natural:
        return 'natural';
      case ForestPlotType.planted:
        return 'planted';
      case ForestPlotType.protection:
        return 'protection';
      case ForestPlotType.mangrove:
        return 'mangrove';
    }
  }

  static ForestPlotType fromJsonValue(String value) {
    switch (value) {
      case 'natural':
        return ForestPlotType.natural;
      case 'planted':
        return ForestPlotType.planted;
      case 'protection':
        return ForestPlotType.protection;
      case 'mangrove':
        return ForestPlotType.mangrove;
      default:
        return ForestPlotType.natural;
    }
  }
}

/// A forest plot marker on the map.
class ForestPlotMarker {
  final String id;
  final String name;
  final ForestPlotType plotType;
  final LatLng position;
  final double areaHectares;

  const ForestPlotMarker({
    required this.id,
    required this.name,
    required this.plotType,
    required this.position,
    this.areaHectares = 0.0,
  });
}

/// Geographic bounds for offline tile downloads.
class GeoBounds {
  final LatLng northeast;
  final LatLng southwest;

  const GeoBounds({
    required this.northeast,
    required this.southwest,
  });

  double get north => northeast.latitude;
  double get south => southwest.latitude;
  double get east => northeast.longitude;
  double get west => southwest.longitude;
}
