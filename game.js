const dictionary = {
    es: {
        btnMenu: "Menú Principal",
        btnRestart: "Reiniciar",
        turnOf: "El turno es de:",
        scoresTitle: "Puntuaciones",
        player: "Jugador",
        gameOver: "¡Juego Terminado!",
        gameCompleted: "¡Juego Completado!",
        wellDone: "¡Bien hecho!",
        tie: "¡Es un empate!",
        winner: "¡Ganador: {0}!",
        playAgain: "Jugar de Nuevo",
        goToMenu: "Ir al Menú",
        points: "pts"
    },
    en: {
        btnMenu: "Menu",
        btnRestart: "Restart",
        turnOf: "It's turn of:",
        scoresTitle: "Scores",
        player: "Player",
        gameOver: "Game Over!",
        gameCompleted: "Game Completed!",
        wellDone: "Well done!",
        tie: "It's a tie!",
        winner: "Winner: {0}!",
        playAgain: "Play Again",
        goToMenu: "Go to Menu",
        points: "pts"
    }
};

const allEmojis = [
    '🍎', '🚀', '🐶', '🍕', '🎉', '🌟', '⚽', '🚗', '🎸', '🌺', 
    '🍉', '🍔', '🐯', '🏀', '🚁', '🎨', '🌻', '🍓', '🍩', '🦊',
    '⚾', '⛵', '🎹', '🌵', '🍇', '🌮', '🐸', '🎾', '🚲', '🥁',
    '🌴', '🍒', '🥑', '🐼', '🎱', '🚂', '🎷', '🍁', '🍍', '🍣'
];

let gameState = {
    language: 'es',
    theme: 'light',
    cards: 16,
    players: 1,
    timeLimit: 0
};

let playersScores = [];
let currentPlayerIndex = 0;
let pairsFound = 0;

let firstCard = null;
let secondCard = null;
let lockBoard = false;

let timerInterval = null;
let timeRemaining = 0;

// DOM Elements
const bodyEl = document.documentElement;
const btnBackSidebar = document.getElementById('btn-back-sidebar');
const btnRestartSidebar = document.getElementById('btn-restart-sidebar');
const turnIndicatorBox = document.getElementById('turn-indicator-box');
const currentTurnName = document.getElementById('current-turn-name');
const scoresContainer = document.getElementById('scores-container');
const gameBoard = document.getElementById('game-board');
const modal = document.getElementById('game-over-modal');
const timerContainer = document.getElementById('timer-container');
const timerBar = document.getElementById('timer-bar');
const timerText = document.getElementById('timer-text');

// Init
function init() {
    const saved = localStorage.getItem('memoryGameState');
    if (saved) {
        Object.assign(gameState, JSON.parse(saved));
    }
    
    bodyEl.setAttribute('data-theme', gameState.theme);
    applyTranslations();
    setupPlayers();
    setupBoard();
}

function applyTranslations() {
    const lang = dictionary[gameState.language];
    btnBackSidebar.textContent = lang.btnMenu;
    btnRestartSidebar.textContent = lang.btnRestart;
    document.getElementById('lbl-turn-title').textContent = lang.turnOf;
    document.getElementById('lbl-scores-title').textContent = lang.scoresTitle;
    
    document.getElementById('winner-title').textContent = lang.gameOver;
    document.getElementById('btn-restart').textContent = lang.playAgain;
    document.getElementById('btn-menu').textContent = lang.goToMenu;
}

function setupPlayers() {
    playersScores = Array(gameState.players).fill(0);
    currentPlayerIndex = 0;
    
    // Safety generic data
    if (!gameState.playersInfo || gameState.playersInfo.length === 0) {
        gameState.playersInfo = [{
            name: `${dictionary[gameState.language].player} 1`,
            color: '#4299E1'
        }];
    }
    
    renderScores();
}

function renderScores() {
    scoresContainer.innerHTML = '';
    const lang = dictionary[gameState.language];
    const currentPlayerInfo = gameState.playersInfo[currentPlayerIndex];

    // Update Sidebar Turn Indicator Box
    currentTurnName.textContent = currentPlayerInfo.name;
    currentTurnName.style.color = currentPlayerInfo.color;
    turnIndicatorBox.style.setProperty('--player-color', currentPlayerInfo.color);
    
    // Fill Scores Column
    for (let i = 0; i < gameState.players; i++) {
        const box = document.createElement('div');
        box.classList.add('score-box');
        
        const playerInfo = gameState.playersInfo[i];
        box.style.borderLeft = `8px solid ${playerInfo.color}`; // Nice left border fixed
        box.style.setProperty('--player-color', playerInfo.color);
        
        if (i === currentPlayerIndex) {
            box.classList.add('active');
        }
        
        const name = document.createElement('div');
        name.classList.add('player-name');
        name.textContent = playerInfo.name;
        
        const pts = document.createElement('div');
        pts.classList.add('player-points');
        pts.id = `score-${i}`;
        pts.textContent = `${playersScores[i]} ${lang.points}`;
        
        box.appendChild(name);
        box.appendChild(pts);
        scoresContainer.appendChild(box);
    }
}

function updateScoreUI() {
    const lang = dictionary[gameState.language];
    document.getElementById(`score-${currentPlayerIndex}`).textContent = `${playersScores[currentPlayerIndex]} ${lang.points}`;
}

function switchPlayer() {
    currentPlayerIndex = (currentPlayerIndex + 1) % gameState.players;
    renderScores(); 
    startTurnTimer();
}

function setupBoard() {
    gameBoard.innerHTML = '';
    pairsFound = 0;
    firstCard = null;
    secondCard = null;
    lockBoard = false;
    modal.classList.add('hidden');
    
    const totalCards = gameState.cards; 
    let cols = 4;
    if (totalCards <= 10) cols = 5;
    else if (totalCards <= 16) cols = 4;
    else if (totalCards <= 24) cols = 6;
    else if (totalCards <= 32) cols = 8;
    else cols = 8;
    
    let rows = Math.ceil(totalCards / cols);
    gameBoard.style.setProperty('--board-rows', rows);
    gameBoard.style.setProperty('--board-cols', cols);
    
    gameBoard.style.gridTemplateColumns = `repeat(auto-fit, minmax(50px, 1fr))`;
    if (window.innerWidth > 600) {
       gameBoard.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    }

    const pairsNeeded = totalCards / 2;
    let selectedEmojis = allEmojis.slice(0, pairsNeeded);
    let cardsArray = [...selectedEmojis, ...selectedEmojis];
    cardsArray.sort(() => 0.5 - Math.random());
    
    cardsArray.forEach((emoji, index) => {
        const cardEl = document.createElement('div');
        cardEl.classList.add('card');
        cardEl.dataset.value = emoji;
        
        const inner = document.createElement('div');
        inner.classList.add('card-inner');
        
        const front = document.createElement('div');
        front.classList.add('card-front');
        front.textContent = index + 1; 
        
        const back = document.createElement('div');
        back.classList.add('card-back');
        back.textContent = emoji;
        
        inner.appendChild(front);
        inner.appendChild(back);
        cardEl.appendChild(inner);
        
        cardEl.addEventListener('click', flipCard);
        
        gameBoard.appendChild(cardEl);
    });
    
    startTurnTimer();
}

function flipCard() {
    if (lockBoard) return;
    if (this === firstCard) return; 
    
    this.classList.add('flipped');
    
    if (!firstCard) {
        firstCard = this;
        return;
    }
    
    secondCard = this;
    checkForMatch();
}

function checkForMatch() {
    let isMatch = firstCard.dataset.value === secondCard.dataset.value;
    
    if (isMatch) {
        disableCards();
        playersScores[currentPlayerIndex]++;
        updateScoreUI();
        pairsFound++;
        
        if (pairsFound === (gameState.cards / 2)) {
            setTimeout(endGame, 600);
        } else {
            // Guessed correctly: reset timer for same player
            startTurnTimer();
        }
    } else {
        unflipCards();
    }
}

function disableCards() {
    firstCard.removeEventListener('click', flipCard);
    secondCard.removeEventListener('click', flipCard);
    
    const playerInfo = gameState.playersInfo[currentPlayerIndex];
    firstCard.style.setProperty('--player-color', playerInfo.color);
    secondCard.style.setProperty('--player-color', playerInfo.color);
    
    firstCard.classList.add('matched');
    secondCard.classList.add('matched');
    
    resetBoard();
}

function unflipCards() {
    lockBoard = true;
    stopTurnTimer();
    setTimeout(() => {
        firstCard.classList.remove('flipped');
        secondCard.classList.remove('flipped');
        resetBoard();
        switchPlayer(); 
    }, 1000);
}

function resetBoard() {
    [firstCard, secondCard, lockBoard] = [null, null, false];
}

function endGame() {
    stopTurnTimer();
    modal.classList.remove('hidden');
    const titleEl = document.getElementById('winner-text');
    const lang = dictionary[gameState.language];
    
    if (gameState.players === 1) {
        document.getElementById('winner-title').textContent = lang.gameCompleted;
        titleEl.innerHTML = lang.wellDone;
    } else {
        document.getElementById('winner-title').textContent = lang.gameOver;
        let maxScore = Math.max(...playersScores);
        let winners = [];
        playersScores.forEach((score, index) => {
            if (score === maxScore) winners.push(gameState.playersInfo[index].name);
        });
        
        if (winners.length > 1) {
            titleEl.innerHTML = `${lang.tie}<br>(${maxScore} ${lang.points})`;
        } else {
            let winnerStr = lang.winner.replace('{0}', winners[0]);
            titleEl.innerHTML = `${winnerStr}<br>(${maxScore} ${lang.points})`;
        }
    }
}

// Eventos de los Botones
btnBackSidebar.addEventListener('click', () => {
    window.location.href = 'index.html';
});

btnRestartSidebar.addEventListener('click', () => {
    setupPlayers(); 
    setupBoard();
});

document.getElementById('btn-restart').addEventListener('click', () => {
    modal.classList.add('hidden');
    
    // Sort players by score if there are 2 or more players
    if (gameState.players >= 2 && gameState.playersInfo && gameState.playersInfo.length === playersScores.length) {
        const paired = gameState.playersInfo.map((info, index) => ({
            info: info,
            score: playersScores[index]
        }));
        paired.sort((a, b) => b.score - a.score);
        gameState.playersInfo = paired.map(item => item.info);
        localStorage.setItem('memoryGameState', JSON.stringify(gameState));
    }
    
    setupPlayers(); 
    setupBoard();   
});

document.getElementById('btn-menu').addEventListener('click', () => {
    window.location.href = 'index.html';
});

window.addEventListener('resize', () => {
    if(gameBoard.children.length > 0) {
        const totalCards = gameState.cards;
        let cols = 4;
        if (totalCards <= 10) cols = 5;
        else if (totalCards <= 16) cols = 4;
        else if (totalCards <= 24) cols = 6;
        else if (totalCards <= 32) cols = 8;
        else cols = 8;
        
        let rows = Math.ceil(totalCards / cols);
        gameBoard.style.setProperty('--board-rows', rows);
        gameBoard.style.setProperty('--board-cols', cols);
        
        gameBoard.style.gridTemplateColumns = `repeat(auto-fit, minmax(50px, 1fr))`;
        if (window.innerWidth > 600) {
           gameBoard.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
        }
    }
});

// Timer Functions
function startTurnTimer() {
    stopTurnTimer();
    
    if (!gameState.timeLimit || gameState.timeLimit === 0) {
        timerContainer.classList.add('hidden');
        return;
    }
    
    timerContainer.classList.remove('hidden');
    timeRemaining = gameState.timeLimit;
    
    // Initial UI update
    timerBar.style.width = '100%';
    timerText.textContent = `${timeRemaining}s`;
    timerText.classList.remove('timer-warning');
    
    timerInterval = setInterval(() => {
        timeRemaining -= 0.1;
        if (timeRemaining <= 0) {
            timeRemaining = 0;
            updateTimerUI();
            handleTimeout();
        } else {
            updateTimerUI();
        }
    }, 100);
}

function updateTimerUI() {
    const pct = (timeRemaining / gameState.timeLimit) * 100;
    timerBar.style.width = `${pct}%`;
    timerText.textContent = `${Math.ceil(timeRemaining)}s`;
    
    if (timeRemaining <= 3) {
        timerText.classList.add('timer-warning');
    } else {
        timerText.classList.remove('timer-warning');
    }
}

function stopTurnTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function handleTimeout() {
    if (lockBoard) return;
    lockBoard = true;
    stopTurnTimer();
    
    const msg = gameState.language === 'es' ? '¡Tiempo!' : 'Time\'s up!';
    timerText.textContent = msg;
    timerText.classList.add('timer-warning');
    
    if (firstCard) {
        const cardToUnflip = firstCard;
        setTimeout(() => {
            cardToUnflip.classList.remove('flipped');
            resetBoard();
            switchPlayer();
        }, 1000);
    } else {
        setTimeout(() => {
            resetBoard();
            switchPlayer();
        }, 1000);
    }
}

init();
