// src/screens/auth/SignupDetailsScreen.js
import React, { useContext, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ImageBackground,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { AuthContext } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { colors, radii, shadows } from "../../theme";
import {
  HospitalBuildingIcon,
  ChevronLeftIcon,
  UserIcon,
} from "../../components/icons";

export default function SignupDetailsScreen({ navigation }) {
  const { signup } = useContext(AuthContext);
  const { colors: themeColors, isDark, shadows: themeShadows } = useTheme();

  const [name, setName] = useState("");
  const [id, setId] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const trimmedName = name.trim();
    const trimmedId = id.trim();
    const trimmedPhone = phone.trim();
    const trimmedEmail = email.trim();
    const trimmedPass = password.trim();

    if (!trimmedName || !trimmedId || !trimmedPhone || !trimmedEmail || !trimmedPass) {
      return "All fields are required";
    }
    if (!/^[A-Za-z ]+$/.test(trimmedName)) {
      return "Full name must contain alphabets only";
    }
    if (!/^[0-9]+$/.test(trimmedId)) {
      return "Hospital ID must be numeric";
    }
    if (!/^[0-9]+$/.test(trimmedPhone)) {
      return "Phone number must be numeric";
    }
    if (!/^[^@\s]+@[^@\s]+\.com$/.test(trimmedEmail)) {
      return "Email must end with .com";
    }
    if (trimmedPass.length < 6) {
      return "Password must be at least 6 characters";
    }
    return null;
  };

  const onSignup = async () => {
    setMsg("");

    const err = validate();
    if (err) {
      setMsg(err);
      return;
    }

    try {
      setLoading(true);
      const res = await signup({
        id: id.trim(),
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        password: password.trim(),
        role: "patient",
      });

      if (!res.ok) {
        setMsg(res.message || "Failed to create account");
        return;
      }

      // after signup, go back to login
      navigation.goBack();
    } catch (e) {
      setMsg(e?.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require("../../../assets/hospbg.jpg")}
      style={styles.bgContainer}
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" translucent />
      <View
        style={[
          styles.darkOverlay,
          {
            backgroundColor: isDark
              ? "rgba(11, 15, 25, 0.88)"
              : "rgba(15, 23, 42, 0.65)",
          },
        ]}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.keyboardWrap}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Top Navigation Row */}
            <View style={styles.topNavRow}>
              <Pressable
                onPress={() => navigation.goBack()}
                android_ripple={{ color: "rgba(255,255,255,0.2)" }}
                style={styles.backBtn}
                accessibilityLabel="Go back to login"
              >
                <ChevronLeftIcon size={20} color={colors.white} strokeWidth={2.4} />
              </Pressable>

              <View style={styles.topBrandWrap}>
                <HospitalBuildingIcon size={18} color={colors.white} strokeWidth={2.2} />
                <Text style={styles.topBrandText}>City Care Hospital</Text>
              </View>

              <View style={{ width: 40 }} />
            </View>

            {/* Registration Card */}
            <View
              style={[
                styles.card,
                {
                  backgroundColor: isDark ? themeColors.surface : themeColors.surfaceGlass,
                  borderColor: isDark
                    ? themeColors.surfaceBorder
                    : "rgba(255, 255, 255, 0.85)",
                  ...themeShadows.card,
                },
              ]}
            >
              <View style={styles.cardHeader}>
                <View
                  style={[
                    styles.avatarBadge,
                    { backgroundColor: themeColors.primaryLight },
                  ]}
                >
                  <UserIcon size={22} color={themeColors.primary} strokeWidth={2.2} />
                </View>
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={[styles.cardTitle, { color: themeColors.textPrimary }]}>
                    Create Account
                  </Text>
                  <Text style={[styles.cardSub, { color: themeColors.textMuted }]}>
                    Patient registration for bookings & consults
                  </Text>
                </View>
              </View>

              {msg ? (
                <View
                  style={[
                    styles.errorBox,
                    {
                      backgroundColor: isDark
                        ? "rgba(239, 68, 68, 0.15)"
                        : "#FEF2F2",
                      borderColor: isDark
                        ? "rgba(239, 68, 68, 0.3)"
                        : "#FECACA",
                    },
                  ]}
                >
                  <Text style={[styles.errorText, { color: themeColors.danger }]}>
                    {msg}
                  </Text>
                </View>
              ) : null}

              {/* Form Fields */}
              <View style={styles.inputWrap}>
                <Text style={[styles.inputLabel, { color: themeColors.textMuted }]}>
                  FULL NAME
                </Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="e.g. Alex Morgan"
                  placeholderTextColor={themeColors.textLight || themeColors.textMuted}
                  style={[
                    styles.inputField,
                    {
                      backgroundColor: isDark
                        ? themeColors.surfaceSubtle
                        : themeColors.surface,
                      borderColor: themeColors.surfaceBorder,
                      color: themeColors.textPrimary,
                    },
                  ]}
                />
              </View>

              <View style={styles.inputWrap}>
                <Text style={[styles.inputLabel, { color: themeColors.textMuted }]}>
                  HOSPITAL ID (NUMERIC)
                </Text>
                <TextInput
                  value={id}
                  onChangeText={setId}
                  placeholder="e.g. 10042"
                  placeholderTextColor={themeColors.textLight || themeColors.textMuted}
                  keyboardType="numeric"
                  style={[
                    styles.inputField,
                    {
                      backgroundColor: isDark
                        ? themeColors.surfaceSubtle
                        : themeColors.surface,
                      borderColor: themeColors.surfaceBorder,
                      color: themeColors.textPrimary,
                    },
                  ]}
                />
              </View>

              <View style={styles.inputWrap}>
                <Text style={[styles.inputLabel, { color: themeColors.textMuted }]}>
                  PHONE NUMBER
                </Text>
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="e.g. 03001234567"
                  placeholderTextColor={themeColors.textLight || themeColors.textMuted}
                  keyboardType="phone-pad"
                  style={[
                    styles.inputField,
                    {
                      backgroundColor: isDark
                        ? themeColors.surfaceSubtle
                        : themeColors.surface,
                      borderColor: themeColors.surfaceBorder,
                      color: themeColors.textPrimary,
                    },
                  ]}
                />
              </View>

              <View style={styles.inputWrap}>
                <Text style={[styles.inputLabel, { color: themeColors.textMuted }]}>
                  EMAIL ADDRESS
                </Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="e.g. alex@example.com"
                  placeholderTextColor={themeColors.textLight || themeColors.textMuted}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  style={[
                    styles.inputField,
                    {
                      backgroundColor: isDark
                        ? themeColors.surfaceSubtle
                        : themeColors.surface,
                      borderColor: themeColors.surfaceBorder,
                      color: themeColors.textPrimary,
                    },
                  ]}
                />
              </View>

              <View style={styles.inputWrap}>
                <Text style={[styles.inputLabel, { color: themeColors.textMuted }]}>
                  PASSWORD (MIN 6 CHARACTERS)
                </Text>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Create secure password"
                  placeholderTextColor={themeColors.textLight || themeColors.textMuted}
                  secureTextEntry
                  style={[
                    styles.inputField,
                    {
                      backgroundColor: isDark
                        ? themeColors.surfaceSubtle
                        : themeColors.surface,
                      borderColor: themeColors.surfaceBorder,
                      color: themeColors.textPrimary,
                    },
                  ]}
                />
              </View>

              {/* Submit Button */}
              <Pressable
                onPress={onSignup}
                disabled={loading}
                android_ripple={{ color: "rgba(255,255,255,0.2)" }}
                style={({ pressed }) => [
                  styles.primaryBtn,
                  {
                    backgroundColor: themeColors.primary,
                    ...themeShadows.subtle,
                  },
                  pressed && styles.btnPressed,
                  loading && { opacity: 0.75 },
                ]}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <Text style={styles.primaryBtnText}>Create Patient Account</Text>
                )}
              </Pressable>

              {/* Footer */}
              <View style={styles.footerRow}>
                <Text
                  style={[
                    styles.footerPrompt,
                    { color: themeColors.textSecondary },
                  ]}
                >
                  Already registered?
                </Text>
                <Pressable onPress={() => navigation.goBack()}>
                  <Text style={[styles.signInLink, { color: themeColors.primary }]}>
                    {" "}Sign In
                  </Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bgContainer: {
    flex: 1,
  },
  darkOverlay: {
    flex: 1,
    paddingHorizontal: 16,
  },
  keyboardWrap: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingTop: Platform.OS === "ios" ? 54 : 36,
    paddingBottom: 40,
  },
  topNavRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    backgroundColor: "rgba(15, 23, 42, 0.65)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  topBrandWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(15, 23, 42, 0.65)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  topBrandText: {
    color: colors.white,
    fontWeight: "800",
    fontSize: 13,
    marginLeft: 8,
  },
  card: {
    borderRadius: radii.xl,
    padding: 22,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  avatarBadge: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: -0.3,
  },
  cardSub: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  errorBox: {
    marginTop: 12,
    padding: 10,
    borderRadius: radii.md,
    borderWidth: 1,
  },
  errorText: {
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
  },
  inputWrap: {
    marginTop: 14,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  inputField: {
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 12 : 10,
    fontSize: 14,
    fontWeight: "500",
  },
  primaryBtn: {
    borderRadius: radii.md,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  primaryBtnText: {
    color: colors.white,
    fontWeight: "900",
    fontSize: 15,
  },
  btnPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.95,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
  },
  footerPrompt: {
    fontSize: 13,
  },
  signInLink: {
    fontSize: 13,
    fontWeight: "800",
  },
});

