import React from "react";
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import RiskBar from "./RiskBar";
import { colors } from "../theme/colors";

// The 5 risk signals shown in the breakdown
const SIGNALS = [
  { key: "equipment_score", label: "Equipment Activity", weight: "30%" },
  { key: "ventilation_score", label: "Ventilation Status", weight: "25%" },
  { key: "exposure_score", label: "Worker Exposure Time", weight: "25%" },
  { key: "ppe_score", label: "PPE Compliance", weight: "15%" },
  { key: "environment_score", label: "Environmental Conditions", weight: "5%" },
];

function getRiskColor(level) {
  if (level === "HIGH") return colors.riskHigh;
  if (level === "MEDIUM") return colors.riskMedium;
  return colors.riskLow;
}

function getScoreColor(score) {
  if (score >= 70) return colors.riskHigh;
  if (score >= 40) return colors.riskMedium;
  return colors.riskLow;
}

export default function ZoneDetailModal({ visible, zone, workers, onClose }) {
  // Safety guard — only null before any zone has been selected
  if (!zone) return null;

  const riskColor = getRiskColor(zone.risk_level);

  // Show only workers that belong to this zone
  const zoneWorkers = workers.filter((w) => w.zone_id === zone.zone_id);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* Full-screen overlay with dark backdrop */}
      <View style={styles.overlay}>
        {/* Tapping the backdrop closes the modal */}
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        />

        {/* Bottom sheet panel */}
        <View style={styles.panel}>
          {/* Drag handle */}
          <View style={styles.handle} />

          {/* Zone name + close button */}
          <View style={styles.panelHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.panelTitle} numberOfLines={1}>
                {zone.zone_name}
              </Text>
              <View style={[styles.levelBadge, { backgroundColor: riskColor + "25" }]}>
                <Text style={[styles.levelText, { color: riskColor }]}>
                  {zone.risk_level} RISK
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Big composite score */}
          <View style={styles.bigScoreRow}>
            <Text style={[styles.bigScore, { color: riskColor }]}>
              {Math.round(zone.risk_score)}
            </Text>
            <Text style={styles.bigScoreLabel}>{"/100\nComposite Score"}</Text>
          </View>

          {/* Scrollable breakdown */}
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* 5 signal breakdown */}
            <Text style={styles.sectionHeader}>RISK SIGNAL BREAKDOWN</Text>

            {SIGNALS.map((sig) => {
              const sigScore = zone[sig.key] ?? 0;
              const sigColor = getScoreColor(sigScore);
              return (
                <View key={sig.key} style={styles.signalRow}>
                  <View style={styles.signalTopRow}>
                    <Text style={styles.signalLabel}>{sig.label}</Text>
                    <Text style={styles.signalWeight}>weight {sig.weight}</Text>
                  </View>
                  <View style={styles.signalBarRow}>
                    <View style={{ flex: 1, marginRight: 10 }}>
                      <RiskBar value={sigScore} />
                    </View>
                    <Text style={[styles.signalScore, { color: sigColor }]}>
                      {Math.round(sigScore)}
                    </Text>
                  </View>
                </View>
              );
            })}

            {/* Workers in this zone */}
            <Text style={[styles.sectionHeader, { marginTop: 20 }]}>
              WORKERS IN THIS ZONE ({zoneWorkers.length})
            </Text>

            {zoneWorkers.length === 0 ? (
              <Text style={styles.noWorkers}>No workers assigned to this zone.</Text>
            ) : (
              zoneWorkers.map((worker) => {
                const expColor = getScoreColor(worker.exposure_score);
                return (
                  <View key={worker.worker_id} style={styles.workerCard}>
                    {/* Initial avatar */}
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>
                        {worker.worker_name.charAt(0).toUpperCase()}
                      </Text>
                    </View>

                    {/* Name + time + bar */}
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={styles.workerName}>{worker.worker_name}</Text>
                      <Text style={styles.workerTime}>
                        {worker.time_in_zone_minutes} min continuous
                      </Text>
                      <View style={{ marginTop: 5 }}>
                        <RiskBar value={worker.exposure_score} />
                      </View>
                    </View>

                    {/* Exposure score number */}
                    <Text style={[styles.workerScore, { color: expColor }]}>
                      {Math.round(worker.exposure_score)}
                    </Text>
                  </View>
                );
              })
            )}

            <View style={{ height: 30 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.65)",
  },
  panel: {
    backgroundColor: colors.cardBackground,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: "88%",
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderLight,
    alignSelf: "center",
    marginBottom: 18,
  },
  panelHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  panelTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 6,
  },
  levelBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  levelText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  closeBtnText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  bigScoreRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 16,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  bigScore: {
    fontSize: 60,
    fontWeight: "800",
    lineHeight: 68,
  },
  bigScoreLabel: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 10,
  },
  sectionHeader: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 14,
  },
  signalRow: {
    marginBottom: 16,
  },
  signalTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  signalLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "500",
  },
  signalWeight: {
    color: colors.textMuted,
    fontSize: 11,
  },
  signalBarRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  signalScore: {
    fontSize: 14,
    fontWeight: "700",
    width: 28,
    textAlign: "right",
  },
  workerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.accent + "25",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: colors.accent,
    fontSize: 16,
    fontWeight: "700",
  },
  workerName: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "600",
  },
  workerTime: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 1,
    marginBottom: 4,
  },
  workerScore: {
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 12,
    width: 32,
    textAlign: "center",
  },
  noWorkers: {
    color: colors.textMuted,
    fontSize: 13,
    fontStyle: "italic",
    textAlign: "center",
    paddingVertical: 8,
  },
});