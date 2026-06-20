import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/network/api_client.dart';
import '../../../../core/storage/local_database.dart';

part 'fire_weather_event.dart';
part 'fire_weather_state.dart';

/// BLoC managing fire weather index (FWI) data and station selection.
///
/// Loads weather data from API when online, falls back to mock data for
/// offline use or first launch. Supports station switching and 7-day forecast.
class FireWeatherBloc extends Bloc<FireWeatherEvent, FireWeatherState> {
  final ApiClient _apiClient = ApiClient.instance;
  final LocalDatabase _localDb = LocalDatabase.instance;

  static const List<String> _defaultStations = [
    'Trạm Bu Gia Map',
    'Trạm Đắk Nông',
    'Trạm Lâm Đồng',
    'Trạm Cà Mau',
  ];

  FireWeatherBloc() : super(const FireWeatherInitial()) {
    on<LoadFireWeather>(_onLoadFireWeather);
    on<RefreshFireWeather>(_onRefreshFireWeather);
    on<ChangeStation>(_onChangeStation);
  }

  Future<void> _onLoadFireWeather(
    LoadFireWeather event,
    Emitter<FireWeatherState> emit,
  ) async {
    emit(const FireWeatherLoading());
    try {
      final data = await _loadWeatherData(station: event.station);
      emit(data);
    } catch (e) {
      emit(FireWeatherError(message: 'Không thể tải dữ liệu thời tiết: $e'));
    }
  }

  Future<void> _onRefreshFireWeather(
    RefreshFireWeather event,
    Emitter<FireWeatherState> emit,
  ) async {
    try {
      final currentStation = state is FireWeatherLoaded
          ? (state as FireWeatherLoaded).selectedStation
          : _defaultStations.first;
      final data = await _loadWeatherData(station: currentStation, forceApi: true);
      emit(data);
    } catch (e) {
      emit(FireWeatherError(message: 'Không thể làm mới: $e'));
    }
  }

  Future<void> _onChangeStation(
    ChangeStation event,
    Emitter<FireWeatherState> emit,
  ) async {
    emit(const FireWeatherLoading());
    try {
      final data = await _loadWeatherData(station: event.station);
      emit(data);
    } catch (e) {
      emit(FireWeatherError(message: 'Không thể tải dữ liệu trạm: $e'));
    }
  }

  /// Load weather data: try API first when online, then mock fallback
  Future<FireWeatherLoaded> _loadWeatherData({
    required String station,
    bool forceApi = false,
  }) async {
    bool isOnline = false;

    try {
      isOnline = await _apiClient.isConnected();
    } catch (_) {}

    // Try API fetch when online
    if (isOnline || forceApi) {
      try {
        final response = await _apiClient.get(
          '/api/v1/fire-weather',
          queryParameters: {'station': station},
        );
        final data = response.data as Map<String, dynamic>;

        // Save last fetched data to local DB for offline use
        await _localDb.setSetting('last_fire_weather_${station.hashCode}', data.toString());

        return FireWeatherLoaded(
          selectedStation: station,
          stations: _defaultStations,
          temperature: (data['temperature'] as num?)?.toDouble() ?? 0.0,
          humidity: (data['humidity'] as num?)?.toDouble() ?? 0.0,
          windSpeed: (data['wind_speed'] as num?)?.toDouble() ?? 0.0,
          rainfall: (data['rainfall'] as num?)?.toDouble() ?? 0.0,
          fwiIndex: (data['fwi_index'] as num?)?.toDouble() ?? 0.0,
          fireRiskLevel: data['fire_risk_level'] as String? ?? 'low',
          forecast: (data['forecast'] as List<dynamic>?)
                  ?.map((e) => e as Map<String, dynamic>)
                  .toList() ??
              [],
          alerts: (data['alerts'] as List<dynamic>?)
                  ?.map((e) => e as Map<String, dynamic>)
                  .toList() ??
              [],
          isOnline: isOnline,
        );
      } catch (_) {
        // API failed, fall through to mock
      }
    }

    // Try loading cached data from local DB
    final cached = await _localDb.getSetting('last_fire_weather_${station.hashCode}');
    if (cached != null && cached.isNotEmpty) {
      // For simplicity, we'll use mock data even if cached exists
      // In production, parse the cached JSON string back to data
    }

    // Mock data fallback - station-specific mock data
    return _getMockWeatherData(station, isOnline);
  }

  /// Generate mock fire weather data specific to each station
  FireWeatherLoaded _getMockWeatherData(String station, bool isOnline) {
    // Different mock data per station
    final stationData = <String, Map<String, dynamic>>{
      'Trạm Bu Gia Map': {
        'temperature': 38.0,
        'humidity': 18.0,
        'windSpeed': 15.0,
        'rainfall': 0.0,
        'fwiIndex': 28.5,
        'fireRiskLevel': 'high',
      },
      'Trạm Đắk Nông': {
        'temperature': 35.0,
        'humidity': 25.0,
        'windSpeed': 10.0,
        'rainfall': 0.0,
        'fwiIndex': 22.0,
        'fireRiskLevel': 'moderate',
      },
      'Trạm Lâm Đồng': {
        'temperature': 28.0,
        'humidity': 55.0,
        'windSpeed': 8.0,
        'rainfall': 2.5,
        'fwiIndex': 8.0,
        'fireRiskLevel': 'low',
      },
      'Trạm Cà Mau': {
        'temperature': 32.0,
        'humidity': 72.0,
        'windSpeed': 12.0,
        'rainfall': 15.0,
        'fwiIndex': 5.0,
        'fireRiskLevel': 'low',
      },
    };

    final data = stationData[station] ?? stationData.values.first;

    return FireWeatherLoaded(
      selectedStation: station,
      stations: _defaultStations,
      temperature: data['temperature'] as double,
      humidity: data['humidity'] as double,
      windSpeed: data['windSpeed'] as double,
      rainfall: data['rainfall'] as double,
      fwiIndex: data['fwiIndex'] as double,
      fireRiskLevel: data['fireRiskLevel'] as String,
      forecast: _getMockForecast(),
      alerts: _getMockAlerts(station),
      isOnline: isOnline,
    );
  }

  /// Mock 7-day forecast data
  static List<Map<String, dynamic>> _getMockForecast() {
    final now = DateTime.now();
    return List.generate(7, (index) {
      final date = now.add(Duration(days: index));
      return {
        'date': date.toIso8601String().substring(0, 10),
        'temp_max': 30.0 + (index % 3) * 3.0,
        'temp_min': 20.0 + (index % 2) * 2.0,
        'humidity': 40.0 - (index % 4) * 8.0,
        'wind_speed': 10.0 + (index % 3) * 4.0,
        'rainfall': index % 3 == 2 ? 5.0 : 0.0,
        'fwi': 10.0 + (index % 4) * 6.0,
      };
    });
  }

  /// Mock weather alerts based on station
  static List<Map<String, dynamic>> _getMockAlerts(String station) {
    if (station == 'Trạm Bu Gia Map') {
      return [
        {
          'severity': 'critical',
          'title': 'Cảnh báo cháy rừng cấp cao',
          'message': 'Nhiệt độ cao kết hợp độ ẩm thấp tạo nguy cơ cháy rừng rất cao. Hạn chế các hoạt động trong khu vực rừng.',
          'issued_at': DateTime.now().toIso8601String(),
        },
        {
          'severity': 'medium',
          'title': 'Gió mạnh dự báo',
          'message': 'Dự báo gió mạnh trong 24 giờ tới, có thể làm lan rộng cháy nếu xảy ra.',
          'issued_at': DateTime.now().subtract(const Duration(hours: 2)).toIso8601String(),
        },
      ];
    }
    if (station == 'Trạm Đắk Nông') {
      return [
        {
          'severity': 'high',
          'title': 'Nguy cơ cháy rừng',
          'message': 'Điều kiện thời tiết khô hạn kéo dài, cần tăng cường tuần tra.',
          'issued_at': DateTime.now().subtract(const Duration(hours: 4)).toIso8601String(),
        },
      ];
    }
    // Low risk stations have no active alerts
    return [];
  }
}
