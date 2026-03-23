import { getAuth, signOut } from "firebase/auth";
import { collection, doc, getDocs, onSnapshot, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BorderRadius, Colors, Shadow, Spacing, Typography } from "../../src/constants/theme";
import { app, db } from "../../src/services/firebase";
import { recommend } from "../../src/services/questRecommender";

interface UserData {
  displayName: string;
  totalPoints: number;
  streakCount: number;
}

interface ItemSummary {
  category: string;
  completed: boolean;
}

function getInitials(name: string): string {
  const trimmed = name.trim();
  if (trimmed.length === 0) { return 'P'; }
  const parts = trimmed.split(' ');
  if (parts.length >= 2) {
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }
  return parts[0].charAt(0).toUpperCase();
}

function getLevel(points: number): { name: string; color: string; levelNum: number } {
  if (points >= 500) { return { name: 'Expert', color: Colors.accent.amber, levelNum: 5 }; }
  if (points >= 300) { return { name: 'Ready', color: Colors.primary.dark, levelNum: 4 }; }
  if (points >= 150) { return { name: 'Prepared', color: Colors.primary.main, levelNum: 3 }; }
  if (points >= 50) { return { name: 'Aware', color: Colors.secondary.main, levelNum: 2 }; }
  return { name: 'Novice', color: Colors.neutral.textSecondary, levelNum: 1 };
}

export default function ProfileScreen() {
  const auth = getAuth(app);
  const user = auth.currentUser;
  const uid = user !== null ? user.uid : '';
  const email = user !== null ? (user.email !== null ? user.email : '') : '';

  const [userData, setUserData] = useState<UserData | null>(null);
  const [items, setItems] = useState<ItemSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [savingName, setSavingName] = useState(false);

  const handleSaveName = function() {
    const trimmed = nameInput.trim();
    if (trimmed.length === 0) { return; }
    setSavingName(true);
    updateDoc(doc(db, 'users', uid), { displayName: trimmed }).then(function() {
      setEditingName(false);
      setSavingName(false);
    }).catch(function() {
      setSavingName(false);
    });
  };

  useEffect(() => {
    if (!uid) { return; }

    const unsub = onSnapshot(doc(db, 'users', uid), function(snap) {
      if (snap.exists()) {
        const data = snap.data();
        setUserData({
          displayName: data.displayName !== undefined ? data.displayName : '',
          totalPoints: data.totalPoints !== undefined ? data.totalPoints : 0,
          streakCount: data.streakCount !== undefined ? data.streakCount : 0,
        });
      }
      setLoading(false);
    });

    getDocs(collection(db, 'users', uid, 'user_checklists')).then(function(snap) {
      const loaded: ItemSummary[] = snap.docs.map(function(d) {
        return {
          category: d.data().category as string,
          completed: d.data().completed as boolean,
        };
      });
      setItems(loaded);
    });

    return function() { unsub(); };
  }, [uid]);

  const handleSignOut = function() {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: function() { signOut(auth); },
        },
      ]
    );
  };

  if (loading || userData === null) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={Colors.primary.main} />
      </SafeAreaView>
    );
  }

  const level = getLevel(userData.totalPoints);
  const completedCount = items.filter(function(i) { return i.completed; }).length;
  const totalCount = items.length;
  const cluster = items.length > 0 ? recommend(items, userData.streakCount) : null;
  const initials = getInitials(userData.displayName);
  const barPercent = (level.levelNum / 5) * 100;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false}>

        <View style={styles.banner}>
          <View style={styles.bannerDecorA} pointerEvents="none" />
          <View style={styles.bannerDecorB} pointerEvents="none" />
          <Text style={styles.bannerTitle}>My Profile</Text>
          <Text style={styles.bannerSub}>Your preparedness journey</Text>
        </View>

        <View style={styles.avatarRow}>
          <View style={styles.avatarOuter}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          </View>
        </View>

        <View style={styles.nameBlock}>
          {editingName ? (
            <View style={styles.nameEditRow}>
              <TextInput
                style={styles.nameInput}
                value={nameInput}
                onChangeText={setNameInput}
                placeholder="Enter your name"
                placeholderTextColor={Colors.neutral.textSecondary}
                autoFocus
                maxLength={30}
              />
              <TouchableOpacity
                style={[styles.nameSaveBtn, savingName && { opacity: 0.6 }]}
                onPress={handleSaveName}
                disabled={savingName}
                activeOpacity={0.8}
              >
                <Text style={styles.nameSaveBtnText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.nameCancelBtn}
                onPress={function() { setEditingName(false); }}
                activeOpacity={0.7}
              >
                <Text style={styles.nameCancelBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.nameRow}>
              <Text style={styles.displayName}>{userData.displayName || 'Preparer'}</Text>
              <TouchableOpacity
                style={styles.nameEditBtn}
                onPress={function() { setNameInput(userData.displayName || ''); setEditingName(true); }}
                activeOpacity={0.7}
              >
                <Text style={styles.nameEditBtnText}>Edit</Text>
              </TouchableOpacity>
            </View>
          )}
          <Text style={styles.emailText}>{email}</Text>
          <View style={[styles.levelPill, { backgroundColor: level.color + '20', borderColor: level.color + '60' }]}>
            <Text style={[styles.levelPillText, { color: level.color }]}>{level.name}</Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statGridCard}>
            <View style={[styles.statGridAccent, { backgroundColor: Colors.accent.orange }]} />
            <Text style={styles.statGridValue}>{userData.streakCount}</Text>
            <Text style={styles.statGridLabel}>Day Streak</Text>
          </View>
          <View style={styles.statGridCard}>
            <View style={[styles.statGridAccent, { backgroundColor: Colors.accent.amber }]} />
            <Text style={styles.statGridValue}>{userData.totalPoints}</Text>
            <Text style={styles.statGridLabel}>Total Points</Text>
          </View>
          <View style={styles.statGridCard}>
            <View style={[styles.statGridAccent, { backgroundColor: Colors.primary.main }]} />
            <Text style={styles.statGridValue}>{completedCount}</Text>
            <Text style={styles.statGridLabel}>Items Done</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PREPAREDNESS PROGRESS</Text>
          <View style={styles.progressCard}>
            <Text style={styles.levelHeading}>
              Level {level.levelNum} of 5 — {level.name}
            </Text>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${barPercent}%`, backgroundColor: Colors.primary.main },
                ]}
              />
            </View>
            <Text style={styles.progressCaption}>
              {completedCount} of {totalCount} kit items collected
            </Text>
          </View>
        </View>

        {cluster !== null && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>YOUR PREPARER PROFILE</Text>
            <View style={styles.clusterCard}>
              <View style={styles.clusterCardTop}>
                <Text style={styles.clusterCardName}>{cluster.clusterName}</Text>
                <View style={styles.clusterIndexBadge}>
                  <Text style={styles.clusterIndexText}>Cluster {cluster.cluster}</Text>
                </View>
              </View>
              <Text style={styles.clusterCardLabel}>{cluster.label}</Text>
              <Text style={styles.clusterCardSub}>
                Based on your completion pattern across Basic, Gear, and Health categories.
              </Text>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚙️  SETTINGS</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>📧</Text>
              <Text style={styles.infoText}>{email}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut} activeOpacity={0.8}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={styles.bottomPad} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral.background,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  banner: {
    height: 168,
    backgroundColor: Colors.primary.dark,
    paddingTop: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'flex-start',
    borderBottomRightRadius: 40,
    overflow: 'hidden',
  },
  bannerDecorA: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255,255,255,0.07)',
    top: -80,
    right: -50,
  },
  bannerDecorB: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.05)',
    bottom: 10,
    left: -20,
  },
  bannerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.neutral.surface,
    letterSpacing: -0.3,
  },
  bannerSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.72)',
    fontWeight: '500',
    marginTop: 3,
  },
  avatarRow: {
    alignItems: 'center',
    marginTop: -52,
  },
  avatarOuter: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: Colors.primary.light,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.lg,
    elevation: 10,
  },
  avatar: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: Colors.primary.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 34,
    fontWeight: '800',
    color: Colors.primary.dark,
  },
  nameBlock: {
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 4,
  },
  displayName: {
    ...Typography.h2,
    color: Colors.neutral.textPrimary,
  },
  nameEditBtn: {
    backgroundColor: Colors.primary.bg,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: Colors.primary.light,
  },
  nameEditBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary.dark,
  },
  nameEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: 4,
    width: '100%',
  },
  nameInput: {
    flex: 1,
    ...Typography.bodyMedium,
    color: Colors.neutral.textPrimary,
    backgroundColor: Colors.neutral.surface,
    borderWidth: 1.5,
    borderColor: Colors.primary.main,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  nameSaveBtn: {
    backgroundColor: Colors.primary.main,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  nameSaveBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  nameCancelBtn: {
    padding: Spacing.sm,
  },
  nameCancelBtnText: {
    fontSize: 15,
    color: Colors.neutral.textSecondary,
  },
  emailText: {
    ...Typography.body,
    color: Colors.neutral.textSecondary,
    marginBottom: Spacing.sm,
  },
  levelPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  levelPillText: {
    ...Typography.caption,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  statsGrid: {
    flexDirection: 'row',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  statGridCard: {
    flex: 1,
    backgroundColor: Colors.neutral.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    overflow: 'hidden',
    ...Shadow.md,
  },
  statGridAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  statGridValue: {
    fontSize: 30,
    fontWeight: '800',
    color: Colors.neutral.textPrimary,
    marginTop: Spacing.xs,
  },
  statGridLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.neutral.textSecondary,
    marginTop: 3,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  section: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.neutral.textSecondary,
    letterSpacing: 1.2,
    marginBottom: Spacing.sm,
  },
  progressCard: {
    backgroundColor: Colors.neutral.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    ...Shadow.sm,
  },
  levelHeading: {
    ...Typography.bodyMedium,
    color: Colors.neutral.textPrimary,
    marginBottom: Spacing.sm,
  },
  progressBarBg: {
    height: 10,
    backgroundColor: Colors.neutral.border,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    marginBottom: Spacing.xs,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  progressCaption: {
    ...Typography.caption,
    color: Colors.neutral.textSecondary,
    textAlign: 'right',
  },
  clusterCard: {
    backgroundColor: Colors.neutral.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: Colors.secondary.main,
    ...Shadow.sm,
  },
  clusterCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  clusterCardName: {
    ...Typography.bodyMedium,
    color: Colors.neutral.textPrimary,
  },
  clusterIndexBadge: {
    backgroundColor: Colors.primary.main,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  clusterIndexText: {
    ...Typography.small,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  clusterCardLabel: {
    ...Typography.body,
    color: Colors.secondary.main,
    fontWeight: '600',
    marginBottom: 4,
  },
  clusterCardSub: {
    ...Typography.caption,
    color: Colors.neutral.textSecondary,
  },
  infoCard: {
    backgroundColor: Colors.neutral.surface,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadow.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  infoIcon: {
    fontSize: 16,
  },
  infoText: {
    ...Typography.body,
    color: Colors.neutral.textSecondary,
    flex: 1,
  },
  signOutBtn: {
    marginHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.semantic.error,
    alignItems: 'center',
  },
  signOutText: {
    ...Typography.button,
    color: Colors.semantic.error,
  },
  bottomPad: {
    height: Spacing.xxl,
  },
});
