import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS, SIZES } from '../constants/theme';

export const PrivacyScreen: React.FC = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Privacy Policy</Text>

        <View style={styles.section}>
          <Text style={styles.subsectionTitle}>1. Data Collection</Text>
          <Text style={styles.text}>
            Leysam Anglers collects the following information:
          </Text>
          <Text style={styles.bulletPoint}>• Email address and authentication data</Text>
          <Text style={styles.bulletPoint}>• Profile information (name, photo)</Text>
          <Text style={styles.bulletPoint}>• Fishing spot locations and details</Text>
          <Text style={styles.bulletPoint}>• Catch reports and fishing journal entries</Text>
          <Text style={styles.bulletPoint}>• User interactions (likes, reports)</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.subsectionTitle}>2. Data Usage</Text>
          <Text style={styles.text}>
            Your data is used to:
          </Text>
          <Text style={styles.bulletPoint}>• Provide personalized fishing recommendations</Text>
          <Text style={styles.bulletPoint}>• Display your fishing spots and catch reports</Text>
          <Text style={styles.bulletPoint}>• Maintain community standards through moderation</Text>
          <Text style={styles.bulletPoint}>• Improve app features and user experience</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.subsectionTitle}>3. Data Protection</Text>
          <Text style={styles.text}>
            We implement security measures to protect your personal information including:
          </Text>
          <Text style={styles.bulletPoint}>• Firebase Authentication for secure login</Text>
          <Text style={styles.bulletPoint}>• Firestore with security rules</Text>
          <Text style={styles.bulletPoint}>• Encrypted data transmission</Text>
          <Text style={styles.bulletPoint}>• Regular security updates</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.subsectionTitle}>4. Your Privacy Rights</Text>
          <Text style={styles.text}>
            You can:
          </Text>
          <Text style={styles.bulletPoint}>• View and edit your profile information</Text>
          <Text style={styles.bulletPoint}>• Delete your fishing spots and catch reports</Text>
          <Text style={styles.bulletPoint}>• Control who sees your content</Text>
          <Text style={styles.bulletPoint}>• Request account deletion</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.subsectionTitle}>5. Sharing Information</Text>
          <Text style={styles.text}>
            We do not sell your personal information to third parties. Your fishing spots and catch reports are shared within the app community to help other anglers discover great locations and techniques.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.subsectionTitle}>6. Third-Party Services</Text>
          <Text style={styles.text}>
            Leysam Anglers uses the following third-party services:
          </Text>
          <Text style={styles.bulletPoint}>• Firebase (authentication and database)</Text>
          <Text style={styles.bulletPoint}>• Google AdMob (advertisements)</Text>
          <Text style={styles.bulletPoint}>• Google Maps (location services)</Text>
          <Text style={styles.text}>
            Please review their privacy policies for more information.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.subsectionTitle}>7. Contact Us</Text>
          <Text style={styles.text}>
            If you have privacy concerns or questions, please contact us at:
          </Text>
          <Text style={styles.bulletPoint}>• Email: nikkorod04@gmail.com</Text>
          <Text style={styles.bulletPoint}>• Facebook: @nikkorod03</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.footnote}>
            Last updated: December 2025
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SIZES.padding,
    paddingBottom: SIZES.padding * 2,
  },
  sectionTitle: {
    fontSize: SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.margin * 2,
  },
  section: {
    marginBottom: SIZES.margin * 2,
  },
  subsectionTitle: {
    fontSize: SIZES.lg,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: SIZES.margin,
  },
  text: {
    fontSize: SIZES.base,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: SIZES.margin,
  },
  bulletPoint: {
    fontSize: SIZES.base,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginLeft: SIZES.padding,
    marginBottom: SIZES.margin * 0.5,
  },
  footnote: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: SIZES.margin,
  },
});
