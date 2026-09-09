import api from './api';

export function normalize(value: any): any {
  if (Array.isArray(value)) return value.map(normalize);
  if (!value || typeof value !== 'object') return value;
  const result: any = {};
  for (const [key, item] of Object.entries(value)) {
    const mapped = normalize(item);
    result[key] = mapped;
    result[key.replace(/_([a-z])/g, (_, c) => c.toUpperCase())] = mapped;
  }
  if (result.id) result._id = result.id;
  return result;
}
export async function readData(path: string) {
  return normalize((await api.get(path)).data.data);
}
export async function readList(path: string): Promise<any[]> {
  const records: any[] = [];
  for (let page = 1; ; page++) {
    const response = await api.get(path, { params: { page, limit: 100 } });
    const data = path.startsWith('/pipeline/stages')
      ? response.data.data?.stages
      : response.data.data;
    if (!Array.isArray(data))
      throw new Error('The server returned an invalid record list.');
    records.push(...normalize(data));
    if (!response.data.meta || page >= response.data.meta.totalPages)
      return records;
  }
}
export async function saveData(
  path: string,
  body: unknown,
  method: 'post' | 'patch' = 'post'
) {
  const result = await api[method](path, body);
  return normalize(result.data.data);
}
