import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Switch,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COLORS, SIZES, SHADOWS } from "../theme";

// Simple API helper
const API_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://192.168.100.25:8000/api";

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isNurse, setIsNurse] = useState(false);
  const [license, setLicense] = useState("");

  const handleRegister = async () => {
    try {
      const role = isNurse ? "nurse" : "patient";

      // Simulation for demo
      if (email.includes("test")) {
        await AsyncStorage.setItem("userToken", "demo-token");
        await AsyncStorage.setItem("userRole", role);
        Alert.alert("Success", "Account created! Logging in...");

        if (role === "nurse") {
          navigation.replace("NurseDashboard");
        } else {
          navigation.replace("PatientHome");
        }
        return;
      }

      const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
          license_number: isNurse ? license : null,
        }),
      });
      const raw = await response.text();
      let data = {};

      try {
        data = raw ? JSON.parse(raw) : {};
      } catch (_err) {
        console.log("[REGISTER] Non-JSON response body:", raw);
      }

      if (response.ok) {
        // Auto-login after register
        await AsyncStorage.setItem("userToken", data.token);
        await AsyncStorage.setItem("userRole", data.user.role);

        Alert.alert("Success", "Account created! Logging in...");
        if (data.user.role === "nurse") {
          navigation.replace("NurseDashboard");
        } else {
          navigation.replace("PatientHome");
        }
      } else {
        console.log("[REGISTER] API error:", response.status, data);
        Alert.alert("Error", data.message || "Registration failed");
      }
    } catch (error) {
      console.log("[REGISTER] Network failure:", error?.message);
      Alert.alert(
        "Network Error",
        `${error?.message || "Request failed"}\n\nAPI: ${API_URL}`,
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.black} />
        </TouchableOpacity>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>
          Fill your information below to register.
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.form}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            placeholderTextColor={COLORS.mediumGray}
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email"
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
        </View>

        {/* Nurse Toggle */}
        <View style={styles.toggleRow}>
          <Text style={styles.toggleText}>Register as Healthcare Provider</Text>
          <Switch
            value={isNurse}
            onValueChange={setIsNurse}
            trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
            thumbColor={COLORS.white}
          />
        </View>

        {isNurse && (
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="License Number"
              placeholderTextColor={COLORS.mediumGray}
              value={license}
              onChangeText={setLicense}
            />
          </View>
        )}

        <TouchableOpacity style={styles.registerBtn} onPress={handleRegister}>
          <Text style={styles.registerBtnText}>Sign Up</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <View style={styles.loginRow}>
            <Text style={styles.hasAccountText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: SIZES.padding,
  },
  header: {
    marginTop: 40,
    marginBottom: 30,
    alignItems: "center",
  },
  backBtn: {
    position: "absolute",
    left: 0,
    top: 0,
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
    paddingBottom: 20,
  },
  inputContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    ...SHADOWS.small,
  },
  input: {
    fontSize: 16,
    color: COLORS.black,
  },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  toggleText: {
    color: COLORS.darkGray,
    fontSize: 14,
    fontWeight: "600",
  },
  registerBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: "center",
    ...SHADOWS.medium,
    marginBottom: 30,
  },
  registerBtnText: {
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
    backgroundColor: COLORS.gray,
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
  loginRow: {
    flexDirection: "row",
  },
  hasAccountText: {
    color: COLORS.mediumGray,
    fontSize: 14,
  },
  loginLink: {
    color: COLORS.primary,
    fontWeight: "bold",
    fontSize: 14,
  },
});
