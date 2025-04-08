import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ThemeProvider } from '../../../contexts/ThemeContext';
import { RatingModal } from '../RatingModal';

describe('RatingModal', () => {
  const renderWithTheme = (component: React.ReactElement, isDark = false) => {
    return render(
      <ThemeProvider initialTheme={isDark ? 'dark' : 'light'}>
        {component}
      </ThemeProvider>
    );
  };

  it('renders correctly with default props', () => {
    const { getByText } = renderWithTheme(
      <RatingModal
        visible={true}
        onClose={() => {}}
        onSubmit={() => {}}
        politicianName="Test Politician"
      />
    );

    expect(getByText('Rate Test Politician')).toBeTruthy();
  });

  it('calls onSubmit with correct data when form is submitted', () => {
    const onSubmit = jest.fn();
    const { getByTestId, getByText } = renderWithTheme(
      <RatingModal
        visible={true}
        onClose={() => {}}
        onSubmit={onSubmit}
        politicianName="Test Politician"
      />
    );

    // Select a rating
    fireEvent.press(getByTestId('rating-4'));
    
    // Enter a comment
    const commentInput = getByTestId('comment-input');
    fireEvent.changeText(commentInput, 'Test comment');

    // Submit the form
    fireEvent.press(getByText('Submit'));

    expect(onSubmit).toHaveBeenCalledWith({
      rating: 4,
      comment: 'Test comment',
    });
  });

  it('shows alert for low ratings', () => {
    const { getByTestId, getByText } = renderWithTheme(
      <RatingModal
        visible={true}
        onClose={() => {}}
        onSubmit={() => {}}
        politicianName="Test Politician"
      />
    );

    // Select a low rating
    fireEvent.press(getByTestId('rating-1'));

    // Check if alert is shown
    expect(getByText('Low Rating')).toBeTruthy();
    expect(getByText('Are you sure you want to give a low rating?')).toBeTruthy();
  });

  it('disables submit button when no rating is selected', () => {
    const { getByText } = renderWithTheme(
      <RatingModal
        visible={true}
        onClose={() => {}}
        onSubmit={() => {}}
        politicianName="Test Politician"
      />
    );

    const submitButton = getByText('Submit');
    expect(submitButton.props.disabled).toBe(true);
  });

  it('renders correctly in dark mode', () => {
    const { getByText } = renderWithTheme(
      <RatingModal
        visible={true}
        onClose={() => {}}
        onSubmit={() => {}}
        politicianName="Test Politician"
      />,
      true
    );

    expect(getByText('Rate Test Politician')).toBeTruthy();
  });

  it('handles comment input correctly', () => {
    const { getByTestId } = renderWithTheme(
      <RatingModal
        visible={true}
        onClose={() => {}}
        onSubmit={() => {}}
        politicianName="Test Politician"
      />
    );

    const commentInput = getByTestId('comment-input');
    fireEvent.changeText(commentInput, 'Test comment');
    expect(commentInput.props.value).toBe('Test comment');
  });
}); 