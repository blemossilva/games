/**
 * Space Invaders Game Implementation
 * 
 * Jogo clássico de arcade onde o jogador controla uma nave espacial
 * para defender a Terra de uma invasão alienígena.
 * 
 * @author Portal de Jogos
 * @version 1.0.0
 */

// === CONFIGURAÇÃO DO JOGO ===
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

// Configurações do jogador
const PLAYER_WIDTH = 40;
const PLAYER_HEIGHT = 30;
const PLAYER_SPEED = 5;

// Configurações dos invasores
const INVADER_WIDTH = 30;
const INVADER_HEIGHT = 25;
const INVADER_SPEED_BASE = 1;
const INVADER_ROWS = 5;
const INVADER_COLS = 11;
const INVADER_SPACING_X = 50;
const INVADER_SPACING_Y = 50;
const INVADER_START_X = 100;
const INVADER_START_Y = 80;

// Configurações dos projéteis
const BULLET_WIDTH = 4;
const BULLET_HEIGHT = 10;
const BULLET_SPEED = 7;
const ENEMY_BULLET_SPEED = 3;

// Configurações das barreiras
const BARRIER_WIDTH = 80;
const BARRIER_HEIGHT = 60;
const BARRIER_COUNT = 4;

// === ESTADO DO JOGO ===
let canvas, ctx;
let gameState = 'menu'; // 'menu', 'playing', 'paused', 'gameOver', 'levelComplete'
let gameRunning = false;
let animationId;

// Estatísticas do jogo
let score = 0;
let level = 1;
let lives = 3;
let highScore = 0;

// Objetos do jogo
let player = {};
let invaders = [];
let playerBullets = [];
let enemyBullets = [];
let barriers = [];
let particles = [];

// Controles
let keys = {};
let soundEnabled = true;

// Velocidade dos invasores (aumenta com o nível e quando restam poucos)
let invaderSpeed = INVADER_SPEED_BASE;
let invaderDirection = 1; // 1 = direita, -1 = esquerda

// Timers
let lastEnemyShot = 0;
let invaderMoveTimer = 0;

/**
 * Inicializa o jogo quando a página carrega
 */
document.addEventListener('DOMContentLoaded', function() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    // Carrega a melhor pontuação
    loadHighScore();
    updateUI();
    
    // Configura event listeners
    setupEventListeners();
    
    // Inicia o loop de renderização
    gameLoop();
    
    // Inicializa objetos do jogo
    initializeGame();
});

/**
 * Configura todos os event listeners
 */
function setupEventListeners() {
    // Eventos de teclado
    document.addEventListener('keydown', (e) => {
        keys[e.key] = true;
        
        // Disparar com espaço
        if (e.key === ' ' || e.key === 'Spacebar') {
            e.preventDefault();
            shootPlayerBullet();
        }
        
        // Pausa com P ou Escape
        if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
            pauseGame();
        }
    });
    
    document.addEventListener('keyup', (e) => {
        keys[e.key] = false;
    });
    
    // Eventos de mouse/touch para dispositivos móveis
    canvas.addEventListener('click', (e) => {
        if (gameState === 'playing') {
            shootPlayerBullet();
        }
    });
    
    // Eventos de toque para movimento
    let touchStartX = 0;
    
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        touchStartX = e.touches[0].clientX;
    });
    
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (gameState === 'playing') {
            const touchX = e.touches[0].clientX;
            const rect = canvas.getBoundingClientRect();
            const canvasX = (touchX - rect.left) * (canvas.width / rect.width);
            
            // Move o jogador para a posição do toque
            player.x = Math.max(0, Math.min(canvasX - PLAYER_WIDTH/2, CANVAS_WIDTH - PLAYER_WIDTH));
        }
    });
    
    canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        if (gameState === 'playing') {
            shootPlayerBullet();
        }
    });
}

/**
 * Inicializa um novo jogo
 */
function initializeGame() {
    // Reset do estado do jogo
    score = 0;
    level = 1;
    lives = 3;
    gameState = 'playing';
    
    // Inicializa o jogador
    player = {
        x: CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2,
        y: CANVAS_HEIGHT - PLAYER_HEIGHT - 20,
        width: PLAYER_WIDTH,
        height: PLAYER_HEIGHT,
        speed: PLAYER_SPEED
    };
    
    // Limpa arrays
    playerBullets = [];
    enemyBullets = [];
    particles = [];
    
    // Cria invasores
    createInvaders();
    
    // Cria barreiras
    createBarriers();
    
    // Reset da velocidade dos invasores
    invaderSpeed = INVADER_SPEED_BASE + (level - 1) * 0.2;
    invaderDirection = 1;
    
    // Esconde overlays
    document.getElementById('game-over').classList.remove('show');
    document.getElementById('level-complete').classList.remove('show');
    
    updateUI();
}

/**
 * Cria a formação de invasores
 */
function createInvaders() {
    invaders = [];
    
    for (let row = 0; row < INVADER_ROWS; row++) {
        for (let col = 0; col < INVADER_COLS; col++) {
            // Diferentes tipos de invasores por linha
            let type = 'basic';
            let points = 10;
            
            if (row === 0) {
                type = 'commander';
                points = 30;
            } else if (row <= 2) {
                type = 'soldier';
                points = 20;
            }
            
            invaders.push({
                x: INVADER_START_X + col * INVADER_SPACING_X,
                y: INVADER_START_Y + row * INVADER_SPACING_Y,
                width: INVADER_WIDTH,
                height: INVADER_HEIGHT,
                type: type,
                points: points,
                alive: true,
                animFrame: 0
            });
        }
    }
}

/**
 * Cria as barreiras de proteção
 */
function createBarriers() {
    barriers = [];
    const spacing = CANVAS_WIDTH / (BARRIER_COUNT + 1);
    
    for (let i = 0; i < BARRIER_COUNT; i++) {
        const x = spacing * (i + 1) - BARRIER_WIDTH / 2;
        const y = CANVAS_HEIGHT - 200;
        
        // Cada barreira é uma matriz de blocos
        const blocks = [];
        for (let row = 0; row < 6; row++) {
            blocks[row] = [];
            for (let col = 0; col < 8; col++) {
                // Cria forma de barreira (mais densa no centro)
                const centerX = 4;
                const distance = Math.abs(col - centerX);
                const shouldExist = row < 3 || (row < 5 && distance < 3);
                
                blocks[row][col] = shouldExist;
            }
        }
        
        barriers.push({
            x: x,
            y: y,
            width: BARRIER_WIDTH,
            height: BARRIER_HEIGHT,
            blocks: blocks
        });
    }
}

/**
 * Loop principal do jogo
 */
function gameLoop() {
    // Limpa o canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    if (gameState === 'playing') {
        // Atualiza lógica do jogo
        updatePlayer();
        updateInvaders();
        updateBullets();
        updateParticles();
        
        // Verifica colisões
        checkCollisions();
        
        // Verifica condições de fim de jogo
        checkGameConditions();
        
        // IA dos inimigos (tiros)
        enemyAI();
    }
    
    // Renderiza todos os elementos
    render();
    
    // Continua o loop
    animationId = requestAnimationFrame(gameLoop);
}

/**
 * Atualiza a posição e estado do jogador
 */
function updatePlayer() {
    // Movimento horizontal
    if ((keys['ArrowLeft'] || keys['a'] || keys['A']) && player.x > 0) {
        player.x -= player.speed;
    }
    if ((keys['ArrowRight'] || keys['d'] || keys['D']) && player.x < CANVAS_WIDTH - player.width) {
        player.x += player.speed;
    }
}

/**
 * Atualiza a posição e estado dos invasores
 */
function updateInvaders() {
    if (invaders.length === 0) return;
    
    const currentTime = Date.now();
    const moveInterval = Math.max(200 - level * 10, 50); // Fica mais rápido com o nível
    
    if (currentTime - invaderMoveTimer > moveInterval) {
        let shouldMoveDown = false;
        
        // Verifica se algum invasor tocou a borda
        for (let invader of invaders) {
            if (!invader.alive) continue;
            
            if ((invaderDirection > 0 && invader.x + invader.width > CANVAS_WIDTH - 10) ||
                (invaderDirection < 0 && invader.x < 10)) {
                shouldMoveDown = true;
                break;
            }
        }
        
        // Move todos os invasores
        if (shouldMoveDown) {
            // Muda direção e move para baixo
            invaderDirection *= -1;
            for (let invader of invaders) {
                if (invader.alive) {
                    invader.y += 20;
                }
            }
            
            // Aumenta a velocidade quando restam poucos invasores
            const aliveCount = invaders.filter(inv => inv.alive).length;
            if (aliveCount < 10) {
                invaderSpeed = INVADER_SPEED_BASE * 2;
            }
        } else {
            // Move horizontalmente
            for (let invader of invaders) {
                if (invader.alive) {
                    invader.x += invaderDirection * invaderSpeed;
                    invader.animFrame = (invader.animFrame + 1) % 60; // Animação
                }
            }
        }
        
        invaderMoveTimer = currentTime;
    }
}

/**
 * Atualiza todos os projéteis
 */
function updateBullets() {
    // Projéteis do jogador
    playerBullets = playerBullets.filter(bullet => {
        bullet.y -= BULLET_SPEED;
        return bullet.y > -bullet.height;
    });
    
    // Projéteis dos inimigos
    enemyBullets = enemyBullets.filter(bullet => {
        bullet.y += ENEMY_BULLET_SPEED;
        return bullet.y < CANVAS_HEIGHT + bullet.height;
    });
}

/**
 * Atualiza as partículas de explosão
 */
function updateParticles() {
    particles = particles.filter(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life--;
        return particle.life > 0;
    });
}

/**
 * IA dos inimigos para disparar projéteis
 */
function enemyAI() {
    const currentTime = Date.now();
    const shootInterval = Math.max(1000 - level * 50, 300);
    
    if (currentTime - lastEnemyShot > shootInterval) {
        // Escolhe um invasor aleatório da linha da frente para disparar
        const frontInvaders = getFrontInvaders();
        
        if (frontInvaders.length > 0) {
            const shooter = frontInvaders[Math.floor(Math.random() * frontInvaders.length)];
            
            enemyBullets.push({
                x: shooter.x + shooter.width / 2 - BULLET_WIDTH / 2,
                y: shooter.y + shooter.height,
                width: BULLET_WIDTH,
                height: BULLET_HEIGHT
            });
            
            lastEnemyShot = currentTime;
        }
    }
}

/**
 * Obtém os invasores da linha da frente (que podem disparar)
 */
function getFrontInvaders() {
    const columns = {};
    
    // Agrupa invasores por coluna
    invaders.forEach(invader => {
        if (!invader.alive) return;
        
        const col = Math.floor((invader.x - INVADER_START_X) / INVADER_SPACING_X);
        if (!columns[col] || invader.y > columns[col].y) {
            columns[col] = invader;
        }
    });
    
    return Object.values(columns);
}

/**
 * Dispara um projétil do jogador
 */
function shootPlayerBullet() {
    if (gameState !== 'playing') return;
    
    // Limita a quantidade de projéteis simultâneos
    if (playerBullets.length < 3) {
        playerBullets.push({
            x: player.x + player.width / 2 - BULLET_WIDTH / 2,
            y: player.y,
            width: BULLET_WIDTH,
            height: BULLET_HEIGHT
        });
        
        // Som de disparo (simplificado)
        if (soundEnabled) {
            playSound('shoot');
        }
    }
}

/**
 * Verifica todas as colisões do jogo
 */
function checkCollisions() {
    // Projéteis do jogador vs invasores
    for (let i = playerBullets.length - 1; i >= 0; i--) {
        const bullet = playerBullets[i];
        
        for (let j = 0; j < invaders.length; j++) {
            const invader = invaders[j];
            
            if (invader.alive && isColliding(bullet, invader)) {
                // Invasor destruído
                invader.alive = false;
                score += invader.points;
                
                // Remove projétil
                playerBullets.splice(i, 1);
                
                // Cria partículas de explosão
                createExplosion(invader.x + invader.width/2, invader.y + invader.height/2, '#00ff41');
                
                if (soundEnabled) {
                    playSound('invaderKilled');
                }
                
                break;
            }
        }
    }
    
    // Projéteis dos inimigos vs jogador
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
        const bullet = enemyBullets[i];
        
        if (isColliding(bullet, player)) {
            // Jogador atingido
            enemyBullets.splice(i, 1);
            lives--;
            
            // Cria explosão
            createExplosion(player.x + player.width/2, player.y + player.height/2, '#ff0040');
            
            if (soundEnabled) {
                playSound('playerHit');
            }
            
            // Reposiciona jogador
            player.x = CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2;
            
            break;
        }
    }
    
    // Projéteis vs barreiras
    checkBarrierCollisions();
    
    // Invasores vs jogador (colisão direta)
    for (let invader of invaders) {
        if (invader.alive && isColliding(invader, player)) {
            lives = 0; // Game over instantâneo
            break;
        }
    }
}

/**
 * Verifica colisões com as barreiras
 */
function checkBarrierCollisions() {
    // Projéteis do jogador vs barreiras
    for (let i = playerBullets.length - 1; i >= 0; i--) {
        const bullet = playerBullets[i];
        
        for (let barrier of barriers) {
            if (isCollidingWithBarrier(bullet, barrier)) {
                damageBarrier(bullet, barrier);
                playerBullets.splice(i, 1);
                break;
            }
        }
    }
    
    // Projéteis dos inimigos vs barreiras
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
        const bullet = enemyBullets[i];
        
        for (let barrier of barriers) {
            if (isCollidingWithBarrier(bullet, barrier)) {
                damageBarrier(bullet, barrier);
                enemyBullets.splice(i, 1);
                break;
            }
        }
    }
}

/**
 * Verifica colisão entre dois retângulos
 */
function isColliding(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

/**
 * Verifica colisão com barreira
 */
function isCollidingWithBarrier(bullet, barrier) {
    if (!isColliding(bullet, barrier)) return false;
    
    // Verifica colisão em nível de bloco
    const blockWidth = barrier.width / 8;
    const blockHeight = barrier.height / 6;
    
    const startCol = Math.floor((bullet.x - barrier.x) / blockWidth);
    const endCol = Math.ceil((bullet.x + bullet.width - barrier.x) / blockWidth);
    const startRow = Math.floor((bullet.y - barrier.y) / blockHeight);
    const endRow = Math.ceil((bullet.y + bullet.height - barrier.y) / blockHeight);
    
    for (let row = Math.max(0, startRow); row < Math.min(6, endRow); row++) {
        for (let col = Math.max(0, startCol); col < Math.min(8, endCol); col++) {
            if (barrier.blocks[row] && barrier.blocks[row][col]) {
                return true;
            }
        }
    }
    
    return false;
}

/**
 * Danifica a barreira
 */
function damageBarrier(bullet, barrier) {
    const blockWidth = barrier.width / 8;
    const blockHeight = barrier.height / 6;
    
    const col = Math.floor((bullet.x + bullet.width/2 - barrier.x) / blockWidth);
    const row = Math.floor((bullet.y + bullet.height/2 - barrier.y) / blockHeight);
    
    // Destrói o bloco atingido e alguns adjacentes
    for (let r = Math.max(0, row-1); r < Math.min(6, row+2); r++) {
        for (let c = Math.max(0, col-1); c < Math.min(8, col+2); c++) {
            if (barrier.blocks[r] && barrier.blocks[r][c]) {
                barrier.blocks[r][c] = false;
            }
        }
    }
}

/**
 * Cria partículas de explosão
 */
function createExplosion(x, y, color) {
    for (let i = 0; i < 8; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8,
            life: 30,
            color: color
        });
    }
}

/**
 * Verifica condições de fim de jogo e vitória
 */
function checkGameConditions() {
    // Game Over - sem vidas
    if (lives <= 0) {
        gameOver();
        return;
    }
    
    // Game Over - invasores chegaram muito perto
    const lowestInvader = invaders.filter(inv => inv.alive).reduce((lowest, inv) => {
        return inv.y > lowest ? inv.y : lowest;
    }, 0);
    
    if (lowestInvader > CANVAS_HEIGHT - 150) {
        lives = 0;
        gameOver();
        return;
    }
    
    // Nível completo - todos invasores destruídos
    if (invaders.filter(inv => inv.alive).length === 0) {
        levelComplete();
    }
}

/**
 * Finaliza o jogo
 */
function gameOver() {
    gameState = 'gameOver';
    
    // Atualiza high score
    if (score > highScore) {
        highScore = score;
        saveHighScore();
    }
    
    document.getElementById('final-score').textContent = score;
    document.getElementById('game-over').classList.add('show');
    
    if (soundEnabled) {
        playSound('gameOver');
    }
    
    updateUI();
}

/**
 * Completa o nível
 */
function levelComplete() {
    gameState = 'levelComplete';
    
    // Bónus por completar o nível
    const bonus = 1000 * level;
    score += bonus;
    
    document.getElementById('level-complete').classList.add('show');
    
    if (soundEnabled) {
        playSound('levelComplete');
    }
    
    updateUI();
}

/**
 * Avança para o próximo nível
 */
function nextLevel() {
    level++;
    lives++; // Vida extra por nível
    
    document.getElementById('level-complete').classList.remove('show');
    
    // Recria invasores
    createInvaders();
    
    // Aumenta dificuldade
    invaderSpeed = INVADER_SPEED_BASE + (level - 1) * 0.3;
    
    gameState = 'playing';
    updateUI();
}

/**
 * Inicia/reinicia o jogo
 */
function startGame() {
    initializeGame();
    gameState = 'playing';
}

/**
 * Pausa/despausa o jogo
 */
function pauseGame() {
    if (gameState === 'playing') {
        gameState = 'paused';
    } else if (gameState === 'paused') {
        gameState = 'playing';
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
 * Renderiza todos os elementos do jogo
 */
function render() {
    // Fundo estrelado
    drawStars();
    
    if (gameState === 'paused') {
        // Desenha tudo em modo pausa
        renderGame();
        
        // Overlay de pausa
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        
        ctx.fillStyle = '#00ff41';
        ctx.font = 'bold 48px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText('PAUSADO', CANVAS_WIDTH/2, CANVAS_HEIGHT/2);
        ctx.font = 'bold 24px Courier New';
        ctx.fillText('Pressiona P para continuar', CANVAS_WIDTH/2, CANVAS_HEIGHT/2 + 50);
    } else {
        renderGame();
    }
}

/**
 * Renderiza os elementos do jogo
 */
function renderGame() {
    // Jogador
    drawPlayer();
    
    // Invasores
    drawInvaders();
    
    // Projéteis
    drawBullets();
    
    // Barreiras
    drawBarriers();
    
    // Partículas
    drawParticles();
}

/**
 * Desenha o fundo estrelado
 */
function drawStars() {
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 100; i++) {
        const x = (i * 67) % CANVAS_WIDTH;
        const y = (i * 43) % CANVAS_HEIGHT;
        const size = Math.sin(i) > 0.8 ? 2 : 1;
        
        ctx.fillRect(x, y, size, size);
    }
}

/**
 * Desenha o jogador
 */
function drawPlayer() {
    ctx.fillStyle = '#00ff41';
    
    // Corpo da nave
    ctx.fillRect(player.x + 5, player.y + 20, 30, 10);
    
    // Cockpit
    ctx.fillRect(player.x + 15, player.y + 10, 10, 20);
    
    // Asas
    ctx.fillRect(player.x, player.y + 25, 10, 5);
    ctx.fillRect(player.x + 30, player.y + 25, 10, 5);
    
    // Motores (com animação)
    if (Math.floor(Date.now() / 100) % 2) {
        ctx.fillStyle = '#ff4400';
        ctx.fillRect(player.x + 8, player.y + 30, 4, 6);
        ctx.fillRect(player.x + 28, player.y + 30, 4, 6);
    }
}

/**
 * Desenha os invasores
 */
function drawInvaders() {
    invaders.forEach(invader => {
        if (!invader.alive) return;
        
        // Cor baseada no tipo
        let color = '#ff0040';
        if (invader.type === 'commander') color = '#ffff00';
        else if (invader.type === 'soldier') color = '#ff8800';
        
        ctx.fillStyle = color;
        
        // Animação simples (2 frames)
        const frame = Math.floor(invader.animFrame / 30);
        
        if (frame === 0) {
            // Frame 1
            ctx.fillRect(invader.x + 5, invader.y, 20, 15);
            ctx.fillRect(invader.x, invader.y + 10, 30, 10);
            ctx.fillRect(invader.x + 8, invader.y + 15, 4, 5);
            ctx.fillRect(invader.x + 18, invader.y + 15, 4, 5);
        } else {
            // Frame 2 (ligeiramente diferente)
            ctx.fillRect(invader.x + 3, invader.y, 24, 15);
            ctx.fillRect(invader.x, invader.y + 8, 30, 12);
            ctx.fillRect(invader.x + 6, invader.y + 15, 4, 5);
            ctx.fillRect(invader.x + 20, invader.y + 15, 4, 5);
        }
    });
}

/**
 * Desenha todos os projéteis
 */
function drawBullets() {
    // Projéteis do jogador
    ctx.fillStyle = '#00ff41';
    playerBullets.forEach(bullet => {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });
    
    // Projéteis dos inimigos
    ctx.fillStyle = '#ff0040';
    enemyBullets.forEach(bullet => {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });
}

/**
 * Desenha as barreiras
 */
function drawBarriers() {
    ctx.fillStyle = '#00aa00';
    
    barriers.forEach(barrier => {
        const blockWidth = barrier.width / 8;
        const blockHeight = barrier.height / 6;
        
        for (let row = 0; row < 6; row++) {
            for (let col = 0; col < 8; col++) {
                if (barrier.blocks[row] && barrier.blocks[row][col]) {
                    ctx.fillRect(
                        barrier.x + col * blockWidth,
                        barrier.y + row * blockHeight,
                        blockWidth - 1,
                        blockHeight - 1
                    );
                }
            }
        }
    });
}

/**
 * Desenha as partículas
 */
function drawParticles() {
    particles.forEach(particle => {
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = particle.life / 30;
        ctx.fillRect(particle.x, particle.y, 3, 3);
        ctx.globalAlpha = 1;
    });
}

/**
 * Atualiza a interface do utilizador
 */
function updateUI() {
    document.getElementById('score').textContent = score;
    document.getElementById('level').textContent = level;
    document.getElementById('lives').textContent = lives;
    document.getElementById('high-score').textContent = highScore;
}

/**
 * Simula sons do jogo (sem ficheiros de áudio)
 */
function playSound(type) {
    // Implementação básica de som usando Web Audio API
    // Para um jogo completo, aqui carregarias ficheiros de som reais
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        switch(type) {
            case 'shoot':
                oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.1);
                break;
            case 'invaderKilled':
                oscillator.frequency.setValueAtTime(150, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.3);
                break;
            case 'playerHit':
                oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.5);
                break;
        }
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch(e) {
        // Silenciosamente falha se Web Audio não estiver disponível
    }
}

/**
 * Guarda a melhor pontuação
 */
function saveHighScore() {
    localStorage.setItem('space-invaders-high-score', highScore.toString());
}

/**
 * Carrega a melhor pontuação
 */
function loadHighScore() {
    const saved = localStorage.getItem('space-invaders-high-score');
    if (saved) {
        highScore = parseInt(saved);
    }
}