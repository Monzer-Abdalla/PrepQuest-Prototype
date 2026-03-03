import React, { useState } from "react";
import {
  FlatList,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors, Typography, Spacing, BorderRadius, Shadow } from "../../src/constants/theme";

interface ChecklistItem {
  id: string;
  title: string;
  completed: boolean;
  points: number;
  category: string;
}

// In a real app, these would come from Firebase.
// For this PROTOTYPE, we use local state to prove the concept works instantly.
const INITIAL_CHECKLIST: ChecklistItem[] = [
  {
    id: "1",
    title: "Water (15 Liters)",
    completed: false,
    points: 10,
    category: "Basic",
  },
  {
    id: "2",
    title: "Flashlight & Batteries",
    completed: false,
    points: 15,
    category: "Gear",
  },
  {
    id: "3",
    title: "First Aid Kit",
    completed: false,
    points: 20,
    category: "Health",
  },
  {
    id: "4",
    title: "Canned Food (5 Days)",
    completed: false,
    points: 10,
    category: "Basic",
  },
  { id: "5", title: "Whistle", completed: false, points: 5, category: "Gear" },
];

export default function App() {
  const [items, setItems] = useState<ChecklistItem[]>(INITIAL_CHECKLIST);
  const [totalPoints, setTotalPoints] = useState<number>(0);
  const [streak, setStreak] = useState<number>(1); // Simulating a 1-day streak

  // --- CORE GAMIFICATION LOGIC ---
  const toggleItem = (id: string) => {
    const updatedItems = items.map((item) => {
      if (item.id === id) {
        const newStatus = !item.completed;

        if (newStatus) {
          setTotalPoints((prev) => prev + item.points);
        } else {
          setTotalPoints((prev) => prev - item.points);
        }

        return { ...item, completed: newStatus };
      }
      return item;
    });
    setItems(updatedItems);
  };

  const renderItem = ({ item }: { item: ChecklistItem }) => (
    <TouchableOpacity
      style={[styles.item, item.completed && styles.itemCompleted]}
      onPress={() => toggleItem(item.id)}
      activeOpacity={0.7}
    >
      <View style={[styles.checkbox, item.completed && styles.checkboxChecked]}>
        {item.completed && <Text style={styles.checkmark}>✓</Text>}
      </View>

      <View style={styles.itemContent}>
        <Text style={[styles.itemText, item.completed && styles.textCompleted]}>
          {item.title}
        </Text>
        <Text style={styles.itemCategory}>{item.category}</Text>
      </View>

      <View style={styles.pointsBadge}>
        <Text style={styles.pointsText}>+{item.points}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* HEADER SECTION: Shows Gamification Stats */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, Monzir</Text>
          <Text style={styles.subtitle}>Let's get prepared!</Text>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>🔥 Streak</Text>
            <Text style={styles.statValue}>{streak}</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>🏆 Score</Text>
            <Text style={styles.statValue}>{totalPoints}</Text>
          </View>
        </View>
      </View>

      {/* PROGRESS BAR SECTION */}
      <View style={styles.progressSection}>
        <Text style={styles.progressTitle}>Your Kit Progress</Text>
        <View style={styles.progressBarBg}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${(items.filter((i) => i.completed).length / items.length) * 100}%`,
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {items.filter((i) => i.completed).length} of {items.length} items
          collected
        </Text>
      </View>

      {/* LIST SECTION */}
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral.background,
    paddingTop: 40,
  },
  header: {
    padding: Spacing.lg,
    backgroundColor: Colors.neutral.surface,
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
    ...Shadow.lg,
    marginBottom: Spacing.md,
  },
  greeting: {
    ...Typography.h1,
    color: Colors.neutral.textPrimary,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.neutral.textSecondary,
    marginTop: Spacing.xs,
  },
  statsRow: {
    flexDirection: "row",
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  stat: {
    backgroundColor: Colors.primary.bg,
    paddingVertical: Spacing.sm + 4,
    paddingHorizontal: Spacing.md + 4,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    flex: 1,
  },
  statLabel: {
    ...Typography.caption,
    fontWeight: "600",
    color: Colors.primary.dark,
    marginBottom: Spacing.xs,
  },
  statValue: {
    ...Typography.h2,
    color: Colors.primary.main,
  },
  progressSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  progressTitle: {
    ...Typography.bodyMedium,
    color: Colors.neutral.textPrimary,
    marginBottom: Spacing.sm,
  },
  progressBarBg: {
    height: 12,
    backgroundColor: Colors.neutral.border,
    borderRadius: BorderRadius.sm,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: Colors.primary.main,
    borderRadius: BorderRadius.sm,
  },
  progressText: {
    ...Typography.caption,
    color: Colors.neutral.textSecondary,
    marginTop: Spacing.xs,
    textAlign: "right",
  },
  list: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 40,
  },
  item: {
    backgroundColor: Colors.neutral.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm + 4,
    borderWidth: 1.5,
    borderColor: Colors.neutral.border,
    ...Shadow.sm,
  },
  itemCompleted: {
    backgroundColor: Colors.primary.bg,
    borderColor: Colors.primary.light,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.sm,
    borderWidth: 2,
    borderColor: Colors.neutral.disabled,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  checkboxChecked: {
    backgroundColor: Colors.primary.main,
    borderColor: Colors.primary.main,
  },
  checkmark: {
    color: Colors.neutral.surface,
    fontSize: 14,
    fontWeight: "bold",
  },
  itemContent: {
    flex: 1,
  },
  itemText: {
    ...Typography.bodyMedium,
    color: Colors.neutral.textPrimary,
  },
  itemCategory: {
    ...Typography.small,
    color: Colors.neutral.textSecondary,
    marginTop: 2,
  },
  textCompleted: {
    textDecorationLine: "line-through",
    color: Colors.neutral.textSecondary,
  },
  pointsBadge: {
    backgroundColor: Colors.accent.amber + '20', // 20 = hex for 12.5% opacity
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.accent.amber + '40',
  },
  pointsText: {
    ...Typography.small,
    color: Colors.accent.orange,
    fontWeight: "700",
  },
});