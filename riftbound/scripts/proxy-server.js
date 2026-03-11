/**
 * proxy-server.js — Simple Express proxy for the Riot Riftbound API
 *
 * The Riot API blocks direct browser requests (CORS).
 * This server-side proxy adds your API key and forwards the request.
 *
 * Setup:
 *   npm install express node-fetch
 *   node proxy-server.js
 *
 * Then serve your frontend files from this same server (or configure CORS).
 */

const express = require('express');
const path    = require('path');
const app     = express();

// ── PUT YOUR API KEY HERE ──
const RIOT_API_KEY = process.env.RIOT_API_KEY || 'RGAPI-YOUR-KEY-HERE';
// ──────────────────────────

// Serve static files (your HTML/CSS/JS)
app.use(express.static(path.join(__dirname)));

// Proxy endpoint — called by api.js as /api/riftbound-proxy
app.get('/api/riftbound-proxy', async (req, res) => {
  const locale = req.query.locale || 'en';
  const url = `https://europe.api.riotgames.com/riftbound/content/v1/contents?locale=${locale}`;

  try {
    // Use native fetch (Node 18+) or node-fetch
    const upstream = await fetch(url, {
      headers: { 'X-Riot-Token': RIOT_API_KEY }
    });

    if (!upstream.ok) {
      return res.status(upstream.status).json({
        error: `Riot API returned ${upstream.status}: ${upstream.statusText}`
      });
    }

    const data = await upstream.json();

    // Add permissive CORS so your frontend (even on a different port) can call this
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.json(data);

  } catch (err) {
    console.error('Proxy error:', err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Riftbound proxy running → http://localhost:${PORT}`);
  console.log(`API key: ${RIOT_API_KEY.slice(0, 12)}…`);
});
