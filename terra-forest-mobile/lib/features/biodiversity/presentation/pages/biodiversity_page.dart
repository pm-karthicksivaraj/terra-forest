import 'package:flutter/material.dart';
import '../../../../core/constants/app_constants.dart';
import '../../../../core/theme/app_theme.dart';
import '../widgets/biodiversity_widgets.dart';

class BiodiversityPage extends StatefulWidget {
  const BiodiversityPage({super.key});

  @override
  State<BiodiversityPage> createState() => _BiodiversityPageState();
}

class _BiodiversityPageState extends State<BiodiversityPage> {
  String _searchQuery = '';
  String _filterTab = 'all';

  final List<Map<String, dynamic>> _species = _getMockSpecies();

  @override
  Widget build(BuildContext context) {
    final filteredSpecies = _filterSpecies();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Đa dạng sinh học'),
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(12),
            child: TextField(
              decoration: InputDecoration(
                hintText: 'Tìm kiếm loài...',
                prefixIcon: const Icon(Icons.search),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
                contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              ),
              onChanged: (value) {
                setState(() => _searchQuery = value);
              },
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12),
            child: Row(
              children: [
                _filterChip('all', 'Tất cả'),
                const SizedBox(width: 6),
                _filterChip('animal', 'Động vật'),
                const SizedBox(width: 6),
                _filterChip('plant', 'Thực vật'),
                const SizedBox(width: 6),
                _filterChip('medicinal', 'Cây thuốc'),
              ],
            ),
          ),
          const SizedBox(height: 8),
          Expanded(
            child: filteredSpecies.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.pets, size: 64, color: Colors.grey[400]),
                        const SizedBox(height: 16),
                        const Text(
                          'Không tìm thấy loài nào',
                          style: TextStyle(color: Colors.grey, fontSize: 16),
                        ),
                      ],
                    ),
                  )
                : ListView.separated(
                    padding: const EdgeInsets.all(12),
                    itemCount: filteredSpecies.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 8),
                    itemBuilder: (context, index) {
                      final species = filteredSpecies[index];
                      return SpeciesCard(
                        species: species,
                        onTap: () => _showSpeciesDetail(context, species),
                      );
                    },
                  ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          _showAddObservation(context);
        },
        child: const Icon(Icons.add),
      ),
    );
  }

  Widget _filterChip(String value, String label) {
    final isSelected = _filterTab == value;
    return FilterChip(
      selected: isSelected,
      label: Text(label, style: const TextStyle(fontSize: 12)),
      onSelected: (_) {
        setState(() => _filterTab = value);
      },
    );
  }

  List<Map<String, dynamic>> _filterSpecies() {
    var result = _species;
    if (_filterTab != 'all') {
      result = result.where((s) => s['category'] == _filterTab).toList();
    }
    if (_searchQuery.isNotEmpty) {
      final query = _searchQuery.toLowerCase();
      result = result.where((s) {
        final viName = (s['name_vi'] as String).toLowerCase();
        final sciName = (s['scientific_name'] as String).toLowerCase();
        final commonName = (s['common_name'] as String).toLowerCase();
        return viName.contains(query) || sciName.contains(query) || commonName.contains(query);
      }).toList();
    }
    return result;
  }

  void _showSpeciesDetail(BuildContext context, Map<String, dynamic> species) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (ctx) {
        return DraggableScrollableSheet(
          initialChildSize: 0.7,
          minChildSize: 0.3,
          maxChildSize: 0.95,
          expand: false,
          builder: (_, scrollController) {
            return SingleChildScrollView(
              controller: scrollController,
              padding: const EdgeInsets.all(16),
              child: Column(
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
                  Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              species['name_vi'] as String,
                              style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w700),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              species['scientific_name'] as String,
                              style: TextStyle(fontSize: 14, fontStyle: FontStyle.italic, color: Colors.grey[600]),
                            ),
                          ],
                        ),
                      ),
                      IucnStatusBadge(status: species['iucn_status'] as String),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Text(
                    'Tên thường: ${species['common_name']}',
                    style: const TextStyle(fontSize: 14),
                  ),
                  const SizedBox(height: 12),
                  Container(
                    height: 160,
                    width: double.infinity,
                    decoration: BoxDecoration(
                      color: ForestColor.forest100,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: ForestColor.forest300),
                    ),
                    child: Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            species['category'] == 'animal' ? Icons.pets : Icons.local_florist,
                            size: 40,
                            color: ForestColor.forest600,
                          ),
                          const SizedBox(height: 8),
                          Text(
                            'Bản đồ phân bổ',
                            style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  const Text('Quan sát gần đây', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 8),
                  ...(species['observations'] as List<dynamic>).map((obs) {
                    return ObservationListItem(observation: obs as Map<String, dynamic>);
                  }),
                ],
              ),
            );
          },
        );
      },
    );
  }

  void _showAddObservation(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (ctx) {
        return const AddObservationForm();
      },
    );
  }

  static List<Map<String, dynamic>> _getMockSpecies() {
    return [
      {
        'id': 'sp_001',
        'name_vi': 'Vọoc chà vá chân nâu',
        'scientific_name': 'Pygathrix nemaeus',
        'common_name': 'Red-shanked Douc',
        'iucn_status': AppConstants.conservationCR,
        'category': 'animal',
        'observation_count': 12,
        'observations': [
          {'date': '2025-02-20', 'location': 'Lô BP-001', 'count': 3},
          {'date': '2025-01-15', 'location': 'Lô BP-003', 'count': 5},
        ],
      },
      {
        'id': 'sp_002',
        'name_vi': 'Gấu ngựa',
        'scientific_name': 'Helarctos malayanus',
        'common_name': 'Sun Bear',
        'iucn_status': AppConstants.conservationVU,
        'category': 'animal',
        'observation_count': 4,
        'observations': [
          {'date': '2025-02-10', 'location': 'Lô DN-002', 'count': 1},
        ],
      },
      {
        'id': 'sp_003',
        'name_vi': 'Cây giáng hương',
        'scientific_name': 'Pterocarpus macrocarpus',
        'common_name': 'Burmese Rosewood',
        'iucn_status': AppConstants.conservationEN,
        'category': 'plant',
        'observation_count': 28,
        'observations': [
          {'date': '2025-02-18', 'location': 'Lô LD-001', 'count': 15},
          {'date': '2025-01-25', 'location': 'Lô LD-003', 'count': 13},
        ],
      },
      {
        'id': 'sp_004',
        'name_vi': 'Trầm hương',
        'scientific_name': 'Aquilaria crassna',
        'common_name': 'Agarwood',
        'iucn_status': AppConstants.conservationCR,
        'category': 'medicinal',
        'observation_count': 6,
        'observations': [
          {'date': '2025-02-05', 'location': 'Lô DL-002', 'count': 2},
        ],
      },
      {
        'id': 'sp_005',
        'name_vi': 'Voọc bạc Đông Dương',
        'scientific_name': 'Trachypithecus germaini',
        'common_name': 'Indochinese Silvered Langur',
        'iucn_status': AppConstants.conservationEN,
        'category': 'animal',
        'observation_count': 8,
        'observations': [
          {'date': '2025-02-15', 'location': 'Lô CM-001', 'count': 4},
        ],
      },
      {
        'id': 'sp_006',
        'name_vi': 'Cây sao đen',
        'scientific_name': 'Dalbergia oliveri',
        'common_name': 'Burmese Rosewood',
        'iucn_status': AppConstants.conservationEN,
        'category': 'plant',
        'observation_count': 15,
        'observations': [
          {'date': '2025-02-12', 'location': 'Lô BP-002', 'count': 8},
        ],
      },
      {
        'id': 'sp_007',
        'name_vi': 'Ba kích',
        'scientific_name': 'Morinda officinalis',
        'common_name': 'Indian Mulberry',
        'iucn_status': AppConstants.conservationNT,
        'category': 'medicinal',
        'observation_count': 22,
        'observations': [
          {'date': '2025-02-08', 'location': 'Lô LD-002', 'count': 10},
        ],
      },
      {
        'id': 'sp_008',
        'name_vi': 'Hổ Đông Dương',
        'scientific_name': 'Panthera tigris corbetti',
        'common_name': 'Indochinese Tiger',
        'iucn_status': AppConstants.conservationEN,
        'category': 'animal',
        'observation_count': 1,
        'observations': [
          {'date': '2024-12-20', 'location': 'Lô DN-005', 'count': 1},
        ],
      },
    ];
  }
}
