const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let ball, player, cpu, score;
const PADDLE_HEIGHT = 100, PADDLE_WIDTH = 20;
let gamePaused = false;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    resetGame();
}

function resetGame() {
    ball = {
        x: canvas.width / 2,
        y: canvas.height / 2,
        radius: 10,
        speedX: 5,
        speedY: 5
    };
    player = {
        x: 0,
        y: (canvas.height - PADDLE_HEIGHT) / 2,
        width: PADDLE_WIDTH,
        height: PADDLE_HEIGHT,
        score: 0
    };
    cpu = {
        x: canvas.width - PADDLE_WIDTH,
        y: (canvas.height - PADDLE_HEIGHT) / 2,
        width: PADDLE_WIDTH,
        height: PADDLE_HEIGHT,
        score: 0
    };
    gamePaused = false;
}

function drawRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

function drawCircle(x, y, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.fill();
}

function drawText(text, x, y, color) {
    ctx.fillStyle = color;
    ctx.font = "45px 'Courier New', Courier, monospace";
    ctx.fillText(text, x, y);
}

function update() {
    if (gamePaused) return;

    // Move ball
    ball.x += ball.speedX;
    ball.y += ball.speedY;

    // Ball collision (top/bottom walls)
    if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
        ball.speedY = -ball.speedY;
    }

    // Ball collision (paddles)
    let selectedPaddle = (ball.x < canvas.width / 2) ? player : cpu;
    if (collides(ball, selectedPaddle)) {
        let collidePoint = (ball.y - (selectedPaddle.y + selectedPaddle.height / 2));
        collidePoint = collidePoint / (selectedPaddle.height / 2);
        let angleRad = (Math.PI / 4) * collidePoint;
        let direction = (ball.x < canvas.width / 2) ? 1 : -1;
        ball.speedX = direction * 5 * Math.cos(angleRad);
        ball.speedY = 5 * Math.sin(angleRad);
    }

    // Score
    if (ball.x - ball.radius < 0) {
        cpu.score++;
        resetBall();
    } else if (ball.x + ball.radius > canvas.width) {
        player.score++;
        window.parent.postMessage({ type: 'scoreUpdate', score: player.score }, '*');
        resetBall();
    }

    // CPU movement
    cpu.y += (ball.y - (cpu.y + cpu.height / 2)) * 0.1;

    // Check for winner
    if (player.score === 10 || cpu.score === 10) {
        console.log("Game Over");
        resetGame();
    }
}

function collides(b, p) {
    p.top = p.y;
    p.bottom = p.y + p.height;
    p.left = p.x;
    p.right = p.x + p.width;

    b.top = b.y - b.radius;
    b.bottom = b.y + b.radius;
    b.left = b.x - b.radius;
    b.right = b.x + b.radius;

    return p.left < b.right && p.top < b.bottom && p.right > b.left && p.bottom > b.top;
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.speedX = -ball.speedX;
}

function render() {
    // Clear canvas
    drawRect(0, 0, canvas.width, canvas.height, '#000');

    // Draw scores
    drawText(player.score, canvas.width / 4, canvas.height / 5, '#FFF');
    drawText(cpu.score, 3 * canvas.width / 4, canvas.height / 5, '#FFF');

    // Draw paddles
    drawRect(player.x, player.y, player.width, player.height, '#FFF');
    drawRect(cpu.x, cpu.y, cpu.width, cpu.height, '#FFF');

    // Draw ball
    drawCircle(ball.x, ball.y, ball.radius, '#FFF');
}

function gameLoop() {
    update();
    render();
    requestAnimationFrame(gameLoop);
}

// Controls
window.addEventListener('mousemove', (evt) => {
    let rect = canvas.getBoundingClientRect();
    player.y = evt.clientY - rect.top - player.height / 2;
});

window.addEventListener('resize', resizeCanvas);

// Communication with parent window
window.addEventListener('message', event => {
    switch (event.data) {
        case 'play':
            gamePaused = false;
            break;
        case 'pause':
            gamePaused = true;
            break;
        case 'reset':
            resetGame();
            break;
    }
});

// Start game
resizeCanvas();
gameLoop();
