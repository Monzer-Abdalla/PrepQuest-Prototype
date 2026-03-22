import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { BorderRadius, Colors, Shadow, Spacing } from "../constants/theme";

interface AlertBannerProps {
  visible: boolean;
  title: string;
  message: string;
  onDismiss: () => void;
  onViewKit: () => void;
}

export default function AlertBanner({
  visible,
  title,
  message,
  onDismiss,
  onViewKit,
}: AlertBannerProps) {
  if (!visible) return null;

  return (
    <View style={styles.banner}>
      <View style={styles.leftBorder} />
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.icon}>⚠️</Text>
          <Text style={styles.title}>{title}</Text>
          <TouchableOpacity
            onPress={onDismiss}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.dismiss}>✕</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.message}>{message}</Text>
        <TouchableOpacity style={styles.viewKitBtn} onPress={onViewKit} activeOpacity={0.8}>
          <Text style={styles.viewKitText}>View Kit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    backgroundColor: "#FFFBEB",
    borderRadius: BorderRadius.md,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
    borderWidth: 1,
    borderColor: "#FCD34D",
    overflow: "hidden",
    ...Shadow.sm,
  },
  leftBorder: {
    width: 4,
    backgroundColor: Colors.primary.main,
  },
  content: {
    flex: 1,
    padding: Spacing.sm,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  icon: {
    fontSize: 15,
    marginRight: 6,
  },
  title: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    color: Colors.neutral.textPrimary,
  },
  dismiss: {
    fontSize: 14,
    color: Colors.neutral.textSecondary,
    paddingLeft: 8,
  },
  message: {
    fontSize: 12,
    color: Colors.neutral.textSecondary,
    lineHeight: 17,
    marginBottom: Spacing.sm,
  },
  viewKitBtn: {
    alignSelf: "flex-start",
    backgroundColor: Colors.primary.main,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  viewKitText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#fff",
  },
});
