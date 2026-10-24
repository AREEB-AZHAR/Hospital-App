import React, { useContext, useMemo } from "react";
import { View, ActivityIndicator, StyleSheet, StatusBar } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { AuthContext } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import AuthStack from "./AuthStack";
import AppTabs from "./AppTabs";
import DoctorDetailScreen from "../screens/tabs/DoctorDetailScreen";
import PatientProfileScreen from "../screens/role/PatientProfileScreen";
import BookAppointmentScreen from "../screens/tabs/BookAppointmentScreen";
import DepartmentsScreen from "../screens/tabs/DepartmentsScreen";

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
  const { isDark, colors } = useTheme();

  const navTheme = useMemo(
    () => ({
      dark: isDark,
      colors: {
        primary: colors.primary,
        background: colors.background,
        card: colors.surface,
        text: colors.textPrimary,
        border: colors.surfaceBorder,
        notification: colors.accent,
      },
    }),
    [isDark, colors]
  );

  if (booting) {
    return (
      <View style={[styles.bootingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />
      <NavigationContainer theme={navTheme}>
        {user ? <AppStack /> : <AuthStack />}
      </NavigationContainer>
    </>
  );
}

const styles = StyleSheet.create({
  bootingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
