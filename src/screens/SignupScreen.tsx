import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { COLORS, SIZES } from '../constants/theme';

export const SignupScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signUp } = useAuth();

  const handleSignup = async () => {
    if (!email || !password || !confirmPassword || !displayName) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await signUp(email.trim(), password, displayName.trim());
      // Don't show alert - user will be automatically logged in
      // The AuthContext will handle the navigation
    } catch (error: any) {
      console.error('Signup error:', error);
      let errorMessage = error.message;
      
      // Provide user-friendly error messages
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered. Please login instead.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please use a stronger password.';
      }
      
      Alert.alert('Signup Failed', errorMessage);
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Logo Section */}
          <View style={styles.logoSection}>
            <View style={styles.logoContainer}>
              {/* TODO: Replace with your actual logo image */}
              {/* <Image source={require('../../assets/logo.png')} style={styles.logo} /> */}
              <View style={styles.logoPlaceholder}>
                <Text style={styles.logoPlaceholderText}>LOGO</Text>
              </View>
            </View>
            <Text style={styles.appTitle}>LeySam Anglers</Text>
            <Text style={styles.tagline}>Connect. Share. Fish.</Text>
          </View>

          {/* Signup Card */}
          <View style={styles.signupCard}>
            <Text style={styles.welcomeText}>Create Account</Text>
            <Text style={styles.subtitle}>Sign up to get started</Text>

            <View style={styles.inputsContainer}>
              <View style={styles.inputWrapper}>
                <View style={styles.inputIconContainer}>
                  <Ionicons name="person-outline" size={20} color={COLORS.textSecondary} />
                </View>
                <Input
                  placeholder="Full name"
                  value={displayName}
                  onChangeText={setDisplayName}
                  style={styles.inputWithIcon}
                />
              </View>

              <View style={styles.inputWrapper}>
                <View style={styles.inputIconContainer}>
                  <Ionicons name="mail-outline" size={20} color={COLORS.textSecondary} />
                </View>
                <Input
                  placeholder="Email address"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={styles.inputWithIcon}
                />
              </View>

              <View style={styles.inputWrapper}>
                <View style={styles.inputIconContainer}>
                  <Ionicons name="lock-closed-outline" size={20} color={COLORS.textSecondary} />
                </View>
                <Input
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  style={styles.inputWithIcon}
                />
              </View>

              <View style={styles.inputWrapper}>
                <View style={styles.inputIconContainer}>
                  <Ionicons name="lock-closed-outline" size={20} color={COLORS.textSecondary} />
                </View>
                <Input
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showPassword}
                  style={styles.inputWithIcon}
                />
              </View>

              <TouchableOpacity
                style={styles.showPasswordContainer}
                onPress={() => setShowPassword(!showPassword)}
                activeOpacity={0.7}
              >
                <View style={styles.checkbox}>
                  {showPassword && (
                    <Ionicons name="checkmark" size={14} color={COLORS.primary} />
                  )}
                </View>
                <Text style={styles.showPasswordText}>Show password</Text>
              </TouchableOpacity>
            </View>

            <Button 
              title="Create Account" 
              onPress={handleSignup} 
              loading={loading} 
              style={styles.signupButton} 
            />

            <View style={styles.footer}>
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity
                style={styles.loginLinkButton}
                onPress={() => navigation.navigate('Login')}
              >
                <Text style={styles.loginText}>
                  Already have an account? <Text style={styles.loginTextBold}>Sign In</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: SIZES.padding * 2,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SIZES.padding * 1.5,
  },
  // Logo Section
  logoSection: {
    alignItems: 'center',
    marginBottom: SIZES.margin * 2.5,
  },
  logoContainer: {
    marginBottom: SIZES.margin * 1.5,
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
  },
  logoPlaceholder: {
    width: 120,
    height: 120,
    backgroundColor: COLORS.surface,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
  },
  logoPlaceholderText: {
    fontSize: SIZES.lg,
    color: COLORS.textSecondary,
    fontWeight: '600',
    letterSpacing: 2,
  },
  appTitle: {
    fontSize: SIZES.title * 1.2,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SIZES.margin / 4,
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: SIZES.base,
    color: COLORS.textSecondary,
    fontWeight: '400',
  },
  // Signup Card
  signupCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: SIZES.padding * 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  welcomeText: {
    fontSize: SIZES.xl * 1.2,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: SIZES.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SIZES.margin / 4,
    marginBottom: SIZES.margin * 2,
  },
  // Input Styles
  inputsContainer: {
    marginBottom: SIZES.margin * 1.5,
  },
  inputWrapper: {
    position: 'relative',
    marginBottom: SIZES.margin * 1.2,
  },
  inputIconContainer: {
    position: 'absolute',
    left: 16,
    top: 18,
    zIndex: 10,
  },
  inputWithIcon: {
    paddingLeft: 48,
  },
  passwordContainer: {
    position: 'relative',
  },
  showPasswordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -4,
    marginBottom: 12,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 4,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundLight,
  },
  showPasswordText: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
  },
  // Button
  signupButton: {
    height: 56,
    borderRadius: 16,
    marginBottom: SIZES.margin * 1.5,
  },
  // Footer
  footer: {
    alignItems: 'center',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.margin * 1.5,
    width: '100%',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    color: COLORS.textSecondary,
    marginHorizontal: SIZES.margin,
    fontSize: SIZES.sm,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  loginLinkButton: {
    paddingVertical: SIZES.padding / 2,
  },
  loginText: {
    fontSize: SIZES.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  loginTextBold: {
    color: COLORS.primary,
    fontWeight: '700',
  },
});
