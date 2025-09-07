const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const gridSize = 20;
let tileCountX, tileCountY;
let snake, apple, velocity, score, playing;

function resizeCanvas() {
    const size = Math.min(window.innerWidth, window.innerHeight) * 0.9;
    canvas.width = canvas.height = Math.floor(size / gridSize) * gridSize;
    tileCountX = canvas.width / gridSize;
    tileCountY = canvas.height / gridSize;
    resetGame();
}

function resetGame() {
    snake = [{ x: 10, y: 10 }];
    apple = { x: 15, y: 15 };
    velocity = { x: 0, y: 0 };
    score = 0;
    playing = false;
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

    // Apple collision
    if (head.x === apple.x && head.y === apple.y) {
        score++;
        placeApple();
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
    ctx.fillStyle = 'lime';
    snake.forEach(part => {
        ctx.fillRect(part.x * gridSize, part.y * gridSize, gridSize - 2, gridSize - 2);
    });

    // Apple
    ctx.fillStyle = 'red';
    ctx.fillRect(apple.x * gridSize, apple.y * gridSize, gridSize - 2, gridSize - 2);

    // Score
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, 10, 20);

    if (!playing && velocity.x === 0 && velocity.y === 0) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Pressione uma seta para começar', canvas.width / 2, canvas.height / 2);
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

window.addEventListener('resize', resizeCanvas);

resizeCanvas();
setInterval(gameLoop, 1000 / 10); // 10 FPS
