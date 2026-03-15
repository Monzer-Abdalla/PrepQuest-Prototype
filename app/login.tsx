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
import {
  BorderRadius,
  Colors,
  Shadow,
  Spacing,
  Typography,
} from "../src/constants/theme";
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
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password,
        );
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
      <View style={styles.inner}>
        
        <View style={styles.titleContainer}>
          <Text style={styles.title}>PrepQuest</Text>
          <View style={styles.titleUnderline} />
        </View>

        <Text style={styles.subtitle}>
          {isSignUp ? "Create your account" : "Welcome back"}
        </Text>

        
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
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
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color={Colors.neutral.surface} />
          ) : (
            <Text style={styles.buttonText}>
              {isSignUp ? "Create Account" : "Log In"}
            </Text>
          )}
        </TouchableOpacity>

        
        <TouchableOpacity
          onPress={() => {
            setIsSignUp(!isSignUp);
            setError("");
          }}
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
    backgroundColor: Colors.neutral.background,
  },
  inner: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: Spacing.lg,
  },

  
  titleContainer: {
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  title: {
    ...Typography.h1,
    fontSize: 36,
    fontWeight: "800",
    color: Colors.primary.main,
    marginBottom: Spacing.xs,
  },
  titleUnderline: {
    width: 60,
    height: 4,
    backgroundColor: Colors.primary.main,
    borderRadius: BorderRadius.full,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.neutral.textSecondary,
    textAlign: "center",
    marginBottom: Spacing.xl,
  },

  
  errorContainer: {
    backgroundColor: "#FEF2F2", 
    borderLeftWidth: 4,
    borderLeftColor: Colors.semantic.error,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  errorText: {
    ...Typography.caption,
    color: Colors.semantic.error,
  },

  
  input: {
    ...Typography.input,
    backgroundColor: Colors.neutral.surface,
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
    paddingVertical: Spacing.md,
    alignItems: "center",
    marginBottom: Spacing.md,
    ...Shadow.md,
  },
  buttonDisabled: {
    backgroundColor: Colors.neutral.disabled,
  },
  buttonText: {
    ...Typography.button,
    color: Colors.neutral.surface,
  },

  
  toggleText: {
    ...Typography.caption,
    color: Colors.primary.main,
    textAlign: "center",
    fontWeight: "600",
  },
});
