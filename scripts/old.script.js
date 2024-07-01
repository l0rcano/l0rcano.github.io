document.addEventListener("DOMContentLoaded", function () {
  const apiUrl = "https://api.lorcana-api.com/cards/all";

  const sortSelect = document.getElementById("sort-select");
  
  const inputElements = document.querySelectorAll("input");
  const colorFilters = document.querySelectorAll(".color-filter");
  const typeFilters = document.querySelectorAll(".type-filter");
  const setNameFilters = document.querySelectorAll(".set-name");

  const inkableSelect = document.getElementById("inkable-select");

  const searchInput = document.getElementById("search-input");
  const searchInputAtt = document.getElementById("search-input-att");
  const searchInputGlobal = document.getElementById("search-input-global");

  const clearSearchButton = document.querySelector(".clear-search");
  const clearFiltersButton = document.querySelector(".clear-filters-button");
  const clearTypeFiltersButton = document.querySelector(".clear-types-button");
  const clearSetFiltersButton = document.querySelector(".clear-set-button");
  const clearAllButton = document.getElementById("clear-all");

  const fileListElement = document.getElementById("file-list");
  const placeholderElement = document.getElementById("placeholder");

  const loadMoreButton = document.getElementById("load-more-button");
  const loadAllButton = document.getElementById("load-all-button");

  const invertOrderButton = document.getElementById("invert-order-button");
  const colorButtonsInv = document.querySelectorAll("#invert-order-button");
  let isOrderReversed = false;

  let minValue = document.getElementById("min-value");
  let maxValue = document.getElementById("max-value");

  let cardsDisplayed = 30;
  let cardsData = [];

/*
        ##############################################
        ############### OBTENIR CARTES ###############
        ##############################################
*/
  function displayCards(cards) {
    placeholderElement.style.display = "none";
    fileListElement.innerHTML = "";
    const filteredCards = cards.slice(0, cardsDisplayed);

    filteredCards.forEach((cardData) => {
      // console.log(cardData)
      const listItem = document.createElement("li");
      const imageElement = document.createElement("img");
      imageElement.setAttribute("data-src", cardData.Image);
      imageElement.alt = cardData.Name;
      listItem.textContent = `${cardData.Name}`;
      listItem.appendChild(imageElement);
      fileListElement.appendChild(listItem);
    });

    // Funció per a la càrrega diferida d'imatges
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
    lazyLoadImages();
  }

  fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => {
      cardsData = data;
      filterAndDisplayCards();
      placeholderElement.style.display = "none";
      // const distinctSetName = [...new Set(cardsData.map(card => card.Set_Name))];
      // console.log("Tipos distintos de cartas:", distinctSetName);
    })
    .catch((error) => console.error("Error obtenint dades de l'API:", error));

/*
        ##############################################
        ############### FILTRAR CARTES ###############
        ##############################################
*/

  function filterAndDisplayCards() {
    const activeColors = Array.from(colorFilters)
      .filter((filter) => filter.classList.contains("active"))
      .map((filter) => filter.getAttribute("data-color"));

    let filteredCards = cardsData;

    if (activeColors.length > 0) {
      filteredCards = cardsData.filter((card) =>
        activeColors.includes(card.Color)
      );
    }

    const inkableValue = inkableSelect.value;
    if (inkableValue !== "any") {
      const inkableBoolean = inkableValue === "true";
      filteredCards = filteredCards.filter(
        (card) => card.Inkable === inkableBoolean
      );
    }
    function setInkableToDefault() {
      const inkableSelect = document.getElementById("inkable-select");
      inkableSelect.value = "any";
    }

    const minInk = parseInt(document.getElementById("min-value").innerHTML);
    const maxInk = parseInt(document.getElementById("max-value").innerHTML);
    filteredCards = filteredCards.filter(
      (card) => card.Cost >= minInk && card.Cost <= maxInk
    );
    const activeTypes = Array.from(typeFilters)
      .filter((filter) => filter.classList.contains("active"))
      .map((filter) => filter.getAttribute("type"));

    if (activeTypes.length > 0) {
      filteredCards = filteredCards.filter((card) =>
        activeTypes.includes(card.Type)
      );
    }

    const activeSet = Array.from(setNameFilters)
      .filter((filter) => filter.classList.contains("active"))
      .map((filter) => filter.getAttribute("set_name"));

    if (activeSet.length > 0) {
      filteredCards = filteredCards.filter((card) =>
        activeSet.includes(card.Set_Name)
      );
    }
    filteredCards = filteredCards.filter(
      (card) => card.Name !== "TEST" && !card.Name.includes("s Gull")
    );
    const sortBy = sortSelect.value;

    sortAndDisplayCards(filteredCards, sortBy);

/*
        ###################################
        ########## BUSCAR CARTES ##########
        dins de la funció de filtrar cartes
        ###################################
*/

    // nom
    const searchTerm = searchInput.value.toLowerCase();
    if (searchTerm) {
      filteredCards = filteredCards.filter((card) =>
        card.Name.toLowerCase().includes(searchTerm)
      );
    }

    // habilitats, text o classe
    const searchTermAtt = searchInputAtt.value.toLowerCase();
    if (searchTermAtt) {
      filteredCards = filteredCards.filter((card) => {
        const abilities = card.Abilities ? card.Abilities.toLowerCase() : "";
        const bodyText = card.Body_Text ? card.Body_Text.toLowerCase() : "";
        const classifications = card.Classifications
          ? card.Classifications.toLowerCase()
          : "";

        return (
          abilities.includes(searchTermAtt) ||
          bodyText.includes(searchTermAtt) ||
          classifications.includes(searchTermAtt)
        );
      });
    }

    // global (menys flavor_text, card_num i set_num)
    const searchTermGlobal = searchInputGlobal.value.toLowerCase();
    if (searchTermGlobal) {
      filteredCards = filteredCards.filter((card) => {
        const cardValues = Object.keys(card)
          .filter(
            (key) =>
              key !== "Flavor_Text" && key !== "Set_Num" && key !== "Card_Num"
          )
          .map((key) => card[key])
          .join(" ")
          .toLowerCase();
        return cardValues.includes(searchTermGlobal);
      });
    }
    // cancelar búsqueda
    function clearSearchInputs() {
      searchInput.value = "";
      searchInputAtt.value = "";
      searchInputGlobal.value = "";
    }
    clearSearchButton.addEventListener("click", function () {
      clearSearchInputs();
      filterAndDisplayCards();
    });

/*
        ###################################
        ############FI BÚSQUEDA############
        ###################################
*/

    const totalFilteredCards = filteredCards.length;
    const filteredAndDisplayedCards = filteredCards.slice(0, cardsDisplayed);
    displayCards(filteredAndDisplayedCards);
    if (cardsDisplayed >= totalFilteredCards) {
      loadMoreButton.style.display = "none";
    } else {
      loadMoreButton.style.display = "block";
    }

    if (cardsDisplayed >= cardsData.length) {
      loadAllButton.style.display = "none";
    } else {
      loadAllButton.style.display = "block";
    }

    // Chernabog's Followers de lila a groc per error de la API
    const chernabogsFollowersCard = cardsData.find(
      (card) => card.Name === "Chernabog's Followers"
    );
    if (chernabogsFollowersCard) {
      chernabogsFollowersCard.Color = "Amethyst";
    }

    // Control your temper! treure type song per error de la API
    const controlYourTemper = cardsData.find(
      (card) => card.Name === "Control Your Temper!"
    );
    if (controlYourTemper) {
      controlYourTemper.Type = "Action";
    }
/*
        ##############################################
        ############## ELIMINAR FILTRES ##############
        ##############################################
*/

    clearAllButton.addEventListener("click", function () {
      clearSearchInputs();
      resetFilters();
      resetTypeFilters();
      setDefaultRangeValues();
      setInkableToDefault();
      resetSetFilters();
      filterAndDisplayCards();
    });
  }

  sortSelect.addEventListener("change", function () {
    filterAndDisplayCards();
  });

  colorFilters.forEach((filter) => {
    filter.addEventListener("click", function () {
      this.classList.toggle("active");
      filterAndDisplayCards();
    });
  });

  typeFilters.forEach((filter) => {
    filter.addEventListener("click", function () {
      this.classList.toggle("active");
      filterAndDisplayCards();
    });
  });

  setNameFilters.forEach((filter) => {
    filter.addEventListener("click", function () {
      this.classList.toggle("active");
      filterAndDisplayCards();
    });
  });

  searchInput.addEventListener("input", function () {
    filterAndDisplayCards();
  });

  inkableSelect.addEventListener("change", function () {
    filterAndDisplayCards();
  });

/*
    ###############################################
    ############### ENDREÇAR CARTES ###############
    ###############################################
*/
  function sortAndDisplayCards(cards, sortBy) {
    cards.sort((a, b) => {
      let comparison = 0;

      if (sortBy === "color") {
        // Ordenar per color primer
        comparison = a.Color.localeCompare(b.Color);
        if (comparison !== 0) {
          return comparison;
        }
      }
      if (sortBy === "card-number") {
        // Ordenar per número de set primer
        comparison = a.Set_Num - b.Set_Num;
        if (comparison !== 0) {
          return comparison;
        }

        // Si el número de set és igual, endreçar per número de carta
        comparison = a.Card_Num - b.Card_Num;
        return comparison;
      }

      // Si s'endreça per color o no, sempre endreçar per cost de tinta
      comparison = a.Cost - b.Cost;
      if (comparison !== 0) {
        return comparison;
      }

      // Si s'endreça per color o per cost de tinta, endreçar per nom
      comparison = a.Name.localeCompare(b.Name);
      return comparison;
    });

    if (isOrderReversed) {
      cards.reverse();
    }

    displayCards(cards);
  }

/*
    ###############################################
    ################ INVERTIR COST ################
    ###############################################
*/

  invertOrderButton.addEventListener("click", function () {
    isOrderReversed = !isOrderReversed;
    filterAndDisplayCards();
  });

  colorButtonsInv.forEach((button) => {
    button.addEventListener("click", function () {
      const computedStyle = window.getComputedStyle(this);
      const backgroundColor = computedStyle.backgroundColor;
      if (backgroundColor === "rgb(0, 0, 0)") {
        this.style.backgroundColor = "#fff";
        this.style.color = "#000";
      } else {
        this.style.backgroundColor = "#000";
        this.style.color = "#fff";
      }
    });
  });

/*
    ##############################################
    ############# FILTRAR PER COLORS #############
    ##############################################

    dins de filter, aquí només canviar els colors dels botons i reset
*/

  function resetFilters() {
    colorFilters.forEach((button) => {
      button.style.backgroundColor = "#000";
    });
    colorFilters.forEach((filter) => {
      filter.classList.remove("active");
    });
  }

  clearFiltersButton.addEventListener("click", function () {
    resetFilters();
    filterAndDisplayCards();
  });

  colorFilters.forEach((button) => {
    button.addEventListener("click", function () {
      const color = this.getAttribute("btn-color");
      if (this.style.backgroundColor === color) {
        this.style.backgroundColor = "#000";
      } else {
        this.style.backgroundColor = color;
      }
    });
  });

/*
    #############################################
    ############# FILTRAR PER TIPUS #############
    #############################################
 
    dins de filter, aquí només canviar els colors dels botons i reset
*/

  function resetTypeFilters() {
    typeFilters.forEach((button) => {
      button.style.backgroundColor = "#000";
      button.style.color = "#fff";
    });
    typeFilters.forEach((filter) => {
      filter.classList.remove("active");
    });
  }

  clearTypeFiltersButton.addEventListener("click", function () {
    resetTypeFilters();
    filterAndDisplayCards();
  });

  typeFilters.forEach((button) => {
    button.addEventListener("click", function () {
      if (this.style.backgroundColor === "rgb(255, 255, 255)") {
        this.style.backgroundColor = "#000";
        this.style.color = "#fff";
      } else {
        this.style.backgroundColor = "#fff";
        this.style.color = "#000";
      }
    });
  });

/*
    #############################################
    ############## FILTRAR PER SET ##############
    #############################################
 
    dins de filter, aquí només canviar els colors dels botons i reset
*/

  function resetSetFilters() {
    setNameFilters.forEach((button) => {
      button.style.backgroundColor = "#000";
      button.style.color = "#fff";
    });
    setNameFilters.forEach((filter) => {
      filter.classList.remove("active");
    });
  }

  clearSetFiltersButton.addEventListener("click", function () {
    resetSetFilters();
    filterAndDisplayCards();
  });

  setNameFilters.forEach((button) => {
    button.addEventListener("click", function () {
      if (this.style.backgroundColor === "rgb(255, 255, 255)") {
        this.style.backgroundColor = "#000";
        this.style.color = "#fff";
      } else {
        this.style.backgroundColor = "#fff";
        this.style.color = "#000";
      }
    });
  });

/*
    ##################################################
    ###################### RANG ######################
    ##################################################
*/

  function validateRange() {
    let minInk = parseInt(inputElements[0].value);
    let maxInk = parseInt(inputElements[1].value);

    if (minInk > maxInk) {
      let tempValue = maxInk;
      maxInk = minInk;
      minInk = tempValue;
    }

    minValue.innerHTML = minInk;
    maxValue.innerHTML = maxInk;

    filterAndDisplayCards();
  }

  function setDefaultRangeValues() {
    const minRangeInput = document.querySelector(".min-ink");
    const maxRangeInput = document.querySelector(".max-ink");
    minValue.innerHTML = 1;
    maxValue.innerHTML = 10;
    minRangeInput.value = 1;
    maxRangeInput.value = 10;

    const rangeFill = document.querySelector(".range-fill");
    rangeFill.style.width = "0%";
  }

  inputElements.forEach((element) => {
    element.addEventListener("input", validateRange);
  });
/*
    ###################################################
    ############### CARREGAR MÉS CARTES ###############
    ###################################################
*/

  function loadMoreCards() {
    cardsDisplayed += 10;
    filterAndDisplayCards();
  }

  loadMoreButton.addEventListener("click", loadMoreCards);

/*
    ###################################################
    ############ CARREGAR TOTES LES CARTES ############
    ###################################################
*/

function loadAllCards() {
  cardsDisplayed = cardsData.length;
  filterAndDisplayCards();
}

loadAllButton.addEventListener("click", loadAllCards);

// final
}
);
