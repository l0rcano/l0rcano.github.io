const fileListElement = document.getElementById('file-list');
const modal = document.getElementById('modal');
const modalImg = document.getElementById('modal-img');
const modalName = document.getElementById('modal-name');
const modalType = document.getElementById('modal-type');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');

let currentIndex = -1; 
let images = []; 

// function showModal(imageSrc, cardName, cardType) {
//     modalImg.src = imageSrc;
//     modalName.textContent = cardName;
//     modalType.textContent = cardType;
//     modal.style.display = 'block';
//     console.log(`Card Name: ${cardName}`);
//     console.log(`Card Type: ${cardType}`);
//     if (cardType === "Location") {
//         modalImg.classList.add('rotateLocation');
//     } else {
//         modalImg.classList.remove('rotateLocation');
//     }
//     currentIndex = images.indexOf(imageSrc);
//     updateButtonVisibility();
//     updateImagePosition(); 
    
// }
function showModal(imageSrc, cardName, cardType) {
    updateModalImage(imageSrc, cardName, cardType);
    modal.style.display = 'block';
    currentIndex = images.indexOf(imageSrc);
    updateButtonVisibility();
    updateImagePosition();
}

function updateModalImage(imageSrc, cardName, cardType) {
    modalImg.src = imageSrc;
    modalName.textContent = cardName;
    modalType.textContent = cardType;

    if (cardType === "Location") {
        modalImg.classList.add('rotateLocation'); 
    } else {
        modalImg.classList.remove('rotateLocation'); 
    }
}

function updateImagePosition() {
    modalImg.style.margin = 'auto'; 
    modalImg.style.display = 'block'; 
}
function closeModal() {
    modal.style.display = 'none';
}

modal.querySelector('.close').addEventListener('click', closeModal);

fileListElement.addEventListener('click', function (event) {
    if (event.target.tagName === 'IMG') {
        const imageSrc = event.target.src;
        const cardName = event.target.getAttribute('data-card-name');
        const cardType = event.target.getAttribute('data-card-type');
                
        images = Array.from(fileListElement.querySelectorAll('img')).map(img => img.src);
        showModal(imageSrc, cardName, cardType);
    }
});

prevBtn.addEventListener('click', function() {
    if (currentIndex > 0) {
        currentIndex--;
        const imageSrc = images[currentIndex];
        modalImg.src = imageSrc
        const cardName = document.querySelector(`img[src="${imageSrc}"]`).getAttribute('data-card-name');
        const cardType = document.querySelector(`img[src="${imageSrc}"]`).getAttribute('data-card-type');
        updateModalImage(imageSrc, cardName, cardType);
        updateButtonVisibility()
    }
});

nextBtn.addEventListener('click', function() {
    if (currentIndex < images.length - 1) {
        currentIndex++;
        const imageSrc = images[currentIndex];
        modalImg.src = imageSrc
        const cardName = document.querySelector(`img[src="${imageSrc}"]`).getAttribute('data-card-name');
        const cardType = document.querySelector(`img[src="${imageSrc}"]`).getAttribute('data-card-type');
        updateModalImage(imageSrc, cardName, cardType);
        updateButtonVisibility()
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

// let currentLanguage = 'EN';

// function updateLanguageButtons() {
//     const btnEN = document.getElementById('toggleIdiomaEN');
//     const btnFR = document.getElementById('toggleIdiomaFR');
    
//     if (currentLanguage === 'EN') {
//         btnEN.style.display = 'none';
//         btnFR.style.display = 'inline-block';
//     } else {
//         btnEN.style.display = 'inline-block';
//         btnFR.style.display = 'none';
//     }
// }
