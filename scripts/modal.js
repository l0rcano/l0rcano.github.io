const fileListElement = document.getElementById('file-list');
const modal = document.getElementById('modal');
const modalImg = document.getElementById('modal-img');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');

let currentIndex = -1; // Para rastrear la carta actualmente mostrada
let images = []; // Array para almacenar las fuentes de imagen

function showModal(imageSrc) {
    modalImg.src = imageSrc;
    modal.style.display = 'block';
    
    // Encontrar el índice de la carta actual
    currentIndex = images.indexOf(imageSrc);
    updateButtonVisibility();
}

function closeModal() {
    modal.style.display = 'none';
}

modal.querySelector('.close').addEventListener('click', closeModal);

fileListElement.addEventListener('click', function (event) {
    if (event.target.tagName === 'IMG') {
        const imageSrc = event.target.src;
        images = Array.from(fileListElement.querySelectorAll('img')).map(img => img.src);
        showModal(imageSrc);
    }
});

prevBtn.addEventListener('click', function() {
    if (currentIndex > 0) {
        currentIndex--;
        modalImg.src = images[currentIndex];
        updateButtonVisibility();
    }
});

nextBtn.addEventListener('click', function() {
    if (currentIndex < images.length - 1) {
        currentIndex++;
        modalImg.src = images[currentIndex];
        updateButtonVisibility();
    }
});

function updateButtonVisibility() {
    prevBtn.style.display = currentIndex > 0 ? 'block' : 'none';
    nextBtn.style.display = currentIndex < images.length - 1 ? 'block' : 'none';
}

window.addEventListener('click', function (event) {
    if (event.target === modal) closeModal();
});

window.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && modal.style.display === 'block') {
        closeModal();
    }
});
