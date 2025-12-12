import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  Clipboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';

export const DonateScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const paymentMethods = [
    {
      id: 'gcash',
      name: 'GCash',
      icon: 'phone-portrait-outline',
      color: '#007DFF',
      details: '09653590602',
      accountName: 'Nicanor Nikko Villas',
    },
    {
      id: 'paymaya',
      name: 'PayMaya',
      icon: 'card-outline',
      color: '#00D632',
      details: '09653590602',
      accountName: 'Nicanor Nikko Villas',
    },
    {
      id: 'paypal',
      name: 'PayPal',
      icon: 'logo-paypal',
      color: '#0070BA',
      details: 'nicanornikkorod@gmail.com',
      accountName: 'Nicanor Nikko Villas',
    },
  ];

  const copyToClipboard = async (text: string, fieldName: string) => {
    await Clipboard.setString(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleDonate = (method: typeof paymentMethods[0]) => {
    Alert.alert(
      `Donate via ${method.name}`,
      `Account: ${method.accountName}\n${method.name === 'PayPal' ? 'Email' : 'Number'}: ${method.details}\n\nThe details have been copied to your clipboard.`,
      [{ text: 'OK' }]
    );
    copyToClipboard(method.details, method.id);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="heart" size={64} color={COLORS.primary} />
          <Text style={styles.title}>Support Nikko</Text>
          <Text style={styles.subtitle}>
            Your donations help me maintain and improve the app, keeping it free for all anglers in Leyte and Samar.
          </Text>
        </View>

        {/* Why Donate Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Why Donate?</Text>
          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
              <Text style={styles.featureText}>Keep the app free for everyone</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
              <Text style={styles.featureText}>Support server and maintenance costs</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
              <Text style={styles.featureText}>Fund new features and improvements</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
              <Text style={styles.featureText}>Support the fishing community</Text>
            </View>
          </View>
        </View>

        {/* Payment Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose Payment Method</Text>
          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={styles.paymentCard}
              onPress={() => handleDonate(method)}
            >
              <View style={[styles.paymentIcon, { backgroundColor: method.color + '20' }]}>
                <Ionicons name={method.icon as any} size={32} color={method.color} />
              </View>
              <View style={styles.paymentInfo}>
                <Text style={styles.paymentName}>{method.name}</Text>
                <Text style={styles.paymentDetails}>{method.details}</Text>
                <Text style={styles.paymentAccount}>{method.accountName}</Text>
              </View>
              <View style={styles.copyIconContainer}>
                {copiedField === method.id ? (
                  <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
                ) : (
                  <Ionicons name="copy-outline" size={24} color={COLORS.textSecondary} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Thank You Message */}
        <View style={styles.thankYouCard}>
          <Ionicons name="heart" size={32} color={COLORS.error} />
          <Text style={styles.thankYouText}>
            Thank you for your support! Every donation, no matter how small, makes a difference.
          </Text>
        </View>

      
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SIZES.padding * 1.5,
  },
  header: {
    alignItems: 'center',
    marginBottom: SIZES.margin * 2,
    paddingVertical: SIZES.padding * 2,
  },
  title: {
    fontSize: SIZES.xl + 4,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: SIZES.margin,
    marginBottom: SIZES.margin / 2,
  },
  subtitle: {
    fontSize: SIZES.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: SIZES.padding,
  },
  section: {
    marginBottom: SIZES.margin * 2,
  },
  sectionTitle: {
    fontSize: SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SIZES.margin * 1.5,
  },
  featureList: {
    gap: SIZES.margin,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: SIZES.base,
    color: COLORS.textSecondary,
    flex: 1,
  },
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius * 1.5,
    padding: SIZES.padding * 1.5,
    marginBottom: SIZES.margin,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  paymentIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.margin,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentName: {
    fontSize: SIZES.base + 2,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  paymentDetails: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  paymentAccount: {
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  copyIconContainer: {
    marginLeft: SIZES.margin,
  },
  thankYouCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius * 1.5,
    padding: SIZES.padding * 2,
    alignItems: 'center',
    marginBottom: SIZES.margin * 2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  thankYouText: {
    fontSize: SIZES.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: SIZES.margin,
  },
  note: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 20,
  },
});
