import React, { useContext, useMemo, useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  ImageBackground,
  Alert,
} from "react-native";
import { AuthContext } from "../../context/AuthContext";
import { AppDataContext } from "../../context/AppDataContext";
import { dummyDepartments } from "../../data/dummyDepartments";
import { usersApi, appointmentsApi, chatApi } from "../../services/api";

function getDoctorByName(name, doctors) {
  return doctors.find((d) => d.name === name) || null;
}

function Card({ title, subtitle, icon, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: "rgba(0,0,0,0.08)" }}
      style={({ pressed }) => ({
        flex: 1,
        backgroundColor: "rgba(255,255,255,0.95)",
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: "#eee",
        transform: [{ scale: pressed ? 0.98 : 1 }],
        opacity: pressed ? 0.95 : 1,
        overflow: "hidden",
      })}
    >
      <Text style={{ fontSize: 22 }}>{icon}</Text>
      <Text style={{ marginTop: 10, fontSize: 16, fontWeight: "900" }}>
        {title}
      </Text>
      <Text style={{ marginTop: 4, opacity: 0.7 }}>{subtitle}</Text>
    </Pressable>
  );
}

function ResultRow({ title, subtitle, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: "rgba(0,0,0,0.06)" }}
      style={({ pressed }) => ({
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 12,
        opacity: pressed ? 0.92 : 1,
        overflow: "hidden",
      })}
    >
      <Text style={{ fontWeight: "900" }}>{title}</Text>
      {subtitle ? (
        <Text style={{ marginTop: 4, opacity: 0.7 }}>{subtitle}</Text>
      ) : null}
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

function Pill({ text, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: "rgba(0,0,0,0.06)" }}
      style={({ pressed }) => ({
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 999,
        backgroundColor: "rgba(255,255,255,0.95)",
        borderWidth: 1,
        borderColor: "#eee",
        opacity: pressed ? 0.92 : 1,
        overflow: "hidden",
      })}
    >
      <Text style={{ fontWeight: "900" }}>{text}</Text>
    </Pressable>
  );
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
        const appts = await appointmentsApi.myAppointments();
        if (Array.isArray(appts)) {
          setAppointments(appts);
        }
      }
    } catch (err) {
      console.log("Failed to load home screen data", err);
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

  return (
    <ImageBackground
      source={require("../../../assets/home.jpg")}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.25)" }}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ padding: 16, paddingBottom: 28 }}
        >
          {/* Header */}
          <View
            style={{
              marginTop: 6,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={{ fontSize: 22, fontWeight: "900", color: "white" }}>
                Hi{user?.name ? `, ${user.name}` : ""} 👋
              </Text>
              <Text style={{ marginTop: 4, opacity: 0.85, color: "white" }}>
                {user?.role ? `${user.role} Dashboard` : "Dashboard"}
              </Text>
            </View>

            <Pressable
              onPress={logout}
              android_ripple={{ color: "rgba(255,255,255,0.25)" }}
              style={({ pressed }) => ({
                paddingHorizontal: 12,
                paddingVertical: 10,
                borderRadius: 999,
                backgroundColor: "rgba(0,0,0,0.8)",
                transform: [{ scale: pressed ? 0.97 : 1 }],
                overflow: "hidden",
              })}
            >
              <Text style={{ color: "white", fontWeight: "900" }}>Logout</Text>
            </Pressable>
          </View>

          {/* Continue strip */}
          <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
            <Pill text="📅 Book" onPress={() => navigation.navigate("Book")} />
            <Pill
              text="🗂️ Appointments"
              onPress={() => navigation.navigate("Appointments")}
            />
            <Pill text="💬 Chat" onPress={() => navigation.navigate("Chat")} />
          </View>

          {/* Search + dropdown */}
          <View style={{ marginTop: 14 }}>
            <View
              style={{
                backgroundColor: "rgba(255,255,255,0.95)",
                borderRadius: 14,
                borderWidth: 1,
                borderColor: "#eee",
                paddingHorizontal: 12,
                paddingVertical: 10,
              }}
            >
              <TextInput
                value={q}
                onChangeText={setQ}
                placeholder="Search doctors, departments..."
                style={{ fontSize: 15 }}
              />
            </View>

            {showDropdown ? (
              <View
                style={{
                  marginTop: 10,
                  backgroundColor: "rgba(255,255,255,0.96)",
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: "#eee",
                  padding: 10,
                }}
              >

                {matchedDoctors.length > 0 ? (
                  <>
                    <Text style={{ fontWeight: "900", marginBottom: 6 }}>
                      Doctors
                    </Text>
                    {matchedDoctors.map((d) => (
                      <ResultRow
                        key={d.id}
                        title={d.name}
                        subtitle={d.department}
                        onPress={() => {
                          setQ("");
                          navigation.navigate("DoctorDetail", {
                            doctorId: d.id,
                          });
                        }}
                      />
                    ))}
                  </>
                ) : null}

                {matchedDepts.length > 0 ? (
                  <>
                    <View style={{ height: 10 }} />
                    <Text style={{ fontWeight: "900", marginBottom: 6 }}>
                      Departments
                    </Text>
                    {matchedDepts.map((dep) => (
                      <ResultRow
                        key={dep.id}
                        title={dep.name}
                        subtitle={dep.desc}
                        onPress={() => {
                          setQ("");
                          navigation.navigate("Find Doctor", {
                            department: dep.name,
                          });
                        }}
                      />
                    ))}
                  </>
                ) : null}
              </View>
            ) : null}
          </View>

          {/* Next appointment preview */}
          <View
            style={{
              marginTop: 14,
              backgroundColor: "rgba(255,255,255,0.95)",
              borderRadius: 18,
              padding: 16,
              borderWidth: 1,
              borderColor: "#eee",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: "900" }}>
                Next Appointment
              </Text>

              <Pressable
                onPress={() => navigation.navigate("Appointments")}
                android_ripple={{ color: "rgba(0,0,0,0.06)" }}
                style={({ pressed }) => ({
                  paddingHorizontal: 10,
                  paddingVertical: 8,
                  borderRadius: 999,
                  opacity: pressed ? 0.92 : 1,
                  overflow: "hidden",
                })}
              >
                <Text style={{ fontWeight: "900" }}>View all</Text>
              </Pressable>
            </View>

            {!nextAppointment ? (
              <View style={{ marginTop: 10 }}>
                <Text style={{ fontWeight: "900" }}>
                  No upcoming appointments
                </Text>
                <Text style={{ marginTop: 6, opacity: 0.7 }}>
                  Book a doctor to see it here.
                </Text>

                <Pressable
                  onPress={() => navigation.navigate("Find Doctor")}
                  android_ripple={{ color: "rgba(255,255,255,0.22)" }}
                  style={({ pressed }) => ({
                    marginTop: 12,
                    backgroundColor: "black",
                    padding: 14,
                    borderRadius: 14,
                    alignItems: "center",
                    opacity: pressed ? 0.92 : 1,
                    transform: [{ scale: pressed ? 0.98 : 1 }],
                    overflow: "hidden",
                  })}
                >
                  <Text style={{ color: "white", fontWeight: "900" }}>
                    Find a Doctor
                  </Text>
                </Pressable>
              </View>
            ) : (
              <View style={{ marginTop: 10 }}>
                <Text style={{ fontSize: 16, fontWeight: "900" }}>
                  {nextAppointment.doctorName}
                </Text>

                <Text style={{ marginTop: 6, opacity: 0.75 }}>
                  {nextAppointment.department}
                </Text>

                {/* ✅ rating + fee preview */}
                {nextDoc ? (
                  <Text style={{ marginTop: 6, opacity: 0.8 }}>
                    ⭐ {nextDoc.rating}   💳 Rs {nextDoc.fee}
                  </Text>
                ) : null}

                <Text style={{ marginTop: 8, fontWeight: "800" }}>
                  📅 {nextAppointment.date} ⏰ {nextAppointment.time}
                </Text>

                {/* ✅ Details + Reschedule + Cancel */}
                <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
                  <Pressable
                    onPress={() => navigation.navigate("Appointments")}
                    android_ripple={{ color: "rgba(0,0,0,0.06)" }}
                    style={({ pressed }) => ({
                      flex: 1,
                      backgroundColor: "white",
                      padding: 14,
                      borderRadius: 14,
                      alignItems: "center",
                      borderWidth: 1,
                      borderColor: "#eee",
                      opacity: pressed ? 0.92 : 1,
                      overflow: "hidden",
                    })}
                  >
                    <Text style={{ fontWeight: "900" }}>Details</Text>
                  </Pressable>

                  <Pressable
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
                    android_ripple={{ color: "rgba(0,0,0,0.06)" }}
                    style={({ pressed }) => ({
                      flex: 1,
                      backgroundColor: "white",
                      padding: 14,
                      borderRadius: 14,
                      alignItems: "center",
                      borderWidth: 1,
                      borderColor: "#eee",
                      opacity: pressed ? 0.92 : 1,
                      overflow: "hidden",
                    })}
                  >
                    <Text style={{ fontWeight: "900" }}>Reschedule</Text>
                  </Pressable>

                  <Pressable
                    onPress={() => handleCancelAppointment(nextAppointment._id || nextAppointment.id)}
                    android_ripple={{ color: "rgba(0,0,0,0.06)" }}
                    style={({ pressed }) => ({
                      flex: 1,
                      backgroundColor: "white",
                      padding: 14,
                      borderRadius: 14,
                      alignItems: "center",
                      borderWidth: 1,
                      borderColor: "#eee",
                      opacity: pressed ? 0.92 : 1,
                      overflow: "hidden",
                    })}
                  >
                    <Text style={{ fontWeight: "900", color: "#b91c1c" }}>Cancel</Text>
                  </Pressable>
                </View>
              </View>
            )}
          </View>

          {/* Quick stats */}
          <View style={{ flexDirection: "row", gap: 12, marginTop: 14 }}>
            <View
              style={{
                flex: 1,
                backgroundColor: "rgba(255,255,255,0.95)",
                borderRadius: 16,
                padding: 14,
                borderWidth: 1,
                borderColor: "#eee",
              }}
            >
              <Text style={{ opacity: 0.7 }}>Upcoming</Text>
              <Text style={{ fontSize: 22, fontWeight: "900", marginTop: 6 }}>
                {upcomingCount}
              </Text>
              <Text style={{ opacity: 0.7 }}>Appointments</Text>
            </View>

            <View
              style={{
                flex: 1,
                backgroundColor: "rgba(255,255,255,0.95)",
                borderRadius: 16,
                padding: 14,
                borderWidth: 1,
                borderColor: "#eee",
              }}
            >
              <Text style={{ opacity: 0.7 }}>New</Text>
              <Text style={{ fontSize: 22, fontWeight: "900", marginTop: 6 }}>
                {reportCount}
              </Text>
              <Text style={{ opacity: 0.7 }}>Lab Reports</Text>
            </View>
          </View>

          {/* ✅ Recent Chats (NEW) */}
          <View
            style={{
              marginTop: 14,
              backgroundColor: "rgba(255,255,255,0.95)",
              borderRadius: 18,
              padding: 14,
              borderWidth: 1,
              borderColor: "#eee",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: "900" }}>
                Recent Chats
              </Text>
              <Pressable
                onPress={() => navigation.navigate("Chat")}
                android_ripple={{ color: "rgba(0,0,0,0.06)" }}
                style={({ pressed }) => ({
                  paddingHorizontal: 10,
                  paddingVertical: 8,
                  borderRadius: 999,
                  opacity: pressed ? 0.92 : 1,
                  overflow: "hidden",
                })}
              >
                <Text style={{ fontWeight: "900" }}>Open</Text>
              </Pressable>
            </View>

            <View style={{ marginTop: 8 }}>
              {recentChats.length === 0 ? (
                <View
                  style={{
                    padding: 16,
                    backgroundColor: "white",
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: "#eee",
                  }}
                >
                  <Text style={{ color: "#777", textAlign: "center" }}>
                    No recent conversations
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
                    android_ripple={{ color: "rgba(0,0,0,0.06)" }}
                    style={({ pressed }) => ({
                      paddingVertical: 12,
                      paddingHorizontal: 12,
                      borderRadius: 14,
                      opacity: pressed ? 0.92 : 1,
                      overflow: "hidden",
                      backgroundColor: "white",
                      borderWidth: 1,
                      borderColor: "#eee",
                      marginTop: idx === 0 ? 0 : 10,
                    })}
                  >
                    <Text style={{ fontWeight: "900" }}>{c.name}</Text>
                    <Text style={{ marginTop: 4, opacity: 0.75 }} numberOfLines={1}>
                      {c.last || "Start a conversation"}
                    </Text>
                  </Pressable>
                ))
              )}
            </View>
          </View>

          {/* Actions */}
          <Text
            style={{
              marginTop: 18,
              marginBottom: 10,
              fontSize: 16,
              fontWeight: "900",
              color: "white",
            }}
          >
            Quick Actions
          </Text>

          <View style={{ flexDirection: "row", gap: 12 }}>
            <Card
              icon="👨‍⚕️"
              title="Find Doctor"
              subtitle="Browse & filter doctors"
              onPress={() => navigation.navigate("Find Doctor")}
            />
            <Card
              icon="📅"
              title="Book"
              subtitle="Pick date & time"
              onPress={() => navigation.navigate("Book")}
            />
          </View>

          <View style={{ flexDirection: "row", gap: 12, marginTop: 12 }}>
            <Card
              icon="🧾"
              title="Reports"
              subtitle="Lab results & history"
              onPress={() => navigation.navigate("Profile")} // later: LabReportsScreen
            />
            <Card
              icon="💬"
              title="Chat"
              subtitle="Talk to reception"
              onPress={() => navigation.navigate("Chat")}
            />
          </View>

          {/* ✅ Health tip (NEW) */}
          <View
            style={{
              marginTop: 14,
              backgroundColor: "rgba(255,255,255,0.95)",
              borderRadius: 18,
              padding: 16,
              borderWidth: 1,
              borderColor: "#eee",
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "900" }}>
              Health Tip
            </Text>
            <Text style={{ marginTop: 8, opacity: 0.75 }}>
              Stay hydrated and take proper rest. You can send reports and voice notes in chat for quick guidance.
            </Text>

            <Pressable
              onPress={() => navigation.navigate("Chat")}
              android_ripple={{ color: "rgba(0,0,0,0.06)" }}
              style={({ pressed }) => ({
                marginTop: 12,
                backgroundColor: "black",
                padding: 14,
                borderRadius: 14,
                alignItems: "center",
                opacity: pressed ? 0.92 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
                overflow: "hidden",
              })}
            >
              <Text style={{ color: "white", fontWeight: "900" }}>
                Open Chat
              </Text>
            </Pressable>
          </View>

          {/* Departments shortcut */}
          <Pressable
            onPress={() => navigation.navigate("Departments")}
            android_ripple={{ color: "rgba(0,0,0,0.08)" }}
            style={({ pressed }) => ({
              marginTop: 16,
              backgroundColor: "rgba(255,255,255,0.95)",
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: "#eee",
              transform: [{ scale: pressed ? 0.99 : 1 }],
              opacity: pressed ? 0.95 : 1,
              overflow: "hidden",
            })}
          >
            <Text style={{ fontWeight: "900", fontSize: 16 }}>
              Departments
            </Text>
            <Text style={{ marginTop: 4, opacity: 0.7 }}>
              Cardiology, ENT, Pediatrics, Dermatology...
            </Text>
          </Pressable>
        </ScrollView>
      </View>
    </ImageBackground>
  );
}
