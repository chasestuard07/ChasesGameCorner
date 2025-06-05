"use strict";

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Constants
const gridSize = 8;
const cellSize = 50;
const offsetX = 100;
const offsetY = 200;

// Icons
const appleText = '▣';
const snakeText = '◼';
const emptyText = '☐';

// State
let snakeSpaces = [[2, 4]];
let appleSpaces = [[4, 6]];
let lastDirection = '';
let isStarted = false;
let lose = false;
let elapsed = 0;
let moveTime = 1;
let startTime = null;

// Input handling
document.addEventListener('keydown', (event) => {
    if(event.key === ' ') {
        reset();
    }
    
    if (lose) return;
    switch (event.key) {
        case 'ArrowUp':
        case 'ArrowDown':
        case 'ArrowLeft':
        case 'ArrowRight':
            lastDirection = event.key.replace('Arrow', '');
            isStarted = true;
            break;
    }
});

// Game loop
function gameLoop(currentTime) {
    requestAnimationFrame(gameLoop);
    
    if (lose) return;

    if (startTime === null) {
        startTime = currentTime;
    }

    elapsed = (currentTime - startTime) / 1000;

    if (elapsed >= moveTime) {
        logic();
        startTime = currentTime;
    }

    draw();
}

gameLoop(0);

// Game logic
function logic() {
    if (!isStarted) return;
    scaleDifficulty();

    moveSnake();
    handleAppleCollision();

    checkLose();
    if (lose) return;
}

function moveSnake() {
    const [x, y] = snakeSpaces[snakeSpaces.length - 1];
    let newHead;

    switch (lastDirection) {
        case 'Up':    newHead = [x, y - 1]; break;
        case 'Down':  newHead = [x, y + 1]; break;
        case 'Left':  newHead = [x - 1, y]; break;
        case 'Right': newHead = [x + 1, y]; break;
        default:      return; // No movement
    }

    snakeSpaces.push(newHead);
}

function handleAppleCollision() {
    const [hx, hy] = snakeSpaces[snakeSpaces.length - 1];
    let appleEaten = false;

    for (let i = 0; i < appleSpaces.length; i++) {
        const [ax, ay] = appleSpaces[i];
        if (hx === ax && hy === ay) {
            appleEaten = true;
            appleSpaces.splice(i, 1);
            createValidApple();
            break;
        }
    }

    if (!appleEaten) {
        snakeSpaces.shift(); // Remove tail
    }
}

function createValidApple(){
    let newApple = [Math.floor(Math.random()*gridSize), Math.floor(Math.random()*gridSize)];

    const isNotValid = snakeSpaces.some(([x, y]) => x === newApple[0] && y === newApple[1]);

    if (isNotValid) {
        return createValidApple();
    }
    else {
        appleSpaces.push(newApple);
    }
}

function checkLose() {
    const [x, y] = snakeSpaces[snakeSpaces.length - 1];

    if (x < 0 || y < 0 || x >= gridSize || y >= gridSize) {
        lose = true;
    }

    for (let i = 0; i < snakeSpaces.length - 1; i++){
        const [bx, by] = snakeSpaces[i];
        if(bx === x && by === y ) {
            lose = true;
        }
    }
}

function scaleDifficulty() {
    let score = snakeSpaces.length - 1
    moveTime = Math.max(1 - (score * 0.02), 0.1);


}

function reset() {
    snakeSpaces = [[2, 4]];
    appleSpaces = [[4, 6]];
    lastDirection = '';
    isStarted = false;
    lose = false;
    elapsed = 0;
    moveTime = 1;
    startTime = null;
}

// Drawing
function draw() {

    if(!lose){
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Background
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        
        // UI
        ctx.font = '60px monospace';
        ctx.fillText('ASCII SNAKE', 120, 70);

        ctx.font = '20px monospace';
        ctx.fillText('SPACE TO RESTART', 130, 120);
        ctx.fillText('SCORE: ' + (snakeSpaces.length - 1), 360, 120);
        
        

        // Draw grid
        ctx.font = '60px monospace';
        ctx.fillStyle = 'white';
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                ctx.fillText(emptyText, i * cellSize + offsetX, j * cellSize + offsetY);
            }
        }

        // Draw snake
        ctx.fillStyle = 'green';
        for (const [x, y] of snakeSpaces) {
            ctx.fillText(snakeText, x * cellSize + offsetX, y * cellSize + offsetY);
        }

        // Draw apples
        ctx.fillStyle = 'red';
        for (const [x, y] of appleSpaces) {
            ctx.fillText(appleText, x * cellSize + offsetX, y * cellSize + offsetY);
        }

    }

    if(lose){
        ctx.fillStyle = 'red'
        ctx.fillRect(150, 230, 300, 100);
        ctx.fillStyle = 'black'
        ctx.fillRect(160, 240, 280, 80);
        ctx.font = '60px monospace';
        ctx.fillStyle = 'red';
        ctx.fillText("YOU LOSE",170, 300);
    }
}