// Ưu tiên: runtime config (window.__API_URL__) > build-time env > fallback
const BASE_URL =
  (typeof window !== 'undefined' && window.__API_URL__) ||
  import.meta.env.VITE_API_URL ||
  'http://localhost:5000';

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `Lỗi ${res.status}`);
  return data;
}

export const api = {
  getBooks: (search = '') =>
    request(`/api/books${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  getBook: (id) => request(`/api/books/${id}`),
  createBook: (body) => request('/api/books', { method: 'POST', body: JSON.stringify(body) }),
  updateBook: (id, body) => request(`/api/books/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteBook: (id) => request(`/api/books/${id}`, { method: 'DELETE' }),
};
