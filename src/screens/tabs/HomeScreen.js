// src/screens/tabs/HomeScreen.js
import React, { useContext, useMemo, useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  ImageBackground,
  Alert,
  StyleSheet,
  StatusBar,
  Platform,
} from "react-native";
import { AuthContext } from "../../context/AuthContext";
import { AppDataContext } from "../../context/AppDataContext";
import { dummyDepartments } from "../../data/dummyDepartments";
import { usersApi, appointmentsApi, chatApi } from "../../services/api";
import { colors, radii, shadows, typography } from "../../theme";
import {
  SearchIcon,
  StethoscopeIcon,
  CalendarIcon,
  ChatBubbleIcon,
  ReportHeartIcon,
  HospitalBuildingIcon,
  ClockIcon,
  StarFilledIcon,
  LogoutIcon,
  ChevronRightIcon,
  ShieldCheckIcon,
  UserIcon,
} from "../../components/icons";
import StatCard from "../../components/common/StatCard";
import SoftButton from "../../components/common/SoftButton";
import StatusPill from "../../components/common/StatusPill";

function getDoctorByName(name, doctors) {
  return doctors.find((d) => d.name === name) || null;
}

function ActionCard({ title, subtitle, icon, iconBg, iconColor, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: "rgba(13, 110, 253, 0.08)" }}
      style={({ pressed }) => [
        styles.actionCard,
        pressed && styles.cardPressed,
      ]}
    >
      <View style={[styles.actionIconWrap, { backgroundColor: iconBg }]}>
        {icon}
      </View>
      <Text style={styles.actionTitle}>{title}</Text>
      <Text style={styles.actionSubtitle} numberOfLines={2}>
        {subtitle}
      </Text>
    </Pressable>
  );
}

function parseDateTime(dateStr, timeStr) {
  if (!dateStr || !timeStr) return new Date(0);

  const [yyyy, mm, dd] = dateStr.split("-").map((n) => parseInt(n, 10));
  const match = String(timeStr).trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return new Date(yyyy, (mm || 1) - 1, dd || 1, 0, 0, 0);

  let h = parseInt(match[1], 10);
  const min = parseInt(match[2], 10);
  const ap = match[3].toUpperCase();

  if (ap === "PM" && h !== 12) h += 12;
  if (ap === "AM" && h === 12) h = 0;

  return new Date(yyyy, (mm || 1) - 1, dd || 1, h, min, 0);
}

export default function HomeScreen({ navigation }) {
  const { user, logout } = useContext(AuthContext);
  const { labReports } = useContext(AppDataContext) || {};

  const [q, setQ] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [recentChats, setRecentChats] = useState([]);
  const query = q.trim().toLowerCase();

  const loadData = useCallback(async () => {
    try {
      const [docsRes, chatsRes] = await Promise.allSettled([
        usersApi.doctors(),
        chatApi.contacts(),
      ]);

      if (docsRes.status === "fulfilled" && Array.isArray(docsRes.value)) {
        setDoctors(docsRes.value);
      }
      if (chatsRes.status === "fulfilled" && Array.isArray(chatsRes.value)) {
        setRecentChats(chatsRes.value.slice(0, 3));
      }

      if (user?.role === "patient") {
        try {
          const appts = await appointmentsApi.myAppointments();
          if (Array.isArray(appts)) {
            setAppointments(appts);
          }
        } catch (e) {
          console.log("Failed to load appointments", e?.message);
        }
      }
    } catch (err) {
      console.log("Failed to load home screen data", err?.message);
    }
  }, [user?.role]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCancelAppointment = useCallback((id) => {
    if (!id) return;
    Alert.alert(
      "Cancel Appointment",
      "Are you sure you want to cancel this appointment?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: async () => {
            try {
              await appointmentsApi.cancel(id);
              setAppointments((prev) =>
                (prev || []).filter((a) => String(a._id || a.id) !== String(id))
              );
              Alert.alert("Success", "Appointment cancelled successfully");
            } catch (err) {
              Alert.alert("Error", err?.message || "Failed to cancel appointment");
            }
          },
        },
      ]
    );
  }, []);

  const upcomingAppointments = useMemo(() => {
    return (appointments || []).filter(
      (a) => (a.status || "upcoming") === "upcoming"
    );
  }, [appointments]);

  const upcomingCount = useMemo(
    () => upcomingAppointments.length,
    [upcomingAppointments]
  );
  const reportCount = useMemo(() => (labReports || []).length, [labReports]);

  const nextAppointment = useMemo(() => {
    if (!upcomingAppointments.length) return null;

    const sorted = [...upcomingAppointments].sort((a, b) => {
      const da = parseDateTime(a.date, a.time).getTime();
      const db = parseDateTime(b.date, b.time).getTime();
      return da - db;
    });

    return sorted[0];
  }, [upcomingAppointments]);

  const matchedDoctors = useMemo(() => {
    if (!query) return [];
    return doctors
      .filter(
        (d) =>
          d.name.toLowerCase().includes(query) ||
          (d.department && d.department.toLowerCase().includes(query))
      )
      .slice(0, 5);
  }, [query, doctors]);

  const matchedDepts = useMemo(() => {
    if (!query) return [];
    return dummyDepartments
      .filter((d) => d.name.toLowerCase().includes(query))
      .slice(0, 5);
  }, [query]);

  const showDropdown =
    query && (matchedDoctors.length > 0 || matchedDepts.length > 0);

  const nextDoc = useMemo(() => {
    if (!nextAppointment?.doctorName) return null;
    return getDoctorByName(nextAppointment.doctorName, doctors);
  }, [nextAppointment, doctors]);

  const roleName = user?.role
    ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
    : "Patient";

  return (
    <ImageBackground
      source={require("../../../assets/home.jpg")}
      style={styles.bgContainer}
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" translucent />
      <View style={styles.darkOverlay}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Bar */}
          <View style={styles.header}>
            <View style={styles.headerUserRow}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarInitial}>
                  {(user?.name || "U")[0].toUpperCase()}
                </Text>
              </View>
              <View style={styles.headerInfo}>
                <View style={styles.greetingRow}>
                  <Text style={styles.greetingText}>
                    Hi, {user?.name || "User"}
                  </Text>
                  <View style={styles.roleBadge}>
                    <Text style={styles.roleBadgeText}>{roleName}</Text>
                  </View>
                </View>
                <Text style={styles.hospitalSub}>City Care Hospital</Text>
              </View>
            </View>

            <Pressable
              onPress={logout}
              android_ripple={{ color: "rgba(255,255,255,0.2)" }}
              style={({ pressed }) => [
                styles.logoutBtn,
                pressed && { opacity: 0.8 },
              ]}
              accessibilityLabel="Logout"
            >
              <LogoutIcon size={18} color={colors.white} strokeWidth={2.2} />
            </Pressable>
          </View>

          {/* Quick Nav Chips */}
          <View style={styles.quickNavRow}>
            <Pressable
              onPress={() => navigation.navigate("Book")}
              style={({ pressed }) => [
                styles.quickChip,
                pressed && styles.cardPressed,
              ]}
            >
              <CalendarIcon size={15} color={colors.primary} strokeWidth={2.2} />
              <Text style={styles.quickChipText}>Book Visit</Text>
            </Pressable>

            <Pressable
              onPress={() => navigation.navigate("Appointments")}
              style={({ pressed }) => [
                styles.quickChip,
                pressed && styles.cardPressed,
              ]}
            >
              <ClockIcon size={15} color={colors.accent} strokeWidth={2.2} />
              <Text style={styles.quickChipText}>My Bookings</Text>
            </Pressable>

            <Pressable
              onPress={() => navigation.navigate("Chat")}
              style={({ pressed }) => [
                styles.quickChip,
                pressed && styles.cardPressed,
              ]}
            >
              <ChatBubbleIcon size={15} color={colors.secondary} strokeWidth={2.2} />
              <Text style={styles.quickChipText}>Chat Support</Text>
            </Pressable>
          </View>

          {/* Search Box */}
          <View style={styles.searchSection}>
            <View style={styles.searchBar}>
              <SearchIcon size={18} color={colors.textMuted} strokeWidth={2} />
              <TextInput
                value={q}
                onChangeText={setQ}
                placeholder="Search doctors, departments, specialists…"
                placeholderTextColor={colors.textLight}
                style={styles.searchInput}
              />
              {q ? (
                <Pressable onPress={() => setQ("")}>
                  <Text style={styles.clearSearchText}>✕</Text>
                </Pressable>
              ) : null}
            </View>

            {/* Dropdown search results */}
            {showDropdown ? (
              <View style={styles.dropdownBox}>
                {matchedDoctors.length > 0 ? (
                  <View>
                    <Text style={styles.dropdownHeader}>Doctors</Text>
                    {matchedDoctors.map((d) => (
                      <Pressable
                        key={d.id || d._id}
                        onPress={() => {
                          setQ("");
                          navigation.navigate("DoctorDetail", {
                            doctorId: d.id || d._id,
                          });
                        }}
                        style={({ pressed }) => [
                          styles.dropdownItem,
                          pressed && styles.dropdownItemPressed,
                        ]}
                      >
                        <View style={styles.dropdownItemLeft}>
                          <View style={styles.dropdownAvatar}>
                            <StethoscopeIcon size={14} color={colors.primary} />
                          </View>
                          <View>
                            <Text style={styles.dropdownItemTitle}>{d.name}</Text>
                            <Text style={styles.dropdownItemSub}>
                              {d.department || "General"}
                            </Text>
                          </View>
                        </View>
                        <ChevronRightIcon size={16} color={colors.textMuted} />
                      </Pressable>
                    ))}
                  </View>
                ) : null}

                {matchedDepts.length > 0 ? (
                  <View style={{ marginTop: matchedDoctors.length > 0 ? 12 : 0 }}>
                    <Text style={styles.dropdownHeader}>Departments</Text>
                    {matchedDepts.map((dep) => (
                      <Pressable
                        key={dep.id}
                        onPress={() => {
                          setQ("");
                          navigation.navigate("Find Doctor", {
                            department: dep.name,
                          });
                        }}
                        style={({ pressed }) => [
                          styles.dropdownItem,
                          pressed && styles.dropdownItemPressed,
                        ]}
                      >
                        <View style={styles.dropdownItemLeft}>
                          <View style={styles.dropdownAvatar}>
                            <HospitalBuildingIcon size={14} color={colors.secondary} />
                          </View>
                          <View>
                            <Text style={styles.dropdownItemTitle}>{dep.name}</Text>
                            <Text style={styles.dropdownItemSub}>{dep.desc}</Text>
                          </View>
                        </View>
                        <ChevronRightIcon size={16} color={colors.textMuted} />
                      </Pressable>
                    ))}
                  </View>
                ) : null}
              </View>
            ) : null}
          </View>

          {/* Next Appointment Card */}
          <View style={styles.nextCard}>
            <View style={styles.cardHeaderRow}>
              <View style={styles.cardBadgeRow}>
                <View style={styles.pulseDot} />
                <Text style={styles.cardBadgeText}>NEXT APPOINTMENT</Text>
              </View>

              <Pressable
                onPress={() => navigation.navigate("Appointments")}
                style={({ pressed }) => [
                  styles.viewAllBtn,
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Text style={styles.viewAllText}>View all</Text>
                <ChevronRightIcon size={14} color={colors.primary} />
              </Pressable>
            </View>

            {!nextAppointment ? (
              <View style={styles.emptyApptBox}>
                <View style={styles.emptyIconCircle}>
                  <CalendarIcon size={26} color={colors.primary} strokeWidth={2} />
                </View>
                <Text style={styles.emptyApptTitle}>
                  No Upcoming Consultations
                </Text>
                <Text style={styles.emptyApptSub}>
                  Find verified doctors and schedule an in-clinic or teleconsultation today.
                </Text>

                <Pressable
                  onPress={() => navigation.navigate("Find Doctor")}
                  android_ripple={{ color: "rgba(255,255,255,0.2)" }}
                  style={({ pressed }) => [
                    styles.primaryActionBtn,
                    pressed && styles.cardPressed,
                  ]}
                >
                  <StethoscopeIcon size={16} color={colors.white} strokeWidth={2.2} />
                  <Text style={styles.primaryActionBtnText}>Find a Specialist</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.apptDetailsBox}>
                <View style={styles.apptDocHeader}>
                  <View style={styles.docAvatarCircle}>
                    <Text style={styles.docAvatarInitial}>
                      {(nextAppointment.doctorName || "D")[0].toUpperCase()}
                    </Text>
                  </View>

                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <Text style={styles.apptDocName}>
                        {nextAppointment.doctorName}
                      </Text>
                      <View style={{ marginLeft: 6 }}>
                        <ShieldCheckIcon size={16} color={colors.accent} />
                      </View>
                    </View>

                    <Text style={styles.apptDeptText}>
                      {nextAppointment.department || "General Practice"}
                    </Text>

                    {nextDoc ? (
                      <View style={styles.apptRatingRow}>
                        <StarFilledIcon size={13} color={colors.warning} />
                        <Text style={styles.apptRatingText}>
                          {nextDoc.rating || "4.8"}
                        </Text>
                        <Text style={styles.apptFeeText}>
                          • Rs {nextDoc.fee || "1,500"}
                        </Text>
                      </View>
                    ) : null}
                  </View>

                  <StatusPill status={nextAppointment.status || "confirmed"} />
                </View>

                {/* Date & Time Pills */}
                <View style={styles.scheduleRow}>
                  <View style={styles.scheduleChip}>
                    <CalendarIcon size={14} color={colors.primary} strokeWidth={2} />
                    <Text style={styles.scheduleText}>{nextAppointment.date}</Text>
                  </View>

                  <View style={styles.scheduleChip}>
                    <ClockIcon size={14} color={colors.accent} strokeWidth={2} />
                    <Text style={styles.scheduleText}>{nextAppointment.time}</Text>
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.apptActionRow}>
                  <SoftButton
                    text="Details"
                    onPress={() => navigation.navigate("Appointments")}
                  />
                  <SoftButton
                    text="Reschedule"
                    primary
                    onPress={() => {
                      const docId = nextDoc?._id || nextDoc?.id;
                      if (docId) {
                        navigation.navigate("Book", { doctorId: docId });
                      } else {
                        navigation.navigate("Find Doctor", {
                          department: nextAppointment.department,
                        });
                      }
                    }}
                  />
                  <SoftButton
                    text="Cancel"
                    danger
                    onPress={() =>
                      handleCancelAppointment(
                        nextAppointment._id || nextAppointment.id
                      )
                    }
                  />
                </View>
              </View>
            )}
          </View>

          {/* Quick Stats Grid */}
          <View style={styles.statsRow}>
            <StatCard
              label="UPCOMING"
              value={upcomingCount}
              hint="Scheduled Visits"
              icon={<CalendarIcon size={18} color={colors.primary} />}
              color={colors.primary}
            />
            <StatCard
              label="REPORTS"
              value={reportCount}
              hint="Lab Documents"
              icon={<ReportHeartIcon size={18} color={colors.accent} />}
              color={colors.accent}
            />
          </View>

          {/* Section: Quick Actions */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Healthcare Services</Text>
          </View>

          <View style={styles.actionGrid}>
            <View style={styles.gridRow}>
              <ActionCard
                icon={<StethoscopeIcon size={22} color={colors.primary} strokeWidth={2.2} />}
                iconBg={colors.primaryLight}
                title="Find Doctor"
                subtitle="Specialists & ratings"
                onPress={() => navigation.navigate("Find Doctor")}
              />
              <ActionCard
                icon={<CalendarIcon size={22} color={colors.accent} strokeWidth={2.2} />}
                iconBg={colors.accentLight}
                title="Book Visit"
                subtitle="Select date & slot"
                onPress={() => navigation.navigate("Book")}
              />
            </View>

            <View style={styles.gridRow}>
              <ActionCard
                icon={<ReportHeartIcon size={22} color={colors.warning} strokeWidth={2.2} />}
                iconBg={colors.warningLight}
                title="Lab Reports"
                subtitle="History & test logs"
                onPress={() => navigation.navigate("Profile")}
              />
              <ActionCard
                icon={<ChatBubbleIcon size={22} color={colors.secondary} strokeWidth={2.2} />}
                iconBg={colors.secondaryLight}
                title="Online Chat"
                subtitle="Direct doctor consult"
                onPress={() => navigation.navigate("Chat")}
              />
            </View>
          </View>

          {/* Section: Recent Consultations */}
          <View style={styles.recentChatCard}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.sectionInnerTitle}>Recent Consultations</Text>
              <Pressable
                onPress={() => navigation.navigate("Chat")}
                style={({ pressed }) => [
                  styles.viewAllBtn,
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Text style={styles.viewAllText}>Open inbox</Text>
                <ChevronRightIcon size={14} color={colors.primary} />
              </Pressable>
            </View>

            {recentChats.length === 0 ? (
              <View style={styles.emptyChatsBox}>
                <Text style={styles.emptyChatsText}>
                  No active conversations. Connect with a clinic doctor or reception anytime.
                </Text>
              </View>
            ) : (
              recentChats.map((c, idx) => (
                <Pressable
                  key={c.id || c._id}
                  onPress={() =>
                    navigation.navigate("Chat", {
                      screen: "ChatRoom",
                      params: { chatId: c.id || c._id, name: c.name },
                    })
                  }
                  android_ripple={{ color: "rgba(13, 110, 253, 0.08)" }}
                  style={({ pressed }) => [
                    styles.chatRow,
                    idx !== 0 && { marginTop: 8 },
                    pressed && styles.cardPressed,
                  ]}
                >
                  <View style={styles.chatAvatar}>
                    <Text style={styles.chatAvatarText}>
                      {(c.name || "D")[0].toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.chatName}>{c.name}</Text>
                    <Text style={styles.chatSnippet} numberOfLines={1}>
                      {c.last || "Tap to continue discussion"}
                    </Text>
                  </View>
                  <ChevronRightIcon size={16} color={colors.textLight} />
                </Pressable>
              ))
            )}
          </View>

          {/* Departments Directory Shortcut */}
          <Pressable
            onPress={() => navigation.navigate("Departments")}
            android_ripple={{ color: "rgba(13, 110, 253, 0.08)" }}
            style={({ pressed }) => [
              styles.deptBanner,
              pressed && styles.cardPressed,
            ]}
          >
            <View style={styles.deptBannerLeft}>
              <View style={styles.deptBannerIconWrap}>
                <HospitalBuildingIcon size={24} color={colors.primary} strokeWidth={2} />
              </View>
              <View style={{ marginLeft: 14 }}>
                <Text style={styles.deptBannerTitle}>Hospital Departments</Text>
                <Text style={styles.deptBannerSub}>
                  Cardiology, ENT, Pediatrics, Neurology, Orthopedics
                </Text>
              </View>
            </View>
            <ChevronRightIcon size={20} color={colors.primary} />
          </Pressable>

          {/* Health Tip */}
          <View style={styles.healthTipCard}>
            <View style={styles.healthTipHeader}>
              <ShieldCheckIcon size={18} color={colors.accent} />
              <Text style={styles.healthTipTitle}>Clinical Health Advisory</Text>
            </View>
            <Text style={styles.healthTipBody}>
              Remember to maintain routine vitals checkups and stay hydrated. You can attach previous laboratory files and audio questions in chat for quick doctor review.
            </Text>
          </View>
        </ScrollView>
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
    backgroundColor: "rgba(15, 23, 42, 0.4)",
  },
  scrollContent: {
    padding: 16,
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 12 : 44,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerUserRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: radii.full,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.white,
    ...shadows.subtle,
  },
  avatarInitial: {
    color: colors.white,
    fontWeight: "900",
    fontSize: 18,
  },
  headerInfo: {
    marginLeft: 12,
    flex: 1,
  },
  greetingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  greetingText: {
    color: colors.white,
    fontSize: 19,
    fontWeight: "900",
    letterSpacing: -0.3,
  },
  roleBadge: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.full,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  roleBadgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  hospitalSub: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },
  logoutBtn: {
    width: 38,
    height: 38,
    borderRadius: radii.full,
    backgroundColor: "rgba(15, 23, 42, 0.65)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  quickNavRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 14,
  },
  quickChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceGlass,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.6)",
    ...shadows.subtle,
  },
  quickChipText: {
    marginLeft: 6,
    fontWeight: "700",
    fontSize: 12,
    color: colors.textPrimary,
  },
  searchSection: {
    marginTop: 14,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceGlass,
    borderRadius: radii.lg,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 12 : 10,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    ...shadows.subtle,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: "500",
  },
  clearSearchText: {
    fontSize: 14,
    color: colors.textMuted,
    paddingHorizontal: 6,
  },
  dropdownBox: {
    marginTop: 8,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    ...shadows.card,
  },
  dropdownHeader: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.textMuted,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: radii.sm,
  },
  dropdownItemPressed: {
    backgroundColor: colors.surfaceSubtle,
  },
  dropdownItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  dropdownAvatar: {
    width: 28,
    height: 28,
    borderRadius: radii.full,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  dropdownItemTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  dropdownItemSub: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 1,
  },
  nextCard: {
    marginTop: 14,
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    ...shadows.card,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
    marginRight: 6,
  },
  cardBadgeText: {
    fontSize: 11,
    fontWeight: "900",
    color: colors.textMuted,
    letterSpacing: 0.6,
  },
  viewAllBtn: {
    flexDirection: "row",
    alignItems: "center",
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.primary,
    marginRight: 2,
  },
  emptyApptBox: {
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 12,
  },
  emptyIconCircle: {
    width: 52,
    height: 52,
    borderRadius: radii.full,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  emptyApptTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  emptyApptSub: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 4,
    lineHeight: 18,
  },
  primaryActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: radii.md,
    marginTop: 14,
    ...shadows.subtle,
  },
  primaryActionBtnText: {
    color: colors.white,
    fontWeight: "800",
    fontSize: 14,
    marginLeft: 8,
  },
  apptDetailsBox: {
    marginTop: 14,
  },
  apptDocHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  docAvatarCircle: {
    width: 44,
    height: 44,
    borderRadius: radii.full,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  docAvatarInitial: {
    fontSize: 18,
    fontWeight: "900",
    color: colors.primary,
  },
  apptDocName: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  apptDeptText: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  apptRatingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  apptRatingText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textPrimary,
    marginLeft: 3,
  },
  apptFeeText: {
    fontSize: 12,
    color: colors.textMuted,
    marginLeft: 4,
  },
  scheduleRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorder,
  },
  scheduleChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceSubtle,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radii.sm,
  },
  scheduleText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textPrimary,
    marginLeft: 6,
  },
  apptActionRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 14,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 14,
  },
  sectionHeaderRow: {
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: colors.white,
    letterSpacing: -0.2,
  },
  actionGrid: {
    gap: 10,
  },
  gridRow: {
    flexDirection: "row",
    gap: 10,
  },
  actionCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    ...shadows.subtle,
  },
  actionIconWrap: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.textPrimary,
    marginTop: 10,
  },
  actionSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
    lineHeight: 16,
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.95,
  },
  recentChatCard: {
    marginTop: 14,
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    ...shadows.subtle,
  },
  sectionInnerTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  emptyChatsBox: {
    padding: 16,
    alignItems: "center",
    marginTop: 6,
  },
  emptyChatsText: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 18,
  },
  chatRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceSubtle,
  },
  chatAvatar: {
    width: 36,
    height: 36,
    borderRadius: radii.full,
    backgroundColor: colors.secondaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  chatAvatarText: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.secondary,
  },
  chatName: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  chatSnippet: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 1,
  },
  deptBanner: {
    marginTop: 14,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    ...shadows.subtle,
  },
  deptBannerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  deptBannerIconWrap: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  deptBannerTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  deptBannerSub: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  healthTipCard: {
    marginTop: 14,
    backgroundColor: "#F0FDF4",
    borderRadius: radii.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  healthTipHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  healthTipTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#166534",
    marginLeft: 6,
  },
  healthTipBody: {
    fontSize: 12,
    color: "#15803D",
    marginTop: 6,
    lineHeight: 18,
  },
});
