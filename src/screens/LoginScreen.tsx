import React, { useState, useEffect } from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { COLORS, SIZES } from '../constants/theme';
import { validateEmail, validatePassword } from '../services/contentValidation';

export const LoginScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { signIn } = useAuth();

  // Load saved credentials on mount
  useEffect(() => {
    loadSavedCredentials();
  }, []);

  const loadSavedCredentials = async () => {
    try {
      const savedEmail = await AsyncStorage.getItem('rememberedEmail');
      const savedPassword = await AsyncStorage.getItem('rememberedPassword');
      const wasRemembered = await AsyncStorage.getItem('rememberMe');
      
      if (wasRemembered === 'true' && savedEmail && savedPassword) {
        setEmail(savedEmail);
        setPassword(savedPassword);
        setRememberMe(true);
        
        // Automatically log in
        setLoading(true);
        try {
          await signIn(savedEmail, savedPassword);
        } catch (error: any) {
          console.error('Auto-login error:', error);
          // If auto-login fails, just show the form with credentials filled
          setLoading(false);
        }
      }
    } catch (error) {
      console.error('Error loading saved credentials:', error);
    }
  };

  const saveCredentials = async () => {
    try {
      if (rememberMe) {
        await AsyncStorage.setItem('rememberedEmail', email);
        await AsyncStorage.setItem('rememberedPassword', password);
        await AsyncStorage.setItem('rememberMe', 'true');
      } else {
        await AsyncStorage.removeItem('rememberedEmail');
        await AsyncStorage.removeItem('rememberedPassword');
        await AsyncStorage.removeItem('rememberMe');
      }
    } catch (error) {
      console.error('Error saving credentials:', error);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // Validate email format
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      Alert.alert('Invalid Email', emailValidation.error);
      return;
    }

    // Validate password length
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      Alert.alert('Invalid Password', passwordValidation.error);
      return;
    }

    setLoading(true);
    try {
      await signIn(email.trim(), password);
      await saveCredentials();
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
              <Image source={require('../../assets/nikko.png')} style={styles.logo} />
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
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                  activeOpacity={0.7}
                >
                  <Ionicons 
                    name={showPassword ? "eye-outline" : "eye-off-outline"} 
                    size={22} 
                    color={COLORS.textSecondary} 
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.rememberMeContainer}
                onPress={() => setRememberMe(!rememberMe)}
                activeOpacity={0.7}
              >
                <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                  {rememberMe && (
                    <Ionicons name="checkmark" size={16} color={COLORS.surface} />
                  )}
                </View>
                <Text style={styles.rememberMeText}>Remember me</Text>
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
    paddingRight: 48,
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    top: 12,
    padding: 4,
    zIndex: 10,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SIZES.margin,
    marginBottom: SIZES.margin / 2,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 5,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundLight,
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  rememberMeText: {
    fontSize: SIZES.sm + 1,
    color: COLORS.textSecondary,
    fontWeight: '500',
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
