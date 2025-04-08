import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { tokens } from '../../theme/tokens';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { MessageNotification } from '../../types/notifications';
import { formatDistanceToNow } from 'date-fns';

interface NotificationItemProps {
  notification: MessageNotification;
  onPress?: () => void;
}

export function NotificationItem({ notification, onPress }: NotificationItemProps) {
  const { theme } = useTheme();

  const getNotificationIcon = () => {
    switch (notification.type) {
      case 'message':
        return 'chatbubble-outline';
      case 'like':
        return 'heart-outline';
      case 'comment':
        return 'chatbubble-outline';
      case 'follow':
        return 'person-add-outline';
      default:
        return 'notifications-outline';
    }
  };

  const getNotificationColor = () => {
    switch (notification.type) {
      case 'message':
        return theme.colors.primary[500];
      case 'like':
        return theme.colors.error[500];
      case 'comment':
        return theme.colors.success[500];
      case 'follow':
        return theme.colors.warning[500];
      default:
        return theme.colors.neutral[500];
    }
  };

  return (
    <TouchableOpacity onPress={onPress}>
      <Card
        variant="filled"
        style={[
          styles.container,
          { backgroundColor: notification.is_read ? theme.colors.neutral[50] : theme.colors.primary[50] }
        ]}
      >
        <View style={styles.content}>
          <View style={[styles.iconContainer, { backgroundColor: getNotificationColor() }]}>
            <Text style={[styles.icon, { color: theme.colors.neutral[50] }]}>
              {getNotificationIcon()}
            </Text>
          </View>
          <View style={styles.textContainer}>
            <Text style={[styles.message, { color: theme.colors.neutral[900] }]}>
              {notification.message}
            </Text>
            <Text style={[styles.timestamp, { color: theme.colors.neutral[500] }]}>
              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
            </Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: tokens.spacing.sm,
    marginVertical: tokens.spacing.xs,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: tokens.spacing.sm,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: tokens.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: tokens.spacing.sm,
  },
  icon: {
    fontSize: tokens.typography.fontSize.lg,
  },
  textContainer: {
    flex: 1,
  },
  message: {
    fontSize: tokens.typography.fontSize.base,
    marginBottom: tokens.spacing.xs,
  },
  timestamp: {
    fontSize: tokens.typography.fontSize.sm,
  },
}); 