// src/components/common/StatCard.js
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, radii, shadows } from "../../theme";

export default function StatCard({ label, value, hint, icon, color = colors.primary }) {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.label}>{label}</Text>
        {icon ? (
          <View style={[styles.iconWrap, { backgroundColor: `${color}15` }]}>
            {icon}
          </View>
        ) : null}
      </View>

      <Text style={[styles.value, { color }]}>{value}</Text>

      {!!hint && <Text style={styles.hint}>{hint}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: 16,
    ...shadows.subtle,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  label: {
    color: colors.textMuted,
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
    color: colors.textSecondary,
    fontWeight: "600",
    fontSize: 12,
  },
});
