import 'dart:math';
import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../domain/models/map_models.dart';
import '../bloc/map_bloc.dart';

/// A panel for toggling map layer visibility, shown as a right-side drawer.
class LayerTogglePanel extends StatelessWidget {
  const LayerTogglePanel({super.key});

  static const Map<String, String> _layerLabels = {
    'forest_plots': 'Lô rừng',
    'alerts': 'Cảnh báo',
    'geofences': 'Hàng rào địa lý',
    'ndvi': 'Lớp phủ NDVI',
    'patrol_route': 'Lộ trình tuần tra',
    'observations': 'Quan sát',
    'fire_risk': 'Nguy cơ cháy',
  };

  static const Map<String, IconData> _layerIcons = {
    'forest_plots': Icons.forest,
    'alerts': Icons.warning_amber_rounded,
    'geofences': Icons.fence,
    'ndvi': Icons.satellite_alt,
    'patrol_route': Icons.route,
    'observations': Icons.visibility,
    'fire_risk': Icons.local_fire_department,
  };

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<MapBloc, MapState>(
      builder: (context, state) {
        return Drawer(
          child: SafeArea(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header.
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Theme.of(context).colorScheme.primaryContainer,
                  ),
                  child: Text(
                    'Lớp dữ liệu bản đồ',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                          color:
                              Theme.of(context).colorScheme.onPrimaryContainer,
                        ),
                  ),
                ),
                const SizedBox(height: 8),
                Expanded(
                  child: ListView(
                    padding: const EdgeInsets.symmetric(horizontal: 8),
                    children: _layerLabels.entries.map((entry) {
                      final layerName = entry.key;
                      final label = entry.value;
                      final icon = _layerIcons[layerName] ?? Icons.layers;
                      final isVisible = state.layers[layerName] ?? false;
                      return CheckboxListTile(
                        secondary: Icon(icon, size: 22),
                        title: Text(label),
                        value: isVisible,
                        onChanged: (val) {
                          context.read<MapBloc>().add(
                                ToggleLayer(layerName, val ?? false),
                              );
                        },
                        controlAffinity:
                            ListTileControlAffinity.leading,
                        contentPadding: const EdgeInsets.symmetric(
                          horizontal: 8,
                        ),
                        dense: true,
                      );
                    }).toList(),
                  ),
                ),
                const Divider(height: 1),
                // NDVI toggle with extra controls.
                if (state.layers['ndvi'] == true)
                  Padding(
                    padding: const EdgeInsets.all(16),
                    child: const NdviLegend(),
                  ),
              ],
            ),
          ),
        );
      },
    );
  }
}

/// Toolbar displayed at the bottom when polygon drawing mode is active.
class DrawingToolbar extends StatelessWidget {
  const DrawingToolbar({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<MapBloc, MapState>(
      builder: (context, state) {
        if (!state.drawingMode) return const SizedBox.shrink();

        return Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          decoration: BoxDecoration(
            color: Colors.white,
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.15),
                blurRadius: 8,
                offset: const Offset(0, -2),
              ),
            ],
          ),
          child: SafeArea(
            top: false,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Point count and area info.
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.edit_location_alt,
                        size: 18, color: Colors.green[700]),
                    const SizedBox(width: 6),
                    Text(
                      'Đang vẽ: ${state.currentDrawingPoints.length} điểm',
                      style: TextStyle(
                        fontWeight: FontWeight.w600,
                        color: Colors.green[800],
                      ),
                    ),
                    if (state.currentDrawingPoints.length >= 3) ...[
                      const SizedBox(width: 12),
                      Text(
                        '~${_computeArea(state.currentDrawingPoints).toStringAsFixed(2)} ha',
                        style: TextStyle(
                          fontWeight: FontWeight.w500,
                          color: Colors.orange[800],
                          fontSize: 13,
                        ),
                      ),
                    ],
                  ],
                ),
                const SizedBox(height: 8),
                // Action buttons.
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    _DrawingButton(
                      icon: Icons.undo,
                      label: 'Hoàn tác',
                      onPressed: state.currentDrawingPoints.isNotEmpty
                          ? () => context
                              .read<MapBloc>()
                              .add(const UndoLastPoint())
                          : null,
                    ),
                    _DrawingButton(
                      icon: Icons.check_circle,
                      label: 'Hoàn thành',
                      onPressed: state.currentDrawingPoints.length >= 3
                          ? () => _showCompleteDialog(context, state)
                          : null,
                      color: Colors.green,
                    ),
                    _DrawingButton(
                      icon: Icons.cancel,
                      label: 'Hủy bỏ',
                      onPressed: () =>
                          context.read<MapBloc>().add(const CancelDrawing()),
                      color: Colors.red,
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  double _computeArea(List<LatLng> points) {
    if (points.length < 3) return 0.0;
    double area = 0.0;
    const double mPerDeg = 111320.0;
    final double latRad = points[0].latitude * pi / 180.0;
    final double cosLat = cos(latRad);
    for (int i = 0; i < points.length; i++) {
      final int j = (i + 1) % points.length;
      final double xi = points[i].longitude * mPerDeg * cosLat;
      final double yi = points[i].latitude * mPerDeg;
      final double xj = points[j].longitude * mPerDeg * cosLat;
      final double yj = points[j].latitude * mPerDeg;
      area += (xi * yj) - (xj * yi);
    }
    return (area.abs() / 2.0) / 10000.0;
  }

  void _showCompleteDialog(BuildContext context, MapState state) {
    showDialog(
      context: context,
      builder: (dialogContext) => PolygonCompleteDialog(
        drawingPoints: state.currentDrawingPoints,
      ),
    );
  }
}

class _DrawingButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback? onPressed;
  final Color? color;

  const _DrawingButton({
    required this.icon,
    required this.label,
    this.onPressed,
    this.color,
  });

  @override
  Widget build(BuildContext context) {
    final effectiveColor = color ?? Colors.grey[700];
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        IconButton(
          icon: Icon(icon, color: effectiveColor, size: 28),
          onPressed: onPressed,
          style: IconButton.styleFrom(
            backgroundColor: (effectiveColor as Color?)?.withValues(alpha: 0.1),
          ),
        ),
        const SizedBox(height: 2),
        Text(
          label,
          style: TextStyle(fontSize: 11, color: effectiveColor),
        ),
      ],
    );
  }
}

/// Dialog shown when completing a polygon drawing.
class PolygonCompleteDialog extends StatefulWidget {
  final List<LatLng> drawingPoints;

  const PolygonCompleteDialog({super.key, required this.drawingPoints});

  @override
  State<PolygonCompleteDialog> createState() => _PolygonCompleteDialogState();
}

class _PolygonCompleteDialogState extends State<PolygonCompleteDialog> {
  late TextEditingController _nameController;
  PolygonType _selectedType = PolygonType.geofence;
  Color _selectedColor = const Color(0xFF4CAF50);

  static const List<Color> _colorOptions = [
    Color(0xFF4CAF50), // Green
    Color(0xFFFF9800), // Orange
    Color(0xFF2196F3), // Blue
    Color(0xFF9C27B0), // Purple
    Color(0xFFF44336), // Red
    Color(0xFFFFEB3B), // Yellow
    Color(0xFF009688), // Teal
    Color(0xFF795548), // Brown
  ];

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController(text: 'Khu vực mới');
  }

  @override
  void dispose() {
    _nameController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Hoàn thành vùng vẽ'),
      content: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Name field.
            TextField(
              controller: _nameController,
              decoration: const InputDecoration(
                labelText: 'Tên vùng',
                hintText: 'Nhập tên vùng...',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.label),
              ),
            ),
            const SizedBox(height: 16),

            // Type selector.
            const Text(
              'Loại vùng',
              style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
            ),
            const SizedBox(height: 8),
            ...PolygonType.values.map((type) => RadioListTile<PolygonType>(
                  title: Text(type.label),
                  value: type,
                  groupValue: _selectedType,
                  onChanged: (val) {
                    if (val != null) {
                      setState(() => _selectedType = val);
                    }
                  },
                  contentPadding: EdgeInsets.zero,
                  dense: true,
                )),

            const SizedBox(height: 12),

            // Color picker.
            const Text(
              'Màu sắc',
              style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
            ),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: _colorOptions.map((color) {
                final isSelected = color.value == _selectedColor.value;
                return GestureDetector(
                  onTap: () => setState(() => _selectedColor = color),
                  child: Container(
                    width: 36,
                    height: 36,
                    decoration: BoxDecoration(
                      color: color,
                      shape: BoxShape.circle,
                      border: isSelected
                          ? Border.all(color: Colors.black, width: 3)
                          : Border.all(color: Colors.grey[300]!),
                    ),
                    child: isSelected
                        ? const Icon(Icons.check, color: Colors.white, size: 20)
                        : null,
                  ),
                );
              }).toList(),
            ),

            const SizedBox(height: 12),

            // Area info.
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: Colors.green[50],
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                children: [
                  Icon(Icons.square_foot, color: Colors.green[700], size: 20),
                  const SizedBox(width: 8),
                  Text(
                    'Diện tích: ${_computeArea().toStringAsFixed(2)} ha',
                    style: TextStyle(
                      color: Colors.green[900],
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(context).pop(),
          child: const Text('Hủy bỏ'),
        ),
        FilledButton(
          onPressed: () {
            if (_nameController.text.trim().isEmpty) return;
            context.read<MapBloc>().add(CompleteDrawing(
                  name: _nameController.text.trim(),
                  type: _selectedType,
                  color: _selectedColor,
                ));
            Navigator.of(context).pop();
          },
          child: const Text('Lưu vùng'),
        ),
      ],
    );
  }

  double _computeArea() {
    if (widget.drawingPoints.length < 3) return 0.0;
    double area = 0.0;
    const double mPerDeg = 111320.0;
    final double latRad = widget.drawingPoints[0].latitude * pi / 180.0;
    final double cosLat = cos(latRad);
    for (int i = 0; i < widget.drawingPoints.length; i++) {
      final int j = (i + 1) % widget.drawingPoints.length;
      final double xi = widget.drawingPoints[i].longitude * mPerDeg * cosLat;
      final double yi = widget.drawingPoints[i].latitude * mPerDeg;
      final double xj = widget.drawingPoints[j].longitude * mPerDeg * cosLat;
      final double yj = widget.drawingPoints[j].latitude * mPerDeg;
      area += (xi * yj) - (xj * yi);
    }
    return (area.abs() / 2.0) / 10000.0;
  }
}

/// Bottom sheet showing selected feature details.
class FeatureInfoSheet extends StatelessWidget {
  const FeatureInfoSheet({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<MapBloc, MapState>(
      builder: (context, state) {
        final feature = state.selectedFeature;
        if (feature == null) return const SizedBox.shrink();

        return Container(
          width: double.infinity,
          padding: const EdgeInsets.all(16),
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
            boxShadow: [
              BoxShadow(
                color: Color(0x26000000),
                blurRadius: 10,
                offset: Offset(0, -4),
              ),
            ],
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Handle.
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  margin: const EdgeInsets.only(bottom: 12),
                  decoration: BoxDecoration(
                    color: Colors.grey[300],
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              // Title.
              Row(
                children: [
                  Icon(_getFeatureIcon(feature.type),
                      color: _getFeatureColor(feature.type)),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      feature.name,
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close),
                    onPressed: () => context.read<MapBloc>().add(
                          MapMarkerTapped(''),
                        ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              // Type badge.
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: _getFeatureColor(feature.type).withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  _getTypeLabel(feature.type),
                  style: TextStyle(
                    color: _getFeatureColor(feature.type),
                    fontWeight: FontWeight.w600,
                    fontSize: 12,
                  ),
                ),
              ),
              const SizedBox(height: 12),
              // Properties.
              ...feature.properties.entries.map((entry) => Padding(
                    padding: const EdgeInsets.symmetric(vertical: 3),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        SizedBox(
                          width: 120,
                          child: Text(
                            _getPropertyLabel(entry.key),
                            style: TextStyle(
                              color: Colors.grey[600],
                              fontSize: 13,
                            ),
                          ),
                        ),
                        Expanded(
                          child: Text(
                            entry.value.toString(),
                            style: const TextStyle(
                              fontWeight: FontWeight.w500,
                              fontSize: 13,
                            ),
                          ),
                        ),
                      ],
                    ),
                  )),
              const SizedBox(height: 8),
              // Coordinates.
              Row(
                children: [
                  const Icon(Icons.location_on, size: 16, color: Colors.grey),
                  const SizedBox(width: 4),
                  Text(
                    '${feature.position.latitude.toStringAsFixed(5)}, ${feature.position.longitude.toStringAsFixed(5)}',
                    style: TextStyle(color: Colors.grey[600], fontSize: 12),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              // Action buttons.
              Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  if (feature.type == 'geofence' ||
                      feature.type == 'observation_zone' ||
                      feature.type == 'patrol_area')
                    OutlinedButton.icon(
                      onPressed: () {
                        context.read<MapBloc>().add(DeletePolygon(feature.id));
                      },
                      icon: const Icon(Icons.delete_outline, size: 18),
                      label: const Text('Xóa'),
                      style: OutlinedButton.styleFrom(foregroundColor: Colors.red),
                    ),
                  const SizedBox(width: 8),
                  FilledButton.icon(
                    onPressed: () {
                      // Navigate to feature detail page.
                    },
                    icon: const Icon(Icons.info_outline, size: 18),
                    label: const Text('Chi tiết'),
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }

  IconData _getFeatureIcon(String type) {
    switch (type) {
      case 'forest_plot':
        return Icons.forest;
      case 'geofence':
        return Icons.fence;
      case 'observation_zone':
        return Icons.visibility;
      case 'patrol_area':
        return Icons.route;
      case 'alert':
        return Icons.warning_amber_rounded;
      default:
        return Icons.place;
    }
  }

  Color _getFeatureColor(String type) {
    switch (type) {
      case 'forest_plot':
        return const Color(0xFF2E7D32);
      case 'geofence':
        return const Color(0xFFFF9800);
      case 'observation_zone':
        return const Color(0xFF2196F3);
      case 'patrol_area':
        return const Color(0xFF9C27B0);
      case 'alert':
        return const Color(0xFFF44336);
      default:
        return const Color(0xFF607D8B);
    }
  }

  String _getTypeLabel(String type) {
    switch (type) {
      case 'forest_plot':
        return 'Lô rừng';
      case 'geofence':
        return 'Hàng rào địa lý';
      case 'observation_zone':
        return 'Vùng quan sát';
      case 'patrol_area':
        return 'Khu vực tuần tra';
      case 'alert':
        return 'Cảnh báo';
      default:
        return type;
    }
  }

  String _getPropertyLabel(String key) {
    const labels = {
      'plot_type': 'Loại rừng',
      'plot_type_label': 'Loại rừng',
      'area_ha': 'Diện tích (ha)',
      'type': 'Loại',
      'color': 'Màu',
      'points': 'Số điểm',
      'is_active': 'Đang hoạt động',
      'boundary_points': 'Điểm ranh giới',
    };
    return labels[key] ?? key;
  }
}

/// Progress indicator for offline map tile downloads.
class OfflineDownloadProgress extends StatelessWidget {
  const OfflineDownloadProgress({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<MapBloc, MapState>(
      builder: (context, state) {
        if (state.downloadProgress <= 0 || state.downloadProgress >= 1.0) {
          return const SizedBox.shrink();
        }

        return Container(
          margin: const EdgeInsets.all(16),
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.1),
                blurRadius: 8,
              ),
            ],
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Row(
                children: [
                  const Icon(Icons.download, color: Colors.green),
                  const SizedBox(width: 8),
                  const Expanded(
                    child: Text(
                      'Đang tải bản đồ ngoại tuyến...',
                      style: TextStyle(fontWeight: FontWeight.w600),
                    ),
                  ),
                  Text(
                    '${(state.downloadProgress * 100).toStringAsFixed(0)}%',
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              ClipRRect(
                borderRadius: BorderRadius.circular(4),
                child: LinearProgressIndicator(
                  value: state.downloadProgress,
                  backgroundColor: Colors.grey[200],
                  valueColor: const AlwaysStoppedAnimation<Color>(
                    Colors.green,
                  ),
                  minHeight: 8,
                ),
              ),
              const SizedBox(height: 8),
              Align(
                alignment: Alignment.centerRight,
                child: TextButton(
                  onPressed: () {
                    // Cancel download — for now just reset progress.
                    context.read<MapBloc>().add(const EnableOfflineMode());
                  },
                  child: const Text('Hủy bỏ'),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

/// Search bar for the map page.
class MapSearchBar extends StatefulWidget {
  final VoidCallback? onDrawerOpen;

  const MapSearchBar({super.key, this.onDrawerOpen});

  @override
  State<MapSearchBar> createState() => _MapSearchBarState();
}

class _MapSearchBarState extends State<MapSearchBar> {
  final _searchController = TextEditingController();
  bool _isSearching = false;

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.fromLTRB(16, 8, 16, 0),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(28),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.12),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: [
          // Menu button or back.
          if (!_isSearching)
            IconButton(
              icon: const Icon(Icons.menu),
              onPressed: () {
                Scaffold.of(context).openDrawer();
              },
            )
          else
            IconButton(
              icon: const Icon(Icons.arrow_back),
              onPressed: () {
                setState(() {
                  _isSearching = false;
                  _searchController.clear();
                });
              },
            ),
          // Search field.
          Expanded(
            child: TextField(
              controller: _searchController,
              decoration: const InputDecoration(
                hintText: 'Tìm kiếm vị trí...',
                border: InputBorder.none,
                contentPadding: EdgeInsets.symmetric(horizontal: 4),
              ),
              textInputAction: TextInputAction.search,
              onTap: () {
                if (!_isSearching) setState(() => _isSearching = true);
              },
              onSubmitted: (query) {
                if (query.trim().isNotEmpty) {
                  context.read<MapBloc>().add(SearchLocation(query.trim()));
                }
              },
            ),
          ),
          // Search/clear button.
          if (_isSearching && _searchController.text.isNotEmpty)
            IconButton(
              icon: const Icon(Icons.clear),
              onPressed: () {
                _searchController.clear();
              },
            )
          else
            IconButton(
              icon: const Icon(Icons.search),
              onPressed: () {
                setState(() => _isSearching = true);
              },
            ),
          // Layer toggle button.
          IconButton(
            icon: const Icon(Icons.layers),
            onPressed: widget.onDrawerOpen,
          ),
        ],
      ),
    );
  }
}

/// Banner shown when entering or exiting a geofence zone.
class GeofenceAlertBanner extends StatefulWidget {
  final String geofenceName;
  final bool isEntering;

  const GeofenceAlertBanner({
    super.key,
    required this.geofenceName,
    required this.isEntering,
  });

  @override
  State<GeofenceAlertBanner> createState() => _GeofenceAlertBannerState();
}

class _GeofenceAlertBannerState extends State<GeofenceAlertBanner>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 300),
    );
    _controller.forward();
    // Auto dismiss after 4 seconds.
    Future.delayed(const Duration(seconds: 4), () {
      if (mounted) _controller.reverse();
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isEnter = widget.isEntering;
    return SlideTransition(
      position: Tween<Offset>(
        begin: const Offset(0, -1),
        end: Offset.zero,
      ).animate(CurvedAnimation(parent: _controller, curve: Curves.easeOut)),
      child: Container(
        margin: const EdgeInsets.fromLTRB(16, 8, 16, 0),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        decoration: BoxDecoration(
          color: isEnter ? Colors.orange[50] : Colors.grey[100],
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isEnter ? Colors.orange : Colors.grey,
            width: 1.5,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.08),
              blurRadius: 6,
            ),
          ],
        ),
        child: Row(
          children: [
            Icon(
              isEnter ? Icons.fence : Icons.fence,
              color: isEnter ? Colors.orange : Colors.grey,
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    isEnter ? 'Vào khu vực geofence' : 'Rời khu vực geofence',
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 14,
                      color: isEnter ? Colors.orange[900] : Colors.grey[700],
                    ),
                  ),
                  Text(
                    widget.geofenceName,
                    style: TextStyle(
                      fontSize: 12,
                      color: isEnter ? Colors.orange[700] : Colors.grey[500],
                    ),
                  ),
                ],
              ),
            ),
            Icon(
              isEnter ? Icons.arrow_forward : Icons.arrow_back,
              color: isEnter ? Colors.orange : Colors.grey,
              size: 18,
            ),
          ],
        ),
      ),
    );
  }
}

/// NDVI color scale legend widget.
class NdviLegend extends StatelessWidget {
  const NdviLegend({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.grey[300]!),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          const Text(
            'Chỉ số NDVI',
            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
          ),
          const SizedBox(height: 8),
          // Gradient bar.
          Container(
            height: 16,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(4),
              gradient: const LinearGradient(
                colors: [
                  Color(0xFF8B0000),  // Very low (brown/red)
                  Color(0xFFFF8C00),  // Low (orange)
                  Color(0xFFFFD700),  // Medium-low (yellow)
                  Color(0xFF90EE90),  // Medium (light green)
                  Color(0xFF228B22),  // High (green)
                  Color(0xFF006400),  // Very high (dark green)
                ],
              ),
            ),
          ),
          const SizedBox(height: 4),
          // Labels.
          const Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('-1.0', style: TextStyle(fontSize: 10, color: Colors.grey)),
              Text('0', style: TextStyle(fontSize: 10, color: Colors.grey)),
              Text('+1.0', style: TextStyle(fontSize: 10, color: Colors.grey)),
            ],
          ),
          const SizedBox(height: 8),
          // Descriptions.
          _NdviLevelRow(color: Color(0xFF8B0000), label: 'Không có thảm thực vật'),
          _NdviLevelRow(color: Color(0xFFFFD700), label: 'Thảm thực vật thưa'),
          _NdviLevelRow(color: Color(0xFF228B22), label: 'Thảm thực vật dày'),
        ],
      ),
    );
  }
}

class _NdviLevelRow extends StatelessWidget {
  final Color color;
  final String label;

  const _NdviLevelRow({required this.color, required this.label});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2),
      child: Row(
        children: [
          Container(
            width: 12,
            height: 12,
            decoration: BoxDecoration(
              color: color,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const SizedBox(width: 8),
          Text(label, style: const TextStyle(fontSize: 11)),
        ],
      ),
    );
  }
}

/// Offline mode indicator banner.
class OfflineModeBanner extends StatelessWidget {
  const OfflineModeBanner({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<MapBloc, MapState>(
      builder: (context, state) {
        if (!state.offlineMode) return const SizedBox.shrink();

        return Container(
          margin: const EdgeInsets.fromLTRB(16, 8, 16, 0),
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
          decoration: BoxDecoration(
            color: Colors.amber[100],
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: Colors.amber),
          ),
          child: Row(
            children: [
              Icon(Icons.cloud_off, color: Colors.amber[800], size: 20),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  'Chế độ ngoại tuyến — Dữ liệu có thể không cập nhật',
                  style: TextStyle(
                    color: Colors.amber[900],
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
