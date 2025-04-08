import React from 'react';
import { View, Image, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../contexts/ThemeContext';
import { Button } from './Button';
import { tokens } from '../../theme/tokens';

interface ImageUploaderProps {
  imageUri?: string;
  onImageSelected: (uri: string) => void;
  size?: number;
  borderRadius?: number;
}

export function ImageUploader({
  imageUri,
  onImageSelected,
  size = 100,
  borderRadius = tokens.borderRadius.md,
}: ImageUploaderProps) {
  const { theme } = useTheme();

  const handleImagePick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        onImageSelected(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };

  const buttonStyle: ViewStyle = {
    width: size,
    height: size,
    borderRadius,
    borderColor: theme.colors.neutral[200],
  };

  return (
    <Button
      variant="outline"
      onPress={handleImagePick}
      style={{ ...styles.container, ...buttonStyle }}
    >
      {imageUri ? (
        <Image
          source={{ uri: imageUri }}
          style={[
            styles.image,
            {
              width: size,
              height: size,
              borderRadius,
            },
          ]}
        />
      ) : (
        <View
          style={[
            styles.placeholder,
            {
              width: size,
              height: size,
              borderRadius,
              borderColor: theme.colors.neutral[200],
            },
          ]}
        >
          <Ionicons
            name="image-outline"
            size={size * 0.4}
            color={theme.colors.neutral[500]}
          />
        </View>
      )}
    </Button>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    overflow: 'hidden',
    padding: 0,
  },
  image: {
    resizeMode: 'cover',
  },
  placeholder: {
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 