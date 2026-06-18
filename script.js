const dict = {
    es: {
        title: "Configuración",
        cardsLabel: "Número de fichas",
        playersLabel: "Cantidad de jugadores",
        timeLabel: "Tiempo por turno",
        timeOptions: ["Sin tiempo", "10seg", "15seg", "30seg", "45seg", "1min"],
        errorOdd: "⚠ Solo se puede seleccionar un número par de fichas.",
        errorRange: "⚠ Elige entre 6 y 40 fichas.",
        btnPlayWelcome: "Jugar",
        btnStartGame: "Empezar"
    },
    en: {
        title: "Game Settings",
        cardsLabel: "Number of cards",
        playersLabel: "Number of players",
        timeLabel: "Time per turn",
        timeOptions: ["No limit", "10sec", "15sec", "30sec", "45sec", "1min"],
        errorOdd: "⚠ Please select an even number of cards.",
        errorRange: "⚠ Choose between 6 and 40 cards.",
        btnPlayWelcome: "Play",
        btnStartGame: "Start"
    }
};

let currentLang = 'es';
let selectedPlayers = 1;
let selectedTime = 0;
const timeOptionsValues = [0, 10, 15, 30, 45, 60];

// Elements
const themeToggleBtn = document.getElementById('theme-toggle');
const htmlEl = document.documentElement;
const iconSun = document.getElementById('icon-sun');
const iconMoon = document.getElementById('icon-moon');

const langEsBtn = document.getElementById('lang-es');
const langEnBtn = document.getElementById('lang-en');

const welcomeView = document.getElementById('welcome-view');
const configView = document.getElementById('config-view');

const btnJugarWelcome = document.getElementById('btn-jugar-welcome');
const btnEmpezarConfig = document.getElementById('btn-empezar-config');
const btnBackWelcome = document.getElementById('btn-back-welcome');

const cardsInput = document.getElementById('cards-input');
const errorMessage = document.getElementById('error-message');
const playersGrid = document.getElementById('players-grid');
const timeGrid = document.getElementById('time-grid');

// Texts
const titleEl = document.getElementById('game-title');
const lblCards = document.getElementById('lbl-cards');
const lblPlayers = document.getElementById('lbl-players');
const lblTime = document.getElementById('lbl-time');

// Initialize
function init() {
    generatePlayerBoxes();
    generateTimeBoxes();
    checkValidation();
    setupNavigation();
}

// Theme Toggle
themeToggleBtn.addEventListener('click', () => {
    const currentTheme = htmlEl.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    htmlEl.setAttribute('data-theme', newTheme);
    
    if (newTheme === 'dark') {
        iconMoon.style.display = 'none';
        iconSun.style.display = 'block';
    } else {
        iconMoon.style.display = 'block';
        iconSun.style.display = 'none';
    }
});

// Language Toggle
function updateTexts() {
    titleEl.textContent = dict[currentLang].title;
    lblCards.textContent = dict[currentLang].cardsLabel;
    lblPlayers.textContent = dict[currentLang].playersLabel;
    lblTime.textContent = dict[currentLang].timeLabel;
    btnJugarWelcome.textContent = dict[currentLang].btnPlayWelcome;
    btnEmpezarConfig.textContent = dict[currentLang].btnStartGame;
    generateTimeBoxes();
    checkValidation(); // updates error message language
}

langEsBtn.addEventListener('click', () => {
    currentLang = 'es';
    langEsBtn.classList.add('active');
    langEnBtn.classList.remove('active');
    updateTexts();
});

langEnBtn.addEventListener('click', () => {
    currentLang = 'en';
    langEnBtn.classList.add('active');
    langEsBtn.classList.remove('active');
    updateTexts();
});

// Generate Player Boxes
function generatePlayerBoxes() {
    playersGrid.innerHTML = '';
    for (let i = 1; i <= 8; i++) {
        const box = document.createElement('div');
        box.classList.add('player-box');
        if (i === selectedPlayers) box.classList.add('selected');
        box.textContent = i;
        
        box.addEventListener('click', () => {
            selectedPlayers = i;
            // Remove selection class from all
            document.querySelectorAll('.player-box').forEach(b => b.classList.remove('selected'));
            // Add to current
            box.classList.add('selected');
        });
        
        playersGrid.appendChild(box);
    }
}

// Generate Time Boxes
function generateTimeBoxes() {
    timeGrid.innerHTML = '';
    const texts = dict[currentLang].timeOptions;
    timeOptionsValues.forEach((val, idx) => {
        const box = document.createElement('div');
        box.classList.add('time-box');
        if (val === selectedTime) box.classList.add('selected');
        box.textContent = texts[idx];
        
        box.addEventListener('click', () => {
            selectedTime = val;
            document.querySelectorAll('.time-box').forEach(b => b.classList.remove('selected'));
            box.classList.add('selected');
        });
        
        timeGrid.appendChild(box);
    });
}

// Input Validation
function checkValidation() {
    const val = parseInt(cardsInput.value);
    let isValid = true;

    if (isNaN(val) || val < 6 || val > 40) {
        errorMessage.textContent = dict[currentLang].errorRange;
        errorMessage.classList.remove('hidden');
        isValid = false;
    } else if (val % 2 !== 0) {
        errorMessage.textContent = dict[currentLang].errorOdd;
        errorMessage.classList.remove('hidden');
        isValid = false;
    } else {
        errorMessage.classList.add('hidden');
    }

    btnEmpezarConfig.disabled = !isValid;
}

cardsInput.addEventListener('input', checkValidation);
cardsInput.addEventListener('change', checkValidation);

// Setup Views Navigation
function setupNavigation() {
    // Welcome "Jugar" to Config View
    btnJugarWelcome.addEventListener('click', () => {
        welcomeView.classList.add('fade-out');
        setTimeout(() => {
            welcomeView.classList.add('hidden');
            welcomeView.classList.remove('fade-out');
            
            configView.classList.remove('hidden');
            configView.classList.add('fade-in');
            setTimeout(() => {
                configView.classList.remove('fade-in');
            }, 500);
        }, 400);
    });

    // Config Back Arrow to Welcome View
    btnBackWelcome.addEventListener('click', () => {
        configView.classList.add('fade-out');
        setTimeout(() => {
            configView.classList.add('hidden');
            configView.classList.remove('fade-out');
            
            welcomeView.classList.remove('hidden');
            welcomeView.classList.add('fade-in');
            setTimeout(() => {
                welcomeView.classList.remove('fade-in');
            }, 500);
        }, 400);
    });
}

// Play Action (Start Game)
btnEmpezarConfig.addEventListener('click', () => {
    // Collect settings
    const gameState = {
        language: currentLang,
        theme: htmlEl.getAttribute('data-theme'),
        cards: parseInt(cardsInput.value),
        players: selectedPlayers,
        timeLimit: selectedTime
    };
    
    // Save to localStorage so phase 2 can pick it up
    localStorage.setItem('memoryGameState', JSON.stringify(gameState));
    
    // Redirect logic: if more than 1 player, go to names configuration
    if (gameState.players > 1) {
        window.location.href = 'players.html';
    } else {
        window.location.href = 'board.html';
    }
});

init();
