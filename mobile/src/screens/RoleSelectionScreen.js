import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";

const { width } = Dimensions.get("window");

export default function RoleSelectionScreen({ navigation }) {
  const selectRole = (role) => {
    navigation.navigate("Login", { role }); // Pass role to login/register flow
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to CareGrid</Text>
      <Text style={styles.subtitle}>Choose your account type</Text>

      <TouchableOpacity
        style={[styles.card, styles.patientCard]}
        onPress={() => selectRole("patient")}
      >
        <Text style={styles.cardTitle}>I need Care</Text>
        <Text style={styles.cardDesc}>For patients in emergency</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.card, styles.nurseCard]}
        onPress={() => selectRole("nurse")}
      >
        <Text style={styles.cardTitle}>I am a Nurse</Text>
        <Text style={styles.cardDesc}>For healthcare providers</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f5f6fa",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    color: "#2c3e50",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 40,
    color: "#7f8c8d",
  },
  card: {
    padding: 30,
    borderRadius: 15,
    marginBottom: 20,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  patientCard: {
    backgroundColor: "#fff",
    borderLeftWidth: 5,
    borderLeftColor: "#e74c3c",
  },
  nurseCard: {
    backgroundColor: "#fff",
    borderLeftWidth: 5,
    borderLeftColor: "#2ecc71",
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#333",
  },
  cardDesc: { fontSize: 14, color: "#666" },
});
