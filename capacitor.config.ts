import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.nuevaecija.anisense',
  appName: 'AniSense',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      // Android 12+ draws the splash from the system theme, not from a plugin
      // image. Keeping the plugin's own duration at 0 and hiding it ourselves
      // once React has painted avoids the classic double-splash: the system
      // screen, then a second identical one from the webview.
      launchAutoHide: false,
      backgroundColor: '#16211B',
      androidSplashResourceName: 'splash',
      showSpinner: false,
    },
    StatusBar: {
      // The app is edge to edge: the webview runs under the status bar and
      // the header paints that strip. Style (icon colour) is still driven per
      // screen from lib/platform.ts; the colour set there is ignored from
      // Android 15 on, which is exactly why the strip has to come from CSS.
      overlaysWebView: true,
      style: 'DARK',
      backgroundColor: '#16211B',
    },
    Keyboard: {
      resize: 'native',
      resizeOnFullScreen: true,
    },
  },
};

export default config;
