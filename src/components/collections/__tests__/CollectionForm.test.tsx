import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ThemeProvider } from '../../../contexts/ThemeContext';
import { CollectionForm } from '../CollectionForm';

describe('CollectionForm', () => {
  const renderWithTheme = (component: React.ReactElement, isDark = false) => {
    return render(
      <ThemeProvider initialTheme={isDark ? 'dark' : 'light'}>
        {component}
      </ThemeProvider>
    );
  };

  it('renders correctly with default props', () => {
    const { getByText, getByPlaceholderText } = renderWithTheme(
      <CollectionForm
        onSubmit={() => {}}
        onCancel={() => {}}
      />
    );

    expect(getByText('Collection Name')).toBeTruthy();
    expect(getByText('Description')).toBeTruthy();
    expect(getByPlaceholderText('Enter collection name')).toBeTruthy();
    expect(getByPlaceholderText('Enter collection description (optional)')).toBeTruthy();
  });

  it('renders with initial values', () => {
    const initialValues = {
      name: 'Test Collection',
      description: 'Test Description',
    };

    const { getByDisplayValue } = renderWithTheme(
      <CollectionForm
        initialValues={initialValues}
        onSubmit={() => {}}
        onCancel={() => {}}
      />
    );

    expect(getByDisplayValue('Test Collection')).toBeTruthy();
    expect(getByDisplayValue('Test Description')).toBeTruthy();
  });

  it('validates required fields', () => {
    const { getByText, getByTestId } = renderWithTheme(
      <CollectionForm
        onSubmit={() => {}}
        onCancel={() => {}}
      />
    );

    const nameInput = getByTestId('collection-name-input');
    fireEvent.changeText(nameInput, '');
    fireEvent.press(getByText('Create'));

    expect(getByText('Collection name is required')).toBeTruthy();
  });

  it('calls onSubmit with correct values when form is valid', () => {
    const onSubmit = jest.fn();
    const { getByText, getByTestId } = renderWithTheme(
      <CollectionForm
        onSubmit={onSubmit}
        onCancel={() => {}}
      />
    );

    const nameInput = getByTestId('collection-name-input');
    const descriptionInput = getByTestId('collection-description-input');

    fireEvent.changeText(nameInput, 'Test Collection');
    fireEvent.changeText(descriptionInput, 'Test Description');
    fireEvent.press(getByText('Create'));

    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Test Collection',
      description: 'Test Description',
    });
  });

  it('calls onCancel when cancel button is pressed', () => {
    const onCancel = jest.fn();
    const { getByText } = renderWithTheme(
      <CollectionForm
        onSubmit={() => {}}
        onCancel={onCancel}
      />
    );

    fireEvent.press(getByText('Cancel'));
    expect(onCancel).toHaveBeenCalled();
  });

  it('disables submit button when form is invalid', () => {
    const { getByText, getByTestId } = renderWithTheme(
      <CollectionForm
        onSubmit={() => {}}
        onCancel={() => {}}
      />
    );

    const submitButton = getByText('Create');
    expect(submitButton.props.disabled).toBe(true);

    const nameInput = getByTestId('collection-name-input');
    fireEvent.changeText(nameInput, 'Test Collection');

    expect(submitButton.props.disabled).toBe(false);
  });

  it('renders correctly in dark mode', () => {
    const { getByText } = renderWithTheme(
      <CollectionForm
        onSubmit={() => {}}
        onCancel={() => {}}
      />,
      true
    );

    expect(getByText('Collection Name')).toBeTruthy();
    expect(getByText('Description')).toBeTruthy();
  });
}); 