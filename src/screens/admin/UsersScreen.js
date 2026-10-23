import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { usersApi } from "../../services/api";

const ROLES = ["all", "patient", "doctor", "reception", "admin"];

const ROLE_COLORS = {
  admin: { bg: "#fef3c7", text: "#92400e", border: "#fde68a" },
  doctor: { bg: "#d1fae5", text: "#065f46", border: "#a7f3d0" },
  reception: { bg: "#dbeafe", text: "#1e40af", border: "#bfdbfe" },
  patient: { bg: "#ede9fe", text: "#5b21b6", border: "#ddd6fe" },
};

function RolePill({ role }) {
  const c = ROLE_COLORS[role] || ROLE_COLORS.patient;
  return (
    <View
      style={{
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 999,
        backgroundColor: c.bg,
        borderWidth: 1,
        borderColor: c.border,
      }}
    >
      <Text style={{ fontSize: 11, fontWeight: "900", color: c.text, textTransform: "uppercase" }}>
        {role}
      </Text>
    </View>
  );
}

function UserCard({ user, onChangeRole, onDeleteUser }) {
  const [changing, setChanging] = useState(false);

  const handleChange = (newRole) => {
    Alert.alert(
      "Change Role",
      `Set ${user.name} as ${newRole}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: async () => {
            try {
              setChanging(true);
              await usersApi.changeRole(user.id, newRole);
              onChangeRole(user.id, newRole);
            } catch (e) {
              Alert.alert("Error", e?.message || "Failed to change role");
            } finally {
              setChanging(false);
            }
          },
        },
      ]
    );
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete User",
      `Are you sure you want to delete ${user.name}? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setChanging(true);
              await usersApi.deleteUser(user.id);
              onDeleteUser(user.id);
            } catch (e) {
              Alert.alert("Error", e?.message || "Failed to delete user");
            } finally {
              setChanging(false);
            }
          },
        },
      ]
    );
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
        <View style={{ flex: 1, marginRight: 10 }}>
          <Text style={{ fontWeight: "900", fontSize: 15, color: "#111" }}>{user.name}</Text>
          <Text style={{ marginTop: 3, color: "#666", fontWeight: "700", fontSize: 13 }}>{user.phone}</Text>
          {!!user.department && (
            <Text style={{ marginTop: 3, color: "#888", fontSize: 12 }}>{user.department}</Text>
          )}
          <Text style={{ marginTop: 3, color: "#aaa", fontSize: 11 }}>
            Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-PK", { year: "numeric", month: "short", day: "numeric" }) : "—"}
          </Text>
        </View>
        <RolePill role={user.role} />
      </View>

      {/* Role change & delete buttons */}
      <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8, marginTop: 12 }}>
        {["patient", "doctor", "reception", "admin"]
          .filter((r) => r !== user.role)
          .map((r) => (
            <Pressable
              key={r}
              onPress={() => handleChange(r)}
              disabled={changing}
              style={({ pressed }) => ({
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 10,
                backgroundColor: changing ? "#f3f4f6" : "#f9fafb",
                borderWidth: 1,
                borderColor: "#e5e7eb",
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <Text style={{ fontSize: 12, fontWeight: "900", color: "#374151" }}>→ {r}</Text>
            </Pressable>
          ))}

        <Pressable
          onPress={handleDelete}
          disabled={changing}
          style={({ pressed }) => ({
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 10,
            backgroundColor: "#fef2f2",
            borderWidth: 1,
            borderColor: "#fecaca",
            opacity: pressed ? 0.8 : 1,
            marginLeft: "auto",
          })}
        >
          <Text style={{ fontSize: 12, fontWeight: "900", color: "#b91c1c" }}>🗑️ Delete</Text>
        </Pressable>

        {changing && <ActivityIndicator size="small" />}
      </View>
    </View>
  );
}

export default function UsersScreen() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [roleFilter, setRoleFilter] = useState("all");
  const [q, setQ] = useState("");

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await usersApi.allUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (e) {
      Alert.alert("Error", e?.message || "Failed to load users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchUsers();
    setRefreshing(false);
  }, [fetchUsers]);

  const onChangeRole = useCallback((userId, newRole) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
  }, []);

  const onDeleteUser = useCallback((userId) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  }, []);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return users.filter((u) => {
      const matchRole = roleFilter === "all" || u.role === roleFilter;
      const matchQ =
        !query ||
        u.name.toLowerCase().includes(query) ||
        u.phone.includes(query) ||
        (u.department || "").toLowerCase().includes(query);
      return matchRole && matchQ;
    });
  }, [users, roleFilter, q]);

  const counts = useMemo(() => {
    const c = { all: users.length, patient: 0, doctor: 0, reception: 0, admin: 0 };
    users.forEach((u) => { if (c[u.role] !== undefined) c[u.role]++; });
    return c;
  }, [users]);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10, color: "#666" }}>Loading users…</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#f7f8fa" }}>
      {/* Search */}
      <View style={{ padding: 16, paddingBottom: 0 }}>
        <Text style={{ fontSize: 20, fontWeight: "900", color: "#111" }}>Users</Text>
        <Text style={{ marginTop: 4, color: "#666", fontWeight: "700" }}>
          {users.length} total • {counts.doctor} doctors • {counts.patient} patients
        </Text>

        <View
          style={{
            marginTop: 12,
            backgroundColor: "white",
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#e5e7eb",
            paddingHorizontal: 14,
            paddingVertical: 10,
          }}
        >
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="Search by name, phone, department…"
            style={{ fontSize: 14 }}
          />
        </View>

        {/* Role filter chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
          <View style={{ flexDirection: "row", gap: 8, paddingBottom: 4 }}>
            {ROLES.map((r) => (
              <Pressable
                key={r}
                onPress={() => setRoleFilter(r)}
                style={({ pressed }) => ({
                  paddingHorizontal: 14,
                  paddingVertical: 9,
                  borderRadius: 999,
                  backgroundColor: roleFilter === r ? "#111" : "white",
                  borderWidth: 1,
                  borderColor: roleFilter === r ? "#111" : "#e5e7eb",
                  opacity: pressed ? 0.85 : 1,
                })}
              >
                <Text
                  style={{
                    fontWeight: "900",
                    fontSize: 13,
                    color: roleFilter === r ? "white" : "#374151",
                    textTransform: "capitalize",
                  }}
                >
                  {r} ({counts[r] ?? 0})
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
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
            <Text style={{ fontWeight: "900", color: "#111" }}>No users found</Text>
            <Text style={{ marginTop: 6, color: "#666" }}>Try adjusting your filters</Text>
          </View>
        ) : (
          filtered.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              onChangeRole={onChangeRole}
              onDeleteUser={onDeleteUser}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}
