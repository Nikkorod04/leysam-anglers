import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Linking,
  TouchableOpacity,
} from 'react-native';
import { COLORS, SIZES } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

export const AboutScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const appVersion = '1.0.0';

  const openLink = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* App Logo Section */}
        <View style={styles.logoSection}>
          <Image 
            source={require('../../assets/nikko.png')} 
            style={styles.logo}
          />
          <Text style={styles.appName}>LeySam Anglers</Text>
          <Text style={styles.appVersion}>Version {appVersion}</Text>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.description}>
            LeySam Anglers is your ultimate fishing companion for discovering and sharing the best fishing spots in Leyte and Samar, Philippines.
          </Text>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Features</Text>
          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <Ionicons name="map" size={24} color={COLORS.primary} />
              <Text style={styles.featureText}>Discover fishing spots on interactive map</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="add-circle" size={24} color={COLORS.primary} />
              <Text style={styles.featureText}>Share your favorite fishing locations</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="images" size={24} color={COLORS.primary} />
              <Text style={styles.featureText}>Post catch reports with photos</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="people" size={24} color={COLORS.primary} />
              <Text style={styles.featureText}>Connect with local anglers</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="shield-checkmark" size={24} color={COLORS.primary} />
              <Text style={styles.featureText}>Community moderation & reporting</Text>
            </View>
          </View>
        </View>

        {/* Contact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact & Support</Text>
          <TouchableOpacity 
            style={styles.contactItem}
            onPress={() => openLink('https://www.facebook.com/nikkorod03/')}
          >
            <Ionicons name="logo-facebook" size={20} color={COLORS.primary} />
            <Text style={styles.contactText}>Nikko Rodriguez Villas (pinduta)</Text>
          </TouchableOpacity>
        </View>

        {/* Credits */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Developed By</Text>
          <Text style={styles.creditsText}>LeySam Anglers Development Team (ako la)</Text>
          <Text style={styles.creditsSubtext}>HAHAHAHA</Text>
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
    padding: SIZES.padding * 2,
  },
  logoSection: {
    alignItems: 'center',
    paddingVertical: SIZES.padding * 3,
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    marginBottom: SIZES.margin * 2,
  },
  appName: {
    fontSize: SIZES.title,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.margin / 2,
  },
  appVersion: {
    fontSize: SIZES.base,
    color: COLORS.textSecondary,
  },
  section: {
    marginBottom: SIZES.margin * 3,
  },
  description: {
    fontSize: SIZES.base,
    color: COLORS.text,
    lineHeight: 24,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.margin * 2,
  },
  featureList: {
    gap: SIZES.margin * 1.5,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.margin,
  },
  featureText: {
    fontSize: SIZES.base,
    color: COLORS.text,
    flex: 1,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.margin,
    padding: SIZES.padding,
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
  },
  contactText: {
    fontSize: SIZES.base,
    color: COLORS.text,
  },
  creditsText: {
    fontSize: SIZES.base,
    color: COLORS.text,
    marginBottom: SIZES.margin / 2,
  },
  creditsSubtext: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
  },
  legalText: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
