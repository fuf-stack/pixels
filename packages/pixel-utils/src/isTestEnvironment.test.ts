import { afterEach, describe, expect, it, vi } from 'vitest';

import { isTestEnvironment } from './isTestEnvironment';

describe('isTestEnvironment', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns true when NODE_ENV is test', () => {
    vi.stubEnv('NODE_ENV', 'test');
    expect(isTestEnvironment()).toBe(true);
  });

  it('returns true when VITEST is true', () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('VITEST', 'true');
    expect(isTestEnvironment()).toBe(true);
  });

  it('returns true when both NODE_ENV is test and VITEST is true', () => {
    vi.stubEnv('NODE_ENV', 'test');
    vi.stubEnv('VITEST', 'true');
    expect(isTestEnvironment()).toBe(true);
  });

  it('returns false when NODE_ENV is development', () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('VITEST', '');
    expect(isTestEnvironment()).toBe(false);
  });

  it('returns false when NODE_ENV is production', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('VITEST', '');
    expect(isTestEnvironment()).toBe(false);
  });

  it('returns false when VITEST is false string', () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('VITEST', 'false');
    expect(isTestEnvironment()).toBe(false);
  });

  it('returns false when VITEST is empty string', () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('VITEST', '');
    expect(isTestEnvironment()).toBe(false);
  });

  it('handles undefined environment variables gracefully', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('VITEST', undefined);
    expect(isTestEnvironment()).toBe(false);
  });

  it('is safe to call multiple times', () => {
    vi.stubEnv('NODE_ENV', 'test');
    expect(isTestEnvironment()).toBe(true);
    expect(isTestEnvironment()).toBe(true);
    expect(isTestEnvironment()).toBe(true);
  });
});
