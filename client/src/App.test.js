import { render, screen } from '@testing-library/react';
import App from './App';

test('renders WorkersHire navigation', () => {
  render(<App />);
  const navElement = screen.getByText(/WorkersHire/i);
  expect(navElement).toBeInTheDocument();
});
