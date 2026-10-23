import React, { useContext } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { AuthContext } from "../context/AuthContext";
import AuthStack from "./AuthStack";
import AppTabs from "./AppTabs";
import DoctorDetailScreen from "../screens/tabs/DoctorDetailScreen";
import PatientProfileScreen from "../screens/role/PatientProfileScreen";
import BookAppointmentScreen from "../screens/tabs/BookAppointmentScreen";
import DepartmentsScreen from "../screens/tabs/DepartmentsScreen";
import { colors } from "../theme";

const Stack = createNativeStackNavigator();

function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={AppTabs} />
      <Stack.Screen
        name="DoctorDetail"
        component={DoctorDetailScreen}
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="PatientProfile"
        component={PatientProfileScreen}
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="BookAppointment"
        component={BookAppointmentScreen}
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="DepartmentsOverview"
        component={DepartmentsScreen}
        options={{ animation: "slide_from_right" }}
      />
    </Stack.Navigator>
  );
}

export default function RootNavigator() {
  const { user, booting } = useContext(AuthContext);

  if (booting) {
    return (
      <View style={styles.bootingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  bootingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
});
