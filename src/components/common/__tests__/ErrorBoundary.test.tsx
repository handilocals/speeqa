import React from 'react';
import { render } from '@testing-library/react-native';
import { ThemeProvider } from '../../../contexts/ThemeContext';
import { ErrorBoundary } from '../ErrorBoundary';

describe('ErrorBoundary', () => {
  const renderWithTheme = (component: React.ReactElement) => {
    return render(
      <ThemeProvider>
        {component}
      </ThemeProvider>
    );
  };

  it('renders children when there is no error', () => {
    const { getByText } = renderWithTheme(
      <ErrorBoundary>
        <Text>Test Content</Text>
      </ErrorBoundary>
    );

    expect(getByText('Test Content')).toBeTruthy();
  });

  it('renders error state when there is an error', () => {
    const ErrorComponent = () => {
      throw new Error('Test error');
    };

    const { getByText } = renderWithTheme(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    );

    expect(getByText('App Error')).toBeTruthy();
    expect(getByText('Test error')).toBeTruthy();
  });

  it('renders default error message when error has no message', () => {
    const ErrorComponent = () => {
      throw new Error();
    };

    const { getByText } = renderWithTheme(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    );

    expect(getByText('An unexpected error occurred')).toBeTruthy();
  });

  it('logs error to console', () => {
    const consoleSpy = jest.spyOn(console, 'error');
    const ErrorComponent = () => {
      throw new Error('Test error');
    };

    renderWithTheme(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    );

    expect(consoleSpy).toHaveBeenCalledWith(
      'App Error:',
      expect.any(Error),
      expect.any(Object)
    );
  });
}); 