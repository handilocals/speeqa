import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { tokens } from '../../theme/tokens';
import { ModalComponent } from '../common/Modal';
import { Button } from '../common/Button';

interface CreateCollectionModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (name: string, description: string) => void;
}

export default function CreateCollectionModal({
  visible,
  onClose,
  onSubmit,
}: CreateCollectionModalProps) {
  const { theme } = useTheme();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    if (!name.trim()) {
      return;
    }
    onSubmit(name.trim(), description.trim());
    setName('');
    setDescription('');
  };

  return (
    <ModalComponent
      visible={visible}
      onClose={onClose}
      title="Create New Collection"
    >
      <TextInput
        style={[
          styles.input,
          {
            color: theme.colors.neutral[900],
            backgroundColor: theme.colors.neutral[50],
            borderColor: theme.colors.neutral[200],
          },
        ]}
        placeholder="Collection Name"
        placeholderTextColor={theme.colors.neutral[500]}
        value={name}
        onChangeText={setName}
        maxLength={50}
      />
      <TextInput
        style={[
          styles.input,
          styles.descriptionInput,
          {
            color: theme.colors.neutral[900],
            backgroundColor: theme.colors.neutral[50],
            borderColor: theme.colors.neutral[200],
          },
        ]}
        placeholder="Description (optional)"
        placeholderTextColor={theme.colors.neutral[500]}
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
        maxLength={200}
      />
      <View style={styles.buttonContainer}>
        <Button
          variant="secondary"
          onPress={onClose}
          style={styles.button}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          onPress={handleSubmit}
          style={styles.button}
          disabled={!name.trim()}
        >
          Create
        </Button>
      </View>
    </ModalComponent>
  );
}

const styles = StyleSheet.create({
  input: {
    width: '100%',
    height: 48,
    borderWidth: 1,
    borderRadius: tokens.borderRadius.md,
    paddingHorizontal: tokens.spacing.md,
    marginBottom: tokens.spacing.md,
  },
  descriptionInput: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: tokens.spacing.md,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: tokens.spacing.md,
  },
  button: {
    flex: 1,
  },
}); 