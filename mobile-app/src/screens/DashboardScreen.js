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
import { fetchZones, fetchWorkers } from "../api/client";
import RiskBar from "../components/RiskBar";
import ZoneDetailModal from "../components/ZoneDetailModal";
import { colors } from "../theme/colors";

function getRiskColor(level) {
  if (level === "HIGH") return colors.riskHigh;
  if (level === "MEDIUM") return colors.riskMedium;
  return colors.riskLow;
}

function StatCard({ label, value, valueColor }) {
  return (
    <View style={styles.statCard}>
      <Text style={[styles.statValue, { color: valueColor || colors.textPrimary }]}>
        {value}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function DashboardScreen() {
  const [zones, setZones] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [selectedZone, setSelectedZone] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  async function loadData(isRefresh = false) {
    if (isRefresh) setRefreshing(true);
    setError(null);

    try {
      // Load zones and workers at the same time for speed
      const [zonesData, workersData] = await Promise.all([
        fetchZones(),
        fetchWorkers(),
      ]);
      setZones(zonesData.zones || []);
      setWorkers(workersData.workers || []);
    } catch (err) {
      setError(
        "Cannot reach the backend.\n\n" +
          "Check that:\n" +
          "1. Backend is running with --host 0.0.0.0\n" +
          "2. Your IP in client.js is correct\n" +
          "3. Phone and laptop are on the same Wi-Fi"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function handleZoneTap(zone) {
    setSelectedZone(zone);
    setModalVisible(true);
  }

  function closeModal() {
    setModalVisible(false);
    // Keep selectedZone in state — clears after modal exit animation completes
  }

  const highRiskCount = zones.filter((z) => z.risk_level === "HIGH").length;

  function renderZone({ item }) {
    const riskColor = getRiskColor(item.risk_level);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => handleZoneTap(item)}
        activeOpacity={0.72}
      >
        {/* Colored left accent strip */}
        <View style={[styles.cardAccent, { backgroundColor: riskColor }]} />

        {/* Card body */}
        <View style={styles.cardContent}>
          {/* Top row: name + level badge */}
          <View style={styles.cardHeader}>
            <Text style={styles.zoneName} numberOfLines={1}>
              {item.zone_name}
            </Text>
            <View style={[styles.levelBadge, { backgroundColor: riskColor + "25" }]}>
              <Text style={[styles.levelText, { color: riskColor }]}>
                {item.risk_level}
              </Text>
            </View>
          </View>

          {/* Animated risk bar + score number */}
          <View style={styles.scoreRow}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <RiskBar value={item.risk_score} />
            </View>
            <Text style={[styles.scoreNumber, { color: riskColor }]}>
              {Math.round(item.risk_score)}
            </Text>
          </View>

          {/* Mini signal values */}
          <View style={styles.miniSignalRow}>
            <Text style={styles.miniSignal}>⚙ {Math.round(item.equipment_score)}</Text>
            <Text style={styles.miniSignal}>💨 {Math.round(item.ventilation_score)}</Text>
            <Text style={styles.miniSignal}>⏱ {Math.round(item.exposure_score)}</Text>
            <Text style={styles.miniSignal}>🛡 {Math.round(item.ppe_score)}</Text>
          </View>

          <Text style={styles.tapHint}>Tap for full breakdown →</Text>
        </View>
      </TouchableOpacity>
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.loadingText}>Connecting to backend...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => loadData()}>
          <Text style={styles.retryBtnText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Stats summary row */}
      <View style={styles.statsRow}>
        <StatCard
          label="Zones"
          value={zones.length}
          valueColor={colors.accent}
        />
        <StatCard
          label="High Risk"
          value={highRiskCount}
          valueColor={highRiskCount > 0 ? colors.riskHigh : colors.riskLow}
        />
        <StatCard
          label="Workers"
          value={workers.length}
          valueColor={colors.textPrimary}
        />
      </View>

      <Text style={styles.sectionLabel}>ZONE RISK MONITOR</Text>

      <FlatList
        data={zones}
        keyExtractor={(item) => item.zone_id}
        renderItem={renderZone}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadData(true)}
            tintColor={colors.accent}
            colors={[colors.accent]}
          />
        }
      />

      {/* Zone detail bottom sheet */}
      <ZoneDetailModal
        visible={modalVisible}
        zone={selectedZone}
        workers={workers}
        onClose={closeModal}
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
  // Stats
  statsRow: {
    flexDirection: "row",
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statValue: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: "600",
    textTransform: "uppercase",
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
  // Zone card
  card: {
    flexDirection: "row",
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  cardAccent: {
    width: 4,
  },
  cardContent: {
    flex: 1,
    padding: 14,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  zoneName: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  levelText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  scoreNumber: {
    fontSize: 20,
    fontWeight: "700",
    width: 36,
    textAlign: "right",
  },
  miniSignalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  miniSignal: {
    color: colors.textMuted,
    fontSize: 12,
  },
  tapHint: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: "500",
  },
  // Center states
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
    lineHeight: 22,
    marginBottom: 20,
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
});