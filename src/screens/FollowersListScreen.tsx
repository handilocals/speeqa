import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Profile } from '../contexts/AuthContext';

interface FollowersListScreenProps {
  navigation: any;
  route: {
    params: {
      userId: string;
      type: 'followers' | 'following';
    };
  };
}

export function FollowersListScreen({ navigation, route }: FollowersListScreenProps) {
  const { userId, type } = route.params;
  const { user } = useAuth();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, [userId, type]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data: connections, error } = await supabase
        .from('user_followers')
        .select(`
          ${type === 'followers' ? 'follower_id' : 'following_id'}
        `)
        .eq(type === 'followers' ? 'following_id' : 'follower_id', userId);

      if (error) throw error;

      if (connections && connections.length > 0) {
        const userIds = connections.map(
          (c: any) => c[type === 'followers' ? 'follower_id' : 'following_id']
        );

        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .in('id', userIds);

        if (profilesError) throw profilesError;
        setUsers(profiles || []);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserPress = (userId: string) => {
    navigation.navigate('Profile', { userId });
  };

  const renderItem = ({ item }: { item: Profile }) => (
    <TouchableOpacity
      style={styles.userItem}
      onPress={() => handleUserPress(item.id)}
    >
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <View style={styles.userInfo}>
        <Text style={styles.username}>@{item.username}</Text>
        {item.full_name && (
          <Text style={styles.fullName}>{item.full_name}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={users}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        refreshing={loading}
        onRefresh={fetchUsers}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {type === 'followers'
              ? 'No followers yet'
              : 'Not following anyone yet'}
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  userItem: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  userInfo: {
    marginLeft: 15,
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  fullName: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  emptyText: {
    textAlign: 'center',
    padding: 20,
    color: '#666',
  },
});