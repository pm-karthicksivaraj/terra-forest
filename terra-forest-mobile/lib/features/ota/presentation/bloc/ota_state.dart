part of 'ota_bloc.dart';

abstract class OtaState extends Equatable {
  const OtaState();

  @override
  List<Object?> get props => [];
}

class OtaInitial extends OtaState {}

class OtaChecking extends OtaState {}

class OtaUpdateAvailable extends OtaState {
  final OtaUpdate update;

  const OtaUpdateAvailable({required this.update});

  @override
  List<Object?> get props => [update];
}

class OtaNoUpdate extends OtaState {
  final String currentVersion;

  const OtaNoUpdate({required this.currentVersion});

  @override
  List<Object?> get props => [currentVersion];
}

class OtaDownloading extends OtaState {
  final double progress;
  final OtaUpdate update;

  const OtaDownloading({required this.progress, required this.update});

  @override
  List<Object?> get props => [progress, update];
}

class OtaReadyToInstall extends OtaState {
  final OtaUpdate update;

  const OtaReadyToInstall({required this.update});

  @override
  List<Object?> get props => [update];
}

class OtaInstalling extends OtaState {}

class OtaError extends OtaState {
  final String message;

  const OtaError({required this.message});

  @override
  List<Object?> get props => [message];
}
