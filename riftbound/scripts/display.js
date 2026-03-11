let cardsDisplayed = 30;

export function getCardsDisplayed() { return cardsDisplayed; }
export function setCardsDisplayed(v) { cardsDisplayed = v; }

export function displayCards(cards) {
  const placeholder = document.getElementById('placeholder');
  const list = document.getElementById('file-list');
  if (placeholder) placeholder.style.display = 'none';
  list.innerHTML = '';

  cards.slice(0, cardsDisplayed).forEach(card => {
    const li = document.createElement('li');
    li.className = 'card-item';

    const img = document.createElement('img');
    img.setAttribute('data-src', card.Image || card.Thumbnail || '');
    img.setAttribute('data-card-id', card.ID);
    img.setAttribute('data-card-name', card.Name);
    img.setAttribute('data-card-type', card.Type);
    img.alt = card.Name;
    img.className = card.Orientation === 'landscape' ? 'card-img landscape' : 'card-img';

    const nameEl = document.createElement('span');
    nameEl.className = 'card-name';
    nameEl.textContent = card.Name;

    li.appendChild(img);
    li.appendChild(nameEl);
    list.appendChild(li);
  });

  lazyLoadImages();
}

function lazyLoadImages() {
  const imgs = document.querySelectorAll('img[data-src]');
  if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver((entries, obs) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const img = e.target;
          img.src = img.getAttribute('data-src');
          img.removeAttribute('data-src');
          obs.unobserve(img);
        }
      });
    }, { rootMargin: '200px' });
    imgs.forEach(img => obs.observe(img));
  } else {
    imgs.forEach(img => {
      img.src = img.getAttribute('data-src');
      img.removeAttribute('data-src');
    });
  }
}
