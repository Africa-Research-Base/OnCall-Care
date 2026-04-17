import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../config/api";

export default function WalletSetupScreen({ navigation, route }) {
  const [walletAddress, setWalletAddress] = useState(
    route?.params?.currentWallet || "",
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveWallet = async () => {
    const trimmedAddress = walletAddress.trim();

    if (!trimmedAddress) {
      Alert.alert("Wallet required", "Enter your SPL wallet address.");
      return;
    }

    setIsSaving(true);

    try {
      const token = await AsyncStorage.getItem("userToken");

      const response = await fetch(`${API_URL}/nurse/wallet/connect`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ spl_wallet_address: trimmedAddress }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert("Unable to save", data?.message || "Please try again.");
        return;
      }

      Alert.alert(
        "Wallet connected",
        "Your SPL wallet was linked successfully.",
      );
      navigation.navigate("NurseDashboard", { refreshRewards: true });
    } catch (error) {
      Alert.alert("Network error", error?.message || "Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Connect SPL Wallet</Text>
      <Text style={styles.subtitle}>
        Rewards are currently tracked as points. Once token launch is enabled,
        you can withdraw points to this connected Solana wallet.
      </Text>

      <View style={styles.card}>
        <Text style={styles.label}>SPL Wallet Address</Text>
        <TextInput
          style={styles.input}
          autoCapitalize="none"
          autoCorrect={false}
          value={walletAddress}
          onChangeText={setWalletAddress}
          placeholder="Enter base58 wallet address"
        />
      </View>

      <TouchableOpacity
        style={[styles.primaryButton, isSaving && styles.disabledButton]}
        disabled={isSaving}
        onPress={handleSaveWallet}
      >
        <Text style={styles.primaryButtonText}>
          {isSaving ? "Saving..." : "Save Wallet"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fb",
  },
  content: {
    padding: 20,
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0f172a",
  },
  subtitle: {
    color: "#475569",
    lineHeight: 20,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
  },
  label: {
    color: "#334155",
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#0f172a",
    backgroundColor: "#ffffff",
  },
  primaryButton: {
    backgroundColor: "#0ea5e9",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  disabledButton: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontWeight: "700",
  },
});
