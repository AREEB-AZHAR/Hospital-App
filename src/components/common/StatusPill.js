// src/components/common/StatusPill.js
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { radii } from "../../theme";

export default function StatusPill({ status }) {
  const s = String(status || "pending").toLowerCase();

  const getStyle = () => {
    switch (s) {
      case "arrived":
      case "checked-in":
        return { bg: "#ECFDF5", border: "#A7F3D0", dot: "#10B981", text: "#065F46" };
      case "done":
      case "completed":
        return { bg: "#EFF6FF", border: "#BFDBFE", dot: "#3B82F6", text: "#1E40AF" };
      case "upcoming":
      case "confirmed":
        return { bg: "#F0FDF4", border: "#BBF7D0", dot: "#16A34A", text: "#15803D" };
      case "cancelled":
        return { bg: "#FEF2F2", border: "#FECACA", dot: "#EF4444", text: "#991B1B" };
      case "rescheduled":
        return { bg: "#FFFBEB", border: "#FDE68A", dot: "#F59E0B", text: "#92400E" };
      default: // pending
        return { bg: "#FFF7ED", border: "#FED7AA", dot: "#F97316", text: "#9A3412" };
    }
  };

  const current = getStyle();

  return (
    <View style={[styles.pill, { backgroundColor: current.bg, borderColor: current.border }]}>
      <View style={[styles.dot, { backgroundColor: current.dot }]} />
      <Text style={[styles.text, { color: current.text }]}>
        {s.toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.full,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  text: {
    fontWeight: "800",
    fontSize: 11,
    letterSpacing: 0.4,
  },
});
