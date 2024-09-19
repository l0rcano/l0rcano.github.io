let cardsDisplayed = 30;

export function getCardsDisplayed() {
  return cardsDisplayed;
}

export function setCardsDisplayed(value) {
  cardsDisplayed = value;
}

export function displayCards(cards) {
  const placeholderElement = document.getElementById("placeholder");
  const fileListElement = document.getElementById("file-list");

  placeholderElement.style.display = "none";
  fileListElement.innerHTML = "";
  const filteredCards = cards.slice(0, cardsDisplayed);

  filteredCards.forEach((cardData) => {
    const listItem = document.createElement("li");
    const imageElement = document.createElement("img");
    imageElement.setAttribute("data-src", cardData.Image);
    imageElement.alt = cardData.Name;
    listItem.textContent = `${cardData.Name}`;
    listItem.appendChild(imageElement);
    fileListElement.appendChild(listItem);
  });

  lazyLoadImages();
}

function lazyLoadImages() {
  const lazyImages = document.querySelectorAll("img[data-src]");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.getAttribute("data-src");
          img.removeAttribute("data-src");
          observer.unobserve(img);
        }
      });
    });

    lazyImages.forEach((img) => {
      observer.observe(img);
    });
  } else {
    lazyImages.forEach((img) => {
      img.src = img.getAttribute("data-src");
      img.removeAttribute("data-src");
    });
  }
}
