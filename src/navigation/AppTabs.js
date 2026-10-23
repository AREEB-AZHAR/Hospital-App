// src/navigation/AppTabs.js
import React, { useCallback, useContext, useMemo, useRef } from "react";
import { Animated, Platform, StyleSheet } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { AuthContext } from "../context/AuthContext";
import { colors, radii, shadows } from "../theme";
import {
  HomeIcon,
  StethoscopeIcon,
  CalendarIcon,
  ChatBubbleIcon,
  UserIcon,
  PrescriptionIcon,
  CreditCardIcon,
  ReportHeartIcon,
  SettingsIcon,
  HospitalBuildingIcon,
} from "../components/icons";

// Existing screens
import DepartmentsScreen from "../screens/tabs/DepartmentsScreen";
import FindDoctorScreen from "../screens/tabs/FindDoctorScreen";
import BookAppointmentScreen from "../screens/tabs/BookAppointmentScreen";
import MyAppointmentScreen from "../screens/tabs/MyAppointmentScreen";
import ProfileScreen from "../screens/tabs/ProfileScreen";

// Admin
import ReportsScreen from "../screens/admin/ReportsScreen";
import UsersScreen from "../screens/admin/UsersScreen";
import SettingsScreen from "../screens/admin/SettingsScreen";

// Role dashboards
import PatientHomeScreen from "../screens/role/PatientHomeScreen";
import ReceptionHomeScreen from "../screens/role/ReceptionHomeScreen";
import DoctorHomeScreen from "../screens/role/DoctorHomeScreen";
import AdminHomeScreen from "../screens/role/AdminHomeScreen";
import PrescriptionsScreen from "../screens/role/PrescriptionsScreen";
import PaymentsScreen from "../screens/role/PaymentsScreen";

// Chat stack
import ChatStack from "./ChatStack";

const Tab = createBottomTabNavigator();

function FadeOnFocus({ children }) {
  const opacity = useRef(new Animated.Value(1)).current;

  useFocusEffect(
    useCallback(() => {
      opacity.setValue(0);
      Animated.timing(opacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }).start();
    }, [opacity])
  );

  return <Animated.View style={{ flex: 1, opacity }}>{children}</Animated.View>;
}

function wrap(Screen) {
  return (props) => (
    <FadeOnFocus>
      <Screen {...props} />
    </FadeOnFocus>
  );
}

function getTabIcon(tabName, focused, color) {
  const strokeWidth = focused ? 2.4 : 2;
  const size = 22;

  switch (tabName) {
    case "Home":
    case "Dashboard":
      return <HomeIcon size={size} color={color} strokeWidth={strokeWidth} />;
    case "Find Doctor":
    case "Doctors":
      return <StethoscopeIcon size={size} color={color} strokeWidth={strokeWidth} />;
    case "Appointments":
    case "Queue":
    case "Today":
      return <CalendarIcon size={size} color={color} strokeWidth={strokeWidth} />;
    case "Chat":
      return <ChatBubbleIcon size={size} color={color} strokeWidth={strokeWidth} />;
    case "Profile":
    case "Users":
      return <UserIcon size={size} color={color} strokeWidth={strokeWidth} />;
    case "Prescriptions":
      return <PrescriptionIcon size={size} color={color} strokeWidth={strokeWidth} />;
    case "Payments":
      return <CreditCardIcon size={size} color={color} strokeWidth={strokeWidth} />;
    case "Reports":
      return <ReportHeartIcon size={size} color={color} strokeWidth={strokeWidth} />;
    case "Settings":
      return <SettingsIcon size={size} color={color} strokeWidth={strokeWidth} />;
    case "Departments":
      return <HospitalBuildingIcon size={size} color={color} strokeWidth={strokeWidth} />;
    default:
      return <HomeIcon size={size} color={color} strokeWidth={strokeWidth} />;
  }
}

export default function AppTabs() {
  const { user } = useContext(AuthContext);

  const role = String(user?.role || "patient").trim().toLowerCase();

  const HomeForRole = useMemo(() => {
    if (role === "reception" || role === "receptionist") return ReceptionHomeScreen;
    if (role === "doctor") return DoctorHomeScreen;
    if (role === "admin") return AdminHomeScreen;
    return PatientHomeScreen;
  }, [role]);

  const tabs = useMemo(() => {
    if (role === "patient") {
      return [
        { name: "Home", label: "Home", component: HomeForRole },
        { name: "Find Doctor", label: "Doctors", component: FindDoctorScreen },
        { name: "Appointments", label: "Bookings", component: MyAppointmentScreen },
        { name: "Chat", label: "Chat", component: ChatStack },
        { name: "Profile", label: "Profile", component: ProfileScreen },
        // Secondary navigation registered as hidden tabs for seamless navigate() calls
        { name: "Departments", label: "Departments", component: DepartmentsScreen, hidden: true },
        { name: "Book", label: "Book", component: BookAppointmentScreen, hidden: true },
      ];
    }

    if (role === "reception" || role === "receptionist") {
      return [
        { name: "Dashboard", label: "Dashboard", component: HomeForRole },
        { name: "Queue", label: "Queue", component: MyAppointmentScreen },
        { name: "Chat", label: "Chat", component: ChatStack },
        { name: "Payments", label: "Payments", component: PaymentsScreen },
        { name: "Profile", label: "Profile", component: ProfileScreen },
      ];
    }

    if (role === "doctor") {
      return [
        { name: "Dashboard", label: "Dashboard", component: HomeForRole },
        { name: "Today", label: "Appointments", component: MyAppointmentScreen },
        { name: "Prescriptions", label: "Prescriptions", component: PrescriptionsScreen },
        { name: "Chat", label: "Chat", component: ChatStack },
        { name: "Profile", label: "Profile", component: ProfileScreen },
      ];
    }

    // Admin
    return [
      { name: "Dashboard", label: "Dashboard", component: HomeForRole },
      { name: "Users", label: "Users", component: UsersScreen },
      { name: "Reports", label: "Reports", component: ReportsScreen },
      { name: "Settings", label: "Settings", component: SettingsScreen },
      { name: "Profile", label: "Profile", component: ProfileScreen },
    ];
  }, [role, HomeForRole]);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: styles.header,
        headerTitleStyle: styles.headerTitle,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarHideOnKeyboard: true,
      }}
    >
      {tabs.map((t) => (
        <Tab.Screen
          key={t.name}
          name={t.name}
          component={t.component === ChatStack ? t.component : wrap(t.component)}
          options={{
            tabBarLabel: t.label || t.name,
            tabBarIcon: ({ color, focused }) => getTabIcon(t.name, focused, color),
            ...(t.hidden
              ? {
                  tabBarButton: () => null,
                  tabBarItemStyle: { display: "none" },
                }
              : {}),
            ...(t.name === "Home" || t.name === "Dashboard"
              ? { headerShown: false }
              : {}),
          }}
        />
      ))}
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.surface,
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
    height: Platform.OS === "android" ? 56 : 48,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  tabBar: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorder,
    height: Platform.OS === "ios" ? 84 : 64,
    paddingTop: 8,
    paddingBottom: Platform.OS === "ios" ? 24 : 10,
    ...shadows.subtle,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: "700",
    marginTop: 2,
  },
});
