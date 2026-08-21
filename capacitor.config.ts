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
      // We drive this per screen from lib/platform.ts. `overlaysWebView: false`
      // keeps the bar as its own strip rather than letting content slide under
      // it, which is what you want when the header is already a solid colour.
      overlaysWebView: false,
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
