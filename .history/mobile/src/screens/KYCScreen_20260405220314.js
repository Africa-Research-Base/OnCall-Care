import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../config/api";

const TRANSPORT_MODES = ["Car", "Motorcycle", "Bicycle", "Walk"];
const COMPETENCE_AREAS = [
  "Trauma",
  "Pediatrics",
  "Elderly Care",
  "Midwifery",
  "General",
];

export default function KYCScreen({ navigation }) {
  const [image, setImage] = useState(null);
  const [licenseNumber, setLicenseNumber] = useState("");
  const [transport, setTransport] = useState("");
  const [competences, setCompetences] = useState([]);
  const [experience, setExperience] = useState("");

  const handleUpload = () => {
    setImage("https://via.placeholder.com/300"); // Mock
    Alert.alert("Image Selected", "License image ready for upload.");
  };

  const toggleCompetence = (area) => {
    if (competences.includes(area)) {
      setCompetences(competences.filter((c) => c !== area));
    } else {
      setCompetences([...competences, area]);
    }
  };

  const submitKYC = async () => {
    if (!image || !licenseNumber || !transport || competences.length === 0 || !experience) {
      Alert.alert("Incomplete", "Please fill all fields and upload license.");
      return;
    }

    const payload = {
      license_number: licenseNumber,
      license_photo_url: image,
      transport_mode: transport,
      competence_areas: competences,
      experience_years: parseInt(experience),
    };

    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        Alert.alert("Session Expired", "Please sign in again.");
        navigation.replace("Login");
        return;
      }

      const response = await fetch(`${API_URL}/nurse/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert("Submission Failed", data.message || "Try again later.");
        return;
      }

      Alert.alert(
        "Application Submitted",
        "Your nurse application is now pending admin verification.",
      );
      navigation.replace("PatientHome");
    } catch (error) {
      Alert.alert("Network Error", error?.message || "Request failed");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Nurse Profile & KYC</Text>
      <Text style={styles.subtitle}>
        Complete your profile to receive relevant emergency requests.
      </Text>

      {/* Section 1: License */}
      <Text style={styles.sectionHeader}>1. Professional License</Text>
      <TouchableOpacity style={styles.uploadArea} onPress={handleUpload}>
        {image ? (
          <Image source={{ uri: image }} style={styles.preview} />
        ) : (
          <View style={{ alignItems: "center" }}>
            <Ionicons name="cloud-upload" size={40} color="#95a5a6" />
            <Text style={styles.uploadText}>Upload License Photo</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Section 2: Details */}
      <Text style={styles.sectionHeader}>2. License Number</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. RN-294830"
        value={licenseNumber}
        onChangeText={setLicenseNumber}
      />

      {/* Section 3: Details */}
      <Text style={styles.sectionHeader}>3. Experience (Years)</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        placeholder="e.g. 5"
        value={experience}
        onChangeText={setExperience}
      />

      {/* Section 4: Transport */}
      <Text style={styles.sectionHeader}>4. Mode of Transport</Text>
      <View style={styles.grid}>
        {TRANSPORT_MODES.map((mode) => (
          <TouchableOpacity
            key={mode}
            style={[styles.chip, transport === mode && styles.chipSelected]}
            onPress={() => setTransport(mode)}
          >
            <Text
              style={[
                styles.chipText,
                transport === mode && styles.chipTextSelected,
              ]}
            >
              {mode}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Section 5: Competence */}
      <Text style={styles.sectionHeader}>5. Areas of Competence</Text>
      <View style={styles.grid}>
        {COMPETENCE_AREAS.map((area) => (
          <TouchableOpacity
            key={area}
            style={[
              styles.chip,
              competences.includes(area) && styles.chipSelected,
            ]}
            onPress={() => toggleCompetence(area)}
          >
            <Text
              style={[
                styles.chipText,
                competences.includes(area) && styles.chipTextSelected,
              ]}
            >
              {area}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.btn, !image && styles.disabledBtn]}
        onPress={submitKYC}
      >
        <Text style={styles.btnText}>SUBMIT PROFILE</Text>
      </TouchableOpacity>

      <View style={{ height: 50 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 25, backgroundColor: "#fff" },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#2c3e50",
    textAlign: "center",
    marginBottom: 5,
  },
  subtitle: { textAlign: "center", color: "#7f8c8d", marginBottom: 30 },
  sectionHeader: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#34495e",
    marginBottom: 10,
    marginTop: 10,
  },

  uploadArea: {
    height: 150,
    borderWidth: 2,
    borderColor: "#bdc3c7",
    borderStyle: "dashed",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: "#f9f9f9",
  },
  preview: { width: "100%", height: "100%", borderRadius: 15 },
  uploadText: { marginTop: 10, color: "#95a5a6" },

  input: {
    backgroundColor: "#f0f3f6",
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    marginBottom: 20,
  },

  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 20 },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: "#ecf0f1",
  },
  chipSelected: { backgroundColor: "#3498db" },
  chipText: { color: "#7f8c8d" },
  chipTextSelected: { color: "white", fontWeight: "bold" },

  btn: {
    backgroundColor: "#2ecc71",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },
  disabledBtn: { backgroundColor: "#bdc3c7" },
  btnText: { color: "white", fontWeight: "bold", fontSize: 16 },
});
