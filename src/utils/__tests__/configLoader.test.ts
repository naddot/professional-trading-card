import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loadConfig } from '../configLoader';
import { DEFAULT_CONFIG } from '../../defaultConfig';

// Mock fetch
global.fetch = vi.fn();

describe('loadConfig', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset base url
    (import.meta as any).env = { BASE_URL: '/' };
  });

  it('should return fetched config if fetch is successful', async () => {
    const mockConfig = { ...DEFAULT_CONFIG, profile: { ...DEFAULT_CONFIG.profile, name: 'Test' } };
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockConfig,
    });

    const config = await loadConfig();
    expect(config.profile.name).toBe('Test');
    expect(global.fetch).toHaveBeenCalled();
  });

  it('should return DEFAULT_CONFIG if fetch fails', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: false,
    });

    const config = await loadConfig();
    expect(config).toEqual(DEFAULT_CONFIG);
  });
});
