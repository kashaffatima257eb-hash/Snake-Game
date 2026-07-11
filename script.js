// ============================
// SnakeX - Enhanced
// Snake Movement + Buffered Input, Pause Overlay,
// Food Pulse Animation, Sound Effects, Touch Controls
// ============================

// Canvas
let foodPulse = 0;
const difficulty = document.getElementById("difficulty");
const modal = document.getElementById("gameOverModal");

const finalScore = document.getElementById("finalScore");

const finalBest = document.getElementById("finalBest");

const newBestBadge = document.getElementById("newBestBadge");

const soundBtn = document.getElementById("soundBtn");

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

// Buffered inputs (prevents illegal reversal when
// two keys are pressed quickly between game ticks)
let directionQueue = [];

// Whether the game is currently paused mid-run
let isPaused = false;

// Sound
let isMuted = localStorage.getItem("snakeMuted") === "true";

soundBtn.textContent = isMuted ? "🔇 Sound" : "🔊 Sound";

let audioCtx = null;

// ============================
// Sound Effects
// ============================

function beep(freq, duration, waveType = "sine") {

    if (isMuted) return;

    try {

        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }

        // Browsers auto-suspend AudioContext until it's resumed inside
        // a direct user gesture. The eat/game-over sounds fire from the
        // game loop (a timer), not a click, so resume it here.
        if (audioCtx.state === "suspended") {
            audioCtx.resume();
        }

        const oscillator = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        oscillator.type = waveType;
        oscillator.frequency.value = freq;

        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

        oscillator.connect(gain);
        gain.connect(audioCtx.destination);

        oscillator.start();
        oscillator.stop(audioCtx.currentTime + duration);

    } catch (err) {

        console.error("SnakeX sound error:", err);

    }

}

function playEatSound() {
    beep(660, 0.12);
}

function playGameOverSound() {

    // Retro 8-bit style descending death jingle
    const notes = [392, 330, 262, 196]; // G4, E4, C4, G3

    notes.forEach((freq, i) => {

        setTimeout(() => beep(freq, 0.18, "sawtooth"), i * 120);

    });

}

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

    foodPulse += 0.12;

    const pulseRadius = 8 + Math.sin(foodPulse) * 1.5;

    ctx.shadowColor = "#FF5D73";
    ctx.shadowBlur = 20;

    // Outer Glow
    ctx.fillStyle = "#FF5D73";

    ctx.beginPath();

    ctx.arc(
        food.x * CELL_SIZE + CELL_SIZE / 2,
        food.y * CELL_SIZE + CELL_SIZE / 2,
        pulseRadius,
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
// Process Buffered Input
// ============================

function processQueue() {

    while (directionQueue.length > 0) {

        const next = directionQueue.shift();

        // Ignore a move that reverses straight into the snake
        if (next.dx !== -dx || next.dy !== -dy) {
            dx = next.dx;
            dy = next.dy;
            break;
        }

    }

}

// ============================
// Move Snake
// ============================

function moveSnake() {

    processQueue();

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

        score.classList.remove("pop");

        void score.offsetWidth; // restart animation

        score.classList.add("pop");

        playEatSound();

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

    playGameOverSound();

    const current = Number(score.textContent);

    let high = Number(localStorage.getItem("snakeBest")) || 0;

    let isNewBest = false;

    if(current > high){

        high = current;

        localStorage.setItem("snakeBest", high);

        isNewBest = true;

    }

    best.textContent = high;

    finalScore.textContent = current;

    finalBest.textContent = high;

    newBestBadge.classList.toggle("hidden", !isNewBest);

    modal.classList.remove("hidden");

    playBtn.disabled = false;

    pauseBtn.disabled = true;

}
// ============================
// Draw Pause Overlay
// ============================

function drawPauseOverlay() {

    ctx.fillStyle = "rgba(16,24,39,.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 36px Segoe UI, Arial, sans-serif";
    ctx.textAlign = "center";

    ctx.fillText("⏸ PAUSED", canvas.width / 2, canvas.height / 2);

    ctx.font = "16px Segoe UI, Arial, sans-serif";
    ctx.fillStyle = "#94a3b8";

    ctx.fillText("Press Space or ▶ Play to resume", canvas.width / 2, canvas.height / 2 + 30);

}

// ============================
// Render
// ============================

function render() {

    drawBackground();
    drawGrid();
    drawFood();
    drawSnake();

    if (isPaused) drawPauseOverlay();

}

// ============================
// Idle Animation (keeps food glow pulsing smoothly
// even while the snake isn't moving)
// ============================

function idleAnimate() {

    render();

    requestAnimationFrame(idleAnimate);

}

requestAnimationFrame(idleAnimate);

// ============================
// Update Game
// ============================

function update() {

    moveSnake();
    render();

}

// ============================
// Audio Unlock (some browsers only allow the very
// first user gesture on the page to unlock audio,
// not necessarily the Play button click)
// ============================

function unlockAudioOnce() {

    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    if (audioCtx.state === "suspended") {
        audioCtx.resume();
    }

    document.removeEventListener("pointerdown", unlockAudioOnce);
    document.removeEventListener("keydown", unlockAudioOnce);

}

document.addEventListener("pointerdown", unlockAudioOnce);
document.addEventListener("keydown", unlockAudioOnce);

// ============================
// Controls
// ============================

const KEY_DIRECTIONS = {
    ArrowUp:    { dx: 0, dy: -1 },
    ArrowDown:  { dx: 0, dy: 1 },
    ArrowLeft:  { dx: -1, dy: 0 },
    ArrowRight: { dx: 1, dy: 0 },
    w: { dx: 0, dy: -1 },
    s: { dx: 0, dy: 1 },
    a: { dx: -1, dy: 0 },
    d: { dx: 1, dy: 0 }
};

document.addEventListener("keydown", (e) => {

    if (e.key === " ") {

        e.preventDefault();

        if (gameLoop !== null) pauseBtn.click();
        else if (!playBtn.disabled) playBtn.click();

        return;

    }

    const move = KEY_DIRECTIONS[e.key];

    if (move && directionQueue.length < 2) {
        directionQueue.push(move);
    }

});

// ============================
// Touch Controls (swipe)
// ============================

let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener("touchstart", (e) => {

    touchStartX = e.changedTouches[0].clientX;
    touchStartY = e.changedTouches[0].clientY;

}, { passive: true });

canvas.addEventListener("touchend", (e) => {

    const dxTouch = e.changedTouches[0].clientX - touchStartX;
    const dyTouch = e.changedTouches[0].clientY - touchStartY;

    if (Math.abs(dxTouch) < 20 && Math.abs(dyTouch) < 20) return;

    let move;

    if (Math.abs(dxTouch) > Math.abs(dyTouch)) {
        move = dxTouch > 0 ? KEY_DIRECTIONS.ArrowRight : KEY_DIRECTIONS.ArrowLeft;
    } else {
        move = dyTouch > 0 ? KEY_DIRECTIONS.ArrowDown : KEY_DIRECTIONS.ArrowUp;
    }

    if (directionQueue.length < 2) directionQueue.push(move);

}, { passive: true });

// ============================
// Buttons
// ============================

playBtn.onclick = () => {

    if (gameLoop !== null) return;

    // Create/resume the AudioContext here since this click is a
    // genuine user gesture — browsers require that before audio
    // will actually play.
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === "suspended") {
        audioCtx.resume();
    }

    let speed = 150;

switch (difficulty.value) {

    case "Easy":
        speed = 220;
        break;

    case "Medium":
        speed = 150;
        break;

    case "Hard":
        speed = 90;
        break;

}

gameLoop = setInterval(update, speed);

isPaused = false;

playBtn.disabled = true;
pauseBtn.disabled = false;

};

pauseBtn.onclick = () => {

    clearInterval(gameLoop);
    gameLoop = null;

    isPaused = true;

    playBtn.disabled = false;
    pauseBtn.disabled = true;

};

restartBtn.onclick = () => {

    clearInterval(gameLoop);

    gameLoop = null;

    isPaused = false;

    directionQueue = [];

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

    newBestBadge.classList.add("hidden");

    playBtn.disabled = false;
    pauseBtn.disabled = true;

    render();

};

// ============================
// Sound Toggle
// ============================

soundBtn.onclick = () => {

    isMuted = !isMuted;

    localStorage.setItem("snakeMuted", isMuted);

    soundBtn.textContent = isMuted ? "🔇 Sound" : "🔊 Sound";

};

// Initial Draw
pauseBtn.disabled = true;
render();
playAgainBtn.onclick = () => {

    modal.classList.add("hidden");

    restartBtn.click();

    playBtn.click();

};
