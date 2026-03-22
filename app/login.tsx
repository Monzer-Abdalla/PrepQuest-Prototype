import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { BorderRadius, Colors, Shadow, Spacing, Typography } from "../src/constants/theme";
import { app, db } from "../src/services/firebase";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onAuthSubmit = async () => {
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setLoading(true);
    setError("");
    const auth = getAuth(app);

    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", userCredential.user.uid), {
          email: email,
          displayName: email.split("@")[0],
          totalPoints: 0,
          currentLevel: 1,
          streakCount: 0,
          lastActiveDate: serverTimestamp(),
          createdAt: serverTimestamp(),
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (err.code === "auth/wrong-password") {
        setError("Incorrect password. Please try again.");
      } else if (err.code === "auth/user-not-found") {
        setError("No account found. Try signing up instead.");
      } else if (err.code === "auth/email-already-in-use") {
        setError("An account with this email already exists. Try logging in.");
      } else if (err.code === "auth/weak-password") {
        setError("Password must be at least 6 characters.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.brandZone}>
        <Text style={styles.brandTitle}>PrepQuest</Text>
        <Text style={styles.brandTagline}>Build your preparedness. Every day.</Text>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.formHeading}>
          {isSignUp ? "Create account" : "Welcome back"}
        </Text>
        <Text style={styles.formSubheading}>
          {isSignUp
            ? "Join PrepQuest and start your journey"
            : "Sign in to continue your progress"}
        </Text>

        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>⚠ {error}</Text>
          </View>
        ) : null}

        <TextInput
          style={styles.input}
          placeholder="Email address"
          placeholderTextColor={Colors.neutral.textSecondary}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={Colors.neutral.textSecondary}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={onAuthSubmit}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color={Colors.neutral.surface} />
          ) : (
            <Text style={styles.buttonText}>
              {isSignUp ? "Create Account" : "Log In"}
            </Text>
          )}
        </TouchableOpacity>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity
          onPress={() => { setIsSignUp(!isSignUp); setError(""); }}
          activeOpacity={0.7}
        >
          <Text style={styles.toggleText}>
            {isSignUp
              ? "Already have an account? Log in"
              : "Don't have an account? Sign up"}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary.main,
  },

  brandZone: {
    flex: 1,
    backgroundColor: Colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  brandTitle: {
    fontSize: 38,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginBottom: Spacing.xs,
  },
  brandTagline: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.78)',
    fontWeight: '500',
    textAlign: 'center',
  },

  formCard: {
    backgroundColor: Colors.neutral.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxl,
    ...Shadow.lg,
  },
  formHeading: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.neutral.textPrimary,
    marginBottom: 4,
  },
  formSubheading: {
    ...Typography.body,
    color: Colors.neutral.textSecondary,
    marginBottom: Spacing.lg,
  },

  errorContainer: {
    backgroundColor: '#FEF2F2',
    borderLeftWidth: 4,
    borderLeftColor: Colors.semantic.error,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  errorText: {
    ...Typography.caption,
    color: Colors.semantic.error,
    fontWeight: '600',
  },

  input: {
    ...Typography.body,
    color: Colors.neutral.textPrimary,
    backgroundColor: Colors.neutral.background,
    borderWidth: 1.5,
    borderColor: Colors.neutral.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    marginBottom: Spacing.md,
    ...Shadow.sm,
  },

  button: {
    backgroundColor: Colors.primary.main,
    borderRadius: BorderRadius.md,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: Spacing.md,
    ...Shadow.md,
  },
  buttonDisabled: {
    backgroundColor: Colors.neutral.disabled,
  },
  buttonText: {
    ...Typography.button,
    color: Colors.neutral.surface,
    fontSize: 16,
  },

  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.neutral.border,
  },
  dividerText: {
    ...Typography.caption,
    color: Colors.neutral.textSecondary,
    marginHorizontal: Spacing.sm,
  },

  toggleText: {
    ...Typography.caption,
    color: Colors.primary.main,
    textAlign: 'center',
    fontWeight: '700',
  },
});
