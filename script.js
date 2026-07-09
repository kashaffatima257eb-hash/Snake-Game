const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const scoreElement = document.getElementById("score");
const restartBtn = document.getElementById("restart");

const box = 20;

let snake;
let food;
let score;
let direction;
let game;

function randomFood(){
    return {
        x:Math.floor(Math.random()*20)*box,
        y:Math.floor(Math.random()*20)*box
    }
}

function startGame(){

    snake=[
        {x:200,y:200}
    ];

    direction="RIGHT";

    food=randomFood();

    score=0;

    scoreElement.innerHTML=score;

    clearInterval(game);

    game=setInterval(draw,120);

}

document.addEventListener("keydown",changeDirection);

function changeDirection(e){

    if(e.key==="ArrowLeft" && direction!=="RIGHT")
        direction="LEFT";

    if(e.key==="ArrowUp" && direction!=="DOWN")
        direction="UP";

    if(e.key==="ArrowRight" && direction!=="LEFT")
        direction="RIGHT";

    if(e.key==="ArrowDown" && direction!=="UP")
        direction="DOWN";

}

function draw(){

    ctx.fillStyle="#111";
    ctx.fillRect(0,0,400,400);

    ctx.fillStyle="red";
    ctx.fillRect(food.x,food.y,box,box);

    for(let i=0;i<snake.length;i++){

        ctx.fillStyle=i==0?"lime":"green";
        ctx.fillRect(snake[i].x,snake[i].y,box,box);

    }

    let headX=snake[0].x;
    let headY=snake[0].y;

    if(direction==="LEFT") headX-=box;
    if(direction==="RIGHT") headX+=box;
    if(direction==="UP") headY-=box;
    if(direction==="DOWN") headY+=box;

    if(headX===food.x && headY===food.y){

        score++;
        scoreElement.innerHTML=score;
        food=randomFood();

    }else{

        snake.pop();

    }

    let newHead={
        x:headX,
        y:headY
    };

    if(
        headX<0 ||
        headY<0 ||
        headX>=400 ||
        headY>=400
    ){
        gameOver();
        return;
    }

    for(let i=0;i<snake.length;i++){

        if(
            snake[i].x===newHead.x &&
            snake[i].y===newHead.y
        ){
            gameOver();
            return;
        }

    }

    snake.unshift(newHead);

}

function gameOver(){

    clearInterval(game);

    alert("Game Over!\nScore : "+score);

}

restartBtn.onclick=startGame;

startGame();