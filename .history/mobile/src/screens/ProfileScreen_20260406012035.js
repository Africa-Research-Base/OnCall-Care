import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COLORS, SIZES, SHADOWS, FONTS } from "../theme";
import { API_URL } from "../config/api";

const PROFILE_OPTIONS = [
  {
    id: 1,
    label: "My Profile",
    icon: "person-outline",
    route: "EditProfile",
  },
  {
    id: 2,
    label: "Manage Address",
    icon: "location-outline",
    route: "SavedAddresses",
  },
  { id: 3, label: "Notification", icon: "notifications-outline", route: null },
  { id: 4, label: "Payment Methods", icon: "card-outline", route: null },
  { id: 5, label: "Settings", icon: "settings-outline", route: null },
  { id: 6, label: "Help Center", icon: "help-circle-outline", route: null },
];

export default function ProfileScreen({ navigation }) {
  const [userName, setUserName] = useState("Loading...");
  const [role, setRole] = useState("User");

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        if (!token) return;

        const response = await fetch(`${API_URL}/user`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUserName(data.name);
          setRole(data.role === "nurse" ? "Healthcare Provider" : "Patient");
        } else {
          // Fallback if token expired or error
          const r = await AsyncStorage.getItem("userRole");
          setRole(r === "nurse" ? "Nurse" : "Patient");
          setUserName("User");
        }
      } catch (e) {
        console.error("Failed to load profile", e);
      }
    };
    loadUser();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem("userToken");
    navigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
  };

  const handleOptionPress = (option) => {
    if (option.route) {
      navigation.navigate(option.route);
    } else {
      Alert.alert("Coming Soon", `${option.label} is under construction.`);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{userName.charAt(0)}</Text>
            <View style={styles.editBadge}>
              <Ionicons name="pencil" size={12} color={COLORS.white} />
            </View>
          </View>
          <Text style={styles.userName}>{userName}</Text>
          <Text style={styles.userRole}>{role}</Text>
        </View>

        {/* Options List */}
        <View style={styles.optionsContainer}>
          {PROFILE_OPTIONS.map((option, index) => (
            <TouchableOpacity
              key={option.id}
              style={styles.optionItem}
              onPress={() => handleOptionPress(option)}
            >
              <View style={styles.optionLeft}>
                <View style={styles.iconBox}>
                  <Ionicons
                    name={option.icon}
                    size={20}
                    color={COLORS.primary}
                  />
                </View>
                <Text style={styles.optionLabel}>{option.label}</Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={COLORS.mediumGray}
              />
            </TouchableOpacity>
          ))}

          {/* Logout */}
          <TouchableOpacity
            style={[styles.optionItem, { marginTop: 20 }]}
            onPress={handleLogout}
          >
            <View style={styles.optionLeft}>
              <View style={[styles.iconBox, { backgroundColor: "#FFEBEE" }]}>
                <Ionicons
                  name="log-out-outline"
                  size={20}
                  color={COLORS.primary}
                />
              </View>
              <Text style={[styles.optionLabel, { color: COLORS.primary }]}>
                Log Out
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SIZES.padding,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
  },
  scrollContent: {
    paddingHorizontal: SIZES.padding,
    paddingBottom: 40,
  },
  profileCard: {
    alignItems: "center",
    marginBottom: 30,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.gray,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    position: "relative",
  },
  avatarText: {
    fontSize: 40,
    fontWeight: "bold",
    color: COLORS.darkGray,
  },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  userName: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 5,
  },
  userRole: {
    fontSize: 14,
    color: COLORS.mediumGray,
  },
  optionsContainer: {
    marginTop: 10,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "rgba(255, 77, 77, 0.1)", // Light primary
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  optionLabel: {
    fontSize: 16,
    color: COLORS.black,
    fontWeight: "500",
  },
});
