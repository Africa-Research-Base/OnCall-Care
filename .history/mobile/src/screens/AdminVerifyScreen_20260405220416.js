import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../config/api";

export default function AdminVerifyScreen() {
  const [pending, setPending] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        return;
      }

      const [pendingRes, statsRes] = await Promise.all([
        fetch(`${API_URL}/admin/nurse-applications`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/admin/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const pendingData = await pendingRes.json();
      const statsData = await statsRes.json();

      if (!pendingRes.ok || !statsRes.ok) {
        Alert.alert("Admin Access", "This account is not authorized for admin APIs.");
        return;
      }

      setPending(Array.isArray(pendingData) ? pendingData : []);
      setStats(statsData?.stats || null);
    } catch (error) {
      Alert.alert("Network Error", error?.message || "Failed to load admin data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateApplication = async (userId, action) => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const response = await fetch(`${API_URL}/admin/users/${userId}/${action}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert("Action Failed", data.message || "Try again.");
        return;
      }

      Alert.alert("Success", data.message || "Updated successfully.");
      fetchData();
    } catch (error) {
      Alert.alert("Network Error", error?.message || "Request failed.");
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ef4444" />
        <Text style={styles.loadingText}>Loading admin console...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>OnCall Care Admin</Text>
      <Text style={styles.subtitle}>Nurse application review and role governance</Text>

      {stats && (
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Users</Text>
            <Text style={styles.statValue}>{stats.total_users}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Nurses</Text>
            <Text style={styles.statValue}>{stats.total_nurses}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Pending</Text>
            <Text style={styles.statValue}>{stats.pending_nurse_applications}</Text>
          </View>
        </View>
      )}

      <FlatList
        data={pending}
        keyExtractor={(item) => String(item.user_id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {
          setRefreshing(true);
          fetchData();
        }} />}
        ListEmptyComponent={<Text style={styles.empty}>No pending nurse applications.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.info}>
              <Text style={styles.name}>{item.user?.name || "Unknown User"}</Text>
              <Text style={styles.meta}>{item.user?.email}</Text>
              <Text style={styles.meta}>License: {item.license_number || "Not submitted"}</Text>
              <Text style={styles.meta}>Experience: {item.experience_years || 0} years</Text>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.actionBtn, styles.approveBtn]}
                onPress={() => updateApplication(item.user_id, "promote-nurse")}
              >
                <Text style={styles.actionText}>Approve</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, styles.rejectBtn]}
                onPress={() => updateApplication(item.user_id, "reject-nurse")}
              >
                <Text style={styles.actionText}>Reject</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0f172a",
  },
  subtitle: {
    marginTop: 4,
    marginBottom: 16,
    color: "#64748b",
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 12,
  },
  statLabel: {
    color: "#64748b",
    fontSize: 12,
  },
  statValue: {
    marginTop: 6,
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  info: {
    marginBottom: 10,
  },
  name: {
    fontWeight: "700",
    fontSize: 16,
    color: "#111827",
  },
  meta: {
    marginTop: 3,
    color: "#475569",
    fontSize: 13,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  approveBtn: {
    backgroundColor: "#16a34a",
  },
  rejectBtn: {
    backgroundColor: "#dc2626",
  },
  actionText: {
    color: "#ffffff",
    fontWeight: "700",
  },
  empty: {
    textAlign: "center",
    color: "#64748b",
    marginTop: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  loadingText: {
    marginTop: 12,
    color: "#64748b",
  },
});
