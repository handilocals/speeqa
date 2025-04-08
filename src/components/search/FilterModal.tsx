import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { useTheme } from '../../contexts/ThemeContext';
import { tokens } from '../../theme/tokens';
import { Button } from '../common/Button';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: () => void;
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  shippingAvailable: boolean;
  setShippingAvailable: (value: boolean) => void;
  selectedTimeFilter: number;
  setSelectedTimeFilter: (value: number) => void;
  location: string;
}

const TIME_FILTERS = [
  { value: 24, label: 'hours' },
  { value: 7, label: 'days' },
  { value: 30, label: 'days' },
];

export const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  onApply,
  priceRange,
  setPriceRange,
  shippingAvailable,
  setShippingAvailable,
  selectedTimeFilter,
  setSelectedTimeFilter,
  location,
}) => {
  const { theme } = useTheme();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={[styles.modalContainer, { backgroundColor: theme.colors.neutral[50] }]}>
        <View style={[styles.modalHeader, { borderBottomColor: theme.colors.neutral[200] }]}>
          <Text style={[styles.modalTitle, { color: theme.colors.neutral[900] }]}>
            Filters
          </Text>
          <Button
            variant="text"
            onPress={onClose}
            style={styles.closeButton}
          >
            <Ionicons 
              name="close" 
              size={24} 
              color={theme.colors.neutral[900]} 
            />
          </Button>
        </View>

        <Button
          variant="text"
          onPress={() => {/* TODO: Navigate to CategorySelect */}}
          style={StyleSheet.flatten([styles.filterSection, { borderBottomColor: theme.colors.neutral[200] }])}
        >
          <View style={styles.filterSectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.neutral[900] }]}>
              Category
            </Text>
            <Ionicons 
              name="chevron-forward" 
              size={24} 
              color={theme.colors.neutral[400]} 
            />
          </View>
        </Button>

        <View style={[styles.filterSection, { borderBottomColor: theme.colors.neutral[200] }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.neutral[900] }]}>
            How much do you want to pay?
          </Text>
          <View style={styles.priceRangeContainer}>
            <Slider
              style={{width: '100%', height: 40}}
              minimumValue={0}
              maximumValue={1000}
              value={priceRange[0]}
              onValueChange={value => setPriceRange([value, priceRange[1]])}
              minimumTrackTintColor={theme.colors.primary[500]}
              maximumTrackTintColor={theme.colors.neutral[200]}
            />
            <View style={styles.priceRangeLabels}>
              <Text style={[styles.priceLabel, { color: theme.colors.neutral[400] }]}>
                0
              </Text>
              <Text style={[styles.priceLabel, { color: theme.colors.neutral[400] }]}>
                No limit
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.filterSection, { borderBottomColor: theme.colors.neutral[200] }]}>
          <View style={styles.shippingContainer}>
            <Text style={[styles.sectionTitle, { color: theme.colors.neutral[900] }]}>
              Shipping available
            </Text>
            <Switch
              value={shippingAvailable}
              onValueChange={setShippingAvailable}
              trackColor={{ 
                false: theme.colors.neutral[200], 
                true: theme.colors.primary[500] 
              }}
            />
          </View>
        </View>

        <Button
          variant="text"
          onPress={() => {/* TODO: Navigate to ProductStatus */}}
          style={StyleSheet.flatten([styles.filterSection, { borderBottomColor: theme.colors.neutral[200] }])}
        >
          <View style={styles.filterSectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.neutral[900] }]}>
              Product status
            </Text>
            <Ionicons 
              name="chevron-forward" 
              size={24} 
              color={theme.colors.neutral[400]} 
            />
          </View>
        </Button>

        <Button
          variant="text"
          onPress={() => {/* TODO: Navigate to LocationSelect */}}
          style={StyleSheet.flatten([styles.filterSection, { borderBottomColor: theme.colors.neutral[200] }])}
        >
          <View style={styles.filterSectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.neutral[900] }]}>
              Where?
            </Text>
            <Text style={{ color: theme.colors.neutral[400] }}>{location}</Text>
            <Ionicons 
              name="chevron-forward" 
              size={24} 
              color={theme.colors.neutral[400]} 
            />
          </View>
        </Button>

        <View style={[styles.filterSection, { borderBottomColor: theme.colors.neutral[200] }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.neutral[900] }]}>
            Published ago
          </Text>
          <View style={styles.timeFiltersContainer}>
            {TIME_FILTERS.map(filter => (
              <Button
                key={filter.value}
                variant="text"
                onPress={() => setSelectedTimeFilter(filter.value)}
                style={styles.timeFilter}
              >
                <Text style={[
                  styles.timeValue,
                  { 
                    color: selectedTimeFilter === filter.value 
                      ? theme.colors.primary[500] 
                      : theme.colors.neutral[900] 
                  }
                ]}>
                  {filter.value}
                </Text>
                <Text style={[styles.timeLabel, { color: theme.colors.neutral[400] }]}>
                  {filter.label}
                </Text>
              </Button>
            ))}
          </View>
        </View>

        <Button
          variant="primary"
          onPress={onApply}
          style={styles.applyButton}
        >
          <Text style={[styles.applyButtonText, { color: theme.colors.neutral[900] }]}>
            Apply
          </Text>
        </Button>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: tokens.spacing.md,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: tokens.typography.fontSize.xl,
    fontWeight: tokens.typography.fontWeight.semibold,
  },
  closeButton: {
    padding: tokens.spacing.xs,
  },
  filterSection: {
    padding: tokens.spacing.md,
    borderBottomWidth: 1,
  },
  filterSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: tokens.typography.fontSize.base,
    fontWeight: tokens.typography.fontWeight.semibold,
    marginBottom: tokens.spacing.sm,
  },
  priceRangeContainer: {
    paddingVertical: tokens.spacing.md,
  },
  priceRangeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: tokens.spacing.sm,
  },
  priceLabel: {
    fontSize: tokens.typography.fontSize.sm,
  },
  shippingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: tokens.spacing.sm,
  },
  timeFiltersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: tokens.spacing.md,
  },
  timeFilter: {
    alignItems: 'center',
  },
  timeValue: {
    fontSize: tokens.typography.fontSize.xl,
    fontWeight: tokens.typography.fontWeight.semibold,
    marginBottom: tokens.spacing.xs,
  },
  timeLabel: {
    fontSize: tokens.typography.fontSize.sm,
  },
  applyButton: {
    margin: tokens.spacing.md,
    padding: tokens.spacing.md,
    borderRadius: tokens.borderRadius.md,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: tokens.typography.fontSize.base,
    fontWeight: tokens.typography.fontWeight.semibold,
  },
}); 