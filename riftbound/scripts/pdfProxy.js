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
  let processed = 0, pageCount = 0;

  const includeGuides = document.getElementById('include-guides-checkbox')?.checked ?? false;

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
    doc.setDrawColor(160, 160, 160);
    for (let c = 0; c <= cols; c++) doc.line(marginX + c * cardW, 0, marginX + c * cardW, pageH);
    for (let r = 0; r <= rows; r++) doc.line(0, marginY + r * cardH, pageW, marginY + r * cardH);
  }

  function imgToBase64(url) {
    return new Promise(resolve => {
      // Try using DOM image if already loaded (avoids CORS issues)
      const domImg = document.querySelector(`img[alt="${url}"], img[src="${url}"]`);
      if (domImg?.complete && domImg.naturalWidth > 0) {
        try {
          const cv = document.createElement('canvas');
          cv.width = domImg.naturalWidth; cv.height = domImg.naturalHeight;
          cv.getContext('2d').drawImage(domImg, 0, 0);
          return resolve(cv.toDataURL('image/jpeg'));
        } catch(e) { /* tainted, fall through */ }
      }
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        const cv = document.createElement('canvas');
        cv.width = img.width; cv.height = img.height;
        cv.getContext('2d').drawImage(img, 0, 0);
        resolve(cv.toDataURL('image/jpeg'));
      };
      img.onerror = () => resolve(null);
      img.src = url;
    });
  }

  let pos = 0; // position on current page (0-8)
  for (const card of deck) {
    for (let i = 0; i < card.copies; i++) {
      if (pos === perPage) {
        if (includeGuides) drawGuides();
        doc.addPage(); pos = 0; pageCount++;
      }
      const col = pos % cols;
      const row = Math.floor(pos / cols);
      const x = marginX + col * cardW;
      const y = marginY + row * cardH;

      const b64 = await imgToBase64(card.Image);
      if (b64) doc.addImage(b64, 'JPEG', x, y, cardW, cardH);

      pos++; processed++;
      updatePct((processed / total) * 100);
    }
  }
  if (includeGuides) drawGuides();
  loader.remove();
  doc.save('riftbound-deck.pdf');
}
