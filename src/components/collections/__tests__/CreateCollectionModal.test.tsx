import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ThemeProvider } from '../../../contexts/ThemeContext';
import { CreateCollectionModal } from '../CreateCollectionModal';

describe('CreateCollectionModal', () => {
  const renderWithTheme = (component: React.ReactElement, isDark = false) => {
    return render(
      <ThemeProvider initialTheme={isDark ? 'dark' : 'light'}>
        {component}
      </ThemeProvider>
    );
  };

  it('renders correctly with default props', () => {
    const { getByText } = renderWithTheme(
      <CreateCollectionModal
        visible={true}
        onClose={() => {}}
        onSubmit={() => {}}
      />
    );

    expect(getByText('Create New Collection')).toBeTruthy();
  });

  it('calls onSubmit with correct data when form is submitted', () => {
    const onSubmit = jest.fn();
    const { getByTestId, getByText } = renderWithTheme(
      <CreateCollectionModal
        visible={true}
        onClose={() => {}}
        onSubmit={onSubmit}
      />
    );

    // Enter collection name
    const nameInput = getByTestId('collection-name-input');
    fireEvent.changeText(nameInput, 'Test Collection');

    // Enter description
    const descriptionInput = getByTestId('collection-description-input');
    fireEvent.changeText(descriptionInput, 'Test Description');

    // Submit the form
    fireEvent.press(getByText('Create'));

    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Test Collection',
      description: 'Test Description',
    });
  });

  it('disables create button when name is empty', () => {
    const { getByText, getByTestId } = renderWithTheme(
      <CreateCollectionModal
        visible={true}
        onClose={() => {}}
        onSubmit={() => {}}
      />
    );

    const createButton = getByText('Create');
    expect(createButton.props.disabled).toBe(true);

    // Enter a name
    const nameInput = getByTestId('collection-name-input');
    fireEvent.changeText(nameInput, 'Test Collection');

    expect(createButton.props.disabled).toBe(false);
  });

  it('calls onClose when cancel button is pressed', () => {
    const onClose = jest.fn();
    const { getByText } = renderWithTheme(
      <CreateCollectionModal
        visible={true}
        onClose={onClose}
        onSubmit={() => {}}
      />
    );

    fireEvent.press(getByText('Cancel'));
    expect(onClose).toHaveBeenCalled();
  });

  it('renders correctly in dark mode', () => {
    const { getByText } = renderWithTheme(
      <CreateCollectionModal
        visible={true}
        onClose={() => {}}
        onSubmit={() => {}}
      />,
      true
    );

    expect(getByText('Create New Collection')).toBeTruthy();
  });

  it('clears form when modal is closed and reopened', () => {
    const { getByTestId, getByText, rerender } = renderWithTheme(
      <CreateCollectionModal
        visible={true}
        onClose={() => {}}
        onSubmit={() => {}}
      />
    );

    // Enter some data
    const nameInput = getByTestId('collection-name-input');
    const descriptionInput = getByTestId('collection-description-input');
    
    fireEvent.changeText(nameInput, 'Test Collection');
    fireEvent.changeText(descriptionInput, 'Test Description');

    // Close modal
    fireEvent.press(getByText('Cancel'));

    // Reopen modal
    rerender(
      <ThemeProvider initialTheme="light">
        <CreateCollectionModal
          visible={true}
          onClose={() => {}}
          onSubmit={() => {}}
        />
      </ThemeProvider>
    );

    // Check if inputs are cleared
    expect(getByTestId('collection-name-input').props.value).toBe('');
    expect(getByTestId('collection-description-input').props.value).toBe('');
  });
}); 