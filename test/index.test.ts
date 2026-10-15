import { SELF } from 'cloudflare:test';
import { describe, expect, it } from 'vitest';

describe('worker', () => {
  it('serves the home page', async () => {
    const res = await SELF.fetch('https://example.test/');
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('text/html');
    expect(await res.text()).toContain('<h1>');
  });

  it('answers /health', async () => {
    const res = await SELF.fetch('https://example.test/health');
    expect(await res.json()).toEqual({ ok: true });
  });

  it('404s elsewhere', async () => {
    const res = await SELF.fetch('https://example.test/nope');
    expect(res.status).toBe(404);
  });
});
