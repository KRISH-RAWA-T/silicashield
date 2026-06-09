import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../theme/colors";

function getSeverityColor(severity) {
  const s = (severity || "").toUpperCase();
  if (s === "CRITICAL") return colors.riskHigh;
  if (s === "WARNING") return colors.riskMedium;
  return colors.accent;
}

function getTypeIcon(type) {
  const t = (type || "").toUpperCase();
  if (t === "PPE") return "🛡";
  if (t === "COMPOSITE") return "⚠️";
  if (t === "VENTILATION") return "💨";
  if (t === "EQUIPMENT") return "⚙️";
  return "🔔";
}

export default function AlertCard({ alert }) {
  const { severity, message, zone_id, type } = alert;
  const sevColor = getSeverityColor(severity);

  return (
    <View style={[styles.card, { borderLeftColor: sevColor }]}>
      {/* Header: icon + type on left, severity badge on right */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.icon}>{getTypeIcon(type)}</Text>
          <Text style={styles.typeText}>{type}</Text>
        </View>
        <View style={[styles.sevBadge, { backgroundColor: sevColor + "25" }]}>
          <Text style={[styles.sevText, { color: sevColor }]}>{severity}</Text>
        </View>
      </View>

      {/* Alert message */}
      <Text style={styles.message}>{message}</Text>

      {/* Zone label */}
      <Text style={styles.zoneLabel}>Zone {zone_id}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 4, // overrides borderWidth on left side only
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    fontSize: 15,
    marginRight: 6,
  },
  typeText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  sevBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  sevText: {
    fontSize: 11,
    fontWeight: "700",
  },
  message: {
    color: colors.textPrimary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  zoneLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "500",
  },
});