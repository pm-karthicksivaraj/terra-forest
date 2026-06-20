import 'package:equatable/equatable.dart';

abstract class FireWeatherState extends Equatable {
  const FireWeatherState();

  @override
  List<Object?> get props => [];
}

class FireWeatherInitial extends FireWeatherState {
  const FireWeatherInitial();
}

class FireWeatherLoading extends FireWeatherState {
  const FireWeatherLoading();
}

class FireWeatherLoaded extends FireWeatherState {
  final String selectedStation;
  final List<String> stations;
  final double temperature;
  final double humidity;
  final double windSpeed;
  final double rainfall;
  final double fwiIndex;
  final String fireRiskLevel; // 'low', 'moderate', 'high', 'very_high', 'extreme'
  final List<Map<String, dynamic>> forecast; // 7-day forecast data
  final List<Map<String, dynamic>> alerts; // Weather alerts
  final bool isOnline;

  const FireWeatherLoaded({
    required this.selectedStation,
    required this.stations,
    required this.temperature,
    required this.humidity,
    required this.windSpeed,
    required this.rainfall,
    required this.fwiIndex,
    required this.fireRiskLevel,
    required this.forecast,
    required this.alerts,
    this.isOnline = true,
  });

  FireWeatherLoaded copyWith({
    String? selectedStation,
    List<String>? stations,
    double? temperature,
    double? humidity,
    double? windSpeed,
    double? rainfall,
    double? fwiIndex,
    String? fireRiskLevel,
    List<Map<String, dynamic>>? forecast,
    List<Map<String, dynamic>>? alerts,
    bool? isOnline,
  }) {
    return FireWeatherLoaded(
      selectedStation: selectedStation ?? this.selectedStation,
      stations: stations ?? this.stations,
      temperature: temperature ?? this.temperature,
      humidity: humidity ?? this.humidity,
      windSpeed: windSpeed ?? this.windSpeed,
      rainfall: rainfall ?? this.rainfall,
      fwiIndex: fwiIndex ?? this.fwiIndex,
      fireRiskLevel: fireRiskLevel ?? this.fireRiskLevel,
      forecast: forecast ?? this.forecast,
      alerts: alerts ?? this.alerts,
      isOnline: isOnline ?? this.isOnline,
    );
  }

  @override
  List<Object?> get props => [
        selectedStation,
        stations,
        temperature,
        humidity,
        windSpeed,
        rainfall,
        fwiIndex,
        fireRiskLevel,
        forecast,
        alerts,
        isOnline,
      ];
}

class FireWeatherError extends FireWeatherState {
  final String message;

  const FireWeatherError({required this.message});

  @override
  List<Object?> get props => [message];
}
