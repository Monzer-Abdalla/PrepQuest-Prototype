import { getAuth } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  DevSettings,
  FlatList,
  I18nManager,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BorderRadius, Colors, Shadow, Spacing, Typography } from "../../src/constants/theme";
import { app, db } from "../../src/services/firebase";
import AlertBanner from "../../src/components/AlertBanner";
import WeatherStrip from "../../src/components/WeatherStrip";
import { fetchWeather, MOCK_ALERT, AlertData, WeatherData } from "../../src/services/weatherService";
import { Strings, Language } from "../../src/constants/strings";
import { recommend, RecommendationResult } from "../../src/services/questRecommender";

interface ChecklistItem {
  id: string;
  title: string;
  completed: boolean;
  points: number;
  category: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  Basic: Colors.accent.amber,
  Gear: Colors.secondary.main,
  Health: Colors.primary.main,
};

export default function HomeScreen() {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [displayName, setDisplayName] = useState("");
  const [streakCount, setStreakCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [alertVisible, setAlertVisible] = useState(true);
  const [alertData, setAlertData] = useState<AlertData>(MOCK_ALERT);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [highlightedIds, setHighlightedIds] = useState<string[]>([]);
  const [lang, setLang] = useState<Language>('en');
  const seedingRef = useRef(false);
  const streakCheckedRef = useRef(false);
  const listRef = useRef<FlatList>(null);
  const highlightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const uid = getAuth(app).currentUser?.uid ?? "";

  useEffect(() => {
    AsyncStorage.getItem('language').then(function(stored) {
      if (stored === 'ar') {
        setLang('ar');
        if (!I18nManager.isRTL) {
          I18nManager.forceRTL(true);
          if (DevSettings && DevSettings.reload) { DevSettings.reload(); }
        }
      } else {
        setLang('en');
        if (I18nManager.isRTL) {
          I18nManager.forceRTL(false);
          if (DevSettings && DevSettings.reload) { DevSettings.reload(); }
        }
      }
    });
  }, []);

  useEffect(() => {
    if (!uid) return;

    const userUnsub = onSnapshot(doc(db, "users", uid), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setDisplayName(data.displayName ?? "");
        setStreakCount(data.streakCount ?? 0);
      }
    });

    const checklistUnsub = onSnapshot(
      collection(db, "users", uid, "user_checklists"),
      async (snap) => {
        if (snap.empty && !seedingRef.current) {
          seedingRef.current = true;
          await seedChecklist(uid);
          return;
        }
        const loaded: ChecklistItem[] = snap.docs.map((d) => ({
          id: d.id,
          title: d.data().title as string,
          completed: d.data().completed as boolean,
          points: d.data().points as number,
          category: d.data().category as string,
        }));
        loaded.sort((a, b) => a.category.localeCompare(b.category));
        setItems(loaded);
        setLoading(false);
        syncNewItems(uid, snap.docs.map((d) => d.id));
      }
    );

    return () => { userUnsub(); checklistUnsub(); };
  }, [uid]);

  useEffect(() => {
    if (!uid || streakCheckedRef.current) return;
    streakCheckedRef.current = true;
    checkAndUpdateStreak(uid);
  }, [uid]);

  useEffect(() => {
    fetchWeather(30.0444, 31.2357).then((result) => {
      if (result) {
        setWeatherData(result.weather);
        if (result.alert) setAlertData(result.alert);
      }
    });
    return () => {
      if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
    };
  }, []);

  const checkAndUpdateStreak = async (userId: string) => {
    const userRef = doc(db, "users", userId);
    const snap = await getDoc(userRef);
    if (!snap.exists()) return;
    const data = snap.data();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastActive: Date | undefined = data.lastActiveDate?.toDate();
    if (!lastActive) {
      await updateDoc(userRef, { streakCount: 1, lastActiveDate: serverTimestamp() });
      return;
    }
    const lastActiveDay = new Date(lastActive);
    lastActiveDay.setHours(0, 0, 0, 0);
    if (lastActiveDay.getTime() === today.getTime()) {
      return;
    } else if (lastActiveDay.getTime() === yesterday.getTime()) {
      await updateDoc(userRef, { streakCount: (data.streakCount ?? 0) + 1, lastActiveDate: serverTimestamp() });
    } else {
      await updateDoc(userRef, { streakCount: 1, lastActiveDate: serverTimestamp() });
    }
  };

  const seedChecklist = async (userId: string) => {
    const masterSnap = await getDocs(collection(db, "checklists"));
    if (masterSnap.empty) { setLoading(false); return; }
    const batch = writeBatch(db);
    masterSnap.docs.forEach((masterDoc) => {
      const destRef = doc(db, "users", userId, "user_checklists", masterDoc.id);
      batch.set(destRef, {
        title: masterDoc.data().title,
        category: masterDoc.data().category,
        points: masterDoc.data().points,
        completed: false,
        completedAt: null,
      });
    });
    await batch.commit();
  };

  const syncNewItems = async (userId: string, existingIds: string[]) => {
    const masterSnap = await getDocs(collection(db, "checklists"));
    if (masterSnap.empty) { return; }
    const existingSet = new Set(existingIds);
    const missing = masterSnap.docs.filter(function(d) { return !existingSet.has(d.id); });
    if (missing.length === 0) { return; }
    const batch = writeBatch(db);
    missing.forEach(function(masterDoc) {
      const destRef = doc(db, "users", userId, "user_checklists", masterDoc.id);
      batch.set(destRef, {
        title: masterDoc.data().title,
        category: masterDoc.data().category,
        points: masterDoc.data().points,
        completed: false,
        completedAt: null,
      });
    });
    await batch.commit();
  };

  const totalPoints = items.filter((i) => i.completed).reduce((sum, i) => sum + i.points, 0);

  const recommendation: RecommendationResult | null = items.length > 0
    ? recommend(items, streakCount)
    : null;

  const recommendedItems = recommendation !== null
    ? items.filter(function(i) { return !i.completed && i.category === recommendation.category; }).slice(0, 3)
    : [];

  const toggleItem = async (item: ChecklistItem) => {
    if (!uid) return;
    const newCompleted = !item.completed;
    const pointsDelta = newCompleted ? item.points : -item.points;
    await updateDoc(doc(db, "users", uid, "user_checklists", item.id), {
      completed: newCompleted,
      completedAt: newCompleted ? serverTimestamp() : null,
    });
    await updateDoc(doc(db, "users", uid), { totalPoints: totalPoints + pointsDelta });
  };

  const switchLang = function(newLang: Language) {
    if (newLang === lang) { return; }
    AsyncStorage.setItem('language', newLang).then(function() {
      I18nManager.forceRTL(newLang === 'ar');
      if (DevSettings && DevSettings.reload) { DevSettings.reload(); }
    });
  };

  const renderItem = ({ item }: { item: ChecklistItem }) => (
    <TouchableOpacity
      style={[
        styles.item,
        item.completed && styles.itemCompleted,
        { borderLeftColor: CATEGORY_COLORS[item.category] ?? Colors.neutral.disabled },
        highlightedIds.includes(item.id) && styles.itemHighlighted,
      ]}
      onPress={() => toggleItem(item)}
      activeOpacity={0.7}
    >
      <View style={[styles.checkbox, item.completed && styles.checkboxChecked]}>
        {item.completed && <Text style={styles.checkmark}>✓</Text>}
      </View>
      <View style={styles.itemContent}>
        <Text style={[styles.itemText, item.completed && styles.textCompleted]}>{item.title}</Text>
        <View style={[styles.categoryPill, { backgroundColor: (CATEGORY_COLORS[item.category] ?? Colors.neutral.disabled) + '22' }]}>
          <Text style={[styles.categoryPillText, { color: CATEGORY_COLORS[item.category] ?? Colors.neutral.textSecondary }]}>
            {item.category.toUpperCase()}
          </Text>
        </View>
      </View>
      <View style={styles.pointsBadge}>
        <Text style={styles.pointsText}>+{item.points}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]} edges={['top']}>
        <ActivityIndicator size="large" color={Colors.primary.main} />
      </SafeAreaView>
    );
  }

  const completedCount = items.filter((i) => i.completed).length;
  const pct = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

  const listHeader = (
    <View>
      <View style={styles.hero}>
        <View style={styles.heroDecorA} pointerEvents="none" />
        <View style={styles.heroDecorB} pointerEvents="none" />
        <View style={styles.heroTop}>
          <View style={styles.heroTextBlock}>
            <Text style={styles.heroGreeting}>{Strings[lang].greeting}, {displayName || 'Preparer'}</Text>
            <Text style={styles.heroSubtitle}>{Strings[lang].subtitle}</Text>
          </View>
          <View style={styles.langToggle}>
            <TouchableOpacity
              style={[styles.langBtn, lang === 'en' && styles.langBtnActive]}
              onPress={() => switchLang('en')}
            >
              <Text style={[styles.langBtnText, lang === 'en' && styles.langBtnTextActive]}>EN</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.langBtn, lang === 'ar' && styles.langBtnActive]}
              onPress={() => switchLang('ar')}
            >
              <Text style={[styles.langBtnText, lang === 'ar' && styles.langBtnTextActive]}>AR</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.heroStats}>
          <View style={styles.heroStat}>
            <Text style={styles.heroStatValue}>{streakCount}</Text>
            <Text style={styles.heroStatLabel}>{Strings[lang].streak}</Text>
          </View>
          <View style={styles.heroStatDivider} />
          <View style={styles.heroStat}>
            <Text style={styles.heroStatValue}>{totalPoints}</Text>
            <Text style={styles.heroStatLabel}>{Strings[lang].score}</Text>
          </View>
        </View>
      </View>

      <View style={styles.progressCard}>
        <View style={styles.progressCardRow}>
          <Text style={styles.progressTitle}>{Strings[lang].progressTitle}</Text>
          <Text style={styles.progressPct}>{pct}%</Text>
        </View>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${pct}%` as any }]} />
        </View>
        <Text style={styles.progressCaption}>
          {completedCount} {Strings[lang].itemsOf} {items.length} {Strings[lang].itemsCollected}
        </Text>
      </View>

      {recommendation !== null && (
        <View style={styles.recommendSection}>
          <View style={styles.recommendHeader}>
            <Text style={styles.recommendTitle}>Recommended for you</Text>
            <View style={styles.clusterBadge}>
              <Text style={styles.clusterBadgeText}>{recommendation.clusterName}</Text>
            </View>
          </View>
          <Text style={styles.recommendLabel}>{recommendation.label}</Text>
          {recommendedItems.length > 0 ? recommendedItems.map(function(item) {
            return (
              <TouchableOpacity
                key={item.id}
                style={styles.recommendItem}
                onPress={() => toggleItem(item)}
                activeOpacity={0.7}
              >
                <View style={styles.checkbox}><Text>{''}</Text></View>
                <View style={styles.itemContent}>
                  <Text style={styles.itemText}>{item.title}</Text>
                  <Text style={[styles.itemCategory, { color: CATEGORY_COLORS[item.category] ?? Colors.neutral.textSecondary }]}>
                    {item.category}
                  </Text>
                </View>
                <View style={styles.pointsBadge}>
                  <Text style={styles.pointsText}>+{item.points}</Text>
                </View>
              </TouchableOpacity>
            );
          }) : (
            <View style={styles.recommendComplete}>
              <Text style={styles.recommendCompleteText}>✅ All {recommendation.category} items complete!</Text>
            </View>
          )}
        </View>
      )}

      <View style={styles.sectionHeader}>
        <View style={styles.sectionAccentBar} />
        <Text style={styles.sectionTitle}>FULL KIT CHECKLIST</Text>
        <View style={{ flex: 1 }} />
        <Text style={styles.sectionCount}>{items.length} items</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary.main} />

      <AlertBanner
        visible={alertVisible}
        title={alertData.title}
        message={alertData.message}
        onDismiss={() => setAlertVisible(false)}
        onViewKit={() => {
          setAlertVisible(false);
          const matches = items.filter(
            (i) => !i.completed && alertData.keywords.some((kw) => i.title.toLowerCase().includes(kw.toLowerCase()))
          );
          if (matches.length > 0) {
            const firstIndex = items.findIndex((i) => i.id === matches[0].id);
            setHighlightedIds(matches.map((i) => i.id));
            listRef.current?.scrollToIndex({ index: firstIndex, animated: true, viewPosition: 0.1 });
            if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
            highlightTimerRef.current = setTimeout(() => setHighlightedIds([]), 4000);
          } else {
            listRef.current?.scrollToOffset({ offset: 0, animated: true });
          }
        }}
      />

      {weatherData && <WeatherStrip weather={weatherData} alertActive={alertVisible} />}

      <FlatList
        ref={listRef}
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={listHeader}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary.main,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.neutral.background,
  },

  hero: {
    backgroundColor: Colors.primary.main,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl + 16,
    overflow: 'hidden',
  },
  heroDecorA: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(255,255,255,0.07)',
    top: -110,
    right: -70,
  },
  heroDecorB: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(255,255,255,0.05)',
    bottom: -30,
    left: -40,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  },
  heroTextBlock: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  heroGreeting: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.78)',
    fontWeight: '500',
  },
  langToggle: {
    flexDirection: 'row',
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    overflow: 'hidden',
  },
  langBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    backgroundColor: 'transparent',
  },
  langBtnActive: {
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  langBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.65)',
  },
  langBtnTextActive: {
    color: '#FFFFFF',
  },
  heroStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroStat: {
    flex: 1,
    alignItems: 'center',
  },
  heroStatValue: {
    fontSize: 44,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 48,
  },
  heroStatLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.72)',
    fontWeight: '600',
    marginTop: 2,
  },
  heroStatDivider: {
    width: 1,
    height: 44,
    backgroundColor: 'rgba(255,255,255,0.22)',
    marginHorizontal: Spacing.md,
  },

  progressCard: {
    backgroundColor: Colors.neutral.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginHorizontal: Spacing.lg,
    marginTop: -22,
    ...Shadow.md,
  },
  progressCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  progressTitle: {
    ...Typography.bodyMedium,
    color: Colors.neutral.textPrimary,
  },
  progressPct: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.primary.main,
  },
  progressBarBg: {
    height: 12,
    backgroundColor: Colors.neutral.border,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    marginBottom: Spacing.xs,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary.main,
    borderRadius: BorderRadius.full,
  },
  progressCaption: {
    ...Typography.caption,
    color: Colors.neutral.textSecondary,
    textAlign: 'right',
  },

  recommendSection: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    backgroundColor: Colors.neutral.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: Colors.secondary.main,
    ...Shadow.sm,
  },
  recommendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  recommendTitle: {
    ...Typography.bodyMedium,
    color: Colors.neutral.textPrimary,
    flex: 1,
    marginRight: Spacing.sm,
  },
  clusterBadge: {
    backgroundColor: Colors.secondary.main,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  clusterBadgeText: {
    fontSize: 11,
    color: Colors.neutral.surface,
    fontWeight: '700',
  },
  recommendLabel: {
    ...Typography.caption,
    color: Colors.neutral.textSecondary,
    marginBottom: Spacing.sm,
  },
  recommendItem: {
    backgroundColor: Colors.neutral.background,
    padding: Spacing.sm + 4,
    borderRadius: BorderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.secondary.light,
  },
  recommendComplete: {
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  recommendCompleteText: {
    ...Typography.body,
    color: Colors.primary.dark,
    fontWeight: '600',
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.xl,
    marginBottom: Spacing.sm,
    gap: Spacing.xs,
  },
  sectionAccentBar: {
    width: 3,
    height: 14,
    borderRadius: 2,
    backgroundColor: Colors.primary.main,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.neutral.textSecondary,
    letterSpacing: 1.2,
  },
  sectionCount: {
    fontSize: 11,
    color: Colors.neutral.textSecondary,
  },

  list: {
    backgroundColor: Colors.neutral.background,
    paddingBottom: 40,
  },

  item: {
    backgroundColor: Colors.neutral.surface,
    paddingVertical: Spacing.md,
    paddingRight: Spacing.md,
    paddingLeft: Spacing.sm,
    borderRadius: BorderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    marginHorizontal: Spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: Colors.neutral.disabled,
    ...Shadow.sm,
  },
  itemCompleted: {
    backgroundColor: Colors.primary.bg,
    opacity: 0.82,
  },
  itemHighlighted: {
    backgroundColor: '#FFFBEB',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.neutral.disabled,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
    marginLeft: Spacing.xs,
  },
  checkboxChecked: {
    backgroundColor: Colors.primary.main,
    borderColor: Colors.primary.main,
  },
  checkmark: {
    color: Colors.neutral.surface,
    fontSize: 13,
    fontWeight: 'bold',
  },
  itemContent: {
    flex: 1,
  },
  itemText: {
    ...Typography.bodyMedium,
    color: Colors.neutral.textPrimary,
  },
  categoryPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  categoryPillText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.7,
  },
  itemCategory: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
    letterSpacing: 0.4,
  },
  textCompleted: {
    textDecorationLine: 'line-through',
    color: Colors.neutral.textSecondary,
  },
  pointsBadge: {
    backgroundColor: Colors.accent.amber + '18',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.accent.amber + '45',
  },
  pointsText: {
    fontSize: 11,
    color: Colors.accent.orange,
    fontWeight: '700',
  },
});
