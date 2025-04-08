import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { LoadingIndicator } from '../components/common/LoadingIndicator';

type AdminPoliticiansScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AdminPoliticians'>;

interface Politician {
  id: string;
  name: string;
  position: string;
  image_url: string;
  average_rating: number;
  total_ratings: number;
}

export function AdminPoliticiansScreen() {
  const [politicians, setPoliticians] = useState<Politician[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [editingPolitician, setEditingPolitician] = useState<Politician | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const themeContext = useTheme();
  const theme = themeContext.theme;
  const { user } = useAuth();
  const navigation = useNavigation<AdminPoliticiansScreenNavigationProp>();

  useEffect(() => {
    checkAdminStatus();
    fetchPoliticians();
  }, []);

  const checkAdminStatus = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('user_id')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setIsAdmin(!!data);
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
  };

  const fetchPoliticians = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('politicians')
        .select('*')
        .order('name');

      if (error) throw error;
      setPoliticians(data || []);
    } catch (error) {
      console.error('Error fetching politicians:', error);
      Alert.alert('Error', 'Failed to fetch politicians');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const addPolitician = async () => {
    if (!name || !position || !imageUri) {
      Alert.alert('Error', 'Please fill in all fields and upload an image');
      return;
    }

    try {
      // Upload image to Supabase storage
      const imageResponse = await fetch(imageUri);
      const imageBlob = await imageResponse.blob();
      const imageName = `${Date.now()}-${name.toLowerCase().replace(/\s+/g, '-')}.jpg`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('politicians')
        .upload(imageName, imageBlob);

      if (uploadError) throw uploadError;

      const imageUrl = supabase.storage.from('politicians').getPublicUrl(imageName).data.publicUrl;

      // Add politician to database
      const { data, error } = await supabase
        .from('politicians')
        .insert([
          {
            name,
            position,
            image_url: imageUrl,
            average_rating: 0,
            total_ratings: 0,
          },
        ])
        .select();

      if (error) throw error;

      setPoliticians([...politicians, data[0]]);
      setName('');
      setPosition('');
      setImageUri(null);
      Alert.alert('Success', 'Politician added successfully');
    } catch (error) {
      console.error('Error adding politician:', error);
      Alert.alert('Error', 'Failed to add politician');
    }
  };

  const handleDeletePolitician = async (politician: Politician) => {
    Alert.alert(
      'Delete Politician',
      'Are you sure you want to delete this politician?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('politicians')
                .delete()
                .eq('id', politician.id);

              if (error) throw error;
              setPoliticians(politicians.filter((p) => p.id !== politician.id));
            } catch (error) {
              console.error('Error deleting politician:', error);
              Alert.alert('Error', 'Failed to delete politician');
            }
          },
        },
      ]
    );
  };

  const handleEditPolitician = (politician: Politician) => {
    setEditingPolitician(politician);
    setName(politician.name);
    setPosition(politician.position);
    setImageUri(politician.image_url);
    setIsEditing(true);
  };

  const handleUpdatePolitician = async () => {
    if (!editingPolitician || !name || !position) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      let imageUrl = editingPolitician.image_url;

      // If a new image was selected, upload it
      if (imageUri && imageUri !== editingPolitician.image_url) {
        const imageResponse = await fetch(imageUri);
        const imageBlob = await imageResponse.blob();
        const imageName = `${Date.now()}-${name.toLowerCase().replace(/\s+/g, '-')}.jpg`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('politicians')
          .upload(imageName, imageBlob);

        if (uploadError) throw uploadError;

        imageUrl = supabase.storage.from('politicians').getPublicUrl(imageName).data.publicUrl;
      }

      // Update politician in database
      const { data, error } = await supabase
        .from('politicians')
        .update({
          name,
          position,
          image_url: imageUrl,
        })
        .eq('id', editingPolitician.id)
        .select();

      if (error) throw error;

      // Update local state
      setPoliticians(politicians.map(p => 
        p.id === editingPolitician.id ? data[0] : p
      ));

      // Reset form
      setEditingPolitician(null);
      setName('');
      setPosition('');
      setImageUri(null);
      setIsEditing(false);

      Alert.alert('Success', 'Politician updated successfully');
    } catch (error) {
      console.error('Error updating politician:', error);
      Alert.alert('Error', 'Failed to update politician');
    }
  };

  const cancelEdit = () => {
    setEditingPolitician(null);
    setName('');
    setPosition('');
    setImageUri(null);
    setIsEditing(false);
  };

  if (!isAdmin) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.neutral[50] }]}>
        <Text style={[styles.errorText, { color: theme.colors.neutral[900] }]}>
          You don't have permission to access this screen.
        </Text>
      </View>
    );
  }

  if (loading) {
    return <LoadingIndicator fullScreen />;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.neutral[50] }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.neutral[900]} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.neutral[900] }]}>
          {isEditing ? 'Edit Politician' : 'Manage Politicians'}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.formContainer}>
          <Text style={[styles.sectionTitle, { color: theme.colors.neutral[900] }]}>
            {isEditing ? 'Edit Politician' : 'Add New Politician'}
          </Text>
          <TextInput
            style={[styles.input, { color: theme.colors.neutral[900], borderColor: theme.colors.neutral[200] }]}
            placeholder="Name"
            placeholderTextColor={theme.colors.neutral[500]}
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={[styles.input, { color: theme.colors.neutral[900], borderColor: theme.colors.neutral[200] }]}
            placeholder="Position"
            placeholderTextColor={theme.colors.neutral[500]}
            value={position}
            onChangeText={setPosition}
          />
          <TouchableOpacity
            style={[styles.uploadButton, { backgroundColor: theme.colors.primary[500] }]}
            onPress={handleImageUpload}
          >
            <Text style={[styles.uploadButtonText, { color: theme.colors.neutral[50] }]}>
              {isEditing ? 'Change Image' : 'Upload Image'}
            </Text>
          </TouchableOpacity>
          {imageUri && (
            <Image
              source={{ uri: imageUri }}
              style={styles.previewImage}
            />
          )}
          <View style={styles.buttonContainer}>
            {isEditing ? (
              <>
                <TouchableOpacity
                  style={[styles.cancelButton, { backgroundColor: theme.colors.error[500] }]}
                  onPress={cancelEdit}
                >
                  <Text style={[styles.buttonText, { color: theme.colors.neutral[50] }]}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.updateButton, { backgroundColor: theme.colors.primary[500] }]}
                  onPress={handleUpdatePolitician}
                >
                  <Text style={[styles.buttonText, { color: theme.colors.neutral[50] }]}>
                    Update
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={[styles.addButton, { backgroundColor: theme.colors.primary[500] }]}
                onPress={addPolitician}
              >
                <Text style={[styles.addButtonText, { color: theme.colors.neutral[50] }]}>
                  Add Politician
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {!isEditing && (
          <View style={styles.listContainer}>
            <Text style={[styles.sectionTitle, { color: theme.colors.neutral[900] }]}>
              Existing Politicians
            </Text>
            {politicians.map((politician) => (
              <View
                key={politician.id}
                style={[styles.politicianItem, { borderColor: theme.colors.neutral[200] }]}
              >
                <Image
                  source={{ uri: politician.image_url }}
                  style={styles.politicianImage}
                />
                <View style={styles.politicianInfo}>
                  <Text style={[styles.politicianName, { color: theme.colors.neutral[900] }]}>
                    {politician.name}
                  </Text>
                  <Text style={[styles.politicianPosition, { color: theme.colors.neutral[500] }]}>
                    {politician.position}
                  </Text>
                  <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={16} color="#FFD700" />
                    <Text style={[styles.rating, { color: theme.colors.neutral[900] }]}>
                      {politician.average_rating.toFixed(1)}
                    </Text>
                    <Text style={[styles.totalRatings, { color: theme.colors.neutral[500] }]}>
                      ({politician.total_ratings} ratings)
                    </Text>
                  </View>
                </View>
                <View style={styles.actionsContainer}>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: theme.colors.primary[500] }]}
                    onPress={() => handleEditPolitician(politician)}
                  >
                    <Ionicons name="create-outline" size={20} color={theme.colors.neutral[50]} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: theme.colors.error[500] }]}
                    onPress={() => handleDeletePolitician(politician)}
                  >
                    <Ionicons name="trash-outline" size={20} color={theme.colors.neutral[50]} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  formContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  uploadButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginBottom: 16,
  },
  addButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  listContainer: {
    marginTop: 24,
  },
  politicianItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
  },
  politicianImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  politicianInfo: {
    flex: 1,
  },
  politicianName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  politicianPosition: {
    fontSize: 14,
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    marginLeft: 4,
    marginRight: 4,
  },
  totalRatings: {
    fontSize: 12,
  },
  actionsContainer: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    margin: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  updateButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 