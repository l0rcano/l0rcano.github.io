document.addEventListener('DOMContentLoaded', () => {
    const countersContainer = document.getElementById('counters');
    const numPlayersSelect = document.getElementById('num-players');
    const resetBtn = document.getElementById('reset-btn');
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    
    let playerCount = 2;
    const counters = [];

    // Función para calcular el color entre blanco y #ffa4a4
    function calculateLoreColor(lore) {
        const maxLore = 20;
        const minColor = [255, 255, 255];  
        const maxColor = [255, 164, 164]; 
        const darkMinColor = [50, 50, 50];
        const darkMaxColor = [150, 50, 50];
    
        if (lore === maxLore) {
            if (document.body.classList.contains('dark-theme')) {
                return `rgba(${darkMaxColor[0]}, ${darkMaxColor[1]}, ${darkMaxColor[2]}, 0.9)`; 
            }
            return `rgba(${maxColor[0]}, ${maxColor[1]}, ${maxColor[2]}, 0.7)`;
        }
    
        const ratio = lore / maxLore;
    
        const r = Math.round(minColor[0] + ratio * (maxColor[0] - minColor[0]));
        const g = Math.round(minColor[1] + ratio * (maxColor[1] - minColor[1]));
        const b = Math.round(minColor[2] + ratio * (maxColor[2] - minColor[2]));
    
        if (document.body.classList.contains('dark-theme')) {
            const darkR = Math.round(darkMinColor[0] + ratio * (darkMaxColor[0] - darkMinColor[0]));
            const darkG = Math.round(darkMinColor[1] + ratio * (darkMaxColor[1] - darkMinColor[1]));
            const darkB = Math.round(darkMinColor[2] + ratio * (darkMaxColor[2] - darkMinColor[2]));
            return `rgb(${darkR}, ${darkG}, ${darkB})`;
        }
    
        return `rgb(${r}, ${g}, ${b})`;
    }
    
    

    function createCounter(index) {
        const counterDiv = document.createElement('div');
        counterDiv.classList.add('counter');
    
        const label = document.createElement('span');
        label.textContent = `Jugador ${index + 1}: `;
        
        const decrementBtn = document.createElement('button');
        const decrementImg = document.createElement('img');
        decrementImg.src = '/resources/menos.png';
        decrementImg.alt = '-';
        decrementBtn.appendChild(decrementImg);
        decrementBtn.classList.add('decrement-btn', 'image-btn');
    
        const countDisplay = document.createElement('span');
        countDisplay.classList.add('count-display');
        countDisplay.textContent = '0';
    
        const incrementBtn = document.createElement('button');
        const incrementImg = document.createElement('img');
        incrementImg.src = '/resources/mas.png';
        incrementImg.alt = '+';
        incrementBtn.appendChild(incrementImg);
        incrementBtn.classList.add('increment-btn', 'image-btn');
    
        incrementBtn.addEventListener('click', () => {
            let count = parseInt(countDisplay.textContent);
            if (count < 20) {
                count++;
                countDisplay.textContent = count;
                counterDiv.classList.add('animate-up');
                setTimeout(() => counterDiv.classList.remove('animate-up'), 300);
            }
        
            const newColor = calculateLoreColor(count);
            counterDiv.style.backgroundColor = newColor;
        
            if (count === 20) {
                counterDiv.classList.add('win-animation');
                console.log("victoria");
                setTimeout(() => {
                    counterDiv.classList.remove('win-animation');
                }, 2000);
            }
        });
        
        decrementBtn.addEventListener('click', () => {
            let count = parseInt(countDisplay.textContent);
            if (count > 0) {
                count--;
                countDisplay.textContent = count;
                counterDiv.classList.add('animate-down');
                setTimeout(() => counterDiv.classList.remove('animate-down'), 300);
            }
        
            const newColor = calculateLoreColor(count);
            counterDiv.style.backgroundColor = newColor;
        
            if (count < 20) {
                counterDiv.classList.remove('win-animation');
            }
        });
        
        
    
        counterDiv.appendChild(decrementBtn);
        counterDiv.appendChild(countDisplay);
        counterDiv.appendChild(incrementBtn);
        countersContainer.appendChild(counterDiv);
        counters.push(countDisplay);
    }
    

    function updateCounters() {
        countersContainer.innerHTML = '';
        for (let i = 0; i < playerCount; i++) {
            createCounter(i);
        }
    
        if (playerCount === 2) {
            countersContainer.style.gridTemplateColumns = '1fr';
        } else if (playerCount === 4) {
            countersContainer.style.gridTemplateColumns = '1fr 1fr';
            // Additional styling to rearrange the counters
            const counters = countersContainer.children;
            counters[0].style.order = 1; // Player 1
            counters[1].style.order = 2; // Player 2
            counters[2].style.order = 3; // Player 3
            counters[3].style.order = 4; // Player 4
        } else {
            countersContainer.style.gridTemplateColumns = '1fr 1fr';
        }
    }

    numPlayersSelect.addEventListener('change', (event) => {
        playerCount = parseInt(event.target.value);
        updateCounters();
    });

    resetBtn.addEventListener('click', () => {
        counters.forEach(counter => {
            counter.textContent = '0';
            const parentDiv = counter.parentElement;
            parentDiv.classList.remove('win-animation');
            parentDiv.style.backgroundColor = calculateLoreColor(0);
        });
    });
    
    

    themeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-theme'); 
    
        counters.forEach(counterDisplay => {
            const count = parseInt(counterDisplay.textContent);
            const parentDiv = counterDisplay.parentElement;
            parentDiv.style.backgroundColor = calculateLoreColor(count); 
        });
    });
    

    updateCounters();

    let wakeLock = null;

// Función para solicitar el Wake Lock
async function requestWakeLock() {
    try {
        wakeLock = await navigator.wakeLock.request('screen');
        console.log('Wake Lock activado');
    } catch (err) {
        console.error(`${err.name}, ${err.message}`);
    }
}

// Función para liberar el Wake Lock
function releaseWakeLock() {
    if (wakeLock !== null) {
        wakeLock.release()
            .then(() => {
                console.log('Wake Lock liberado');
                wakeLock = null;
            });
    }
}

// Wake Lock
const wakeLockButton = document.getElementById('wake-lock-btn');
let wakeLockActive = false;

wakeLockButton.addEventListener('click', () => {
    if (!wakeLockActive) {
        requestWakeLock();
        wakeLockButton.textContent = 'Desactivar bloqueig de pantalla';
        wakeLockActive = true;
    } else {
        releaseWakeLock();
        wakeLockButton.textContent = 'No bloquejar la pantalla';
        wakeLockActive = false;
    }
});

document.addEventListener('visibilitychange', () => {
    if (wakeLock !== null && document.visibilityState === 'hidden') {
        releaseWakeLock();
        wakeLockButton.textContent = 'No bloquejar la pantalla';
        wakeLockActive = false;
    }
});

});
