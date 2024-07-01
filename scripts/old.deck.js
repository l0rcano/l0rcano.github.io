import { cardsData, fetchCardsData } from './api.js';

document.addEventListener("DOMContentLoaded", function () {
    const saveDeckButton = document.getElementById("save-deck-button");
    const clearDeckButton = document.getElementById("clear-deck-button");
    const exportDeckButton = document.getElementById("export-deck-button");
    const importDeckButton = document.getElementById("import-deck-button");
    const generateDeckPdfButton = document.getElementById("generate-deck-pdf-button");
    const deckListElement = document.getElementById("deck-list");
    const deckTitle = document.getElementById("deck-title");
    const importDeckInput = document.getElementById("import-deck-input");
    const notificationContainer = document.getElementById('notification-container');
    const includeGuidesCheckbox = document.getElementById("include-guides-checkbox");
    let deck = [];

    function loadDeck() {
        const savedDeck = localStorage.getItem("lorcanaDeck");
        if (savedDeck) {
            deck = JSON.parse(savedDeck);
            renderDeck();
        }
    }

    function renderDeck() {
        deckListElement.innerHTML = '';
        let totalCards = 0;
        deck.forEach((card, index) => {
            totalCards += card.copies;
            const listItem = document.createElement("li");
            listItem.className = "deck-card";

            const cardContainer = document.createElement("div");
            cardContainer.className = "card-container";

            for (let i = 0; i < card.copies; i++) {
                const cardImage = document.createElement("img");
                cardImage.src = card.Image;
                cardImage.alt = card.Name;
                cardImage.className = "card-image";
                cardImage.style.left = `${i * 10}px`;
                cardImage.style.top = `${i * 10}px`;
                cardContainer.appendChild(cardImage);
            }

            const cardName = document.createElement("p");
            cardName.textContent = `${card.Name} (x${card.copies})`;
            cardName.className = "card-name";

            const cardControls = document.createElement("div");
            cardControls.className = "card-controls";

            const addButton = document.createElement("button");
            addButton.textContent = "+";
            addButton.className = "control-button";
            addButton.addEventListener("click", () => {
                if (card.copies < 4) {
                    card.copies++;
                    renderDeck();
                } else {
                    console.log("No pots tenir més de 4 còpies per carta.");
                }
            });

            const removeButton = document.createElement("button");
            removeButton.textContent = "-";
            removeButton.className = "control-button";
            removeButton.addEventListener("click", () => {
                if (card.copies > 1) {
                    card.copies--;
                } else {
                    deck.splice(index, 1);
                }
                renderDeck();
            });

            cardControls.appendChild(addButton);
            cardControls.appendChild(removeButton);

            listItem.appendChild(cardContainer);
            listItem.appendChild(cardName);
            listItem.appendChild(cardControls);
            deckListElement.appendChild(listItem);
        });

        deckTitle.textContent = `El teu Deck (${totalCards} cartes)`;
    }

    function saveDeck() {
        localStorage.setItem("lorcanaDeck", JSON.stringify(deck));
        console.log("Deck guardat correctament");
    }

    function clearDeck() {
        deck = [];
        renderDeck();
        localStorage.removeItem("lorcanaDeck");
    }

    function exportDeck() {
        let deckList = deck.map(card => `${card.copies} ${card.Name}`).join('\n');
        navigator.clipboard.writeText(deckList).then(() => {
            console.log("Deck copiat al portapapeles");
        }).catch(err => {
            console.error("Error al copiar el deck al portapapeles: ", err);
        });
    }

    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
    
        notification.innerHTML = message;
    
        const closeButton = document.createElement('span');
        closeButton.textContent = ' X';
        closeButton.className = 'close-button';
        closeButton.addEventListener('click', () => {
            notification.remove();
        });
    
        notification.appendChild(closeButton);
        notificationContainer.appendChild(notification);
    
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
    
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 20000);
    }

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
    
    function importDeck() {
        const deckText = importDeckInput.value.trim();
        if (deckText) {
            const lines = deckText.split('\n');
            deck = [];
            lines.forEach(line => {
                const parts = line.split(' ');
                const copies = parseInt(parts.shift(), 10);
                const name = parts.join(' ');
                const existingCard = deck.find(card => card.Name === name);
                if (existingCard) {
                    existingCard.copies += copies;
                    if (existingCard.copies > 4) {
                        existingCard.copies = 4;
                    }
                } else {
                    const cardData = cardsData.find(card => card.Name == name);
                    if (cardData) {
                        deck.push({
                            Name: name,
                            Image: cardData.Image,
                            copies: Math.min(copies, 4)
                        });
                    } else {
                        console.error("No s'ha trobat la carta: ", name);
                        showNotification(`No s'ha trobat la carta: <strong>${name}</strong>.<br>Prova d'afegir-la manualment.`);
                    }
                }
            });
            renderDeck();
        }
    }

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

    generateDeckPdfButton.addEventListener("click", async function () {
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

        const includeGuides = includeGuidesCheckbox.checked;
        console.log("includeGuides:", includeGuides);

        // Mostrar mensaje de carga
        const loadingMessage = showLoadingMessage();

        function drawCutLines(doc) {
            doc.setDrawColor(128, 128, 128); // Gris neutro
            // Líneas verticales
            for (let i = 0; i <= imagesPerRow; i++) {
                const x = marginX + i * cardWidth;
                doc.line(x, 0, x, pageHeight);
                console.log(`Drew vertical line at x: ${x}`);
            }
            // Líneas horizontales
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

        // Ocultar mensaje de carga
        hideLoadingMessage(loadingMessage);

        doc.save("deck-list.pdf");
    });

    document.getElementById("file-list").addEventListener("click", function (e) {
        if (e.target.tagName === "LI" || e.target.tagName === "IMG") {
            const cardElement = e.target.tagName === "LI" ? e.target : e.target.parentElement;
            const cardName = cardElement.textContent.trim();
            const cardImage = cardElement.querySelector("img").src;

            if (!cardImage) {
                console.error("No s'ha trobat la URL de l'imatge per a la carta: ", cardName);
                return;
            }

            const existingCard = deck.find(card => card.Name === cardName);
            if (existingCard) {
                if (existingCard.copies < 4) {
                    existingCard.copies++;
                } else {
                    console.log("No pots tenir més de 4 còpies de la carta.");
                }
            } else {
                deck.push({
                    Name: cardName,
                    Image: cardImage,
                    copies: 1
                });
            }

            renderDeck();
        }
    });

    saveDeckButton.addEventListener("click", saveDeck);
    clearDeckButton.addEventListener("click", clearDeck);
    exportDeckButton.addEventListener("click", exportDeck);
    importDeckButton.addEventListener("click", importDeck);

    fetchCardsData().then(() => {
        loadDeck();
    });
});
