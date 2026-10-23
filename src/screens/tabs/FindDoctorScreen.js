// src/screens/tabs/FindDoctorScreen.js
import React, { useMemo, useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  ImageBackground,
  StyleSheet,
  StatusBar,
} from "react-native";
import { api } from "../../services/api";
import { colors, radii, shadows } from "../../theme";
import {
  SearchIcon,
  StethoscopeIcon,
  CalendarIcon,
  StarFilledIcon,
  ClockIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  ChevronRightIcon,
} from "../../components/icons";

function DoctorCard({ doc, onBook, onDetail }) {
  return (
    <Pressable
      onPress={onDetail}
      android_ripple={{ color: "rgba(13, 110, 253, 0.08)" }}
      style={({ pressed }) => [
        styles.docCard,
        pressed && styles.cardPressed,
      ]}
    >
      <View style={styles.cardHeader}>
        <View style={styles.avatarWrap}>
          <Text style={styles.avatarText}>
            {(doc.name || "D")[0].toUpperCase()}
          </Text>
        </View>

        <View style={styles.headerInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.docName}>{doc.name}</Text>
            <View style={{ marginLeft: 6 }}>
              <ShieldCheckIcon size={16} color={colors.accent} />
            </View>
          </View>
          <Text style={styles.docDept}>{doc.department}</Text>
        </View>

        <View style={styles.ratingBadge}>
          <StarFilledIcon size={12} color={colors.warning} />
          <Text style={styles.ratingText}>{doc.rating || 4.8}</Text>
        </View>
      </View>

      {/* Metrics Row */}
      <View style={styles.metricsRow}>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>EXPERIENCE</Text>
          <Text style={styles.metricValue}>{doc.experience || 5} yrs</Text>
        </View>

        <View style={styles.metricDivider} />

        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>CONSULT FEE</Text>
          <Text style={styles.metricValue}>Rs {doc.fee || 1500}</Text>
        </View>

        <View style={styles.metricDivider} />

        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>PATIENTS</Text>
          <Text style={styles.metricValue}>500+</Text>
        </View>
      </View>

      {/* Availability & Book Row */}
      <View style={styles.footerRow}>
        <View style={styles.availRow}>
          <ClockIcon size={14} color={colors.textMuted} strokeWidth={2} />
          <Text style={styles.availText}>{doc.availability}</Text>
        </View>

        <Pressable
          onPress={onBook}
          android_ripple={{ color: "rgba(255, 255, 255, 0.2)" }}
          style={({ pressed }) => [
            styles.bookBtn,
            pressed && { opacity: 0.85 },
          ]}
        >
          <CalendarIcon size={14} color={colors.white} strokeWidth={2.2} />
          <Text style={styles.bookBtnText}>Book Visit</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

export default function FindDoctorScreen({ navigation, route }) {
  const selectedDept = route?.params?.department || "";
  const [q, setQ] = useState("");
  const [dept, setDept] = useState(selectedDept);
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const list = await api.get("/users/doctors");

        if (!mounted) return;

        setDoctors(
          list.map((d) => ({
            ...d,
            id: d.id || d._id,
            department: d.department || "General",
            rating: d.rating || 4.8,
            experience: d.experience || 6,
            fee: d.fee || 1500,
            availability: d.availability || "09:00 AM - 05:00 PM",
          }))
        );
      } catch (e) {
        console.log("Failed to load doctors", e?.message);
        setDoctors([]);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const list = useMemo(() => {
    const query = q.trim().toLowerCase();
    const dep = dept.trim().toLowerCase();

    return doctors.filter((d) => {
      const matchesSearch =
        !query ||
        d.name.toLowerCase().includes(query) ||
        d.department.toLowerCase().includes(query);

      const matchesDept = !dep || d.department.toLowerCase() === dep;
      return matchesSearch && matchesDept;
    });
  }, [q, dept, doctors]);

  return (
    <ImageBackground
      source={require("../../../assets/finddoctor.jpg")}
      style={styles.bgContainer}
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" translucent />
      <View style={styles.overlay}>
        {/* Search header */}
        <View style={styles.searchWrap}>
          <SearchIcon size={18} color={colors.textMuted} strokeWidth={2} />
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="Search by doctor or specialty…"
            placeholderTextColor={colors.textLight}
            style={styles.searchInput}
          />
          {q ? (
            <Pressable onPress={() => setQ("")}>
              <Text style={styles.clearBtnText}>✕</Text>
            </Pressable>
          ) : null}
        </View>

        {dept ? (
          <View style={styles.activeFilterRow}>
            <Text style={styles.filterText}>Filtering: {dept}</Text>
            <Pressable onPress={() => setDept("")}>
              <Text style={styles.clearFilterText}>Clear</Text>
            </Pressable>
          </View>
        ) : null}

        <FlatList
          style={{ marginTop: 12 }}
          contentContainerStyle={{ paddingBottom: 120 }}
          data={list}
          keyExtractor={(item) => String(item.id || item._id)}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <StethoscopeIcon size={36} color={colors.primary} />
              <Text style={styles.emptyTitle}>No Doctors Found</Text>
              <Text style={styles.emptySub}>
                Try adjusting your search criteria or clear the department filter.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <DoctorCard
              doc={item}
              onDetail={() =>
                navigation.navigate("DoctorDetail", {
                  doctorId: item.id || item._id,
                })
              }
              onBook={() =>
                navigation.navigate("Book", {
                  doctorId: item.id || item._id,
                  doctorName: item.name,
                  department: item.department,
                })
              }
            />
          )}
        />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bgContainer: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    padding: 16,
  },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceGlass,
    borderRadius: radii.lg,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.6)",
    ...shadows.subtle,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: "500",
  },
  clearBtnText: {
    fontSize: 14,
    color: colors.textMuted,
    paddingHorizontal: 6,
  },
  activeFilterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.full,
    marginTop: 10,
  },
  filterText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primaryDark,
  },
  clearFilterText: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.danger,
  },
  docCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    ...shadows.card,
  },
  cardPressed: {
    transform: [{ scale: 0.99 }],
    opacity: 0.96,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarWrap: {
    width: 48,
    height: 48,
    borderRadius: radii.full,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "900",
    color: colors.primary,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  docName: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  docDept: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
    fontWeight: "500",
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.warningLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.textPrimary,
    marginLeft: 4,
  },
  metricsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radii.md,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginTop: 14,
  },
  metricItem: {
    alignItems: "center",
    flex: 1,
  },
  metricDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.surfaceBorder,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.textPrimary,
    marginTop: 2,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorder,
  },
  availRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  availText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 6,
    fontWeight: "500",
  },
  bookBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radii.md,
    ...shadows.subtle,
  },
  bookBtnText: {
    color: colors.white,
    fontWeight: "800",
    fontSize: 13,
    marginLeft: 6,
  },
  emptyBox: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: 30,
    alignItems: "center",
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.textPrimary,
    marginTop: 10,
  },
  emptySub: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: 4,
    lineHeight: 18,
  },
});
