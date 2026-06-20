import 'dart:math';
import 'dart:ui';

import 'package:flutter/material.dart';

import '../../domain/models/map_models.dart';

/// Overlay widget that renders the polygon being drawn and handles
/// tap-to-add-point interactions when drawing mode is active.
class PolygonDrawingOverlay extends StatefulWidget {
  /// Called when the user taps a point to add it to the drawing.
  final void Function(LatLng latLng) onPointAdded;

  /// Called when the user taps near the first point to close the polygon.
  final VoidCallback? onPolygonClosed;

  /// Points currently placed in the drawing.
  final List<LatLng> drawingPoints;

  /// Whether drawing mode is active.
  final bool drawingMode;

  /// Current map zoom level, used for vertex snap threshold.
  final double zoom;

  /// The map's center latitude (used for projection).
  final double centerLatitude;

  const PolygonDrawingOverlay({
    super.key,
    required this.onPointAdded,
    this.onPolygonClosed,
    required this.drawingPoints,
    required this.drawingMode,
    this.zoom = 11.0,
    this.centerLatitude = 11.97,
  });

  @override
  State<PolygonDrawingOverlay> createState() => _PolygonDrawingOverlayState();
}

class _PolygonDrawingOverlayState extends State<PolygonDrawingOverlay> {
  /// The current finger position for rubber-banding.
  Offset? _currentTouchPosition;

  /// Approximate screen size of the map widget for coordinate projection.
  Size _mapSize = Size.zero;

  @override
  Widget build(BuildContext context) {
    if (!widget.drawingMode) {
      _currentTouchPosition = null;
      return const SizedBox.expand();
    }

    return LayoutBuilder(
      builder: (context, constraints) {
        _mapSize = Size(constraints.maxWidth, constraints.maxHeight);

        return GestureDetector(
          behavior: HitTestBehavior.translucent,
          onPanUpdate: (details) {
            setState(() {
              _currentTouchPosition = details.globalPosition -
                  (context.findRenderObject() as RenderBox)
                      .localToGlobal(Offset.zero);
            });
          },
          onPanEnd: (_) {
            setState(() {
              _currentTouchPosition = null;
            });
          },
          onTapUp: (details) {
            _handleTap(details.localPosition);
          },
          child: CustomPaint(
            size: Size(constraints.maxWidth, constraints.maxHeight),
            painter: _PolygonDrawingPainter(
              drawingPoints: widget.drawingPoints,
              currentTouchPosition: _currentTouchPosition,
              mapSize: _mapSize,
              zoom: widget.zoom,
              centerLatitude: widget.centerLatitude,
            ),
          ),
        );
      },
    );
  }

  /// Convert a screen tap offset to a LatLng coordinate.
  ///
  /// This is a simple equirectangular projection that assumes the map is
  /// centered on [widget.centerLatitude] and uses the current zoom to compute
  /// scale.  For a real MapLibre integration, the map controller's
  /// `toLngLat()` method should be used instead.
  LatLng _screenToLatLng(Offset screenPoint) {
    // World Mercator meters per degree at the equator.
    const double mPerDeg = 111320.0;
    final double metersPerPixel =
        (mPerDeg * cos(widget.centerLatitude * pi / 180.0)) /
            (256.0 * pow(2.0, widget.zoom));

    final double dx = screenPoint.dx - _mapSize.width / 2;
    final double dy = -(screenPoint.dy - _mapSize.height / 2);

    final double lng = widget.drawingPoints.isNotEmpty
        ? widget.drawingPoints.first.longitude + dx * metersPerPixel / mPerDeg
        : 107.22 + dx * metersPerPixel / mPerDeg;

    final double lat = widget.drawingPoints.isNotEmpty
        ? widget.drawingPoints.first.latitude + dy * metersPerPixel / mPerDeg
        : 11.97 + dy * metersPerPixel / mPerDeg;

    return LatLng(lat, lng);
  }

  void _handleTap(Offset localPosition) {
    if (!widget.drawingMode) return;

    // Check if tapping near the first point to close the polygon.
    if (widget.drawingPoints.length >= 3 && _isNearFirstPoint(localPosition)) {
      widget.onPolygonClosed?.call();
      return;
    }

    final latLng = _screenToLatLng(localPosition);
    widget.onPointAdded(latLng);
  }

  /// Returns true if [localPosition] is within the snap radius of the first
  /// drawing point (so the user can close the polygon by tapping near it).
  bool _isNearFirstPoint(Offset localPosition) {
    if (widget.drawingPoints.isEmpty) return false;
    final firstScreen = _latLngToScreen(widget.drawingPoints.first);
    if (firstScreen == null) return false;
    final double distance =
        (localPosition - firstScreen).distance;
    // Snap radius in logical pixels — larger when zoomed out.
    final double snapRadius = 40.0 / (widget.zoom / 11.0);
    return distance < snapRadius;
  }

  /// Convert a LatLng back to screen coordinates for the overlay painter.
  Offset? _latLngToScreen(LatLng latLng) {
    if (_mapSize == Size.zero) return null;
    const double mPerDeg = 111320.0;
    final double metersPerPixel =
        (mPerDeg * cos(widget.centerLatitude * pi / 180.0)) /
            (256.0 * pow(2.0, widget.zoom));

    final LatLng ref = widget.drawingPoints.isNotEmpty
        ? widget.drawingPoints.first
        : const LatLng(11.97, 107.22);

    final double dx =
        (latLng.longitude - ref.longitude) * mPerDeg / metersPerPixel;
    final double dy =
        -(latLng.latitude - ref.latitude) * mPerDeg / metersPerPixel;

    // Offset from the first point's screen position.
    // The first point is assumed to be at the center of the overlay if it's
    // the only reference; otherwise we need the map controller for exact
    // positioning.  For simplicity we use the center as reference.
    final Offset refScreen = Offset(_mapSize.width / 2, _mapSize.height / 2);
    return refScreen + Offset(dx, dy);
  }
}

/// Custom painter that draws the polygon in progress, including vertices,
/// edges, the rubber-band line, the closing line, and the area label.
class _PolygonDrawingPainter extends CustomPainter {
  final List<LatLng> drawingPoints;
  final Offset? currentTouchPosition;
  final Size mapSize;
  final double zoom;
  final double centerLatitude;

  _PolygonDrawingPainter({
    required this.drawingPoints,
    required this.currentTouchPosition,
    required this.mapSize,
    required this.zoom,
    required this.centerLatitude,
  });

  static const Color _lineColor = Color(0xFF2E7D32);
  static const Color _fillColor = Color(0x332E7D32);
  static const Color _vertexColor = Color(0xFF1B5E20);
  static const Color _closingDashColor = Color(0x992E7D32);
  static const Color _rubberBandColor = Color(0x882E7D32);
  static const Color _areaLabelBg = Color(0xDDFFFFFF);
  static const double _vertexRadius = 7.0;
  static const double _firstVertexRadius = 10.0;
  static const double _lineWidth = 2.5;

  @override
  void paint(Canvas canvas, Size size) {
    if (drawingPoints.isEmpty) return;

    // Project all points to screen coordinates.
    final screenPoints = <Offset>[];
    for (final point in drawingPoints) {
      final sp = _latLngToScreen(point);
      if (sp != null) screenPoints.add(sp);
    }
    if (screenPoints.isEmpty) return;

    final linePaint = Paint()
      ..color = _lineColor
      ..strokeWidth = _lineWidth
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round;

    final fillPaint = Paint()
      ..color = _fillColor
      ..style = PaintingStyle.fill;

    // Draw filled polygon if we have 3+ points.
    if (screenPoints.length >= 3) {
      final path = Path()..addPolygon(screenPoints, true);
      canvas.drawPath(path, fillPaint);
    }

    // Draw solid lines between vertices.
    if (screenPoints.length >= 2) {
      for (int i = 0; i < screenPoints.length - 1; i++) {
        canvas.drawLine(screenPoints[i], screenPoints[i + 1], linePaint);
      }
    }

    // Draw dashed closing line from last point to first point.
    if (screenPoints.length >= 3) {
      _drawDashedLine(
        canvas,
        screenPoints.last,
        screenPoints.first,
        Paint()
          ..color = _closingDashColor
          ..strokeWidth = _lineWidth
          ..style = PaintingStyle.stroke,
        dashLength: 8,
        gapLength: 5,
      );
    }

    // Draw rubber-band line from last point to current touch position.
    if (currentTouchPosition != null && screenPoints.isNotEmpty) {
      _drawDashedLine(
        canvas,
        screenPoints.last,
        currentTouchPosition!,
        Paint()
          ..color = _rubberBandColor
          ..strokeWidth = 2.0
          ..style = PaintingStyle.stroke,
        dashLength: 6,
        gapLength: 4,
      );

      // Also draw rubber-band from touch to first point if we have 3+ points.
      if (screenPoints.length >= 2) {
        _drawDashedLine(
          canvas,
          currentTouchPosition!,
          screenPoints.first,
          Paint()
            ..color = _rubberBandColor.withValues(alpha: 0.4)
            ..strokeWidth = 1.5
            ..style = PaintingStyle.stroke,
          dashLength: 4,
          gapLength: 6,
        );
      }
    }

    // Draw vertex dots.
    for (int i = 0; i < screenPoints.length; i++) {
      final isLast = i == screenPoints.length - 1;
      final isFirst = i == 0;
      final radius = isFirst && screenPoints.length >= 3
          ? _firstVertexRadius
          : _vertexRadius;

      // Outer ring.
      canvas.drawCircle(
        screenPoints[i],
        radius + 2,
        Paint()..color = Colors.white,
      );
      // Inner fill.
      canvas.drawCircle(
        screenPoints[i],
        radius,
        Paint()
          ..color = isFirst && screenPoints.length >= 3
              ? Colors.orange
              : _vertexColor,
      );
      // Number label.
      final textSpan = TextSpan(
        text: '${i + 1}',
        style: const TextStyle(
          color: Colors.white,
          fontSize: 10,
          fontWeight: FontWeight.bold,
        ),
      );
      final tp = TextPainter(
        text: textSpan,
        textDirection: TextDirection.ltr,
      )..layout();
      tp.paint(
        canvas,
        screenPoints[i] - Offset(tp.width / 2, tp.height / 2),
      );
    }

    // Draw area label if we have 3+ points.
    if (screenPoints.length >= 3) {
      _drawAreaLabel(canvas, screenPoints);
    }
  }

  /// Draw a dashed line between two points.
  void _drawDashedLine(
    Canvas canvas,
    Offset start,
    Offset end,
    Paint paint, {
    double dashLength = 5,
    double gapLength = 3,
  }) {
    final double totalDistance = (end - start).distance;
    if (totalDistance == 0) return;

    final int dashCount = (totalDistance / (dashLength + gapLength)).floor();
    final Offset unitVector = (end - start) / totalDistance;

    for (int i = 0; i < dashCount; i++) {
      final Offset dashStart =
          start + unitVector * (i * (dashLength + gapLength));
      final Offset dashEnd = dashStart + unitVector * dashLength;
      canvas.drawLine(dashStart, dashEnd, paint);
    }
  }

  /// Draw the area label near the centroid of the polygon.
  void _drawAreaLabel(Canvas canvas, List<Offset> points) {
    // Compute centroid.
    double cx = 0, cy = 0;
    for (final p in points) {
      cx += p.dx;
      cy += p.dy;
    }
    cx /= points.length;
    cy /= points.length;

    final areaHa = _computeAreaHectares();
    final String label = '${areaHa.toStringAsFixed(2)} ha';

    final textSpan = TextSpan(
      text: label,
      style: const TextStyle(
        color: Color(0xFF1B5E20),
        fontSize: 13,
        fontWeight: FontWeight.bold,
      ),
    );
    final tp = TextPainter(
      text: textSpan,
      textDirection: TextDirection.ltr,
    )..layout();

    final bgRect = RRect.fromRectAndRadius(
      Rect.fromCenter(
        center: Offset(cx, cy),
        width: tp.width + 16,
        height: tp.height + 10,
      ),
      const Radius.circular(8),
    );

    canvas.drawRRect(bgRect, Paint()..color = _areaLabelBg);
    canvas.drawRRect(
      bgRect,
      Paint()
        ..color = _lineColor.withValues(alpha: 0.3)
        ..style = PaintingStyle.stroke
        ..strokeWidth = 1,
    );
    tp.paint(
      canvas,
      Offset(cx - tp.width / 2, cy - tp.height / 2),
    );
  }

  /// Compute polygon area in hectares using the shoelace formula.
  double _computeAreaHectares() {
    if (drawingPoints.length < 3) return 0.0;
    double area = 0.0;
    const double mPerDeg = 111320.0;
    final double latRad = drawingPoints[0].latitude * pi / 180.0;
    final double cosLat = cos(latRad);
    for (int i = 0; i < drawingPoints.length; i++) {
      final int j = (i + 1) % drawingPoints.length;
      final double xi = drawingPoints[i].longitude * mPerDeg * cosLat;
      final double yi = drawingPoints[i].latitude * mPerDeg;
      final double xj = drawingPoints[j].longitude * mPerDeg * cosLat;
      final double yj = drawingPoints[j].latitude * mPerDeg;
      area += (xi * yj) - (xj * yi);
    }
    return (area.abs() / 2.0) / 10000.0;
  }

  /// Convert a LatLng to screen coordinates relative to the overlay widget.
  Offset? _latLngToScreen(LatLng latLng) {
    if (mapSize == Size.zero) return null;
    const double mPerDeg = 111320.0;
    final double metersPerPixel =
        (mPerDeg * cos(centerLatitude * pi / 180.0)) /
            (256.0 * pow(2.0, zoom));

    final LatLng ref = drawingPoints.isNotEmpty
        ? drawingPoints.first
        : const LatLng(11.97, 107.22);

    final double dx =
        (latLng.longitude - ref.longitude) * mPerDeg / metersPerPixel;
    final double dy =
        -(latLng.latitude - ref.latitude) * mPerDeg / metersPerPixel;

    final Offset refScreen = Offset(mapSize.width / 2, mapSize.height / 2);
    return refScreen + Offset(dx, dy);
  }

  @override
  bool shouldRepaint(covariant _PolygonDrawingPainter oldDelegate) {
    return oldDelegate.drawingPoints != drawingPoints ||
        oldDelegate.currentTouchPosition != currentTouchPosition ||
        oldDelegate.zoom != zoom ||
        oldDelegate.mapSize != mapSize;
  }
}
