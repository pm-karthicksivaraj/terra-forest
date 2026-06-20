import 'package:flutter/material.dart';

/// Centralized icon mapping for the Terra Forest MRV mobile application.
///
/// Maps the web platform's Lucide icon names to Flutter Material Icons.
/// This ensures visual consistency across web and mobile platforms while
/// using the appropriate icon set for each platform.
class AppIcons {
  AppIcons._();

  // ─── Navigation Icons ─────────────────────────────────────────────────────

  /// Lucide: LayoutDashboard — Dashboard / Home
  static const IconData dashboard = Icons.dashboard;

  /// Lucide: Map — Map view
  static const IconData map = Icons.map;

  /// Lucene: SatelliteDish — Satellite / Remote sensing
  static const IconData satellite = Icons.satellite_alt;

  /// Lucide: Flame — Fire / Fire risk
  static const IconData flame = Icons.local_fire_department;

  /// Lucide: AlertTriangle — Warning / Alert
  static const IconData alertTriangle = Icons.warning_amber;

  /// Lucide: Leaf — Forest / Nature
  static const IconData leaf = Icons.eco;

  // ─── Data & Cloud Icons ───────────────────────────────────────────────────

  /// Lucide: CloudCog — Cloud sync / Settings
  static const IconData cloudSync = Icons.cloud;

  // ─── Activity Icons ───────────────────────────────────────────────────────

  /// Lucide: Footprints — Patrol / Walking
  static const IconData footprints = Icons.directions_walk;

  /// Lucide: QrCode — QR Code scanning
  static const IconData qrCode = Icons.qr_code;

  /// Lucide: FileText — Report / Document
  static const IconData fileText = Icons.description;

  // ─── Communication Icons ──────────────────────────────────────────────────

  /// Lucide: Radio — Radio / Communication
  static const IconData radio = Icons.radio;

  /// Lucide: Globe2 — Global / Network
  static const IconData globe = Icons.public;

  // ─── Forest & Environment Icons ───────────────────────────────────────────

  /// Lucide: TreePine — Tree / Forest feature
  static const IconData treePine = Icons.park;

  /// Lucide: Scale — Scale / Measurement
  static const IconData scale = Icons.scale;

  // ─── System Icons ─────────────────────────────────────────────────────────

  /// Lucide: Database — Database / Storage
  static const IconData database = Icons.storage;

  /// Lucide: TrendingDown — Declining trend
  static const IconData trendingDown = Icons.trending_down;

  /// Lucide: Award — Award / Achievement
  static const IconData award = Icons.emoji_events;

  /// Lucide: ShieldCheck — Verified / Security
  static const IconData shieldCheck = Icons.verified_user;

  // ─── User & Team Icons ────────────────────────────────────────────────────

  /// Lucide: Users — Users / Team
  static const IconData users = Icons.group;

  /// Lucide: Key — Key / Authentication
  static const IconData key = Icons.vpn_key;

  /// Lucide: UsersRound — Team group / People
  static const IconData usersRound = Icons.groups;

  /// Lucide: Smartphone — Device / Mobile
  static const IconData smartphone = Icons.smartphone;

  // ─── Task Icons ───────────────────────────────────────────────────────────

  /// Lucide: ListTodo — Task list / Checklist
  static const IconData listTodo = Icons.checklist;

  // ─── Media Capture Icons ──────────────────────────────────────────────────

  /// Lucide: Camera — Camera / Photo capture
  static const IconData camera = Icons.camera_alt;

  /// Lucide: Upload — Upload / Submit
  static const IconData upload = Icons.upload;

  /// Lucide: Settings — Settings / Configuration
  static const IconData settings = Icons.settings;

  /// Lucide: Mic — Microphone / Voice recording
  static const IconData mic = Icons.mic;

  /// Lucide: Video — Video recording
  static const IconData video = Icons.videocam;

  // ─── Location & Observation Icons ─────────────────────────────────────────

  /// Lucide: MapPin — Location pin
  static const IconData mapPin = Icons.location_on;

  /// Lucide: Eye — Observation / View
  static const IconData eye = Icons.visibility;

  /// Lucide: Bug — Bug report / Issue
  static const IconData bug = Icons.bug_report;

  // ─── UI Utility Icons ─────────────────────────────────────────────────────

  /// Lucide: MoreHorizontal — More options
  static const IconData moreHorizontal = Icons.more_horiz;

  /// Lucide: Brain — AI / Intelligence
  static const IconData brain = Icons.psychology;

  /// Lucide: GitCompare — Comparison / Diff
  static const IconData gitCompare = Icons.compare;

  // ─── Additional Utility Icons (not in Lucide mapping but needed) ──────────

  /// Check / Done icon.
  static const IconData check = Icons.check_circle;

  /// Close / Dismiss icon.
  static const IconData close = Icons.close;

  /// Back / Navigate previous icon.
  static const IconData back = Icons.arrow_back;

  /// Forward / Navigate next icon.
  static const IconData forward = Icons.arrow_forward;

  /// Search icon.
  static const IconData search = Icons.search;

  /// Filter icon.
  static const IconData filter = Icons.filter_list;

  /// Refresh / Sync icon.
  static const IconData refresh = Icons.refresh;

  /// Download icon.
  static const IconData download = Icons.download;

  /// Share icon.
  static const IconData share = Icons.share;

  /// Copy icon.
  static const IconData copy = Icons.copy;

  /// Delete / Trash icon.
  static const IconData delete = Icons.delete_outline;

  /// Edit / Pencil icon.
  static const IconData edit = Icons.edit;

  /// Add / Plus icon.
  static const IconData add = Icons.add;

  /// Notification / Bell icon.
  static const IconData notification = Icons.notifications;

  /// Location tracking icon.
  static const IconData locationTracking = Icons.my_location;

  /// Offline / Cloud-off icon.
  static const IconData offline = Icons.cloud_off;

  /// Sync status icon.
  static const IconData syncStatus = Icons.sync;

  /// Battery / Power icon.
  static const IconData battery = Icons.battery_std;

  /// Signal / Connectivity icon.
  static const IconData signal = Icons.signal_cellular_alt;

  /// SOS emergency icon.
  static const IconData sos = Icons.sos;

  /// Compass icon.
  static const IconData compass = Icons.explore;

  /// Layers icon for map layers.
  static const IconData layers = Icons.layers;

  /// Timeline icon for patrol history.
  static const IconData timeline = Icons.timeline;

  /// Analytics / Chart icon.
  static const IconData analytics = Icons.analytics;

  /// Person / User profile icon.
  static const IconData person = Icons.person;

  /// Lock icon for security.
  static const IconData lock = Icons.lock;

  /// Logout icon.
  static const IconData logout = Icons.logout;

  /// Help / Info icon.
  static const IconData help = Icons.help_outline;

  /// Weather icon.
  static const IconData weather = Icons.wb_sunny;

  /// Night mode icon.
  static const IconData nightMode = Icons.nightlight;

  /// GPS fixed icon.
  static const IconData gpsFixed = Icons.gps_fixed;

  /// GPS not fixed icon.
  static const IconData gpsNotFixed = Icons.gps_not_fixed;

  /// GPS off icon.
  static const IconData gpsOff = Icons.gps_off;

  /// Image / Photo gallery icon.
  static const IconData imageGallery = Icons.photo_library;

  /// Attachment icon.
  static const IconData attachment = Icons.attach_file;

  /// Send / Submit icon.
  static const IconData send = Icons.send;

  /// Chat / Message icon.
  static const IconData chat = Icons.chat;

  /// Phone icon.
  static const IconData phone = Icons.phone;

  /// Email icon.
  static const IconData email = Icons.email;

  /// Calendar / Date icon.
  static const IconData calendar = Icons.calendar_today;

  /// Clock / Time icon.
  static const IconData clock = Icons.access_time;

  /// History icon.
  static const IconData history = Icons.history;

  /// Bookmark icon.
  static const IconData bookmark = Icons.bookmark;

  /// Flag icon.
  static const IconData flag = Icons.flag;

  /// Link icon.
  static const IconData link = Icons.link;

  /// Verified badge icon.
  static const IconData verified = Icons.verified;

  /// Warning icon (filled variant).
  static const IconData warningFilled = Icons.warning;

  /// Info icon.
  static const IconData info = Icons.info_outline;

  /// Error icon.
  static const IconData error = Icons.error_outline;

  /// Success icon.
  static const IconData success = Icons.check_circle_outline;

  /// Navigate to / Directions icon.
  static const IconData directions = Icons.directions;

  /// Zoom in icon.
  static const IconData zoomIn = Icons.zoom_in;

  /// Zoom out icon.
  static const IconData zoomOut = Icons.zoom_out;

  /// Fullscreen icon.
  static const IconData fullscreen = Icons.fullscreen;

  /// Screenshot icon.
  static const IconData screenshot = Icons.screenshot;

  /// Fingerprint / Biometric icon.
  static const IconData fingerprint = Icons.fingerprint;

  /// Security icon.
  static const IconData security = Icons.security;

  /// Task / Assignment icon.
  static const IconData task = Icons.assignment;

  /// Pending / Hourglass icon.
  static const IconData pending = Icons.hourglass_empty;

  /// Approved / Thumb up icon.
  static const IconData approved = Icons.thumb_up;

  /// Rejected / Thumb down icon.
  static const IconData rejected = Icons.thumb_down;

  /// Measure / Straighten icon.
  static const IconData measure = Icons.straighten;

  /// Vegetation / Grass icon.
  static const IconData vegetation = Icons.grass;

  /// Terrain icon.
  static const IconData terrain = Icons.terrain;

  /// Water drop icon.
  static const IconData waterDrop = Icons.water_drop;

  /// Air / Wind icon.
  static const IconData air = Icons.air;

  /// Temperature / Thermostat icon.
  static const IconData temperature = Icons.thermostat;

  /// Volume / Speaker icon.
  static const IconData volume = Icons.volume_up;
}

/// Icon size presets for consistent sizing across the application.
class AppIconSize {
  AppIconSize._();

  /// Extra small icon size (14px) — used in dense lists, badges.
  static const double xs = 14.0;

  /// Small icon size (18px) — used in chips, list tiles.
  static const double sm = 18.0;

  /// Medium icon size (24px) — default Material icon size.
  static const double md = 24.0;

  /// Large icon size (32px) — used in empty states, feature tiles.
  static const double lg = 32.0;

  /// Extra large icon size (48px) — used in onboarding, hero sections.
  static const double xl = 48.0;

  /// XXL icon size (64px) — used in splash / error states.
  static const double xxl = 64.0;
}
