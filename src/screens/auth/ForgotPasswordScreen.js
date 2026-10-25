import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { authApi } from "../../services/api";
import { useTheme } from "../../context/ThemeContext";
import { colors, radii, shadows } from "../../theme";

export default function ForgotPasswordScreen({ navigation }) {
  const { colors: themeColors, isDark, shadows: themeShadows } = useTheme();
  const [step, setStep] = useState(1); // 1 = enter phone, 2 = enter otp & new password
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleSendCode = async () => {
    setMsg("");
    const cleanPhone = phone.trim();
    if (!cleanPhone) {
      setMsg("Please enter your registered phone number");
      return;
    }

    try {
      setLoading(true);
      const res = await authApi.forgotPassword(cleanPhone);
      setStep(2);
      if (res?.devOtp) {
        setOtp(res.devOtp);
        Alert.alert(
          "Code Sent (Dev Mode)",
          `Your 6-digit reset code is: ${res.devOtp}`
        );
      } else {
        Alert.alert(
          "Code Sent",
          "If an account is associated with this phone, a 6-digit code has been sent."
        );
      }
    } catch (err) {
      setMsg(err?.message || "Failed to send reset code");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setMsg("");
    const cleanPhone = phone.trim();
    const cleanOtp = otp.trim();
    const cleanPass = newPassword.trim();

    if (!cleanOtp) {
      setMsg("Please enter the 6-digit code");
      return;
    }
    if (!cleanPass) {
      setMsg("Please enter your new password");
      return;
    }
    if (cleanPass.length < 6) {
      setMsg("Password must be at least 6 characters");
      return;
    }
    if (cleanPass !== confirmPassword.trim()) {
      setMsg("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      await authApi.resetPassword({
        phone: cleanPhone,
        otp: cleanOtp,
        newPassword: cleanPass,
      });

      Alert.alert(
        "Password Reset Successful",
        "Your password has been updated. Please log in with your new credentials.",
        [{ text: "OK", onPress: () => navigation.navigate("Auth") }]
      );
    } catch (err) {
      setMsg(err?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1, backgroundColor: themeColors.background }}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          padding: 24,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={{
            backgroundColor: themeColors.surface,
            borderRadius: 24,
            padding: 24,
            borderWidth: 1,
            borderColor: themeColors.surfaceBorder,
            ...themeShadows.card,
          }}
        >
          <Text style={{ fontSize: 26, fontWeight: "900", color: themeColors.textPrimary }}>
            {step === 1 ? "Forgot Password" : "Enter Reset Code"}
          </Text>

          <Text style={{ marginTop: 8, color: themeColors.textMuted, fontSize: 14, lineHeight: 20 }}>
            {step === 1
              ? "Enter your registered phone number to receive a 6-digit recovery code."
              : `Enter the 6-digit code sent to ${phone} and choose a new password.`}
          </Text>

          {msg ? (
            <View
              style={{
                marginTop: 14,
                backgroundColor: isDark ? "rgba(239, 68, 68, 0.15)" : "#FEF2F2",
                borderWidth: 1,
                borderColor: isDark ? "rgba(239, 68, 68, 0.3)" : "#FECACA",
                padding: 12,
                borderRadius: 12,
              }}
            >
              <Text style={{ color: themeColors.danger, fontWeight: "700", fontSize: 13 }}>
                {msg}
              </Text>
            </View>
          ) : null}

          {step === 1 ? (
            <View style={{ marginTop: 20, gap: 14 }}>
              <View>
                <Text style={{ fontSize: 13, fontWeight: "800", color: themeColors.textSecondary, marginBottom: 6 }}>
                  Phone Number
                </Text>
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="e.g. 03001234567"
                  placeholderTextColor={themeColors.textLight || themeColors.textMuted}
                  keyboardType="phone-pad"
                  autoFocus
                  style={{
                    backgroundColor: isDark ? themeColors.surfaceSubtle : "#F8FAFC",
                    borderWidth: 1,
                    borderColor: themeColors.surfaceBorder,
                    borderRadius: 14,
                    padding: 14,
                    fontSize: 16,
                    color: themeColors.textPrimary,
                  }}
                />
              </View>

              <Pressable
                onPress={handleSendCode}
                disabled={loading}
                style={({ pressed }) => ({
                  backgroundColor: themeColors.primary,
                  padding: 16,
                  borderRadius: 14,
                  alignItems: "center",
                  marginTop: 6,
                  opacity: loading ? 0.7 : pressed ? 0.9 : 1,
                  ...themeShadows.subtle,
                })}
              >
                {loading ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={{ color: colors.white, fontWeight: "800", fontSize: 16 }}>
                    Send Reset Code
                  </Text>
                )}
              </Pressable>
            </View>
          ) : (
            <View style={{ marginTop: 20, gap: 14 }}>
              <View>
                <Text style={{ fontSize: 13, fontWeight: "800", color: themeColors.textSecondary, marginBottom: 6 }}>
                  6-Digit Recovery Code
                </Text>
                <TextInput
                  value={otp}
                  onChangeText={setOtp}
                  placeholder="123456"
                  placeholderTextColor={themeColors.textLight || themeColors.textMuted}
                  keyboardType="number-pad"
                  maxLength={6}
                  autoFocus
                  style={{
                    backgroundColor: isDark ? themeColors.surfaceSubtle : "#F8FAFC",
                    borderWidth: 1,
                    borderColor: themeColors.surfaceBorder,
                    borderRadius: 14,
                    padding: 14,
                    fontSize: 20,
                    fontWeight: "900",
                    textAlign: "center",
                    letterSpacing: 4,
                    color: themeColors.textPrimary,
                  }}
                />
              </View>

              <View>
                <Text style={{ fontSize: 13, fontWeight: "800", color: themeColors.textSecondary, marginBottom: 6 }}>
                  New Password
                </Text>
                <TextInput
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="Minimum 6 characters"
                  placeholderTextColor={themeColors.textLight || themeColors.textMuted}
                  secureTextEntry
                  style={{
                    backgroundColor: isDark ? themeColors.surfaceSubtle : "#F8FAFC",
                    borderWidth: 1,
                    borderColor: themeColors.surfaceBorder,
                    borderRadius: 14,
                    padding: 14,
                    fontSize: 16,
                    color: themeColors.textPrimary,
                  }}
                />
              </View>

              <View>
                <Text style={{ fontSize: 13, fontWeight: "800", color: themeColors.textSecondary, marginBottom: 6 }}>
                  Confirm Password
                </Text>
                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Re-enter new password"
                  placeholderTextColor={themeColors.textLight || themeColors.textMuted}
                  secureTextEntry
                  style={{
                    backgroundColor: isDark ? themeColors.surfaceSubtle : "#F8FAFC",
                    borderWidth: 1,
                    borderColor: themeColors.surfaceBorder,
                    borderRadius: 14,
                    padding: 14,
                    fontSize: 16,
                    color: themeColors.textPrimary,
                  }}
                />
              </View>

              <Pressable
                onPress={handleResetPassword}
                disabled={loading}
                style={({ pressed }) => ({
                  backgroundColor: themeColors.primary,
                  padding: 16,
                  borderRadius: 14,
                  alignItems: "center",
                  marginTop: 6,
                  opacity: loading ? 0.7 : pressed ? 0.9 : 1,
                  ...themeShadows.subtle,
                })}
              >
                {loading ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={{ color: colors.white, fontWeight: "800", fontSize: 16 }}>
                    Reset Password
                  </Text>
                )}
              </Pressable>

              <Pressable
                onPress={() => {
                  setStep(1);
                  setOtp("");
                }}
                style={{ alignItems: "center", paddingVertical: 8 }}
              >
                <Text style={{ color: themeColors.textMuted, fontWeight: "700", fontSize: 13 }}>
                  Change phone number or Resend code
                </Text>
              </Pressable>
            </View>
          )}

          <Pressable
            onPress={() => navigation.goBack()}
            style={{ marginTop: 18, alignItems: "center", paddingVertical: 8 }}
          >
            <Text style={{ color: themeColors.primary, fontWeight: "800", fontSize: 14 }}>
              ← Back to Login
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
