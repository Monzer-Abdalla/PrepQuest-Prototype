import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { BorderRadius, Colors, Shadow, Spacing } from "../constants/theme";
import { WeatherData } from "../services/weatherService";

interface WeatherStripProps {
  weather: WeatherData;
  alertActive: boolean;
}

function conditionEmoji(id: number): string {
  if (id >= 200 && id < 300) return "⛈️";
  if (id >= 300 && id < 400) return "🌦️";
  if (id >= 500 && id < 600) return "🌧️";
  if (id >= 600 && id < 700) return "❄️";
  if (id === 731 || id === 751 || id === 761 || id === 762) return "🌪️";
  if (id >= 700 && id < 800) return "🌫️";
  if (id === 800) return "☀️";
  if (id === 801 || id === 802) return "🌤️";
  return "☁️";
}

export default function WeatherStrip({ weather, alertActive }: WeatherStripProps) {
  const bg = alertActive ? "#FFFBEB" : Colors.neutral.surface;
  const borderColor = alertActive ? "#FCD34D" : Colors.neutral.border;

  return (
    <View style={[styles.strip, { backgroundColor: bg, borderColor }]}>
      <View style={styles.row}>
        <View style={styles.left}>
          <Text style={styles.emoji}>{conditionEmoji(weather.conditionId)}</Text>
          <View>
            <View style={styles.cityRow}>
              <Text style={styles.city}>📍 {weather.city}</Text>
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>LIVE</Text>
              </View>
            </View>
            <Text style={styles.description}>{weather.description}</Text>
          </View>
        </View>
        <Text style={styles.temp}>{weather.temp}°C</Text>
      </View>
      <View style={styles.metaRow}>
        <Text style={styles.meta}>Feels like {weather.feelsLike}°C</Text>
        <Text style={styles.dot}>·</Text>
        <Text style={styles.meta}>Humidity {weather.humidity}%</Text>
        <Text style={styles.dot}>·</Text>
        <Text style={styles.meta}>Wind {weather.windKph} km/h</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  strip: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.xs,
    marginBottom: Spacing.xs,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    ...Shadow.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  emoji: {
    fontSize: 28,
    marginRight: 4,
  },
  cityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  city: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.neutral.textPrimary,
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary.bg,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary.main,
  },
  liveText: {
    fontSize: 9,
    fontWeight: "800",
    color: Colors.primary.dark,
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 11,
    color: Colors.neutral.textSecondary,
    marginTop: 1,
    textTransform: "capitalize",
  },
  temp: {
    fontSize: 26,
    fontWeight: "700",
    color: Colors.neutral.textPrimary,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  meta: {
    fontSize: 11,
    color: Colors.neutral.textSecondary,
  },
  dot: {
    fontSize: 11,
    color: Colors.neutral.disabled,
  },
});
