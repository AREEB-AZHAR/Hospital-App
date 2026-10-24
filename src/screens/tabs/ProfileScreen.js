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
  Switch,
} from "react-native";
import { AuthContext } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { usersApi } from "../../services/api";
import { radii } from "../../theme";
import {
  UserIcon,
  StethoscopeIcon,
  HospitalBuildingIcon,
  ShieldCheckIcon,
  StarFilledIcon,
  LogoutIcon,
  MoonIcon,
  SunIcon,
  EditIcon,
  CheckIcon,
} from "../../components/icons";

function LabeledInput({ label, value, onChangeText, keyboardType, editable = true, placeholder }) {
  const { colors, isDark } = useTheme();
  return (
    <View style={{ marginTop: 14 }}>
      <Text style={{ fontSize: 12, fontWeight: "900", color: colors.textMuted, letterSpacing: 0.5 }}>
        {label}
      </Text>
      <View
        style={{
          marginTop: 6,
          borderWidth: 1,
          borderColor: editable ? (isDark ? colors.border : "#d1d5db") : (isDark ? colors.surfaceBorder : "#eee"),
          borderRadius: 12,
          backgroundColor: editable ? colors.card : (isDark ? colors.background : "#f9f9f9"),
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
          placeholderTextColor={colors.textMuted}
          style={{ fontSize: 15, color: editable ? colors.textPrimary : colors.textSecondary }}
        />
      </View>
    </View>
  );
}

function RolePill({ role }) {
  const { isDark } = useTheme();
  const lightColors = {
    admin: { bg: "#fef3c7", text: "#92400e", border: "#fde68a" },
    doctor: { bg: "#d1fae5", text: "#065f46", border: "#a7f3d0" },
    reception: { bg: "#dbeafe", text: "#1e40af", border: "#bfdbfe" },
    patient: { bg: "#ede9fe", text: "#5b21b6", border: "#ddd6fe" },
  };
  const darkRoleColors = {
    admin: { bg: "rgba(245, 158, 11, 0.2)", text: "#FCD34D", border: "rgba(245, 158, 11, 0.35)" },
    doctor: { bg: "rgba(16, 185, 129, 0.2)", text: "#6EE7B7", border: "rgba(16, 185, 129, 0.35)" },
    reception: { bg: "rgba(59, 130, 246, 0.2)", text: "#93C5FD", border: "rgba(59, 130, 246, 0.35)" },
    patient: { bg: "rgba(139, 92, 246, 0.2)", text: "#C4B5FD", border: "rgba(139, 92, 246, 0.35)" },
  };
  const c = (isDark ? darkRoleColors[role] : lightColors[role]) || (isDark ? darkRoleColors.patient : lightColors.patient);
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
  const { isDark, toggleTheme, colors, shadows } = useTheme();

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
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 10, color: colors.textMuted }}>Loading profile…</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120 }}>
        {/* Header card */}
        <View
          style={{
            alignItems: "center",
            backgroundColor: isDark ? colors.surface : "#0F172A",
            borderRadius: radii.xl,
            paddingVertical: 32,
            paddingHorizontal: 20,
            marginBottom: 20,
            borderWidth: isDark ? 1 : 0,
            borderColor: colors.surfaceBorder,
            ...shadows.card,
          }}
        >
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: colors.primary,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 14,
              borderWidth: 2,
              borderColor: "rgba(255, 255, 255, 0.3)",
              ...shadows.subtle,
            }}
          >
            {isDoctor ? (
              <StethoscopeIcon size={38} color={colors.white} strokeWidth={2.2} />
            ) : role === "admin" ? (
              <ShieldCheckIcon size={38} color={colors.white} strokeWidth={2.2} />
            ) : role === "reception" ? (
              <HospitalBuildingIcon size={38} color={colors.white} strokeWidth={2.2} />
            ) : (
              <UserIcon size={38} color={colors.white} strokeWidth={2.2} />
            )}
          </View>
          <Text style={{ fontSize: 20, fontWeight: "900", color: colors.white }}>
            {profile?.name || authUser?.name || "—"}
          </Text>
          <Text style={{ marginTop: 4, color: "rgba(255, 255, 255, 0.75)", fontWeight: "700" }}>
            {profile?.phone || authUser?.phone || "—"}
          </Text>
          <View style={{ marginTop: 8 }}>
            <RolePill role={role} />
          </View>
          {isDoctor && !!profile?.department && (
            <Text style={{ marginTop: 8, color: "rgba(255, 255, 255, 0.85)", fontWeight: "700" }}>
              {profile.department}
              {profile.specialization ? ` • ${profile.specialization}` : ""}
            </Text>
          )}
        </View>

        {/* Doctor stats */}
        {isDoctor && (
          <View style={{ flexDirection: "row", gap: 10, marginBottom: 20 }}>
            {[
              { label: "Rating", value: `${profile?.rating ?? 4.8}`, icon: <StarFilledIcon size={14} color={colors.warning} /> },
              { label: "Experience", value: `${profile?.experience ?? 5} yrs`, icon: null },
              { label: "Fee", value: `Rs ${profile?.fee ?? 1500}`, icon: null },
            ].map((s) => (
              <View
                key={s.label}
                style={{
                  flex: 1,
                  backgroundColor: colors.surface,
                  borderRadius: radii.lg,
                  padding: 12,
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: colors.surfaceBorder,
                  ...shadows.subtle,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  {s.icon ? <View style={{ marginRight: 4 }}>{s.icon}</View> : null}
                  <Text style={{ fontSize: 15, fontWeight: "900", color: colors.textPrimary }}>{s.value}</Text>
                </View>
                <Text style={{ marginTop: 4, fontSize: 11, color: colors.textMuted, fontWeight: "700" }}>
                  {s.label}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Edit / Save / Discard buttons */}
        <View style={{ flexDirection: "row", gap: 10, marginBottom: 14 }}>
          {!editing ? (
            <Pressable
              onPress={() => setEditing(true)}
              android_ripple={{ color: "rgba(255, 255, 255, 0.2)" }}
              style={({ pressed }) => ({
                flex: 1,
                backgroundColor: colors.primary,
                borderRadius: 14,
                padding: 14,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                opacity: pressed ? 0.9 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
                overflow: "hidden",
                ...shadows.subtle,
              })}
            >
              <EditIcon size={16} color={colors.white} strokeWidth={2.5} />
              <Text style={{ color: colors.white, fontWeight: "900", marginLeft: 8, fontSize: 15 }}>
                Edit Profile
              </Text>
            </Pressable>
          ) : (
            <>
              <Pressable
                onPress={onSave}
                disabled={saving}
                android_ripple={{ color: "rgba(255, 255, 255, 0.2)" }}
                style={({ pressed }) => ({
                  flex: 1,
                  backgroundColor: saving ? colors.textMuted : colors.primary,
                  borderRadius: 14,
                  padding: 14,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: pressed ? 0.9 : 1,
                  overflow: "hidden",
                  ...shadows.subtle,
                })}
              >
                <CheckIcon size={16} color={colors.white} strokeWidth={2.5} />
                <Text style={{ color: colors.white, fontWeight: "900", marginLeft: 8, fontSize: 15 }}>
                  {saving ? "Saving…" : "Save Changes"}
                </Text>
              </Pressable>
              <Pressable
                onPress={onDiscard}
                style={({ pressed }) => ({
                  flex: 1,
                  backgroundColor: colors.surface,
                  borderRadius: 14,
                  padding: 14,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor: colors.surfaceBorder,
                  opacity: pressed ? 0.9 : 1,
                  overflow: "hidden",
                })}
              >
                <Text style={{ fontWeight: "900", color: colors.textSecondary, fontSize: 15 }}>
                  Discard
                </Text>
              </Pressable>
            </>
          )}
        </View>

        {/* Form */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 18,
            padding: 16,
            borderWidth: 1,
            borderColor: colors.surfaceBorder,
            ...shadows.subtle,
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

        {/* Appearance Toggle */}
        <View
          style={{
            marginTop: 20,
            backgroundColor: colors.surface,
            borderRadius: 18,
            padding: 16,
            borderWidth: 1,
            borderColor: colors.surfaceBorder,
            ...shadows.subtle,
          }}
        >
          <Text
            style={{
              fontSize: 12,
              fontWeight: "900",
              color: colors.textMuted,
              letterSpacing: 0.5,
              marginBottom: 12,
              textTransform: "uppercase",
            }}
          >
            Appearance
          </Text>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                flex: 1,
                marginRight: 12,
              }}
            >
              <View
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: radii.full,
                  backgroundColor: isDark
                    ? "rgba(59, 130, 246, 0.2)"
                    : "rgba(245, 158, 11, 0.15)",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 12,
                }}
              >
                {isDark ? (
                  <MoonIcon size={22} color={colors.primary} strokeWidth={2.2} />
                ) : (
                  <SunIcon size={22} color={colors.warning} strokeWidth={2.2} />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: "900", color: colors.textPrimary }}>
                  Dark Appearance
                </Text>
                <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>
                  {isDark ? "Obsidian slate theme enabled" : "Clean daylight theme enabled"}
                </Text>
              </View>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: "#d1d5db", true: colors.primary }}
              thumbColor={Platform.OS === "android" ? (isDark ? colors.white : "#f4f3f4") : undefined}
            />
          </View>
        </View>

        {/* Account info */}
        <View
          style={{
            marginTop: 20,
            backgroundColor: colors.surface,
            borderRadius: 18,
            padding: 16,
            borderWidth: 1,
            borderColor: colors.surfaceBorder,
            ...shadows.subtle,
          }}
        >
          <Text
            style={{
              fontSize: 12,
              fontWeight: "900",
              color: colors.textMuted,
              letterSpacing: 0.5,
              marginBottom: 12,
              textTransform: "uppercase",
            }}
          >
            Account
          </Text>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 10 }}>
            <Text style={{ color: colors.textSecondary, fontWeight: "700" }}>Member since</Text>
            <Text style={{ fontWeight: "900", color: colors.textPrimary }}>
              {profile?.createdAt
                ? new Date(profile.createdAt).toLocaleDateString("en-PK", { year: "numeric", month: "short", day: "numeric" })
                : "—"}
            </Text>
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ color: colors.textSecondary, fontWeight: "700" }}>Role</Text>
            <Text style={{ fontWeight: "900", color: colors.textPrimary, textTransform: "capitalize" }}>{role}</Text>
          </View>
        </View>

        {/* Logout */}
        <Pressable
          onPress={onLogout}
          android_ripple={{ color: "rgba(239, 68, 68, 0.15)" }}
          style={({ pressed }) => ({
            marginTop: 20,
            borderWidth: 1,
            borderColor: isDark ? "rgba(239, 68, 68, 0.3)" : "#FECACA",
            backgroundColor: isDark ? "rgba(239, 68, 68, 0.15)" : colors.dangerLight,
            borderRadius: radii.md,
            padding: 16,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            opacity: pressed ? 0.9 : 1,
            transform: [{ scale: pressed ? 0.98 : 1 }],
            overflow: "hidden",
            ...shadows.subtle,
          })}
        >
          <LogoutIcon size={18} color={colors.danger} strokeWidth={2.2} />
          <Text style={{ fontWeight: "800", color: colors.danger, marginLeft: 8, fontSize: 14 }}>
            Sign Out
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}


