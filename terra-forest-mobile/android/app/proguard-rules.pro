# Flutter wrapper
-keep class io.flutter.app.** { *; }
-keep class io.flutter.plugin.** { *; }
-keep class io.flutter.util.** { *; }
-keep class io.flutter.view.** { *; }
-keep class io.flutter.** { *; }
-keep class io.flutter.plugins.** { *; }

# Google Play Core — Flutter's PlayStoreDeferredComponentManager references
# these classes even when deferred components aren't used. Suppress R8 errors.
# Without this, `flutter build apk --release` fails with:
#   Missing class com.google.android.play.core.splitcompat.SplitCompatApplication
#   Missing class com.google.android.play.core.splitinstall.*
-dontwarn com.google.android.play.core.**

# Retrofit
-keepattributes Signature
-keepattributes *Annotation*
-keep class retrofit.** { *; }
-keepclassmembernames interface * {
    @retrofit2.http.* <methods>;
}

# Gson
-keepattributes Signature
-keepattributes *Annotation*
-keep class com.google.gson.** { *; }
