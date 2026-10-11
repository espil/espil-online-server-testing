import React, { useMemo, useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { WebView } from 'react-native-webview';

const PROTOTYPE_URL = 'http://127.0.0.1:8787/';

const injectedControls = `
  window.cauldronNative = true;
  true;
`;

export default function App() {
  const { width, height } = useWindowDimensions();
  const [showOverlay, setShowOverlay] = useState(true);
  const deviceProfile = useMemo(() => {
    const ratio = Math.round((height / width) * 100) / 100;
    if (width <= 430 && height >= 900) return 'iPhone 15 class';
    if (width <= 430 && ratio > 1.9) return 'Galaxy Flip cover/tall class';
    return `${Math.round(width)}x${Math.round(height)}`;
  }, [width, height]);

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" />
      <WebView
        source={{ uri: PROTOTYPE_URL }}
        style={styles.webview}
        geolocationEnabled
        injectedJavaScript={injectedControls}
        allowsInlineMediaPlayback
      />
      {showOverlay && (
        <View style={styles.overlay} pointerEvents="box-none">
          <Text style={styles.label}>Cauldron Mobile · {deviceProfile}</Text>
          <TouchableOpacity style={styles.close} onPress={() => setShowOverlay(false)}>
            <Text style={styles.closeText}>HUD OFF</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#050914' },
  webview: { flex: 1, backgroundColor: '#050914' },
  overlay: { position: 'absolute', top: 10, left: 12, right: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { color: '#fff4cf', fontWeight: '800', fontSize: 12, backgroundColor: 'rgba(0,0,0,.35)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  close: { backgroundColor: 'rgba(255,213,107,.9)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  closeText: { color: '#24150e', fontWeight: '900', fontSize: 11 }
});
