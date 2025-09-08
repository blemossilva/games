/**
 * Adventure Platformer Game Implementation
 * 
 * Jogo de plataforma 2D com:
 * - Física realista de movimento e salto
 * - Múltiplos níveis procedimentais
 * - Inimigos com IA básica
 * - Sistema de coleta de moedas
 * - Armadilhas e obstáculos
 * - Timer e sistema de vidas
 * 
 * @author Portal de Jogos
 * @version 1.0.0
 */

// === CONFIGURAÇÕES DO JOGO ===
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const TILE_SIZE = 40;

// Configurações do jogador
const PLAYER_WIDTH = 32;
const PLAYER_HEIGHT = 32;
const PLAYER_SPEED = 5;
const JUMP_FORCE = -15;
const GRAVITY = 0.8;
const MAX_FALL_SPEED = 12;

// Configurações dos inimigos
const ENEMY_SPEED = 2;
const ENEMY_WIDTH = 30;
const ENEMY_HEIGHT = 30;

// Cores
const COLORS = {
    player: '#4CAF50',
    ground: '#8B4513',
    platform: '#D2691E',
    enemy: '#F44336',
    coin: '#FFD700',
    exit: '#9C27B0',
    spike: '#666666',
    background: '#87CEEB'
};

// === ESTADO DO JOGO ===
let canvas, ctx;
let gameRunning = false;
let gameState = 'playing'; // 'playing', 'levelComplete', 'gameOver'

// Objetos do jogo
let player = {};
let enemies = [];
let coins = [];
let platforms = [];
let spikes = [];
let exit = {};
let particles = [];

// Estatísticas
let currentLevel = 1;
let lives = 3;
let score = 0;
let coinsCollected = 0;
let timeLeft = 60;

// Controles
let keys = {};
let soundEnabled = true;

// Timers
let gameTimer = 0;

// Câmera (para scrolling)
let camera = { x: 0, y: 0 };

// Níveis (templates básicos)
const LEVEL_TEMPLATES = [
    // Nível 1 - Tutorial
    {
        width: 20,
        platforms: [
            {x: 0, y: 14, width: 5, type: 'ground'},
            {x: 7, y: 12, width: 3, type: 'platform'},
            {x: 12, y: 10, width: 3, type: 'platform'},
            {x: 16, y: 8, width: 4, type: 'ground'}
        ],
        enemies: [
            {x: 480, y: 320, type: 'patrol', range: 100}
        ],
        coins: [
            {x: 320, y: 440},
            {x: 520, y: 360},
            {x: 680, y: 280}
        ],
        spikes: [],
        exit: {x: 720, y: 240},
        playerStart: {x: 80, y: 400}
    },
    
    // Nível 2 - Mais desafiante
    {
        width: 25,
        platforms: [
            {x: 0, y: 14, width: 4, type: 'ground'},
            {x: 6, y: 13, width: 2, type: 'platform'},
            {x: 10, y: 11, width: 3, type: 'platform'},
            {x: 15, y: 9, width: 2, type: 'platform'},
            {x: 19, y: 12, width: 3, type: 'platform'},
            {x: 23, y: 10, width: 2, type: 'ground'}
        ],
        enemies: [
            {x: 240, y: 480, type: 'patrol', range: 80},
            {x: 600, y: 320, type: 'patrol', range: 120},
            {x: 800, y: 440, type: 'jump', range: 60}
        ],
        coins: [
            {x: 280, y: 420},
            {x: 440, y: 400},
            {x: 640, y: 320},
            {x: 800, y: 280},
            {x: 920, y: 440}
        ],
        spikes: [
            {x: 480, y: 560},
            {x: 520, y: 560}
        ],
        exit: {x: 920, y: 320},
        playerStart: {x: 80, y: 400}
    },
    
    // Nível 3 - Avançado
    {
        width: 30,
        platforms: [
            {x: 0, y: 14, width: 3, type: 'ground'},
            {x: 5, y: 12, width: 2, type: 'platform'},
            {x: 9, y: 10, width: 1, type: 'platform'},
            {x: 12, y: 8, width: 2, type: 'platform'},
            {x: 16, y: 6, width: 1, type: 'platform'},
            {x: 19, y: 8, width: 2, type: 'platform'},
            {x: 23, y: 11, width: 3, type: 'platform'},
            {x: 27, y: 9, width: 3, type: 'ground'}
        ],
        enemies: [
            {x: 200, y: 440, type: 'patrol', range: 60},
            {x: 400, y: 360, type: 'jump', range: 80},
            {x: 600, y: 200, type: 'patrol', range: 100},
            {x: 920, y: 400, type: 'patrol', range: 120},
            {x: 1080, y: 320, type: 'jump', range: 60}
        ],
        coins: [
            {x: 240, y: 420},
            {x: 360, y: 360},
            {x: 480, y: 280},
            {x: 640, y: 200},
            {x: 760, y: 160},
            {x: 920, y: 240},
            {x: 1080, y: 400}
        ],
        spikes: [
            {x: 320, y: 560},
            {x: 360, y: 560},
            {x: 720, y: 560},
            {x: 760, y: 560},
            {x: 800, y: 560}
        ],
        exit: {x: 1120, y: 280},
        playerStart: {x: 80, y: 400}
    }
];

/**
 * Inicializa o jogo
 */
document.addEventListener('DOMContentLoaded', function() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    // Configurar event listeners
    setupEventListeners();
    
    // Inicializar o primeiro nível
    loadLevel(currentLevel);
    
    // Iniciar game loop
    gameLoop();
});

/**
 * Configura todos os event listeners
 */
function setupEventListeners() {
    // Eventos de teclado
    document.addEventListener('keydown', (e) => {
        keys[e.key] = true;
        handleKeyPress(e.key);
    });
    
    document.addEventListener('keyup', (e) => {
        keys[e.key] = false;
    });

    // Suporte a touch para mobile (controles básicos)
    let touchStartX = 0;
    let touchStartY = 0;
    
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        touchStartX = touch.clientX - rect.left;
        touchStartY = touch.clientY - rect.top;
    });
    
    canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        const touch = e.changedTouches[0];
        const rect = canvas.getBoundingClientRect();
        const touchEndX = touch.clientX - rect.left;
        const touchEndY = touch.clientY - rect.top;
        
        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;
        
        // Determinar controle baseado no toque
        if (Math.abs(deltaY) > Math.abs(deltaX) && deltaY < -50) {
            // Swipe up - jump
            jump();
        } else if (Math.abs(deltaX) > 50) {
            // Swipe left/right - move
            if (deltaX > 0) {
                keys['ArrowRight'] = true;
                setTimeout(() => keys['ArrowRight'] = false, 200);
            } else {
                keys['ArrowLeft'] = true;
                setTimeout(() => keys['ArrowLeft'] = false, 200);
            }
        } else {
            // Tap - jump
            jump();
        }
    });
}

/**
 * Processa teclas pressionadas
 */
function handleKeyPress(key) {
    switch(key) {
        case ' ':
        case 'w':
        case 'W':
        case 'ArrowUp':
            jump();
            break;
    }
}

/**
 * Carrega um nível
 */
function loadLevel(levelNum) {
    // Reset de timers
    timeLeft = 60 + (levelNum * 10); // Mais tempo para níveis mais difíceis
    gameTimer = Date.now();
    
    // Usar template se existir, senão gerar procedimentalmente
    let template;
    if (levelNum <= LEVEL_TEMPLATES.length) {
        template = LEVEL_TEMPLATES[levelNum - 1];
    } else {
        template = generateProceduralLevel(levelNum);
    }
    
    // Carregar jogador
    player = {
        x: template.playerStart.x,
        y: template.playerStart.y,
        width: PLAYER_WIDTH,
        height: PLAYER_HEIGHT,
        velocityX: 0,
        velocityY: 0,
        onGround: false,
        health: 3,
        invulnerable: false,
        invulnerabilityTimer: 0
    };
    
    // Carregar plataformas
    platforms = [];
    template.platforms.forEach(plat => {
        for (let i = 0; i < plat.width; i++) {
            platforms.push({
                x: (plat.x + i) * TILE_SIZE,
                y: plat.y * TILE_SIZE,
                width: TILE_SIZE,
                height: TILE_SIZE,
                type: plat.type
            });
        }
    });
    
    // Carregar inimigos
    enemies = [];
    template.enemies.forEach(enemy => {
        enemies.push({
            x: enemy.x,
            y: enemy.y,
            width: ENEMY_WIDTH,
            height: ENEMY_HEIGHT,
            velocityX: ENEMY_SPEED * (Math.random() > 0.5 ? 1 : -1),
            velocityY: 0,
            type: enemy.type,
            range: enemy.range,
            startX: enemy.x,
            alive: true,
            onGround: false
        });
    });
    
    // Carregar moedas
    coins = [];
    template.coins.forEach(coin => {
        coins.push({
            x: coin.x,
            y: coin.y,
            width: 20,
            height: 20,
            collected: false,
            animation: 0
        });
    });
    
    // Carregar spikes
    spikes = [];
    template.spikes.forEach(spike => {
        spikes.push({
            x: spike.x,
            y: spike.y,
            width: TILE_SIZE,
            height: 20
        });
    });
    
    // Carregar saída
    exit = {
        x: template.exit.x,
        y: template.exit.y,
        width: TILE_SIZE,
        height: TILE_SIZE * 2,
        animation: 0
    };
    
    // Reset da câmera
    camera = { x: 0, y: 0 };
    
    // Reset de partículas
    particles = [];
    
    updateUI();
}

/**
 * Gera um nível procedimentalmente para níveis altos
 */
function generateProceduralLevel(levelNum) {
    const width = 15 + levelNum * 2;
    const platforms = [];
    const enemies = [];
    const coins = [];
    const spikes = [];
    
    // Plataforma inicial
    platforms.push({x: 0, y: 14, width: 3, type: 'ground'});
    
    // Gerar plataformas procedimentalmente
    let currentX = 5;
    let currentY = 12;
    
    for (let i = 0; i < width - 8; i += 3) {
        const platWidth = 1 + Math.floor(Math.random() * 3);
        const yVariation = Math.floor(Math.random() * 6) - 3;
        currentY = Math.max(6, Math.min(13, currentY + yVariation));
        
        platforms.push({
            x: currentX,
            y: currentY,
            width: platWidth,
            type: Math.random() > 0.7 ? 'ground' : 'platform'
        });
        
        // Adicionar inimigos ocasionalmente
        if (Math.random() > 0.6) {
            enemies.push({
                x: currentX * TILE_SIZE + 20,
                y: currentY * TILE_SIZE - 40,
                type: Math.random() > 0.5 ? 'patrol' : 'jump',
                range: 60 + Math.random() * 80
            });
        }
        
        // Adicionar moedas
        if (Math.random() > 0.4) {
            coins.push({
                x: currentX * TILE_SIZE + 20,
                y: currentY * TILE_SIZE - 60
            });
        }
        
        // Adicionar spikes ocasionalmente
        if (Math.random() > 0.8) {
            spikes.push({
                x: currentX * TILE_SIZE,
                y: 560
            });
        }
        
        currentX += platWidth + 2 + Math.floor(Math.random() * 3);
    }
    
    // Plataforma final
    platforms.push({x: width - 3, y: 10, width: 3, type: 'ground'});
    
    return {
        width: width,
        platforms: platforms,
        enemies: enemies,
        coins: coins,
        spikes: spikes,
        exit: {x: (width - 2) * TILE_SIZE, y: 320},
        playerStart: {x: 80, y: 400}
    };
}

/**
 * Função de salto
 */
function jump() {
    if (player.onGround && gameState === 'playing') {
        player.velocityY = JUMP_FORCE;
        player.onGround = false;
        
        if (soundEnabled) {
            playSound('jump');
        }
        
        // Criar partículas de salto
        createJumpParticles(player.x + player.width/2, player.y + player.height);
    }
}

/**
 * Loop principal do jogo
 */
function gameLoop() {
    update();
    render();
    requestAnimationFrame(gameLoop);
}

/**
 * Atualiza a lógica do jogo
 */
function update() {
    if (gameState !== 'playing') return;
    
    // Atualizar timer
    const currentTime = Date.now();
    const deltaTime = (currentTime - gameTimer) / 1000;
    timeLeft = Math.max(0, 60 + (currentLevel * 10) - deltaTime);
    
    if (timeLeft <= 0) {
        loseLife();
        return;
    }
    
    // Atualizar jogador
    updatePlayer();
    
    // Atualizar inimigos
    updateEnemies();
    
    // Atualizar moedas
    updateCoins();
    
    // Atualizar partículas
    updateParticles();
    
    // Atualizar câmera
    updateCamera();
    
    // Verificar colisões
    checkCollisions();
    
    // Atualizar UI
    updateUI();
}

/**
 * Atualiza o jogador
 */
function updatePlayer() {
    // Movimento horizontal
    if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
        player.velocityX = -PLAYER_SPEED;
    } else if (keys['ArrowRight'] || keys['d'] || keys['D']) {
        player.velocityX = PLAYER_SPEED;
    } else {
        player.velocityX *= 0.8; // Friction
    }
    
    // Aplicar gravidade
    if (!player.onGround) {
        player.velocityY += GRAVITY;
        if (player.velocityY > MAX_FALL_SPEED) {
            player.velocityY = MAX_FALL_SPEED;
        }
    }
    
    // Atualizar posição
    player.x += player.velocityX;
    player.y += player.velocityY;
    
    // Verificar colisões com plataformas
    player.onGround = false;
    
    platforms.forEach(platform => {
        if (isColliding(player, platform)) {
            // Colisão superior (jogador caindo)
            if (player.velocityY > 0 && player.y < platform.y) {
                player.y = platform.y - player.height;
                player.velocityY = 0;
                player.onGround = true;
            }
            // Colisões laterais
            else if (player.velocityX > 0 && player.x < platform.x) {
                player.x = platform.x - player.width;
                player.velocityX = 0;
            }
            else if (player.velocityX < 0 && player.x > platform.x) {
                player.x = platform.x + platform.width;
                player.velocityX = 0;
            }
            // Colisão inferior (bater a cabeça)
            else if (player.velocityY < 0 && player.y > platform.y) {
                player.y = platform.y + platform.height;
                player.velocityY = 0;
            }
        }
    });
    
    // Limites do mundo
    if (player.x < 0) player.x = 0;
    if (player.y > CANVAS_HEIGHT) {
        loseLife();
    }
    
    // Atualizar invulnerabilidade
    if (player.invulnerable) {
        player.invulnerabilityTimer--;
        if (player.invulnerabilityTimer <= 0) {
            player.invulnerable = false;
        }
    }
}

/**
 * Atualiza os inimigos
 */
function updateEnemies() {
    enemies.forEach(enemy => {
        if (!enemy.alive) return;
        
        if (enemy.type === 'patrol') {
            // Patrulha entre pontos
            const distanceFromStart = Math.abs(enemy.x - enemy.startX);
            
            if (distanceFromStart >= enemy.range) {
                enemy.velocityX = -enemy.velocityX;
            }
            
            enemy.x += enemy.velocityX;
            
            // Verificar se vai cair de uma plataforma
            const nextX = enemy.x + enemy.velocityX * 2;
            let foundPlatform = false;
            
            platforms.forEach(platform => {
                if (nextX >= platform.x && nextX <= platform.x + platform.width &&
                    enemy.y + enemy.height >= platform.y && enemy.y <= platform.y + platform.height) {
                    foundPlatform = true;
                }
            });
            
            if (!foundPlatform) {
                enemy.velocityX = -enemy.velocityX;
            }
        }
        else if (enemy.type === 'jump') {
            // Inimigo que salta ocasionalmente
            if (Math.random() > 0.995) {
                enemy.velocityY = -10;
            }
        }
        
        // Aplicar gravidade aos inimigos
        if (!enemy.onGround) {
            enemy.velocityY += GRAVITY;
            if (enemy.velocityY > MAX_FALL_SPEED) {
                enemy.velocityY = MAX_FALL_SPEED;
            }
        }
        
        enemy.y += enemy.velocityY;
        
        // Verificar colisões com plataformas
        enemy.onGround = false;
        
        platforms.forEach(platform => {
            if (isColliding(enemy, platform)) {
                if (enemy.velocityY > 0 && enemy.y < platform.y) {
                    enemy.y = platform.y - enemy.height;
                    enemy.velocityY = 0;
                    enemy.onGround = true;
                }
            }
        });
        
        // Remover inimigos que caem
        if (enemy.y > CANVAS_HEIGHT) {
            enemy.alive = false;
        }
    });
}

/**
 * Atualiza as moedas
 */
function updateCoins() {
    coins.forEach(coin => {
        if (!coin.collected) {
            coin.animation += 0.1;
        }
    });
}

/**
 * Atualiza as partículas
 */
function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];
        
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += particle.gravity || 0;
        particle.life--;
        particle.alpha = particle.life / particle.maxLife;
        
        if (particle.life <= 0) {
            particles.splice(i, 1);
        }
    }
}

/**
 * Atualiza a câmera para seguir o jogador
 */
function updateCamera() {
    // Seguir jogador com suavidade
    const targetX = player.x - CANVAS_WIDTH / 2;
    camera.x += (targetX - camera.x) * 0.1;
    
    // Limitar câmera
    if (camera.x < 0) camera.x = 0;
}

/**
 * Verifica colisões
 */
function checkCollisions() {
    // Jogador vs moedas
    coins.forEach(coin => {
        if (!coin.collected && isColliding(player, coin)) {
            coin.collected = true;
            coinsCollected++;
            score += 100;
            
            if (soundEnabled) {
                playSound('coin');
            }
            
            createCoinParticles(coin.x, coin.y);
        }
    });
    
    // Jogador vs inimigos
    if (!player.invulnerable) {
        enemies.forEach(enemy => {
            if (enemy.alive && isColliding(player, enemy)) {
                // Verificar se jogador saltou em cima do inimigo
                if (player.velocityY > 0 && player.y < enemy.y - 10) {
                    // Derrotar inimigo
                    enemy.alive = false;
                    player.velocityY = -8; // Pequeno salto
                    score += 200;
                    
                    if (soundEnabled) {
                        playSound('enemyDefeated');
                    }
                    
                    createExplosionParticles(enemy.x, enemy.y);
                } else {
                    // Jogador levou dano
                    loseLife();
                }
            }
        });
    }
    
    // Jogador vs spikes
    if (!player.invulnerable) {
        spikes.forEach(spike => {
            if (isColliding(player, spike)) {
                loseLife();
            }
        });
    }
    
    // Jogador vs saída
    if (isColliding(player, exit)) {
        levelComplete();
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
 * Jogador perde uma vida
 */
function loseLife() {
    if (player.invulnerable) return;
    
    lives--;
    player.invulnerable = true;
    player.invulnerabilityTimer = 120; // 2 segundos a 60fps
    
    if (soundEnabled) {
        playSound('playerHit');
    }
    
    if (lives <= 0) {
        gameOver();
    } else {
        // Respawn no início do nível
        const template = currentLevel <= LEVEL_TEMPLATES.length ? 
            LEVEL_TEMPLATES[currentLevel - 1] : 
            generateProceduralLevel(currentLevel);
        
        player.x = template.playerStart.x;
        player.y = template.playerStart.y;
        player.velocityX = 0;
        player.velocityY = 0;
    }
}

/**
 * Nível completo
 */
function levelComplete() {
    gameState = 'levelComplete';
    
    // Calcular bónuses
    const timeBonus = Math.floor(timeLeft * 10);
    const levelScore = score;
    score += timeBonus;
    
    document.getElementById('level-score').textContent = levelScore;
    document.getElementById('time-bonus').textContent = timeBonus;
    document.getElementById('total-score').textContent = score;
    document.getElementById('level-complete-screen').classList.add('show');
    
    if (soundEnabled) {
        playSound('levelComplete');
    }
    
    updateUI();
}

/**
 * Próximo nível
 */
function nextLevel() {
    currentLevel++;
    gameState = 'playing';
    
    document.getElementById('level-complete-screen').classList.remove('show');
    
    loadLevel(currentLevel);
}

/**
 * Game over
 */
function gameOver() {
    gameState = 'gameOver';
    
    document.getElementById('final-level').textContent = currentLevel;
    document.getElementById('final-score').textContent = score;
    document.getElementById('game-over-screen').classList.add('show');
    
    if (soundEnabled) {
        playSound('gameOver');
    }
}

/**
 * Reiniciar jogo
 */
function restartGame() {
    currentLevel = 1;
    lives = 3;
    score = 0;
    coinsCollected = 0;
    gameState = 'playing';
    
    document.getElementById('level-complete-screen').classList.remove('show');
    document.getElementById('game-over-screen').classList.remove('show');
    
    loadLevel(currentLevel);
}

/**
 * Toggle som
 */
function toggleSound() {
    soundEnabled = !soundEnabled;
    document.getElementById('sound-status').textContent = soundEnabled ? 'ON' : 'OFF';
}

/**
 * Toggle fullscreen
 */
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        canvas.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
}

/**
 * Cria partículas de salto
 */
function createJumpParticles(x, y) {
    for (let i = 0; i < 5; i++) {
        particles.push({
            x: x + Math.random() * 20 - 10,
            y: y,
            vx: Math.random() * 4 - 2,
            vy: Math.random() * 2 + 1,
            gravity: 0.2,
            life: 30,
            maxLife: 30,
            alpha: 1,
            color: '#666',
            size: 2
        });
    }
}

/**
 * Cria partículas de moeda
 */
function createCoinParticles(x, y) {
    for (let i = 0; i < 8; i++) {
        particles.push({
            x: x,
            y: y,
            vx: Math.random() * 6 - 3,
            vy: -Math.random() * 4 - 2,
            gravity: 0.1,
            life: 40,
            maxLife: 40,
            alpha: 1,
            color: '#FFD700',
            size: 3
        });
    }
}

/**
 * Cria partículas de explosão
 */
function createExplosionParticles(x, y) {
    for (let i = 0; i < 10; i++) {
        particles.push({
            x: x,
            y: y,
            vx: Math.random() * 8 - 4,
            vy: -Math.random() * 6 - 2,
            gravity: 0.3,
            life: 30,
            maxLife: 30,
            alpha: 1,
            color: '#FF6B6B',
            size: 4
        });
    }
}

/**
 * Renderiza o jogo
 */
function render() {
    // Limpar canvas
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Salvar contexto para câmera
    ctx.save();
    ctx.translate(-camera.x, -camera.y);
    
    // Desenhar plataformas
    drawPlatforms();
    
    // Desenhar spikes
    drawSpikes();
    
    // Desenhar moedas
    drawCoins();
    
    // Desenhar saída
    drawExit();
    
    // Desenhar inimigos
    drawEnemies();
    
    // Desenhar jogador
    drawPlayer();
    
    // Desenhar partículas
    drawParticles();
    
    // Restaurar contexto
    ctx.restore();
}

/**
 * Desenha as plataformas
 */
function drawPlatforms() {
    platforms.forEach(platform => {
        ctx.fillStyle = platform.type === 'ground' ? COLORS.ground : COLORS.platform;
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        
        // Borda
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 2;
        ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);
    });
}

/**
 * Desenha os spikes
 */
function drawSpikes() {
    spikes.forEach(spike => {
        ctx.fillStyle = COLORS.spike;
        
        // Desenhar triângulos como spikes
        ctx.beginPath();
        for (let i = 0; i < spike.width; i += 10) {
            ctx.moveTo(spike.x + i, spike.y + spike.height);
            ctx.lineTo(spike.x + i + 5, spike.y);
            ctx.lineTo(spike.x + i + 10, spike.y + spike.height);
        }
        ctx.fill();
    });
}

/**
 * Desenha as moedas
 */
function drawCoins() {
    coins.forEach(coin => {
        if (coin.collected) return;
        
        ctx.fillStyle = COLORS.coin;
        
        // Animação de rotação
        const size = 15 + Math.sin(coin.animation) * 3;
        ctx.beginPath();
        ctx.arc(coin.x + 10, coin.y + 10, size, 0, Math.PI * 2);
        ctx.fill();
        
        // Brilho
        ctx.fillStyle = '#FFF8DC';
        ctx.beginPath();
        ctx.arc(coin.x + 7, coin.y + 7, 4, 0, Math.PI * 2);
        ctx.fill();
    });
}

/**
 * Desenha a saída
 */
function drawExit() {
    exit.animation += 0.05;
    
    // Porta mágica com efeito
    const glow = Math.sin(exit.animation) * 0.3 + 0.7;
    ctx.fillStyle = COLORS.exit;
    ctx.globalAlpha = glow;
    ctx.fillRect(exit.x, exit.y, exit.width, exit.height);
    ctx.globalAlpha = 1;
    
    // Detalhes da porta
    ctx.fillStyle = '#7B1FA2';
    ctx.fillRect(exit.x + 5, exit.y + 10, exit.width - 10, exit.height - 20);
    ctx.fillRect(exit.x + 10, exit.y + 20, 5, 10);
}

/**
 * Desenha os inimigos
 */
function drawEnemies() {
    enemies.forEach(enemy => {
        if (!enemy.alive) return;
        
        ctx.fillStyle = COLORS.enemy;
        
        // Corpo do inimigo
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        
        // Olhos
        ctx.fillStyle = '#FFF';
        ctx.fillRect(enemy.x + 5, enemy.y + 5, 6, 6);
        ctx.fillRect(enemy.x + 15, enemy.y + 5, 6, 6);
        
        ctx.fillStyle = '#000';
        ctx.fillRect(enemy.x + 7, enemy.y + 7, 2, 2);
        ctx.fillRect(enemy.x + 17, enemy.y + 7, 2, 2);
        
        // Indicador de tipo
        if (enemy.type === 'jump') {
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(enemy.x + 10, enemy.y - 5, 10, 3);
        }
    });
}

/**
 * Desenha o jogador
 */
function drawPlayer() {
    // Efeito de invulnerabilidade
    if (player.invulnerable && Math.floor(player.invulnerabilityTimer / 5) % 2) {
        ctx.globalAlpha = 0.5;
    }
    
    ctx.fillStyle = COLORS.player;
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // Detalhes do jogador
    ctx.fillStyle = '#2E7D32';
    ctx.fillRect(player.x + 8, player.y + 5, 16, 20);
    
    // Olhos
    ctx.fillStyle = '#FFF';
    ctx.fillRect(player.x + 6, player.y + 8, 4, 4);
    ctx.fillRect(player.x + 22, player.y + 8, 4, 4);
    
    ctx.fillStyle = '#000';
    ctx.fillRect(player.x + 7, player.y + 9, 2, 2);
    ctx.fillRect(player.x + 23, player.y + 9, 2, 2);
    
    ctx.globalAlpha = 1;
}

/**
 * Desenha as partículas
 */
function drawParticles() {
    particles.forEach(particle => {
        ctx.globalAlpha = particle.alpha;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.globalAlpha = 1;
}

/**
 * Atualiza a interface
 */
function updateUI() {
    document.getElementById('current-level').textContent = currentLevel;
    document.getElementById('lives').textContent = lives;
    document.getElementById('score').textContent = score;
    document.getElementById('coins').textContent = coinsCollected;
    document.getElementById('time').textContent = Math.ceil(timeLeft);
}

/**
 * Sons do jogo
 */
function playSound(type) {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        switch(type) {
            case 'jump':
                oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.1);
                break;
            case 'coin':
                oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.2);
                break;
            case 'enemyDefeated':
                oscillator.frequency.setValueAtTime(150, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.3);
                break;
            case 'playerHit':
                oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.5);
                break;
            case 'levelComplete':
                oscillator.frequency.setValueAtTime(500, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.5);
                break;
            case 'gameOver':
                oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 1);
                break;
        }
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch(e) {
        // Falha silenciosamente se Web Audio não disponível
    }
}