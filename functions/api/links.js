import { getMe, json, error } from './_auth.js';

export async function onRequest(context) {
  const { request, env } = context;

  try {
    const url = new URL(request.url);
    const all = url.searchParams.get('all') === '1';

    const me = await getMe(request, env);

    // Pubblico: vede solo link attivi
    if (request.method === 'GET' && !all) {
      const { results } = await env.DB.prepare(
        'SELECT id, title, category, url, sort_order, active FROM links WHERE active = 1 ORDER BY sort_order ASC, title ASC'
      ).all();

      return json({
        me: me || { username: 'GUEST', role: 'viewer', enabled: 1 },
        items: results.map(r => ({
          id: r.id,
          title: r.title,
          category: r.category,
          url: r.url,
          sort_order: r.sort_order,
          active: true
        }))
      });
    }

    // Solo SUPERADMIN oltre questo punto
    if (!me || me.role !== 'superadmin') return error('Forbidden', 403);

    // Superadmin: può vedere anche inattivi
    if (request.method === 'GET' && all) {
      const { results } = await env.DB.prepare(
        'SELECT id, title, category, url, sort_order, active FROM links ORDER BY sort_order ASC, title ASC'
      ).all();

      return json({
        me,
        items: results.map(r => ({
          id: r.id,
          title: r.title,
          category: r.category,
          url: r.url,
          sort_order: r.sort_order,
          active: Number(r.active) === 1
        }))
      });
    }

    // Superadmin: crea link
    if (request.method === 'POST') {
      const body = await request.json().catch(() => null);
      if (!body) return error('Invalid JSON body', 400);

      const title = String(body.title || '').trim();
      const category = String(body.category || '').trim();
      const linkUrl = String(body.url || '').trim();
      const sortOrder = parseInt(body.sort_order ?? 0, 10) || 0;
      const active = body.active === false ? 0 : 1;

      if (!title || !linkUrl) return error('title e url richiesti', 400);

      const res = await env.DB.prepare(
        'INSERT INTO links (title, category, url, sort_order, active) VALUES (?, ?, ?, ?, ?)'
      ).bind(title, category, linkUrl, sortOrder, active).run();

      return json({ id: res.meta.last_row_id });
    }

    return error('Method not allowed', 405);
  } catch (e) {
    return error(String(e?.message || e), 500);
  }
}
