const modal    = document.getElementById('modal');
const modalImg = document.getElementById('modal-img');
const modalName= document.getElementById('modal-name');
const modalType= document.getElementById('modal-type');
const modalText= document.getElementById('modal-text');
const prevBtn  = document.getElementById('prev-btn');
const nextBtn  = document.getElementById('next-btn');

let images = [];
let currentIndex = -1;

function showModal(src, name, type, text) {
  modalImg.src = src;
  modalName.textContent = name;
  modalType.textContent = type;
  if (modalText) modalText.innerHTML = text || '';
  modal.classList.add('open');
  updateNav();
}

function closeModal() {
  modal.classList.remove('open');
}

function updateNav() {
  if (prevBtn) prevBtn.style.display = currentIndex > 0 ? 'flex' : 'none';
  if (nextBtn) nextBtn.style.display = currentIndex < images.length - 1 ? 'flex' : 'none';
}

function navigate(dir) {
  const newIndex = currentIndex + dir;
  if (newIndex < 0 || newIndex >= images.length) return;
  currentIndex = newIndex;
  const img = document.querySelector(`#file-list img[data-card-name="${images[currentIndex]}"]`);
  if (img) {
    showModal(
      img.src || img.getAttribute('data-src'),
      img.getAttribute('data-card-name'),
      img.getAttribute('data-card-type'),
      ''
    );
    images = Array.from(document.querySelectorAll('#file-list img')).map(i => i.getAttribute('data-card-name'));
    currentIndex = images.indexOf(img.getAttribute('data-card-name'));
  }
}

document.getElementById('file-list')?.addEventListener('click', e => {
  const img = e.target.closest('img');
  if (!img) return;
  images = Array.from(document.querySelectorAll('#file-list img')).map(i => i.getAttribute('data-card-name'));
  currentIndex = images.indexOf(img.getAttribute('data-card-name'));
  showModal(
    img.src || img.getAttribute('data-src'),
    img.getAttribute('data-card-name'),
    img.getAttribute('data-card-type'),
    ''
  );
});

modal?.querySelector('.modal-close')?.addEventListener('click', closeModal);
prevBtn?.addEventListener('click', () => navigate(-1));
nextBtn?.addEventListener('click', () => navigate(1));

window.addEventListener('click', e => { if (e.target === modal) closeModal(); });
window.addEventListener('keydown', e => {
  if (!modal?.classList.contains('open')) return;
  if (e.key === 'Escape') closeModal();
  if (e.key === 'ArrowLeft')  navigate(-1);
  if (e.key === 'ArrowRight') navigate(1);
});

// Swipe support
let touchStartX = 0;
modal?.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].clientX; });
modal?.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(dx) > 50) navigate(dx < 0 ? 1 : -1);
});
