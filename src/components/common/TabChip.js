// src/components/common/TabChip.js
import React from "react";
import { Pressable, Text, StyleSheet, View } from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { radii } from "../../theme";

export default function TabChip({ label, active, onPress, icon }) {
  const { colors, shadows } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      android_ripple={{
        color: active ? "rgba(255,255,255,0.2)" : "rgba(13, 110, 253, 0.08)",
      }}
      style={({ pressed }) => [
        styles.chip,
        active
          ? { backgroundColor: colors.primary, borderColor: colors.primaryDark, ...shadows.subtle }
          : { backgroundColor: colors.surface, borderColor: colors.surfaceBorder },
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.row}>
        {icon ? <View style={styles.iconWrap}>{icon}</View> : null}
        <Text style={[styles.text, { color: active ? colors.white : colors.textPrimary }]}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radii.full,
    borderWidth: 1,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.9,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconWrap: {
    marginRight: 6,
  },
  text: {
    fontWeight: "800",
    fontSize: 13,
  },
});

