import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders without crashing', () => {
    // Render the component
    render(<App />);
    
    // Basic assertion - just checking that rendering doesn't crash
    expect(document.body).toBeDefined();
  });
});
