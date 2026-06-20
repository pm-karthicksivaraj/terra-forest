import 'package:equatable/equatable.dart';

abstract class FireWeatherEvent extends Equatable {
  const FireWeatherEvent();

  @override
  List<Object?> get props => [];
}

/// Load fire weather data for the selected station
class LoadFireWeather extends FireWeatherEvent {
  final String station;

  const LoadFireWeather({required this.station});

  @override
  List<Object?> get props => [station];
}

/// Refresh fire weather data (force API call when online)
class RefreshFireWeather extends FireWeatherEvent {
  const RefreshFireWeather();
}

/// Change the selected weather station
class ChangeStation extends FireWeatherEvent {
  final String station;

  const ChangeStation(this.station);

  @override
  List<Object?> get props => [station];
}
