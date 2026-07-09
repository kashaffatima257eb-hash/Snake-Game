// ============================
// SnakeX - Step 3
// Snake Movement
// ============================

// Canvas
const modal = document.getElementById("gameOverModal");

const finalScore = document.getElementById("finalScore");

const finalBest = document.getElementById("finalBest");

const playAgainBtn = document.getElementById("playAgainBtn");
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// UI
const score = document.getElementById("score");
const best = document.getElementById("best");

const playBtn = document.getElementById("playBtn");
const pauseBtn = document.getElementById("pauseBtn");
const restartBtn = document.getElementById("restartBtn");

// Load Best Score
best.textContent = localStorage.getItem("snakeBest") || 0;

// ============================
// Game Settings
// ============================

const CELL_SIZE = 25;
const COLS = canvas.width / CELL_SIZE;
const ROWS = canvas.height / CELL_SIZE;

let gameLoop = null;

// Snake
let snake = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 }
];

// Food
let food = {
    x: 15,
    y: 10
};

// Direction
let dx = 1;
let dy = 0;

// ============================
// Draw Background
// ============================

function drawBackground() {

    ctx.fillStyle = "#101827";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

}

// ============================
// Draw Grid
// ============================

function drawGrid() {

    ctx.strokeStyle = "rgba(255,255,255,.03)";
    ctx.lineWidth = 1;

    for (let i = 0; i <= COLS; i++) {

        let x = i * CELL_SIZE;

        ctx.beginPath();

        ctx.moveTo(x, 0);

        ctx.lineTo(x, canvas.height);

        ctx.stroke();

    }

    for (let i = 0; i <= ROWS; i++) {

        let y = i * CELL_SIZE;

        ctx.beginPath();

        ctx.moveTo(0, y);

        ctx.lineTo(canvas.width, y);

        ctx.stroke();

    }

}

// ============================
// Draw Snake
// ============================

function drawSnake() {

    snake.forEach((segment, index) => {

        // Shadow
        ctx.shadowColor = "#53F28C";
        ctx.shadowBlur = 15;

        // Head
        if (index === 0)
            ctx.fillStyle = "#6CFF9E";
        else
            ctx.fillStyle = "#46D87A";

        // Rounded body
        ctx.beginPath();

        ctx.roundRect(
            segment.x * CELL_SIZE + 2,
            segment.y * CELL_SIZE + 2,
            CELL_SIZE - 4,
            CELL_SIZE - 4,
            8
        );

        ctx.fill();

        ctx.shadowBlur = 0;

    });

    // Draw Eyes
    const head = snake[0];

    ctx.fillStyle = "white";

    ctx.beginPath();
    ctx.arc(
        head.x * CELL_SIZE + 8,
        head.y * CELL_SIZE + 9,
        2,
        0,
        Math.PI * 2
    );
    ctx.fill();

    ctx.beginPath();
    ctx.arc(
        head.x * CELL_SIZE + 17,
        head.y * CELL_SIZE + 9,
        2,
        0,
        Math.PI * 2
    );
    ctx.fill();

}
// ============================
// Draw Food
// ============================

function drawFood() {

    ctx.shadowColor = "#FF5D73";
    ctx.shadowBlur = 20;

    // Outer Glow
    ctx.fillStyle = "#FF5D73";

    ctx.beginPath();

    ctx.arc(
        food.x * CELL_SIZE + CELL_SIZE / 2,
        food.y * CELL_SIZE + CELL_SIZE / 2,
        8,
        0,
        Math.PI * 2
    );

    ctx.fill();

    // Highlight
    ctx.fillStyle = "#FFD4DA";

    ctx.beginPath();

    ctx.arc(
        food.x * CELL_SIZE + 8,
        food.y * CELL_SIZE + 8,
        2,
        0,
        Math.PI * 2
    );

    ctx.fill();

    ctx.shadowBlur = 0;

}

// ============================
// Move Snake
// ============================

function moveSnake() {

    const head = {

        x: snake[0].x + dx,

        y: snake[0].y + dy

    };

    // Collision Check
    if (hitWall(head) || hitSelf(head)) {

        gameOver();

        return;

    }

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {

        score.textContent = Number(score.textContent) + 1;

        spawnFood();

    } else {

        snake.pop();

    }

}
function spawnFood() {

    let valid = false;

    while (!valid) {

        food = {

            x: Math.floor(Math.random() * COLS),

            y: Math.floor(Math.random() * ROWS)

        };

        valid = true;

        for (let segment of snake) {

            if (segment.x === food.x &&
                segment.y === food.y) {

                valid = false;

                break;

            }

        }

    }

}
// ============================
// Wall Collision
// ============================

function hitWall(head) {

    return (
        head.x < 0 ||
        head.y < 0 ||
        head.x >= COLS ||
        head.y >= ROWS
    );

}

// ============================
// Self Collision
// ============================

function hitSelf(head) {

    for (let i = 1; i < snake.length; i++) {

        if (
            snake[i].x === head.x &&
            snake[i].y === head.y
        ) {
            return true;
        }

    }

    return false;

}

// ============================
// Game Over
// ============================

function gameOver() {

    clearInterval(gameLoop);

    gameLoop = null;

    const current = Number(score.textContent);

    let high = Number(localStorage.getItem("snakeBest")) || 0;

    if(current > high){

        high = current;

        localStorage.setItem("snakeBest", high);

    }

    best.textContent = high;

    finalScore.textContent = current;

    finalBest.textContent = high;

    modal.classList.remove("hidden");

}
// ============================
// Render
// ============================

function render() {

    drawBackground();
    drawGrid();
    drawFood();
    drawSnake();

}

// ============================
// Update Game
// ============================

function update() {

    moveSnake();
    render();

}

// ============================
// Controls
// ============================

document.addEventListener("keydown", (e) => {

    if (e.key === "ArrowUp" && dy !== 1) {
        dx = 0;
        dy = -1;
    }

    if (e.key === "ArrowDown" && dy !== -1) {
        dx = 0;
        dy = 1;
    }

    if (e.key === "ArrowLeft" && dx !== 1) {
        dx = -1;
        dy = 0;
    }

    if (e.key === "ArrowRight" && dx !== -1) {
        dx = 1;
        dy = 0;
    }

});

// ============================
// Buttons
// ============================

playBtn.onclick = () => {

    if (gameLoop !== null) return;

    gameLoop = setInterval(update,150);

};

pauseBtn.onclick = () => {

    clearInterval(gameLoop);
    gameLoop = null;

};

restartBtn.onclick = () => {

    clearInterval(gameLoop);

    gameLoop = null;

    snake = [

        { x: 10, y: 10 },

        { x: 9, y: 10 },

        { x: 8, y: 10 }

    ];

    food = {

        x: 15,

        y: 10

    };

    dx = 1;

    dy = 0;

    score.textContent = 0;

    render();

};

// Initial Draw
render();
playAgainBtn.onclick = () => {

    modal.classList.add("hidden");

    restartBtn.click();

    playBtn.click();

};