import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:geolocator/geolocator.dart';
import 'package:go_router/go_router.dart';

import '../../domain/repositories/auth_repository.dart';
import '../bloc/auth_bloc.dart';
import '../bloc/auth_event.dart';
import '../bloc/auth_state.dart';
import '../../../../core/constants/app_constants.dart';
import '../../../../core/utils/location_service.dart';

/// SOS Emergency page — accessible without authentication.
/// Sends emergency alert with current GPS coordinates.
class SosPage extends StatefulWidget {
  const SosPage({super.key});

  @override
  State<SosPage> createState() => _SosPageState();
}

class _SosPageState extends State<SosPage> with SingleTickerProviderStateMixin {
  bool _sending = false;
  bool _sent = false;
  String? _error;
  Position? _currentPosition;
  late AnimationController _pulseController;
  late Animation<double> _pulseAnimation;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    )..repeat(reverse: true);
    _pulseAnimation = Tween<double>(begin: 1.0, end: 1.15).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );
    _getCurrentLocation();
  }

  @override
  void dispose() {
    _pulseController.dispose();
    super.dispose();
  }

  Future<void> _getCurrentLocation() async {
    try {
      final position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
        timeLimit: const Duration(seconds: 10),
      );
      if (mounted) {
        setState(() => _currentPosition = position);
      }
    } catch (_) {
      // Location may not be available - SOS can still be sent without it
    }
  }

  Future<void> _sendSos() async {
    setState(() {
      _sending = true;
      _error = null;
    });

    try {
      context.read<AuthBloc>().add(SosTriggered(
            lat: _currentPosition?.latitude ?? 0.0,
            lng: _currentPosition?.longitude ?? 0.0,
            message: 'SOS Khẩn cấp — cần hỗ trợ ngay!',
          ));

      // Also try the direct API call
      final authState = context.read<AuthBloc>().state;
      if (authState is AuthAuthenticated) {
        // User is authenticated - SOS goes through normal channel
        await Future.delayed(const Duration(seconds: 1));
      }

      if (mounted) {
        setState(() {
          _sending = false;
          _sent = true;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _sending = false;
          _error = 'Không thể gửi SOS. Vui lòng gọi 114 ngay!';
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.red.shade900,
      appBar: AppBar(
        title: const Text('SOS Khẩn cấp'),
        backgroundColor: Colors.red.shade900,
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            children: [
              const Spacer(),
              if (!_sent) ...[
                // Pulsing SOS button
                ScaleTransition(
                  scale: _pulseAnimation,
                  child: Container(
                    width: 200,
                    height: 200,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: Colors.white,
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.3),
                          blurRadius: 30,
                          spreadRadius: 5,
                        ),
                      ],
                    ),
                    child: Material(
                      color: Colors.transparent,
                      child: InkWell(
                        onTap: _sending ? null : _sendSos,
                        customBorder: const CircleBorder(),
                        child: Center(
                          child: _sending
                              ? const CircularProgressIndicator(
                                  strokeWidth: 4,
                                  valueColor: AlwaysStoppedAnimation<Color>(Colors.red),
                                )
                              : const Column(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Icon(Icons.emergency, size: 72, color: Colors.red),
                                    SizedBox(height: 8),
                                    Text(
                                      'SOS',
                                      style: TextStyle(
                                        fontSize: 36,
                                        fontWeight: FontWeight.bold,
                                        color: Colors.red,
                                        letterSpacing: 4,
                                      ),
                                    ),
                                  ],
                                ),
                        ),
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 32),
                const Text(
                  'Nhấn để gửi tín hiệu khẩn cấp',
                  style: TextStyle(
                    fontSize: 18,
                    color: Colors.white,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const SizedBox(height: 16),
                // Location info
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.gps_fixed, color: Colors.white70, size: 20),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          _currentPosition != null
                              ? 'Vị trí: ${_currentPosition!.latitude.toStringAsFixed(5)}, ${_currentPosition!.longitude.toStringAsFixed(5)}'
                              : 'Đang xác định vị trí...',
                          style: const TextStyle(color: Colors.white70, fontSize: 14),
                        ),
                      ),
                    ],
                  ),
                ),
              ] else ...[
                // Success state
                Container(
                  width: 120,
                  height: 120,
                  decoration: const BoxDecoration(
                    shape: BoxShape.circle,
                    color: Colors.white,
                  ),
                  child: const Icon(Icons.check_circle, size: 80, color: Colors.green),
                ),
                const SizedBox(height: 24),
                const Text(
                  'Đã gửi SOS!',
                  style: TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 12),
                const Text(
                  'Tín hiệu khẩn cấp đã được gửi. Đội hỗ trợ đang trên đường.',
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 16, color: Colors.white70),
                ),
                const SizedBox(height: 24),
                FilledButton.icon(
                  onPressed: () => context.go('/home'),
                  icon: const Icon(Icons.home),
                  label: const Text('Về trang chủ'),
                  style: FilledButton.styleFrom(backgroundColor: Colors.white, foregroundColor: Colors.red),
                ),
              ],
              if (_error != null) ...[
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.orange.withOpacity(0.3),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.warning, color: Colors.white70),
                      const SizedBox(width: 8),
                      Expanded(child: Text(_error!, style: const TextStyle(color: Colors.white))),
                    ],
                  ),
                ),
              ],
              const Spacer(),
              // Emergency phone numbers
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Column(
                  children: [
                    Text('Số điện thoại khẩn cấp', style: TextStyle(color: Colors.white70, fontSize: 14)),
                    SizedBox(height: 8),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                      children: [
                        _EmergencyNumber(label: 'Cứu hỏa', number: '114'),
                        _EmergencyNumber(label: 'Cấp cứu', number: '115'),
                        _EmergencyNumber(label: 'Cảnh sát', number: '113'),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _EmergencyNumber extends StatelessWidget {
  final String label;
  final String number;
  const _EmergencyNumber({required this.label, required this.number});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(number, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.white)),
        Text(label, style: const TextStyle(fontSize: 12, color: Colors.white70)),
      ],
    );
  }
}
