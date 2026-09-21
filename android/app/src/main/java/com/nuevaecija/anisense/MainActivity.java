package com.nuevaecija.anisense;

import android.os.Bundle;
import androidx.core.view.WindowCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Draw edge to edge. Android hands the window the whole screen, but by
        // default the decor view pads the content back inside the status bar
        // and the gesture bar -- which left the webview at [0,128][1080,2337]
        // on a 1080x2400 phone, with the theme's grey showing in the gaps.
        // With this off the web layer owns every pixel and takes the insets
        // itself, through env(safe-area-inset-*).
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
    }
}
