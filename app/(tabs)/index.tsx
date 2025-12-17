import React, { useState } from 'react';
import {
  FlatList,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

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
  { id: '1', title: 'Water (15 Liters)', completed: false, points: 10, category: 'Basic' },
  { id: '2', title: 'Flashlight & Batteries', completed: false, points: 15, category: 'Gear' },
  { id: '3', title: 'First Aid Kit', completed: false, points: 20, category: 'Health' },
  { id: '4', title: 'Canned Food (5 Days)', completed: false, points: 10, category: 'Basic' },
  { id: '5', title: 'Whistle', completed: false, points: 5, category: 'Gear' },
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
          setTotalPoints(prev => prev + item.points);
          
        } else {
          setTotalPoints(prev => prev - item.points);
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
              { width: `${(items.filter(i => i.completed).length / items.length) * 100}%` }
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {items.filter(i => i.completed).length} of {items.length} items collected
        </Text>
      </View>

      {/* LIST SECTION */}
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA', 
    paddingTop: 40, 
  },
  header: {
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 20,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A202C',
  },
  subtitle: {
    fontSize: 16,
    color: '#718096',
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 12,
  },
  stat: {
    backgroundColor: '#EDF2F7',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A5568',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  progressSection: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 8,
  },
  progressBarBg: {
    height: 12,
    backgroundColor: '#E2E8F0',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#48BB78', 
    borderRadius: 6,
  },
  progressText: {
    fontSize: 14,
    color: '#718096',
    marginTop: 6,
    textAlign: 'right',
  },
  list: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  item: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  itemCompleted: {
    backgroundColor: '#F0FFF4', 
    borderColor: '#C6F6D5',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#CBD5E0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  checkboxChecked: {
    backgroundColor: '#48BB78',
    borderColor: '#48BB78',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  itemContent: {
    flex: 1,
  },
  itemText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
  },
  itemCategory: {
    fontSize: 12,
    color: '#A0AEC0',
    marginTop: 2,
  },
  textCompleted: {
    textDecorationLine: 'line-through',
    color: '#A0AEC0',
  },
  pointsBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  pointsText: {
    color: '#D97706',
    fontSize: 12,
    fontWeight: 'bold',
  },
});