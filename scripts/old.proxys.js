document.addEventListener("DOMContentLoaded", function () {
    const generatePdfButton = document.getElementById("generate-pdf-button");
    const selectedCardsContainer = document.getElementById("selected-cards-container");
    let selectedCards = [];

    function renderSelectedCards() {
        selectedCardsContainer.innerHTML = '';
        selectedCards.forEach((card, index) => {
            const cardElement = document.createElement("div");
            cardElement.className = "selected-card";
            cardElement.setAttribute("data-name", card.Name);
            cardElement.setAttribute("data-image", card.Image);

            const cardImage = document.createElement("img");
            cardImage.src = card.Image;
            cardImage.alt = card.Name;
            cardImage.width = 200;

            const cardName = document.createElement("p");
            cardName.textContent = `${card.Name} (x${card.copies})`;

            const addButton = document.createElement("button");
            addButton.textContent = "+";
            addButton.addEventListener("click", () => {
                card.copies++;
                renderSelectedCards();
            });

            const removeButton = document.createElement("button");
            removeButton.textContent = "-";
            removeButton.addEventListener("click", () => {
                if (card.copies > 1) {
                    card.copies--;
                } else {
                    selectedCards.splice(index, 1);
                }
                renderSelectedCards();
            });

            cardElement.appendChild(cardImage);
            cardElement.appendChild(cardName);
            cardElement.appendChild(addButton);
            cardElement.appendChild(removeButton);
            selectedCardsContainer.appendChild(cardElement);
        });
    }

    document.getElementById("file-list").addEventListener("click", function (e) {
        if (e.target.tagName === "LI" || e.target.tagName === "IMG") {
            const cardElement = e.target.tagName === "LI" ? e.target : e.target.parentElement;
            const cardName = cardElement.textContent.trim();
            const cardImage = cardElement.querySelector("img").src;

            if (!cardImage) {
                console.error("No se encontró la URL de la imagen para la carta:", cardName);
                return;
            }

            const existingCard = selectedCards.find(card => card.Name === cardName);
            if (existingCard) {
                existingCard.copies++;
            } else {
                selectedCards.push({
                    Name: cardName,
                    Image: cardImage,
                    copies: 1
                });
            }

            renderSelectedCards();
        }
    });

    async function convertImageToBase64(imagePath) {
        return new Promise((resolve, reject) => {
            const img = new Image();
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
            img.src = imagePath;
        });
    }
    

    generatePdfButton.addEventListener("click", async function () {
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

        for (let card of selectedCards) {
            for (let i = 0; i < card.copies; i++) {
                if (imageCount === imagesPerPage) {
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
            }
        }

        doc.save("proxy-list.pdf");
    });
});
