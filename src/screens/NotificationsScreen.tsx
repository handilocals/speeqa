import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useNotifications } from '../contexts/NotificationContext';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { formatDistanceToNow } from 'date-fns';

type NotificationsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function NotificationsScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<NotificationsScreenNavigationProp>();
  const {
    notifications,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotifications();
  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  const handleNotificationPress = async (notification: any) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }

    if (notification.message) {
      navigation.navigate('Chat', {
        userId: notification.message.sender_id,
        username: notification.message.sender.username,
        listingId: notification.message.listing_id,
        type: notification.message_type,
      });
    }
  };

  const renderNotification = ({ item }: { item: any }) => {
    const message = item.message;
    if (!message) return null;

    return (
      <TouchableOpacity
        style={[
          styles.notificationItem,
          { backgroundColor: theme.colors.neutral[50] },
          !item.is_read && { backgroundColor: theme.colors.primary[50] },
        ]}
        onPress={() => handleNotificationPress(item)}
      >
        <Image
          source={{ uri: message.sender.avatar_url || 'https://via.placeholder.com/40' }}
          style={styles.avatar}
        />
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={[styles.username, { color: theme.colors.neutral[900] }]}>
              {message.sender.username}
            </Text>
            <Text style={[styles.timestamp, { color: theme.colors.neutral[500] }]}>
              {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
            </Text>
          </View>
          <Text
            style={[
              styles.message,
              { color: theme.colors.neutral[700] },
              !item.is_read && { color: theme.colors.neutral[900] },
            ]}
            numberOfLines={2}
          >
            {message.content}
          </Text>
          {message.listing && (
            <View style={styles.listingContainer}>
              <Ionicons
                name="cart"
                size={16}
                color={theme.colors.primary[500]}
                style={styles.listingIcon}
              />
              <Text
                style={[styles.listingTitle, { color: theme.colors.primary[500] }]}
                numberOfLines={1}
              >
                {message.listing.title}
              </Text>
            </View>
          )}
        </View>
        {!item.is_read && (
          <View style={[styles.unreadDot, { backgroundColor: theme.colors.primary[500] }]} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.neutral[50] }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.neutral[900] }]}>
          Notifications
        </Text>
        {notifications.some(n => !n.is_read) && (
          <TouchableOpacity
            style={[styles.markAllButton, { backgroundColor: theme.colors.primary[500] }]}
            onPress={markAllAsRead}
          >
            <Text style={[styles.markAllText, { color: theme.colors.neutral[50] }]}>
              Mark All Read
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary[500]} />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: theme.colors.error[500] }]}>
            {error}
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: theme.colors.primary[500] }]}
            onPress={fetchNotifications}
          >
            <Text style={[styles.retryButtonText, { color: theme.colors.neutral[50] }]}>
              Retry
            </Text>
          </TouchableOpacity>
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons
            name="notifications-off"
            size={48}
            color={theme.colors.neutral[300]}
            style={styles.emptyIcon}
          />
          <Text style={[styles.emptyText, { color: theme.colors.neutral[500] }]}>
            No notifications yet
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  markAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  markAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  listContent: {
    padding: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
  },
  timestamp: {
    fontSize: 12,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
  },
  listingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  listingIcon: {
    marginRight: 4,
  },
  listingTitle: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    position: 'absolute',
    top: 12,
    right: 12,
  },
}); 