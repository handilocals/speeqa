import React from 'react';
import { render } from '@testing-library/react-native';
import { ThemeProvider } from '../../../contexts/ThemeContext';
import { EmptyState } from '../EmptyState';

describe('EmptyState', () => {
  const renderWithTheme = (component: React.ReactElement) => {
    return render(
      <ThemeProvider>
        {component}
      </ThemeProvider>
    );
  };

  it('renders loading state correctly', () => {
    const { getByTestId } = renderWithTheme(
      <EmptyState loading={true} hasSearchQuery={false} />
    );

    expect(getByTestId('loading-indicator')).toBeTruthy();
  });

  it('renders empty search state correctly', () => {
    const { getByText } = renderWithTheme(
      <EmptyState loading={false} hasSearchQuery={false} />
    );

    expect(getByText('Search for listings...')).toBeTruthy();
  });

  it('renders no results state correctly', () => {
    const { getByText } = renderWithTheme(
      <EmptyState loading={false} hasSearchQuery={true} />
    );

    expect(getByText('No results found')).toBeTruthy();
  });

  it('renders error state correctly', () => {
    const error = new Error('Search failed');
    const { getByText } = renderWithTheme(
      <EmptyState
        loading={false}
        hasSearchQuery={true}
        error={error}
        onRetry={() => {}}
      />
    );

    expect(getByText('Search Error')).toBeTruthy();
    expect(getByText('Search failed')).toBeTruthy();
  });

  it('renders default error message when error has no message', () => {
    const { getByText } = renderWithTheme(
      <EmptyState
        loading={false}
        hasSearchQuery={true}
        error={new Error()}
        onRetry={() => {}}
      />
    );

    expect(getByText('Failed to load search results')).toBeTruthy();
  });
}); 