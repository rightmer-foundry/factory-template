import type { Env } from './env';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === '/health') {
      return Response.json({ ok: true });
    }
    if (url.pathname !== '/') {
      return new Response('Not found', { status: 404 });
    }
    return new Response(page(env.APP_TITLE ?? 'New Foundry project'), {
      headers: { 'content-type': 'text/html; charset=utf-8' },
    });
  },
} satisfies ExportedHandler<Env>;

function page(title: string): string {
  const safe = title.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
  return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${safe}</title></head>
<body style="font:16px system-ui;max-width:640px;margin:48px auto;padding:0 16px">
<h1>${safe}</h1>
<p>Deployed by the Foundry. Replace <code>src/index.ts</code> to get started.</p>
</body>
</html>`;
}
