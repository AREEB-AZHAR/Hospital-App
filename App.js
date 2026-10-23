import React from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import RootNavigator from "./src/navigation/RootNavigator";
import { AuthProvider } from "./src/context/AuthContext";
import { AppDataProvider } from "./src/context/AppDataContext";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Rendering Error</Text>
          <Text style={styles.errorSubtitle}>
            An unexpected error occurred while rendering the application:
          </Text>
          <ScrollView style={styles.errorBox}>
            <Text style={styles.errorMessage}>
              {String(this.state.error?.message || this.state.error)}
            </Text>
            {this.state.error?.stack ? (
              <Text style={styles.errorStack}>
                {String(this.state.error.stack)}
              </Text>
            ) : null}
          </ScrollView>
          <Pressable
            onPress={() => this.setState({ hasError: false, error: null, errorInfo: null })}
            style={styles.retryBtn}
          >
            <Text style={styles.retryBtnText}>Retry / Reload App</Text>
          </Pressable>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 24,
    justifyContent: "center",
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#EF4444",
    marginBottom: 6,
  },
  errorSubtitle: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 16,
  },
  errorBox: {
    maxHeight: 280,
    backgroundColor: "#FEF2F2",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  errorMessage: {
    fontSize: 14,
    fontWeight: "700",
    color: "#991B1B",
    marginBottom: 8,
  },
  errorStack: {
    fontSize: 11,
    color: "#7F1D1D",
    fontFamily: "monospace",
  },
  retryBtn: {
    marginTop: 20,
    backgroundColor: "#0D6EFD",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  retryBtnText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 15,
  },
});

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppDataProvider>
          <RootNavigator />
        </AppDataProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
