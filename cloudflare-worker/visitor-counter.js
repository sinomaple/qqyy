const COUNTER_KEY = 'qqyy-total-visitors';
const VISITOR_COOKIE = 'qqyy_visitor_counted';
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        if (url.pathname !== '/api/visit') {
            return jsonResponse({ error: 'Not found' }, 404);
        }

        if (request.method === 'OPTIONS') {
            return new Response(null, {
                status: 204,
                headers: noStoreHeaders()
            });
        }

        if (request.method === 'GET') {
            return jsonResponse({ visitors: await readVisitors(env) });
        }

        if (request.method !== 'POST') {
            const headers = new Headers();

            headers.set('Allow', 'GET, POST, OPTIONS');

            return jsonResponse({ error: 'Method not allowed' }, 405, headers);
        }

        const wasCounted = hasCookie(request.headers.get('Cookie') || '', VISITOR_COOKIE);
        const visitors = wasCounted ? await readVisitors(env) : await incrementVisitors(env);
        const headers = noStoreHeaders();

        headers.set('Set-Cookie', `${VISITOR_COOKIE}=1; Max-Age=${COOKIE_MAX_AGE_SECONDS}; Path=/; Secure; HttpOnly; SameSite=Lax`);

        return jsonResponse({ visitors }, 200, headers);
    }
};

async function readVisitors(env) {
    const storedCount = await env.QQYY_VISITOR_COUNTER.get(COUNTER_KEY);
    const visitors = Number(storedCount || 0);

    return Number.isFinite(visitors) && visitors > 0 ? visitors : 0;
}

async function incrementVisitors(env) {
    const currentVisitors = await readVisitors(env);
    const nextVisitors = currentVisitors + 1;

    await env.QQYY_VISITOR_COUNTER.put(COUNTER_KEY, String(nextVisitors));

    return nextVisitors;
}

function hasCookie(cookieHeader, cookieName) {
    return cookieHeader
        .split(';')
        .map((cookie) => cookie.trim())
        .some((cookie) => cookie === `${cookieName}=1`);
}

function jsonResponse(body, status = 200, extraHeaders = new Headers()) {
    const headers = noStoreHeaders(extraHeaders);

    headers.set('Content-Type', 'application/json; charset=utf-8');

    return new Response(JSON.stringify(body), {
        status,
        headers
    });
}

function noStoreHeaders(baseHeaders = new Headers()) {
    const headers = new Headers(baseHeaders);

    headers.set('Cache-Control', 'no-store');
    headers.set('X-Content-Type-Options', 'nosniff');

    return headers;
}
