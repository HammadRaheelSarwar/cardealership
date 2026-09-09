import { beforeEach, describe, expect, it, vi } from 'vitest';
const { get } = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock('./api', () => ({ default: { get } }));
import { normalize, readList } from './liveData';
beforeEach(() => get.mockReset());
describe('database response mapping', () => {
  it('maps nested Postgres fields without losing zero values', () => {
    expect(
      normalize({ id: 'v', sold_value: 0, customer: { first_name: 'A' } })
    ).toMatchObject({ _id: 'v', soldValue: 0, customer: { firstName: 'A' } });
  });
  it('loads every API page', async () => {
    get
      .mockResolvedValueOnce({
        data: { data: [{ id: 'a' }], meta: { totalPages: 2 } },
      })
      .mockResolvedValueOnce({
        data: { data: [{ id: 'b' }], meta: { totalPages: 2 } },
      });
    expect((await readList('/vehicles')).map((r) => r.id)).toEqual(['a', 'b']);
    expect(get).toHaveBeenLastCalledWith('/vehicles', {
      params: { page: 2, limit: 100 },
    });
  });
  it('reads the pipeline stage envelope', async () => {
    get.mockResolvedValue({
      data: { data: { stages: [{ id: 'stage', sort_order: 0 }] } },
    });
    expect(await readList('/pipeline/stages')).toMatchObject([
      { id: 'stage', sortOrder: 0 },
    ]);
  });
  it('does not convert malformed lists into empty success', async () => {
    get.mockResolvedValue({ data: { data: '<html>' } });
    await expect(readList('/customers')).rejects.toThrow('invalid record list');
  });
});
