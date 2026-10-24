import React, { useMemo, useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { chatApi } from "../../services/api";
import { useTheme } from "../../context/ThemeContext";
import { radii, shadows } from "../../theme";
import { SearchIcon, ChatBubbleIcon } from "../../components/icons";

function formatTime(isoStr) {
  if (!isoStr) return "";
  const d = new Date(isoStr);
  const now = new Date();
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h`;
  return d.toLocaleDateString();
}

function initials(name = "") {
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? "?";
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

export default function ChatListScreen({ navigation }) {
  const { colors, isDark } = useTheme();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState("");

  const loadContacts = useCallback(async () => {
    try {
      const data = await chatApi.contacts();
      if (Array.isArray(data)) setChats(data);
    } catch (err) {
      console.log("Failed to load contacts", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadContacts();
    setRefreshing(false);
  }, [loadContacts]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return chats;
    return chats.filter((c) => {
      return (
        c.name.toLowerCase().includes(q) ||
        (c.last ?? "").toLowerCase().includes(q) ||
        (c.department ?? "").toLowerCase().includes(q)
      );
    });
  }, [query, chats]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search */}
      <View
        style={[
          styles.searchWrap,
          {
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 12,
            backgroundColor: colors.surface,
            borderColor: colors.surfaceBorder,
          },
        ]}
      >
        <SearchIcon size={18} color={colors.textMuted} strokeWidth={2} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search chats…"
          placeholderTextColor={colors.textMuted}
          style={[styles.search, { flex: 1, marginLeft: 8, borderWidth: 0, paddingHorizontal: 0, color: colors.textPrimary }]}
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="while-editing"
        />
      </View>

      {loading && !refreshing ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ marginTop: 10, color: colors.textMuted }}>Loading chats…</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id || item._id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          contentContainerStyle={filtered.length === 0 ? { flex: 1, paddingBottom: 120 } : { paddingBottom: 120 }}
          ItemSeparatorComponent={() => <View style={[styles.sep, { backgroundColor: colors.surfaceBorder }]} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <ChatBubbleIcon size={40} color={colors.primary} strokeWidth={1.8} />
              <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No Chats Found</Text>
              <Text style={[styles.emptySub, { color: colors.textMuted }]}>No active medical conversations yet.</Text>
            </View>
          }
          renderItem={({ item }) => {
            const timeText = item.lastAt ? formatTime(item.lastAt) : (item.time || "");
            const lastText = item.last || (item.department ? `${item.department} • Tap to message` : "Tap to message");
            return (
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.row}
                onPress={() =>
                  navigation.navigate("ChatRoom", {
                    chatId: item.id || item._id,
                    name: item.name,
                  })
                }
              >
                {/* Avatar */}
                <View style={styles.avatarWrap}>
                  <View
                    style={[
                      styles.avatar,
                      {
                        backgroundColor: isDark
                          ? "rgba(59, 130, 246, 0.2)"
                          : "rgba(13, 110, 253, 0.1)",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.avatarText,
                        { color: isDark ? colors.primary : "#163b8f" },
                      ]}
                    >
                      {initials(item.name)}
                    </Text>
                  </View>
                  {item.online ? (
                    <View
                      style={[
                        styles.onlineDot,
                        { borderColor: colors.background },
                      ]}
                    />
                  ) : null}
                </View>

                {/* Text */}
                <View style={{ flex: 1 }}>
                  <View style={styles.topLine}>
                    <Text style={[styles.name, { color: colors.textPrimary }]} numberOfLines={1}>
                      {item.name}
                    </Text>
                    {timeText ? (
                      <Text style={[styles.time, { color: colors.textMuted }]}>
                        {timeText}
                      </Text>
                    ) : null}
                  </View>

                  <View style={styles.bottomLine}>
                    <Text style={[styles.last, { color: colors.textSecondary }]} numberOfLines={1}>
                      {lastText}
                    </Text>

                    {item.unread > 0 ? (
                      <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
                        <Text style={styles.unreadText}>
                          {item.unread > 9 ? "9+" : String(item.unread)}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 14, backgroundColor: "#fff" },

  searchWrap: {
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 14,
    backgroundColor: "#f7f7f7",
  },
  search: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#111",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },

  sep: { height: 1, backgroundColor: "#f0f0f0" },

  avatarWrap: { marginRight: 12 },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e6eefc",
  },
  avatarText: { fontWeight: "800", fontSize: 14, color: "#163b8f" },
  onlineDot: {
    position: "absolute",
    right: 2,
    bottom: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#22c55e",
    borderWidth: 2,
    borderColor: "#fff",
  },

  topLine: { flexDirection: "row", alignItems: "center", gap: 10 },
  name: { flex: 1, fontWeight: "800", fontSize: 15, color: "#111" },
  time: { fontSize: 12, color: "#777" },

  bottomLine: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 3,
    gap: 10,
  },
  last: { flex: 1, color: "#666" },

  unreadBadge: {
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    borderRadius: 10,
    backgroundColor: "#1f6feb",
    alignItems: "center",
    justifyContent: "center",
  },
  unreadText: { color: "#fff", fontWeight: "900", fontSize: 12 },

  empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20 },
  emptyTitle: { fontSize: 16, fontWeight: "900", color: "#111" },
  emptySub: { marginTop: 6, color: "#666" },
});
