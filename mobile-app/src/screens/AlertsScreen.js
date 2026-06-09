import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { fetchAlerts } from "../api/client";
import AlertCard from "../components/AlertCard";
import { colors } from "../theme/colors";

export default function AlertsScreen() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  async function loadAlerts(isRefresh = false) {
    if (isRefresh) setRefreshing(true);
    setError(null);

    try {
      const data = await fetchAlerts();
      setAlerts(data.alerts || []);
    } catch (err) {
      setError("Cannot reach the backend.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadAlerts();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.loadingText}>Loading alerts...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => loadAlerts()}>
          <Text style={styles.retryBtnText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (alerts.length === 0) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <Text style={styles.emptyIcon}>✅</Text>
        <Text style={styles.emptyTitle}>All Clear</Text>
        <Text style={styles.emptySubtitle}>
          {"No active alerts detected.\nAll zones are within safe limits."}
        </Text>
      </View>
    );
  }

  const criticalCount = alerts.filter((a) => a.severity === "CRITICAL").length;
  const warningCount = alerts.filter((a) => a.severity === "WARNING").length;

  return (
    <View style={styles.container}>
      {/* Severity count badges */}
      <View style={styles.countRow}>
        {criticalCount > 0 && (
          <View style={[styles.countBadge, { backgroundColor: colors.riskHigh + "20" }]}>
            <Text style={[styles.countText, { color: colors.riskHigh }]}>
              {criticalCount} CRITICAL
            </Text>
          </View>
        )}
        {warningCount > 0 && (
          <View style={[styles.countBadge, { backgroundColor: colors.riskMedium + "20" }]}>
            <Text style={[styles.countText, { color: colors.riskMedium }]}>
              {warningCount} WARNING
            </Text>
          </View>
        )}
      </View>

      <Text style={styles.sectionLabel}>ACTIVE ALERTS</Text>

      <FlatList
        data={alerts}
        keyExtractor={(item) => item.alert_id}
        renderItem={({ item }) => <AlertCard alert={item} />}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadAlerts(true)}
            tintColor={colors.accent}
            colors={[colors.accent]}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  countRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  countBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginRight: 8,
  },
  countText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  sectionLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 10,
    marginLeft: 4,
  },
  listContent: {
    paddingBottom: 20,
  },
  center: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  loadingText: {
    color: colors.textSecondary,
    marginTop: 12,
    fontSize: 14,
  },
  errorIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  errorText: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: "center",
    marginBottom: 16,
  },
  retryBtn: {
    backgroundColor: colors.accent,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  emptyIcon: {
    fontSize: 52,
    marginBottom: 14,
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
  },
  emptySubtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
  },
});