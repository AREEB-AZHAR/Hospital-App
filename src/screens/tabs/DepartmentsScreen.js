// src/screens/tabs/DepartmentsScreen.js
import React, { useMemo, useState } from "react";
import { View, Text, TextInput, Pressable, FlatList, StyleSheet } from "react-native";
import { dummyDepartments } from "../../data/dummyDepartments";
import { colors, radii, shadows } from "../../theme";
import { HospitalBuildingIcon, ChevronRightIcon, SearchIcon } from "../../components/icons";

function DeptCard({ name, desc, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: "rgba(13, 110, 253, 0.08)" }}
      style={({ pressed }) => [
        styles.deptCard,
        pressed && styles.cardPressed,
      ]}
    >
      <View style={styles.cardHeader}>
        <View style={styles.iconWrap}>
          <HospitalBuildingIcon size={22} color={colors.primary} strokeWidth={2} />
        </View>

        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.deptName}>{name}</Text>
          <Text style={styles.deptDesc}>{desc}</Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.viewDocText}>View specialist doctors</Text>
        <ChevronRightIcon size={16} color={colors.primary} />
      </View>
    </Pressable>
  );
}

export default function DepartmentsScreen({ navigation }) {
  const [q, setQ] = useState("");

  const data = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return dummyDepartments;
    return dummyDepartments.filter((d) => d.name.toLowerCase().includes(query));
  }, [q]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Clinical Departments</Text>
      <Text style={styles.subtitle}>Select a department to browse available doctors</Text>

      <View style={styles.searchBar}>
        <SearchIcon size={18} color={colors.textMuted} strokeWidth={2} />
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Search clinical departments…"
          placeholderTextColor={colors.textLight}
          style={styles.searchInput}
        />
        {q ? (
          <Pressable onPress={() => setQ("")}>
            <Text style={{ fontSize: 14, color: colors.textMuted, paddingHorizontal: 6 }}>✕</Text>
          </Pressable>
        ) : null}
      </View>

      <FlatList
        style={{ marginTop: 14 }}
        contentContainerStyle={{ paddingBottom: 120 }}
        data={data}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        renderItem={({ item }) => (
          <DeptCard
            name={item.name}
            desc={item.desc}
            onPress={() => navigation.navigate("Find Doctor", { department: item.name })}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "900",
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
    color: colors.textMuted,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    paddingHorizontal: 14,
    paddingVertical: 10,
    ...shadows.subtle,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: "500",
  },
  deptCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    ...shadows.subtle,
  },
  cardPressed: {
    transform: [{ scale: 0.99 }],
    opacity: 0.95,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  deptName: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  deptDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 3,
    lineHeight: 18,
  },
  cardFooter: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorder,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  viewDocText: {
    fontWeight: "800",
    fontSize: 13,
    color: colors.primary,
  },
});
