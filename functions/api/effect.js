// Cloudflare Pages Function: /api/effect

export async function onRequest(context) {
  const { request, env } = context;
  const kv = env.WLED_EFFECT; // KV binding name (set in dashboard)

  // Handle POST from Home Assistant
  if (request.method === 'POST') {
    try {
      const body = await request.json();

      // Basic validation
      const effect = body.effect ?? null;
      const updatedAt = body.updated_at ?? new Date().toISOString();

      if (!effect) {
        return new Response(JSON.stringify({ error: 'Missing "effect" field' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Store in KV as JSON string
      const payload = JSON.stringify({
        effect,
        updated_at: updatedAt
      });

      await kv.put('current_effect', payload);

      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  // Handle GET from browser
  if (request.method === 'GET') {
    const value = await kv.get('current_effect');

    if (!value) {
      // No value yet
      return new Response(
        JSON.stringify({ effect: null, updated_at: null }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(value, {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Other methods are not allowed
  return new Response('Method not allowed', { status: 405 });
}
