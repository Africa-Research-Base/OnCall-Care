import "react-native-gesture-handler";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { StatusBar } from "expo-status-bar";

// Placeholder screens - will be implemented in separate files
import SplashScreen from "./src/screens/SplashScreen";
import RoleSelectionScreen from "./src/screens/RoleSelectionScreen";
import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import PatientHomeScreen from "./src/screens/PatientHomeScreen";
import NurseDashboard from "./src/screens/NurseDashboard";
import SearchingScreen from "./src/screens/SearchingScreen";
import TrackNurseScreen from "./src/screens/TrackNurseScreen";
import MedicalProfileScreen from "./src/screens/MedicalProfileScreen";
import JobAlertScreen from "./src/screens/JobAlertScreen";
import ActiveJobScreen from "./src/screens/ActiveJobScreen";
import KYCScreen from "./src/screens/KYCScreen";
import AdminVerifyScreen from "./src/screens/AdminVerifyScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import EditProfileScreen from "./src/screens/EditProfileScreen";
import SavedAddressesScreen from "./src/screens/SavedAddressesScreen";

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator initialRouteName="Splash">
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="RoleSelection"
          component={RoleSelectionScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{ headerShown: false }}
        />

        {/* Patient Screens */}
        <Stack.Screen
          name="PatientHome"
          component={PatientHomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="EditProfile"
          component={EditProfileScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SavedAddresses"
          component={SavedAddressesScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Searching"
          component={SearchingScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="TrackNurse"
          component={TrackNurseScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="MedicalProfile"
          component={MedicalProfileScreen}
          options={{ title: "My Medical Profile" }}
        />

        {/* Nurse Screens */}
        <Stack.Screen
          name="NurseDashboard"
          component={NurseDashboard}
          options={{ title: "Nurse Dashboard" }}
        />
        <Stack.Screen
          name="JobAlert"
          component={JobAlertScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ActiveJob"
          component={ActiveJobScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="KYC"
          component={KYCScreen}
          options={{ title: "License Verification" }}
        />

        {/* Admin Screen */}
        <Stack.Screen
          name="AdminVerify"
          component={AdminVerifyScreen}
          options={{ title: "Admin Panel" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
