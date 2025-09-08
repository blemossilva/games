/**
 * 2048 Game Implementation
 * 
 * Um jogo de puzzle onde o objetivo é combinar números para chegar ao 2048.
 * Implementado usando JavaScript vanilla seguindo as melhores práticas.
 * 
 * @author Portal de Jogos
 * @version 1.0.0
 */

// === CONFIGURAÇÃO DO JOGO ===
const GRID_SIZE = 4; // Tamanho da grelha (4x4)
const TILE_SIZE = 70; // Tamanho de cada peça em pixels
const TILE_MARGIN = 82; // Margem entre peças em pixels

// === ESTADO DO JOGO ===
let gameGrid = []; // Grelha principal do jogo (4x4)
let previousGrid = []; // Estado anterior para função desfazer
let score = 0; // Pontuação atual
let bestScore = 0; // Melhor pontuação
let gameWon = false; // Flag para verificar se o jogador ganhou
let gameContinuing = false; // Flag para continuar após ganhar

// === ELEMENTOS DOM ===
const scoreElement = document.getElementById('score');
const bestScoreElement = document.getElementById('best-score');
const gameOverElement = document.getElementById('game-over');
const gameWonElement = document.getElementById('game-won');
const gridContainer = document.querySelector('.grid-container');

/**
 * Inicializa o jogo quando a página carrega
 */
document.addEventListener('DOMContentLoaded', function() {
    loadBestScore();
    initializeGame();
    setupEventListeners();
});

/**
 * Configura os event listeners para controles do jogo
 */
function setupEventListeners() {
    // Controles de teclado
    document.addEventListener('keydown', handleKeyPress);
    
    // Controles de toque para dispositivos móveis
    let startX, startY;
    
    gridContainer.addEventListener('touchstart', function(e) {
        e.preventDefault();
        const touch = e.touches[0];
        startX = touch.clientX;
        startY = touch.clientY;
    });
    
    gridContainer.addEventListener('touchend', function(e) {
        e.preventDefault();
        if (!startX || !startY) return;
        
        const touch = e.changedTouches[0];
        const deltaX = touch.clientX - startX;
        const deltaY = touch.clientY - startY;
        
        // Determina a direção do swipe baseado na maior diferença
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            if (deltaX > 30) {
                makeMove('right');
            } else if (deltaX < -30) {
                makeMove('left');
            }
        } else {
            if (deltaY > 30) {
                makeMove('down');
            } else if (deltaY < -30) {
                makeMove('up');
            }
        }
        
        startX = null;
        startY = null;
    });
}

/**
 * Processa as teclas pressionadas
 * @param {KeyboardEvent} event - Evento de tecla
 */
function handleKeyPress(event) {
    switch(event.key) {
        case 'ArrowUp':
            event.preventDefault();
            makeMove('up');
            break;
        case 'ArrowDown':
            event.preventDefault();
            makeMove('down');
            break;
        case 'ArrowLeft':
            event.preventDefault();
            makeMove('left');
            break;
        case 'ArrowRight':
            event.preventDefault();
            makeMove('right');
            break;
    }
}

/**
 * Inicializa um novo jogo
 */
function initializeGame() {
    // Cria uma grelha vazia
    gameGrid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0));
    previousGrid = [];
    score = 0;
    gameWon = false;
    gameContinuing = false;
    
    // Esconde overlays
    gameOverElement.classList.remove('show');
    gameWonElement.classList.remove('show');
    
    // Adiciona duas peças iniciais
    addRandomTile();
    addRandomTile();
    
    // Atualiza a interface
    updateDisplay();
}

/**
 * Adiciona uma nova peça aleatória na grelha
 * 90% chance de ser 2, 10% chance de ser 4
 */
function addRandomTile() {
    const emptyCells = [];
    
    // Encontra todas as células vazias
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            if (gameGrid[row][col] === 0) {
                emptyCells.push({ row, col });
            }
        }
    }
    
    // Se não há células vazias, não adiciona nada
    if (emptyCells.length === 0) return false;
    
    // Escolhe uma célula vazia aleatória
    const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    
    // 90% chance de 2, 10% chance de 4
    const value = Math.random() < 0.9 ? 2 : 4;
    gameGrid[randomCell.row][randomCell.col] = value;
    
    return true;
}

/**
 * Executa um movimento na direção especificada
 * @param {string} direction - Direção do movimento ('up', 'down', 'left', 'right')
 */
function makeMove(direction) {
    // Guarda o estado anterior para a função desfazer
    previousGrid = gameGrid.map(row => [...row]);
    const previousScore = score;
    
    let moved = false;
    
    switch(direction) {
        case 'left':
            moved = moveLeft();
            break;
        case 'right':
            moved = moveRight();
            break;
        case 'up':
            moved = moveUp();
            break;
        case 'down':
            moved = moveDown();
            break;
    }
    
    // Se houve movimento, adiciona nova peça
    if (moved) {
        addRandomTile();
        updateDisplay();
        
        // Verifica condições de fim de jogo
        if (checkWin() && !gameContinuing) {
            showGameWon();
        } else if (isGameOver()) {
            showGameOver();
        }
    }
}

/**
 * Move todas as peças para a esquerda
 * @returns {boolean} true se houve movimento
 */
function moveLeft() {
    let moved = false;
    
    for (let row = 0; row < GRID_SIZE; row++) {
        const newRow = slideAndMergeRow(gameGrid[row]);
        if (!arraysEqual(gameGrid[row], newRow)) {
            moved = true;
            gameGrid[row] = newRow;
        }
    }
    
    return moved;
}

/**
 * Move todas as peças para a direita
 * @returns {boolean} true se houve movimento
 */
function moveRight() {
    let moved = false;
    
    for (let row = 0; row < GRID_SIZE; row++) {
        const reversedRow = [...gameGrid[row]].reverse();
        const newRow = slideAndMergeRow(reversedRow).reverse();
        if (!arraysEqual(gameGrid[row], newRow)) {
            moved = true;
            gameGrid[row] = newRow;
        }
    }
    
    return moved;
}

/**
 * Move todas as peças para cima
 * @returns {boolean} true se houve movimento
 */
function moveUp() {
    let moved = false;
    
    for (let col = 0; col < GRID_SIZE; col++) {
        const column = [];
        for (let row = 0; row < GRID_SIZE; row++) {
            column.push(gameGrid[row][col]);
        }
        
        const newColumn = slideAndMergeRow(column);
        
        for (let row = 0; row < GRID_SIZE; row++) {
            if (gameGrid[row][col] !== newColumn[row]) {
                moved = true;
                gameGrid[row][col] = newColumn[row];
            }
        }
    }
    
    return moved;
}

/**
 * Move todas as peças para baixo
 * @returns {boolean} true se houve movimento
 */
function moveDown() {
    let moved = false;
    
    for (let col = 0; col < GRID_SIZE; col++) {
        const column = [];
        for (let row = 0; row < GRID_SIZE; row++) {
            column.push(gameGrid[row][col]);
        }
        
        const reversedColumn = [...column].reverse();
        const newColumn = slideAndMergeRow(reversedColumn).reverse();
        
        for (let row = 0; row < GRID_SIZE; row++) {
            if (gameGrid[row][col] !== newColumn[row]) {
                moved = true;
                gameGrid[row][col] = newColumn[row];
            }
        }
    }
    
    return moved;
}

/**
 * Desliza e junta uma linha/coluna
 * @param {Array} arr - Array representando uma linha ou coluna
 * @returns {Array} Nova linha/coluna após o movimento
 */
function slideAndMergeRow(arr) {
    // Remove zeros e cria array filtrado
    const filtered = arr.filter(val => val !== 0);
    
    // Junta peças adjacentes iguais
    const merged = [];
    let i = 0;
    
    while (i < filtered.length) {
        if (i < filtered.length - 1 && filtered[i] === filtered[i + 1]) {
            // Junta duas peças iguais
            const newValue = filtered[i] * 2;
            merged.push(newValue);
            score += newValue; // Adiciona pontos
            i += 2; // Pula as duas peças que foram juntadas
        } else {
            // Mantém a peça como está
            merged.push(filtered[i]);
            i++;
        }
    }
    
    // Preenche com zeros à direita
    while (merged.length < GRID_SIZE) {
        merged.push(0);
    }
    
    return merged;
}

/**
 * Verifica se o jogador ganhou (chegou ao 2048)
 * @returns {boolean} true se ganhou
 */
function checkWin() {
    if (gameWon) return false; // Já ganhou antes
    
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            if (gameGrid[row][col] === 2048) {
                gameWon = true;
                return true;
            }
        }
    }
    
    return false;
}

/**
 * Verifica se o jogo acabou (sem movimentos possíveis)
 * @returns {boolean} true se o jogo acabou
 */
function isGameOver() {
    // Verifica se há células vazias
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            if (gameGrid[row][col] === 0) {
                return false; // Ainda há espaços vazios
            }
        }
    }
    
    // Verifica se há movimentos possíveis (peças adjacentes iguais)
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            const current = gameGrid[row][col];
            
            // Verifica célula à direita
            if (col < GRID_SIZE - 1 && gameGrid[row][col + 1] === current) {
                return false;
            }
            
            // Verifica célula abaixo
            if (row < GRID_SIZE - 1 && gameGrid[row + 1][col] === current) {
                return false;
            }
        }
    }
    
    return true; // Sem movimentos possíveis
}

/**
 * Atualiza a interface do jogo
 */
function updateDisplay() {
    // Atualiza pontuação
    scoreElement.textContent = score;
    
    // Atualiza melhor pontuação
    if (score > bestScore) {
        bestScore = score;
        saveBestScore();
    }
    bestScoreElement.textContent = bestScore;
    
    // Remove todas as peças existentes
    const existingTiles = gridContainer.querySelectorAll('.tile');
    existingTiles.forEach(tile => tile.remove());
    
    // Cria novas peças
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            const value = gameGrid[row][col];
            if (value !== 0) {
                createTileElement(row, col, value);
            }
        }
    }
}

/**
 * Cria um elemento visual para uma peça
 * @param {number} row - Linha da peça
 * @param {number} col - Coluna da peça
 * @param {number} value - Valor da peça
 */
function createTileElement(row, col, value) {
    const tile = document.createElement('div');
    tile.classList.add('tile');
    
    // Adiciona classe específica para o valor
    if (value <= 2048) {
        tile.classList.add(`tile-${value}`);
    } else {
        tile.classList.add('tile-super');
    }
    
    // Define posição
    tile.style.left = (col * TILE_MARGIN + 10) + 'px';
    tile.style.top = (row * TILE_MARGIN + 10) + 'px';
    
    // Define texto
    tile.textContent = value;
    
    // Adiciona ao container
    gridContainer.appendChild(tile);
}

/**
 * Mostra a mensagem de vitória
 */
function showGameWon() {
    gameWonElement.classList.add('show');
}

/**
 * Mostra a mensagem de fim de jogo
 */
function showGameOver() {
    gameOverElement.classList.add('show');
}

/**
 * Continua o jogo após ganhar
 */
function continueGame() {
    gameContinuing = true;
    gameWonElement.classList.remove('show');
}

/**
 * Inicia um novo jogo
 */
function newGame() {
    initializeGame();
}

/**
 * Desfaz o último movimento
 */
function undo() {
    if (previousGrid.length > 0) {
        gameGrid = previousGrid.map(row => [...row]);
        previousGrid = [];
        updateDisplay();
    }
}

/**
 * Guarda a melhor pontuação no localStorage
 */
function saveBestScore() {
    localStorage.setItem('2048-best-score', bestScore.toString());
}

/**
 * Carrega a melhor pontuação do localStorage
 */
function loadBestScore() {
    const saved = localStorage.getItem('2048-best-score');
    if (saved) {
        bestScore = parseInt(saved);
    }
}

/**
 * Utilitário: Verifica se dois arrays são iguais
 * @param {Array} arr1 - Primeiro array
 * @param {Array} arr2 - Segundo array
 * @returns {boolean} true se são iguais
 */
function arraysEqual(arr1, arr2) {
    return arr1.length === arr2.length && arr1.every((val, i) => val === arr2[i]);
}