import 'package:flutter/material.dart';

/// Forest color palette matching the Terra Forest web platform.
class ForestColor {
  ForestColor._();

  // Forest scale
  static const Color forest950 = Color(0xFF071A0E);
  static const Color forest900 = Color(0xFF0D3320);
  static const Color forest800 = Color(0xFF14462C);
  static const Color forest700 = Color(0xFF1B5A38);
  static const Color forest600 = Color(0xFF2D6A4F);
  static const Color forest500 = Color(0xFF40916C);
  static const Color forest400 = Color(0xFF52B788);
  static const Color forest300 = Color(0xFF74C69D);
  static const Color forest200 = Color(0xFF95D5B2);
  static const Color forest100 = Color(0xFFD8F3DC);

  // Earth scale
  static const Color earth900 = Color(0xFF3E2723);
  static const Color earth800 = Color(0xFF5D4037);
  static const Color earth700 = Color(0xFF795548);
  static const Color earth600 = Color(0xFFA1887F);

  // Fire scale
  static const Color fire700 = Color(0xFFE65100);
  static const Color fire400 = Color(0xFFFF8A65);

  // Water scale
  static const Color water700 = Color(0xFF0277BD);
  static const Color water400 = Color(0xFF4FC3F7);
}

/// Status colors for alerts and priority indicators.
class StatusColor {
  StatusColor._();

  static const Color critical = Color(0xFFDC2626); // red-600
  static const Color high = Color(0xFFEA580C); // orange-600
  static const Color medium = Color(0xFFD97706); // amber-600
  static const Color low = Color(0xFF16A34A); // green-600

  static const Color criticalLight = Color(0xFFFEE2E2); // red-100
  static const Color highLight = Color(0xFFFFEDD5); // orange-100
  static const Color mediumLight = Color(0xFFFEF3C7); // amber-100
  static const Color lowLight = Color(0xFFDCFCE7); // green-100
}

/// Card decoration helpers for consistent card styling.
class AppCardDecorations {
  AppCardDecorations._();

  static BoxDecoration defaultCard({
    required bool isDark,
    Color? customColor,
    double borderRadius = 12.0,
  }) {
    return BoxDecoration(
      color: customColor ?? (isDark ? ForestColor.forest900 : Colors.white),
      borderRadius: BorderRadius.circular(borderRadius),
      border: Border.all(
        color: isDark
            ? ForestColor.forest800.withOpacity(0.5)
            : ForestColor.forest200.withOpacity(0.5),
        width: 1,
      ),
      boxShadow: [
        BoxShadow(
          color: Colors.black.withOpacity(isDark ? 0.3 : 0.08),
          blurRadius: 8,
          offset: const Offset(0, 2),
        ),
      ],
    );
  }

  static BoxDecoration elevatedCard({
    required bool isDark,
    double borderRadius = 12.0,
  }) {
    return BoxDecoration(
      color: isDark ? ForestColor.forest900 : Colors.white,
      borderRadius: BorderRadius.circular(borderRadius),
      boxShadow: [
        BoxShadow(
          color: Colors.black.withOpacity(isDark ? 0.4 : 0.12),
          blurRadius: 16,
          offset: const Offset(0, 4),
        ),
      ],
    );
  }

  static BoxDecoration statusCard({
    required Color statusColor,
    required bool isDark,
    double borderRadius = 12.0,
  }) {
    return BoxDecoration(
      color: isDark
          ? statusColor.withOpacity(0.15)
          : statusColor.withOpacity(0.08),
      borderRadius: BorderRadius.circular(borderRadius),
      border: Border.all(
        color: statusColor.withOpacity(0.3),
        width: 1,
      ),
    );
  }
}

/// Main application theme configuration for Terra Forest MRV.
class AppTheme {
  AppTheme._();

  /// Font family used throughout the app.
  /// Set to null to use the platform default (Roboto on Android, SF Pro on iOS),
  /// both of which fully support Vietnamese characters.
  static const String? _fontFamily = null;

  // ─── Light Theme ──────────────────────────────────────────────────────────

  static ThemeData get lightTheme {
    final ColorScheme colorScheme = ColorScheme(
      brightness: Brightness.light,
      primary: ForestColor.forest700,
      onPrimary: ForestColor.forest100,
      primaryContainer: ForestColor.forest200,
      onPrimaryContainer: ForestColor.forest900,
      secondary: ForestColor.forest600,
      onSecondary: Colors.white,
      secondaryContainer: ForestColor.forest100,
      onSecondaryContainer: ForestColor.forest800,
      tertiary: ForestColor.earth700,
      onTertiary: Colors.white,
      tertiaryContainer: ForestColor.earth600.withOpacity(0.2),
      onTertiaryContainer: ForestColor.earth900,
      error: StatusColor.critical,
      onError: Colors.white,
      errorContainer: StatusColor.criticalLight,
      onErrorContainer: StatusColor.critical,
      surface: Colors.white,
      onSurface: const Color(0xFF1A1A1A),
      surfaceContainerHighest: const Color(0xFFF5F5F5),
      onSurfaceVariant: const Color(0xFF5A5A5A),
      outline: const Color(0xFFD0D0D0),
      outlineVariant: const Color(0xFFE8E8E8),
      shadow: Colors.black.withOpacity(0.08),
      scrim: Colors.black54,
      inverseSurface: ForestColor.forest900,
      onInverseSurface: ForestColor.forest100,
      surfaceTint: ForestColor.forest700,
    );

    return _buildTheme(colorScheme, Brightness.light);
  }

  // ─── Dark Theme ───────────────────────────────────────────────────────────

  static ThemeData get darkTheme {
    final ColorScheme colorScheme = ColorScheme(
      brightness: Brightness.dark,
      primary: ForestColor.forest400,
      onPrimary: ForestColor.forest950,
      primaryContainer: ForestColor.forest800,
      onPrimaryContainer: ForestColor.forest100,
      secondary: ForestColor.forest300,
      onSecondary: ForestColor.forest950,
      secondaryContainer: ForestColor.forest800,
      onSecondaryContainer: ForestColor.forest100,
      tertiary: ForestColor.earth600,
      onTertiary: ForestColor.earth900,
      tertiaryContainer: ForestColor.earth900.withOpacity(0.4),
      onTertiaryContainer: ForestColor.earth700,
      error: const Color(0xFFEF4444),
      onError: Colors.white,
      errorContainer: const Color(0xFF7F1D1D),
      onErrorContainer: const Color(0xFFFCA5A5),
      surface: ForestColor.forest900,
      onSurface: ForestColor.forest100,
      surfaceContainerHighest: ForestColor.forest800,
      onSurfaceVariant: ForestColor.forest300,
      outline: ForestColor.forest600,
      outlineVariant: ForestColor.forest700,
      shadow: Colors.black.withOpacity(0.3),
      scrim: Colors.black87,
      inverseSurface: ForestColor.forest100,
      onInverseSurface: ForestColor.forest900,
      surfaceTint: ForestColor.forest400,
    );

    return _buildTheme(colorScheme, Brightness.dark);
  }

  // ─── Shared Theme Builder ─────────────────────────────────────────────────

  static ThemeData _buildTheme(ColorScheme colorScheme, Brightness brightness) {
    final bool isDark = brightness == Brightness.dark;

    return ThemeData(
      useMaterial3: true,
      brightness: brightness,
      colorScheme: colorScheme,
      fontFamily: _fontFamily,

      // ── AppBar ──────────────────────────────────────────────────────────
      appBarTheme: AppBarTheme(
        backgroundColor: ForestColor.forest900,
        foregroundColor: ForestColor.forest100,
        elevation: 0,
        centerTitle: true,
        titleTextStyle: TextStyle(
          fontFamily: _fontFamily,
          fontSize: 18,
          fontWeight: FontWeight.w600,
          color: ForestColor.forest100,
        ),
        iconTheme: IconThemeData(
          color: ForestColor.forest100,
          size: 24,
        ),
      ),

      // ── Card ────────────────────────────────────────────────────────────
      cardTheme: CardThemeData(
        elevation: isDark ? 2 : 1,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        color: isDark ? ForestColor.forest900 : Colors.white,
        surfaceTintColor: Colors.transparent,
        margin: EdgeInsets.zero,
        shadowColor: Colors.black.withOpacity(isDark ? 0.3 : 0.08),
      ),

      // ── Input Decoration ────────────────────────────────────────────────
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: isDark
            ? ForestColor.forest800.withOpacity(0.5)
            : const Color(0xFFF5FAF7),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: BorderSide(
            color: isDark ? ForestColor.forest600 : ForestColor.forest200,
            width: 1,
          ),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: BorderSide(
            color: isDark ? ForestColor.forest600 : ForestColor.forest200,
            width: 1,
          ),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: BorderSide(
            color: colorScheme.primary,
            width: 2,
          ),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: BorderSide(
            color: colorScheme.error,
            width: 1,
          ),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: BorderSide(
            color: colorScheme.error,
            width: 2,
          ),
        ),
        hintStyle: TextStyle(
          color: isDark ? ForestColor.forest500 : ForestColor.forest400,
          fontSize: 14,
        ),
        labelStyle: TextStyle(
          color: isDark ? ForestColor.forest300 : ForestColor.forest600,
          fontSize: 14,
        ),
        prefixIconColor: isDark ? ForestColor.forest400 : ForestColor.forest600,
        suffixIconColor: isDark ? ForestColor.forest400 : ForestColor.forest600,
      ),

      // ── Bottom Navigation Bar ───────────────────────────────────────────
      bottomNavigationBarTheme: BottomNavigationBarThemeData(
        backgroundColor: isDark ? ForestColor.forest900 : Colors.white,
        selectedItemColor: colorScheme.primary,
        unselectedItemColor: isDark ? ForestColor.forest500 : ForestColor.forest400,
        type: BottomNavigationBarType.fixed,
        elevation: 8,
        selectedLabelStyle: const TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w600,
        ),
        unselectedLabelStyle: const TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w400,
        ),
      ),

      // ── Navigation Bar (M3) ────────────────────────────────────────────
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: isDark ? ForestColor.forest900 : Colors.white,
        indicatorColor: colorScheme.primary.withOpacity(0.15),
        surfaceTintColor: Colors.transparent,
        elevation: 8,
        height: 64,
        labelTextStyle: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return TextStyle(
              fontFamily: _fontFamily,
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: colorScheme.primary,
            );
          }
          return TextStyle(
            fontFamily: _fontFamily,
            fontSize: 11,
            fontWeight: FontWeight.w400,
            color: isDark ? ForestColor.forest500 : ForestColor.forest400,
          );
        }),
        iconTheme: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return IconThemeData(
              color: colorScheme.primary,
              size: 24,
            );
          }
          return IconThemeData(
            color: isDark ? ForestColor.forest500 : ForestColor.forest400,
            size: 22,
          );
        }),
      ),

      // ── Floating Action Button ──────────────────────────────────────────
      floatingActionButtonTheme: FloatingActionButtonThemeData(
        backgroundColor: colorScheme.primary,
        foregroundColor: colorScheme.onPrimary,
        elevation: 4,
        focusElevation: 6,
        hoverElevation: 6,
        highlightElevation: 8,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
        extendedSizeConstraints: const BoxConstraints(
          minHeight: 48,
          maxHeight: 56,
        ),
      ),

      // ── Chip ────────────────────────────────────────────────────────────
      chipTheme: ChipThemeData(
        backgroundColor: isDark
            ? ForestColor.forest800
            : ForestColor.forest100,
        deleteIconColor: isDark ? ForestColor.forest400 : ForestColor.forest600,
        disabledColor: isDark
            ? ForestColor.forest800.withOpacity(0.5)
            : const Color(0xFFE0E0E0),
        selectedColor: colorScheme.primary,
        secondarySelectedColor: colorScheme.primaryContainer,
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
        labelStyle: TextStyle(
          fontFamily: _fontFamily,
          fontSize: 13,
          fontWeight: FontWeight.w500,
          color: isDark ? ForestColor.forest200 : ForestColor.forest700,
        ),
        secondaryLabelStyle: TextStyle(
          fontFamily: _fontFamily,
          fontSize: 13,
          fontWeight: FontWeight.w500,
          color: colorScheme.onPrimaryContainer,
        ),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
          side: BorderSide(
            color: isDark ? ForestColor.forest700 : ForestColor.forest300,
            width: 1,
          ),
        ),
        side: BorderSide(
          color: isDark ? ForestColor.forest700 : ForestColor.forest300,
          width: 1,
        ),
      ),

      // ── Dialog ──────────────────────────────────────────────────────────
      dialogTheme: DialogThemeData(
        backgroundColor: isDark ? ForestColor.forest900 : Colors.white,
        elevation: 8,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
        titleTextStyle: TextStyle(
          fontFamily: _fontFamily,
          fontSize: 18,
          fontWeight: FontWeight.w600,
          color: isDark ? ForestColor.forest100 : ForestColor.forest900,
        ),
        contentTextStyle: TextStyle(
          fontFamily: _fontFamily,
          fontSize: 14,
          color: isDark ? ForestColor.forest300 : const Color(0xFF5A5A5A),
        ),
      ),

      // ── Elevated Button ─────────────────────────────────────────────────
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: colorScheme.primary,
          foregroundColor: colorScheme.onPrimary,
          disabledBackgroundColor: isDark
              ? ForestColor.forest800
              : ForestColor.forest200,
          disabledForegroundColor: isDark
              ? ForestColor.forest600
              : ForestColor.forest400,
          elevation: 2,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(10),
          ),
          textStyle: TextStyle(
            fontFamily: _fontFamily,
            fontSize: 14,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),

      // ── Outlined Button ─────────────────────────────────────────────────
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: colorScheme.primary,
          side: BorderSide(color: colorScheme.primary, width: 1.5),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(10),
          ),
          textStyle: TextStyle(
            fontFamily: _fontFamily,
            fontSize: 14,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),

      // ── Text Button ─────────────────────────────────────────────────────
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: colorScheme.primary,
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
          textStyle: TextStyle(
            fontFamily: _fontFamily,
            fontSize: 14,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),

      // ── Icon Button ─────────────────────────────────────────────────────
      iconButtonTheme: IconButtonThemeData(
        style: IconButton.styleFrom(
          foregroundColor: isDark ? ForestColor.forest300 : ForestColor.forest700,
          iconSize: 24,
          padding: const EdgeInsets.all(8),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
        ),
      ),

      // ── Divider ─────────────────────────────────────────────────────────
      dividerTheme: DividerThemeData(
        color: isDark ? ForestColor.forest800 : ForestColor.forest200,
        thickness: 1,
        space: 1,
      ),

      // ── Snack Bar ───────────────────────────────────────────────────────
      snackBarTheme: SnackBarThemeData(
        backgroundColor: isDark ? ForestColor.forest800 : ForestColor.forest900,
        contentTextStyle: TextStyle(
          fontFamily: _fontFamily,
          fontSize: 14,
          color: ForestColor.forest100,
        ),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(10),
        ),
        behavior: SnackBarBehavior.floating,
        elevation: 4,
      ),

      // ── Tab Bar ─────────────────────────────────────────────────────────
      tabBarTheme: TabBarThemeData(
        labelColor: colorScheme.primary,
        unselectedLabelColor: isDark ? ForestColor.forest400 : ForestColor.forest500,
        indicatorColor: colorScheme.primary,
        indicatorSize: TabBarIndicatorSize.label,
        labelStyle: TextStyle(
          fontFamily: _fontFamily,
          fontSize: 14,
          fontWeight: FontWeight.w600,
        ),
        unselectedLabelStyle: TextStyle(
          fontFamily: _fontFamily,
          fontSize: 14,
          fontWeight: FontWeight.w400,
        ),
      ),

      // ── Progress Indicator ──────────────────────────────────────────────
      progressIndicatorTheme: ProgressIndicatorThemeData(
        color: colorScheme.primary,
        linearTrackColor: isDark ? ForestColor.forest800 : ForestColor.forest100,
        circularTrackColor: isDark ? ForestColor.forest800 : ForestColor.forest100,
      ),

      // ── Switch ──────────────────────────────────────────────────────────
      switchTheme: SwitchThemeData(
        thumbColor: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return colorScheme.onPrimary;
          }
          return isDark ? ForestColor.forest300 : Colors.white;
        }),
        trackColor: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return colorScheme.primary;
          }
          return isDark ? ForestColor.forest700 : ForestColor.forest200;
        }),
      ),

      // ── Checkbox ────────────────────────────────────────────────────────
      checkboxTheme: CheckboxThemeData(
        fillColor: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return colorScheme.primary;
          }
          return Colors.transparent;
        }),
        checkColor: WidgetStateProperty.all(colorScheme.onPrimary),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(3),
        ),
        side: BorderSide(
          color: isDark ? ForestColor.forest500 : ForestColor.forest400,
          width: 2,
        ),
      ),

      // ── Radio ───────────────────────────────────────────────────────────
      radioTheme: RadioThemeData(
        fillColor: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return colorScheme.primary;
          }
          return isDark ? ForestColor.forest500 : ForestColor.forest400;
        }),
      ),

      // ── Slider ──────────────────────────────────────────────────────────
      sliderTheme: SliderThemeData(
        activeTrackColor: colorScheme.primary,
        inactiveTrackColor: isDark ? ForestColor.forest700 : ForestColor.forest200,
        thumbColor: colorScheme.primary,
        overlayColor: colorScheme.primary.withOpacity(0.12),
        trackHeight: 4,
        thumbShape: const RoundSliderThumbShape(enabledThumbRadius: 8),
      ),

      // ── Bottom Sheet ────────────────────────────────────────────────────
      bottomSheetTheme: BottomSheetThemeData(
        backgroundColor: isDark ? ForestColor.forest900 : Colors.white,
        shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
        elevation: 8,
        showDragHandle: true,
        dragHandleColor: isDark ? ForestColor.forest600 : ForestColor.forest300,
      ),

      // ── Tooltip ─────────────────────────────────────────────────────────
      tooltipTheme: TooltipThemeData(
        decoration: BoxDecoration(
          color: ForestColor.forest900,
          borderRadius: BorderRadius.circular(8),
        ),
        textStyle: TextStyle(
          fontFamily: _fontFamily,
          fontSize: 12,
          color: ForestColor.forest100,
        ),
        waitDuration: const Duration(milliseconds: 500),
      ),

      // ── List Tile ───────────────────────────────────────────────────────
      listTileTheme: ListTileThemeData(
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
        iconColor: isDark ? ForestColor.forest400 : ForestColor.forest600,
        textColor: isDark ? ForestColor.forest100 : ForestColor.forest900,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(10),
        ),
      ),

      // ── Popup Menu ──────────────────────────────────────────────────────
      popupMenuTheme: PopupMenuThemeData(
        color: isDark ? ForestColor.forest900 : Colors.white,
        elevation: 8,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        textStyle: TextStyle(
          fontFamily: _fontFamily,
          fontSize: 14,
          color: isDark ? ForestColor.forest100 : const Color(0xFF1A1A1A),
        ),
      ),

      // ── Text Theme ──────────────────────────────────────────────────────
      textTheme: TextTheme(
        // Display
        displayLarge: TextStyle(
          fontFamily: _fontFamily,
          fontSize: 57,
          fontWeight: FontWeight.w400,
          letterSpacing: -0.25,
          color: isDark ? ForestColor.forest100 : ForestColor.forest950,
        ),
        displayMedium: TextStyle(
          fontFamily: _fontFamily,
          fontSize: 45,
          fontWeight: FontWeight.w400,
          letterSpacing: 0,
          color: isDark ? ForestColor.forest100 : ForestColor.forest950,
        ),
        displaySmall: TextStyle(
          fontFamily: _fontFamily,
          fontSize: 36,
          fontWeight: FontWeight.w400,
          letterSpacing: 0,
          color: isDark ? ForestColor.forest100 : ForestColor.forest950,
        ),
        // Headline
        headlineLarge: TextStyle(
          fontFamily: _fontFamily,
          fontSize: 32,
          fontWeight: FontWeight.w600,
          letterSpacing: 0,
          color: isDark ? ForestColor.forest100 : ForestColor.forest900,
        ),
        headlineMedium: TextStyle(
          fontFamily: _fontFamily,
          fontSize: 28,
          fontWeight: FontWeight.w600,
          letterSpacing: 0,
          color: isDark ? ForestColor.forest100 : ForestColor.forest900,
        ),
        headlineSmall: TextStyle(
          fontFamily: _fontFamily,
          fontSize: 24,
          fontWeight: FontWeight.w600,
          letterSpacing: 0,
          color: isDark ? ForestColor.forest200 : ForestColor.forest800,
        ),
        // Title
        titleLarge: TextStyle(
          fontFamily: _fontFamily,
          fontSize: 22,
          fontWeight: FontWeight.w600,
          letterSpacing: 0,
          color: isDark ? ForestColor.forest100 : ForestColor.forest900,
        ),
        titleMedium: TextStyle(
          fontFamily: _fontFamily,
          fontSize: 16,
          fontWeight: FontWeight.w600,
          letterSpacing: 0.15,
          color: isDark ? ForestColor.forest200 : ForestColor.forest800,
        ),
        titleSmall: TextStyle(
          fontFamily: _fontFamily,
          fontSize: 14,
          fontWeight: FontWeight.w600,
          letterSpacing: 0.1,
          color: isDark ? ForestColor.forest300 : ForestColor.forest700,
        ),
        // Body
        bodyLarge: TextStyle(
          fontFamily: _fontFamily,
          fontSize: 16,
          fontWeight: FontWeight.w400,
          letterSpacing: 0.5,
          color: isDark ? ForestColor.forest200 : const Color(0xFF1A1A1A),
        ),
        bodyMedium: TextStyle(
          fontFamily: _fontFamily,
          fontSize: 14,
          fontWeight: FontWeight.w400,
          letterSpacing: 0.25,
          color: isDark ? ForestColor.forest300 : const Color(0xFF5A5A5A),
        ),
        bodySmall: TextStyle(
          fontFamily: _fontFamily,
          fontSize: 12,
          fontWeight: FontWeight.w400,
          letterSpacing: 0.4,
          color: isDark ? ForestColor.forest400 : const Color(0xFF7A7A7A),
        ),
        // Label
        labelLarge: TextStyle(
          fontFamily: _fontFamily,
          fontSize: 14,
          fontWeight: FontWeight.w600,
          letterSpacing: 0.1,
          color: isDark ? ForestColor.forest200 : ForestColor.forest700,
        ),
        labelMedium: TextStyle(
          fontFamily: _fontFamily,
          fontSize: 12,
          fontWeight: FontWeight.w600,
          letterSpacing: 0.5,
          color: isDark ? ForestColor.forest300 : ForestColor.forest600,
        ),
        labelSmall: TextStyle(
          fontFamily: _fontFamily,
          fontSize: 11,
          fontWeight: FontWeight.w600,
          letterSpacing: 0.5,
          color: isDark ? ForestColor.forest400 : ForestColor.forest500,
        ),
      ),

      // ── Scaffold ────────────────────────────────────────────────────────
      scaffoldBackgroundColor: isDark
          ? const Color(0xFF071A0E)
          : const Color(0xFFF0F7F2),

      // ── Scrollbar ───────────────────────────────────────────────────────
      scrollbarTheme: ScrollbarThemeData(
        thumbColor: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.dragged)) {
            return colorScheme.primary.withOpacity(0.7);
          }
          return colorScheme.primary.withOpacity(0.3);
        }),
        radius: const Radius.circular(4),
        thickness: WidgetStateProperty.all(6),
      ),
    );
  }
}

/// Helper extension on BuildContext for quick theme access.
extension ThemeContextExtension on BuildContext {
  ThemeData get appTheme => Theme.of(this);
  ColorScheme get appColorScheme => Theme.of(this).colorScheme;
  TextTheme get appTextTheme => Theme.of(this).textTheme;
  bool get isDarkMode => Theme.of(this).brightness == Brightness.dark;
}

/// Helper extension for status color lookups.
extension StatusColorExtension on String {
  Color toStatusColor() {
    switch (toLowerCase()) {
      case 'critical':
        return StatusColor.critical;
      case 'high':
        return StatusColor.high;
      case 'medium':
        return StatusColor.medium;
      case 'low':
        return StatusColor.low;
      default:
        return StatusColor.low;
    }
  }

  Color toStatusLightColor() {
    switch (toLowerCase()) {
      case 'critical':
        return StatusColor.criticalLight;
      case 'high':
        return StatusColor.highLight;
      case 'medium':
        return StatusColor.mediumLight;
      case 'low':
        return StatusColor.lowLight;
      default:
        return StatusColor.lowLight;
    }
  }
}
