const colors = ['#F56565', '#4299E1', '#48BB78', '#ECC94B', '#9F7AEA', '#ED64A6', '#38B2AC', '#ED8936'];
// Nombres de los colores para accesibilidad (opcional, aunque con los tonos basta visualmente)

const translations = {
    es: {
        title: "Personalizar Jugadores",
        btnBack: "Volver",
        btnPlay: "¡Comenzar Juego!",
        placeholder: "Jugador "
    },
    en: {
        title: "Player Setup",
        btnBack: "Back",
        btnPlay: "Start Game!",
        placeholder: "Player "
    }
};

let gameState = {};
const listEl = document.getElementById('players-list');
const btnBack = document.getElementById('btn-back');
const btnPlay = document.getElementById('btn-play');

function init() {
    const saved = localStorage.getItem('memoryGameState');
    if (!saved) {
        window.location.href = 'index.html'; // Fallback redirect if no memory configuration existed
        return;
    }
    
    gameState = JSON.parse(saved);
    
    // Safety check mostly for user playing around with URLs directly
    if (gameState.players === 1) {
        window.location.href = 'board.html';
        return;
    }

    document.documentElement.setAttribute('data-theme', gameState.theme);
    
    applyTranslations();
    renderInputs();
}

function applyTranslations() {
    const lang = translations[gameState.language];
    document.getElementById('page-title').textContent = lang.title;
    btnBack.innerHTML = `🔙 ${lang.btnBack}`;
    btnPlay.textContent = lang.btnPlay;
}

function renderInputs() {
    listEl.innerHTML = '';
    const lang = translations[gameState.language];
    
    for (let i = 0; i < gameState.players; i++) {
        const row = document.createElement('div');
        row.classList.add('player-row');
        // Delay animation to make list pop smoothly
        row.style.animationDelay = `${i * 0.08}s`;
        
        const colorIndicator = document.createElement('div');
        colorIndicator.classList.add('color-indicator');
        colorIndicator.style.backgroundColor = colors[i % colors.length];
        
        const input = document.createElement('input');
        input.type = 'text';
        input.classList.add('player-input');
        input.id = `input-player-${i}`;
        input.placeholder = `${lang.placeholder}${i + 1}`;
        input.maxLength = 30;
        
        row.appendChild(colorIndicator);
        row.appendChild(input);
        listEl.appendChild(row);
    }
}

btnBack.addEventListener('click', () => {
    window.location.href = 'index.html';
});

btnPlay.addEventListener('click', () => {
    const playersInfo = [];
    const lang = translations[gameState.language];
    
    for (let i = 0; i < gameState.players; i++) {
        let val = document.getElementById(`input-player-${i}`).value.trim();
        if (!val) {
            val = `${lang.placeholder}${i + 1}`; // If left blank use default
        }
        playersInfo.push({
            name: val,
            color: colors[i % colors.length]
        });
    }
    
    gameState.playersInfo = playersInfo;
    localStorage.setItem('memoryGameState', JSON.stringify(gameState));
    
    window.location.href = 'board.html';
});

// Run
init();
