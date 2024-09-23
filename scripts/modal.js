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
    if (modal.style.display === 'block') {
        if (event.key === 'ArrowLeft') {
            document.getElementById('prev-btn').click(); 
        } else if (event.key === 'ArrowRight') {
            document.getElementById('next-btn').click();
        }
    }
});

let touchStartX = 0;
let touchEndX = 0;
const MIN_SWIPE_DISTANCE = 50; 

modal.addEventListener('touchstart', (event) => {
    touchStartX = event.changedTouches[0].clientX; 
});

modal.addEventListener('touchmove', (event) => {
    touchEndX = event.changedTouches[0].clientX;
});

modal.addEventListener('touchend', () => {
    handleGesture(); 
});

function handleGesture() {
    const distance = touchEndX - touchStartX; 

    if (distance < -MIN_SWIPE_DISTANCE) {
        document.getElementById('next-btn').click(); 
    } else if (distance > MIN_SWIPE_DISTANCE) {
        document.getElementById('prev-btn').click();
    }
}