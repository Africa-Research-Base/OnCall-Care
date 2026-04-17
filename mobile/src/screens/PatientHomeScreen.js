import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Dimensions,
  TouchableOpacity,
  Text,
  Alert,
  StatusBar,
  Modal,
} from "react-native";
import MapView, { Marker } from "../components/CareMap";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COLORS, SHADOWS } from "../theme";
import TriageWizard from "../components/TriageWizard";
import { useFocusEffect } from "@react-navigation/native";
import { API_URL } from "../config/api";

const { width, height } = Dimensions.get("window");
const DEFAULT_REGION = {
  latitude: 37.78825,
  longitude: -122.4324,
  latitudeDelta: 0.005,
  longitudeDelta: 0.005,
};

export default function PatientHomeScreen({ navigation }) {
  const [location, setLocation] = useState(null);
  const [mapRegion, setMapRegion] = useState(DEFAULT_REGION);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const isUsingDefaultLocation = !location;
  const locationStatusText = isUsingDefaultLocation
    ? "Using default location"
    : "Using live GPS";

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
          setHasLocationPermission(false);
          Alert.alert("Location Permission", "Location was denied. Showing default map area.");
          return;
        }

        setHasLocationPermission(true);

        let currentPosition = null;

        try {
          currentPosition = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
        } catch (_error) {
          currentPosition = await Location.getLastKnownPositionAsync();
        }

        if (currentPosition?.coords) {
          const liveRegion = {
            latitude: currentPosition.coords.latitude,
            longitude: currentPosition.coords.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          };

          setLocation(liveRegion);
          setMapRegion(liveRegion);
        }
      } catch (_error) {
        setHasLocationPermission(false);
      }
    })();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchSavedAddresses();
    }, []),
  );

  const fetchSavedAddresses = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) return;

      const response = await fetch(`${API_URL}/addresses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        // Take only the first 2 or 3 for the home screen summary
        setSavedAddresses(data.slice(0, 3));
      }
    } catch (error) {
      console.log("Failed to fetch addresses", error);
    }
  };

  const handleRequestHelp = (triageData) => {
    setModalVisible(false);
    const loc = location || DEFAULT_REGION;
    navigation.navigate("Searching", {
      triageData: triageData,
      location: loc,
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <MapView
        style={styles.map}
        initialRegion={DEFAULT_REGION}
        region={mapRegion}
        showsUserLocation={hasLocationPermission}
        customMapStyle={[
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }],
          },
        ]}
      >
        <Marker coordinate={mapRegion} />
      </MapView>

      {/* Header / Menu Button */}
      <TouchableOpacity
        style={styles.menuBtn}
        onPress={() => navigation.navigate("Profile")}
      >
        <View style={styles.menuIcon}>
          <Ionicons name="menu" size={24} color={COLORS.black} />
        </View>
      </TouchableOpacity>

      <View
        style={[
          styles.locationStatusBadge,
          isUsingDefaultLocation && styles.locationStatusBadgeFallback,
        ]}
      >
        <Text style={styles.locationStatusText}>{locationStatusText}</Text>
      </View>

      {/* Floating Search Card */}
      <View style={styles.searchCard}>
        <Text style={styles.greeting}>Where matched care begins.</Text>

        <TouchableOpacity
          style={styles.searchBtn}
          onPress={() => setModalVisible(true)}
        >
          <View style={styles.searchIconContainer}>
            <View style={styles.square} />
          </View>
          <Text style={styles.searchText}>Request Medical Aid</Text>
          <View style={styles.searchRightIcon}>
            <Ionicons name="search" size={20} color={COLORS.darkGray} />
          </View>
        </TouchableOpacity>

        {/* Dynamic Saved Addresses */}
        {savedAddresses.length > 0 ? (
          savedAddresses.map((addr) => (
            <TouchableOpacity
              key={addr.id}
              style={[styles.recentLocation, { marginBottom: 15 }]}
              // Optional: On press, maybe center map or quick select?
            >
              <View
                style={[
                  styles.recentIcon,
                  addr.label.toLowerCase().includes("work")
                    ? { backgroundColor: COLORS.lightGray }
                    : {},
                ]}
              >
                <Ionicons
                  name={
                    addr.label.toLowerCase().includes("home")
                      ? "home"
                      : addr.label.toLowerCase().includes("work")
                        ? "briefcase"
                        : "location"
                  }
                  size={16}
                  color={
                    addr.label.toLowerCase().includes("work")
                      ? COLORS.mediumGray
                      : COLORS.white
                  }
                  // Note: original Work icon had mediumGray color and lightGray bg. Home had white color and mediumGray bg.
                  // Adopting simple logic: Default to 'Home' style unless 'Work' is detected to match previous design.
                />
              </View>
              <View>
                <Text style={styles.recentTitle}>{addr.label}</Text>
                <Text style={styles.recentAddress} numberOfLines={1}>
                  {addr.address}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <TouchableOpacity
            style={styles.addAddressEmptyBtn}
            onPress={() => navigation.navigate("SavedAddresses")}
          >
            <View style={styles.addAddressIcon}>
              <Ionicons name="add" size={20} color={COLORS.primary} />
            </View>
            <Text style={styles.addAddressText}>Add Address</Text>
          </TouchableOpacity>
        )}
      </View>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.wizardContainer}>
            <TriageWizard
              onClose={() => setModalVisible(false)}
              onSubmit={handleRequestHelp}
            />
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
  map: {
    width: width,
    height: height * 0.65, // Map takes top 65%
  },
  menuBtn: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
    ...SHADOWS.small,
  },
  menuIcon: {
    backgroundColor: COLORS.white,
    padding: 10,
    borderRadius: 30,
    ...SHADOWS.small,
  },
  locationStatusBadge: {
    position: "absolute",
    top: 55,
    right: 20,
    backgroundColor: "rgba(34, 197, 94, 0.95)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    zIndex: 10,
  },
  locationStatusBadgeFallback: {
    backgroundColor: "rgba(245, 158, 11, 0.95)",
  },
  locationStatusText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "600",
  },
  searchCard: {
    position: "absolute",
    bottom: 0,
    width: width,
    height: height * 0.45,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 25,
    ...SHADOWS.medium,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  addAddressEmptyBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 77, 77, 0.05)",
    padding: 15,
    borderRadius: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 77, 77, 0.1)",
    borderStyle: "dashed",
    justifyContent: "center",
  },
  addAddressIcon: {
    marginRight: 10,
  },
  addAddressText: {
    color: COLORS.primary,
    fontWeight: "600",
    fontSize: 16,
  },
  greeting: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 20,
  },
  searchBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.gray,
    padding: 15,
    borderRadius: 10,
    marginBottom: 25,
  },
  searchIconContainer: {
    marginRight: 15,
  },
  square: {
    width: 8,
    height: 8,
    backgroundColor: COLORS.black,
  },
  searchText: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.black,
    flex: 1,
  },
  searchRightIcon: {
    backgroundColor: COLORS.white,
    padding: 5,
    borderRadius: 5,
  },
  recentLocation: {
    flexDirection: "row",
    alignItems: "center",
  },
  recentIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.mediumGray,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  recentTitle: {
    fontWeight: "bold",
    fontSize: 16,
    color: COLORS.black,
  },
  recentAddress: {
    color: COLORS.mediumGray,
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  wizardContainer: {
    height: "85%",
    backgroundColor: "white",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
});
