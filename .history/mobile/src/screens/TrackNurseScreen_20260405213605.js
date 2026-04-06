import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
} from "react-native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COLORS, SIZES, SHADOWS } from "../theme";

const { width, height } = Dimensions.get("window");
const API_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://192.168.100.25:8000/api";

export default function TrackNurseScreen({ navigation, route }) {
  const { request, triageLevel } = route.params;

  const [matchedNurse, setMatchedNurse] = useState(null);
  const [nurseCoords, setNurseCoords] = useState(null);
  const [status, setStatus] = useState("searching");

  const severityColor =
    triageLevel === "RED"
      ? COLORS.primary
      : triageLevel === "AMBER"
        ? "#f39c12"
        : COLORS.green;

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        const response = await fetch(`${API_URL}/request/${request.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.nurse) {
            setMatchedNurse(data.nurse);
            setNurseCoords({
              latitude:
                data.nurse.lat || parseFloat(request.pickup_lat) + 0.002,
              longitude:
                data.nurse.lng || parseFloat(request.pickup_lng) + 0.002,
            });
            setStatus(data.status);
          }
        }
      } catch (e) {
        console.log("Error polling request:", e);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [request.id]);

  const handleCall = () => {
    Linking.openURL(`tel:${matchedNurse.phone}`);
  };

  const pickupLocation = {
    latitude: parseFloat(request.pickup_lat),
    longitude: parseFloat(request.pickup_lng),
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: pickupLocation.latitude,
          longitude: pickupLocation.longitude,
          latitudeDelta: 0.015,
          longitudeDelta: 0.015,
        }}
      >
        <Marker coordinate={pickupLocation} title="You">
          <View style={styles.myLocationMarker}>
            <View style={styles.myLocationDot} />
          </View>
        </Marker>

        {matchedNurse && nurseCoords && (
          <Marker
            coordinate={nurseCoords}
            title={matchedNurse?.name || "Nurse"}
            description={matchedNurse?.eta || "En Route"}
          >
            <View style={styles.nurseMarker}>
              <Ionicons name="medical" size={18} color="white" />
            </View>
          </Marker>
        )}

        {nurseCoords && (
          <Polyline
            coordinates={[pickupLocation, nurseCoords]}
            strokeColor={COLORS.primary}
            strokeWidth={4}
          />
        )}
      </MapView>

      <View style={styles.nurseCard}>
        {!matchedNurse ? (
          <View style={styles.searchingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.searchingTitle}>Finding your nurse...</Text>
            <Text style={styles.searchingSubtitle}>
              Connecting you with the nearest responder.
            </Text>

            <TouchableOpacity
              style={styles.cancelLink}
              onPress={() => navigation.navigate("PatientHome")}
            >
              <Text style={styles.cancelLinkText}>Cancel Request</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Status Bar */}
            <View style={styles.statusRow}>
              <View style={styles.statusBar}>
                <Text style={styles.statusText}>
                  {status === "arrived" ? "NURSE ARRIVED" : "EN ROUTE"}
                </Text>
              </View>
              <View
                style={{
                  backgroundColor: severityColor,
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 20,
                }}
              >
                <Text
                  style={{ color: "white", fontWeight: "bold", fontSize: 10 }}
                >
                  {triageLevel}
                </Text>
              </View>
            </View>

            {/* Nurse Info */}
            <View style={styles.nurseInfoRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {matchedNurse.name.charAt(0)}
                </Text>
              </View>
              <View style={styles.infoText}>
                <Text style={styles.name}>{matchedNurse.name}</Text>
                <Text style={styles.subInfo}>
                  <Ionicons name="star" size={12} color="#f1c40f" />{" "}
                  {matchedNurse.rating || "5.0"} • {matchedNurse.vehicle}
                </Text>
              </View>
              <View style={styles.etaContainer}>
                <Text style={styles.etaLabel}>ETA</Text>
                <Text style={styles.etaValue}>
                  {matchedNurse.eta || "5 min"}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Actions */}
            <View style={styles.actions}>
              <TouchableOpacity style={styles.callBtn} onPress={handleCall}>
                <Ionicons name="call" size={20} color="white" />
                <Text style={styles.callText}>Call</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => navigation.navigate("PatientHome")}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  map: { width: width, height: height * 0.65 }, // Map takes more space now

  myLocationMarker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(52, 152, 219, 0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  myLocationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#3498db",
    borderWidth: 2,
    borderColor: "white",
  },

  nurseMarker: {
    backgroundColor: COLORS.primary,
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "white",
    ...SHADOWS.small,
  },

  nurseCard: {
    flex: 1,
    backgroundColor: "white",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 25,
    marginTop: -25,
    ...SHADOWS.medium,
  },

  searchingContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  searchingTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
    marginTop: 15,
  },
  searchingSubtitle: {
    color: COLORS.mediumGray,
    marginTop: 5,
    textAlign: "center",
  },
  cancelLink: { marginTop: 25 },
  cancelLinkText: { color: COLORS.mediumGray, fontWeight: "600" },

  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  statusText: {
    color: COLORS.primary,
    fontWeight: "bold",
    letterSpacing: 1,
  },

  nurseInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.gray,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.darkGray,
  },
  infoText: { flex: 1 },
  name: { fontSize: 18, fontWeight: "bold", color: COLORS.black },
  subInfo: { color: COLORS.mediumGray, marginTop: 4 },

  etaContainer: { alignItems: "flex-end" },
  etaLabel: { fontSize: 10, color: COLORS.mediumGray, fontWeight: "bold" },
  etaValue: { fontSize: 18, color: COLORS.black, fontWeight: "bold" },

  divider: { height: 1, backgroundColor: COLORS.lightGray, marginBottom: 20 },

  actions: { flexDirection: "row", justifyContent: "space-between" },
  callBtn: {
    flex: 1,
    backgroundColor: COLORS.green,
    padding: 15,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContents: "center",
    marginRight: 10,
    justifyContent: "center",
  },
  callText: { color: "white", fontWeight: "bold", marginLeft: 8 },

  cancelBtn: {
    flex: 1,
    backgroundColor: COLORS.gray,
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },
  cancelText: { color: COLORS.darkGray, fontWeight: "bold" },
});
