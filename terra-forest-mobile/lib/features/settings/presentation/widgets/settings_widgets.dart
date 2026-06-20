import 'package:flutter/material.dart';
import '../../../../core/constants/app_constants.dart';
import '../../../../core/theme/app_theme.dart';

class SettingsSection extends StatelessWidget {
  final String title;
  final List<Widget> children;

  const SettingsSection({
    super.key,
    required this.title,
    required this.children,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
          child: Text(
            title,
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: Theme.of(context).colorScheme.primary,
            ),
          ),
        ),
        Container(
          decoration: BoxDecoration(
            color: Theme.of(context).cardColor,
            borderRadius: BorderRadius.circular(12),
          ),
          margin: const EdgeInsets.symmetric(horizontal: 12),
          child: Column(children: children),
        ),
        const Divider(height: 1, indent: 16, endIndent: 16),
      ],
    );
  }
}

class SettingsTile extends StatelessWidget {
  final IconData icon;
  final String title;
  final String? subtitle;
  final Widget? trailing;
  final VoidCallback onTap;

  const SettingsTile({
    super.key,
    required this.icon,
    required this.title,
    this.subtitle,
    this.trailing,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Icon(icon, color: Theme.of(context).textTheme.bodyMedium?.color),
      title: Text(title),
      subtitle: subtitle != null ? Text(subtitle!, style: const TextStyle(fontSize: 12)) : null,
      trailing: trailing ?? const Icon(Icons.chevron_right, size: 20),
      onTap: onTap,
    );
  }
}

class SyncStatusTile extends StatelessWidget {
  final String lastSyncTime;
  final int queueSize;
  final VoidCallback onForceSync;

  const SyncStatusTile({
    super.key,
    required this.lastSyncTime,
    required this.queueSize,
    required this.onForceSync,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(12),
      child: Column(
        children: [
          Row(
            children: [
              Icon(Icons.cloud_sync_outlined, color: Theme.of(context).textTheme.bodyMedium?.color),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Trạng thái đồng bộ', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w500)),
                    const SizedBox(height: 2),
                    Row(
                      children: [
                        Text(
                          'Lần cuối: $lastSyncTime',
                          style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                        ),
                        if (queueSize > 0) ...[
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                            decoration: BoxDecoration(
                              color: StatusColor.medium.withOpacity(0.15),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Text(
                              '$queueSize chờ',
                              style: const TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.w700,
                                color: StatusColor.medium,
                              ),
                            ),
                          ),
                        ] else ...[
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                            decoration: BoxDecoration(
                              color: StatusColor.low.withOpacity(0.15),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: const Text(
                              'Đã đồng bộ',
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.w700,
                                color: StatusColor.low,
                              ),
                            ),
                          ),
                        ],
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          SizedBox(
            width: double.infinity,
            child: OutlinedButton.icon(
              onPressed: onForceSync,
              icon: const Icon(Icons.sync, size: 18),
              label: const Text('Đồng bộ ngay'),
              style: OutlinedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 8),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class LanguageSelector extends StatelessWidget {
  final String selectedLanguage;
  final ValueChanged<String> onLanguageChanged;

  const LanguageSelector({
    super.key,
    required this.selectedLanguage,
    required this.onLanguageChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        RadioListTile<String>(
          value: 'vi',
          groupValue: selectedLanguage,
          title: const Text('Tiếng Việt'),
          subtitle: const Text('Mặc định'),
          secondary: const Text('🇻🇳', style: TextStyle(fontSize: 24)),
          onChanged: (val) {
            if (val != null) onLanguageChanged(val);
          },
        ),
        RadioListTile<String>(
          value: 'en',
          groupValue: selectedLanguage,
          title: const Text('English'),
          secondary: const Text('🇬🇧', style: TextStyle(fontSize: 24)),
          onChanged: (val) {
            if (val != null) onLanguageChanged(val);
          },
        ),
      ],
    );
  }
}

class NotificationToggle extends StatelessWidget {
  final IconData icon;
  final String title;
  final String? subtitle;
  final bool value;
  final ValueChanged<bool> onChanged;

  const NotificationToggle({
    super.key,
    required this.icon,
    required this.title,
    this.subtitle,
    required this.value,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return SwitchListTile(
      secondary: Icon(icon, color: Theme.of(context).textTheme.bodyMedium?.color),
      title: Text(title),
      subtitle: subtitle != null ? Text(subtitle!, style: const TextStyle(fontSize: 12)) : null,
      value: value,
      onChanged: onChanged,
    );
  }
}
