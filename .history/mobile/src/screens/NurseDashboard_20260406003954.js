import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  Switch,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { API_URL } from "../config/api";

export default function NurseDashboard({ navigation, route }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState("not_submitted");
  const [name, setName] = useState("Nurse");
  const [earnings, setEarnings] = useState(0);

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);

    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        navigation.replace("Login");
        return;
      }

      const [userRes, appRes] = await Promise.all([
        fetch(`${API_URL}/user`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/nurse/application`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const userData = await userRes.json();
      const appData = await appRes.json();

      setName(userData?.name || "Nurse");
      setIsVerified(Boolean(userData?.nurse_profile?.is_verified));
      setIsOnline(Boolean(userData?.nurse_profile?.is_online));
      setEarnings(Number(userData?.nurse_profile?.earnings || 0));
      setApplicationStatus(appData?.application_status || "not_submitted");
    } catch (error) {
      Alert.alert("Error", "Failed to load dashboard data.");
    } finally {
      setIsLoading(false);
    }
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      loadDashboard();
    }, [loadDashboard])
  );

  useEffect(() => {
    if (route?.params?.showApprovalNotice) {
      Alert.alert(
        "Application Approved",
        "Your nurse application has been approved and activated. Welcome to the Nurse Dashboard."
      );
      navigation.setParams({ showApprovalNotice: false });
    }
  }, [navigation, route?.params?.showApprovalNotice]);

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

          if (Array.isArray(data) && data.length > 0) {
            const req = data[0];
            let symptomsList = [];

            try {
              if (typeof req.symptoms === "string") {
                symptomsList = JSON.parse(req.symptoms);
              } else if (Array.isArray(req.symptoms)) {
                symptomsList = req.symptoms;
              }
            } catch (_err) {
              symptomsList = ["Unknown symptoms"];
            }

            navigation.navigate("JobAlert", {
              patient: {
                name: `Patient (ID: ${req.patient_id})`,
                symptom: symptomsList.join(", "),
                severity: req.severity,
                distance: "2.5km",
                address: req.address || "Address unavailable",
                id: req.id,
                latitude: parseFloat(req.pickup_lat),
                longitude: parseFloat(req.pickup_lng),
              },
            });
          }
        } catch (_err) {
          // Polling errors are already captured by global fetch logs.
        }
      }, 5000);

      (async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          return;
        }

        await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 10000,
            distanceInterval: 10,
          },
          async (loc) => {
            try {
              const token = await AsyncStorage.getItem("userToken");
              await fetch(`${API_URL}/nurse/location`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  lat: loc.coords.latitude,
                  lng: loc.coords.longitude,
                }),
              });
            } catch (_err) {
              // Ignore telemetry update failures.
            }
          }
        );
      })();
    }

    return () => clearInterval(interval);
  }, [isOnline, navigation]);

  const toggleSwitch = async () => {
    if (!isVerified) {
      Alert.alert(
        "Verification Required",
        "Submit and get your nurse application approved before going online."
      );
      return;
    }

    try {
      const token = await AsyncStorage.getItem("userToken");
      const response = await fetch(`${API_URL}/nurse/status`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (!response.ok) {
        Alert.alert("Action Failed", data.message || "Could not change status.");
        return;
      }

      setIsOnline(Boolean(data.is_online));
    } catch (error) {
      Alert.alert("Network Error", error?.message || "Failed to update status.");
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.multiRemove(["userToken", "userRole"]);
    navigation.reset({ index: 0, routes: [{ name: "Login" }] });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ef4444" />
        <Text style={styles.loadingText}>Preparing your dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        <Text style={styles.greeting}>Welcome, {name}</Text>
        <Text style={styles.subtitle}>OnCall Care Nurse Console</Text>

        <View style={styles.onlineRow}>
          <View>
            <Text style={styles.onlineLabel}>Availability</Text>
            <Text style={styles.onlineValue}>{isOnline ? "Online" : "Offline"}</Text>
          </View>
          <Switch
            trackColor={{ false: "#9ca3af", true: "#16a34a" }}
            thumbColor="#ffffff"
            onValueChange={toggleSwitch}
            value={isOnline}
          />
        </View>
      </View>

      <View style={styles.metricsRow}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Verification</Text>
          <Text style={styles.metricValue}>{isVerified ? "Approved" : "Pending"}</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Earnings</Text>
          <Text style={styles.metricValue}>N{earnings.toLocaleString()}</Text>
        </View>
      </View>

      {!isVerified && (
        <View style={styles.noticeCard}>
          <Text style={styles.noticeTitle}>Complete Nurse Onboarding</Text>
          <Text style={styles.noticeText}>
            Current application status: {applicationStatus.replace("_", " ")}
          </Text>
          <TouchableOpacity style={styles.noticeButton} onPress={() => navigation.navigate("KYC")}>
            <Text style={styles.noticeButtonText}>Submit / Update Application</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate("KYC")}>
        <Text style={styles.secondaryButtonText}>Edit Nurse Profile & KYC</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fb",
  },
  content: {
    padding: 20,
    gap: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f7fb",
  },
  loadingText: {
    marginTop: 12,
    color: "#64748b",
  },
  heroCard: {
    backgroundColor: "#0f172a",
    borderRadius: 20,
    padding: 20,
  },
  greeting: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 22,
  },
  subtitle: {
    color: "#cbd5e1",
    marginTop: 4,
    marginBottom: 18,
  },
  onlineRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 14,
    padding: 14,
  },
  onlineLabel: {
    color: "#94a3b8",
    fontSize: 12,
  },
  onlineValue: {
    color: "#ffffff",
    fontWeight: "700",
    marginTop: 2,
  },
  metricsRow: {
    flexDirection: "row",
    gap: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
  },
  metricLabel: {
    color: "#64748b",
    fontSize: 12,
  },
  metricValue: {
    color: "#0f172a",
    fontWeight: "700",
    marginTop: 6,
    fontSize: 16,
  },
  noticeCard: {
    backgroundColor: "#fff7ed",
    borderWidth: 1,
    borderColor: "#fdba74",
    borderRadius: 16,
    padding: 16,
  },
  noticeTitle: {
    color: "#9a3412",
    fontWeight: "700",
    marginBottom: 6,
  },
  noticeText: {
    color: "#b45309",
    marginBottom: 12,
    textTransform: "capitalize",
  },
  noticeButton: {
    backgroundColor: "#ea580c",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  noticeButtonText: {
    color: "#ffffff",
    fontWeight: "700",
  },
  secondaryButton: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  secondaryButtonText: {
    color: "#334155",
    fontWeight: "600",
  },
  logoutBtn: {
    alignItems: "center",
    paddingVertical: 12,
    marginBottom: 24,
  },
  logoutText: {
    color: "#dc2626",
    fontWeight: "700",
  },
});
