const BASE = import.meta.env.VITE_API_URL || '';

async function get(path, params = {}) {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== '' && v != null)
  ).toString();
  const url = `${BASE}${path}${qs ? '?' + qs : ''}`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`API ${r.status}: ${path}`);
  return r.json();
}

export async function fetchCars(filters = {}, page = 0, count = 24) {
  return get('/api/cars', { ...filters, page, count });
}

export async function fetchCar(id) {
  return get('/api/car', { id });
}

export async function fetchInspect(id) {
  return get('/api/inspect', { id }).catch(() => null);
}

export async function fetchCount() {
  return get('/api/count').catch(() => ({ total: 0 }));
}
