import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { restfulApi } from './api';

describe('RestClient (api.ts)', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('performs successful GET request and normalizes data', async () => {
    const mockData = { id: 'p1', name: 'Product 1', imageUrl: 'img1.png|img2.png' };
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ success: true, data: mockData, status: 200, message: 'OK' }),
    });

    const res = await restfulApi.get<{ id: string; name: string; imageUrl: string; imageUrls?: string[] }>('/api/products/1');

    expect(res.error).toBeNull();
    expect(res.status).toBe(200);
    expect(res.data?.id).toBe('p1');
    expect(res.data?.imageUrl).toBe('img1.png');
    expect(res.data?.imageUrls).toEqual(['img1.png', 'img2.png']);
  });

  it('performs successful POST request with request body', async () => {
    let capturedBody = '';
    globalThis.fetch = vi.fn().mockImplementation((_url, init) => {
      capturedBody = init.body;
      return Promise.resolve({
        ok: true,
        status: 201,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ success: true, data: { orderId: 'ord-123' }, status: 201, message: 'Created' }),
      });
    });

    const res = await restfulApi.post<{ orderId: string }>('/api/orders', { total: 500 });

    expect(res.error).toBeNull();
    expect(res.status).toBe(201);
    expect(res.data?.orderId).toBe('ord-123');
    expect(capturedBody).toBe(JSON.stringify({ total: 500 }));
  });

  it('handles 401 Unauthorized by dispatching auth-unauthorized event for logged in users', async () => {
    localStorage.setItem('app_auth_session', JSON.stringify({ token: 'mock-valid-jwt' }));
    const eventSpy = vi.fn();
    window.addEventListener('auth-unauthorized', eventSpy);

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ success: false, data: null, status: 401, message: 'Token Expired' }),
    });

    const res = await restfulApi.get('/api/users/profile');

    expect(res.status).toBe(401);
    expect(res.error).toContain('Token Expired');
    expect(eventSpy).toHaveBeenCalledTimes(1);

    window.removeEventListener('auth-unauthorized', eventSpy);
  });

  it('does not dispatch auth-unauthorized when an unauthenticated guest receives 401', async () => {
    localStorage.clear();
    const eventSpy = vi.fn();
    window.addEventListener('auth-unauthorized', eventSpy);

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ success: false, data: null, status: 401, message: 'Unauthorized' }),
    });

    const res = await restfulApi.get('/api/cart');

    expect(res.status).toBe(401);
    expect(eventSpy).not.toHaveBeenCalled();

    window.removeEventListener('auth-unauthorized', eventSpy);
  });

  it('normalizes path by ensuring leading slash', async () => {
    let capturedUrl = '';
    globalThis.fetch = vi.fn().mockImplementation((url) => {
      capturedUrl = String(url);
      return Promise.resolve({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ success: true, data: [], status: 200, message: 'OK' }),
      });
    });

    await restfulApi.get('api/products');
    expect(capturedUrl.endsWith('/api/products')).toBe(true);
  });

  it('handles non-JSON error response gracefully without crashing', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 502,
      headers: new Headers({ 'content-type': 'text/html' }),
      json: async () => {
        throw new Error('Unexpected token < in JSON at position 0');
      },
    });

    const res = await restfulApi.get('/api/broken-endpoint');

    expect(res.status).toBe(502);
    expect(res.error).toBe('เกิดข้อผิดพลาดในการเชื่อมต่อ (Status: 502)');
    expect(res.data).toBeNull();
  });

  it('handles network failure gracefully', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Failed to fetch'));

    const res = await restfulApi.get('/api/down-endpoint');

    expect(res.status).toBe(500);
    expect(res.error).toBe('Failed to fetch');
    expect(res.data).toBeNull();
  });
});
