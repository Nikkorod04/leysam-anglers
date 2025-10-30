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

export const LoginScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signIn } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await signIn(email.trim(), password);
      // Don't manually setLoading(false) here - let auth state handle it
    } catch (error: any) {
      console.error('Login error:', error);
      let errorMessage = error.message;
      
      // Provide user-friendly error messages
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email. Please sign up first.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid email or password. Please check and try again.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      }
      
      Alert.alert('Login Failed', errorMessage);
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

          {/* Login Card */}
          <View style={styles.loginCard}>
            <Text style={styles.welcomeText}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue</Text>

            <View style={styles.inputsContainer}>
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
              title="Sign In" 
              onPress={handleLogin} 
              loading={loading} 
              style={styles.loginButton} 
            />

            <View style={styles.footer}>
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity
                style={styles.signupButton}
                onPress={() => navigation.navigate('Signup')}
              >
                <Text style={styles.signupText}>
                  Don't have an account? <Text style={styles.signupTextBold}>Sign Up</Text>
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
  // Login Card
  loginCard: {
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
    top: 14,
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
    marginTop: 8,
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
  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: 17,
    padding: 8,
    zIndex: 10,
  },
  // Button
  loginButton: {
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
  signupButton: {
    paddingVertical: SIZES.padding / 2,
  },
  signupText: {
    fontSize: SIZES.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  signupTextBold: {
    color: COLORS.primary,
    fontWeight: '700',
  },
});
