import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import DashboardScreen from "./src/screens/DashboardScreen";
import AlertsScreen from "./src/screens/AlertsScreen";
import { fetchAlerts } from "./src/api/client";
import { colors } from "./src/theme/colors";

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [alertBadge, setAlertBadge] = useState(0);

  // Fetch alert count once on mount to populate the tab badge
  useEffect(() => {
    fetchAlerts()
      .then((data) => setAlertBadge((data.alerts || []).length))
      .catch(() => {}); // Silently ignore — badge is non-critical
  }, []);

  function renderScreen() {
    if (activeTab === "alerts") return <AlertsScreen />;
    return <DashboardScreen />;
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor={colors.surface} />

        {/* Branded header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.logoBox}>
              <Text style={styles.logoEmoji}>⛏</Text>
            </View>
            <View>
              <Text style={styles.appName}>SilicaShield</Text>
              <Text style={styles.appTagline}>Mine Safety Intelligence</Text>
            </View>
          </View>

          {/* Live indicator pill */}
          <View style={styles.livePill}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        </View>

        {/* Screen content */}
        <View style={styles.content}>{renderScreen()}</View>

        {/* Bottom tab bar */}
        <View style={styles.tabBar}>
          {/* Dashboard tab */}
          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setActiveTab("dashboard")}
          >
            {activeTab === "dashboard" && <View style={styles.tabIndicator} />}
            <Text style={styles.tabIcon}>📊</Text>
            <Text
              style={[
                styles.tabLabel,
                activeTab === "dashboard" && styles.tabLabelActive,
              ]}
            >
              Dashboard
            </Text>
          </TouchableOpacity>

          {/* Alerts tab */}
          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setActiveTab("alerts")}
          >
            {activeTab === "alerts" && <View style={styles.tabIndicator} />}

            {/* Bell icon with badge */}
            <View style={styles.iconWrapper}>
              <Text style={styles.tabIcon}>🔔</Text>
              {alertBadge > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {alertBadge > 9 ? "9+" : alertBadge}
                  </Text>
                </View>
              )}
            </View>

            <Text
              style={[
                styles.tabLabel,
                activeTab === "alerts" && styles.tabLabelActive,
              ]}
            >
              Alerts
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.accent + "22",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  logoEmoji: {
    fontSize: 18,
  },
  appName: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  appTagline: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "500",
  },
  livePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.riskLow + "20",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.riskLow + "40",
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.riskLow,
    marginRight: 5,
  },
  liveText: {
    color: colors.riskLow,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  // Content area
  content: {
    flex: 1,
    backgroundColor: colors.background,
  },
  // Tab bar
  tabBar: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    position: "relative",
  },
  tabIndicator: {
    position: "absolute",
    top: 0,
    left: "30%",
    right: "30%",
    height: 2,
    backgroundColor: colors.accent,
    borderRadius: 1,
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 3,
  },
  iconWrapper: {
    position: "relative",
  },
  tabLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "500",
  },
  tabLabelActive: {
    color: colors.accent,
    fontWeight: "700",
  },
  // Alert badge on bell icon
  badge: {
    position: "absolute",
    top: -4,
    right: -8,
    backgroundColor: colors.riskHigh,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "700",
  },
});