import React from "react";
import { Platform, View, Text, StyleSheet } from "react-native";

let MapView, Marker, Polyline;

if (Platform.OS !== "web") {
  const Maps = require("react-native-maps");
  MapView = Maps.default;
  Marker = Maps.Marker;
  Polyline = Maps.Polyline;
} else {
  // Web Fallback Components
  MapView = ({ children, style }) => (
    <View style={[style, styles.webMap]}>
      <Text style={styles.webText}>Map View (Not supported on Web)</Text>
      {children}
    </View>
  );
  Marker = () => null;
  Polyline = () => null;
}

const styles = StyleSheet.create({
  webMap: {
    backgroundColor: "#e6e6e6",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  webText: {
    color: "#666",
    fontWeight: "bold",
  },
});

export default MapView;
export { Marker, Polyline };
