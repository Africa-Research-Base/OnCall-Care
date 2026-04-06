import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COLORS, SIZES, SHADOWS } from "../theme";

import * as Location from "expo-location";
import { API_URL } from "../config/api";

export default function SavedAddressesScreen({ navigation }) {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [label, setLabel] = useState("");
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [locating, setLocating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      // Don't show full screen loader if just refreshing
      if (!refreshing) setLoading(true);

      const token = await AsyncStorage.getItem("userToken");
      if (!token) return;

      const response = await fetch(`${API_URL}/addresses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setAddresses(data);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAddresses();
  }, []);

  const resetForm = () => {
    setLabel("");
    setAddress("");
    setLat(null);
    setLng(null);
    setEditingId(null);
  };

  const getCurrentLocation = async () => {
    setLocating(true);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert("Permission Denied", "Location permission is required to use current location.");
        return;
      }

      const current = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = current.coords;

      setLat(latitude);
      setLng(longitude);

      const reverse = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (reverse.length > 0) {
        const place = reverse[0];
        const full = [
          place.name,
          place.street,
          place.city,
          place.region,
          place.postalCode,
          place.country,
        ]
          .filter(Boolean)
          .join(", ");

        if (full) {
          setAddress(full);
        }
      }
    } catch (error) {
      Alert.alert("Location Error", "Unable to fetch current location.");
      console.log(error);
    } finally {
      setLocating(false);
    }
  };

  const openEdit = (place) => {
    setEditingId(place.id);
    setLabel(place.label || "");
    setAddress(place.address || "");
    setLat(place.lat ?? null);
    setLng(place.lng ?? null);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!label.trim() || !address.trim()) {
      Alert.alert("Missing Fields", "Please provide both label and address.");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        Alert.alert("Session Error", "Please log in again.");
        return;
      }

      const payload = {
        label: label.trim(),
        address: address.trim(),
        lat,
        lng,
      };

      const isEditing = Boolean(editingId);
      const endpoint = isEditing ? `${API_URL}/addresses/${editingId}` : `${API_URL}/addresses`;
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert("Save Failed", data?.message || "Unable to save address.");
        return;
      }

      setModalVisible(false);
      resetForm();
      fetchAddresses();
    } catch (error) {
      Alert.alert("Network Error", "Could not save address.");
      console.log(error);
    }
  };

  const handleDelete = async (id) => {
    Alert.alert("Delete Address", "Are you sure you want to delete this address?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem("userToken");
            if (!token) {
              Alert.alert("Session Error", "Please log in again.");
              return;
            }

            const response = await fetch(`${API_URL}/addresses/${id}`, {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            if (!response.ok) {
              const data = await response.json();
              Alert.alert("Delete Failed", data?.message || "Unable to delete address.");
              return;
            }

            fetchAddresses();
          } catch (error) {
            Alert.alert("Network Error", "Could not delete address.");
            console.log(error);
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* ... header ... */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Address</Text>
        <TouchableOpacity
          onPress={() => {
            resetForm();
            setModalVisible(true);
          }}
        >
          <Ionicons name="add" size={28} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <ActivityIndicator
          size="large"
          color={COLORS.primary}
          style={{ marginTop: 20 }}
        />
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
            />
          }
        >
          {addresses.length === 0 && (
            <View style={styles.emptyContainer}>
              <Ionicons name="map-outline" size={60} color={COLORS.lightGray} />
              <Text style={styles.emptyTitle}>No Addresses Yet</Text>
              <Text style={styles.emptyText}>
                Add your home or work location for faster checkouts.
              </Text>
              <TouchableOpacity
                style={styles.addFirstBtn}
                onPress={() => {
                  resetForm();
                  setModalVisible(true);
                }}
              >
                <Text style={styles.addFirstText}>Add New Address</Text>
              </TouchableOpacity>
            </View>
          )}
          {addresses.map((place) => (
            <View key={place.id} style={styles.card}>
              <View style={styles.iconBox}>
                <Ionicons
                  name={
                    place.label.toLowerCase().includes("home")
                      ? "home"
                      : place.label.toLowerCase().includes("work")
                        ? "briefcase"
                        : "location"
                  }
                  size={20}
                  color={COLORS.primary}
                />
              </View>
              <View style={styles.info}>
                <Text style={styles.type}>{place.label}</Text>
                <Text style={styles.address}>{place.address}</Text>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity
                  onPress={() => openEdit(place)}
                  style={styles.actionBtn}
                >
                  <Ionicons name="pencil" size={18} color={COLORS.mediumGray} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDelete(place.id)}
                  style={styles.actionBtn}
                >
                  <Ionicons name="trash-outline" size={18} color={COLORS.red} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Add/Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingId ? "Edit Address" : "Add New Address"}
            </Text>

            <View style={{ marginBottom: 15 }}>
              <TouchableOpacity
                style={styles.locationBtn}
                onPress={getCurrentLocation}
                disabled={locating}
              >
                <Ionicons name="navigate" size={20} color={COLORS.primary} />
                <Text style={styles.locationBtnText}>
                  {locating ? "Locating..." : "Use Current Location"}
                </Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Label (e.g. Home, Work)"
              placeholderTextColor={COLORS.mediumGray}
              value={label}
              onChangeText={setLabel}
            />

            <TextInput
              style={[styles.input, { height: 80 }]}
              placeholder="Full Address"
              placeholderTextColor={COLORS.mediumGray}
              value={address}
              onChangeText={setAddress}
              multiline
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.saveBtn]}
                onPress={handleSave}
              >
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
  },
  scrollContent: {
    padding: SIZES.padding,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
    marginTop: 15,
  },
  emptyText: {
    textAlign: "center",
    color: COLORS.mediumGray,
    marginTop: 5,
    marginBottom: 20,
    paddingHorizontal: 40,
  },
  addFirstBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    ...SHADOWS.small,
  },
  addFirstText: {
    color: COLORS.white,
    fontWeight: "bold",
    fontSize: 16,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    ...SHADOWS.small,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 77, 77, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  info: {
    flex: 1,
  },
  type: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 4,
  },
  address: {
    fontSize: 14,
    color: COLORS.mediumGray,
  },
  actions: {
    flexDirection: "row",
    gap: 15,
  },
  actionBtn: {
    padding: 5,
  },
  /* Modal Styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    ...SHADOWS.medium,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  locationBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 77, 77, 0.1)",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    gap: 8,
  },
  locationBtnText: {
    color: COLORS.primary,
    fontWeight: "600",
    fontSize: 14,
  },
  input: {
    backgroundColor: COLORS.gray,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  modalBtn: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelBtn: {
    backgroundColor: COLORS.lightGray,
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
  },
  cancelText: {
    fontWeight: "bold",
    color: COLORS.black,
  },
  saveText: {
    fontWeight: "bold",
    color: COLORS.white,
  },
});
