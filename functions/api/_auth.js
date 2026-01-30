export async function getMe(req, env) {
  const url = new URL(req.url);

  // Preferisci header (non finisce in URL / log / referrer)
  const headerKey = (req.headers.get('x-superadmin-key') || '').trim();

  // Fallback opzionale: query param (sconsigliato, ma supportato)
  const queryKey = (url.searchParams.get('k') || '').trim();

  const key = headerKey || queryKey;
  const superKey = (env.SUPERADMIN_KEY || '').trim();

  if (superKey && key && key === superKey) {
    return { username: 'SUPERADMIN', role: 'superadmin', enabled: 1 };
  }

  return null;
}

export function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      ...extraHeaders,
    },
  });
}

export function error(message, status = 400) {
  return json({ error: message }, status);
}
