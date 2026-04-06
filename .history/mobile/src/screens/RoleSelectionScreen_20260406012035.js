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
  const selectRole = (roleIntent) => {
    navigation.navigate("Register", { roleIntent });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to OnCall Care</Text>
      <Text style={styles.subtitle}>Choose how you want to get started</Text>

      <TouchableOpacity
        style={[styles.card, styles.patientCard]}
        onPress={() => selectRole("patient")}
      >
        <Text style={styles.cardTitle}>I Need Urgent Care</Text>
        <Text style={styles.cardDesc}>
          Create a patient account to request help
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.card, styles.nurseCard]}
        onPress={() => selectRole("nurse")}
      >
        <Text style={styles.cardTitle}>I Want to Join as Nurse</Text>
        <Text style={styles.cardDesc}>
          Create account first, then submit nurse application
        </Text>
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
