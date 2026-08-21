import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { LanguageProvider } from './i18n'
import { SplashScreen } from '@capacitor/splash-screen'
import { Capacitor } from '@capacitor/core'

const root = ReactDOM.createRoot(document.getElementById('root')!)

root.render(
  <React.StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </React.StrictMode>
)

// Hold the native splash until React has actually painted a frame. Auto-hiding
// on a timer is the usual approach and the usual bug: on a slow cold start the
// splash disappears while the webview is still white, so the user watches a
// blank screen. Two rAFs guarantee we are past first paint.
if (Capacitor.isNativePlatform()) {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      void SplashScreen.hide({ fadeOutDuration: 200 }).catch(() => {})
    })
  })
}
