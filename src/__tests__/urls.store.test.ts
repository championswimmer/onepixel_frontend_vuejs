import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import axios from 'axios';
import { useUrlStore } from '../stores/urls';

vi.mock('axios');
const mockedAxios = vi.mocked(axios, true);

const TOKEN = 'test-token';
const AUTH_HEADER = { Authorization: `Bearer ${TOKEN}` };

describe('useUrlStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.setItem('token', TOKEN);
    vi.clearAllMocks();
  });

  it('initialises with an empty urls array', () => {
    const store = useUrlStore();
    expect(store.urls).toEqual([]);
  });

  it('fetchUrls returns and stores urls', async () => {
    const urls = [
      { creator_id: 1, long_url: 'https://example.com', short_url: 'https://1px.li/abc' },
    ];
    mockedAxios.get = vi.fn().mockResolvedValueOnce({ data: urls });

    const store = useUrlStore();
    const result = await store.fetchUrls();

    expect(mockedAxios.get).toHaveBeenCalledWith(
      expect.stringContaining('/urls'),
      { headers: AUTH_HEADER }
    );
    expect(result).toEqual(urls);
    expect(store.urls).toEqual(urls);
  });

  it('fetchUrls throws on error', async () => {
    mockedAxios.get = vi.fn().mockRejectedValueOnce(new Error('Server error'));
    const store = useUrlStore();
    await expect(store.fetchUrls()).rejects.toThrow('Server error');
  });

  it('createRandomUrl posts and appends the new url', async () => {
    const created = { creator_id: 1, long_url: 'https://example.com', short_url: 'https://1px.li/xyz' };
    mockedAxios.post = vi.fn().mockResolvedValueOnce({ data: created });

    const store = useUrlStore();
    const result = await store.createRandomUrl({ long_url: 'https://example.com' });

    expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.stringContaining('/urls'),
      { long_url: 'https://example.com' },
      { headers: AUTH_HEADER }
    );
    expect(result).toEqual(created);
    expect(store.urls).toContainEqual(created);
  });

  it('createSpecificUrl puts and appends the new url', async () => {
    const created = { creator_id: 1, long_url: 'https://example.com', short_url: 'https://1px.li/mycode' };
    mockedAxios.put = vi.fn().mockResolvedValueOnce({ data: created });

    const store = useUrlStore();
    const result = await store.createSpecificUrl('mycode', { long_url: 'https://example.com' });

    expect(mockedAxios.put).toHaveBeenCalledWith(
      expect.stringContaining('/urls/mycode'),
      { long_url: 'https://example.com' },
      { headers: AUTH_HEADER }
    );
    expect(result).toEqual(created);
    expect(store.urls).toContainEqual(created);
  });

  it('getUrlInfo returns url info without auth header', async () => {
    const info = { long_url: 'https://example.com', hit_count: 42 };
    mockedAxios.get = vi.fn().mockResolvedValueOnce({ data: info });

    const store = useUrlStore();
    const result = await store.getUrlInfo('abc');

    expect(mockedAxios.get).toHaveBeenCalledWith(
      expect.stringContaining('/urls/abc')
    );
    expect(result).toEqual(info);
  });
});
