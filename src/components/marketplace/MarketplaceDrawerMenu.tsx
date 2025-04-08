import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { tokens } from '../../theme/tokens';
import { Button } from '../common/Button';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { RootStackParamList } from '../../types/navigation';

interface MarketplaceDrawerMenuProps {
  isVisible: boolean;
  onClose: () => void;
}

interface MenuItem {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  type?: 'divider';
}

type NavigationParams = {
  Search: { category: string };
  Profile: { userId?: string; tab?: 'listings' | 'saved' };
  Settings: undefined;
  Support: undefined;
};

export function MarketplaceDrawerMenu({ isVisible, onClose }: MarketplaceDrawerMenuProps) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (isVisible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible]);

  const closeDrawer = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const handleNavigation = <T extends keyof RootStackParamList>(
    screen: T,
    params?: RootStackParamList[T]
  ) => {
    closeDrawer();
    setTimeout(() => {
      onClose();
      setTimeout(() => {
        (navigation.navigate as any)(screen, params);
      }, 50);
    }, 300);
  };

  const menuItems: MenuItem[] = [
    {
      label: 'All Categories',
      icon: 'grid-outline',
      onPress: () => handleNavigation('Search', { category: 'all' }),
    },
    {
      label: 'Electronics',
      icon: 'phone-portrait-outline',
      onPress: () => handleNavigation('Search', { category: 'electronics' }),
    },
    {
      label: 'Clothing',
      icon: 'shirt-outline',
      onPress: () => handleNavigation('Search', { category: 'clothing' }),
    },
    {
      label: 'Home & Garden',
      icon: 'home-outline',
      onPress: () => handleNavigation('Search', { category: 'home' }),
    },
    {
      label: 'Sports',
      icon: 'basketball-outline',
      onPress: () => handleNavigation('Search', { category: 'sports' }),
    },
    {
      label: 'Vehicles',
      icon: 'car-outline',
      onPress: () => handleNavigation('Search', { category: 'vehicles' }),
    },
    {
      label: 'Toys & Games',
      icon: 'game-controller-outline',
      onPress: () => handleNavigation('Search', { category: 'toys' }),
    },
    { 
      type: 'divider',
      label: '',
      icon: 'grid-outline',
      onPress: () => {},
    },
    {
      label: 'My Listings',
      icon: 'list-outline',
      onPress: () => handleNavigation('Profile', { userId: user?.id, tab: 'listings' }),
    },
    {
      label: 'Saved Items',
      icon: 'heart-outline',
      onPress: () => handleNavigation('Profile', { userId: user?.id, tab: 'saved' }),
    },
    {
      label: 'Settings',
      icon: 'settings-outline',
      onPress: () => handleNavigation('Settings'),
    },
    {
      label: 'Support',
      icon: 'help-circle-outline',
      onPress: () => handleNavigation('Support'),
    },
  ];

  return (
    <Modal
      transparent
      visible={isVisible}
      animationType="none"
      onRequestClose={() => {
        closeDrawer();
        setTimeout(onClose, 300);
      }}
    >
      <View style={styles.overlay}>
        <Animated.View 
          style={[
            styles.backdrop, 
            { opacity: fadeAnim }
          ]}
        >
          <Button 
            variant="text"
            onPress={() => {
              closeDrawer();
              setTimeout(onClose, 300);
            }} 
            style={styles.backdropTouchable}
          >
            <View />
          </Button>
        </Animated.View>

        <Animated.View
          style={[
            styles.drawer,
            {
              transform: [{ translateX: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-300, 0],
              }) }],
              backgroundColor: theme.colors.neutral[50],
            },
          ]}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.neutral[900] }]}>
              Marketplace
            </Text>
            <Button
              variant="text"
              onPress={() => {
                closeDrawer();
                setTimeout(onClose, 300);
              }}
              style={styles.closeButton}
            >
              <Ionicons 
                name="close" 
                size={24} 
                color={theme.colors.neutral[900]} 
              />
            </Button>
          </View>

          <View style={styles.menuItems}>
            {menuItems.map((item, index) => (
              item.type === 'divider' ? (
                <View 
                  key={index} 
                  style={[styles.divider, { backgroundColor: theme.colors.neutral[200] }]} 
                />
              ) : (
                <Button
                  key={index}
                  variant="text"
                  onPress={item.onPress}
                  style={styles.menuItem}
                >
                  <Ionicons 
                    name={item.icon as any} 
                    size={24} 
                    color={theme.colors.neutral[500]} 
                  />
                  <Text style={[styles.menuItemText, { color: theme.colors.neutral[900] }]}>
                    {item.label}
                  </Text>
                </Button>
              )
            ))}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdropTouchable: {
    ...StyleSheet.absoluteFillObject,
  },
  drawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: '80%',
    maxWidth: 300,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: tokens.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.neutral[200],
  },
  title: {
    fontSize: tokens.typography.fontSize.xl,
    fontWeight: tokens.typography.fontWeight.bold,
  },
  closeButton: {
    padding: tokens.spacing.sm,
  },
  menuItems: {
    padding: tokens.spacing.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: tokens.spacing.md,
    justifyContent: 'flex-start',
    width: '100%',
  },
  menuItemText: {
    marginLeft: tokens.spacing.md,
    fontSize: tokens.typography.fontSize.base,
    fontWeight: tokens.typography.fontWeight.regular,
  },
  divider: {
    height: 1,
    marginVertical: tokens.spacing.md,
  },
}); 