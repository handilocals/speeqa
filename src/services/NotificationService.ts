import { supabase } from '../lib/supabase';
import { MessageNotification } from '../types/messages';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

class NotificationService {
  private static instance: NotificationService;
  private notificationListener: any = null;

  private constructor() {
    this.setupNotificationHandler();
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private async setupNotificationHandler() {
    // Configure notification handler
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });

    // Request permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return;
    }

    // Get push token
    const token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log('Push token:', token);

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('No authenticated user found');
      return;
    }

    // Save token to user profile
    const { error } = await supabase
      .from('profiles')
      .update({ push_token: token })
      .eq('id', user.id);

    if (error) {
      console.error('Error saving push token:', error);
    }
  }

  public async registerForPushNotifications() {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
  }

  public async fetchNotifications(): Promise<MessageNotification[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('No authenticated user found');
      return [];
    }

    const { data, error } = await supabase
      .from('message_notifications')
      .select(`
        *,
        message:message_id (
          *,
          sender:profiles!messages_sender_id_fkey(id, username, avatar_url),
          receiver:profiles!messages_receiver_id_fkey(id, username, avatar_url)
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }

    return data || [];
  }

  public async markNotificationAsRead(notificationId: string) {
    const { error } = await supabase
      .from('message_notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  public async markAllNotificationsAsRead() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('No authenticated user found');
      return;
    }

    const { error } = await supabase
      .from('message_notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false);

    if (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }

  public async getUnreadCount(): Promise<number> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('No authenticated user found');
      return 0;
    }

    const { count, error } = await supabase
      .from('message_notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_read', false);

    if (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }

    return count || 0;
  }

  public startListening(callback: (notification: MessageNotification) => void) {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        console.error('No authenticated user found');
        return;
      }

      this.notificationListener = supabase
        .channel('message_notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'message_notifications',
            filter: `user_id=eq.${user.id}`,
          },
          async (payload) => {
            const notification = payload.new as MessageNotification;
            
            // Fetch full message details
            const { data: message } = await supabase
              .from(notification.message_type === 'general' ? 'messages' : 'marketplace_messages')
              .select(`
                *,
                sender:profiles!messages_sender_id_fkey(id, username, avatar_url),
                receiver:profiles!messages_receiver_id_fkey(id, username, avatar_url)
              `)
              .eq('id', notification.message_id)
              .single();

            if (message) {
              notification.message = message;
              callback(notification);
            }
          }
        )
        .subscribe();
    });
  }

  public stopListening() {
    if (this.notificationListener) {
      this.notificationListener.unsubscribe();
      this.notificationListener = null;
    }
  }
}

export const notificationService = NotificationService.getInstance(); 