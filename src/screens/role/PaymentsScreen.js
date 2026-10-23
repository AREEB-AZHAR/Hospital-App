import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { appointmentsApi } from "../../services/api";

const STATUS_FILTER = ["all", "pending", "paid"];

function PaymentRow({ appt, onMarkPaid }) {
  const [marking, setMarking] = useState(false);
  const isPaid = (appt.paymentStatus || appt._paymentStatus) === "paid";

  const handlePay = () => {
    Alert.alert("Mark as Paid", `Mark ${appt.patientName || "this patient"}'s payment as paid?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Mark Paid",
        onPress: async () => {
          setMarking(true);
          await onMarkPaid(appt._id || appt.id);
          setMarking(false);
        },
      },
    ]);
  };

  return (
    <View
      style={{
        backgroundColor: "white",
        borderRadius: 16,
        padding: 14,
        borderWidth: 1,
        borderColor: "#eee",
        marginBottom: 10,
      }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: "900", fontSize: 15, color: "#111" }}>
            {appt.patientName || "Patient"}
          </Text>
          <Text style={{ marginTop: 3, color: "#666", fontSize: 13 }}>
            {appt.department || "Department"} • Dr. {appt.doctorName || "—"}
          </Text>
          <Text style={{ marginTop: 3, color: "#aaa", fontSize: 12 }}>
            📅 {appt.date}  ⏰ {appt.time}
          </Text>
        </View>

        <View
          style={{
            paddingHorizontal: 10,
            paddingVertical: 5,
            borderRadius: 999,
            backgroundColor: isPaid ? "#d1fae5" : "#fff7e6",
            borderWidth: 1,
            borderColor: isPaid ? "#a7f3d0" : "#ffe3b0",
          }}
        >
          <Text
            style={{
              fontSize: 11,
              fontWeight: "900",
              color: isPaid ? "#065f46" : "#8a4b00",
              textTransform: "uppercase",
            }}
          >
            {isPaid ? "PAID" : "PENDING"}
          </Text>
        </View>
      </View>

      {!isPaid && (
        <Pressable
          onPress={handlePay}
          disabled={marking}
          style={({ pressed }) => ({
            marginTop: 12,
            backgroundColor: marking ? "#888" : "#111",
            borderRadius: 12,
            padding: 12,
            alignItems: "center",
            opacity: pressed ? 0.9 : 1,
            overflow: "hidden",
          })}
        >
          <Text style={{ fontWeight: "900", color: "white", fontSize: 13 }}>
            {marking ? "Processing…" : "✅ Mark as Paid"}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

export default function PaymentsScreen() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState("all");

  const fetchQueue = useCallback(async () => {
    try {
      setLoading(true);
      const data = await appointmentsApi.queue();
      setAppointments(
        (Array.isArray(data) ? data : []).map((a) => ({
          ...a,
          paymentStatus: a.paymentStatus || "pending",
        }))
      );
    } catch (e) {
      Alert.alert("Error", e?.message || "Failed to load queue");
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchQueue();
    setRefreshing(false);
  }, [fetchQueue]);

  const onMarkPaid = useCallback(async (id) => {
    try {
      await appointmentsApi.updatePayment(id, "paid");
      setAppointments((prev) =>
        prev.map((a) =>
          String(a._id || a.id) === String(id) ? { ...a, paymentStatus: "paid" } : a
        )
      );
    } catch (err) {
      Alert.alert("Error", err?.message || "Failed to update payment status");
    }
  }, []);

  const filtered = useMemo(() => {
    if (filter === "all") return appointments;
    return appointments.filter((a) => (a.paymentStatus || "pending") === filter);
  }, [appointments, filter]);

  const counts = useMemo(() => {
    const paid = appointments.filter((a) => (a.paymentStatus || "pending") === "paid").length;
    return { all: appointments.length, paid, pending: appointments.length - paid };
  }, [appointments]);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10, color: "#666" }}>Loading payments…</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#f7f8fa" }}>
      <View style={{ padding: 16, paddingBottom: 0 }}>
        <Text style={{ fontSize: 20, fontWeight: "900", color: "#111" }}>Payments</Text>
        <Text style={{ marginTop: 4, color: "#666", fontWeight: "700" }}>
          {counts.all} total • {counts.paid} paid • {counts.pending} pending
        </Text>

        <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
          {STATUS_FILTER.map((f) => (
            <Pressable
              key={f}
              onPress={() => setFilter(f)}
              style={({ pressed }) => ({
                paddingHorizontal: 14,
                paddingVertical: 9,
                borderRadius: 999,
                backgroundColor: filter === f ? "#111" : "white",
                borderWidth: 1,
                borderColor: filter === f ? "#111" : "#e5e7eb",
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <Text
                style={{
                  fontWeight: "900",
                  fontSize: 13,
                  color: filter === f ? "white" : "#374151",
                  textTransform: "capitalize",
                }}
              >
                {f} ({counts[f] ?? 0})
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingTop: 12 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {filtered.length === 0 ? (
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
            <Text style={{ fontWeight: "900", color: "#111" }}>No records</Text>
            <Text style={{ marginTop: 6, color: "#666" }}>
              {filter === "paid" ? "No paid appointments yet." : "No pending payments."}
            </Text>
          </View>
        ) : (
          filtered.map((appt) => (
            <PaymentRow key={appt._id || appt.id} appt={appt} onMarkPaid={onMarkPaid} />
          ))
        )}
      </ScrollView>
    </View>
  );
}
