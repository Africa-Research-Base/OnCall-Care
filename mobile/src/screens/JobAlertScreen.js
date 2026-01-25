import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  Vibration,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";

import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");
const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

export default function JobAlertScreen({ navigation, route }) {
  const { patient } = route.params;
  const [timer, setTimer] = useState(30);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    // Start Alarm (Simulated logic - in real app use Expo Audio)
    const interval = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          clearInterval(interval);
          navigation.goBack(); // Auto-reject
          return 0;
        }
        return t - 1;
      });
      Vibration.vibrate();
    }, 1000);

    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.5,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    return () => clearInterval(interval);
  }, []);

  const handleAccept = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      // API Call to accept
      const response = await fetch(`${API_URL}/request/${patient.id}/accept`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        // Stop alarm/vibration
        clearInterval(timer);
        navigation.replace("ActiveJob", { patient });
      } else {
        console.log("Failed to accept");
        navigation.goBack();
      }
    } catch (e) {
      console.log(e);
      navigation.goBack();
    }
  };

  const handleReject = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.alertBox, { opacity: fadeAnim }]}>
        <Text style={styles.alertTitle}>EMERGENCY ALERT</Text>
      </Animated.View>

      <View style={styles.infoCard}>
        <Text style={styles.symptom}>{patient.symptom}</Text>
        <Text style={styles.dist}>{patient.distance} away</Text>
        <View style={styles.divider} />
        <Text style={styles.label}>Patient:</Text>
        <Text style={styles.value}>{patient.name}</Text>
        <Text style={styles.label}>Location:</Text>
        <Text style={styles.value}>{patient.address}</Text>
      </View>

      <Text style={styles.timer}>Declining in {timer}s...</Text>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.rejectBtn} onPress={handleReject}>
          <Ionicons name="close" size={40} color="white" />
          <Text style={styles.btnText}>REJECT</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.acceptBtn} onPress={handleAccept}>
          <Ionicons name="checkmark" size={40} color="white" />
          <Text style={styles.btnText}>ACCEPT</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2c3e50",
    justifyContent: "center",
    padding: 20,
  },
  alertBox: {
    backgroundColor: "#e74c3c",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 30,
  },
  alertTitle: {
    color: "white",
    fontWeight: "bold",
    fontSize: 24,
    letterSpacing: 2,
  },
  infoCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    elevation: 10,
  },
  symptom: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#e74c3c",
    marginBottom: 5,
  },
  dist: { fontSize: 20, color: "#7f8c8d", marginBottom: 20 },
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: "#eee",
    marginBottom: 15,
  },
  label: { fontSize: 14, color: "#95a5a6", marginTop: 10 },
  value: { fontSize: 18, color: "#2c3e50", fontWeight: "bold" },
  timer: { color: "white", textAlign: "center", marginTop: 30, fontSize: 16 },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 40,
  },
  rejectBtn: {
    backgroundColor: "#7f8c8d",
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "rgba(255,255,255,0.2)",
  },
  acceptBtn: {
    backgroundColor: "#2ecc71",
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "rgba(255,255,255,0.2)",
  },
  btnText: { color: "white", fontWeight: "bold", marginTop: 5 },
});
