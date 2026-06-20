import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/theme/app_theme.dart';
import '../bloc/ota_bloc.dart';

class OtaPage extends StatelessWidget {
  const OtaPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Cập nhật ứng dụng'),
      ),
      body: BlocConsumer<OtaBloc, OtaState>(
        listener: (context, state) {
          if (state is OtaError) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text(state.message)),
            );
          }
        },
        builder: (context, state) {
          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildCurrentVersion(context),
                const SizedBox(height: 24),
                _buildStateContent(context, state),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildCurrentVersion(BuildContext context) {
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
              color: ForestColor.forest100,
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(Icons.info_outline, color: ForestColor.forest600),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Phiên bản hiện tại',
                  style: TextStyle(fontSize: 12, color: Colors.grey),
                ),
                const SizedBox(height: 2),
                const Text(
                  '1.1.0',
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700),
                ),
              ],
            ),
          ),
          OutlinedButton(
            onPressed: () {
              context.read<OtaBloc>().add(const OtaCheckRequested());
            },
            child: const Text('Kiểm tra cập nhật'),
          ),
        ],
      ),
    );
  }

  Widget _buildStateContent(BuildContext context, OtaState state) {
    if (state is OtaChecking) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(48),
          child: Column(
            children: [
              const CircularProgressIndicator(),
              const SizedBox(height: 16),
              Text(
                'Đang kiểm tra cập nhật...',
                style: TextStyle(color: Colors.grey[600]),
              ),
            ],
          ),
        ),
      );
    }

    if (state is OtaNoUpdate) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(48),
          child: Column(
            children: [
              const Icon(Icons.check_circle, size: 64, color: StatusColor.low),
              const SizedBox(height: 16),
              const Text(
                'Ứng dụng đã được cập nhật',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 8),
              Text(
                'Phiên bản: ${state.currentVersion}',
                style: TextStyle(color: Colors.grey[600]),
              ),
            ],
          ),
        ),
      );
    }

    if (state is OtaUpdateAvailable) {
      final update = state.update;
      return _buildUpdateAvailable(context, update);
    }

    if (state is OtaDownloading) {
      final update = state.update;
      return _buildDownloading(context, state.progress, update.fileSizeFormatted, update.isMandatory);
    }

    if (state is OtaReadyToInstall) {
      final update = state.update;
      return _buildReadyToInstall(context, update.version);
    }

    if (state is OtaInstalling) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(48),
          child: Column(
            children: [
              const CircularProgressIndicator(),
              const SizedBox(height: 16),
              const Text(
                'Đang cài đặt cập nhật...',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 8),
              Text(
                'Vui lòng đợi, ứng dụng sẽ khởi động lại sau khi cài đặt xong.',
                style: TextStyle(color: Colors.grey[600]),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      );
    }

    if (state is OtaError) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(48),
          child: Column(
            children: [
              const Icon(Icons.error_outline, size: 64, color: StatusColor.critical),
              const SizedBox(height: 16),
              const Text(
                'Lỗi cập nhật',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 8),
              Text(
                state.message,
                style: TextStyle(color: Colors.grey[600]),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () {
                  context.read<OtaBloc>().add(const OtaCheckRequested());
                },
                child: const Text('Thử lại'),
              ),
            ],
          ),
        ),
      );
    }

    return Center(
      child: Column(
        children: [
          const SizedBox(height: 48),
          Icon(Icons.system_update, size: 64, color: Colors.grey[400]),
          const SizedBox(height: 16),
          const Text('Nhấn kiểm tra cập nhật để bắt đầu'),
        ],
      ),
    );
  }

  Widget _buildUpdateAvailable(BuildContext context, dynamic update) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Theme.of(context).dividerColor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.system_update, color: ForestColor.forest600, size: 28),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Cập nhật ${update.version} có sẵn',
                      style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'Kích thước: ${update.fileSizeFormatted}',
                      style: TextStyle(fontSize: 13, color: Colors.grey[600]),
                    ),
                  ],
                ),
              ),
              if (update.isMandatory)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: StatusColor.critical.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: const Text(
                    'Bắt buộc',
                    style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: StatusColor.critical),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 16),
          const Text(
            'Ghi chú phát hành',
            style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 6),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: ForestColor.forest100.withOpacity(0.5),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text(
              update.releaseNotes,
              style: const TextStyle(fontSize: 13),
            ),
          ),
          if (update.rolloutPct < 100) ...[
            const SizedBox(height: 12),
            Text(
              'Phân phối dần: ${update.rolloutPct}% người dùng',
              style: TextStyle(fontSize: 12, color: Colors.grey[600]),
            ),
          ],
          const SizedBox(height: 20),
          SizedBox(
            width: double.infinity,
            height: 48,
            child: ElevatedButton.icon(
              onPressed: () {
                context.read<OtaBloc>().add(OtaDownloadStarted(updateId: update.id));
              },
              icon: const Icon(Icons.download),
              label: const Text('Tải xuống'),
            ),
          ),
          if (update.isMandatory) ...[
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: StatusColor.criticalLight,
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Row(
                children: [
                  Icon(Icons.warning_amber, color: StatusColor.critical, size: 20),
                  SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Cập nhật này là bắt buộc. Ứng dụng sẽ không hoạt động cho đến khi cập nhật.',
                      style: TextStyle(fontSize: 12, color: StatusColor.critical),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildDownloading(BuildContext context, double progress, String fileSize, bool isMandatory) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Theme.of(context).dividerColor),
      ),
      child: Column(
        children: [
          const Icon(Icons.cloud_download, color: ForestColor.forest600, size: 48),
          const SizedBox(height: 16),
          const Text(
            'Đang tải xuống...',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 8),
          Text(
            '${(progress * 100).toStringAsFixed(0)}% - $fileSize',
            style: TextStyle(color: Colors.grey[600]),
          ),
          const SizedBox(height: 16),
          ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: LinearProgressIndicator(
              value: progress,
              minHeight: 8,
              backgroundColor: Theme.of(context).dividerColor,
            ),
          ),
          const SizedBox(height: 16),
          if (!isMandatory)
            OutlinedButton(
              onPressed: () {
                context.read<OtaBloc>().add(const OtaCancelDownload());
              },
              child: const Text('Hủy'),
            ),
        ],
      ),
    );
  }

  Widget _buildReadyToInstall(BuildContext context, String version) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: StatusColor.low.withOpacity(0.3)),
      ),
      child: Column(
        children: [
          const Icon(Icons.check_circle, color: StatusColor.low, size: 48),
          const SizedBox(height: 16),
          const Text(
            'Cập nhật đã sẵn sàng',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 8),
          Text(
            'Phiên bản $version đã được tải xuống và sẵn sàng cài đặt.',
            style: TextStyle(color: Colors.grey[600]),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 20),
          SizedBox(
            width: double.infinity,
            height: 48,
            child: ElevatedButton.icon(
              onPressed: () {
                context.read<OtaBloc>().add(OtaInstallRequested(updateId: version));
              },
              icon: const Icon(Icons.install_mobile),
              label: const Text('Cài đặt'),
            ),
          ),
          const SizedBox(height: 8),
          SizedBox(
            width: double.infinity,
            height: 48,
            child: OutlinedButton.icon(
              onPressed: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Khởi động lại ứng dụng để hoàn tất cài đặt')),
                );
              },
              icon: const Icon(Icons.restart_alt),
              label: const Text('Khởi động lại'),
            ),
          ),
        ],
      ),
    );
  }
}
