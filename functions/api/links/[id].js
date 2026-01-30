import { getMe, json, error } from '../_auth.js';

export async function onRequest(context) {
  const { request, env, params } = context;

  try {
    const me = await getMe(request, env);
    if (!me || me.role !== 'superadmin') return error('Forbidden', 403);

    const id = parseInt(params.id, 10);
    if (!Number.isFinite(id) || id <= 0) return error('Bad id', 400);

    if (request.method === 'PUT') {
      const body = await request.json().catch(() => null);
      if (!body) return error('Invalid JSON body', 400);

      const title = String(body.title || '').trim();
      const category = String(body.category || '').trim();
      const linkUrl = String(body.url || '').trim();
      const sortOrder = parseInt(body.sort_order ?? 0, 10) || 0;
      const active = body.active ? 1 : 0;

      if (!title || !linkUrl) return error('Missing title/url', 400);

      await env.DB.prepare(
        'UPDATE links SET title=?, category=?, url=?, sort_order=?, active=? WHERE id=?'
      ).bind(title, category, linkUrl, sortOrder, active, id).run();

      return json({ ok: true });
    }

    if (request.method === 'DELETE') {
      await env.DB.prepare('DELETE FROM links WHERE id=?').bind(id).run();
      return json({ ok: true });
    }

    return error('Method not allowed', 405);
  } catch (e) {
    return error(String(e?.message || e), 500);
  }
}
