import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AdminPoliticiansScreen } from './AdminPoliticiansScreen';
import { supabase } from '../lib/supabase';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { tokens } from '../theme/tokens';
import { LoadingIndicator } from '../components/common/LoadingIndicator';

// Type definitions
type RootStackParamList = {
  Profile: { userId: string };
  Privacy: undefined;
  Language: undefined;
  Location: undefined;
  Help: undefined;
  Contact: undefined;
  Terms: undefined;
  About: undefined;
  AdminPoliticians: undefined;
};

type SettingsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Theme {
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  primary: string;
  border: string;
  isDark: boolean;
  setThemeType?: (type: 'light' | 'dark') => void;
}

interface BaseSettingItem {
  icon: string;
  label: string;
}

interface ToggleSettingItem extends BaseSettingItem {
  type: 'toggle';
  value: boolean;
  onToggle: () => void;
}

interface ValueSettingItem extends BaseSettingItem {
  type?: undefined;
  value: string;
  onPress: () => void;
}

interface ActionSettingItem extends BaseSettingItem {
  type?: undefined;
  value?: undefined;
  onPress: () => void;
}

type SettingItem = ToggleSettingItem | ValueSettingItem | ActionSettingItem;

interface SettingsSection {
  title: string;
  items: SettingItem[];
}

export function SettingsScreen() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { theme, setThemeType } = useTheme();
  const { user, signOut } = useAuth();
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = React.useState(theme.isDark);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.neutral[50],
    },
    content: {
      flex: 1,
    },
    header: {
      padding: tokens.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.neutral[200],
    },
    headerText: {
      fontSize: tokens.typography.fontSize.xl,
      fontWeight: tokens.typography.fontWeight.bold,
      color: theme.colors.neutral[900],
    },
    section: {
      padding: tokens.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.neutral[200],
    },
    sectionTitle: {
      fontSize: tokens.typography.fontSize.lg,
      fontWeight: tokens.typography.fontWeight.semibold,
      color: theme.colors.neutral[900],
      marginBottom: tokens.spacing.sm,
    },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: tokens.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.neutral[200],
    },
    optionText: {
      flex: 1,
      fontSize: tokens.typography.fontSize.base,
      color: theme.colors.neutral[900],
    },
    optionValue: {
      fontSize: tokens.typography.fontSize.base,
      color: theme.colors.neutral[500],
      marginRight: tokens.spacing.sm,
    },
    switch: {
      transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
    },
    version: {
      textAlign: 'center',
      fontSize: tokens.typography.fontSize.base,
      color: theme.colors.neutral[500],
      marginTop: tokens.spacing.xl,
      marginBottom: tokens.spacing.md,
    },
    logoutButton: {
      margin: tokens.spacing.md,
      backgroundColor: theme.colors.error[500],
    },
    logoutText: {
      color: theme.colors.neutral[50],
      fontSize: tokens.typography.fontSize.base,
      fontWeight: tokens.typography.fontWeight.medium,
    },
    errorText: {
      fontSize: tokens.typography.fontSize.base,
      textAlign: 'center',
      marginBottom: tokens.spacing.md,
    },
    retryButton: {
      marginHorizontal: tokens.spacing.md,
    },
    signOutButton: {
      margin: tokens.spacing.md,
      marginBottom: tokens.spacing.xl,
    },
    settingItem: {
      marginBottom: tokens.spacing.sm,
    },
    settingItemContent: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: tokens.spacing.md,
    },
    settingItemLeft: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
    },
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: tokens.spacing.sm,
    },
    settingLabel: {
      fontSize: tokens.typography.fontSize.base,
      fontWeight: tokens.typography.fontWeight.medium,
    },
    settingValue: {
      fontSize: tokens.typography.fontSize.sm,
      color: theme.colors.neutral[500],
    },
  });

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  const checkAdminStatus = async () => {
    if (!user) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setIsAdmin(!!data);
    } catch (error) {
      console.error('Error checking admin status:', error);
      setError('Failed to check admin status. Please try again later.');
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTheme = () => {
    try {
      const newValue = !darkModeEnabled;
      setDarkModeEnabled(newValue);
      setThemeType(newValue ? 'dark' : 'light');
    } catch (error) {
      console.error('Error toggling theme:', error);
      Alert.alert('Error', 'Failed to change theme. Please try again.');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    }
  };

  const settingsSections: SettingsSection[] = [
    {
      title: 'Account',
      items: [
        {
          icon: 'person-outline',
          label: 'Profile Information',
          onPress: () => navigation.navigate('Profile', { userId: 'me' }),
        } as ActionSettingItem,
        {
          icon: 'notifications-outline',
          label: 'Notifications',
          type: 'toggle',
          value: notificationsEnabled,
          onToggle: () => setNotificationsEnabled(!notificationsEnabled),
        } as ToggleSettingItem,
        {
          icon: 'shield-outline',
          label: 'Privacy & Security',
          onPress: () => navigation.navigate('Privacy'),
        } as ActionSettingItem,
      ],
    },
    {
      title: 'Preferences',
      items: [
        {
          icon: 'moon-outline',
          label: 'Dark Mode',
          type: 'toggle',
          value: darkModeEnabled,
          onToggle: handleToggleTheme,
        } as ToggleSettingItem,
        {
          icon: 'language-outline',
          label: 'Language',
          value: 'English',
          onPress: () => navigation.navigate('Language'),
        } as ValueSettingItem,
        {
          icon: 'location-outline',
          label: 'Location',
          value: 'Current',
          onPress: () => navigation.navigate('Location'),
        } as ValueSettingItem,
      ],
    },
    {
      title: 'Support',
      items: [
        {
          icon: 'help-circle-outline',
          label: 'Help Center',
          onPress: () => navigation.navigate('Help'),
        } as ActionSettingItem,
        {
          icon: 'chatbubble-outline',
          label: 'Contact Us',
          onPress: () => navigation.navigate('Contact'),
        } as ActionSettingItem,
        {
          icon: 'document-text-outline',
          label: 'Terms of Service',
          onPress: () => navigation.navigate('Terms'),
        } as ActionSettingItem,
        {
          icon: 'information-circle-outline',
          label: 'About',
          onPress: () => navigation.navigate('About'),
        } as ActionSettingItem,
      ],
    },
  ];

  if (isAdmin) {
    settingsSections.push({
      title: 'Admin',
      items: [
        {
          icon: 'people-outline',
          label: 'Manage Politicians',
          onPress: () => navigation.navigate('AdminPoliticians'),
        } as ActionSettingItem,
      ],
    });
  }

  if (loading) {
    return <LoadingIndicator fullScreen />;
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.neutral[50] }]}>
        <Text style={[styles.errorText, { color: theme.colors.neutral[900] }]}>{error}</Text>
        <Button
          variant="primary"
          onPress={checkAdminStatus}
          style={styles.retryButton}
        >
          Retry
        </Button>
      </View>
    );
  }

  const renderSettingItem = (item: SettingItem) => {
    if (item.type === 'toggle') {
      return (
        <Card
          variant="elevated"
          style={styles.settingItem}
        >
          <View style={styles.settingItemContent}>
            <View style={styles.settingItemLeft}>
              <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary[100] }]}>
                <Ionicons name={item.icon as any} size={24} color={theme.colors.primary[500]} />
              </View>
              <Text style={[styles.settingLabel, { color: theme.colors.neutral[900] }]}>
                {item.label}
              </Text>
            </View>
            <Switch
              value={item.value}
              onValueChange={item.onToggle}
              trackColor={{ false: theme.colors.neutral[200], true: theme.colors.primary[300] }}
              thumbColor={item.value ? theme.colors.primary[500] : theme.colors.neutral[400]}
            />
          </View>
        </Card>
      );
    }

    return (
      <Card
        variant="elevated"
        onPress={item.onPress}
        style={styles.settingItem}
      >
        <View style={styles.settingItemContent}>
          <View style={styles.settingItemLeft}>
            <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary[100] }]}>
              <Ionicons name={item.icon as any} size={24} color={theme.colors.primary[500]} />
            </View>
            <View>
              <Text style={[styles.settingLabel, { color: theme.colors.neutral[900] }]}>
                {item.label}
              </Text>
              {item.value && (
                <Text style={[styles.settingValue, { color: theme.colors.neutral[500] }]}>
                  {item.value}
                </Text>
              )}
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.neutral[500]} />
        </View>
      </Card>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.neutral[50] }]}>
      <ScrollView style={styles.content}>
        {settingsSections.map((section, index) => (
          <View key={section.title} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.neutral[500] }]}>
              {section.title}
            </Text>
            {section.items.map((item) => renderSettingItem(item))}
          </View>
        ))}
        <Button
          variant="outline"
          onPress={handleSignOut}
          style={styles.signOutButton}
        >
          Sign Out
        </Button>
      </ScrollView>
    </View>
  );
} 