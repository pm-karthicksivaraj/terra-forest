import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/constants/app_constants.dart';
import '../../../../core/theme/app_theme.dart';
import '../bloc/evidence_bloc.dart';
import '../widgets/evidence_widgets.dart';
import 'evidence_upload_page.dart';

class EvidencePage extends StatelessWidget {
  final String taskId;

  /// If [taskId] is empty, shows all evidence across all tasks (used from bottom nav).
  const EvidencePage({super.key, required this.taskId});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Bằng chứng'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () {
              context.read<EvidenceBloc>().add(LoadEvidence(taskId: taskId));
            },
          ),
        ],
      ),
      body: Column(
        children: [
          const _EvidenceFilterBar(),
          Expanded(
            child: BlocConsumer<EvidenceBloc, EvidenceState>(
              listener: (context, state) {
                if (state is EvidenceError) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text(state.message)),
                  );
                }
              },
              builder: (context, state) {
                if (state is EvidenceLoading) {
                  return const Center(child: CircularProgressIndicator());
                }

                if (state is EvidenceUploading) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        CircularProgressIndicator(value: state.progress),
                        const SizedBox(height: 16),
                        Text('Đang tải lên... ${(state.progress * 100).toStringAsFixed(0)}%'),
                      ],
                    ),
                  );
                }

                if (state is EvidenceLoaded) {
                  if (state.evidenceList.isEmpty) {
                    return Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.folder_open, size: 64, color: Colors.grey[400]),
                          const SizedBox(height: 16),
                          const Text(
                            'Chưa có bằng chứng nào',
                            style: TextStyle(color: Colors.grey, fontSize: 16),
                          ),
                        ],
                      ),
                    );
                  }

                  return RefreshIndicator(
                    onRefresh: () async {
                      context.read<EvidenceBloc>().add(LoadEvidence(taskId: taskId));
                    },
                    child: ListView.separated(
                      padding: const EdgeInsets.all(16),
                      itemCount: state.evidenceList.length,
                      separatorBuilder: (_, __) => const SizedBox(height: 8),
                      itemBuilder: (context, index) {
                        final evidence = state.evidenceList[index];
                        return EvidenceThumbnail(
                          evidence: evidence,
                          onTap: () {
                            _showEvidenceDetail(context, evidence);
                          },
                          onDelete: () {
                            context.read<EvidenceBloc>().add(DeleteEvidence(id: evidence.id));
                          },
                        );
                      },
                    ),
                  );
                }

                return const SizedBox.shrink();
              },
            ),
          ),
        ],
      ),
      floatingActionButton: BlocBuilder<EvidenceBloc, EvidenceState>(
        builder: (context, state) {
          final pendingCount = state is EvidenceLoaded ? state.pendingCount : 0;
          if (pendingCount > 0) {
            return FloatingActionButton.extended(
              onPressed: () {
                context.read<EvidenceBloc>().add(const UploadPending());
              },
              icon: const Icon(Icons.cloud_upload),
              label: Text('Tải lên tất cả ($pendingCount)'),
            );
          }
          return FloatingActionButton(
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute(
                  builder: (_) => EvidenceUploadPage(taskId: taskId),
                ),
              );
            },
            child: const Icon(Icons.add),
          );
        },
      ),
    );
  }

  void _showEvidenceDetail(BuildContext context, dynamic evidence) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (ctx) {
        return DraggableScrollableSheet(
          initialChildSize: 0.6,
          minChildSize: 0.3,
          maxChildSize: 0.9,
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
                      Icon(
                        _typeIcon(evidence.proofType),
                        color: _typeColor(evidence.proofType),
                        size: 28,
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              AppConstants.evidenceTypeDisplayNames[evidence.proofType] ?? evidence.proofType,
                              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                            ),
                            Text(
                              evidence.fileSizeFormatted,
                              style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                            ),
                          ],
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: evidence.syncStatus == 'synced'
                              ? StatusColor.low.withOpacity(0.15)
                              : StatusColor.medium.withOpacity(0.15),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          evidence.syncStatus == 'synced' ? 'Đã đồng bộ' : 'Chờ tải lên',
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                            color: evidence.syncStatus == 'synced' ? StatusColor.low : StatusColor.medium,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  if (evidence.description != null && evidence.description!.isNotEmpty) ...[
                    const Text('Mô tả', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                    const SizedBox(height: 4),
                    Text(evidence.description!, style: const TextStyle(fontSize: 13)),
                    const SizedBox(height: 12),
                  ],
                  if (evidence.latitude != null && evidence.longitude != null) ...[
                    const Text('Vị trí GPS', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                    const SizedBox(height: 4),
                    Text('${evidence.latitude!.toStringAsFixed(6)}, ${evidence.longitude!.toStringAsFixed(6)}', style: const TextStyle(fontSize: 13)),
                    const SizedBox(height: 12),
                  ],
                  Text(
                    'Thời gian: ${_formatDateTime(evidence.recordedAt)}',
                    style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  IconData _typeIcon(String type) {
    final iconCode = AppConstants.evidenceTypeIcons[type];
    return iconCode != null ? IconData(iconCode, fontFamily: 'MaterialIcons') : Icons.insert_drive_file;
  }

  Color _typeColor(String type) {
    switch (type) {
      case 'photo':
        return const Color(0xFF0284C7);
      case 'video':
        return StatusColor.critical;
      case 'voice_note':
        return StatusColor.medium;
      case 'document':
        return ForestColor.forest600;
      case 'gps_track':
        return const Color(0xFF7C3AED);
      default:
        return ForestColor.forest600;
    }
  }

  String _formatDateTime(DateTime dt) {
    return '${dt.day.toString().padLeft(2, '0')}/${dt.month.toString().padLeft(2, '0')}/${dt.year} ${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')}';
  }
}

class _EvidenceFilterBar extends StatefulWidget {
  const _EvidenceFilterBar();

  @override
  State<_EvidenceFilterBar> createState() => _EvidenceFilterBarState();
}

class _EvidenceFilterBarState extends State<_EvidenceFilterBar> {
  String _filter = '';
  bool _isGridView = false;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      child: Row(
        children: [
          Expanded(
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  _filterChip('Tất cả', ''),
                  const SizedBox(width: 4),
                  _filterChip('Ảnh', AppConstants.evidencePhoto),
                  const SizedBox(width: 4),
                  _filterChip('Video', AppConstants.evidenceVideo),
                  const SizedBox(width: 4),
                  _filterChip('Ghi âm', AppConstants.evidenceVoiceNote),
                  const SizedBox(width: 4),
                  _filterChip('Tài liệu', AppConstants.evidenceDocument),
                ],
              ),
            ),
          ),
          const SizedBox(width: 8),
          IconButton(
            icon: Icon(_isGridView ? Icons.list : Icons.grid_view),
            onPressed: () {
              setState(() => _isGridView = !_isGridView);
            },
          ),
        ],
      ),
    );
  }

  Widget _filterChip(String label, String type) {
    final isSelected = _filter == type;
    return FilterChip(
      selected: isSelected,
      label: Text(label, style: const TextStyle(fontSize: 11)),
      onSelected: (_) {
        setState(() => _filter = isSelected ? '' : type);
      },
    );
  }
}
