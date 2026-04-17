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
  Modal,
  TextInput,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../config/api";

export default function AdminVerifyScreen() {
  const [pending, setPending] = useState([]);
  const [nurses, setNurses] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("applications");
  const [selectedNurse, setSelectedNurse] = useState(null);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [transportMode, setTransportMode] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [verificationLevel, setVerificationLevel] = useState("1");

  const [actionReason, setActionReason] = useState("");
  const [suspendUntil, setSuspendUntil] = useState("");

  const [redPoints, setRedPoints] = useState("1200");
  const [amberPoints, setAmberPoints] = useState("800");
  const [greenPoints, setGreenPoints] = useState("500");
  const [pointsPerToken, setPointsPerToken] = useState("100");
  const [tokenSymbol, setTokenSymbol] = useState("ONC");

  const getAuthHeaders = async (json = false) => {
    const token = await AsyncStorage.getItem("userToken");
    if (!token) {
      throw new Error("Missing auth token. Please sign in again.");
    }

    return {
      ...(json ? { "Content-Type": "application/json" } : {}),
      Authorization: `Bearer ${token}`,
    };
  };

  const mapNurseForm = (user) => {
    setName(user?.name || "");
    setEmail(user?.email || "");
    setPhone(user?.phone || "");
    setLicenseNumber(user?.nurse_profile?.license_number || "");
    setTransportMode(user?.nurse_profile?.transport_mode || "");
    setExperienceYears(String(user?.nurse_profile?.experience_years ?? ""));
    setVerificationLevel(String(user?.nurse_profile?.verification_level ?? 1));
    setActionReason("");
    setSuspendUntil("");
  };

  const toUserRow = (input) => {
    if (input?.user) {
      return {
        ...input.user,
        nurse_profile: {
          ...(input.user.nurse_profile || input.user.nurseProfile || {}),
          ...(input || {}),
        },
      };
    }

    return {
      ...input,
      nurse_profile: input?.nurse_profile || input?.nurseProfile || null,
    };
  };

  const fetchNurses = useCallback(async () => {
    const headers = await getAuthHeaders();
    const nursesRes = await fetch(`${API_URL}/admin/nurses`, { headers });
    const nursesData = await nursesRes.json();

    if (!nursesRes.ok) {
      throw new Error(nursesData?.message || "Failed to load nurses.");
    }

    setNurses(
      Array.isArray(nursesData?.data) ? nursesData.data.map(toUserRow) : [],
    );
  }, []);

  const applyRewardSettings = (settings) => {
    const rates = settings?.points_by_severity || {};

    setRedPoints(String(rates?.RED ?? 1200));
    setAmberPoints(String(rates?.AMBER ?? 800));
    setGreenPoints(String(rates?.GREEN ?? 500));
    setPointsPerToken(String(settings?.points_per_token ?? 100));
    setTokenSymbol(String(settings?.token_symbol ?? "ONC"));
  };

  const fetchData = useCallback(async () => {
    try {
      const headers = await getAuthHeaders();

      const [pendingRes, statsRes, rewardsRes] = await Promise.all([
        fetch(`${API_URL}/admin/nurse-applications`, {
          headers,
        }),
        fetch(`${API_URL}/admin/dashboard`, {
          headers,
        }),
        fetch(`${API_URL}/admin/rewards/settings`, {
          headers,
        }),
      ]);

      const pendingData = await pendingRes.json();
      const statsData = await statsRes.json();
      const rewardsData = await rewardsRes.json();

      if (!pendingRes.ok || !statsRes.ok || !rewardsRes.ok) {
        Alert.alert(
          "Admin Access",
          "This account is not authorized for admin APIs.",
        );
        return;
      }

      setPending(Array.isArray(pendingData) ? pendingData : []);
      setStats(statsData?.stats || null);
      applyRewardSettings(rewardsData?.settings || null);
      await fetchNurses();
    } catch (error) {
      Alert.alert(
        "Network Error",
        error?.message || "Failed to load admin data.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [fetchNurses]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateApplication = async (userId, action) => {
    try {
      const headers = await getAuthHeaders(true);
      const response = await fetch(
        `${API_URL}/admin/users/${userId}/${action}`,
        {
          method: "POST",
          headers,
        },
      );

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

  const saveRewardSettings = async () => {
    try {
      setSaving(true);
      const headers = await getAuthHeaders(true);
      const payload = {
        points_by_severity: {
          RED: Number(redPoints || 0),
          AMBER: Number(amberPoints || 0),
          GREEN: Number(greenPoints || 0),
        },
        points_per_token: Number(pointsPerToken || 0),
        token_symbol: tokenSymbol.trim().toUpperCase(),
      };

      const response = await fetch(`${API_URL}/admin/rewards/settings`, {
        method: "PUT",
        headers,
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert("Save Failed", data?.message || "Could not save settings.");
        return;
      }

      applyRewardSettings(data?.settings || null);
      Alert.alert("Saved", data?.message || "Reward settings updated.");
    } catch (error) {
      Alert.alert("Network Error", error?.message || "Request failed.");
    } finally {
      setSaving(false);
    }
  };

  const openDetails = async (nurse) => {
    try {
      setSaving(true);
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_URL}/admin/nurses/${nurse.id}`, {
        headers,
      });
      const data = await response.json();

      if (!response.ok) {
        Alert.alert(
          "Load Failed",
          data?.message || "Could not load nurse details.",
        );
        return;
      }

      const row = toUserRow(data?.nurse || nurse);
      setSelectedNurse(row);
      mapNurseForm(row);
      setDetailsVisible(true);
    } catch (error) {
      Alert.alert("Network Error", error?.message || "Failed to load details.");
    } finally {
      setSaving(false);
    }
  };

  const saveNurseEdits = async () => {
    if (!selectedNurse) {
      return;
    }

    try {
      setSaving(true);
      const headers = await getAuthHeaders(true);
      const payload = {
        name,
        email,
        phone,
        license_number: licenseNumber || null,
        transport_mode: transportMode || null,
        experience_years:
          experienceYears === "" ? null : Number(experienceYears),
        verification_level: Number(verificationLevel || 1),
      };

      const response = await fetch(
        `${API_URL}/admin/nurses/${selectedNurse.id}`,
        {
          method: "PUT",
          headers,
          body: JSON.stringify(payload),
        },
      );

      const data = await response.json();
      if (!response.ok) {
        Alert.alert(
          "Update Failed",
          data?.message || "Could not update nurse.",
        );
        return;
      }

      Alert.alert("Saved", data?.message || "Nurse details updated.");
      await fetchNurses();
      setDetailsVisible(false);
    } catch (error) {
      Alert.alert("Network Error", error?.message || "Failed to update nurse.");
    } finally {
      setSaving(false);
    }
  };

  const runNurseAction = async (path, body = null) => {
    if (!selectedNurse) {
      return;
    }

    try {
      setSaving(true);
      const headers = await getAuthHeaders(true);
      const response = await fetch(
        `${API_URL}/admin/nurses/${selectedNurse.id}/${path}`,
        {
          method: "POST",
          headers,
          ...(body ? { body: JSON.stringify(body) } : {}),
        },
      );

      const data = await response.json();
      if (!response.ok) {
        Alert.alert("Action Failed", data?.message || "Request failed.");
        return;
      }

      Alert.alert("Success", data?.message || "Action completed.");
      await fetchData();
      setDetailsVisible(false);
    } catch (error) {
      Alert.alert("Network Error", error?.message || "Request failed.");
    } finally {
      setSaving(false);
    }
  };

  const deleteNurse = async () => {
    if (!selectedNurse) {
      return;
    }

    try {
      setSaving(true);
      const headers = await getAuthHeaders();
      const response = await fetch(
        `${API_URL}/admin/nurses/${selectedNurse.id}`,
        {
          method: "DELETE",
          headers,
        },
      );

      const data = await response.json();
      if (!response.ok) {
        Alert.alert(
          "Delete Failed",
          data?.message || "Could not delete nurse.",
        );
        return;
      }

      Alert.alert("Deleted", data?.message || "Nurse deleted.");
      await fetchData();
      setDetailsVisible(false);
    } catch (error) {
      Alert.alert("Network Error", error?.message || "Failed to delete nurse.");
    } finally {
      setSaving(false);
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
      <Text style={styles.subtitle}>
        Nurse application review and role governance
      </Text>

      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "applications" && styles.tabButtonActive,
          ]}
          onPress={() => setActiveTab("applications")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "applications" && styles.tabTextActive,
            ]}
          >
            Applications
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "nurses" && styles.tabButtonActive,
          ]}
          onPress={() => setActiveTab("nurses")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "nurses" && styles.tabTextActive,
            ]}
          >
            Nurses
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "rewards" && styles.tabButtonActive,
          ]}
          onPress={() => setActiveTab("rewards")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "rewards" && styles.tabTextActive,
            ]}
          >
            Rewards
          </Text>
        </TouchableOpacity>
      </View>

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
            <Text style={styles.statValue}>
              {stats.pending_nurse_applications}
            </Text>
          </View>
        </View>
      )}

      {activeTab === "rewards" ? (
        <ScrollView
          style={styles.rewardPanel}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchData();
              }}
            />
          }
        >
          <View style={styles.rewardCard}>
            <Text style={styles.rewardTitle}>Points By Severity</Text>
            <TextInput
              style={styles.input}
              placeholder="RED severity points"
              keyboardType="number-pad"
              value={redPoints}
              onChangeText={setRedPoints}
            />
            <TextInput
              style={styles.input}
              placeholder="AMBER severity points"
              keyboardType="number-pad"
              value={amberPoints}
              onChangeText={setAmberPoints}
            />
            <TextInput
              style={styles.input}
              placeholder="GREEN severity points"
              keyboardType="number-pad"
              value={greenPoints}
              onChangeText={setGreenPoints}
            />

            <Text style={styles.rewardTitle}>Token Conversion</Text>
            <TextInput
              style={styles.input}
              placeholder="Points per token"
              keyboardType="number-pad"
              value={pointsPerToken}
              onChangeText={setPointsPerToken}
            />
            <TextInput
              style={styles.input}
              placeholder="Token symbol"
              autoCapitalize="characters"
              value={tokenSymbol}
              onChangeText={setTokenSymbol}
            />

            <Text style={styles.rewardHint}>
              Withdrawal estimate uses: points / points-per-token.
            </Text>

            <TouchableOpacity
              style={[styles.actionBtn, styles.verifyBtn, { marginTop: 8 }]}
              onPress={saveRewardSettings}
              disabled={saving}
            >
              <Text style={styles.actionText}>
                {saving ? "Saving..." : "Save Reward Settings"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : activeTab === "applications" ? (
        <FlatList
          data={pending}
          keyExtractor={(item) => `pending-${item.user_id}`}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchData();
              }}
            />
          }
          ListEmptyComponent={
            <Text style={styles.empty}>No pending nurse applications.</Text>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.info}>
                <Text style={styles.name}>
                  {item.user?.name || "Unknown User"}
                </Text>
                <Text style={styles.meta}>{item.user?.email}</Text>
                <Text style={styles.meta}>
                  License: {item.license_number || "Not submitted"}
                </Text>
                <Text style={styles.meta}>
                  Experience: {item.experience_years || 0} years
                </Text>
              </View>

              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.approveBtn]}
                  onPress={() =>
                    updateApplication(item.user_id, "promote-nurse")
                  }
                >
                  <Text style={styles.actionText}>Approve</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.rejectBtn]}
                  onPress={() =>
                    updateApplication(item.user_id, "reject-nurse")
                  }
                >
                  <Text style={styles.actionText}>Reject</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      ) : (
        <FlatList
          data={nurses}
          keyExtractor={(item) => `nurse-${item.id}`}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchData();
              }}
            />
          }
          ListEmptyComponent={
            <Text style={styles.empty}>No nurses found.</Text>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.info}>
                <Text style={styles.name}>{item?.name || "Unknown Nurse"}</Text>
                <Text style={styles.meta}>{item?.email}</Text>
                <Text style={styles.meta}>
                  Status: {item?.nurse_profile?.account_status || "active"}
                </Text>
                <Text style={styles.meta}>
                  Verified: {item?.nurse_profile?.is_verified ? "Yes" : "No"}
                </Text>
              </View>

              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.neutralBtn]}
                  onPress={() => openDetails(item)}
                  disabled={saving}
                >
                  <Text style={styles.actionText}>Manage</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      <Modal visible={detailsVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nurse Details</Text>
            <ScrollView>
              <TextInput
                style={styles.input}
                placeholder="Name"
                value={name}
                onChangeText={setName}
              />
              <TextInput
                style={styles.input}
                placeholder="Email"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
              <TextInput
                style={styles.input}
                placeholder="Phone"
                value={phone}
                onChangeText={setPhone}
              />
              <TextInput
                style={styles.input}
                placeholder="License Number"
                value={licenseNumber}
                onChangeText={setLicenseNumber}
              />
              <TextInput
                style={styles.input}
                placeholder="Transport Mode (Car, Motorcycle, Bicycle, Walk)"
                value={transportMode}
                onChangeText={setTransportMode}
              />
              <TextInput
                style={styles.input}
                placeholder="Experience Years"
                keyboardType="number-pad"
                value={experienceYears}
                onChangeText={setExperienceYears}
              />
              <TextInput
                style={styles.input}
                placeholder="Verification Level (1-3)"
                keyboardType="number-pad"
                value={verificationLevel}
                onChangeText={setVerificationLevel}
              />

              <TextInput
                style={styles.input}
                placeholder="Action reason (optional)"
                value={actionReason}
                onChangeText={setActionReason}
              />
              <TextInput
                style={styles.input}
                placeholder="Suspend until ISO date (optional)"
                value={suspendUntil}
                onChangeText={setSuspendUntil}
              />

              <View style={styles.modalActionsGrid}>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.approveBtn]}
                  onPress={saveNurseEdits}
                >
                  <Text style={styles.actionText}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.verifyBtn]}
                  onPress={() => runNurseAction("verify")}
                >
                  <Text style={styles.actionText}>Verify</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.suspendBtn]}
                  onPress={() =>
                    runNurseAction("suspend", {
                      reason: actionReason || undefined,
                      until: suspendUntil || undefined,
                    })
                  }
                >
                  <Text style={styles.actionText}>Suspend</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.banBtn]}
                  onPress={() =>
                    runNurseAction("ban", { reason: actionReason || undefined })
                  }
                >
                  <Text style={styles.actionText}>Ban</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.activateBtn]}
                  onPress={() => runNurseAction("activate")}
                >
                  <Text style={styles.actionText}>Activate</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.rejectBtn]}
                  onPress={() =>
                    Alert.alert(
                      "Delete Nurse",
                      "This will permanently delete the nurse account.",
                      [
                        { text: "Cancel", style: "cancel" },
                        {
                          text: "Delete",
                          style: "destructive",
                          onPress: deleteNurse,
                        },
                      ],
                    )
                  }
                >
                  <Text style={styles.actionText}>Delete</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.actionBtn, styles.closeBtn, { marginTop: 10 }]}
                onPress={() => setDetailsVisible(false)}
              >
                <Text style={styles.actionText}>Close</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    marginBottom: 10,
    color: "#64748b",
  },
  tabRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },
  tabButton: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  tabButtonActive: {
    backgroundColor: "#111827",
    borderColor: "#111827",
  },
  tabText: {
    color: "#1f2937",
    fontWeight: "700",
  },
  tabTextActive: {
    color: "#ffffff",
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
  verifyBtn: {
    backgroundColor: "#0284c7",
  },
  suspendBtn: {
    backgroundColor: "#d97706",
  },
  banBtn: {
    backgroundColor: "#7f1d1d",
  },
  activateBtn: {
    backgroundColor: "#0891b2",
  },
  neutralBtn: {
    backgroundColor: "#334155",
  },
  rejectBtn: {
    backgroundColor: "#dc2626",
  },
  closeBtn: {
    backgroundColor: "#475569",
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.45)",
    justifyContent: "flex-end",
  },
  modalContent: {
    maxHeight: "90%",
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    color: "#0f172a",
    backgroundColor: "#ffffff",
  },
  modalActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  rewardPanel: {
    flex: 1,
  },
  rewardCard: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 16,
  },
  rewardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 8,
    marginTop: 4,
  },
  rewardHint: {
    color: "#64748b",
    fontSize: 12,
    marginTop: 2,
  },
});
