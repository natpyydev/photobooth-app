package com.teamsteve.photobooth;

import android.os.Bundle;
import android.view.KeyEvent;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Capacitor's default Bridge init already happens in BridgeActivity —
        // nothing else needed here.
    }

    /**
     * Fix for the "Volume Up / Volume Down raises or lowers media
     * volume instead of taking a photo" issue.
     *
     * dispatchKeyEvent() sees hardware key events BEFORE Android's
     * default volume handler does. By intercepting both
     * KEYCODE_VOLUME_UP and KEYCODE_VOLUME_DOWN here and returning
     * true, we tell Android "these keys are fully handled — don't
     * touch media volume, don't show the volume slider" — then we
     * call straight into the web app's existing
     * window.triggerCapture() function (already defined in
     * js/camera.js, no web code changes needed).
     */
    @Override
    public boolean dispatchKeyEvent(KeyEvent event) {

        int keyCode = event.getKeyCode();

        if (keyCode == KeyEvent.KEYCODE_VOLUME_UP || keyCode == KeyEvent.KEYCODE_VOLUME_DOWN) {

            if (event.getAction() == KeyEvent.ACTION_DOWN) {
                if (bridge != null && bridge.getWebView() != null) {
                    bridge.getWebView().post(() ->
                        bridge.getWebView().evaluateJavascript(
                            "window.triggerCapture && window.triggerCapture();",
                            null
                        )
                    );
                }
            }

            // Returning true for BOTH the ACTION_DOWN and ACTION_UP
            // events of these keys is what fully blocks the system —
            // no volume change, no on-screen volume slider, for
            // either button.
            return true;
        }

        return super.dispatchKeyEvent(event);
    }

    /**
     * Fixes a known Cordova/Capacitor WebView quirk where hardware key
     * events stop reaching the page after the app is backgrounded and
     * resumed (e.g. screen off/on) until the user taps the screen once.
     * Without this, the remote may appear to "stop working" after a
     * while during a long event.
     */
    @Override
    public void onResume() {
        super.onResume();
        if (bridge != null && bridge.getWebView() != null) {
            bridge.getWebView().requestFocus();
        }
    }
}
