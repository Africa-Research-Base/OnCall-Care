import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Switch,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

const { width } = Dimensions.get("window");

export default function NurseDashboard({ navigation }) {
  const [isOnline, setIsOnline] = useState(false);
  const [earnings, setEarnings] = useState(15000);
  const [locationSubscription, setLocationSubscription] = useState(null);

  // Poll for pending requests
  useEffect(() => {
    let interval;
    if (isOnline) {
      interval = setInterval(async () => {
        try {
          const token = await AsyncStorage.getItem("userToken");
          const response = await fetch(`${API_URL}/nurse/requests/pending`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await response.json();

          if (data.length > 0) {
            // Found a request!
            const req = data[0];
            let symptomsList = [];
            try {
              // Handle case where symptoms might be string or already object
              if (typeof req.symptoms === "string") {
                symptomsList = JSON.parse(req.symptoms);
              } else if (Array.isArray(req.symptoms)) {
                symptomsList = req.symptoms;
              }
            } catch (e) {
              console.log("Error parsing symptoms:", e);
              symptomsList = ["Unknown Symptoms"];
            }

            // Ensure array
            if (!Array.isArray(symptomsList)) symptomsList = [];

            navigation.navigate("JobAlert", {
              patient: {
                name: "Patient (ID: " + req.patient_id + ")",
                symptom: symptomsList.join(", "),
                severity: req.severity, // RED/AMBER/GREEN
                distance: "2.5km",
                address: req.address || "123 Main St",
                id: req.id,
                latitude: parseFloat(req.pickup_lat),
                longitude: parseFloat(req.pickup_lng),
              },
            });
          }
        } catch (e) {
          console.log("Polling error:", e);
        }
      }, 5000); // Poll every 5 seconds

      // Start Location Watch
      (async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          const sub = await Location.watchPositionAsync(
            {
              accuracy: Location.Accuracy.High,
              timeInterval: 10000,
              distanceInterval: 10,
            },
            (loc) => {
              console.log("Sending Nurse Location:", loc.coords);
              // API call to update location would go here
            },
          );
          setLocationSubscription(sub);
        }
      })();
    }
    return () => clearInterval(interval);
  }, [isOnline]);

  const toggleSwitch = () => {
    setIsOnline((previousState) => !previousState);
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("userToken");
    // Navigate to Auth stack
    navigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, Nurse Sarah</Text>
          <Text style={styles.statusLabel}>
            {isOnline ? "You are ONLINE" : "You are OFFLINE"}
          </Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
        <Switch
          trackColor={{ false: "#767577", true: "#2ecc71" }}
          thumbColor={isOnline ? "#fff" : "#f4f3f4"}
          onValueChange={toggleSwitch}
          value={isOnline}
        />
      </View>

      <View style={styles.statsCard}>
        <Text style={styles.statsLabel}>Today's Earnings</Text>
        <Text style={styles.earnings}>₦{earnings.toLocaleString()}</Text>
        <Text style={styles.jobsCount}>3 Jobs Completed</Text>
      </View>

      <View style={styles.centerContainer}>
        {isOnline ? (
          <View style={styles.radarContainer}>
            <View style={styles.radar} />
            <Text style={styles.waitingText}>Waiting for requests...</Text>
          </View>
        ) : (
          <Text style={styles.offlineText}>
            Go Online to start receiving jobs.
          </Text>
        )}
      </View>

      <TouchableOpacity
        style={styles.kycButton}
        onPress={() => navigation.navigate("KYC")}
      >
        <Text style={styles.kycText}>Update License / KYC</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f6fa", padding: 20 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
    marginTop: 20,
  },
  greeting: { fontSize: 22, fontWeight: "bold", color: "#2c3e50" },
  statusLabel: { color: "#7f8c8d" },
  logoutBtn: { marginRight: 10 },
  logoutText: { color: "#e74c3c", fontWeight: "bold" },
  statsCard: {
    backgroundColor: "#2c3e50",
    padding: 25,
    borderRadius: 15,
    marginBottom: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    elevation: 8,
  },
  statsLabel: { color: "#bdc3c7", fontSize: 14, marginBottom: 5 },
  earnings: { color: "#fff", fontSize: 36, fontWeight: "bold" },
  jobsCount: { color: "#2ecc71", marginTop: 10, fontWeight: "bold" },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  offlineText: { color: "#bdc3c7", fontSize: 16 },
  waitingText: { marginTop: 20, color: "#7f8c8d" },
  radarContainer: { alignItems: "center" },
  radar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#2ecc71",
    backgroundColor: "rgba(46, 204, 113, 0.1)",
  },
  kycButton: { alignSelf: "center", marginBottom: 20 },
  kycText: { color: "#3498db", textDecorationLine: "underline" },
});
