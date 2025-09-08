/**
 * Tetris Game Implementation
 * 
 * Implementação completa do clássico jogo Tetris com todas as mecânicas originais:
 * - 7 peças diferentes (I, O, T, S, Z, J, L)
 * - Sistema de rotação
 * - Eliminação de linhas
 * - Níveis progressivos
 * - Hold system
 * - Next piece preview
 * 
 * @author Portal de Jogos
 * @version 1.0.0
 */

// === CONFIGURAÇÕES DO JOGO ===
const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const BLOCK_SIZE = 30;

// Cores das peças
const COLORS = {
    I: '#00f0f0', // Cyan
    O: '#f0f000', // Yellow  
    T: '#a000f0', // Purple
    S: '#00f000', // Green
    Z: '#f00000', // Red
    J: '#0000f0', // Blue
    L: '#f0a000', // Orange
    ghost: 'rgba(255, 255, 255, 0.3)'
};

// Definições das peças (Tetrominoes)
const PIECES = {
    I: [
        [[0,0,0,0], [1,1,1,1], [0,0,0,0], [0,0,0,0]],
        [[0,0,1,0], [0,0,1,0], [0,0,1,0], [0,0,1,0]],
        [[0,0,0,0], [0,0,0,0], [1,1,1,1], [0,0,0,0]],
        [[0,1,0,0], [0,1,0,0], [0,1,0,0], [0,1,0,0]]
    ],
    O: [
        [[0,1,1,0], [0,1,1,0], [0,0,0,0], [0,0,0,0]],
        [[0,1,1,0], [0,1,1,0], [0,0,0,0], [0,0,0,0]],
        [[0,1,1,0], [0,1,1,0], [0,0,0,0], [0,0,0,0]],
        [[0,1,1,0], [0,1,1,0], [0,0,0,0], [0,0,0,0]]
    ],
    T: [
        [[0,1,0,0], [1,1,1,0], [0,0,0,0], [0,0,0,0]],
        [[0,1,0,0], [0,1,1,0], [0,1,0,0], [0,0,0,0]],
        [[0,0,0,0], [1,1,1,0], [0,1,0,0], [0,0,0,0]],
        [[0,1,0,0], [1,1,0,0], [0,1,0,0], [0,0,0,0]]
    ],
    S: [
        [[0,1,1,0], [1,1,0,0], [0,0,0,0], [0,0,0,0]],
        [[0,1,0,0], [0,1,1,0], [0,0,1,0], [0,0,0,0]],
        [[0,0,0,0], [0,1,1,0], [1,1,0,0], [0,0,0,0]],
        [[1,0,0,0], [1,1,0,0], [0,1,0,0], [0,0,0,0]]
    ],
    Z: [
        [[1,1,0,0], [0,1,1,0], [0,0,0,0], [0,0,0,0]],
        [[0,0,1,0], [0,1,1,0], [0,1,0,0], [0,0,0,0]],
        [[0,0,0,0], [1,1,0,0], [0,1,1,0], [0,0,0,0]],
        [[0,1,0,0], [1,1,0,0], [1,0,0,0], [0,0,0,0]]
    ],
    J: [
        [[1,0,0,0], [1,1,1,0], [0,0,0,0], [0,0,0,0]],
        [[0,1,1,0], [0,1,0,0], [0,1,0,0], [0,0,0,0]],
        [[0,0,0,0], [1,1,1,0], [0,0,1,0], [0,0,0,0]],
        [[0,1,0,0], [0,1,0,0], [1,1,0,0], [0,0,0,0]]
    ],
    L: [
        [[0,0,1,0], [1,1,1,0], [0,0,0,0], [0,0,0,0]],
        [[0,1,0,0], [0,1,0,0], [0,1,1,0], [0,0,0,0]],
        [[0,0,0,0], [1,1,1,0], [1,0,0,0], [0,0,0,0]],
        [[1,1,0,0], [0,1,0,0], [0,1,0,0], [0,0,0,0]]
    ]
};

// === ESTADO DO JOGO ===
let canvas, ctx, nextCanvas, nextCtx;
let gameBoard = [];
let currentPiece = null;
let nextPiece = null;
let heldPiece = null;
let canHold = true;
let gameRunning = false;
let gameOver = false;
let paused = false;

// Estatísticas
let score = 0;
let lines = 0;
let level = 1;
let highScore = 0;

// Controles
let keys = {};
let soundEnabled = true;
let dropTimer = 0;
let dropInterval = 1000; // 1 segundo inicialmente

// Bag system para geração de peças (garante distribuição justa)
let pieceBag = [];

/**
 * Inicializa o jogo
 */
document.addEventListener('DOMContentLoaded', function() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    nextCanvas = document.getElementById('nextPieceCanvas');
    nextCtx = nextCanvas.getContext('2d');
    
    // Carrega high score
    loadHighScore();
    updateUI();
    
    // Configurar event listeners
    setupEventListeners();
    
    // Inicializar o jogo
    initializeGame();
});

/**
 * Configura todos os event listeners
 */
function setupEventListeners() {
    document.addEventListener('keydown', (e) => {
        keys[e.key] = true;
        handleKeyPress(e.key);
    });
    
    document.addEventListener('keyup', (e) => {
        keys[e.key] = false;
    });

    // Suporte a touch para mobile
    let touchStartX = 0;
    let touchStartY = 0;
    
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
    });
    
    canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        const touch = e.changedTouches[0];
        const deltaX = touch.clientX - touchStartX;
        const deltaY = touch.clientY - touchStartY;
        
        // Determinar gesto
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            // Movimento horizontal
            if (Math.abs(deltaX) > 50) {
                if (deltaX > 0) {
                    movePiece(1, 0);
                } else {
                    movePiece(-1, 0);
                }
            }
        } else {
            // Movimento vertical
            if (Math.abs(deltaY) > 50) {
                if (deltaY > 0) {
                    // Swipe down - soft drop
                    movePiece(0, 1);
                } else {
                    // Swipe up - rotate
                    rotatePiece();
                }
            } else {
                // Tap - rotate
                rotatePiece();
            }
        }
    });
}

/**
 * Processa teclas pressionadas
 */
function handleKeyPress(key) {
    if (gameOver || paused) {
        if (key === 'p' || key === 'P') {
            pauseGame();
        }
        return;
    }
    
    switch(key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
            movePiece(-1, 0);
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            movePiece(1, 0);
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            softDrop();
            break;
        case 'ArrowUp':
        case 'w':
        case 'W':
        case 'z':
        case 'Z':
            rotatePiece();
            break;
        case ' ':
            hardDrop();
            break;
        case 'c':
        case 'C':
            holdPiece();
            break;
        case 'p':
        case 'P':
            pauseGame();
            break;
    }
}

/**
 * Inicializa um novo jogo
 */
function initializeGame() {
    // Reset do tabuleiro
    gameBoard = [];
    for (let row = 0; row < BOARD_HEIGHT; row++) {
        gameBoard[row] = new Array(BOARD_WIDTH).fill(null);
    }
    
    // Reset das variáveis
    score = 0;
    lines = 0;
    level = 1;
    gameOver = false;
    paused = false;
    canHold = true;
    heldPiece = null;
    
    // Reset do bag de peças
    pieceBag = [];
    
    // Configurar primeira peça
    nextPiece = getRandomPiece();
    spawnNewPiece();
    
    // Reset dos timers
    dropTimer = 0;
    dropInterval = Math.max(50, 1000 - (level - 1) * 100);
    
    // Esconder overlays
    document.getElementById('game-over-overlay').classList.remove('show');
    document.getElementById('pause-overlay').classList.remove('show');
    
    updateUI();
    
    // Iniciar game loop
    gameRunning = true;
    gameLoop();
}

/**
 * Gera uma nova peça usando o bag system
 */
function getRandomPiece() {
    if (pieceBag.length === 0) {
        // Refill do bag com todas as peças
        pieceBag = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
        // Shuffle do array
        for (let i = pieceBag.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pieceBag[i], pieceBag[j]] = [pieceBag[j], pieceBag[i]];
        }
    }
    
    return pieceBag.pop();
}

/**
 * Spawna uma nova peça
 */
function spawnNewPiece() {
    currentPiece = {
        type: nextPiece,
        x: 3,
        y: 0,
        rotation: 0
    };
    
    nextPiece = getRandomPiece();
    canHold = true;
    
    // Verifica game over
    if (!isValidMove(currentPiece.x, currentPiece.y, currentPiece.rotation)) {
        endGame();
    }
}

/**
 * Move a peça atual
 */
function movePiece(dx, dy) {
    if (!currentPiece || gameOver || paused) return;
    
    const newX = currentPiece.x + dx;
    const newY = currentPiece.y + dy;
    
    if (isValidMove(newX, newY, currentPiece.rotation)) {
        currentPiece.x = newX;
        currentPiece.y = newY;
        return true;
    }
    
    // Se tentou mover para baixo e não conseguiu, place a peça
    if (dy > 0) {
        placePiece();
        return false;
    }
    
    return false;
}

/**
 * Roda a peça atual
 */
function rotatePiece() {
    if (!currentPiece || gameOver || paused) return;
    
    const newRotation = (currentPiece.rotation + 1) % 4;
    
    // Tenta rotação básica
    if (isValidMove(currentPiece.x, currentPiece.y, newRotation)) {
        currentPiece.rotation = newRotation;
        return;
    }
    
    // Tenta wall kicks (ajustes de posição após rotação)
    const kicks = getWallKicks(currentPiece.type, currentPiece.rotation, newRotation);
    
    for (let kick of kicks) {
        const testX = currentPiece.x + kick[0];
        const testY = currentPiece.y + kick[1];
        
        if (isValidMove(testX, testY, newRotation)) {
            currentPiece.x = testX;
            currentPiece.y = testY;
            currentPiece.rotation = newRotation;
            return;
        }
    }
}

/**
 * Wall kicks para rotação (SRS - Super Rotation System)
 */
function getWallKicks(pieceType, fromRotation, toRotation) {
    // Simplified wall kick data
    const kicks = [
        [0, 0], [-1, 0], [1, 0], [0, -1], [-1, -1], [1, -1]
    ];
    
    return kicks;
}

/**
 * Soft drop (acelerar queda)
 */
function softDrop() {
    if (movePiece(0, 1)) {
        score += 1; // Ponto por soft drop
    }
}

/**
 * Hard drop (queda instantânea)
 */
function hardDrop() {
    if (!currentPiece || gameOver || paused) return;
    
    let dropDistance = 0;
    while (movePiece(0, 1)) {
        dropDistance++;
    }
    
    score += dropDistance * 2; // 2 pontos por linha do hard drop
}

/**
 * Sistema de hold (guardar peça)
 */
function holdPiece() {
    if (!canHold || gameOver || paused) return;
    
    const temp = heldPiece;
    heldPiece = currentPiece.type;
    
    if (temp) {
        currentPiece = {
            type: temp,
            x: 3,
            y: 0,
            rotation: 0
        };
    } else {
        spawnNewPiece();
    }
    
    canHold = false;
}

/**
 * Verifica se um movimento é válido
 */
function isValidMove(x, y, rotation) {
    const shape = PIECES[currentPiece.type][rotation];
    
    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
            if (shape[row][col]) {
                const newX = x + col;
                const newY = y + row;
                
                // Verificar limites
                if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) {
                    return false;
                }
                
                // Verificar colisão com peças existentes
                if (newY >= 0 && gameBoard[newY][newX]) {
                    return false;
                }
            }
        }
    }
    
    return true;
}

/**
 * Coloca a peça no tabuleiro
 */
function placePiece() {
    const shape = PIECES[currentPiece.type][currentPiece.rotation];
    
    // Adicionar peça ao tabuleiro
    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
            if (shape[row][col]) {
                const x = currentPiece.x + col;
                const y = currentPiece.y + row;
                
                if (y >= 0) {
                    gameBoard[y][x] = currentPiece.type;
                }
            }
        }
    }
    
    // Verificar linhas completas
    const linesCleared = clearLines();
    
    // Calcular pontuação
    if (linesCleared > 0) {
        const basePoints = [0, 100, 300, 500, 800];
        score += basePoints[linesCleared] * level;
        lines += linesCleared;
        
        // Aumentar nível a cada 10 linhas
        const newLevel = Math.floor(lines / 10) + 1;
        if (newLevel > level) {
            level = newLevel;
            dropInterval = Math.max(50, 1000 - (level - 1) * 100);
        }
        
        if (soundEnabled) {
            playSound('lineCleared');
        }
    }
    
    // Spawn nova peça
    spawnNewPiece();
    
    if (soundEnabled) {
        playSound('piecePlaced');
    }
}

/**
 * Remove linhas completas
 */
function clearLines() {
    let linesCleared = 0;
    
    for (let row = BOARD_HEIGHT - 1; row >= 0; row--) {
        if (gameBoard[row].every(cell => cell !== null)) {
            // Linha completa - remover
            gameBoard.splice(row, 1);
            gameBoard.unshift(new Array(BOARD_WIDTH).fill(null));
            linesCleared++;
            row++; // Verificar a mesma linha novamente
        }
    }
    
    return linesCleared;
}

/**
 * Termina o jogo
 */
function endGame() {
    gameOver = true;
    gameRunning = false;
    
    // Atualizar high score
    if (score > highScore) {
        highScore = score;
        saveHighScore();
    }
    
    document.getElementById('final-score').textContent = score;
    document.getElementById('final-lines').textContent = lines;
    document.getElementById('game-over-overlay').classList.add('show');
    
    updateUI();
    
    if (soundEnabled) {
        playSound('gameOver');
    }
}

/**
 * Pausa/despausa o jogo
 */
function pauseGame() {
    if (gameOver) return;
    
    paused = !paused;
    
    if (paused) {
        document.getElementById('pause-overlay').classList.add('show');
    } else {
        document.getElementById('pause-overlay').classList.remove('show');
    }
}

/**
 * Toggle do som
 */
function toggleSound() {
    soundEnabled = !soundEnabled;
    document.getElementById('sound-status').textContent = soundEnabled ? 'ON' : 'OFF';
}

/**
 * Inicia um novo jogo
 */
function startGame() {
    initializeGame();
}

/**
 * Loop principal do jogo
 */
function gameLoop() {
    if (!gameRunning) return;
    
    const now = Date.now();
    
    if (!paused && !gameOver) {
        // Queda automática das peças
        if (now - dropTimer > dropInterval) {
            movePiece(0, 1);
            dropTimer = now;
        }
    }
    
    // Renderizar
    render();
    
    // Continuar loop
    requestAnimationFrame(gameLoop);
}

/**
 * Renderiza o jogo
 */
function render() {
    // Limpar canvas principal
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Desenhar grid
    drawGrid();
    
    // Desenhar peças colocadas
    drawBoard();
    
    // Desenhar peça fantasma
    if (currentPiece && !gameOver) {
        drawGhostPiece();
    }
    
    // Desenhar peça atual
    if (currentPiece && !gameOver) {
        drawPiece(currentPiece, ctx);
    }
    
    // Desenhar próxima peça
    drawNextPiece();
}

/**
 * Desenha o grid do tabuleiro
 */
function drawGrid() {
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    
    // Linhas verticais
    for (let x = 0; x <= BOARD_WIDTH; x++) {
        ctx.beginPath();
        ctx.moveTo(x * BLOCK_SIZE, 0);
        ctx.lineTo(x * BLOCK_SIZE, canvas.height);
        ctx.stroke();
    }
    
    // Linhas horizontais
    for (let y = 0; y <= BOARD_HEIGHT; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * BLOCK_SIZE);
        ctx.lineTo(canvas.width, y * BLOCK_SIZE);
        ctx.stroke();
    }
}

/**
 * Desenha o tabuleiro com peças colocadas
 */
function drawBoard() {
    for (let row = 0; row < BOARD_HEIGHT; row++) {
        for (let col = 0; col < BOARD_WIDTH; col++) {
            if (gameBoard[row][col]) {
                drawBlock(col * BLOCK_SIZE, row * BLOCK_SIZE, COLORS[gameBoard[row][col]], ctx);
            }
        }
    }
}

/**
 * Desenha a peça fantasma (preview da posição final)
 */
function drawGhostPiece() {
    const ghostPiece = {
        ...currentPiece,
        y: currentPiece.y
    };
    
    // Encontrar posição mais baixa possível
    while (isValidMove(ghostPiece.x, ghostPiece.y + 1, ghostPiece.rotation)) {
        ghostPiece.y++;
    }
    
    // Desenhar só se não estiver na mesma posição da peça atual
    if (ghostPiece.y !== currentPiece.y) {
        drawPiece(ghostPiece, ctx, true);
    }
}

/**
 * Desenha uma peça
 */
function drawPiece(piece, context, isGhost = false) {
    const shape = PIECES[piece.type][piece.rotation];
    const color = isGhost ? COLORS.ghost : COLORS[piece.type];
    
    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
            if (shape[row][col]) {
                const x = (piece.x + col) * BLOCK_SIZE;
                const y = (piece.y + row) * BLOCK_SIZE;
                drawBlock(x, y, color, context);
            }
        }
    }
}

/**
 * Desenha um bloco individual
 */
function drawBlock(x, y, color, context) {
    context.fillStyle = color;
    context.fillRect(x, y, BLOCK_SIZE, BLOCK_SIZE);
    
    // Borda do bloco
    context.strokeStyle = '#fff';
    context.lineWidth = 2;
    context.strokeRect(x + 1, y + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2);
}

/**
 * Desenha a próxima peça
 */
function drawNextPiece() {
    nextCtx.fillStyle = '#222';
    nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);
    
    if (nextPiece) {
        const shape = PIECES[nextPiece][0];
        const blockSize = 15;
        const offsetX = (nextCanvas.width - 4 * blockSize) / 2;
        const offsetY = (nextCanvas.height - 4 * blockSize) / 2;
        
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                if (shape[row][col]) {
                    const x = offsetX + col * blockSize;
                    const y = offsetY + row * blockSize;
                    
                    nextCtx.fillStyle = COLORS[nextPiece];
                    nextCtx.fillRect(x, y, blockSize, blockSize);
                    
                    nextCtx.strokeStyle = '#fff';
                    nextCtx.lineWidth = 1;
                    nextCtx.strokeRect(x, y, blockSize, blockSize);
                }
            }
        }
    }
}

/**
 * Atualiza a interface
 */
function updateUI() {
    document.getElementById('score').textContent = score;
    document.getElementById('level').textContent = level;
    document.getElementById('lines').textContent = lines;
    document.getElementById('high-score').textContent = highScore;
}

/**
 * Sons do jogo (simplificados)
 */
function playSound(type) {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        switch(type) {
            case 'piecePlaced':
                oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
                break;
            case 'lineCleared':
                oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.3);
                break;
            case 'gameOver':
                oscillator.frequency.setValueAtTime(150, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(75, audioContext.currentTime + 1);
                break;
        }
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch(e) {
        // Falha silenciosamente se Web Audio não estiver disponível
    }
}

/**
 * Guarda o high score
 */
function saveHighScore() {
    localStorage.setItem('tetris-high-score', highScore.toString());
}

/**
 * Carrega o high score
 */
function loadHighScore() {
    const saved = localStorage.getItem('tetris-high-score');
    if (saved) {
        highScore = parseInt(saved);
    }
}