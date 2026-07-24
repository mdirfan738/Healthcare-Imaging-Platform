import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import LoginPage from '../pages/LoginPage';

const renderWithProviders = () => {
  const store = configureStore({ reducer: { auth: authReducer } });
  return render(
    <Provider store={store}>
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    </Provider>
  );
};

describe('LoginPage', () => {
  it('renders username and password fields', () => {
    renderWithProviders();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('allows typing into the username field', () => {
    renderWithProviders();
    const input = screen.getByLabelText(/username/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'drsmith' } });
    expect(input.value).toBe('drsmith');
  });

  it('renders the sign in button', () => {
    renderWithProviders();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });
});
