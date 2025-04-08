import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

// Define navigation types
type RootStackParamList = {
  CreateListing: undefined;
};

type LearnMoreScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'CreateListing'>;

// Define feature type
interface Feature {
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const LearnMoreScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<LearnMoreScreenNavigationProp>();

  const features: Feature[] = [
    {
      title: 'Sell Your Items',
      description: 'List items you no longer need and earn money from them.',
      icon: 'cash-outline',
    },
    {
      title: 'Give Away',
      description: 'Donate items to those who need them most.',
      icon: 'gift-outline',
    },
    {
      title: 'Find Deals',
      description: 'Discover great deals on items you need.',
      icon: 'search-outline',
    },
    {
      title: 'Connect',
      description: 'Meet people in your community through item exchanges.',
      icon: 'people-outline',
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.neutral[50] }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.neutral[900]} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.neutral[900] }]}>
          About Marketplace
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.heroSection}>
          <Text style={[styles.heroTitle, { color: theme.colors.neutral[900] }]}>
            Welcome to Marketplace
          </Text>
          <Text style={[styles.heroDescription, { color: theme.colors.neutral[900] }]}>
            A place where you can buy, sell, or give away items within your community.
          </Text>
        </View>

        <View style={styles.featuresSection}>
          {features.map((feature, index) => (
            <View
              key={index}
              style={[styles.featureCard, { backgroundColor: theme.colors.neutral[100] }]}
            >
              <Ionicons
                name={feature.icon}
                size={32}
                color={theme.colors.primary[500]}
                style={styles.featureIcon}
              />
              <Text style={[styles.featureTitle, { color: theme.colors.neutral[900] }]}>
                {feature.title}
              </Text>
              <Text style={[styles.featureDescription, { color: theme.colors.neutral[900] }]}>
                {feature.description}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.howItWorksSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.neutral[900] }]}>
            How It Works
          </Text>
          <View style={styles.stepsContainer}>
            <View style={styles.step}>
              <View style={[styles.stepNumber, { backgroundColor: theme.colors.primary[500] }]}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <Text style={[styles.stepText, { color: theme.colors.neutral[900] }]}>
                Create a listing with photos and description
              </Text>
            </View>
            <View style={styles.step}>
              <View style={[styles.stepNumber, { backgroundColor: theme.colors.primary[500] }]}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <Text style={[styles.stepText, { color: theme.colors.neutral[900] }]}>
                Set your price or mark as free
              </Text>
            </View>
            <View style={styles.step}>
              <View style={[styles.stepNumber, { backgroundColor: theme.colors.primary[500] }]}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <Text style={[styles.stepText, { color: theme.colors.neutral[900] }]}>
                Connect with interested buyers
              </Text>
            </View>
            <View style={styles.step}>
              <View style={[styles.stepNumber, { backgroundColor: theme.colors.primary[500] }]}>
                <Text style={styles.stepNumberText}>4</Text>
              </View>
              <Text style={[styles.stepText, { color: theme.colors.neutral[900] }]}>
                Arrange pickup or delivery
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.getStartedButton, { backgroundColor: theme.colors.primary[500] }]}
          onPress={() => navigation.navigate('CreateListing')}
        >
          <Text style={[styles.getStartedText, { color: theme.colors.neutral[50] }]}>
            Get Started
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 80,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
    marginHorizontal: 16,
  },
  content: {
    flex: 1,
  },
  heroSection: {
    padding: 24,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  heroDescription: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.8,
  },
  featuresSection: {
    padding: 16,
  },
  featureCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  featureIcon: {
    marginBottom: 8,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.8,
  },
  howItWorksSection: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  stepsContainer: {
    gap: 16,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stepNumberText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  stepText: {
    fontSize: 16,
    flex: 1,
  },
  getStartedButton: {
    margin: 24,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  getStartedText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LearnMoreScreen; 