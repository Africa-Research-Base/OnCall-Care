import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
} from "react-native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COLORS, SIZES, SHADOWS } from "../theme";
import { API_URL } from "../config/api";

const { width, height } = Dimensions.get("window");

const toNumber = (value) => {
  if (value === null || value === undefined) {
    return null;
  }

  const parsed =
    typeof value === "number" ? value : parseFloat(String(value).trim());

  return Number.isFinite(parsed) ? parsed : null;
};

export default function TrackNurseScreen({ navigation, route }) {
  const { request, triageLevel } = route.params;

  const [matchedNurse, setMatchedNurse] = useState(null);
  const [nurseCoords, setNurseCoords] = useState(null);
  const [hasLiveNurseLocation, setHasLiveNurseLocation] = useState(false);
  const [status, setStatus] = useState("searching");
  const [isCancelModalVisible, setIsCancelModalVisible] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);
  const [hasCancellationAlerted, setHasCancellationAlerted] = useState(false);

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
          setStatus(data.status);

          if (data.status === "cancelled" && !hasCancellationAlerted) {
            setHasCancellationAlerted(true);
            Alert.alert(
              "Request Cancelled",
              "This request has been cancelled.",
              [
                {
                  text: "OK",
                  onPress: () => navigation.replace("PatientHome"),
                },
              ],
            );
            return;
          }

          if (data.nurse) {
            setMatchedNurse(data.nurse);

            const nurseLat = toNumber(data.nurse.lat);
            const nurseLng = toNumber(data.nurse.lng);
            const fallbackLat = toNumber(request?.pickup_lat);
            const fallbackLng = toNumber(request?.pickup_lng);

            setHasLiveNurseLocation(nurseLat !== null && nurseLng !== null);

            setNurseCoords({
              latitude:
                nurseLat ??
                (fallbackLat !== null ? fallbackLat + 0.002 : 37.79025),
              longitude:
                nurseLng ??
                (fallbackLng !== null ? fallbackLng + 0.002 : -122.4304),
            });
          }
        }
      } catch (e) {
        console.log("Error polling request:", e);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [
    hasCancellationAlerted,
    navigation,
    request.id,
    request?.pickup_lat,
    request?.pickup_lng,
  ]);

  const handleCall = () => {
    if (!matchedNurse?.phone) {
      Alert.alert(
        "No Phone Number",
        "Nurse phone number is not available yet.",
      );
      return;
    }

    Linking.openURL(`tel:${matchedNurse.phone}`);
  };

  const handleChat = () => {
    if (!matchedNurse?.phone) {
      Alert.alert(
        "No Phone Number",
        "Nurse phone number is not available yet.",
      );
      return;
    }

    Linking.openURL(`sms:${matchedNurse.phone}`);
  };

  const handleOpenDirections = async () => {
    if (!nurseCoords) {
      Alert.alert(
        "Directions Unavailable",
        "Live nurse location is not available yet.",
      );
      return;
    }

    const destination = `${nurseCoords.latitude},${nurseCoords.longitude}`;
    const googleMapsAppUrl = `comgooglemaps://?daddr=${destination}&directionsmode=driving`;
    const googleMapsWebUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;

    const canOpenApp = await Linking.canOpenURL(googleMapsAppUrl);
    await Linking.openURL(canOpenApp ? googleMapsAppUrl : googleMapsWebUrl);
  };

  const submitCancellation = async () => {
    const trimmedReason = cancelReason.trim();
    if (trimmedReason.length < 3) {
      Alert.alert(
        "Reason Required",
        "Please provide a short cancellation reason.",
      );
      return;
    }

    setIsCancelling(true);
    try {
      const token = await AsyncStorage.getItem("userToken");
      const response = await fetch(`${API_URL}/request/${request.id}/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: trimmedReason }),
      });

      const data = await response.json();
      if (!response.ok) {
        Alert.alert(
          "Unable to Cancel",
          data?.message || "Cancellation failed.",
        );
        return;
      }

      setIsCancelModalVisible(false);
      setCancelReason("");
      Alert.alert(
        "Request Cancelled",
        "Your request has been cancelled successfully.",
        [
          {
            text: "OK",
            onPress: () => navigation.replace("PatientHome"),
          },
        ],
      );
    } catch (_err) {
      Alert.alert(
        "Network Error",
        "Failed to cancel request. Please try again.",
      );
    } finally {
      setIsCancelling(false);
    }
  };

  const pickupLocation = {
    latitude: toNumber(request?.pickup_lat) ?? 37.78825,
    longitude: toNumber(request?.pickup_lng) ?? -122.4324,
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
              onPress={() => setIsCancelModalVisible(true)}
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

            <View style={styles.locationStatusWrap}>
              <Text
                style={
                  hasLiveNurseLocation
                    ? styles.locationStatusReady
                    : styles.locationStatusWaiting
                }
              >
                {hasLiveNurseLocation
                  ? "Live nurse location connected"
                  : "Waiting for nurse live location..."}
              </Text>
            </View>

            <View style={styles.divider} />

            {/* Actions */}
            <View style={styles.actions}>
              <TouchableOpacity style={styles.callBtn} onPress={handleCall}>
                <Ionicons name="call" size={20} color="white" />
                <Text style={styles.callText}>Call</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.chatBtn} onPress={handleChat}>
                <Ionicons name="chatbubble" size={20} color="white" />
                <Text style={styles.callText}>Chat</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.directionsBtn}
                onPress={handleOpenDirections}
              >
                <Ionicons name="navigate" size={20} color="white" />
                <Text style={styles.callText}>Directions</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setIsCancelModalVisible(true)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>

      <Modal
        visible={isCancelModalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setIsCancelModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Cancel Request</Text>
            <Text style={styles.modalText}>
              Tell us why you are cancelling this request.
            </Text>

            <TextInput
              style={styles.reasonInput}
              multiline
              numberOfLines={4}
              placeholder="Enter cancellation reason"
              value={cancelReason}
              onChangeText={setCancelReason}
              editable={!isCancelling}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalSecondaryBtn]}
                onPress={() => setIsCancelModalVisible(false)}
                disabled={isCancelling}
              >
                <Text style={styles.modalSecondaryText}>Keep Request</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalDangerBtn]}
                onPress={submitCancellation}
                disabled={isCancelling}
              >
                <Text style={styles.modalDangerText}>
                  {isCancelling ? "Cancelling..." : "Confirm Cancel"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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

  locationStatusWrap: {
    marginBottom: 14,
  },
  locationStatusWaiting: {
    alignSelf: "flex-start",
    fontSize: 12,
    color: "#92400e",
    backgroundColor: "#ffedd5",
    borderWidth: 1,
    borderColor: "#fdba74",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    fontWeight: "600",
  },
  locationStatusReady: {
    alignSelf: "flex-start",
    fontSize: 12,
    color: "#065f46",
    backgroundColor: "#d1fae5",
    borderWidth: 1,
    borderColor: "#6ee7b7",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    fontWeight: "600",
  },

  divider: { height: 1, backgroundColor: COLORS.lightGray, marginBottom: 20 },

  actions: { flexDirection: "row", justifyContent: "space-between" },
  callBtn: {
    flex: 1.1,
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

  chatBtn: {
    flex: 1,
    backgroundColor: "#2563eb",
    padding: 15,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 8,
  },

  directionsBtn: {
    flex: 1.35,
    backgroundColor: "#0f766e",
    padding: 15,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  cancelBtn: {
    flex: 0.9,
    backgroundColor: COLORS.gray,
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  cancelText: { color: COLORS.darkGray, fontWeight: "bold" },

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  modalCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 18,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.black,
  },
  modalText: {
    color: COLORS.mediumGray,
    marginTop: 6,
    marginBottom: 12,
  },
  reasonInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    padding: 10,
    minHeight: 95,
    textAlignVertical: "top",
    color: COLORS.black,
    backgroundColor: "#f8fafc",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 14,
  },
  modalBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  modalSecondaryBtn: {
    backgroundColor: "#e5e7eb",
    marginRight: 8,
  },
  modalDangerBtn: {
    backgroundColor: "#dc2626",
  },
  modalSecondaryText: {
    color: "#1f2937",
    fontWeight: "600",
  },
  modalDangerText: {
    color: "white",
    fontWeight: "700",
  },
});
