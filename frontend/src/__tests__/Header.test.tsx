import { render } from '@testing-library/react';
import Header from '../components/Header';
import { vi, describe, it } from 'vitest';
import { AuthProvider } from '../context/AuthContext'; 
import { BrowserRouter } from 'react-router-dom';

describe('Header Component', () => {
  it('renders correctly', () => {
    const mockNavigate = vi.fn();
    const mockToggle = vi.fn(); 

    render(
      <BrowserRouter>
        <AuthProvider>
            <Header onNavigate={mockNavigate} onToggleMobileMenu={mockToggle} />
        </AuthProvider>
      </BrowserRouter>
    );
  });
});