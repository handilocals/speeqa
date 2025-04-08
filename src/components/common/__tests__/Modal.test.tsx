import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ThemeProvider } from '../../../contexts/ThemeContext';
import { ModalComponent } from '../Modal';

describe('Modal', () => {
  const renderWithTheme = (component: React.ReactElement, isDark = false) => {
    return render(
      <ThemeProvider initialTheme={isDark ? 'dark' : 'light'}>
        {component}
      </ThemeProvider>
    );
  };

  it('renders correctly with default props', () => {
    const { getByText } = renderWithTheme(
      <ModalComponent visible={true} onClose={() => {}}>
        <Text>Modal Content</Text>
      </ModalComponent>
    );

    expect(getByText('Modal Content')).toBeTruthy();
  });

  it('renders with title when provided', () => {
    const { getByText } = renderWithTheme(
      <ModalComponent visible={true} onClose={() => {}} title="Test Modal">
        <Text>Modal Content</Text>
      </ModalComponent>
    );

    expect(getByText('Test Modal')).toBeTruthy();
  });

  it('calls onClose when close button is pressed', () => {
    const onClose = jest.fn();
    const { getByTestId } = renderWithTheme(
      <ModalComponent visible={true} onClose={onClose}>
        <Text>Modal Content</Text>
      </ModalComponent>
    );

    fireEvent.press(getByTestId('modal-close-button'));
    expect(onClose).toHaveBeenCalled();
  });

  it('does not show close button when showCloseButton is false', () => {
    const { queryByTestId } = renderWithTheme(
      <ModalComponent
        visible={true}
        onClose={() => {}}
        showCloseButton={false}
      >
        <Text>Modal Content</Text>
      </ModalComponent>
    );

    expect(queryByTestId('modal-close-button')).toBeNull();
  });

  it('renders correctly in dark mode', () => {
    const { getByText } = renderWithTheme(
      <ModalComponent visible={true} onClose={() => {}}>
        <Text>Modal Content</Text>
      </ModalComponent>,
      true
    );

    expect(getByText('Modal Content')).toBeTruthy();
  });

  it('applies fullScreen styles when fullScreen is true', () => {
    const { getByTestId } = renderWithTheme(
      <ModalComponent visible={true} onClose={() => {}} fullScreen>
        <Text>Modal Content</Text>
      </ModalComponent>
    );

    const container = getByTestId('modal-content');
    expect(container.props.style).toContainEqual(expect.objectContaining({
      width: '100%',
      maxWidth: '100%',
      height: '100%',
    }));
  });

  it('renders without blur when transparent is false', () => {
    const { queryByTestId } = renderWithTheme(
      <ModalComponent visible={true} onClose={() => {}} transparent={false}>
        <Text>Modal Content</Text>
      </ModalComponent>
    );

    expect(queryByTestId('modal-blur')).toBeNull();
  });
}); 