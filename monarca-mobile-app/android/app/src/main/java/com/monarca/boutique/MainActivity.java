package com.monarca.boutique;

import android.graphics.Color;
import android.os.Bundle;
import android.os.Build;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.ValueCallback;
import androidx.activity.OnBackPressedCallback;
import androidx.core.graphics.Insets;
import androidx.core.view.WindowCompat;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        Window window = getWindow();
        
        // Ensure webview content starts strictly BELOW the system status bar
        WindowCompat.setDecorFitsSystemWindows(window, true);
        
        window.clearFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_STATUS);
        window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
        window.setStatusBarColor(Color.parseColor("#fefdfa"));
        window.setNavigationBarColor(Color.parseColor("#fefdfa"));
        
        WindowInsetsControllerCompat controller = WindowCompat.getInsetsController(window, window.getDecorView());
        if (controller != null) {
            // Dark icons (time, battery, wifi, 4G) on cream background
            controller.setAppearanceLightStatusBars(true);
            controller.setAppearanceLightNavigationBars(true);
        }

        // Android 15 enforces edge-to-edge for targetSdk 35. Insets applied to
        // the WebView itself do not reliably move its HTML viewport, so inset
        // the Capacitor parent container instead. Older Android versions keep
        // the normal decor-fit behavior and must not receive this padding.
        if (Build.VERSION.SDK_INT >= 35 && getBridge() != null && getBridge().getWebView() != null) {
            View webView = getBridge().getWebView();
            View parent = webView.getParent() instanceof View
                    ? (View) webView.getParent()
                    : findViewById(android.R.id.content);
            if (parent != null) {
                parent.setBackgroundColor(Color.parseColor("#fefdfa"));
                ViewCompat.setOnApplyWindowInsetsListener(webView, (view, insets) -> {
                    Insets bars = insets.getInsets(
                            WindowInsetsCompat.Type.statusBars() | WindowInsetsCompat.Type.displayCutout());
                    int topInset = bars.top;
                    if (topInset <= 0) {
                        int resourceId = getResources().getIdentifier("status_bar_height", "dimen", "android");
                        if (resourceId > 0) {
                            topInset = getResources().getDimensionPixelSize(resourceId);
                        }
                    }
                    parent.setPadding(parent.getPaddingLeft(), topInset,
                            parent.getPaddingRight(), parent.getPaddingBottom());
                    return insets;
                });
                ViewCompat.requestApplyInsets(webView);
            }
        }

        // Intercept Android hardware back button and edge-swipe back gesture
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                handleSystemBack();
            }
        });
    }

    private void handleSystemBack() {
        if (getBridge() == null || getBridge().getWebView() == null) {
            finish();
            return;
        }

        // Evaluate Javascript to check if we can close a sheet or navigate back
        String js = "(function() {" +
            "  try {" +
            "    var overlays = document.getElementById('overlay-root');" +
            "    if (overlays && overlays.children.length > 0 && overlays.innerHTML.trim() !== '') {" +
            "      if (window.Monarca && window.Monarca.closeSheet) { window.Monarca.closeSheet(); return 'sheet_closed'; }" +
            "    }" +
            "    var curRoute = (window.Monarca && window.Monarca.ui && window.Monarca.ui.route) || location.hash.replace(/^#/, '') || 'home';" +
            "    if (curRoute !== 'home' && curRoute !== '') {" +
            "      if (window.Monarca && window.Monarca.back) { window.Monarca.back(); return 'nav_back'; }" +
            "    }" +
            "  } catch(e) {}" +
            "  return 'exit';" +
            "})()";

        getBridge().getWebView().evaluateJavascript(js, new ValueCallback<String>() {
            @Override
            public void onReceiveValue(String value) {
                if (value == null || value.contains("exit") || value.equals("\"exit\"")) {
                    finish();
                }
            }
        });
    }
}
