import { beforeEach, describe, expect, it, vi } from 'vitest';

const { get, getState } = vi.hoisted(() => ({ get: vi.fn(), getState: vi.fn() }));
vi.mock('./api', () => ({ default: { get } }));
vi.mock('@/store/authStore', () => ({ useAuthStore: { getState } }));

beforeEach(() => {
  vi.resetModules();
  vi.resetAllMocks();
  vi.stubEnv('DEV', false);
  vi.stubEnv('VITE_DEMO_MODE', 'false');
  getState.mockReturnValue({ accessToken: 'real-token', activeDealershipId: 'real-dealership' });
});

describe('workspace loading on static production hosts', () => {
  it('loads every explicit demo workspace without calling the backend', async () => {
    getState.mockReturnValue({ accessToken: 'demo-access-token', activeDealershipId: 'demo-dealership-1' });
    const service = await import('./workspaceService');
    expect((await service.fetchOwnerWorkspace('7d')).dateRange).toBe('7d');
    expect((await service.fetchManagerWorkspace('30d')).dateRange).toBe('30d');
    expect((await service.fetchSalespersonWorkspace()).salespersonName).toBeTruthy();
    expect(get).not.toHaveBeenCalled();
  });

  it('returns a valid backend workspace for real sessions', async () => {
    const workspace = { dealershipName: 'Real Dealership', managerComparisons: [] };
    get.mockResolvedValue({ data: { success: true, data: workspace } });
    const { fetchOwnerWorkspace } = await import('./workspaceService');
    expect(await fetchOwnerWorkspace('today')).toEqual(workspace);
    expect(get).toHaveBeenCalledWith('/workspace/owner?range=today');
  });

  it.each(['<!doctype html><html></html>', { success: true }, { success: true, data: null }])(
    'rejects invalid successful HTTP responses instead of returning undefined: %j', async (body) => {
      get.mockResolvedValue({ data: body });
      const service = await import('./workspaceService');
      for (const fetch of [service.fetchOwnerWorkspace, service.fetchManagerWorkspace, service.fetchSalespersonWorkspace]) {
        await expect(fetch()).rejects.toThrow('backend connection');
      }
    }
  );

  it('preserves backend failures for real production sessions', async () => {
    get.mockRejectedValue(new Error('Service unavailable'));
    const { fetchOwnerWorkspace } = await import('./workspaceService');
    await expect(fetchOwnerWorkspace()).rejects.toThrow('Service unavailable');
  });

  it('does not treat a real token with a stale demo dealership as a demo session', async () => {
    getState.mockReturnValue({ accessToken: 'real-token', activeDealershipId: 'demo-dealership-1' });
    get.mockRejectedValue(new Error('Unauthorized'));
    const { fetchOwnerWorkspace } = await import('./workspaceService');
    await expect(fetchOwnerWorkspace()).rejects.toThrow('Unauthorized');
  });
});
