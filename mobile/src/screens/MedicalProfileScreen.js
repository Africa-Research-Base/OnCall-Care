import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Switch,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";

export default function MedicalProfileScreen({ navigation }) {
  const [hasAsthma, setHasAsthma] = useState(false);
  const [hasDiabetes, setHasDiabetes] = useState(false);
  const [allergies, setAllergies] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");

  const saveProfile = () => {
    // In real app, save to AsyncStorage or Backend
    Alert.alert("Success", "Medical Profile Updated");
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Medical Profile</Text>
      <Text style={styles.subtitle}>
        Information here will be shared with nurses during emergencies.
      </Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Chronic Conditions</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Asthma</Text>
          <Switch value={hasAsthma} onValueChange={setHasAsthma} />
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <Text style={styles.label}>Diabetes</Text>
          <Switch value={hasDiabetes} onValueChange={setHasDiabetes} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Other Details</Text>
        <Text style={styles.inputLabel}>Blood Group</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. O+"
          value={bloodGroup}
          onChangeText={setBloodGroup}
        />

        <Text style={styles.inputLabel}>Allergies</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="List any allergies..."
          value={allergies}
          onChangeText={setAllergies}
          multiline
        />
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={saveProfile}>
        <Text style={styles.saveText}>SAVE PROFILE</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f6fa", padding: 20 },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 5,
  },
  subtitle: { color: "#7f8c8d", marginBottom: 20 },
  section: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#2c3e50",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  label: { fontSize: 16 },
  divider: { height: 1, backgroundColor: "#f0f0f0" },
  inputLabel: { marginTop: 10, marginBottom: 5, color: "#666" },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: { height: 80, textAlignVertical: "top" },
  saveButton: {
    backgroundColor: "#34495e",
    padding: 18,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 30,
  },
  saveText: { color: "white", fontWeight: "bold", fontSize: 16 },
});
