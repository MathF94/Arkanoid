'use strict';
let game = {
    background: '#DDDDDD',
    width: 800,
    height: 600,
    canvasDom: null,
    ctx: null,
    IdEvent: null,
    msg: null,
    start: false,
    pause: false,
    win: false,
    gameOver: false,
};

let ball = {
    color: "#FF0000",
    radius: 10,
    x: 100,
    y: 100,
    directionY: -1,
    directionX: 0,
    speed: 10,
};

let paddle = {
    x: 0,
    y: 500,
    speed: 6,
    color: "orange",
    width: 100,
    height: 20,
    direction: 0,
};

let bricks = [
    {color: "grey", collisions: 1},
    {color: "black", collisions: 2},
    {color: "grey", collisions: 1},
    {color: "black", collisions: 2},
    {color: "grey", collisions: 1},
    {color: "black", collisions: 2},
    {color: "grey", collisions: 1},
    {color: "black", collisions: 2},
];

document.addEventListener('DOMContentLoaded', function() {
    initGame();
    displayGame();
    playGame();
});

function initGame() {
    game.canvasDom = document.getElementById('canvas');
    game.ctx = game.canvasDom.getContext('2d');

    game.canvasDom.width = game.width
    game.canvasDom.height = game.height

    initPositions();

    // GESTIONNAIRE D'EVENEMENT
    document.addEventListener('keydown', keyboardEvent)
    document.addEventListener('keyup', keyboardEvent)
}

function initPositions() {

    // POSITION PADDLE
    paddle.x = game.canvasDom.width / 2 - paddle.width / 2 ;
    paddle.y = game.canvasDom.height - 100 ;

    // POSITION BALLE
    ball.x = paddle.x + paddle.width / 2;
    ball.y = paddle.y - ball.radius

    // DIRECTION BALLE
    ball.directionY = -1;
    ball.directionX = 0;
}

function playGame() {
    // METTRE LES LIMITES DU PLATEAU ET BALL
    paddle.x += paddle.speed * paddle.direction;
    if(paddle.x < 0) {
        paddle.x = 0;
    }
    if(paddle.x + paddle.width > game.canvasDom.width) {
        paddle.x = game.canvasDom.width - paddle.width;
    }

    detectCollisions()

    // Si le jeu est lancé
    if(game.start && !game.pause) {
        ball.y += ball.directionY * ball.speed;
        ball.x += ball.directionX * ball.speed;
    }

    // Si le jeu n'est pas lancé
    else if(!game.start) {
        ball.x = paddle.x + paddle.width / 2;
        ball.y = paddle.y - ball.radius;
    }

    displayGame();

    game.IdEvent = requestAnimationFrame(playGame);
}

function displayGame() {
    // DESSIN DU BACKGROUND
    game.ctx.clearRect(0, 0, game.canvasDom.width, game.canvasDom.height);
    game.ctx.fillStyle = game.background;
    game.ctx.fillRect(0, 0, game.canvasDom.width, game.canvasDom.height);

    // DESSIN DU CERCLE
    game.ctx.fillStyle = ball.color;
    game.ctx.beginPath();
    game.ctx.arc(ball.x, ball.y, ball.radius, 0, 2 * Math.PI);
    game.ctx.fill();
    game.ctx.stroke();

    // DESSIN DU PLATEAU
    game.ctx.fillStyle = paddle.color;
    game.ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);

    // AFFICHAGE DES BRIQUES
    displayBricks();

    // WIN
    if(game.win) {
        game.start = false;
        displayWin();
        return;
    }

    // GAMEOVER
    if(game.gameOver) {
        displayGameOver();
        return;
    }
}

function displayBricks() {
    let displayingBricks = 0;
    let widthBricks = 100;
    let heightBricks = 20;

    // DESSIN DE BRICKS
    bricks.forEach((brick, index) => {
        // Index du tableau = 0 à 7 car 8 lignes de bricks
        if (brick.collisions > 0) {
            game.ctx.fillStyle = brick.color;
            // En multipliant la longueur par l'index, ça donne la
            // position de départ de chaque brick (0, 100, 200, 300...)
            brick.x = widthBricks * index;
            // Donne la position y des bricks
            brick.y = 50;
            game.ctx.fillRect(brick.x, brick.y, widthBricks, heightBricks);
            displayingBricks++;
        }
    });

    if(displayingBricks == 0) {
        game.win = true;
    }
}

function displayWin() {
    if(game.win == true) {
        game.ctx.fillStyle = 'orange';
        game.ctx.font = '60px Verdana';
        game.msg = "Great, you win !"
        game.ctx.fillText(game.msg, 200, 300);
    }
}

function displayGameOver() {
    if(game.gameOver == true) {
        game.ctx.fillStyle = 'red';
        game.ctx.font = '60px Verdana';
        game.msg = "Game Over"
        game.ctx.fillText(game.msg, 200, 300);
    }
}

function detectCollisions() {
    // COLLISION BALL AVEC LE BAS POUR LE GAME OVER
    if(ball.y - ball.radius == game.canvasDom.height) {
        game.gameOver = true;
    }

    // COLLISION BALL AVEC LE HAUT DU CANVAS
    if(ball.y - ball.radius <= 0) {
        ball.directionY *= -1;
    }

    // COLLISION BALL AVEC LES COTES DU CANVAS
    if(ball.x <= 0 || ball.x + ball.radius >= game.canvasDom.width) {
        ball.directionX *= -1 ;
    }

    // COLLISION BALL AVEC LE PADDLE
    if((ball.y == paddle.y || ball.y + ball.speed == paddle.y + ball.speed)
    && (ball.x >= paddle.x && ball.x <= paddle.x + paddle.width))
    {
        ball.directionY *= -1;

        // COLLISION BALL AVEC 3 PARTIES DU PADDLE
        if (ball.x + ball.radius <= paddle.x + paddle.width / 3 || ball.x - ball.radius <= paddle.x + paddle.width / 3) {
            ball.directionX = -1
        } else if (ball.x + ball.radius >= paddle.x + paddle.width * 2/3 || ball.x - ball.radius >= paddle.x + paddle.width * 2/3) {
            ball.directionX = 1
        } else {
            ball.directionX = 0
        }
    }

    // COLLISION BALL AVEC BRICKS
    bricks.forEach((brick) => {
        if(brick.collisions > 0) {
            if(ball.directionY == -1 && ball.y - ball.radius == brick.y + 20 ||
                ball.directionY == 1 && ball.y + ball.radius == brick.y) {
                    if(ball.x + ball.radius >= brick.x &&
                        ball.x + ball.radius <= brick.x + 100) {
                            brick.collisions--;
                            ball.directionY *= -1;
                        }
                }
        }
    })
}

function keyboardEvent(e) {
    switch(e.code) {
        case 'ArrowLeft':
            if (e.type == "keydown") {
                paddle.direction = -1;
            }
            else {
                paddle.direction = 0;
            }
            break;
        case 'ArrowRight':
            if (e.type == "keydown") {
                paddle.direction = 1;
            }
            else {
                paddle.direction = 0;
            }
            break;
        case "Space":
            if(e.type == "keydown") {
                if(game.start == false){
                    game.start = true;
                } else if(game.gameOver == true) {
                    game.gameOver = false;
                    game.start = false;
                    initPositions();
                    displayBricks();
                } else {
                    game.pause = !game.pause;
                }
            }
            break;
    }
}