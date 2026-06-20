import 'package:flutter/material.dart';
import '../../../../core/constants/app_constants.dart';
import '../../../../core/theme/app_theme.dart';

class SpeciesCard extends StatelessWidget {
  final Map<String, dynamic> species;
  final VoidCallback onTap;

  const SpeciesCard({
    super.key,
    required this.species,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final iucnStatus = species['iucn_status'] as String? ?? 'LC';
    final category = species['category'] as String? ?? 'plant';

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Theme.of(context).cardColor,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Theme.of(context).dividerColor),
        ),
        child: Row(
          children: [
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: category == 'animal'
                    ? const Color(0xFF7C3AED).withOpacity(0.1)
                    : category == 'medicinal'
                        ? StatusColor.medium.withOpacity(0.1)
                        : ForestColor.forest100,
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(
                category == 'animal' ? Icons.pets : category == 'medicinal' ? Icons.local_pharmacy : Icons.local_florist,
                color: category == 'animal'
                    ? const Color(0xFF7C3AED)
                    : category == 'medicinal'
                        ? StatusColor.medium
                        : ForestColor.forest600,
                size: 24,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          species['name_vi'] as String? ?? '',
                          style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      IucnStatusBadge(status: iucnStatus),
                    ],
                  ),
                  const SizedBox(height: 2),
                  Text(
                    species['scientific_name'] as String? ?? '',
                    style: TextStyle(fontSize: 12, fontStyle: FontStyle.italic, color: Colors.grey[600]),
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 2),
                  Row(
                    children: [
                      Text(
                        species['common_name'] as String? ?? '',
                        style: TextStyle(fontSize: 11, color: Colors.grey[500]),
                      ),
                      const Spacer(),
                      Icon(Icons.visibility, size: 14, color: Colors.grey[500]),
                      const SizedBox(width: 4),
                      Text(
                        '${species['observation_count'] ?? 0}',
                        style: TextStyle(fontSize: 11, color: Colors.grey[500]),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(width: 8),
            const Icon(Icons.chevron_right, size: 18),
          ],
        ),
      ),
    );
  }
}

class IucnStatusBadge extends StatelessWidget {
  final String status;

  const IucnStatusBadge({super.key, required this.status});

  @override
  Widget build(BuildContext context) {
    final color = AppConstants.conservationStatusColors[status] ?? StatusColor.low;
    final lightColor = AppConstants.conservationStatusLightColors[status] ?? StatusColor.lowLight;
    final viName = AppConstants.conservationStatusNamesVi[status] ?? status;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: lightColor,
        borderRadius: BorderRadius.circular(4),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            status,
            style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: color),
          ),
          const SizedBox(width: 3),
          Text(
            viName,
            style: TextStyle(fontSize: 9, fontWeight: FontWeight.w600, color: color),
          ),
        ],
      ),
    );
  }
}

class ObservationListItem extends StatelessWidget {
  final Map<String, dynamic> observation;

  const ObservationListItem({super.key, required this.observation});

  @override
  Widget build(BuildContext context) {
    return ListTile(
      dense: true,
      contentPadding: EdgeInsets.zero,
      leading: const Icon(Icons.location_on_outlined, size: 18, color: ForestColor.forest600),
      title: Text(
        observation['location'] as String? ?? '',
        style: const TextStyle(fontSize: 13),
      ),
      subtitle: Text(
        observation['date'] as String? ?? '',
        style: TextStyle(fontSize: 11, color: Colors.grey[600]),
      ),
      trailing: Text(
        '${observation['count'] ?? 0} cá thể',
        style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
      ),
    );
  }
}

class AddObservationForm extends StatefulWidget {
  const AddObservationForm({super.key});

  @override
  State<AddObservationForm> createState() => _AddObservationFormState();
}

class _AddObservationFormState extends State<AddObservationForm> {
  final _speciesController = TextEditingController();
  final _countController = TextEditingController();
  final _locationController = TextEditingController();
  final _noteController = TextEditingController();

  @override
  void dispose() {
    _speciesController.dispose();
    _countController.dispose();
    _locationController.dispose();
    _noteController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        left: 16,
        right: 16,
        top: 16,
        bottom: MediaQuery.of(context).viewInsets.bottom + 16,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Center(
            child: Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: Colors.grey[300],
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const SizedBox(height: 16),
          const Text(
            'Thêm quan sát',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 16),
          TextField(
            controller: _speciesController,
            decoration: const InputDecoration(
              labelText: 'Tên loài',
              hintText: 'Nhập tên loài...',
              border: OutlineInputBorder(),
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                flex: 1,
                child: TextField(
                  controller: _countController,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(
                    labelText: 'Số lượng',
                    hintText: '0',
                    border: OutlineInputBorder(),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                flex: 2,
                child: TextField(
                  controller: _locationController,
                  decoration: const InputDecoration(
                    labelText: 'Vị trí',
                    hintText: 'Lô rừng...',
                    border: OutlineInputBorder(),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _noteController,
            maxLines: 2,
            decoration: const InputDecoration(
              labelText: 'Ghi chú',
              hintText: 'Mô tả thêm...',
              border: OutlineInputBorder(),
            ),
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            height: 48,
            child: ElevatedButton(
              onPressed: () {
                Navigator.of(context).pop();
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Quan sát đã được thêm')),
                );
              },
              child: const Text('Lưu quan sát'),
            ),
          ),
        ],
      ),
    );
  }
}
