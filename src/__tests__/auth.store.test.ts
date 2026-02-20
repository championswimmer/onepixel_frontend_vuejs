import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import axios from 'axios';
import { useAuthStore } from '../stores/auth';

vi.mock('axios');
const mockedAxios = vi.mocked(axios, true);

describe('useAuthStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('initialises with null user and reads token from localStorage', () => {
    localStorage.setItem('token', 'stored-token');
    const store = useAuthStore();
    expect(store.user).toBeNull();
    expect(store.token).toBe('stored-token');
  });

  it('isAuthenticated is false when token is null', () => {
    const store = useAuthStore();
    expect(store.isAuthenticated).toBe(false);
  });

  it('isAuthenticated is true when token is set', () => {
    localStorage.setItem('token', 'abc');
    const store = useAuthStore();
    expect(store.isAuthenticated).toBe(true);
  });

  it('login stores user and token', async () => {
    const userData = { id: 1, email: 'test@example.com', token: 'jwt-token' };
    mockedAxios.post = vi.fn().mockResolvedValueOnce({ data: userData });

    const store = useAuthStore();
    const result = await store.login({ email: 'test@example.com', password: 'pass' });

    expect(result).toEqual(userData);
    expect(store.user).toEqual(userData);
    expect(store.token).toBe('jwt-token');
    expect(localStorage.getItem('token')).toBe('jwt-token');
  });

  it('login throws when request fails', async () => {
    mockedAxios.post = vi.fn().mockRejectedValueOnce(new Error('Network error'));

    const store = useAuthStore();
    await expect(
      store.login({ email: 'bad@example.com', password: 'wrong' })
    ).rejects.toThrow('Network error');
  });

  it('logout clears user, token, and localStorage', async () => {
    const userData = { id: 1, email: 'test@example.com', token: 'jwt-token' };
    mockedAxios.post = vi.fn().mockResolvedValueOnce({ data: userData });

    const store = useAuthStore();
    await store.login({ email: 'test@example.com', password: 'pass' });
    store.logout();

    expect(store.user).toBeNull();
    expect(store.token).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
  });
});
