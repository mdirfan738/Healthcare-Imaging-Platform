import authReducer, { clearAuthError } from '../features/auth/authSlice';

describe('authSlice', () => {
  const initialState = {
    user: null,
    accessToken: null,
    status: 'idle' as const,
    error: null,
  };

  it('should return the initial state', () => {
    expect(authReducer(undefined, { type: 'unknown' })).toMatchObject({ user: null, status: 'idle' });
  });

  it('should clear the auth error', () => {
    const stateWithError = { ...initialState, error: 'Invalid credentials' };
    const result = authReducer(stateWithError, clearAuthError());
    expect(result.error).toBeNull();
  });

  it('should set status to loading on login.pending', () => {
    const action = { type: 'auth/login/pending' };
    const result = authReducer(initialState, action);
    expect(result.status).toBe('loading');
  });

  it('should set status to failed on login.rejected', () => {
    const action = { type: 'auth/login/rejected', payload: 'Invalid username or password.' };
    const result = authReducer(initialState, action);
    expect(result.status).toBe('failed');
    expect(result.error).toBe('Invalid username or password.');
  });
});
