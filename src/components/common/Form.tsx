import React from 'react';
import { View, StyleSheet, TextInput, TextInputProps, Text } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { tokens } from '../../theme/tokens';

interface FormFieldProps extends TextInputProps {
  label: string;
  error?: string;
  touched?: boolean;
  required?: boolean;
}

interface FormProps {
  children: React.ReactNode;
  onSubmit?: () => void;
  style?: any;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  touched,
  required,
  style,
  ...props
}) => {
  const { theme } = useTheme();

  return (
    <View style={styles.fieldContainer}>
      <View style={styles.labelContainer}>
        <Text
          style={[
            styles.label,
            { color: theme.colors.neutral[900] }
          ]}
        >
          {label}
        </Text>
        {required && (
          <Text
            style={[
              styles.required,
              { color: theme.colors.error[500] }
            ]}
          >
            *
          </Text>
        )}
      </View>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: theme.colors.neutral[50],
            color: theme.colors.neutral[900],
            borderColor: error && touched
              ? theme.colors.error[500]
              : theme.colors.neutral[200],
          },
          style,
        ]}
        placeholderTextColor={theme.colors.neutral[500]}
        {...props}
      />
      {error && touched && (
        <Text
          style={[
            styles.error,
            { color: theme.colors.error[500] }
          ]}
        >
          {error}
        </Text>
      )}
    </View>
  );
};

export const Form: React.FC<FormProps> = ({ children, onSubmit, style }) => {
  return (
    <View style={[styles.form, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  form: {
    width: '100%',
  },
  fieldContainer: {
    marginBottom: tokens.spacing.md,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: tokens.spacing.sm,
  },
  label: {
    marginRight: tokens.spacing.xs,
  },
  required: {
    marginLeft: tokens.spacing.xs,
  },
  input: {
    width: '100%',
    height: tokens.spacing.xl,
    paddingHorizontal: tokens.spacing.md,
    borderRadius: tokens.borderRadius.md,
    borderWidth: 1,
    fontSize: tokens.typography.fontSize.base,
  },
  error: {
    marginTop: tokens.spacing.xs,
  },
}); 