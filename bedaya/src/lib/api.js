// Bedaya API helper. Mirrors Nuri's pattern but scoped to /api/bedaya.
const API_BASE = '/api/bedaya';

export async function api(endpoint, options = {}) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'حدث خطأ');
  return data.data;
}
