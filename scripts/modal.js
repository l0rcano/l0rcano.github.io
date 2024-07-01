const fileListElement = document.getElementById('file-list');
const modal = document.getElementById('modal');
const modalImg = document.getElementById('modal-img');

function showModal(imageSrc) {
    modalImg.src = imageSrc;
    modal.style.display = 'block';
}

function closeModal() {
    modal.style.display = 'none';
}

modal.addEventListener('click', closeModal);

fileListElement.addEventListener('click', function (event) {
    if (event.target.tagName === 'IMG') {
        const imageSrc = event.target.src;
        showModal(imageSrc);
    }
});

window.addEventListener('click', function (event) {
    if (event.target === modal) closeModal();
});

window.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && modal.style.display === 'block') {
        closeModal();
    }
});
