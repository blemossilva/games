const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const gridSize = 20;
let tileCountX, tileCountY;
let snake, apple, velocity, score, playing, pendingGrowth;
let gameSettings = {
    growthAmount: 1,
    gameSpeed: 10
};
let gameInterval;

function resizeCanvas() {
    const size = Math.min(window.innerWidth, window.innerHeight) * 0.9;
    canvas.width = canvas.height = Math.floor(size / gridSize) * gridSize;
    tileCountX = canvas.width / gridSize;
    tileCountY = canvas.height / gridSize;
    resetGame();
}

function resetGame() {
    snake = [{ x: 10, y: 10 }];
    apple = { x: 1, y: 10 };
    velocity = { x: 0, y: 0 };
    score = 0;
    playing = false;
    pendingGrowth = 0;
    draw(); // Draw initial state
}

function placeApple() {
    apple.x = Math.floor(Math.random() * tileCountX);
    apple.y = Math.floor(Math.random() * tileCountY);
    // TODO: Ensure apple doesn't spawn on snake
}

function gameLoop() {
    if (!playing) return;

    const head = { x: snake[0].x + velocity.x, y: snake[0].y + velocity.y };

    // Wall collision
    if (head.x < 0 || head.x >= tileCountX || head.y < 0 || head.y >= tileCountY) {
        playing = false;
        // TODO: Proper game over
        setTimeout(resetGame, 1000);
        return;
    }

    // Self collision
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            playing = false;
            setTimeout(resetGame, 1000);
            return;
        }
    }

    snake.unshift(head);

    // Apple collision and growth handling
    if (head.x === apple.x && head.y === apple.y) {
        score = score + 5;
        pendingGrowth = (pendingGrowth || 0) + gameSettings.growthAmount;
        placeApple();
    }

    if (pendingGrowth > 0) {
        pendingGrowth--;
    } else {
        snake.pop();
    }

    draw();
}

function draw() {
    // Background
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Snake
    ctx.fillStyle = 'yellow';
    snake.forEach(part => {
        ctx.fillRect(part.x * gridSize, part.y * gridSize, gridSize - 2, gridSize - 2);
    });

    // Apple
    ctx.fillStyle = 'red';
    ctx.fillRect(apple.x * gridSize, apple.y * gridSize, gridSize - 2, gridSize - 2);

    // Score and settings info
    ctx.fillStyle = 'white';
    ctx.font = '18px Arial';
    ctx.fillText(`Score: ${score}`, 10, 20);
    ctx.fillText(`Crescimento: +${gameSettings.growthAmount}`, 10, 45);

    if (!playing && velocity.x === 0 && velocity.y === 0) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Pressiona uma seta para começar!', canvas.width / 2, canvas.height / 2);
        ctx.font = '16px Arial';
        ctx.fillText(`A cobra crescerá ${gameSettings.growthAmount} segmento(s) por maçã`, canvas.width / 2, canvas.height / 2 + 30);
        ctx.textAlign = 'left';
    }
}

document.addEventListener('keydown', e => {
    if (!playing && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        playing = true;
    }
    switch (e.key) {
        case 'ArrowUp': if (velocity.y === 0) velocity = { x: 0, y: -1 }; break;
        case 'ArrowDown': if (velocity.y === 0) velocity = { x: 0, y: 1 }; break;
        case 'ArrowLeft': if (velocity.x === 0) velocity = { x: -1, y: 0 }; break;
        case 'ArrowRight': if (velocity.x === 0) velocity = { x: 1, y: 0 }; break;
    }
});

// TODO: Add touch controls

// Settings controls
function initializeControls() {
    const growthInput = document.getElementById('growthAmount');
    const speedSelect = document.getElementById('gameSpeed');
    const resetBtn = document.getElementById('resetBtn');

    // Load saved settings or use defaults
    const savedGrowth = localStorage.getItem('snakeGrowthAmount');
    const savedSpeed = localStorage.getItem('snakeGameSpeed');
    
    if (savedGrowth) {
        gameSettings.growthAmount = parseInt(savedGrowth);
        growthInput.value = savedGrowth;
    }
    
    if (savedSpeed) {
        gameSettings.gameSpeed = parseInt(savedSpeed);
        speedSelect.value = savedSpeed;
    }

    // Event listeners for settings
    growthInput.addEventListener('change', (e) => {
        const value = parseInt(e.target.value);
        if (value >= 1 && value <= 10) {
            gameSettings.growthAmount = value;
            localStorage.setItem('snakeGrowthAmount', value.toString());
        }
    });

    speedSelect.addEventListener('change', (e) => {
        const value = parseInt(e.target.value);
        gameSettings.gameSpeed = value;
        localStorage.setItem('snakeGameSpeed', value.toString());
        restartGameLoop();
    });

    resetBtn.addEventListener('click', () => {
        resetGame();
    });
}

function startGameLoop() {
    if (gameInterval) {
        clearInterval(gameInterval);
    }
    gameInterval = setInterval(gameLoop, 1000 / gameSettings.gameSpeed);
}

function restartGameLoop() {
    startGameLoop();
}

window.addEventListener('resize', resizeCanvas);

resizeCanvas();
initializeControls();
startGameLoop();
