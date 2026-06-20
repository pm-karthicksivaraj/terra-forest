part of 'ota_bloc.dart';

abstract class OtaEvent extends Equatable {
  const OtaEvent();

  @override
  List<Object?> get props => [];
}

class OtaCheckRequested extends OtaEvent {
  const OtaCheckRequested();
}

class OtaDownloadStarted extends OtaEvent {
  final String updateId;

  const OtaDownloadStarted({required this.updateId});

  @override
  List<Object?> get props => [updateId];
}

class OtaInstallRequested extends OtaEvent {
  final String updateId;

  const OtaInstallRequested({required this.updateId});

  @override
  List<Object?> get props => [updateId];
}

class OtaCancelDownload extends OtaEvent {
  const OtaCancelDownload();
}
