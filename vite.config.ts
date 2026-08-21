import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    base: './',
    build: {
        // Every asset ships inside the APK, so there is no request to save by
        // inlining. Base64 only grows the file by a third and puts the cost on
        // the JS parse at startup, which is the one place a cheap phone feels it.
        assetsInlineLimit: 0,
    },
})