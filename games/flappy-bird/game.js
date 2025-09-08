/**
 * Flappy Bird Game Implementation
 * 
 * Recreação do famoso jogo mobile Flappy Bird com:
 * - Física realista de voo
 * - Canos proceduralmente gerados
 * - Sistema de pontuação
 * - Parallax scrolling background
 * - Particle effects
 * 
 * @author Portal de Jogos
 * @version 1.0.0
 */

// === CONFIGURAÇÕES DO JOGO ===
const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 600;

// Configurações do pássaro
const BIRD_WIDTH = 34;
const BIRD_HEIGHT = 24;
const BIRD_X = 80;
const GRAVITY = 0.6;
const JUMP_FORCE = -12;
const MAX_FALL_SPEED = 10;

// Configurações dos canos
const PIPE_WIDTH = 60;
const PIPE_GAP = 150;
const PIPE_SPEED = 2;
const PIPE_SPAWN_RATE = 90; // frames between pipes

// Configurações do cenário
const GROUND_HEIGHT = 100;
const GROUND_SPEED = 1;

// === ESTADO DO JOGO ===
let canvas, ctx;
let gameState = 'start'; // 'start', 'playing', 'gameOver'
let gameRunning = false;

// Objetos do jogo
let bird = {};
let pipes = [];
let particles = [];
let clouds = [];

// Estatísticas
let score = 0;
let bestScore = 0;
let frameCount = 0;

// Controles
let soundEnabled = true;

// Background elements
let groundOffset = 0;
let backgroundElements = {
    mountains: [],
    trees: []
};

/**
 * Inicializa o jogo
 */
document.addEventListener('DOMContentLoaded', function() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    // Carrega melhor pontuação
    loadBestScore();
    updateUI();
    
    // Configura event listeners
    setupEventListeners();
    
    // Inicializa elementos do cenário
    initializeBackground();
    
    // Inicia o loop do jogo
    gameLoop();
});

/**
 * Configura todos os event listeners
 */
function setupEventListeners() {
    // Eventos de teclado
    document.addEventListener('keydown', (e) => {
        if (e.key === ' ' || e.key === 'Spacebar') {
            e.preventDefault();
            handleFlap();
        }
    });
    
    // Eventos de mouse
    canvas.addEventListener('click', (e) => {
        e.preventDefault();
        handleFlap();
    });
    
    // Eventos de toque
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        handleFlap();
    });
}

/**
 * Processa o input do jogador (bater asas)
 */
function handleFlap() {
    if (gameState === 'start') {
        startGame();
    } else if (gameState === 'playing') {
        bird.velocity = JUMP_FORCE;
        bird.flapping = true;
        
        // Adiciona partículas de "bater asas"
        createFlapParticles();
        
        if (soundEnabled) {
            playSound('flap');
        }
    } else if (gameState === 'gameOver') {
        startGame();
    }
}

/**
 * Inicializa elementos do background
 */
function initializeBackground() {
    // Montanhas no fundo
    for (let i = 0; i < 5; i++) {
        backgroundElements.mountains.push({
            x: i * 150 - 100,
            height: 100 + Math.random() * 80,
            color: `hsl(${200 + Math.random() * 30}, 30%, ${40 + Math.random() * 20}%)`
        });
    }
    
    // Árvores
    for (let i = 0; i < 8; i++) {
        backgroundElements.trees.push({
            x: i * 80 + Math.random() * 40,
            height: 60 + Math.random() * 40,
            type: Math.floor(Math.random() * 3)
        });
    }
    
    // Nuvens
    for (let i = 0; i < 6; i++) {
        clouds.push({
            x: Math.random() * CANVAS_WIDTH * 2,
            y: 50 + Math.random() * 150,
            size: 30 + Math.random() * 40,
            speed: 0.2 + Math.random() * 0.3,
            opacity: 0.6 + Math.random() * 0.3
        });
    }
}

/**
 * Inicia um novo jogo
 */
function startGame() {
    // Reset do pássaro
    bird = {
        x: BIRD_X,
        y: CANVAS_HEIGHT / 2,
        velocity: 0,
        flapping: false,
        rotation: 0
    };
    
    // Reset dos arrays
    pipes = [];
    particles = [];
    
    // Reset das variáveis
    score = 0;
    frameCount = 0;
    gameState = 'playing';
    gameRunning = true;
    groundOffset = 0;
    
    // Esconde telas
    document.getElementById('start-screen').classList.add('hide');
    document.getElementById('game-over-screen').classList.remove('show');
    
    updateUI();
}

/**
 * Termina o jogo
 */
function gameOver() {
    gameState = 'gameOver';
    gameRunning = false;
    
    // Atualiza melhor pontuação
    let newRecord = false;
    if (score > bestScore) {
        bestScore = score;
        saveBestScore();
        newRecord = true;
    }
    
    // Cria explosão de partículas
    createExplosionParticles(bird.x, bird.y);
    
    // Atualiza UI
    document.getElementById('final-score').textContent = score;
    
    // Mostra medalha baseada na pontuação
    const medalElement = document.getElementById('medal');
    if (score >= 50) {
        medalElement.textContent = '🥇'; // Ouro
    } else if (score >= 25) {
        medalElement.textContent = '🥈'; // Prata
    } else if (score >= 10) {
        medalElement.textContent = '🥉'; // Bronze
    } else {
        medalElement.textContent = ''; // Sem medalha
    }
    
    // Mostra novo recorde
    if (newRecord) {
        document.getElementById('new-record').style.display = 'block';
    } else {
        document.getElementById('new-record').style.display = 'none';
    }
    
    document.getElementById('game-over-screen').classList.add('show');
    
    updateUI();
    
    if (soundEnabled) {
        playSound('gameOver');
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
    
    frameCount++;
    
    // Atualizar pássaro
    updateBird();
    
    // Atualizar canos
    updatePipes();
    
    // Atualizar partículas
    updateParticles();
    
    // Atualizar background
    updateBackground();
    
    // Verificar colisões
    checkCollisions();
    
    // Spawn novos canos
    if (frameCount % PIPE_SPAWN_RATE === 0) {
        spawnPipe();
    }
}

/**
 * Atualiza o pássaro
 */
function updateBird() {
    // Aplicar gravidade
    bird.velocity += GRAVITY;
    
    // Limitar velocidade de queda
    if (bird.velocity > MAX_FALL_SPEED) {
        bird.velocity = MAX_FALL_SPEED;
    }
    
    // Atualizar posição
    bird.y += bird.velocity;
    
    // Calcular rotação baseada na velocidade
    bird.rotation = Math.max(-30, Math.min(90, bird.velocity * 3));
    
    // Reset do flapping
    if (bird.flapping) {
        bird.flapping = false;
    }
    
    // Verificar se caiu no chão
    if (bird.y + BIRD_HEIGHT > CANVAS_HEIGHT - GROUND_HEIGHT) {
        bird.y = CANVAS_HEIGHT - GROUND_HEIGHT - BIRD_HEIGHT;
        gameOver();
    }
    
    // Verificar se saiu pelo topo
    if (bird.y < 0) {
        bird.y = 0;
        bird.velocity = 0;
    }
}

/**
 * Atualiza os canos
 */
function updatePipes() {
    // Mover canos existentes
    for (let i = pipes.length - 1; i >= 0; i--) {
        const pipe = pipes[i];
        pipe.x -= PIPE_SPEED;
        
        // Verificar pontuação (cano passou pelo pássaro)
        if (!pipe.scored && pipe.x + PIPE_WIDTH < bird.x) {
            pipe.scored = true;
            score++;
            
            if (soundEnabled) {
                playSound('score');
            }
            
            // Criar partículas de pontuação
            createScoreParticles(pipe.x + PIPE_WIDTH, pipe.gapY + PIPE_GAP / 2);
        }
        
        // Remover canos que saíram da tela
        if (pipe.x + PIPE_WIDTH < 0) {
            pipes.splice(i, 1);
        }
    }
}

/**
 * Spawn um novo cano
 */
function spawnPipe() {
    const minGapY = 100;
    const maxGapY = CANVAS_HEIGHT - GROUND_HEIGHT - PIPE_GAP - 100;
    const gapY = minGapY + Math.random() * (maxGapY - minGapY);
    
    pipes.push({
        x: CANVAS_WIDTH,
        gapY: gapY,
        scored: false
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
 * Atualiza elementos do background
 */
function updateBackground() {
    // Mover o chão
    groundOffset = (groundOffset + GROUND_SPEED) % 50;
    
    // Mover nuvens
    clouds.forEach(cloud => {
        cloud.x -= cloud.speed;
        if (cloud.x + cloud.size < 0) {
            cloud.x = CANVAS_WIDTH + Math.random() * 100;
            cloud.y = 50 + Math.random() * 150;
        }
    });
}

/**
 * Verifica colisões
 */
function checkCollisions() {
    // Colisões com canos
    pipes.forEach(pipe => {
        // Bounding box collision
        if (bird.x < pipe.x + PIPE_WIDTH && 
            bird.x + BIRD_WIDTH > pipe.x) {
            
            // Verificar colisão com cano superior ou inferior
            if (bird.y < pipe.gapY || 
                bird.y + BIRD_HEIGHT > pipe.gapY + PIPE_GAP) {
                gameOver();
            }
        }
    });
}

/**
 * Cria partículas do bater de asas
 */
function createFlapParticles() {
    for (let i = 0; i < 5; i++) {
        particles.push({
            x: bird.x - 5,
            y: bird.y + BIRD_HEIGHT / 2 + Math.random() * 10 - 5,
            vx: -2 - Math.random() * 2,
            vy: Math.random() * 4 - 2,
            life: 20,
            maxLife: 20,
            alpha: 1,
            color: `hsl(${60 + Math.random() * 60}, 70%, 70%)`,
            size: 2 + Math.random() * 2
        });
    }
}

/**
 * Cria partículas de pontuação
 */
function createScoreParticles(x, y) {
    for (let i = 0; i < 8; i++) {
        particles.push({
            x: x,
            y: y,
            vx: Math.random() * 4 - 2,
            vy: -2 - Math.random() * 3,
            gravity: 0.1,
            life: 40,
            maxLife: 40,
            alpha: 1,
            color: '#ffeb3b',
            size: 3 + Math.random() * 2
        });
    }
}

/**
 * Cria partículas de explosão
 */
function createExplosionParticles(x, y) {
    for (let i = 0; i < 15; i++) {
        const angle = (Math.PI * 2 * i) / 15;
        const speed = 3 + Math.random() * 4;
        
        particles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            gravity: 0.2,
            life: 60,
            maxLife: 60,
            alpha: 1,
            color: '#ff6b6b',
            size: 3 + Math.random() * 3
        });
    }
}

/**
 * Renderiza o jogo
 */
function render() {
    // Limpar canvas
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Desenhar background
    drawBackground();
    
    if (gameState === 'playing' || gameState === 'gameOver') {
        // Desenhar canos
        drawPipes();
        
        // Desenhar pássaro
        drawBird();
        
        // Desenhar partículas
        drawParticles();
    }
    
    // Desenhar chão
    drawGround();
    
    // Desenhar pontuação durante o jogo
    if (gameState === 'playing') {
        drawScore();
    }
}

/**
 * Desenha o background
 */
function drawBackground() {
    // Gradiente do céu
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT - GROUND_HEIGHT);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#98FB98');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_HEIGHT);
    
    // Nuvens
    clouds.forEach(cloud => {
        ctx.globalAlpha = cloud.opacity;
        ctx.fillStyle = '#ffffff';
        
        // Desenhar nuvem simples (3 círculos)
        ctx.beginPath();
        ctx.arc(cloud.x, cloud.y, cloud.size * 0.5, 0, Math.PI * 2);
        ctx.arc(cloud.x + cloud.size * 0.3, cloud.y, cloud.size * 0.6, 0, Math.PI * 2);
        ctx.arc(cloud.x + cloud.size * 0.6, cloud.y, cloud.size * 0.4, 0, Math.PI * 2);
        ctx.fill();
    });
    
    ctx.globalAlpha = 1;
    
    // Montanhas distantes
    backgroundElements.mountains.forEach(mountain => {
        ctx.fillStyle = mountain.color;
        ctx.beginPath();
        ctx.moveTo(mountain.x - 50, CANVAS_HEIGHT - GROUND_HEIGHT);
        ctx.lineTo(mountain.x, CANVAS_HEIGHT - GROUND_HEIGHT - mountain.height);
        ctx.lineTo(mountain.x + 50, CANVAS_HEIGHT - GROUND_HEIGHT);
        ctx.fill();
    });
}

/**
 * Desenha o pássaro
 */
function drawBird() {
    ctx.save();
    
    // Mover para a posição do pássaro
    ctx.translate(bird.x + BIRD_WIDTH / 2, bird.y + BIRD_HEIGHT / 2);
    
    // Rotacionar baseado na velocidade
    ctx.rotate(bird.rotation * Math.PI / 180);
    
    // Desenhar corpo do pássaro
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.ellipse(0, 0, BIRD_WIDTH / 2, BIRD_HEIGHT / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Desenhar asa
    ctx.fillStyle = '#FFA500';
    const wingOffset = bird.flapping ? -5 : 0;
    ctx.beginPath();
    ctx.ellipse(-8, wingOffset, 12, 6, -0.3, 0, Math.PI * 2);
    ctx.fill();
    
    // Desenhar olho
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(8, -5, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Desenhar bico
    ctx.fillStyle = '#FF6347';
    ctx.beginPath();
    ctx.moveTo(12, 0);
    ctx.lineTo(20, -2);
    ctx.lineTo(20, 2);
    ctx.fill();
    
    ctx.restore();
}

/**
 * Desenha os canos
 */
function drawPipes() {
    pipes.forEach(pipe => {
        // Cano superior
        ctx.fillStyle = '#228B22';
        ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.gapY);
        
        // Cano inferior
        ctx.fillRect(pipe.x, pipe.gapY + PIPE_GAP, PIPE_WIDTH, CANVAS_HEIGHT - pipe.gapY - PIPE_GAP - GROUND_HEIGHT);
        
        // Bordas dos canos
        ctx.fillStyle = '#32CD32';
        ctx.fillRect(pipe.x - 5, pipe.gapY - 20, PIPE_WIDTH + 10, 20);
        ctx.fillRect(pipe.x - 5, pipe.gapY + PIPE_GAP, PIPE_WIDTH + 10, 20);
        
        // Sombra dos canos
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(pipe.x + PIPE_WIDTH - 5, 0, 5, pipe.gapY);
        ctx.fillRect(pipe.x + PIPE_WIDTH - 5, pipe.gapY + PIPE_GAP, 5, CANVAS_HEIGHT - pipe.gapY - PIPE_GAP - GROUND_HEIGHT);
    });
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
 * Desenha o chão
 */
function drawGround() {
    // Base do chão
    ctx.fillStyle = '#DEB887';
    ctx.fillRect(0, CANVAS_HEIGHT - GROUND_HEIGHT, CANVAS_WIDTH, GROUND_HEIGHT);
    
    // Padrão do chão (grama)
    ctx.fillStyle = '#9ACD32';
    for (let x = -groundOffset; x < CANVAS_WIDTH; x += 10) {
        const height = 15 + Math.sin(x * 0.1) * 5;
        ctx.fillRect(x, CANVAS_HEIGHT - GROUND_HEIGHT, 8, height);
    }
    
    // Linha da grama
    ctx.strokeStyle = '#228B22';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, CANVAS_HEIGHT - GROUND_HEIGHT + 10);
    ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_HEIGHT + 10);
    ctx.stroke();
}

/**
 * Desenha a pontuação durante o jogo
 */
function drawScore() {
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    
    // Sombra
    ctx.strokeText(score.toString(), CANVAS_WIDTH / 2, 80);
    ctx.fillText(score.toString(), CANVAS_WIDTH / 2, 80);
}

/**
 * Toggle do som
 */
function toggleSound() {
    soundEnabled = !soundEnabled;
    document.getElementById('sound-status').textContent = soundEnabled ? 'ON' : 'OFF';
}

/**
 * Atualiza a interface
 */
function updateUI() {
    document.getElementById('score').textContent = score;
    document.getElementById('best-score').textContent = bestScore;
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
            case 'flap':
                oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.1);
                break;
            case 'score':
                oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.2);
                break;
            case 'gameOver':
                oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.5);
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
function saveBestScore() {
    localStorage.setItem('flappy-bird-best-score', bestScore.toString());
}

/**
 * Carrega a melhor pontuação
 */
function loadBestScore() {
    const saved = localStorage.getItem('flappy-bird-best-score');
    if (saved) {
        bestScore = parseInt(saved);
    }
}