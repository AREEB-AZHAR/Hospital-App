// src/screens/auth/AuthScreen.js
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
} from "react-native";
import { AuthContext } from "../../context/AuthContext";
import { colors, radii, shadows } from "../../theme";
import { HospitalBuildingIcon, EmergencyCrossIcon } from "../../components/icons";

export default function AuthScreen({ navigation }) {
  const { login } = useContext(AuthContext);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    setMsg("");

    if (!phone.trim() || !password.trim()) {
      setMsg("Phone number and password are required");
      return;
    }

    try {
      setLoading(true);
      const res = await login(phone.trim(), password.trim());
      if (!res.ok) {
        setMsg(res.message || "Invalid phone or password");
      }
    } catch (e) {
      setMsg(e?.message || "Login failed. Please check network connection.");
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
      <View style={styles.darkOverlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.contentWrap}
        >
          {/* Header Brand */}
          <View style={styles.brandHeader}>
            <View style={styles.iconCircle}>
              <HospitalBuildingIcon size={32} color={colors.white} strokeWidth={2.2} />
            </View>
            <Text style={styles.brandTitle}>City Care Hospital</Text>
            <Text style={styles.brandSub}>
              Healthcare Management & Telemedicine Portal
            </Text>
          </View>

          {/* Login Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Welcome Back</Text>
            <Text style={styles.cardSub}>Sign in to access your consultations</Text>

            <View style={styles.inputWrap}>
              <Text style={styles.inputLabel}>PHONE NUMBER</Text>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="Enter registered phone"
                placeholderTextColor={colors.textLight}
                keyboardType="phone-pad"
                style={styles.inputField}
              />
            </View>

            <View style={[styles.inputWrap, { marginTop: 12 }]}>
              <Text style={styles.inputLabel}>PASSWORD</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                placeholderTextColor={colors.textLight}
                secureTextEntry
                style={styles.inputField}
              />
            </View>

            <Pressable
              onPress={() => navigation.navigate("ForgotPassword")}
              style={styles.forgotBtn}
            >
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </Pressable>

            {msg ? <Text style={styles.errorText}>{msg}</Text> : null}

            <Pressable
              onPress={onLogin}
              disabled={loading}
              android_ripple={{ color: "rgba(255,255,255,0.2)" }}
              style={({ pressed }) => [
                styles.primaryBtn,
                pressed && styles.btnPressed,
                loading && { opacity: 0.7 },
              ]}
            >
              {loading ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Text style={styles.primaryBtnText}>Sign In</Text>
              )}
            </Pressable>

            <View style={styles.footerRow}>
              <Text style={styles.footerPrompt}>Don't have an account?</Text>
              <Pressable onPress={() => navigation.navigate("SignupDetails")}>
                <Text style={styles.signUpLink}> Create Account</Text>
              </Pressable>
            </View>

            {/* Quick Demo Fill Buttons */}
            <View style={{ flexDirection: "row", justifyContent: "center", gap: 10, marginTop: 14 }}>
              <Pressable
                onPress={() => {
                  setPhone("03001234567");
                  setPassword("123456");
                }}
                style={{
                  backgroundColor: "rgba(14, 165, 233, 0.12)",
                  borderWidth: 1,
                  borderColor: "rgba(14, 165, 233, 0.3)",
                  borderRadius: 8,
                  paddingVertical: 6,
                  paddingHorizontal: 10,
                }}
              >
                <Text style={{ fontSize: 11, fontWeight: "700", color: colors.secondary }}>
                  Fill Demo Patient
                </Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setPhone("03001112233");
                  setPassword("123456");
                }}
                style={{
                  backgroundColor: "rgba(16, 185, 129, 0.12)",
                  borderWidth: 1,
                  borderColor: "rgba(16, 185, 129, 0.3)",
                  borderRadius: 8,
                  paddingVertical: 6,
                  paddingHorizontal: 10,
                }}
              >
                <Text style={{ fontSize: 11, fontWeight: "700", color: "#10b981" }}>
                  Fill Demo Doctor
                </Text>
              </Pressable>
            </View>
          </View>
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
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "center",
    padding: 20,
  },
  contentWrap: {
    width: "100%",
  },
  brandHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: radii.full,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.4)",
    ...shadows.glow(colors.primary),
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: colors.white,
    letterSpacing: -0.3,
  },
  brandSub: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 4,
    textAlign: "center",
  },
  card: {
    backgroundColor: colors.surfaceGlass,
    borderRadius: radii.xl,
    padding: 22,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.8)",
    ...shadows.card,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: colors.textPrimary,
  },
  cardSub: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  inputWrap: {
    marginTop: 16,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  inputField: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: radii.md,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 12 : 10,
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: "500",
  },
  forgotBtn: {
    alignSelf: "flex-end",
    marginTop: 10,
  },
  forgotText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary,
  },
  errorText: {
    color: colors.danger,
    marginTop: 10,
    fontWeight: "700",
    fontSize: 13,
    textAlign: "center",
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    ...shadows.subtle,
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
    color: colors.textSecondary,
  },
  signUpLink: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.primary,
  },
});
