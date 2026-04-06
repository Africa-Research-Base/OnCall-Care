import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COLORS, SIZES, SHADOWS } from "../theme";

const API_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://192.168.100.25:8000/api";

export default function EditProfileScreen({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Medical Info
  const [bloodGroup, setBloodGroup] = useState("");
  const [allergies, setAllergies] = useState("");
  const [conditions, setConditions] = useState("");

  useEffect(() => {
    const loadData = async () => {
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
          setName(data.name || "");
          setEmail(data.email || "");
          setPhone(data.phone || "");
          setBloodGroup(data.blood_group || "");
          setAllergies(data.allergies || "");
          setConditions(data.medical_conditions || "");
        }
      } catch (e) {
        console.error("Failed to load profile", e);
      }
    };
    loadData();
  }, []);

  const handleSave = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) return;

      const response = await fetch(`${API_URL}/user/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          phone,
          blood_group: bloodGroup,
          allergies,
          medical_conditions: conditions,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert(
          "Profile Updated",
          "Your personal and medical details have been saved.",
        );
        navigation.goBack();
      } else {
        Alert.alert("Update Failed", data.message || "Could not save profile");
      }
    } catch (e) {
      Alert.alert("Error", "Network request failed");
      console.error(e);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={styles.saveLink}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{name.charAt(0)}</Text>
            <TouchableOpacity style={styles.cameraBtn}>
              <Ionicons name="camera" size={16} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Personal Details */}
        <Text style={styles.sectionHeader}>Personal Information</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter full name"
            placeholderTextColor={COLORS.mediumGray}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            placeholder="Enter email"
            placeholderTextColor={COLORS.mediumGray}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="Enter phone number"
            placeholderTextColor={COLORS.mediumGray}
          />
        </View>

        {/* Medical Details */}
        <Text style={[styles.sectionHeader, { marginTop: 20 }]}>
          Medical Details (For Emergencies)
        </Text>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 0.45 }]}>
            <Text style={styles.label}>Blood Group</Text>
            <TextInput
              style={styles.input}
              value={bloodGroup}
              onChangeText={setBloodGroup}
              placeholder="O+"
              placeholderTextColor={COLORS.mediumGray}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Allergies</Text>
          <TextInput
            style={styles.input}
            value={allergies}
            onChangeText={setAllergies}
            placeholder="Peanuts, Penicillin..."
            placeholderTextColor={COLORS.mediumGray}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Chronic Conditions</Text>
          <TextInput
            style={styles.input}
            value={conditions}
            onChangeText={setConditions}
            placeholder="Asthma, Diabetes..."
            placeholderTextColor={COLORS.mediumGray}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
  },
  saveLink: {
    color: COLORS.primary,
    fontWeight: "bold",
    fontSize: 16,
  },
  scrollContent: {
    padding: SIZES.padding,
  },
  avatarSection: {
    alignItems: "center",
    paddingVertical: 20,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.gray,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  avatarText: {
    fontSize: 40,
    fontWeight: "bold",
    color: COLORS.darkGray,
  },
  cameraBtn: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.mediumGray,
    marginBottom: 15,
    marginTop: 10,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 8,
    fontWeight: "600",
  },
  input: {
    backgroundColor: COLORS.gray,
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: COLORS.black,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
