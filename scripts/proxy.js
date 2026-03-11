const IMAGE_PROXY_URL = 'https://billowing-shape-802c.tomas-projectes.workers.dev';

export async function generateDeckPdf(deck, notificationContainer) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('portrait', 'mm', 'a4');
    const cardWidth = 64;
    const cardHeight = 89;
    const pageWidth = 210;
    const pageHeight = 297;
    const imagesPerRow = 3;
    const imagesPerColumn = 3;
    const imagesPerPage = imagesPerRow * imagesPerColumn;
    const marginX = (pageWidth - imagesPerRow * cardWidth) / 2;
    const marginY = (pageHeight - imagesPerColumn * cardHeight) / 2;
    let imageCount = 0;

    const totalImages = deck.reduce((acc, card) => acc + card.copies, 0);
    let processedImages = 0;

    const includeGuides = document.getElementById("include-guides-checkbox").checked;

    function showLoadingMessage() {
        const loadingMessage = document.createElement('div');
        loadingMessage.className = 'loading-message';
        loadingMessage.innerHTML = 'Generant PDF, si us plau espera...<br><span id="loading-percentage">0%</span>';
        notificationContainer.appendChild(loadingMessage);
        return loadingMessage;
    }

    function updateLoadingMessage(loadingMessage, percentage) {
        loadingMessage.querySelector('#loading-percentage').textContent = `${percentage}%`;
    }

    function hideLoadingMessage(loadingMessage) {
        loadingMessage.remove();
    }

    // Fetch via proxy → blob → base64 (evita CORS i canvas taint)
    async function getImageData(cardName, imageUrl) {
        const proxyUrl = `${IMAGE_PROXY_URL}?url=${encodeURIComponent(imageUrl)}`;
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
            console.warn(`No s'ha pogut carregar la imatge de: ${cardName}`, err.message);
            return null;
        }
    }

    function drawCutLines(doc) {
        doc.setDrawColor(128, 128, 128);
        doc.setLineWidth(0.2);
        for (let i = 0; i <= imagesPerRow; i++) {
            const x = marginX + i * cardWidth;
            doc.line(x, 0, x, pageHeight);
        }
        for (let j = 0; j <= imagesPerColumn; j++) {
            const y = marginY + j * cardHeight;
            doc.line(0, y, pageWidth, y);
        }
    }

    const loadingMessage = showLoadingMessage();

    for (let card of deck) {
        for (let i = 0; i < card.copies; i++) {
            if (imageCount === imagesPerPage) {
                if (includeGuides) drawCutLines(doc);
                doc.addPage();
                imageCount = 0;
            }

            const rowIndex = Math.floor(imageCount / imagesPerRow);
            const columnIndex = imageCount % imagesPerRow;
            const x = marginX + columnIndex * cardWidth;
            const y = marginY + rowIndex * cardHeight;

            const imgData = await getImageData(card.Name, card.Image);
            if (imgData) {
                doc.addImage(imgData, 'JPEG', x, y, cardWidth, cardHeight);
            } else {
                console.error("No s'ha pogut carregar la imatge de:", card.Name);
            }

            imageCount++;
            processedImages++;
            updateLoadingMessage(loadingMessage, Math.floor((processedImages / totalImages) * 100));
        }
    }

    if (includeGuides) drawCutLines(doc);
    hideLoadingMessage(loadingMessage);
    doc.save("deck-list-lorcano.pdf");
}