export async function generateDeckPdf(deck, notificationContainer) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('portrait', 'mm', 'a4');
    const cardWidth = 63;
    const cardHeight = 87;
    const pageWidth = 210;
    const pageHeight = 297;
    const imagesPerRow = 3;
    const imagesPerColumn = 3;
    const imagesPerPage = imagesPerRow * imagesPerColumn;
    const totalWidth = imagesPerRow * cardWidth;
    const totalHeight = imagesPerColumn * cardHeight;
    const marginX = (pageWidth - totalWidth) / 2;
    const marginY = (pageHeight - totalHeight) / 2;
    let imageCount = 0;

    const totalImages = deck.reduce((acc, card) => acc + card.copies, 0);
    let processedImages = 0;

    const includeGuides = document.getElementById("include-guides-checkbox").checked;
    console.log("includeGuides:", includeGuides);

    function showLoadingMessage() {
        const loadingMessage = document.createElement('div');
        loadingMessage.className = 'loading-message';
        loadingMessage.innerHTML = 'Generant PDF, si us plau espera...<br><span id="loading-percentage">0%</span>';
        notificationContainer.appendChild(loadingMessage);
        return loadingMessage;
    }

    function updateLoadingMessage(loadingMessage, percentage) {
        const loadingPercentage = loadingMessage.querySelector('#loading-percentage');
        loadingPercentage.textContent = `${percentage}%`;
    }

    function hideLoadingMessage(loadingMessage) {
        loadingMessage.remove();
    }

    const loadingMessage = showLoadingMessage();

    async function convertImageToBase64(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'Anonymous';
            img.onload = function () {
                const canvas = document.createElement('canvas');
                canvas.width = this.width;
                canvas.height = this.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(this, 0, 0);
                const dataURL = canvas.toDataURL('image/jpeg');
                resolve(dataURL);
            };
            img.onerror = reject;
            img.src = url;
        });
    }

    function drawCutLines(doc) {
        doc.setDrawColor(128, 128, 128);
        for (let i = 0; i <= imagesPerRow; i++) {
            const x = marginX + i * cardWidth;
            doc.line(x, 0, x, pageHeight);
            console.log(`Drew vertical line at x: ${x}`);
        }
        for (let j = 0; j <= imagesPerColumn; j++) {
            const y = marginY + j * cardHeight;
            doc.line(0, y, pageWidth, y);
            console.log(`Drew horizontal line at y: ${y}`);
        }
    }

    for (let card of deck) {
        for (let i = 0; i < card.copies; i++) {
            if (imageCount === imagesPerPage) {
                if (includeGuides) {
                    drawCutLines(doc);
                }
                doc.addPage();
                imageCount = 0;
            }

            const rowIndex = Math.floor(imageCount / imagesPerRow);
            const columnIndex = imageCount % imagesPerRow;
            const x = marginX + columnIndex * cardWidth;
            const y = marginY + rowIndex * cardHeight;

            try {
                const imgData = await convertImageToBase64(card.Image);
                doc.addImage(imgData, 'JPEG', x, y, cardWidth, cardHeight);
            } catch (error) {
                console.error('Error loading image', card.Image, error);
            }

            imageCount++;
            processedImages++;
            const percentage = Math.floor((processedImages / totalImages) * 100);
            updateLoadingMessage(loadingMessage, percentage);
        }
    }

    if (includeGuides) {
        drawCutLines(doc);
    }

    hideLoadingMessage(loadingMessage);

    doc.save("deck-list.pdf");
    
}
