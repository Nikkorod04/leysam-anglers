import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import { COLORS, SIZES } from '../constants/theme';
import { auth } from '../services/firebase';

export const EmailVerificationScreen: React.FC = () => {
  const { resendVerificationEmail, logout, user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [checkingVerification, setCheckingVerification] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setResendDisabled(false);
    }
  }, [countdown]);

  const handleResendEmail = async () => {
    setLoading(true);
    try {
      await resendVerificationEmail();
      Alert.alert(
        'Email Sent',
        'Verification email has been sent. Please check your inbox and spam folder.'
      );
      setResendDisabled(true);
      setCountdown(60); // 60 second cooldown
    } catch (error: any) {
      console.error('Resend email error:', error);
      let errorMessage = 'Failed to send verification email. Please try again.';
      
      if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many requests. Please wait a few minutes before trying again.';
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckVerification = async () => {
    setCheckingVerification(true);
    try {
      // Reload the current user to get updated emailVerified status
      await auth.currentUser?.reload();
      const currentUser = auth.currentUser;
      
      if (currentUser?.emailVerified) {
        // Email is verified! Refresh the user state in the context
        await refreshUser();
        
        Alert.alert(
          'Email Verified! ✅',
          'Your email has been verified successfully. Welcome to LeySam Anglers!',
          [{ text: 'Continue' }]
        );
        // The AuthContext user state is now updated with isVerified: true
        // The AppNavigator will automatically redirect to the main app
      } else {
        Alert.alert(
          'Not Verified Yet',
          'Your email is not verified yet. Please check your inbox and click the verification link.'
        );
      }
    } catch (error) {
      console.error('Check verification error:', error);
      Alert.alert('Error', 'Failed to check verification status. Please try again.');
    } finally {
      setCheckingVerification(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <Ionicons name="mail-outline" size={100} color={COLORS.primary} />
        </View>

        {/* Title */}
        <Text style={styles.title}>Verify Your Email</Text>

        {/* Description */}
        <Text style={styles.description}>
          We've sent a verification email to:
        </Text>
        <Text style={styles.email}>{user?.email}</Text>

        <Text style={styles.instructions}>
          Please check your inbox and click the verification link to activate your account.
        </Text>

        {/* Tips Box */}
        <View style={styles.tipsBox}>
          <View style={styles.tipRow}>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
            <Text style={styles.tipText}>Check your spam/junk folder</Text>
          </View>
          <View style={styles.tipRow}>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
            <Text style={styles.tipText}>Make sure the email address is correct</Text>
          </View>
          <View style={styles.tipRow}>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
            <Text style={styles.tipText}>Wait a few minutes for the email to arrive</Text>
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.buttonsContainer}>
          <Button
            title="Check Verification Status"
            onPress={handleCheckVerification}
            loading={checkingVerification}
            style={styles.checkButton}
          />

          <Button
            title={resendDisabled ? `Resend in ${countdown}s` : 'Resend Verification Email'}
            onPress={handleResendEmail}
            loading={loading}
            disabled={resendDisabled || loading}
            variant="secondary"
            style={styles.resendButton}
          />

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding * 2,
  },
  iconContainer: {
    marginBottom: SIZES.margin * 2,
  },
  title: {
    fontSize: SIZES.xl * 1.5,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SIZES.margin,
    textAlign: 'center',
  },
  description: {
    fontSize: SIZES.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SIZES.margin / 2,
  },
  email: {
    fontSize: SIZES.lg,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: SIZES.margin * 1.5,
    textAlign: 'center',
  },
  instructions: {
    fontSize: SIZES.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SIZES.margin * 2,
    paddingHorizontal: SIZES.padding,
  },
  tipsBox: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SIZES.padding * 1.5,
    marginBottom: SIZES.margin * 3,
    width: '100%',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.margin,
  },
  tipText: {
    fontSize: SIZES.base,
    color: COLORS.text,
    marginLeft: SIZES.margin,
    flex: 1,
  },
  buttonsContainer: {
    width: '100%',
  },
  checkButton: {
    marginBottom: SIZES.margin,
  },
  resendButton: {
    marginBottom: SIZES.margin * 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.padding,
  },
  logoutText: {
    fontSize: SIZES.base,
    color: COLORS.error,
    marginLeft: SIZES.margin / 2,
    fontWeight: '600',
  },
});
