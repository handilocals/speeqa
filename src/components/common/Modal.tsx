import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { tokens } from '../../theme/tokens';
import { Button } from './Button';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
  fullScreen?: boolean;
  animationType?: 'none' | 'slide' | 'fade';
  transparent?: boolean;
  presentationStyle?: 'fullScreen' | 'pageSheet' | 'formSheet' | 'overFullScreen';
}

export function ModalComponent({
  visible,
  onClose,
  title,
  children,
  showCloseButton = true,
  fullScreen = false,
  animationType = 'fade',
  transparent = true,
  presentationStyle = 'overFullScreen',
}: ModalProps) {
  const { theme } = useTheme();

  const renderModalContent = () => (
    <View
      style={[
        styles.modalContent,
        {
          backgroundColor: theme.colors.neutral[50],
          borderColor: theme.colors.neutral[200],
        },
        fullScreen && styles.fullScreenContent,
      ]}
    >
      {title && (
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.neutral[900] }]}>
            {title}
          </Text>
          {showCloseButton && (
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
            >
              <Ionicons
                name="close"
                size={24}
                color={theme.colors.neutral[900]}
              />
            </TouchableOpacity>
          )}
        </View>
      )}
      <View style={styles.content}>{children}</View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent={transparent}
      animationType={animationType}
      presentationStyle={presentationStyle}
      onRequestClose={onClose}
    >
      {transparent ? (
        <BlurView
          intensity={Platform.OS === 'ios' ? 50 : 100}
          style={styles.blurContainer}
        >
          {renderModalContent()}
        </BlurView>
      ) : (
        renderModalContent()
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  blurContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 500,
    borderRadius: tokens.borderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: tokens.colors.neutral[900],
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  fullScreenContent: {
    width: '100%',
    maxWidth: '100%',
    height: '100%',
    borderRadius: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: tokens.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.neutral[200],
  },
  title: {
    fontSize: tokens.typography.fontSize.xl,
    fontWeight: tokens.typography.fontWeight.bold,
    flex: 1,
  },
  closeButton: {
    padding: tokens.spacing.sm,
    marginLeft: tokens.spacing.sm,
  },
  content: {
    padding: tokens.spacing.lg,
  },
}); 