import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { tokens } from '../../theme/tokens';
import { Button } from '../common/Button';

interface SortModalProps {
  visible: boolean;
  onClose: () => void;
  sortBy: string;
  onSortChange: (sortOption: string) => void;
}

const SORT_OPTIONS = [
  { id: 'relevance', label: 'Relevance', icon: 'checkmark-circle-outline' },
  { id: 'distance', label: 'Distance', icon: 'location-outline' },
  { id: 'price_low', label: 'From cheapest to most expensive', icon: 'arrow-up-outline' },
  { id: 'price_high', label: 'From most expensive to cheapest', icon: 'arrow-down-outline' },
  { id: 'newest', label: 'News', icon: 'calendar-outline' },
];

export const SortModal: React.FC<SortModalProps> = ({
  visible,
  onClose,
  sortBy,
  onSortChange,
}) => {
  const { theme } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Button
        variant="text"
        onPress={onClose}
        style={[styles.overlay, { backgroundColor: theme.colors.neutral[900] }] as unknown as ViewStyle}
      >
        <View style={[styles.modalContent, { backgroundColor: theme.colors.neutral[50] }]}>
          <Text style={[styles.title, { color: theme.colors.neutral[900] }]}>
            sort by
          </Text>
          {SORT_OPTIONS.map(option => (
            <Button
              key={option.id}
              variant="text"
              onPress={() => {
                onSortChange(option.id);
                onClose();
              }}
              style={styles.option}
            >
              <View style={styles.optionIcon}>
                <Ionicons
                  name={option.icon as any}
                  size={24}
                  color={sortBy === option.id ? theme.colors.primary[500] : theme.colors.neutral[500]}
                />
              </View>
              <Text style={[
                styles.optionText,
                { 
                  color: sortBy === option.id 
                    ? theme.colors.primary[500] 
                    : theme.colors.neutral[900] 
                }
              ]}>
                {option.label}
              </Text>
            </Button>
          ))}
        </View>
      </Button>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: tokens.borderRadius.xl,
    borderTopRightRadius: tokens.borderRadius.xl,
    padding: tokens.spacing.md,
    maxHeight: '50%',
  },
  title: {
    fontSize: tokens.typography.fontSize.base,
    marginBottom: tokens.spacing.md,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: tokens.spacing.md,
  },
  optionIcon: {
    width: 24,
    marginRight: tokens.spacing.sm,
  },
  optionText: {
    fontSize: tokens.typography.fontSize.base,
  },
}); 