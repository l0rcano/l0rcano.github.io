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
const RIOT_API_KEY = process.env.RIOT_API_KEY || 'RGAPI-e66661e8-2d21-4c08-99bb-f82d88815808';
// ──────────────────────────

// Serve static files (your HTML/CSS/JS)
app.use(express.static(path.join(__dirname)));

const REGIONS = ['europe', 'americas', 'asia'];

// Proxy endpoint — called by api.js as /api/riftbound-proxy
app.get('/api/riftbound-proxy', async (req, res) => {
  const locale = req.query.locale || 'en';

  res.setHeader('Access-Control-Allow-Origin', '*');

  for (const region of REGIONS) {
    const url = `https://${region}.api.riotgames.com/riftbound/content/v1/contents?locale=${locale}`;
    console.log(`[proxy] trying ${url}`);

    try {
      const upstream = await fetch(url, {
        headers: { 'X-Riot-Token': RIOT_API_KEY }
      });

      if (upstream.status === 404) {
        console.warn(`[proxy] 404 on ${region}, trying next…`);
        continue;
      }

      if (!upstream.ok) {
        const body = await upstream.text();
        console.error(`[proxy] ${region} returned ${upstream.status}:`, body);
        return res.status(upstream.status).json({
          error: `Riot API error ${upstream.status} on ${region}`,
          detail: body
        });
      }

      const data = await upstream.json();
      console.log(`[proxy] success on ${region}`);
      return res.json(data);

    } catch (err) {
      console.error(`[proxy] fetch failed on ${region}:`, err.message);
    }
  }

  res.status(404).json({ error: 'Riftbound API not available on any region (europe, americas, asia)' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Riftbound proxy running → http://localhost:${PORT}`);
  console.log(`API key: ${RIOT_API_KEY.slice(0, 12)}…`);
});