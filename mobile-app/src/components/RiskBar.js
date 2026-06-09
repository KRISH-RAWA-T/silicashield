import React, { useEffect, useRef } from "react";
import { View, Animated, StyleSheet } from "react-native";
import { colors } from "../theme/colors";

function getRiskColor(score) {
  if (score >= 70) return colors.riskHigh;
  if (score >= 40) return colors.riskMedium;
  return colors.riskLow;
}

export default function RiskBar({ value }) {
  const clamped = Math.max(0, Math.min(value ?? 0, 100));
  const barColor = getRiskColor(clamped);

  // Animated value starts at 0 so the bar animates from empty on mount
  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: clamped,
      duration: 700,
      useNativeDriver: false, // must be false — width is a layout property
    }).start();
  }, [clamped]);

  return (
    <View style={styles.track}>
      <Animated.View
        style={[
          styles.fill,
          {
            width: widthAnim.interpolate({
              inputRange: [0, 100],
              outputRange: ["0%", "100%"],
            }),
            backgroundColor: barColor,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: "100%",
    height: 8,
    backgroundColor: "#252630",
    borderRadius: 4,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 4,
  },
});