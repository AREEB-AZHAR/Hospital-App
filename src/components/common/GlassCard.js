// src/components/common/GlassCard.js
import React from "react";
import { View, StyleSheet } from "react-native";
import { colors, radii, shadows } from "../../theme";

export default function GlassCard({ children, style, subtle = false, ...props }) {
  return (
    <View
      style={[
        styles.card,
        subtle ? styles.cardSubtle : styles.cardDefault,
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.lg,
    padding: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  cardDefault: {
    backgroundColor: colors.surfaceGlass,
    borderColor: "rgba(226, 232, 240, 0.8)",
    ...shadows.card,
  },
  cardSubtle: {
    backgroundColor: colors.surface,
    borderColor: colors.surfaceBorder,
    ...shadows.subtle,
  },
});
