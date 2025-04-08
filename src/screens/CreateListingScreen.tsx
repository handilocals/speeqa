import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import * as ImagePicker from 'expo-image-picker';

interface ImageData {
  uri: string;
  type: string;
  name: string;
}

export function CreateListingScreen({ navigation }: { navigation: any }) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [isBargainable, setIsBargainable] = useState(false);
  const [location, setLocation] = useState({
    state: '',
    city: '',
    locality: '',
    zipcode: '',
  });
  const [images, setImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera roll permissions to upload images');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      const newImage = {
        uri: result.assets[0].uri,
        type: 'image/jpeg',
        name: `image-${Date.now()}.jpg`,
      };
      setImages([...images, newImage]);
    }
  };

  const uploadImage = async (image: ImageData) => {
    const formData = new FormData();
    formData.append('file', image as any);

    const { data, error } = await supabase.storage
      .from('marketplace-images')
      .upload(`${user?.id}/${image.name}`, formData);

    if (error) throw error;
    return data.path;
  };

  const createListing = async () => {
    if (!title || !description || !price || !location.state || !location.city) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (images.length === 0) {
      Alert.alert('Error', 'Please add at least one image');
      return;
    }

    try {
      setLoading(true);

      // Upload images
      const imagePaths = await Promise.all(images.map(uploadImage));

      // Create listing
      const { data: listing, error: listingError } = await supabase
        .from('marketplace_listings')
        .insert({
          title,
          description,
          price: parseFloat(price),
          is_bargainable: isBargainable,
          location,
          user_id: user?.id,
        })
        .select()
        .single();

      if (listingError) throw listingError;

      // Create image records
      const { error: imagesError } = await supabase
        .from('marketplace_listing_images')
        .insert(
          imagePaths.map((path, index) => ({
            listing_id: listing.id,
            url: path,
            display_order: index,
          }))
        );

      if (imagesError) throw imagesError;

      Alert.alert('Success', 'Listing created successfully');
      navigation.goBack();
    } catch (error) {
      console.error('Error creating listing:', error);
      Alert.alert('Error', 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.neutral[50] }]}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.form}>
          <TextInput
            style={[styles.input, { 
              backgroundColor: theme.colors.neutral[100],
              color: theme.colors.neutral[900],
              borderColor: theme.colors.neutral[200]
            }]}
            placeholder="Title"
            placeholderTextColor={theme.colors.neutral[500]}
            value={title}
            onChangeText={setTitle}
          />

          <TextInput
            style={[styles.input, styles.textArea, { 
              backgroundColor: theme.colors.neutral[100],
              color: theme.colors.neutral[900],
              borderColor: theme.colors.neutral[200]
            }]}
            placeholder="Description"
            placeholderTextColor={theme.colors.neutral[500]}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />

          <TextInput
            style={[styles.input, { 
              backgroundColor: theme.colors.neutral[100],
              color: theme.colors.neutral[900],
              borderColor: theme.colors.neutral[200]
            }]}
            placeholder="Price"
            placeholderTextColor={theme.colors.neutral[500]}
            value={price}
            onChangeText={setPrice}
            keyboardType="decimal-pad"
          />

          <View style={styles.locationInputs}>
            <TextInput
              style={[styles.input, styles.locationInput, { 
                backgroundColor: theme.colors.neutral[100],
                color: theme.colors.neutral[900],
                borderColor: theme.colors.neutral[200]
              }]}
              placeholder="State"
              placeholderTextColor={theme.colors.neutral[500]}
              value={location.state}
              onChangeText={(text) => setLocation({ ...location, state: text })}
            />
            <TextInput
              style={[styles.input, styles.locationInput, { 
                backgroundColor: theme.colors.neutral[100],
                color: theme.colors.neutral[900],
                borderColor: theme.colors.neutral[200]
              }]}
              placeholder="City"
              placeholderTextColor={theme.colors.neutral[500]}
              value={location.city}
              onChangeText={(text) => setLocation({ ...location, city: text })}
            />
          </View>

          <TouchableOpacity
            style={[styles.checkboxContainer, { borderColor: theme.colors.neutral[200] }]}
            onPress={() => setIsBargainable(!isBargainable)}
          >
            <View style={[styles.checkbox, { 
              backgroundColor: isBargainable ? theme.colors.primary[500] : 'transparent',
              borderColor: theme.colors.neutral[200]
            }]}>
              {isBargainable && (
                <Ionicons name="checkmark" size={16} color={theme.colors.neutral[50]} />
              )}
            </View>
            <Text style={[styles.checkboxLabel, { color: theme.colors.neutral[900] }]}>
              Allow bargaining
            </Text>
          </TouchableOpacity>

          <View style={styles.imageContainer}>
            {images.map((image, index) => (
              <View key={index} style={styles.imageWrapper}>
                <Image source={{ uri: image.uri }} style={styles.image} />
                <TouchableOpacity
                  style={styles.removeImage}
                  onPress={() => setImages(images.filter((_, i) => i !== index))}
                >
                  <Ionicons name="close-circle" size={24} color={theme.colors.error[500]} />
                </TouchableOpacity>
              </View>
            ))}
            {images.length < 5 && (
              <TouchableOpacity
                style={[styles.addImageButton, { borderColor: theme.colors.neutral[200] }]}
                onPress={pickImage}
              >
                <Ionicons name="add" size={24} color={theme.colors.neutral[900]} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: theme.colors.neutral[200] }]}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.colors.primary[500] }]}
          onPress={createListing}
          disabled={loading}
        >
          <Text style={[styles.buttonText, { color: theme.colors.neutral[50] }]}>
            {loading ? 'Creating...' : 'Create Listing'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  form: {
    padding: 16,
  },
  input: {
    height: 48,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
    paddingTop: 16,
  },
  locationInputs: {
    flexDirection: 'row',
    gap: 8,
  },
  locationInput: {
    flex: 1,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 1,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxLabel: {
    fontSize: 16,
  },
  imageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  imageWrapper: {
    position: 'relative',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeImage: {
    position: 'absolute',
    top: -8,
    right: -8,
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 