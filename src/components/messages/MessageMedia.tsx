import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { Video } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

interface MessageMediaProps {
  mediaUrl: string;
  mediaType: string;
  mediaThumbnail?: string;
  onPress?: () => void;
}

export function MessageMedia({ mediaUrl, mediaType, mediaThumbnail, onPress }: MessageMediaProps) {
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const handleDownload = async () => {
    try {
      setIsLoading(true);
      const filename = mediaUrl.split('/').pop() || 'media';
      const fileUri = `${FileSystem.cacheDirectory}${filename}`;
      
      await FileSystem.downloadAsync(mediaUrl, fileUri);
      await Sharing.shareAsync(fileUri);
    } catch (err) {
      console.error('Error downloading media:', err);
      setError('Failed to download media');
    } finally {
      setIsLoading(false);
    }
  };

  const renderMedia = () => {
    if (error) {
      return (
        <View style={[styles.errorContainer, { backgroundColor: theme.colors.error[100] }]}>
          <Ionicons name="alert-circle" size={24} color={theme.colors.error[500]} />
          <Text style={[styles.errorText, { color: theme.colors.error[500] }]}>
            {error}
          </Text>
        </View>
      );
    }

    if (mediaType.startsWith('image/')) {
      return (
        <Image
          source={{ uri: mediaUrl }}
          style={styles.media}
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => setIsLoading(false)}
          onError={() => setError('Failed to load image')}
        />
      );
    }

    if (mediaType.startsWith('video/')) {
      return (
        <Video
          source={{ uri: mediaUrl }}
          style={styles.media}
          useNativeControls
          resizeMode="contain"
          onLoadStart={() => setIsLoading(true)}
          onLoad={() => setIsLoading(false)}
          onError={() => setError('Failed to load video')}
        />
      );
    }

    return (
      <View style={[styles.fileContainer, { backgroundColor: theme.colors.neutral[100] }]}>
        <Ionicons name="document" size={32} color={theme.colors.neutral[500]} />
        <Text style={[styles.fileText, { color: theme.colors.neutral[900] }]}>
          {mediaUrl.split('/').pop()}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary[500]} />
        </View>
      )}
      
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {renderMedia()}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.downloadButton, { backgroundColor: theme.colors.primary[500] }]}
        onPress={handleDownload}
        disabled={isLoading}
      >
        <Ionicons name="download" size={20} color={theme.colors.neutral[50]} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  media: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  errorContainer: {
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorText: {
    marginLeft: 8,
    fontSize: 14,
  },
  fileContainer: {
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileText: {
    marginLeft: 8,
    fontSize: 14,
    flex: 1,
  },
  downloadButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 