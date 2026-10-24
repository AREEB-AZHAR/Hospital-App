// src/components/common/StatCard.js
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { radii } from "../../theme";

export default function StatCard({ label, value, hint, icon, color }) {
  const { colors, shadows } = useTheme();
  const activeColor = color || colors.primary;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.surfaceBorder,
          ...shadows.subtle,
        },
      ]}
    >
      <View style={styles.headerRow}>
        <Text style={[styles.label, { color: colors.textMuted }]}>{label}</Text>
        {icon ? (
          <View style={[styles.iconWrap, { backgroundColor: `${activeColor}20` }]}>
            {icon}
          </View>
        ) : null}
      </View>

      <Text style={[styles.value, { color: activeColor }]}>{value}</Text>

      {!!hint && <Text style={[styles.hint, { color: colors.textSecondary }]}>{hint}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  label: {
    fontWeight: "700",
    fontSize: 13,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: radii.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  value: {
    marginTop: 8,
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  hint: {
    marginTop: 4,
    fontWeight: "600",
    fontSize: 12,
  },
});

