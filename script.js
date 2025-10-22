// Configuración del juego
const GAME_CONFIG = {
    CANVAS_WIDTH: 800,
    CANVAS_HEIGHT: 600,
    BLOCK_SIZE: 20,
    FPS: 15,
    COLORS: {
        SNAKE: '#4CAF50',
        FOOD: '#FF4444',
        BACKGROUND: '#000000',
        BORDER: '#4CAF50'
    }
};

// Variables del juego
let canvas, ctx;
let gameState = {
    running: false,
    paused: false,
    score: 0,
    highScore: localStorage.getItem('snakeHighScore') || 0
};

let snake = [];
let food = {};
let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };
let gameLoop;

// Elementos del DOM
let scoreElement, highScoreElement, gameOverElement, finalScoreElement;
let startBtn, pauseBtn, resetBtn, playAgainBtn;

/**
 * Inicialización del juego
 */
function initGame() {
    // Obtener elementos del DOM
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    scoreElement = document.getElementById('score');
    highScoreElement = document.getElementById('high-score');
    gameOverElement = document.getElementById('gameOver');
    finalScoreElement = document.getElementById('finalScore');
    
    startBtn = document.getElementById('startBtn');
    pauseBtn = document.getElementById('pauseBtn');
    resetBtn = document.getElementById('resetBtn');
    playAgainBtn = document.getElementById('playAgainBtn');
    
    // Configurar event listeners
    setupEventListeners();
    
    // Inicializar estado del juego
    resetGameState();
    
    // Actualizar UI inicial
    updateUI();
    
    console.log('Juego inicializado correctamente');
}

/**
 * Configurar event listeners
 */
function setupEventListeners() {
    // Controles de teclado
    document.addEventListener('keydown', handleKeyPress);
    
    // Botones del juego
    startBtn.addEventListener('click', startGame);
    pauseBtn.addEventListener('click', togglePause);
    resetBtn.addEventListener('click', resetGame);
    playAgainBtn.addEventListener('click', resetGame);
}

/**
 * Manejar entrada del teclado
 */
function handleKeyPress(event) {
    if (!gameState.running || gameState.paused) return;
    
    const key = event.key;
    
    // Prevenir movimiento en dirección opuesta
    switch (key) {
        case 'ArrowUp':
            if (direction.y === 0) nextDirection = { x: 0, y: -1 };
            break;
        case 'ArrowDown':
            if (direction.y === 0) nextDirection = { x: 0, y: 1 };
            break;
        case 'ArrowLeft':
            if (direction.x === 0) nextDirection = { x: -1, y: 0 };
            break;
        case 'ArrowRight':
            if (direction.x === 0) nextDirection = { x: 1, y: 0 };
            break;
    }
    
    event.preventDefault();
}

/**
 * Inicializar serpiente
 */
function initSnake() {
    const centerX = Math.floor(GAME_CONFIG.CANVAS_WIDTH / 2 / GAME_CONFIG.BLOCK_SIZE);
    const centerY = Math.floor(GAME_CONFIG.CANVAS_HEIGHT / 2 / GAME_CONFIG.BLOCK_SIZE);
    
    snake = [
        { x: centerX, y: centerY },
        { x: centerX - 1, y: centerY },
        { x: centerX - 2, y: centerY }
    ];
}

/**
 * Generar posición aleatoria para la comida
 */
function generateFood() {
    const maxX = Math.floor(GAME_CONFIG.CANVAS_WIDTH / GAME_CONFIG.BLOCK_SIZE) - 1;
    const maxY = Math.floor(GAME_CONFIG.CANVAS_HEIGHT / GAME_CONFIG.BLOCK_SIZE) - 1;
    
    do {
        food = {
            x: Math.floor(Math.random() * maxX),
            y: Math.floor(Math.random() * maxY)
        };
    } while (snake.some(segment => segment.x === food.x && segment.y === food.y));
}

/**
 * Mover la serpiente
 */
function moveSnake() {
    // Actualizar dirección
    direction = { ...nextDirection };
    
    // Calcular nueva cabeza
    const head = { ...snake[0] };
    head.x += direction.x;
    head.y += direction.y;
    
    // Agregar nueva cabeza
    snake.unshift(head);
    
    // Verificar si comió comida
    if (head.x === food.x && head.y === food.y) {
        gameState.score += 10;
        generateFood();
        updateUI();
    } else {
        // Remover cola si no comió
        snake.pop();
    }
}

/**
 * Verificar colisiones
 */
function checkCollisions() {
    const head = snake[0];
    
    // Colisión con bordes
    if (head.x < 0 || head.x >= GAME_CONFIG.CANVAS_WIDTH / GAME_CONFIG.BLOCK_SIZE ||
        head.y < 0 || head.y >= GAME_CONFIG.CANVAS_HEIGHT / GAME_CONFIG.BLOCK_SIZE) {
        return true;
    }
    
    // Colisión consigo misma
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }
    
    return false;
}

/**
 * Dibujar el juego
 */
function draw() {
    // Limpiar canvas
    ctx.fillStyle = GAME_CONFIG.COLORS.BACKGROUND;
    ctx.fillRect(0, 0, GAME_CONFIG.CANVAS_WIDTH, GAME_CONFIG.CANVAS_HEIGHT);
    
    // Dibujar serpiente
    ctx.fillStyle = GAME_CONFIG.COLORS.SNAKE;
    snake.forEach((segment, index) => {
        const x = segment.x * GAME_CONFIG.BLOCK_SIZE;
        const y = segment.y * GAME_CONFIG.BLOCK_SIZE;
        
        // Cabeza más brillante
        if (index === 0) {
            ctx.fillStyle = '#66BB6A';
        } else {
            ctx.fillStyle = GAME_CONFIG.COLORS.SNAKE;
        }
        
        ctx.fillRect(x, y, GAME_CONFIG.BLOCK_SIZE, GAME_CONFIG.BLOCK_SIZE);
        
        // Borde de la serpiente
        ctx.strokeStyle = '#2E7D32';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, GAME_CONFIG.BLOCK_SIZE, GAME_CONFIG.BLOCK_SIZE);
    });
    
    // Dibujar comida
    ctx.fillStyle = GAME_CONFIG.COLORS.FOOD;
    const foodX = food.x * GAME_CONFIG.BLOCK_SIZE;
    const foodY = food.y * GAME_CONFIG.BLOCK_SIZE;
    ctx.fillRect(foodX, foodY, GAME_CONFIG.BLOCK_SIZE, GAME_CONFIG.BLOCK_SIZE);
    
    // Borde de la comida
    ctx.strokeStyle = '#CC0000';
    ctx.lineWidth = 2;
    ctx.strokeRect(foodX, foodY, GAME_CONFIG.BLOCK_SIZE, GAME_CONFIG.BLOCK_SIZE);
}

/**
 * Bucle principal del juego
 */
function gameLoop() {
    if (!gameState.running || gameState.paused) return;
    
    // Mover serpiente
    moveSnake();
    
    // Verificar colisiones
    if (checkCollisions()) {
        endGame();
        return;
    }
    
    // Dibujar
    draw();
}

/**
 * Iniciar el juego
 */
function startGame() {
    if (gameState.running) return;
    
    gameState.running = true;
    gameState.paused = false;
    
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    
    // Iniciar bucle del juego
    gameLoop = setInterval(gameLoop, 1000 / GAME_CONFIG.FPS);
    
    console.log('Juego iniciado');
}

/**
 * Pausar/reanudar el juego
 */
function togglePause() {
    if (!gameState.running) return;
    
    gameState.paused = !gameState.paused;
    pauseBtn.textContent = gameState.paused ? 'Reanudar' : 'Pausar';
    
    if (!gameState.paused) {
        gameLoop = setInterval(gameLoop, 1000 / GAME_CONFIG.FPS);
    } else {
        clearInterval(gameLoop);
    }
}

/**
 * Terminar el juego
 */
function endGame() {
    gameState.running = false;
    gameState.paused = false;
    
    clearInterval(gameLoop);
    
    // Actualizar mejor puntuación
    if (gameState.score > gameState.highScore) {
        gameState.highScore = gameState.score;
        localStorage.setItem('snakeHighScore', gameState.highScore);
    }
    
    // Mostrar pantalla de juego terminado
    finalScoreElement.textContent = gameState.score;
    gameOverElement.style.display = 'block';
    
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    pauseBtn.textContent = 'Pausar';
    
    console.log('Juego terminado. Puntuación:', gameState.score);
}

/**
 * Reiniciar el juego
 */
function resetGame() {
    clearInterval(gameLoop);
    
    gameState.running = false;
    gameState.paused = false;
    gameState.score = 0;
    
    // Ocultar pantalla de juego terminado
    gameOverElement.style.display = 'none';
    
    // Reiniciar estado del juego
    resetGameState();
    updateUI();
    
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    pauseBtn.textContent = 'Pausar';
    
    console.log('Juego reiniciado');
}

/**
 * Reiniciar estado del juego
 */
function resetGameState() {
    initSnake();
    generateFood();
    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };
    draw();
}

/**
 * Actualizar interfaz de usuario
 */
function updateUI() {
    scoreElement.textContent = gameState.score;
    highScoreElement.textContent = gameState.highScore;
}

// Inicializar el juego cuando se carga la página
document.addEventListener('DOMContentLoaded', initGame);
