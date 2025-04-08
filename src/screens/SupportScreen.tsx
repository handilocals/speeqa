import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { tokens } from '../theme/tokens';

export function SupportScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation();

  const supportOptions = [
    {
      title: 'Frequently Asked Questions',
      icon: 'help-circle-outline',
      description: 'Find answers to common questions',
      onPress: () => {},
    },
    {
      title: 'Contact Support Team',
      icon: 'mail-outline',
      description: 'Send us an email with your question',
      onPress: () => Linking.openURL('mailto:support@speeqa.com'),
    },
    {
      title: 'Live Chat Support',
      icon: 'chatbubble-outline',
      description: 'Chat with our support team',
      onPress: () => {},
    },
    {
      title: 'User Guide',
      icon: 'book-outline',
      description: 'Learn how to use our app',
      onPress: () => {},
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.neutral[50] }]}>
      <View style={[styles.header, { borderBottomColor: theme.colors.neutral[200] }]}>
        <Button
          variant="text"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.neutral[900]} />
        </Button>
        <Text style={[styles.headerTitle, { color: theme.colors.neutral[900] }]}>
          Support & Help
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.bannerSection}>
          <Card
            variant="filled"
            style={{
              ...styles.banner,
              backgroundColor: theme.colors.primary[100]
            }}
          >
            <Ionicons name="headset-outline" size={48} color={theme.colors.primary[500]} />
            <Text style={[styles.bannerTitle, { color: theme.colors.neutral[900] }]}>
              How can we help you?
            </Text>
            <Text style={[styles.bannerSubtitle, { color: theme.colors.neutral[500] }]}>
              Our support team is here to assist you with any issues or questions
            </Text>
          </Card>
        </View>

        <View style={styles.optionsSection}>
          {supportOptions.map((option, index) => (
            <Card
              key={option.title}
              variant="elevated"
              onPress={option.onPress}
              style={styles.optionCard}
            >
              <View style={[styles.optionIconContainer, { backgroundColor: theme.colors.primary[100] }]}>
                <Ionicons name={option.icon as any} size={24} color={theme.colors.primary[500]} />
              </View>
              <View style={styles.optionContent}>
                <Text style={[styles.optionTitle, { color: theme.colors.neutral[900] }]}>
                  {option.title}
                </Text>
                <Text style={[styles.optionDescription, { color: theme.colors.neutral[500] }]}>
                  {option.description}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.neutral[500]} />
            </Card>
          ))}
        </View>

        <View style={styles.infoSection}>
          <Text style={[styles.infoTitle, { color: theme.colors.neutral[900] }]}>
            Operating Hours
          </Text>
          <Text style={[styles.infoText, { color: theme.colors.neutral[500] }]}>
            Monday - Friday: 9:00 AM - 6:00 PM
          </Text>
          <Text style={[styles.infoText, { color: theme.colors.neutral[500] }]}>
            Saturday: 10:00 AM - 4:00 PM
          </Text>
          <Text style={[styles.infoText, { color: theme.colors.neutral[500], marginBottom: tokens.spacing.md }]}>
            Sunday: Closed
          </Text>

          <Text style={[styles.infoTitle, { color: theme.colors.neutral[900] }]}>
            Contact Information
          </Text>
          <Text style={[styles.infoText, { color: theme.colors.neutral[500] }]}>
            Email: support@speeqa.com
          </Text>
          <Text style={[styles.infoText, { color: theme.colors.neutral[500] }]}>
            Phone: +1 (800) 123-4567
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: tokens.spacing.md,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: tokens.spacing.xs,
  },
  headerTitle: {
    fontSize: tokens.typography.fontSize.lg,
    fontWeight: tokens.typography.fontWeight.bold,
  },
  content: {
    flex: 1,
  },
  bannerSection: {
    padding: tokens.spacing.md,
  },
  banner: {
    borderRadius: tokens.borderRadius.lg,
    padding: tokens.spacing.lg,
    alignItems: 'center',
  },
  bannerTitle: {
    fontSize: tokens.typography.fontSize.xl,
    fontWeight: tokens.typography.fontWeight.bold,
    marginTop: tokens.spacing.md,
    marginBottom: tokens.spacing.sm,
    textAlign: 'center',
  },
  bannerSubtitle: {
    fontSize: tokens.typography.fontSize.base,
    textAlign: 'center',
    lineHeight: tokens.typography.lineHeight.normal,
  },
  optionsSection: {
    padding: tokens.spacing.md,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: tokens.borderRadius.md,
    padding: tokens.spacing.md,
    marginBottom: tokens.spacing.sm,
  },
  optionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: tokens.spacing.md,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: tokens.typography.fontSize.base,
    fontWeight: tokens.typography.fontWeight.semibold,
    marginBottom: tokens.spacing.xs,
  },
  optionDescription: {
    fontSize: tokens.typography.fontSize.base,
  },
  infoSection: {
    padding: tokens.spacing.md,
    marginBottom: tokens.spacing.xl,
  },
  infoTitle: {
    fontSize: tokens.typography.fontSize.base,
    fontWeight: tokens.typography.fontWeight.semibold,
    marginBottom: tokens.spacing.sm,
  },
  infoText: {
    fontSize: tokens.typography.fontSize.base,
    marginBottom: tokens.spacing.xs,
  },
}); 