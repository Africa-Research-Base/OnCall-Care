import React, { useEffect } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SplashScreen({ navigation }) {
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        const role = await AsyncStorage.getItem("userRole");

        // Simulate network delay for splash effect
        await new Promise((resolve) => setTimeout(resolve, 2000));

        if (token) {
          if (role === "nurse") {
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
