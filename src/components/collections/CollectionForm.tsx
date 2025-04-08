import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { tokens } from '../../theme/tokens';
import { Form, FormField } from '../common/Form';
import { Button } from '../common/Button';

interface CollectionFormProps {
  initialValues?: {
    name: string;
    description: string;
  };
  onSubmit: (values: { name: string; description: string }) => void;
  onCancel: () => void;
}

export const CollectionForm: React.FC<CollectionFormProps> = ({
  initialValues = { name: '', description: '' },
  onSubmit,
  onCancel,
}) => {
  const { theme } = useTheme();
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  const validateField = (name: string, value: string) => {
    if (name === 'name' && !value.trim()) {
      return 'Collection name is required';
    }
    return '';
  };

  const handleChange = (name: string, value: string) => {
    setValues(prev => ({ ...prev, [name]: value }));
    setTouched(prev => ({ ...prev, [name]: true }));
    setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleSubmit = () => {
    const newErrors: { [key: string]: string } = {};
    Object.keys(values).forEach(key => {
      newErrors[key] = validateField(key, values[key as keyof typeof values]);
    });
    setErrors(newErrors);

    if (Object.values(newErrors).every(error => !error)) {
      onSubmit(values);
    }
  };

  return (
    <View style={styles.container}>
      <Form>
        <FormField
          label="Collection Name"
          value={values.name}
          onChangeText={(text) => handleChange('name', text)}
          error={errors.name}
          touched={touched.name}
          required
          placeholder="Enter collection name"
          testID="collection-name-input"
        />

        <FormField
          label="Description"
          value={values.description}
          onChangeText={(text) => handleChange('description', text)}
          error={errors.description}
          touched={touched.description}
          placeholder="Enter collection description (optional)"
          multiline
          numberOfLines={4}
          testID="collection-description-input"
        />

        <View style={styles.buttonContainer}>
          <Button
            variant="outline"
            onPress={onCancel}
            style={styles.button}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onPress={handleSubmit}
            style={styles.button}
            disabled={!!errors.name}
          >
            Create
          </Button>
        </View>
      </Form>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: tokens.spacing.md,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: tokens.spacing.md,
    gap: tokens.spacing.xs,
  },
  button: {
    minWidth: 100,
  },
}); 