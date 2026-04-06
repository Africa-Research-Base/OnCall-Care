import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
} from "react-native";
import MapView, { Marker, Polyline } from "../components/CareMap";
import { Ionicons } from "@expo/vector-icons";

import AsyncStorage from "@react-native-async-storage/async-storage";

const { width, height } = Dimensions.get("window");
const API_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://192.168.100.25:8000/api";

export default function ActiveJobScreen({ navigation, route }) {
  const { patient } = route.params;
  const [status, setStatus] = useState("EN_ROUTE"); // EN_ROUTE, ARRIVED, TREATING

  // Real locations (In real app, get from Location.getCurrentPositionAsync)
  const [nurseLoc, setNurseLoc] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
  });

  // Parse patient location
  const patientLoc = {
    latitude: patient.latitude || 37.78925,
    longitude: patient.longitude || -122.4344,
  };

  const handleAction = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      let apiStatus = null;
      let nextStatus = status;

      if (status === "EN_ROUTE") {
        apiStatus = "arrived";
        nextStatus = "ARRIVED";
      } else if (status === "ARRIVED") {
        // Treating is a local state, maybe we don't need API call yet or "treatment_started"
        nextStatus = "TREATING";
      } else if (status === "TREATING") {
        apiStatus = "completed";
        nextStatus = "COMPLETED";
      }

      if (apiStatus) {
        await fetch(`${API_URL}/request/${patient.id}/status`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: apiStatus }),
        });
      }

      setStatus(nextStatus);

      if (nextStatus === "TREATING") {
        // Just UI update
        Alert.alert("Update", "Treatment started.");
      } else if (nextStatus === "COMPLETED") {
        Alert.alert("Job Complete", "Earnings added to your wallet!");
        navigation.navigate("NurseDashboard");
      } else if (nextStatus === "ARRIVED") {
        Alert.alert("Update", "Patient notified that you have arrived.");
      }
    } catch (e) {
      Alert.alert("Error", "Network request failed");
      console.log(e);
    }
  };

  const getButtonText = () => {
    switch (status) {
      case "EN_ROUTE":
        return "I HAVE ARRIVED";
      case "ARRIVED":
        return "START TREATMENT";
      case "TREATING":
        return "COMPLETE JOB";
      default:
        return "ACTION";
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: nurseLoc.latitude,
          longitude: nurseLoc.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        <Marker coordinate={nurseLoc} title="You" pinColor="green" />
        <Marker coordinate={patientLoc} title="Patient" pinColor="red" />
        <Polyline
          coordinates={[nurseLoc, patientLoc]}
          strokeColor="#3498db"
          strokeWidth={4}
        />
      </MapView>

      <View style={styles.panel}>
        <Text style={styles.statusTitle}>
          Status:{" "}
          <Text style={{ color: "#e67e22" }}>{status.replace("_", " ")}</Text>
        </Text>

        <View style={styles.patientCard}>
          <Text style={styles.patientName}>{patient.name}</Text>
          <Text style={styles.symptom}>{patient.symptom}</Text>
          <View style={styles.iconRow}>
            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name="call" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name="chatbubble" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.mainBtn,
            status === "TREATING" ? styles.completeBtn : styles.actionBtn,
          ]}
          onPress={handleAction}
        >
          <Text style={styles.btnText}>{getButtonText()}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width, height: height * 0.6 },
  panel: {
    flex: 1,
    backgroundColor: "white",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 30,
    marginTop: -40,
  },
  statusTitle: {
    fontSize: 18,
    alignSelf: "center",
    marginBottom: 20,
    fontWeight: "bold",
    color: "#7f8c8d",
  },
  patientCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  patientName: { fontSize: 22, fontWeight: "bold", color: "#2c3e50" },
  symptom: { color: "#e74c3c", marginTop: 5 },
  iconRow: { flexDirection: "row", gap: 15 },
  iconBtn: { backgroundColor: "#34495e", padding: 10, borderRadius: 20 },
  mainBtn: {
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
    elevation: 5,
  },
  actionBtn: { backgroundColor: "#3498db" },
  completeBtn: { backgroundColor: "#2ecc71" },
  btnText: { color: "white", fontSize: 18, fontWeight: "bold" },
});
