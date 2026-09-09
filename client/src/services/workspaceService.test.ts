import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
const { get, post } = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }));
vi.mock('./api', () => ({ default: { get, post } }));
beforeEach(() => {
  vi.resetModules();
  vi.resetAllMocks();
});
afterEach(() => vi.unstubAllEnvs());
describe('real workspace services', () => {
  it.each([true, false])(
    'never substitutes sample data, including development mode %s',
    async (dev) => {
      vi.stubEnv('DEV', dev);
      vi.stubEnv('VITE_DEMO_MODE', 'true');
      get.mockRejectedValue(new Error('Database unavailable'));
      const s = await import('./workspaceService');
      for (const fetch of [
        s.fetchOwnerWorkspace,
        s.fetchManagerWorkspace,
        s.fetchSalespersonWorkspace,
      ])
        await expect(fetch()).rejects.toThrow('Database unavailable');
    }
  );
  it.each([
    '<!doctype html>',
    { success: true },
    { success: true, data: null },
  ])('rejects invalid response %j', async (data) => {
    get.mockResolvedValue({ data });
    const s = await import('./workspaceService');
    await expect(s.fetchOwnerWorkspace()).rejects.toThrow('backend connection');
  });
  it('preserves zero and empty real results and passes the selected period', async () => {
    const workspace = { unitsSold: 0, salesVolume: 0, managerComparisons: [] };
    get.mockResolvedValue({ data: { success: true, data: workspace } });
    const s = await import('./workspaceService');
    expect(await s.fetchOwnerWorkspace('7d')).toEqual(workspace);
    expect(get).toHaveBeenCalledWith('/workspace/owner', {
      params: { range: '7d' },
    });
  });
  it('does not report failed writes as successful', async () => {
    post.mockRejectedValue(new Error('Write failed'));
    const s = await import('./workspaceService');
    await expect(s.markLeadSold('lead', { saleValue: 100 })).rejects.toThrow(
      'Write failed'
    );
    await expect(
      s.completeTask('task', { outcome: 'no_answer' })
    ).rejects.toThrow('Write failed');
  });
});
