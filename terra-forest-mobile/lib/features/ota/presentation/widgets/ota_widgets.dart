import 'package:flutter/material.dart';
import '../../../../core/theme/app_theme.dart';
import '../../domain/entities/ota_update.dart';

class OtaVersionCard extends StatelessWidget {
  final String version;
  final String? newerVersion;
  final bool isUpToDate;

  const OtaVersionCard({
    super.key,
    required this.version,
    this.newerVersion,
    this.isUpToDate = true,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
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
              color: isUpToDate ? StatusColor.low.withOpacity(0.1) : StatusColor.medium.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(
              isUpToDate ? Icons.check_circle : Icons.system_update,
              color: isUpToDate ? StatusColor.low : StatusColor.medium,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Phiên bản hiện tại', style: TextStyle(fontSize: 12, color: Colors.grey)),
                Text(version, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w700)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class OtaDownloadProgress extends StatelessWidget {
  final double progress;
  final String fileSize;

  const OtaDownloadProgress({
    super.key,
    required this.progress,
    required this.fileSize,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        ClipRRect(
          borderRadius: BorderRadius.circular(8),
          child: LinearProgressIndicator(
            value: progress,
            minHeight: 8,
            backgroundColor: Theme.of(context).dividerColor,
          ),
        ),
        const SizedBox(height: 8),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              '${(progress * 100).toStringAsFixed(0)}%',
              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
            ),
            Text(
              fileSize,
              style: TextStyle(fontSize: 13, color: Colors.grey[600]),
            ),
          ],
        ),
      ],
    );
  }
}

class OtaMandatoryBanner extends StatelessWidget {
  const OtaMandatoryBanner({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: StatusColor.criticalLight,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: StatusColor.critical.withOpacity(0.3)),
      ),
      child: const Row(
        children: [
          Icon(Icons.warning_amber, color: StatusColor.critical, size: 20),
          SizedBox(width: 8),
          Expanded(
            child: Text(
              'Cập nhật bắt buộc. Vui lòng cập nhật để tiếp tục sử dụng ứng dụng.',
              style: TextStyle(fontSize: 12, color: StatusColor.critical),
            ),
          ),
        ],
      ),
    );
  }
}

class OtaReleaseNotes extends StatelessWidget {
  final String notes;

  const OtaReleaseNotes({super.key, required this.notes});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: ForestColor.forest100.withOpacity(0.5),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Ghi chú phát hành',
            style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 6),
          Text(notes, style: const TextStyle(fontSize: 13)),
        ],
      ),
    );
  }
}
