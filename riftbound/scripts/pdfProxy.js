// ── Configuración ───────────────────────────────────────────────
// Pon aquí la URL de tu Cloudflare Worker de imagen (image-proxy-worker.js).
// Ejemplo: 'https://riftbound-img-proxy.tu-subdominio.workers.dev'
const IMAGE_PROXY_URL = 'https://billowing-shape-802c.tomas-projectes.workers.dev';
// ────────────────────────────────────────────────────────────────

export async function generateDeckPdf(deck, notifContainer) {
  if (!window.jspdf) {
    alert('jsPDF not loaded. Make sure the library is included.');
    return;
  }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF('portrait', 'mm', 'a4');
  const cardW = 63, cardH = 88;
  const pageW = 210, pageH = 297;
  const cols = 3, rows = 3;
  const perPage = cols * rows;
  const marginX = (pageW - cols * cardW) / 2;
  const marginY = (pageH - rows * cardH) / 2;

  const total = deck.reduce((a, c) => a + c.copies, 0);
  let processed = 0;

  const includeGuides = document.getElementById('include-guides-checkbox')?.checked ?? true;

  // Loading notification
  const loader = document.createElement('div');
  loader.className = 'pdf-loader';
  loader.innerHTML = 'Generating PDF… <span id="pdf-pct">0%</span>';
  notifContainer.appendChild(loader);

  function updatePct(n) {
    const el = document.getElementById('pdf-pct');
    if (el) el.textContent = `${Math.round(n)}%`;
  }

  function drawGuides() {
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.2);
    for (let c = 0; c <= cols; c++) {
      const x = marginX + c * cardW;
      doc.line(x, 0, x, pageH);
    }
    for (let r = 0; r <= rows; r++) {
      const y = marginY + r * cardH;
      doc.line(0, y, pageW, y);
    }
  }

  // Fetch image via proxy to bypass CORS restrictions on tcgplayer-cdn
  async function imgToBase64(url) {
    const proxyUrl = `${IMAGE_PROXY_URL}?url=${encodeURIComponent(url)}`;
    try {
      const res = await fetch(proxyUrl);
      if (!res.ok) throw new Error(`Proxy HTTP ${res.status}`);
      const blob = await res.blob();
      return await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload  = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(blob);
      });
    } catch (err) {
      console.warn('[pdf] proxy fetch failed for:', url, err.message);
      // Last-resort: try direct fetch (works if CORS is allowed)
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Direct HTTP ${res.status}`);
        const blob = await res.blob();
        return await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload  = () => resolve(reader.result);
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(blob);
        });
      } catch (e) {
        console.warn('[pdf] direct fetch also failed, skipping image:', url);
        return null;
      }
    }
  }

  let pos = 0;
  for (const card of deck) {
    for (let i = 0; i < card.copies; i++) {
      if (pos === perPage) {
        if (includeGuides) drawGuides();
        doc.addPage();
        pos = 0;
      }

      const col = pos % cols;
      const row = Math.floor(pos / cols);
      const x = marginX + col * cardW;
      const y = marginY + row * cardH;

      const b64 = await imgToBase64(card.Image);
      if (b64) {
        doc.addImage(b64, 'JPEG', x, y, cardW, cardH);
      } else {
        // Draw placeholder rectangle if image failed
        doc.setDrawColor(100, 100, 100);
        doc.setFillColor(30, 30, 40);
        doc.rect(x, y, cardW, cardH, 'FD');
        doc.setFontSize(7);
        doc.setTextColor(150, 150, 150);
        doc.text(card.Name || '?', x + cardW / 2, y + cardH / 2, { align: 'center' });
      }

      pos++;
      processed++;
      updatePct((processed / total) * 100);
    }
  }

  // Draw guides on last page
  if (includeGuides) drawGuides();

  loader.remove();
  doc.save('riftbound-deck.pdf');
}