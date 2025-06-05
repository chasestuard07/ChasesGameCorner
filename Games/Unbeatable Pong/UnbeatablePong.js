"use strict";

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');





/*  VARIABLES   */
const playerHeight = 80;
const playerWidth = 15;


//player 1 
let player1 = {
    Y: 300,
    movement: null,
    score: 0,
    Won: false
}

//player 2
let player2 = {
    Y: 300,
    movement: null,
    isBot: true,
    score: 0,
    Won: false
}


//ball
let ball = {
    X: 290,
    Y: 330,
    Length: 10,
    VelocityX: -2,
    VelocityY: 0
}




//inputs
document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'ArrowUp':
            player2.movement = -1;
            break;
        case 'ArrowDown':
            player2.movement = 1;
            break;
        case 'w':
            player1.movement = -1;
            break;
        case 's':
            player1.movement = 1;
            break;
        case 'r':
            reset();
            break;
        case 'b':
            reset();
            break;
    }
});

document.addEventListener('keyup', (event) => {
    switch (event.key) {
        case 'ArrowUp':
        case 'ArrowDown':
            player2.movement = null;
            break;
        case 'w':
        case 's':
            player1.movement = null;
            break;
    }
});


//game loop, refreshes every frame
function gameLoop() {
    requestAnimationFrame(gameLoop);
    draw();
    logic();
    console.log(player2.isBot);
}

gameLoop();





/* DRAW FUNCTIONS */
function draw() {
    drawBackground();
    drawEntities();
    drawUI();
}

function drawBackground() {
    ctx.clearRect(0,0,canvas.width, canvas.height);
    ctx.fillStyle = 'black';
    ctx.fillRect(0,0, canvas.width, canvas.height);
}

function drawEntities() {
    ctx.fillStyle = 'white';
    
    //players
    ctx.fillRect(20,player1.Y,playerWidth,playerHeight);
    ctx.fillRect(565,player2.Y,playerWidth,playerHeight);

    //ball
    ctx.fillRect(ball.X,ball.Y,ball.Length,ball.Length);
}

function drawUI() {
    ctx.fillRect(0,100,600,5);
    ctx.fillRect(0,560,600,5);

    ctx.font = '40px monospace';
    ctx.fillText('UNBEATABLE', 5, 40);
    ctx.fillText('PONG', 5, 80);

    ctx.font = '15px monospace';
    ctx.fillText('Toggle Bot = B', 110, 65);
    ctx.fillText('Reset Score = R', 110, 85);

    ctx.font = '70px monospace';
    ctx.fillText(player1.score + '|' + player2.score,450,70);
}

function drawWinner() {
    ctx.fillRect(150,200,300,100);
    ctx.fillStyle = 'black';
    ctx.fillRect(155,205,290,90);
    ctx.fillStyle = 'white';
    ctx.font = '40px monospace';
    ctx.fillText('GAME OVER', 195, 240);
    ctx.font = '25px monospace';
    if(player1.Won === true){
        ctx.fillText('PLAYER 1 WINS', 205, 280);
    }
    if(player2.Won === true){
        ctx.fillText('PLAYER 2 WINS', 205, 280);
    }
}




/*  lOGIC FUNCTIONS */
function logic() {
    player1Move();
    player2Move();
    ballMove();
    ballCollision();
    wallCollision();
    scoring();
    gameOver();

    if(player2.isBot){
        AI();
    }
}

function player1Move() {
    if(!(player1.movement === null)) {
        player1.Y += player1.movement * 8;
    }
}

function player2Move() {
    if(!(player2.movement === null)) {
        player2.Y += player2.movement * 8;
    }   

}

function ballMove() {
    ball.X += ball.VelocityX;
    ball.Y += ball.VelocityY;
}

function ballCollision() {
    player1Collision();
    player2Collision();
    //this might be the single most cursed line of code I've ever written (checks collisions for both players at the same time, reverses X velocity and adds to both velocities)
    

    //if the ball hits a wall, flip its Y velocity 
    if((ball.Y + ball.Length) >= 560 || ball.Y <= 105) {
        ball.VelocityY = -(ball.VelocityY)
    } 
}

function player1Collision() {
    let paddleCenter = (playerHeight/2 + player1.Y);
    let ballCenter = (ball.Length/2 + ball.Y);
    let dCenters = paddleCenter - ballCenter;

    let speed = Math.sqrt((ball.VelocityX ** 2) + (ball.VelocityY ** 2));

    if(((ball.X <= (playerWidth + 20) && ball.X > 0) && (ball.Y <= (player1.Y + playerHeight) && ball.Y >= player1.Y))) {
        ball.VelocityX = speed * Math.cos(Math.atan2(dCenters, 40)) + Math.random();
        ball.VelocityY = -speed * Math.sin(Math.atan2(dCenters, 40)) + Math.random();
    }
}

function player2Collision() {
    let paddleCenter = (playerHeight/2 + player2.Y);
    let ballCenter = (ball.Length/2 + ball.Y);
    let dCenters = paddleCenter - ballCenter;

    let speed = Math.sqrt((ball.VelocityX ** 2) + (ball.VelocityY ** 2));

    if(((ball.X < 600 && (ball.X + ball.Length) >= 565) && (ball.Y <= (player2.Y + playerHeight) && ball.Y >= player2.Y))) {
        ball.VelocityX = -speed * Math.cos(Math.atan2(dCenters, 40));
        ball.VelocityY = -speed * Math.sin(Math.atan2(dCenters, 40));
    }
}

function wallCollision() {
    if((player1.Y + playerHeight) > 560){
        player1.Y = 560 - playerHeight;
    }
    if(player1.Y <= 105){
        player1.Y = 105;
    }
    if((player2.Y + playerHeight) > 560){
        player2.Y = 560 - playerHeight;
    }
    if(player2.Y <= 105){
        player2.Y = 105;
    }
}

function calculateTrajectory() {
    let x = ball.X; 
    let y = ball.Y;
    let velX = ball.VelocityX;
    let velY = ball.VelocityY;

    while ((velX > 0) && (x < 565) ) {
        x += velX; 
        y += velY;

        if((y + ball.Length) >= 580 || y <= 20) {
            velY = -velY;
        } 
    }

    return y + ball.Length / 2;
}

function AI() {
    if(!player2.isBot) return;

    const trajectory = calculateTrajectory();

    if (trajectory > (player2.Y + playerHeight + 10)) {
        player2.movement = 1;
    }

    else if (trajectory < (player2.Y + playerHeight - 10)) {
        player2.movement = -1;
    }

    else {
        player2.movement = null;
    }

    
}

function scoring() {
    if(ball.X < 0){
        ball = {
            X: 290,
            Y: 330,
            Length: 10,
            VelocityX: -2,
            VelocityY: 0
        }
        player2.score += 1;
    }

    if((ball.X + ball.Length) > 600){
        ball = {
            X: 290,
            Y: 330,
            Length: 10,
            VelocityX: -2,
            VelocityY: 0
        }
        player1.score += 1;
    }
}

function reset() {

    player1 = {
    Y: 300,
    movement: null,
    score: 0
    }

    player2 = {
    Y: 300,
    movement: null,
    score: 0,
    isBot: !player2.isBot
    }

    ball = {
    X: 290,
    Y: 330,
    Length: 10,
    VelocityX: -2,
    VelocityY: 0
    }
}

function gameOver() {
    if(player1.score === 7){
        player1.Won = true;
        drawWinner();
        ball.VelocityX = 0;
    }

    if(player2.score === 7){
        player2.Won = true;
        drawWinner();
        ball.VelocityX = 0;
    }
}