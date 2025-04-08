import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ThemeProvider } from '../../../contexts/ThemeContext';
import { ErrorState } from '../ErrorState';

describe('ErrorState', () => {
  const defaultProps = {
    title: 'Test Error',
    message: 'Test error message',
    icon: 'alert-circle-outline',
    onRetry: jest.fn(),
    retryText: 'Retry',
    fullScreen: false,
  };

  const renderWithTheme = (component: React.ReactElement, isDark = false) => {
    return render(
      <ThemeProvider initialTheme={isDark ? 'dark' : 'light'}>
        {component}
      </ThemeProvider>
    );
  };

  it('renders correctly with default props', () => {
    const { getByText, getByTestId } = renderWithTheme(
      <ErrorState {...defaultProps} />
    );

    expect(getByText('Test Error')).toBeTruthy();
    expect(getByText('Test error message')).toBeTruthy();
    expect(getByText('Retry')).toBeTruthy();
    expect(getByTestId('error-icon')).toBeTruthy();
  });

  it('renders correctly in dark mode', () => {
    const { getByText, getByTestId } = renderWithTheme(
      <ErrorState {...defaultProps} />,
      true
    );

    expect(getByText('Test Error')).toBeTruthy();
    expect(getByText('Test error message')).toBeTruthy();
    expect(getByText('Retry')).toBeTruthy();
    expect(getByTestId('error-icon')).toBeTruthy();
  });

  it('calls onRetry when retry button is pressed', () => {
    const onRetry = jest.fn();
    const { getByText } = renderWithTheme(
      <ErrorState {...defaultProps} onRetry={onRetry} />
    );

    fireEvent.press(getByText('Retry'));
    expect(onRetry).toHaveBeenCalled();
  });

  it('renders with custom icon', () => {
    const { getByTestId } = renderWithTheme(
      <ErrorState {...defaultProps} icon="bug-outline" />
    );

    expect(getByTestId('error-icon')).toBeTruthy();
  });

  it('renders without retry button when onRetry is not provided', () => {
    const { queryByText } = renderWithTheme(
      <ErrorState {...defaultProps} onRetry={undefined} />
    );

    expect(queryByText('Retry')).toBeNull();
  });

  it('applies fullScreen styles when fullScreen is true', () => {
    const { getByTestId } = renderWithTheme(
      <ErrorState {...defaultProps} fullScreen />
    );

    const container = getByTestId('error-container');
    expect(container.props.style).toContainEqual(expect.objectContaining({
      flex: 1,
    }));
  });
}); 