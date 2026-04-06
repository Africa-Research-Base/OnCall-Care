import React, { useEffect } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../config/api";

export default function SplashScreen({ navigation }) {
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        const cachedRole = await AsyncStorage.getItem("userRole");

        // Simulate network delay for splash effect
        await new Promise((resolve) => setTimeout(resolve, 900));

        if (token) {
          try {
            const response = await fetch(`${API_URL}/user`, {
              headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
              const user = await response.json();
              const profile = user?.nurse_profile;

              const isApprovedAndActiveNurse =
                (user?.role === "nurse" || profile?.is_verified) &&
                profile?.account_status !== "banned" &&
                profile?.account_status !== "suspended";

              if (user?.role === "admin") {
                await AsyncStorage.setItem("userRole", "admin");
                navigation.replace("AdminVerify");
                return;
              }

              if (isApprovedAndActiveNurse) {
                const wasNotNurse = cachedRole !== "nurse";
                await AsyncStorage.setItem("userRole", "nurse");
                navigation.replace("NurseDashboard", {
                  showApprovalNotice: wasNotNurse,
                });
                return;
              }

              await AsyncStorage.setItem("userRole", user?.role || "patient");
              navigation.replace("PatientHome");
              return;
            }
          } catch (_err) {
            // Fallback to cached role when network is unavailable.
          }

          if (cachedRole === "admin") {
            navigation.replace("AdminVerify");
          } else if (cachedRole === "nurse") {
            navigation.replace("NurseDashboard");
          } else {
            navigation.replace("PatientHome");
          }
        } else {
          navigation.replace("RoleSelection");
        }
      } catch (e) {
        // Fallback to onboarding
        navigation.replace("RoleSelection");
      }
    };

    checkAuth();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>OnCall Care</Text>
      <Text style={styles.tagline}>Emergency Care in Minutes</Text>
      <ActivityIndicator
        size="large"
        color="#e74c3c"
        style={{ marginTop: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  logo: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#e74c3c",
    marginBottom: 10,
  },
  tagline: { fontSize: 18, color: "#666" },
});
