import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  TouchableOpacity,
  Alert,
} from "react-native";
import MapView, { Marker } from "../components/CareMap";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COLORS } from "../theme";

const API_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://192.168.100.25:8000/api";

export default function SearchingScreen({ navigation, route }) {
  // Extract data safely
  const { location, triageData } = route.params || {};
  const symptoms = triageData?.symptoms || [];

  const [pulseAnim] = useState(new Animated.Value(1));
  const [isSearching, setIsSearching] = useState(true);

  useEffect(() => {
    // Pulse Animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 2,
          duration: 1000,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Actual Backend Integration
    const createRequest = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");

        // Construct payload
        const payload = {
          symptoms: triageData?.symptoms || [],
          age_group: triageData?.age_group || "Adult",
          is_conscious: triageData?.is_conscious ?? true,
          history_notes: triageData?.history_notes || "",
          pickup_lat: location?.latitude || 37.78825,
          pickup_lng: location?.longitude || -122.4324,
        };

        const response = await fetch(`${API_URL}/request/create`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        const text = await response.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch (e) {
          console.error("Backend Error (HTML):", text.substring(0, 100));
          Alert.alert(
            "Server Error",
            "The server returned an invalid response.",
          );
          if (isSearching) navigation.goBack();
          return;
        }

        if (response.ok) {
          // Wait a bit to show animation
          setTimeout(() => {
            navigation.replace("TrackNurse", {
              request: data.request,
              triageLevel: data.triage, // Red/Amber/Green
            });
          }, 3000);
        } else {
          Alert.alert("Error", data.message || "Failed to create request");
          if (isSearching) navigation.goBack();
        }
      } catch (error) {
        Alert.alert("Error", "Network error. Please try again.");
        console.error(error);
        if (isSearching) navigation.goBack();
      }
    };

    // Only verify if we have valid data
    if (triageData) {
      createRequest();
    } else {
      // Fallback for direct nav without params
      setTimeout(() => navigation.goBack(), 2000);
    }

    return () => setIsSearching(false);
  }, []);

  return (
    <View style={styles.container}>
      <MapView
        style={StyleSheet.absoluteFillObject}
        initialRegion={{
          latitude: location?.latitude || 37.78825,
          longitude: location?.longitude || -122.4324,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
        scrollEnabled={false}
      >
        <Marker
          coordinate={location || { latitude: 37.78825, longitude: -122.4324 }}
          pinColor={COLORS.primary}
        />
      </MapView>

      <View style={styles.overlay}>
        <Animated.View
          style={[styles.radar, { transform: [{ scale: pulseAnim }] }]}
        />
        <View style={styles.card}>
          <Text style={styles.title}>Contacting nearby nurses...</Text>
          <Text style={styles.subtitle}>
            Broadcasting:{" "}
            {symptoms.length > 0 ? symptoms.join(", ") : "Emergency"}
          </Text>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ marginTop: 20 }}
          >
            <Text style={{ color: COLORS.primary, fontWeight: "bold" }}>
              Cancel Request
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  radar: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255, 77, 77, 0.4)", // Approximating COLORS.primary opaque
    position: "absolute",
  },
  card: {
    backgroundColor: COLORS.white,
    padding: 30,
    borderRadius: 20,
    alignItems: "center",
    width: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: COLORS.black,
  },
  subtitle: { color: COLORS.mediumGray, textAlign: "center" },
});
