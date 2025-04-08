import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import * as ImagePicker from 'expo-image-picker';
import { ImageUploader } from '../components/common/ImageUploader';

const defaultTheme = {
  background: '#FFFFFF',
  surface: '#F8F8F8',
  text: '#000000',
  textSecondary: '#666666',
  primary: '#000000',
  border: '#EEEEEE',
  error: '#FF3B30',
};

interface PollOption {
  text: string;
  image?: string;
  votes: number;
}

export function CreatePollScreen({ navigation }: { navigation: any }) {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState<PollOption[]>([
    { text: '', votes: 0 },
    { text: '', votes: 0 },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMultipleChoice, setIsMultipleChoice] = useState(false);
  const [maxSelections, setMaxSelections] = useState(1);
  const themeContext = useTheme();
  const theme = themeContext?.theme || defaultTheme;
  const { user } = useAuth();

  const addOption = () => {
    if (options.length < 6) {
      setOptions([...options, { text: '', votes: 0 }]);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = [...options];
      newOptions.splice(index, 1);
      setOptions(newOptions);
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], text: value };
    setOptions(newOptions);
  };

  const handleImageUpload = async (index: number) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const newOptions = [...options];
        newOptions[index] = { ...newOptions[index], image: result.assets[0].uri };
        setOptions(newOptions);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const handleSubmit = async () => {
    if (!question.trim()) {
      Alert.alert('Error', 'Please enter a question');
      return;
    }

    const validOptions = options.filter(option => option.text.trim());
    if (validOptions.length < 2) {
      Alert.alert('Error', 'Please enter at least two options');
      return;
    }

    setIsSubmitting(true);
    try {
      // Upload images first
      const optionsWithImages = await Promise.all(
        validOptions.map(async (option) => {
          if (option.image) {
            const formData = new FormData();
            formData.append('file', {
              uri: option.image,
              type: 'image/jpeg',
              name: `${user?.id}/${Date.now()}.jpg`,
            } as any);

            const { data: imageData, error: uploadError } = await supabase.storage
              .from('poll-images')
              .upload(`${user?.id}/${Date.now()}.jpg`, formData);

            if (uploadError) throw uploadError;

            return {
              ...option,
              image: imageData.path,
            };
          }
          return option;
        })
      );

      const { data: poll, error: pollError } = await supabase
        .from('polls')
        .insert([
          {
            question: question.trim(),
            user_id: user?.id,
            options: optionsWithImages,
            is_multiple_choice: isMultipleChoice,
            max_selections: maxSelections,
          },
        ])
        .select()
        .single();

      if (pollError) throw pollError;

      navigation.goBack();
    } catch (error) {
      console.error('Error creating poll:', error);
      Alert.alert('Error', 'Failed to create poll. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.neutral[50] }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="close" size={24} color={theme.colors.neutral[900]} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.neutral[900] }]}>
          Create Poll
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.questionContainer}>
          <Text style={[styles.label, { color: theme.colors.neutral[900] }]}>Question</Text>
          <TextInput
            style={[
              styles.questionInput,
              { color: theme.colors.neutral[900], borderColor: theme.colors.neutral[200] },
            ]}
            placeholder="Ask a question..."
            placeholderTextColor={theme.colors.neutral[500]}
            value={question}
            onChangeText={setQuestion}
            multiline
          />
        </View>

        <View style={styles.settingsContainer}>
          <TouchableOpacity
            style={[
              styles.settingButton,
              { borderColor: theme.colors.neutral[200] },
              isMultipleChoice && { borderColor: theme.colors.primary[500] },
            ]}
            onPress={() => setIsMultipleChoice(!isMultipleChoice)}
          >
            <Ionicons
              name={isMultipleChoice ? 'checkbox' : 'square-outline'}
              size={24}
              color={isMultipleChoice ? theme.colors.primary[500] : theme.colors.neutral[900]}
            />
            <Text style={[styles.settingText, { color: theme.colors.neutral[900] }]}>
              Allow multiple selections
            </Text>
          </TouchableOpacity>

          {isMultipleChoice && (
            <View style={styles.maxSelectionsContainer}>
              <Text style={[styles.label, { color: theme.colors.neutral[900] }]}>
                Maximum selections
              </Text>
              <View style={styles.maxSelectionsButtons}>
                {[2, 3, 4, 5].map((num) => (
                  <TouchableOpacity
                    key={num}
                    style={[
                      styles.maxSelectionButton,
                      { borderColor: theme.colors.neutral[200] },
                      maxSelections === num && {
                        backgroundColor: theme.colors.primary[500],
                        borderColor: theme.colors.primary[500],
                      },
                    ]}
                    onPress={() => setMaxSelections(num)}
                  >
                    <Text
                      style={[
                        styles.maxSelectionText,
                        {
                          color:
                            maxSelections === num
                              ? theme.colors.neutral[50]
                              : theme.colors.neutral[900],
                        },
                      ]}
                    >
                      {num}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>

        <View style={styles.optionsContainer}>
          <Text style={[styles.label, { color: theme.colors.neutral[900] }]}>Options</Text>
          {options.map((option, index) => (
            <View key={index} style={styles.optionRow}>
              <View style={styles.optionContent}>
                <ImageUploader
                  imageUri={option.image}
                  onImageSelected={(uri) => {
                    const newOptions = [...options];
                    newOptions[index] = { ...newOptions[index], image: uri };
                    setOptions(newOptions);
                  }}
                  size={60}
                  borderRadius={8}
                />
                <TextInput
                  style={[
                    styles.optionInput,
                    { color: theme.colors.neutral[900], borderColor: theme.colors.neutral[200] },
                  ]}
                  placeholder={`Option ${index + 1}`}
                  placeholderTextColor={theme.colors.neutral[500]}
                  value={option.text}
                  onChangeText={(value) => updateOption(index, value)}
                />
              </View>
              {index > 1 && (
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeOption(index)}
                >
                  <Ionicons
                    name="close-circle"
                    size={24}
                    color={theme.colors.error[500]}
                  />
                </TouchableOpacity>
              )}
            </View>
          ))}

          {options.length < 6 && (
            <TouchableOpacity
              style={[styles.addButton, { borderColor: theme.colors.primary[500] }]}
              onPress={addOption}
            >
              <Ionicons
                name="add-circle-outline"
                size={24}
                color={theme.colors.primary[500]}
              />
              <Text style={[styles.addButtonText, { color: theme.colors.primary[500] }]}>
                Add Option
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.submitButton,
            { backgroundColor: theme.colors.primary[500] },
            isSubmitting && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={[styles.submitButtonText, { color: theme.colors.neutral[50] }]}>
            {isSubmitting ? 'Creating...' : 'Create Poll'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
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
    borderBottomColor: '#EEEEEE',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  submitButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 32,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  questionContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  questionInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  settingsContainer: {
    marginBottom: 24,
  },
  settingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
  },
  settingText: {
    marginLeft: 12,
    fontSize: 16,
  },
  maxSelectionsContainer: {
    marginTop: 12,
  },
  maxSelectionsButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  maxSelectionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  maxSelectionText: {
    fontSize: 16,
    fontWeight: '600',
  },
  optionsContainer: {
    marginBottom: 24,
  },
  optionRow: {
    marginBottom: 12,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  imagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  removeButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    padding: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  addButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
  },
}); 