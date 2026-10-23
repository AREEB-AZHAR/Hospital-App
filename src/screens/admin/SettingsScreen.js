import React, { useContext } from "react";
import { View, Text, ScrollView, Pressable, Alert, Linking } from "react-native";
import { AuthContext } from "../../context/AuthContext";

function SettingRow({ label, value }) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#f3f4f6",
      }}
    >
      <Text style={{ color: "#666", fontWeight: "700", flex: 1, marginRight: 12 }}>{label}</Text>
      <Text style={{ fontWeight: "900", color: "#111", flex: 2, textAlign: "right" }}>{value}</Text>
    </View>
  );
}

function Section({ title, children }) {
  return (
    <View
      style={{
        backgroundColor: "white",
        borderRadius: 18,
        padding: 16,
        borderWidth: 1,
        borderColor: "#eee",
        marginBottom: 16,
      }}
    >
      <Text style={{ fontSize: 13, fontWeight: "900", color: "#888", marginBottom: 4 }}>
        {title}
      </Text>
      {children}
    </View>
  );
}

export default function SettingsScreen({ navigation }) {
  const { logout, user } = useContext(AuthContext);

  const onLogout = () => {
    Alert.alert("Logout", "Sign out of admin account?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: logout },
    ]);
  };

  return (
    <ScrollView
      contentContainerStyle={{ padding: 16, paddingBottom: 40, backgroundColor: "#f7f8fa" }}
      style={{ flex: 1, backgroundColor: "#f7f8fa" }}
    >
      <Text style={{ fontSize: 20, fontWeight: "900", color: "#111" }}>Settings</Text>
      <Text style={{ marginTop: 4, color: "#666", fontWeight: "700", marginBottom: 20 }}>
        Admin configuration
      </Text>

      {/* Hospital Info */}
      <Section title="HOSPITAL INFO">
        <SettingRow label="Name" value="City Care Hospital" />
        <SettingRow label="Address" value="123 Main Blvd, Karachi" />
        <SettingRow label="Phone" value="+92-21-1234567" />
        <SettingRow label="Email" value="admin@citycare.pk" />
        <SettingRow label="Hours" value="24/7 Emergency | OPD 08:00–20:00" />
      </Section>

      {/* System */}
      <Section title="SYSTEM">
        <SettingRow label="Backend" value="Express v5 + MongoDB Atlas" />
        <SettingRow label="Auth" value="JWT (30-day tokens)" />
        <SettingRow label="Roles" value="admin, doctor, reception, patient" />
        <SettingRow label="API Port" value="4000" />
      </Section>

      {/* Admin account */}
      <Section title="YOUR ACCOUNT">
        <SettingRow label="Name" value={user?.name || "—"} />
        <SettingRow label="Phone" value={user?.phone || "—"} />
        <SettingRow label="Role" value={user?.role || "admin"} />
      </Section>

      {/* Quick links */}
      <View style={{ gap: 10 }}>
        <Pressable
          onPress={() => navigation.navigate("Users")}
          style={({ pressed }) => ({
            backgroundColor: "white",
            borderRadius: 14,
            padding: 16,
            borderWidth: 1,
            borderColor: "#eee",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            opacity: pressed ? 0.9 : 1,
          })}
        >
          <Text style={{ fontWeight: "900", color: "#111" }}>👥 Manage Users</Text>
          <Text style={{ color: "#aaa", fontSize: 18 }}>›</Text>
        </Pressable>

        <Pressable
          onPress={() => navigation.navigate("Reports")}
          style={({ pressed }) => ({
            backgroundColor: "white",
            borderRadius: 14,
            padding: 16,
            borderWidth: 1,
            borderColor: "#eee",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            opacity: pressed ? 0.9 : 1,
          })}
        >
          <Text style={{ fontWeight: "900", color: "#111" }}>📊 View Reports</Text>
          <Text style={{ color: "#aaa", fontSize: 18 }}>›</Text>
        </Pressable>

        <Pressable
          onPress={onLogout}
          style={({ pressed }) => ({
            borderWidth: 1,
            borderColor: "#fee2e2",
            backgroundColor: "#fff5f5",
            borderRadius: 14,
            padding: 16,
            alignItems: "center",
            opacity: pressed ? 0.9 : 1,
          })}
        >
          <Text style={{ fontWeight: "900", color: "#dc2626" }}>🚪 Logout</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
