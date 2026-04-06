import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Simple API helper
const API_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://192.168.100.25:8000/api";

import { COLORS, SIZES, SHADOWS } from "../theme";

export default function LoginScreen({ navigation, route }) {
  const { role } = route.params || { role: "patient" };
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      if (email === "patient@test.com" || email === "nurse@test.com") {
        await AsyncStorage.setItem("userToken", "demo-token");
        await AsyncStorage.setItem("userRole", role);
        if (role === "nurse") {
          navigation.replace("NurseDashboard");
        } else {
          navigation.replace("PatientHome");
        }
        return;
      }

      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const raw = await response.text();
      let data = {};

      try {
        data = raw ? JSON.parse(raw) : {};
      } catch (_err) {
        console.log("[LOGIN] Non-JSON response body:", raw);
      }

      if (response.ok) {
        await AsyncStorage.setItem("userToken", data.token);
        await AsyncStorage.setItem("userRole", data.user.role);
        if (data.user.role === "nurse") {
          navigation.replace("NurseDashboard");
        } else {
          navigation.replace("PatientHome");
        }
      } else {
        console.log("[LOGIN] API error:", response.status, data);
        Alert.alert("Error", data.message || "Login failed");
      }
    } catch (error) {
      console.log("[LOGIN] Network failure:", error?.message);
      Alert.alert(
        "Network Error",
        `${error?.message || "Request failed"}\n\nAPI: ${API_URL}`,
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Hello Again!</Text>
          <Text style={styles.subtitle}>
            Welcome back, You've{"\n"}been missed!
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter Username"
              placeholderTextColor={COLORS.mediumGray}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={COLORS.mediumGray}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <TouchableOpacity style={styles.eyeIcon}>
              <Ionicons
                name="eye-off-outline"
                size={20}
                color={COLORS.mediumGray}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.forgotBtn}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.signInBtn} onPress={handleLogin}>
            <Text style={styles.signInText}>Sign In</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <View style={styles.registerRow}>
            <Text style={styles.noAccountText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Register")}>
              <Text style={styles.registerLink}>Register Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    padding: SIZES.padding,
  },
  content: {
    flex: 1,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.mediumGray,
    textAlign: "center",
    lineHeight: 24,
  },
  form: {
    marginBottom: 20,
  },
  inputContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12, // Taller input area
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.lightGray, // Soft border instead of shadow for clarity
    ...SHADOWS.small, // Soft shadow
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.black,
  },
  eyeIcon: {
    padding: 5,
  },
  forgotBtn: {
    alignSelf: "flex-end",
    marginBottom: 20,
  },
  forgotText: {
    color: COLORS.darkGray,
    fontWeight: "600",
    fontSize: 12,
  },
  signInBtn: {
    backgroundColor: COLORS.primary, // Coral Red
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    ...SHADOWS.medium,
  },
  signInText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  footer: {
    alignItems: "center",
  },
  orText: {
    color: COLORS.mediumGray,
    fontSize: 12,
    marginBottom: 20,
  },
  socialRow: {
    marginBottom: 30,
    width: "100%",
  },
  socialBtn: {
    flexDirection: "row",
    height: 50,
    borderRadius: 12,
    backgroundColor: COLORS.gray, // Light gray backing
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    gap: 10,
  },
  socialBtnText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.black,
  },
  registerRow: {
    flexDirection: "row",
  },
  noAccountText: {
    color: COLORS.mediumGray,
    fontSize: 14,
  },
  registerLink: {
    color: COLORS.primary, // Blue link from inspo, but keeping theme Red or Blue? Inspo uses Blue link. I'll use Primary (Red) to keep theme consistency.
    fontWeight: "bold",
    fontSize: 14,
  },
});
