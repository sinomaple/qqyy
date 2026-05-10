# QQYY Landing Page Guidance

## Goal
QQYY is a Matrix-inspired static remote-desktop gateway facade for `qqyy.org`.

## Brand
- Site name: QQYY
- Purpose: private family custom-domain remote gateway facade
- Public contact details should stay off-page unless explicitly requested.
- Website: qqyy.org
- Tagline direction: remote desktop gateway, broker locked, certificate required, connection refused, green rain

## Style
- Use visual inspiration from Matrix-style terminals: dark backgrounds, code rain, crisp grid lines, green glow, and restrained cyan or amber accents.
- Prefer terse internal-system language: gateway, session, node, audit, denied.
- Keep edits small and easy to understand.
- Avoid copying exact movie assets, logos, character names, or copyrighted text.

## Technical Notes
- This is a static GitHub Pages site.
- Use plain HTML, CSS, JavaScript, and SVG.
- Keep links and assets relative so they work on GitHub Pages.
- The custom domain is `qqyy.org`, recorded in `CNAME`.
- The top navigation does not show a logo; keep the header minimal unless explicitly asked.
- Keep direct contact details out of public HTML and JavaScript.
- `script.js` owns the mobile menu, decorative code-rain canvas, local-only gateway interaction, Web Audio effects, and hidden game.

## Important Files
- `index.html`: home page
- `names.html`: sealed directory page
- `about.html`: node status page
- `contact.html`: audit/status page
- `styles.css`: shared site styling
- `script.js`: small shared JavaScript
- Hidden game: typing `rabbit` or clicking the rabbit/trace labels three times launches the Matrix tank mini-game with Web Audio effects.

## Workflow
- Before editing, inspect the current file so recent changes are preserved.
- If `local-notes/qqyy-todos.md` exists, check it when planning future site additions or reminders. This folder is intentionally local-only and should not be committed.
- Do not remove user-made edits unless explicitly asked.
- When changing any page header, compare it against `index.html` and keep the header markup and navigation links consistent across all pages.
- For GitHub Pages issues, verify that changed files are committed and pushed to `main`.
- Check and fix for privacy and security issues
