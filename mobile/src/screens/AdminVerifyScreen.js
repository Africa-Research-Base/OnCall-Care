import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";

const MOCK_NURSES = [
  {
    id: "1",
    name: "Nurse Sarah",
    license: "https://via.placeholder.com/150",
    status: "Pending",
  },
  {
    id: "2",
    name: "Nurse Mike",
    license: "https://via.placeholder.com/150",
    status: "Pending",
  },
];

export default function AdminVerifyScreen({ navigation }) {
  const [nurses, setNurses] = useState(MOCK_NURSES);

  const handleApprove = (id) => {
    Alert.alert("Approved", "Nurse is now verified and can go online.");
    setNurses(nurses.filter((n) => n.id !== id));
  };

  const handleReject = (id) => {
    Alert.alert("Rejected", "Nurse application declined.");
    setNurses(nurses.filter((n) => n.id !== id));
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.license }} style={styles.licenseImg} />
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.status}>Status: {item.status}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.approveBtn}
          onPress={() => handleApprove(item.id)}
        >
          <Text style={styles.btnText}>✓</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.rejectBtn}
          onPress={() => handleReject(item.id)}
        >
          <Text style={styles.btnText}>✗</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verification Queue</Text>
      <FlatList
        data={nurses}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.empty}>No pending verifications</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f5f6fa" },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#2c3e50",
  },
  card: {
    flexDirection: "row",
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: "center",
    elevation: 2,
  },
  licenseImg: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 15,
    backgroundColor: "#eee",
  },
  info: { flex: 1 },
  name: { fontSize: 18, fontWeight: "bold" },
  status: { color: "#e67e22" },
  actions: { flexDirection: "row", gap: 10 },
  approveBtn: {
    backgroundColor: "#2ecc71",
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  rejectBtn: {
    backgroundColor: "#e74c3c",
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: { color: "white", fontWeight: "bold", fontSize: 18 },
  empty: { textAlign: "center", marginTop: 50, color: "#999", fontSize: 16 },
});
