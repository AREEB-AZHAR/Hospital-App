// src/components/common/SoftButton.js
import React from "react";
import { Pressable, Text, StyleSheet, View, ActivityIndicator } from "react-native";
import { colors, radii, shadows } from "../../theme";

export default function SoftButton({
  text,
  onPress,
  danger,
  primary,
  disabled,
  loading,
  icon,
  full = true,
  style,
}) {
  return (
    <Pressable
      onPress={disabled || loading ? undefined : onPress}
      android_ripple={{
        color: primary
          ? "rgba(255,255,255,0.2)"
          : danger
          ? "rgba(239, 68, 68, 0.15)"
          : "rgba(13, 110, 253, 0.1)",
      }}
      style={({ pressed }) => [
        styles.button,
        full && styles.full,
        primary
          ? styles.primaryBtn
          : danger
          ? styles.dangerBtn
          : styles.defaultBtn,
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={primary ? colors.white : danger ? colors.danger : colors.primary}
        />
      ) : (
        <View style={styles.contentRow}>
          {icon ? <View style={styles.iconMargin}>{icon}</View> : null}
          <Text
            style={[
              styles.text,
              primary
                ? styles.primaryText
                : danger
                ? styles.dangerText
                : styles.defaultText,
            ]}
          >
            {text}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "transparent",
    ...shadows.subtle,
  },
  full: {
    flex: 1,
  },
  defaultBtn: {
    backgroundColor: colors.surface,
    borderColor: colors.surfaceBorder,
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryDark,
  },
  dangerBtn: {
    backgroundColor: colors.dangerLight,
    borderColor: "#FECACA",
  },
  pressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.92,
  },
  disabled: {
    opacity: 0.5,
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  iconMargin: {
    marginRight: 8,
  },
  text: {
    fontWeight: "800",
    fontSize: 14,
  },
  defaultText: {
    color: colors.textPrimary,
  },
  primaryText: {
    color: colors.white,
  },
  dangerText: {
    color: colors.danger,
  },
});
