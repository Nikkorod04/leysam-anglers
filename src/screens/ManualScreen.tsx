import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { COLORS, SIZES } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

export const ManualScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.mainTitle}>App Manual</Text>
        <Text style={styles.subtitle}>Learn how to use LeySam Anglers</Text>

        {/* Getting Started */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Getting Started</Text>
          <Text style={styles.text}>
            
            Welcome to LeySam Anglers! This guide will help you discover fishing spots and share your catches with the community.
          </Text>
        </View>

        {/* Map Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="map" size={28} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Fishing Spots Map</Text>
          </View>
          
          <View style={styles.step}>
            <Text style={styles.stepTitle}>• View Spots</Text>
            <Text style={styles.stepText}>
              Browse all fishing spots on the interactive map. Tap any marker to see details.
            </Text>
          </View>

          <View style={styles.step}>
            <Text style={styles.stepTitle}>• Map Controls</Text>
            <Text style={styles.stepText}>
              Use the "Map Display" dropdown to toggle landmarks and labels visibility.
            </Text>
          </View>

          <View style={styles.step}>
            <Text style={styles.stepTitle}>• Add New Spot</Text>
            <Text style={styles.stepText}>
              Tap the green + button to add a new fishing spot. You can use your current location or pick from the map.
            </Text>
          </View>

          <View style={styles.step}>
            <Text style={styles.stepTitle}>• Spot Details</Text>
            <Text style={styles.stepText}>
              Include name, description, fish types, best fishing time, and photos. Minimum 10 characters for description and at least 1 photo required.
            </Text>
          </View>
        </View>

        {/* Feed Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="images" size={28} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Catch Reports Feed</Text>
          </View>
          
          <View style={styles.step}>
            <Text style={styles.stepTitle}>• View Reports</Text>
            <Text style={styles.stepText}>
              See what other anglers have caught. Like or "Fish on" on their posts.
            </Text>
          </View>

          <View style={styles.step}>
            <Text style={styles.stepTitle}>• Post Your Catch</Text>
            <Text style={styles.stepText}>
              Tap the + button to share your catch. Add title, description, fish type, and a photo.
            </Text>
          </View>

          <View style={styles.step}>
            <Text style={styles.stepTitle}>• Link to Fishing Spot</Text>
            <Text style={styles.stepText}>
              When posting a catch report, you can optionally select which fishing spot you caught it from.
            </Text>
          </View>
        </View>

        {/* Spam Prevention */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="shield-checkmark" size={28} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Posting Limits</Text>
          </View>
          
          <View style={styles.limitBox}>
            <Text style={styles.limitText}>• Maximum 5 spots per day</Text>
            <Text style={styles.limitText}>• Maximum 20 spots per week</Text>
            <Text style={styles.limitText}>• 5-minute cooldown between posts</Text>
            <Text style={styles.limitText}>• Must include description (min 10 chars)</Text>
            <Text style={styles.limitText}>• Must include at least 1 photo</Text>
          </View>
        </View>

        {/* Reporting */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="flag" size={28} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Report Inappropriate Content</Text>
          </View>
          
          <View style={styles.step}>
            <Text style={styles.stepTitle}>• How to Report</Text>
            <Text style={styles.stepText}>
              On any fishing spot detail page, tap the flag icon to report spam, inappropriate content, or fake spots.
            </Text>
          </View>

          <View style={styles.step}>
            <Text style={styles.stepTitle}>• Auto-Flagging</Text>
            <Text style={styles.stepText}>
              Content with 3 or more reports is automatically flagged for admin review.
            </Text>
          </View>
        </View>

        {/* Tips */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="bulb" size={28} color={COLORS.secondary} />
            <Text style={styles.sectionTitle}>Tips for Best Experience</Text>
          </View>
          
          <View style={styles.tipBox}>
            <Text style={styles.tipText}>💡 Add clear, high-quality photos</Text>
            <Text style={styles.tipText}>💡 Write detailed descriptions</Text>
            <Text style={styles.tipText}>💡 Be honest about fish types and conditions</Text>
            <Text style={styles.tipText}>💡 Respect private property</Text>
            <Text style={styles.tipText}>💡 Report spam to keep the community clean</Text>
            <Text style={styles.tipText}>💡 Engage with other anglers' posts</Text>
          </View>
        </View>

        {/* Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Need Help?</Text>
          <TouchableOpacity 
            style={styles.contactItem}
            onPress={() => Linking.openURL('https://www.facebook.com/nikkorod03/')}
          >
            <Ionicons name="logo-facebook" size={20} color={COLORS.primary} />
            <Text style={styles.contactText}>Nikko Rodriguez Villas (pinduta)</Text>
          </TouchableOpacity>
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
  mainTitle: {
    fontSize: SIZES.title * 1.2,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SIZES.margin,
  },
  subtitle: {
    fontSize: SIZES.base,
    color: COLORS.textSecondary,
    marginBottom: SIZES.margin * 3,
  },
  section: {
    marginBottom: SIZES.margin * 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.margin,
    marginBottom: SIZES.margin * 1.5,
  },
  sectionTitle: {
    fontSize: SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  text: {
    fontSize: SIZES.base,
    color: COLORS.text,
    lineHeight: 24,
  },
  step: {
    marginBottom: SIZES.margin * 1.5,
  },
  stepTitle: {
    fontSize: SIZES.base,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: SIZES.margin / 2,
  },
  stepText: {
    fontSize: SIZES.base,
    color: COLORS.text,
    lineHeight: 22,
    paddingLeft: SIZES.padding,
  },
  limitBox: {
    backgroundColor: COLORS.surface,
    padding: SIZES.padding * 1.5,
    borderRadius: SIZES.radius,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  limitText: {
    fontSize: SIZES.base,
    color: COLORS.text,
    marginBottom: SIZES.margin / 2,
  },
  tipBox: {
    backgroundColor: COLORS.surface,
    padding: SIZES.padding * 1.5,
    borderRadius: SIZES.radius,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.secondary,
  },
  tipText: {
    fontSize: SIZES.base,
    color: COLORS.text,
    marginBottom: SIZES.margin,
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
});
