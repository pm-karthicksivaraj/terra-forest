import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../bloc/ota_bloc.dart';

class OtaUpdatePage extends StatelessWidget {
  const OtaUpdatePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Cập nhật'),
      ),
      body: BlocBuilder<OtaBloc, OtaState>(
        builder: (context, state) {
          if (state is OtaChecking) {
            return const Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  CircularProgressIndicator(),
                  SizedBox(height: 16),
                  Text('Đang kiểm tra cập nhật...'),
                ],
              ),
            );
          }

          if (state is OtaNoUpdate) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.check_circle, size: 64, color: Colors.green),
                  const SizedBox(height: 16),
                  const Text('Ứng dụng đã được cập nhật'),
                  const SizedBox(height: 8),
                  Text('Phiên bản: ${state.currentVersion}'),
                ],
              ),
            );
          }

          if (state is OtaUpdateAvailable) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.system_update, size: 64, color: Colors.blue),
                    const SizedBox(height: 16),
                    Text(
                      'Cập nhật ${state.update.version} có sẵn',
                      style: const TextStyle(fontSize: 18),
                    ),
                    const SizedBox(height: 16),
                    Text(state.update.releaseNotes),
                    const SizedBox(height: 24),
                    FilledButton(
                      onPressed: () {},
                      child: const Text('Tải xuống'),
                    ),
                  ],
                ),
              ),
            );
          }

          if (state is OtaDownloading) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    CircularProgressIndicator(value: state.progress),
                    const SizedBox(height: 16),
                    Text('Đang tải... ${(state.progress * 100).toStringAsFixed(0)}%'),
                  ],
                ),
              ),
            );
          }

          return const Center(child: Text('OTA Update Page'));
        },
      ),
    );
  }
}
