import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { AuthContext } from "../../context/AuthContext";
import { appointmentsApi } from "../../services/api";
import { colors, radii, shadows } from "../../theme";
import { PrescriptionIcon, PillIcon, CheckIcon } from "../../components/icons";

function PrescriptionCard({ appt, onSave }) {
  const [note, setNote] = useState(appt.note || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (!note.trim()) return;
    try {
      setSaving(true);
      await appointmentsApi.updateNote(appt._id || appt.id, note.trim());
      setSaved(true);
      onSave(appt._id || appt.id, note.trim());
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      Alert.alert("Error", e?.message || "Failed to save prescription note");
    } finally {
      setSaving(false);
    }
  };

  const status = String(appt.status || "pending").toLowerCase();

  return (
    <View
      style={{
        backgroundColor: "white",
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: "#eee",
        marginBottom: 12,
      }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: "900", fontSize: 15, color: "#111" }}>
            {appt.patientName || "Patient"}
          </Text>
          <Text style={{ marginTop: 3, color: "#666", fontSize: 13 }}>
            {appt.department || "Department"} • {appt.time || "—"}
          </Text>
        </View>
        <View
          style={{
            paddingHorizontal: 10,
            paddingVertical: 5,
            borderRadius: 999,
            backgroundColor: status === "done" ? "#d1fae5" : "#fff7e6",
            borderWidth: 1,
            borderColor: status === "done" ? "#a7f3d0" : "#ffe3b0",
          }}
        >
          <Text
            style={{
              fontSize: 11,
              fontWeight: "900",
              color: status === "done" ? "#065f46" : "#8a4b00",
              textTransform: "uppercase",
            }}
          >
            {status}
          </Text>
        </View>
      </View>

      <Text style={{ marginTop: 12, fontSize: 12, fontWeight: "900", color: "#888" }}>
        PRESCRIPTION / NOTES
      </Text>
      <View
        style={{
          marginTop: 6,
          borderWidth: 1,
          borderColor: "#e5e7eb",
          borderRadius: 12,
          backgroundColor: "#fafafa",
          padding: 12,
        }}
      >
        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder="Write prescription, diagnosis, or notes here…"
          multiline
          numberOfLines={4}
          style={{ fontSize: 14, color: "#111", minHeight: 80, textAlignVertical: "top" }}
        />
      </View>

      <Pressable
        onPress={handleSave}
        disabled={saving || !note.trim()}
        style={({ pressed }) => ({
          marginTop: 10,
          backgroundColor: saved ? colors.accentLight : !note.trim() ? colors.surfaceSubtle : colors.primary,
          borderWidth: 1,
          borderColor: saved ? "#A7F3D0" : !note.trim() ? colors.surfaceBorder : colors.primaryDark,
          borderRadius: radii.md,
          padding: 12,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          opacity: pressed ? 0.9 : 1,
          overflow: "hidden",
        })}
      >
        {saved ? (
          <CheckIcon size={16} color={colors.accent} strokeWidth={2.4} style={{ marginRight: 6 }} />
        ) : null}
        <Text
          style={{
            fontWeight: "900",
            fontSize: 13,
            color: saved ? colors.accent : !note.trim() ? colors.textLight : colors.white,
          }}
        >
          {saved ? "Saved Successfully!" : saving ? "Saving…" : "Save Prescription"}
        </Text>
      </Pressable>
    </View>
  );
}

export default function PrescriptionsScreen() {
  const { user } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await appointmentsApi.today();
      const list = Array.isArray(data?.items) ? data.items : [];
      setAppointments(list);
    } catch (e) {
      Alert.alert("Error", e?.message || "Failed to load appointments");
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAppointments();
    setRefreshing(false);
  }, [fetchAppointments]);

  const onSaveNote = useCallback((apptId, note) => {
    setAppointments((prev) =>
      prev.map((a) =>
        String(a._id || a.id) === String(apptId) ? { ...a, note } : a
      )
    );
  }, []);

  const todayKey = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10, color: "#666" }}>Loading appointments…</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#f7f8fa" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text style={{ fontSize: 20, fontWeight: "900", color: "#111" }}>Prescriptions</Text>
        <Text style={{ marginTop: 4, color: "#666", fontWeight: "700" }}>
          Today ({todayKey}) • {appointments.length} appointment{appointments.length !== 1 ? "s" : ""}
        </Text>

        <View style={{ marginTop: 16 }}>
          {appointments.length === 0 ? (
            <View
              style={{
                backgroundColor: "white",
                borderRadius: 16,
                padding: 20,
                borderWidth: 1,
                borderColor: "#eee",
                alignItems: "center",
              }}
            >
              <Text style={{ fontWeight: "900", color: "#111" }}>No appointments today</Text>
              <Text style={{ marginTop: 6, color: "#666" }}>
                Pull down to refresh or check back later.
              </Text>
            </View>
          ) : (
            appointments.map((appt) => (
              <PrescriptionCard
                key={appt._id || appt.id}
                appt={appt}
                onSave={onSaveNote}
              />
            ))
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
