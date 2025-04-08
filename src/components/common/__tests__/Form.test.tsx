import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ThemeProvider } from '../../../contexts/ThemeContext';
import { Form, FormField } from '../Form';

describe('Form Components', () => {
  const renderWithTheme = (component: React.ReactElement, isDark = false) => {
    return render(
      <ThemeProvider initialTheme={isDark ? 'dark' : 'light'}>
        {component}
      </ThemeProvider>
    );
  };

  describe('FormField', () => {
    it('renders correctly with default props', () => {
      const { getByText, getByPlaceholderText } = renderWithTheme(
        <FormField
          label="Test Field"
          placeholder="Enter text"
        />
      );

      expect(getByText('Test Field')).toBeTruthy();
      expect(getByPlaceholderText('Enter text')).toBeTruthy();
    });

    it('shows required indicator when required is true', () => {
      const { getByText } = renderWithTheme(
        <FormField
          label="Test Field"
          required
        />
      );

      expect(getByText('*')).toBeTruthy();
    });

    it('shows error message when error and touched are true', () => {
      const { getByText } = renderWithTheme(
        <FormField
          label="Test Field"
          error="This field is required"
          touched
        />
      );

      expect(getByText('This field is required')).toBeTruthy();
    });

    it('applies error styling when error and touched are true', () => {
      const { getByPlaceholderText } = renderWithTheme(
        <FormField
          label="Test Field"
          placeholder="Enter text"
          error="Error"
          touched
        />
      );

      const input = getByPlaceholderText('Enter text');
      expect(input.props.style).toContainEqual(expect.objectContaining({
        borderColor: expect.any(String),
      }));
    });

    it('handles text input correctly', () => {
      const { getByPlaceholderText } = renderWithTheme(
        <FormField
          label="Test Field"
          placeholder="Enter text"
        />
      );

      const input = getByPlaceholderText('Enter text');
      fireEvent.changeText(input, 'Test input');
      expect(input.props.value).toBe('Test input');
    });

    it('renders correctly in dark mode', () => {
      const { getByText } = renderWithTheme(
        <FormField
          label="Test Field"
        />,
        true
      );

      expect(getByText('Test Field')).toBeTruthy();
    });
  });

  describe('Form', () => {
    it('renders children correctly', () => {
      const { getByText } = renderWithTheme(
        <Form>
          <FormField label="Field 1" />
          <FormField label="Field 2" />
        </Form>
      );

      expect(getByText('Field 1')).toBeTruthy();
      expect(getByText('Field 2')).toBeTruthy();
    });

    it('applies custom styles correctly', () => {
      const customStyle = { padding: 20 };
      const { getByTestId } = renderWithTheme(
        <Form style={customStyle}>
          <FormField label="Test Field" />
        </Form>
      );

      const form = getByTestId('form');
      expect(form.props.style).toContainEqual(customStyle);
    });
  });
}); 