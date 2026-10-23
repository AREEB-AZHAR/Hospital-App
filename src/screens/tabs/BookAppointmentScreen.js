import React, { useMemo, useState } from "react";
import { View, Text, Pressable, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { appointmentsApi } from "../../services/api";

const TIME_SLOTS = [
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
];

function formatDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function BookAppointmentScreen({ route, navigation }) {
  const doctorId = route?.params?.doctorId;
  const doctorName = route?.params?.doctorName || "Selected Doctor";
  const department = route?.params?.department || "General";

  const [dateObj, setDateObj] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [time, setTime] = useState(null);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const onConfirm = async () => {
    if (!doctorId || !time) return;

    try {
      setErr("");
      setSaving(true);

      await appointmentsApi.create({
        doctorId,
        department,
        date: formatDate(dateObj),
        time,
      });

      navigation.navigate("Tabs", { screen: "Appointments" });
    } catch (e) {
      setErr(e?.message || "Failed to book appointment");
    } finally {
      setSaving(false);
    }
  };

  if (!doctorId) {
    return (
      <View style={{ flex: 1, backgroundColor: "#f7f8fa", padding: 16, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ fontSize: 18, fontWeight: "900", color: "#111" }}>No doctor selected</Text>
        <Text style={{ marginTop: 8, color: "#666" }}>Please go back and select a doctor first.</Text>
        <Pressable
          onPress={() => navigation.navigate("Find Doctor")}
          style={{ marginTop: 20, backgroundColor: "#111", padding: 14, borderRadius: 14 }}
        >
          <Text style={{ color: "white", fontWeight: "900" }}>Find a Doctor</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#f7f8fa", padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: "900", color: "#111" }}>Book Appointment</Text>

      <View style={{ marginTop: 16, backgroundColor: "white", padding: 16, borderRadius: 16, borderWidth: 1, borderColor: "#eee" }}>
        <Text style={{ fontSize: 13, fontWeight: "900", color: "#888" }}>BOOKING WITH</Text>
        <Text style={{ fontSize: 18, fontWeight: "900", color: "#111", marginTop: 4 }}>{doctorName}</Text>
        <Text style={{ fontSize: 14, color: "#666", marginTop: 2 }}>{department}</Text>
      </View>

      <Text style={{ fontSize: 14, fontWeight: "900", color: "#111", marginTop: 24, marginBottom: 8 }}>SELECT DATE</Text>
      <Pressable 
        onPress={() => setShowPicker(true)} 
        style={({ pressed }) => ({
          backgroundColor: "white",
          padding: 16,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: "#eee",
          opacity: pressed ? 0.9 : 1
        })}
      >
        <Text style={{ fontSize: 16, fontWeight: "800", color: "#111" }}>📅 {formatDate(dateObj)}</Text>
      </Pressable>

      {showPicker && (
        <DateTimePicker
          value={dateObj}
          mode="date"
          minimumDate={new Date()}
          onChange={(_, d) => {
            setShowPicker(Platform.OS === "ios");
            if (d) setDateObj(d);
          }}
        />
      )}

      <Text style={{ fontSize: 14, fontWeight: "900", color: "#111", marginTop: 24, marginBottom: 8 }}>SELECT TIME</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
        {TIME_SLOTS.map((slot) => {
          const isSelected = time === slot;
          return (
            <Pressable 
              key={slot} 
              onPress={() => setTime(slot)} 
              style={{
                paddingHorizontal: 16,
                paddingVertical: 12,
                backgroundColor: isSelected ? "#111" : "white",
                borderRadius: 12,
                borderWidth: 1,
                borderColor: isSelected ? "#111" : "#e5e7eb",
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: "900", color: isSelected ? "white" : "#374151" }}>
                {slot}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {err ? <Text style={{ color: "#dc2626", marginTop: 16, fontWeight: "700" }}>{err}</Text> : null}

      <Pressable
        onPress={onConfirm}
        disabled={!time || saving}
        style={({ pressed }) => ({
          marginTop: "auto",
          marginBottom: 20,
          backgroundColor: !time ? "#e5e7eb" : "#111",
          padding: 18,
          borderRadius: 16,
          alignItems: "center",
          opacity: pressed ? 0.9 : 1,
        })}
      >
        <Text style={{ color: !time ? "#9ca3af" : "white", fontWeight: "900", fontSize: 16 }}>
          {saving ? "Confirming..." : "Confirm Booking"}
        </Text>
      </Pressable>
    </View>
  );
}

