# QQYY Visitor Counter

GitHub Pages cannot run `/api/visit`, so this endpoint is meant to run as a Cloudflare Worker on the same custom domain, matching the SodaShip visitor-counter mechanism.

This must be a separate QQYY Worker setup, not the SodaShip Worker. Keep the Worker, route, KV namespace, cookie, and stored key distinct so the two sites never share counts.

## How it counts

- `POST /api/visit` increments the total only when the browser does not already have the `qqyy_visitor_counted` cookie.
- The cookie lasts 30 days and is `HttpOnly`, `Secure`, and `SameSite=Lax`.
- `GET /api/visit` returns the current total without incrementing.
- The counter stores one KV value named `qqyy-total-visitors`.
- The Worker expects a QQYY-only KV binding named `QQYY_VISITOR_COUNTER`.
- The site fetches the count silently, but the visible footer counter stays hidden until the visitor finds the easter egg.

## Easter egg reveal

- Type `count` outside form fields.
- Or tap the footer four times.
- Or finish the rabbit tank mini-game.

## Cloudflare setup

1. Create a separate KV namespace for QQYY, for example `QQYY_VISITOR_COUNTER`.
2. Deploy `visitor-counter.js` as its own Worker, for example `qqyy-visitor-counter`.
3. Bind the QQYY KV namespace to this Worker with the variable name `QQYY_VISITOR_COUNTER`.
4. Add a Worker route for `www.qqyy.org/api/visit*`.
5. Do not add a `sodaship.com` route to this Worker, and do not add a `qqyy.org` route to the SodaShip Worker.

After that, GitHub Pages keeps serving the static site while the Worker handles only `/api/visit`.
