import React, { useContext, useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { AuthContext } from "../../context/AuthContext";
import { usersApi } from "../../services/api";

function LabeledInput({ label, value, onChangeText, keyboardType, editable = true, placeholder }) {
  return (
    <View style={{ marginTop: 14 }}>
      <Text style={{ fontSize: 12, fontWeight: "900", color: "#888", letterSpacing: 0.5 }}>
        {label}
      </Text>
      <View
        style={{
          marginTop: 6,
          borderWidth: 1,
          borderColor: editable ? "#d1d5db" : "#eee",
          borderRadius: 12,
          backgroundColor: editable ? "#fff" : "#f9f9f9",
          paddingHorizontal: 14,
          paddingVertical: 12,
        }}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          editable={editable}
          keyboardType={keyboardType || "default"}
          placeholder={placeholder || ""}
          style={{ fontSize: 15, color: editable ? "#111" : "#555" }}
        />
      </View>
    </View>
  );
}

function RolePill({ role }) {
  const colors = {
    admin: { bg: "#fef3c7", text: "#92400e", border: "#fde68a" },
    doctor: { bg: "#d1fae5", text: "#065f46", border: "#a7f3d0" },
    reception: { bg: "#dbeafe", text: "#1e40af", border: "#bfdbfe" },
    patient: { bg: "#ede9fe", text: "#5b21b6", border: "#ddd6fe" },
  };
  const c = colors[role] || colors.patient;
  return (
    <View
      style={{
        alignSelf: "flex-start",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 999,
        backgroundColor: c.bg,
        borderWidth: 1,
        borderColor: c.border,
        marginTop: 4,
      }}
    >
      <Text style={{ fontSize: 12, fontWeight: "900", color: c.text, textTransform: "uppercase" }}>
        {role}
      </Text>
    </View>
  );
}

export default function ProfileScreen() {
  const { user: authUser, logout } = useContext(AuthContext);

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [availability, setAvailability] = useState("");

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const data = await usersApi.me();
      setProfile(data);
      setName(data.name || "");
      setEmail(data.email || "");
      setDepartment(data.department || "");
      setSpecialization(data.specialization || "");
      setAvailability(data.availability || "");
    } catch (e) {
      Alert.alert("Error", e?.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const onSave = async () => {
    try {
      setSaving(true);
      const updated = await usersApi.updateMe({
        name: name.trim(),
        email: email.trim(),
        department: department.trim(),
        specialization: specialization.trim(),
        availability: availability.trim(),
      });
      setProfile(updated);
      setEditing(false);
      Alert.alert("Saved", "Profile updated successfully.");
    } catch (e) {
      Alert.alert("Error", e?.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const onDiscard = () => {
    setName(profile?.name || "");
    setEmail(profile?.email || "");
    setDepartment(profile?.department || "");
    setSpecialization(profile?.specialization || "");
    setAvailability(profile?.availability || "");
    setEditing(false);
  };

  const onLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: logout },
    ]);
  };

  const role = String(profile?.role || authUser?.role || "patient").toLowerCase();
  const isDoctor = role === "doctor";

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10, color: "#666" }}>Loading profile…</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#f7f8fa" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        {/* Header card */}
        <View
          style={{
            alignItems: "center",
            backgroundColor: "#111",
            borderRadius: 24,
            paddingVertical: 32,
            paddingHorizontal: 20,
            marginBottom: 20,
          }}
        >
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: "#333",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 14,
            }}
          >
            <Text style={{ fontSize: 34 }}>
              {isDoctor ? "👨‍⚕️" : role === "admin" ? "🛡️" : role === "reception" ? "🏥" : "👤"}
            </Text>
          </View>
          <Text style={{ fontSize: 20, fontWeight: "900", color: "white" }}>
            {profile?.name || authUser?.name || "—"}
          </Text>
          <Text style={{ marginTop: 4, color: "#aaa", fontWeight: "700" }}>
            {profile?.phone || authUser?.phone || "—"}
          </Text>
          <View style={{ marginTop: 8 }}>
            <RolePill role={role} />
          </View>
          {isDoctor && !!profile?.department && (
            <Text style={{ marginTop: 8, color: "#ccc", fontWeight: "700" }}>
              {profile.department}
              {profile.specialization ? ` • ${profile.specialization}` : ""}
            </Text>
          )}
        </View>

        {/* Doctor stats */}
        {isDoctor && (
          <View style={{ flexDirection: "row", gap: 10, marginBottom: 20 }}>
            {[
              { label: "Rating", value: `⭐ ${profile?.rating ?? 4.5}` },
              { label: "Experience", value: `${profile?.experience ?? 5} yrs` },
              { label: "Fee", value: `Rs ${profile?.fee ?? 1500}` },
            ].map((s) => (
              <View
                key={s.label}
                style={{
                  flex: 1,
                  backgroundColor: "white",
                  borderRadius: 14,
                  padding: 12,
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: "#eee",
                }}
              >
                <Text style={{ fontSize: 15, fontWeight: "900" }}>{s.value}</Text>
                <Text style={{ marginTop: 4, fontSize: 11, color: "#888", fontWeight: "700" }}>
                  {s.label}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Edit / Save / Discard buttons */}
        <View style={{ flexDirection: "row", gap: 10, marginBottom: 6 }}>
          {!editing ? (
            <Pressable
              onPress={() => setEditing(true)}
              style={({ pressed }) => ({
                flex: 1,
                backgroundColor: "#111",
                borderRadius: 14,
                padding: 14,
                alignItems: "center",
                opacity: pressed ? 0.9 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
                overflow: "hidden",
              })}
            >
              <Text style={{ color: "white", fontWeight: "900" }}>✏️  Edit Profile</Text>
            </Pressable>
          ) : (
            <>
              <Pressable
                onPress={onSave}
                disabled={saving}
                style={({ pressed }) => ({
                  flex: 1,
                  backgroundColor: saving ? "#888" : "#111",
                  borderRadius: 14,
                  padding: 14,
                  alignItems: "center",
                  opacity: pressed ? 0.9 : 1,
                  overflow: "hidden",
                })}
              >
                <Text style={{ color: "white", fontWeight: "900" }}>
                  {saving ? "Saving…" : "✅  Save"}
                </Text>
              </Pressable>
              <Pressable
                onPress={onDiscard}
                style={({ pressed }) => ({
                  flex: 1,
                  backgroundColor: "white",
                  borderRadius: 14,
                  padding: 14,
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: "#eee",
                  opacity: pressed ? 0.9 : 1,
                  overflow: "hidden",
                })}
              >
                <Text style={{ fontWeight: "900", color: "#555" }}>Discard</Text>
              </Pressable>
            </>
          )}
        </View>

        {/* Form */}
        <View
          style={{
            backgroundColor: "white",
            borderRadius: 18,
            padding: 16,
            borderWidth: 1,
            borderColor: "#eee",
          }}
        >
          <LabeledInput label="FULL NAME" value={name} onChangeText={setName} editable={editing} placeholder="Your full name" />
          <LabeledInput label="PHONE" value={profile?.phone || authUser?.phone || ""} editable={false} />
          <LabeledInput label="EMAIL" value={email} onChangeText={setEmail} editable={editing} keyboardType="email-address" placeholder="your@email.com" />
          {(isDoctor || role === "reception") && (
            <LabeledInput label="DEPARTMENT" value={department} onChangeText={setDepartment} editable={editing} placeholder="e.g. Cardiology" />
          )}
          {isDoctor && (
            <>
              <LabeledInput label="SPECIALIZATION" value={specialization} onChangeText={setSpecialization} editable={editing} placeholder="e.g. Interventional Cardiology" />
              <LabeledInput label="AVAILABILITY" value={availability} onChangeText={setAvailability} editable={editing} placeholder="e.g. Mon–Sat, 09:00 AM – 05:00 PM" />
            </>
          )}
        </View>

        {/* Account info */}
        <View
          style={{
            marginTop: 20,
            backgroundColor: "white",
            borderRadius: 18,
            padding: 16,
            borderWidth: 1,
            borderColor: "#eee",
          }}
        >
          <Text style={{ fontSize: 13, fontWeight: "900", color: "#888", marginBottom: 12 }}>ACCOUNT</Text>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
            <Text style={{ color: "#555", fontWeight: "700" }}>Member since</Text>
            <Text style={{ fontWeight: "900", color: "#111" }}>
              {profile?.createdAt
                ? new Date(profile.createdAt).toLocaleDateString("en-PK", { year: "numeric", month: "short", day: "numeric" })
                : "—"}
            </Text>
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ color: "#555", fontWeight: "700" }}>Role</Text>
            <Text style={{ fontWeight: "900", color: "#111", textTransform: "capitalize" }}>{role}</Text>
          </View>
        </View>

        {/* Logout */}
        <Pressable
          onPress={onLogout}
          style={({ pressed }) => ({
            marginTop: 20,
            borderWidth: 1,
            borderColor: "#fee2e2",
            backgroundColor: "#fff5f5",
            borderRadius: 14,
            padding: 16,
            alignItems: "center",
            opacity: pressed ? 0.9 : 1,
            overflow: "hidden",
          })}
        >
          <Text style={{ fontWeight: "900", color: "#dc2626" }}>🚪  Logout</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

