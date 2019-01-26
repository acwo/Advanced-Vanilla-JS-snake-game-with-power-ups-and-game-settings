const canvas = document.getElementById('snake');
const ctx = canvas.getContext('2d');

// ------------------------------------------------------------------------------------- //
// -----------------------------     USER SETTINGS       ------------------------------ //
// ----------------------------------------------------------------------------------- //

const getLevel = document.querySelector('select[name="js-snake-level-select"]');
const getSnakeSpeed = document.querySelector('input[name="js-snake-speed"]');
const getDuration= document.querySelector('input[name="js-snake-duration"]');
const getSnakeSize = document.querySelector('input[name="js-snake-size"]');
const saveSettingsButton = document.getElementById('js-snake-saveSettings');
let scoreIncrease = 1;

//Save the value to sessionStorrage as (key - html input name, value - html input value)
function saveInputValue(e){
  let key = e.name;
  let value = e.value;
  sessionStorage.setItem(key, value);
}

// get the saved value function - return the value of "key" from sessionStorage.
function getSavedInputValue (key){
  if (sessionStorage.getItem(key) === null) {
      return "10";
  }
  else if (sessionStorage.getItem(key) < 5) {
    return "5";
}
  else if (sessionStorage.getItem(key) > 50) {
      return "50";
  }
  else {
      return sessionStorage.getItem(key);
  }
}

function getSavedSelectValue (key){
      return sessionStorage.getItem(key);
}


// Unfortunatelly passing sessionStorage values as constants doesn't seem to update gameloop dynamically as functions do
// let getSnakeSpeedValue = getSavedInputValue("js-snake-speed");

saveSettingsButton.addEventListener('click', function() {
  saveInputValue(getSnakeSpeed);
  saveInputValue(getDuration);
  saveInputValue(getSnakeSize);
  saveInputValue(getLevel);
  clearInterval(gameLoop);
    gameLoop = setInterval(function() {
      move(beast);
      draw(beast);
      updateScores();
      levels();
    }, 1000/getSavedInputValue("js-snake-speed"));
});

// ------------------------------------------------------------------------------------- //
// -----------------------------     GAME SETTINGS       ------------------------------ //
// ----------------------------------------------------------------------------------- //

let boardWidth = canvas.width = 500;
let boardHeight = canvas.height = 500;
let cellSize = 10;

const colorBg = "#e8eaed";
const colorSnake = "#252526";

let level0 = false;
let level1 = false;
let level2 = false;
let level3 = false;
let level4 = false;

let start = false;
let isGameOver = false;
let score = 0;
let highest = 0;
let collision = [];

// Apples an PowerUps

let ax;
let ay;
let px;
let py;

let apple = [[ax, ay]];
let powerups = [[px, py]];

// ------------------------------------------------------------------------------------- //
// ----------------------------------     KEYBOARD       ------------------------------ //
// ----------------------------------------------------------------------------------- //

window.addEventListener("keydown", function(e) {

  // Spacebar = play the game at start menu
  if (e.keyCode == 32 && !start) {
    e.preventDefault();
    start = true;
  }
  // Spacebar - play the game at isGameOver menu
  if (e.keyCode == 32 && isGameOver) {
    e.preventDefault();
    reset();
  }

  // Up arrow
  if (e.keyCode == 38) {
    e.preventDefault();
    if (beast.moveDown > 0) {
      return;
    }
    else {
      beast.moveUp = cellSize;
      beast.moveRight = 0;
      beast.moveLeft = 0;
    }
  }

  // Right arrow
  if (e.keyCode == 39) {
    e.preventDefault();
    if (beast.moveLeft > 0) {
      return;
    }
    else {
      beast.moveRight = cellSize;
      beast.moveUp = 0;
      beast.moveDown = 0;
    }
  }

  // Down arrow
  if (e.keyCode == 40) {
    e.preventDefault();
    if (beast.moveUp > 0) {
      return;
    }
    else {
      beast.moveDown = cellSize;
      beast.moveRight = 0;
      beast.moveLeft = 0;
    }
  }

  // Left arrow
  if (e.keyCode == 37) {
    e.preventDefault();
    if (beast.moveRight > 0) {
      return;
    }
    else {
      beast.moveLeft = cellSize;
      beast.moveUp = 0;
      beast.moveDown = 0;
    }
  }

})

// ------------------------------------------------------------------------------------- //
// ---------------------------------     FUNCTIONS       ------------------------------ //
// ----------------------------------------------------------------------------------- //

function Beast(x,y,moveRight,moveDown,moveUp,moveLeft,tail) {
  this.x = x;
  this.y = y;
  this.moveRight = moveRight;
  this.moveDown = moveDown;
  this.moveUp = moveUp;
  this.moveLeft = moveLeft;
  this.tail = tail;
  this.stop = stop;
}

let beast = new Beast(cellSize, 0, cellSize, 0, 0, 0, [ [this.x, this.y], [this.x - cellSize, this.y] ], false, 0);

function startScreen() {
  if (start) {
    return;
  }
  else {
    ctx.fillStyle = colorBg;
    ctx.fillRect(0,0,boardWidth,boardHeight);
	  ctx.textBaseline="bottom";
	  ctx.textAlign = "center";
    ctx.font = "bold 60px serif";
    ctx.fillStyle = colorSnake;
	  ctx.fillText("Snake", 250, 250);
    ctx.font = "15px sans-serif";
    ctx.fillText("Press SPACE to play", 250, 270);
  }
}

function reset() {
  level0 = true;
  level1 = false;
  level2 = false;
  level3 = false;
  level4 = false;
  score = 0;
  apple = [
    [
      Math.floor(Math.random() * boardWidth / cellSize) * cellSize,
      Math.floor(Math.random() * boardHeight / cellSize) * cellSize
    ]
  ];
  beast.x = 60;
  beast.y = 150;
  beast.tail = [
    [cellSize,0],
    [0,0]
  ];
  beast.moveDown = 0;
  beast.moveUp = 0;
  beast.moveLeft = 0;
  beast.moveRight = cellSize;
  isGameOver = false;
}

// Add food to snake tail
function snakegrow(b, apple) {
  b.tail.push([apple[0], apple[1]]);
}

// Hide powerup after eating
function goToBelly() {
  powerups[0] = [];
}

function move() {
  for (let a = 0; a < arguments.length; a++) {

    //positionchange
    arguments[a].x += arguments[a].moveRight;
    arguments[a].x -= arguments[a].moveLeft;
    arguments[a].y += arguments[a].moveDown;
    arguments[a].y -= arguments[a].moveUp;

    // Game Over if Snake eats himself
    for (let s = 0; s < collision.length; s++) {
      if (arguments[a].x == collision[s][0] && arguments[a].y == collision[s][1]) {
        isGameOver = true;
      }
    }

  // Crashes conditions

    // Go through walls
    if (level0 || level1 || level2 || level3) {
      if (arguments[a].x < 0) {
        arguments[a].x = boardWidth - cellSize;
      }
      if (arguments[a].x > boardWidth - cellSize) {
        arguments[a].x = 0;
      }
      if (arguments[a].y < 0) {
        arguments[a].y = boardHeight - cellSize;
      }
      if (arguments[a].y > boardHeight - cellSize) {
        arguments[a].y = 0;
      }
    }

    // Crash on labirynth borders

    if (level1 || level2 || level3) {

      // Top left border
      if ((arguments[a].x == 0 && (0 < arguments[a].y && arguments[a].y < 100)) || (arguments[a].y == 0 && (0 < arguments[a].x && arguments[a].x < 100)) ) {
        isGameOver = true;
      }

      // Top right border
      if ((arguments[a].x == 490 && (0 < arguments[a].y && arguments[a].y < 100)) || (arguments[a].y == 0 && (400 <= arguments[a].x && arguments[a].x < 500)) ) {
        isGameOver = true;
      }

      // Bottom right border
      if ((arguments[a].x == 490 && (400 <= arguments[a].y && arguments[a].y < 500)) || (arguments[a].y == 490 && (400 <= arguments[a].x && arguments[a].x < 500)) ) {
        isGameOver = true;
      }

      // Bottom left border
      if ((arguments[a].x == 0 && (400 <= arguments[a].y && arguments[a].y < 500)) || (arguments[a].y == 490 && (0 < arguments[a].x && arguments[a].x < 100)) ) {
        isGameOver = true;
      }

    }

    if (level2 || level3 || level4) {

      // Top center
      if (arguments[a].y == 100 && (100 <= arguments[a].x && arguments[a].x <= 390) ) {
        isGameOver = true;
      }

      // Bottom center
      if (arguments[a].y == 390 && (100 <= arguments[a].x && arguments[a].x <= 390) ) {
        isGameOver = true;
      }

    }

    if (level3 || level4) {

      // Left center
      if (arguments[a].x == 50 && (110 <= arguments[a].y && arguments[a].y <= 390) ) {
        isGameOver = true;
      }

      // Right center
      if (arguments[a].x == 440 && (110 <= arguments[a].y && arguments[a].y <= 390) ) {
        isGameOver = true;
      }

    }

    if (level4) {
      if (arguments[a].x == 0 || arguments[a].x == 490 || arguments[a].y == 0 || arguments[a].y == 490 ) {
        isGameOver = true;
      }
    }

  // End of Crashes conditions

    // Move arguments[a].tail: to previous
    for (let i = arguments[a].tail.length - 1; i > 0; i--) {
      arguments[a].tail[i][0] = arguments[a].tail[i-1][0];
      arguments[a].tail[i][1] = arguments[a].tail[i-1][1];
    }

    // Set the position of the head to x and y
    arguments[a].tail[0][1] = arguments[a].y;
    arguments[a].tail[0][0] = arguments[a].x;

    // Check if snake ate herself
    for (let f = 2; f < arguments[a].tail.length; f++) {
      if (arguments[a].tail[0][0] == arguments[a].tail[f][0] && arguments[a].tail[0][1] == arguments[a].tail[f][1]) {
        isGameOver = true;
      }
    }

  // If snake eats the apple get a new random position for the food and let the snake grow
  for (let b = 0; b < apple.length; b++) {
    if (arguments[a].x == apple[b][0] && arguments[a].y == apple[b][1]) {
      score += scoreIncrease;

      for (let t = 0; t < 1; t++) {
        snakegrow(arguments[a],apple[b]);
      }

      apple[b] = [];

      apple[0][0] = Math.floor(Math.random() * boardWidth / cellSize) * cellSize;
      apple[0][1] = Math.floor(Math.random() * boardHeight / cellSize) * cellSize;

      if (Math.random() > 0.1 && score > 0) {
          px = Math.floor(Math.random() * boardWidth / cellSize) * cellSize;
          py = Math.floor(Math.random() * boardHeight / cellSize) * cellSize;
          powerups[0] = [px,py,Math.floor((Math.random() * 6) + 1)];

          // Secure Shorten Powerup
          if (powerups[0][2] == 5 && beast.tail.length < parseInt(getSavedInputValue("js-snake-size")) + 2) {
            console.log("Math.random draw Shorten PowerUp but snake length was shorten than " + (parseInt(getSavedInputValue("js-snake-size")) + 2));
            powerups[0] = [px,py,Math.floor((Math.random() * 6) + 1)];
          }
        }
      }
    }

    for (let h = 0; h < powerups.length; h++) {
      if (arguments[a].x == powerups[h][0] && arguments[a].y == powerups[h][1]) {
        power(powerups[h][2], arguments[a]);
        // return;
      }
    }
	}
}

// Have to do it a simpler way without repeating myself!!
function moveThruWalls() {
  for (let a = 0; a < arguments.length; a++) {

    //positionchange
    arguments[a].x += arguments[a].moveRight;
    arguments[a].x -= arguments[a].moveLeft;
    arguments[a].y += arguments[a].moveDown;
    arguments[a].y -= arguments[a].moveUp;

    // Game Over if Snake eats himself
    for (let s = 0; s < collision.length; s++) {
      if (arguments[a].x == collision[s][0] && arguments[a].y == collision[s][1]) {
        isGameOver = true;
      }
    }

  // Crashes conditions

    // Go through walls
    if (level0 || level1 || level2 || level3 || level4) {
      if (arguments[a].x < 0) {
        arguments[a].x = boardWidth - cellSize;
      }
      if (arguments[a].x > boardWidth - cellSize) {
        arguments[a].x = 0;
      }
      if (arguments[a].y < 0) {
        arguments[a].y = boardHeight - cellSize;
      }
      if (arguments[a].y > boardHeight - cellSize) {
        arguments[a].y = 0;
      }
    }

  // End of Crashes conditions

  // Move arguments[a].tail: to previous
    for (let i = arguments[a].tail.length - 1; i > 0; i--) {
      arguments[a].tail[i][0] = arguments[a].tail[i-1][0];
      arguments[a].tail[i][1] = arguments[a].tail[i-1][1];
    }
    // Set the position of the head to x and y
    arguments[a].tail[0][1] = arguments[a].y;
    arguments[a].tail[0][0] = arguments[a].x;

    // Check if snake ate herself
    for (let f = 2; f < arguments[a].tail.length; f++) {
      if (arguments[a].tail[0][0] == arguments[a].tail[f][0] && arguments[a].tail[0][1] == arguments[a].tail[f][1]) {
        isGameOver = true;
      }
    }

  // If snake eats the apple get a new random position for the food and let the snake grow
  for (let b = 0; b < apple.length; b++) {
    if (arguments[a].x == apple[b][0] && arguments[a].y == apple[b][1]) {
      score += scoreIncrease;

      for (let t = 0; t < 1; t++) {
        snakegrow(arguments[a],apple[b]);
      }

      apple[b] = [];

      apple[0][0] = Math.floor(Math.random() * boardWidth / cellSize) * cellSize;
      apple[0][1] = Math.floor(Math.random() * boardHeight / cellSize) * cellSize;

      if (Math.random() > 0.1 && score > 3) {
          px = Math.floor(Math.random() * boardWidth / cellSize) * cellSize;
          py = Math.floor(Math.random() * boardHeight / cellSize) * cellSize;
          powerups[0] = [px,py,Math.floor((Math.random() * 6) + 1)];
          // powerups[0] = [px,py,6];

          // Secure Shorten Powerup
          if (powerups[0][2] == 5 && beast.tail.length < parseInt(getSavedInputValue("js-snake-size")) + 2) {
            console.log("Math.random draw Shorten PowerUp but snake length was shorten than " + (parseInt(getSavedInputValue("js-snake-size")) + 2));
            powerups[0] = [px,py,Math.floor((Math.random() * 6) + 1)];
          }
        }
      }
    }

    for (let h = 0; h < powerups.length; h++) {
      if (arguments[a].x == powerups[h][0] && arguments[a].y == powerups[h][1]) {
        power(powerups[h][2], arguments[a]);
        // return;
      }
    }
	}
}

function power(index, fig) {
  if (index == 1) {
    score += scoreIncrease * parseInt(getSavedInputValue("js-snake-size"));
    goToBelly();
    console.info("Powerup SCORE * " + getSavedInputValue("js-snake-size"));
  }
  else if (index == 2) {
    clearInterval(gameLoop);
    gameLoop = setInterval(function() {
      move(beast);
      draw(beast);
      updateScores();
      levels();
    }, 1000/(getSavedInputValue("js-snake-speed") / 2));
    setTimeout(function() {
      clearInterval(gameLoop);
      gameLoop = setInterval(function() {
        move(beast);
        draw(beast);
        updateScores();
        levels();
      }, 1000/getSavedInputValue("js-snake-speed"));
    }, 1000 * getSavedInputValue("js-snake-duration"));
    goToBelly();
    console.info("Powerup SLOW DOWN for " + getSavedInputValue("js-snake-duration") + " seconds");

  }
  else if (index == 3) {
    clearInterval(gameLoop);
    gameLoop = setInterval( function() {
      move(beast);
      draw(beast);
      updateScores();
      levels();
    }, 1000/(getSavedInputValue("js-snake-speed") * 1.3));
    setTimeout(function() {
      clearInterval(gameLoop);
      gameLoop = setInterval(function() {
        move(beast);
        draw(beast);
        updateScores();
        levels();
      }, 1000/getSavedInputValue("js-snake-speed"));
    }, 1000 * getSavedInputValue("js-snake-duration"));
    goToBelly();
    console.info("Powerup SPEED UP for " + getSavedInputValue("js-snake-duration"));
  }

  else if (index == 4) {
    function snakeExtend(figure) {
      for (let x = 0; x < parseInt(getSavedInputValue("js-snake-size")); x++) {
        figure.tail.push([x]);
      }
    }
    snakeExtend(beast);
    score += parseInt(getSavedInputValue("js-snake-size"));
    goToBelly();
    console.info("Powerup EXTEND by " + getSavedInputValue("js-snake-size"));
  }

  else if (index == 5) {
      function snakeShorten(figure) {
          figure.tail.length -= parseInt(getSavedInputValue("js-snake-size"));
      }
      if (beast.tail.length > parseInt(getSavedInputValue("js-snake-size")) + 2) {
        snakeShorten(beast);
        score -= parseInt(getSavedInputValue("js-snake-size"));
      }
      goToBelly();
      console.info("Powerup SHORTEN by " + getSavedInputValue("js-snake-size"));

    }

  else if (index == 6) {
    clearInterval(gameLoop);
    gameLoop = setInterval(function() {
      moveThruWalls(beast);
      draw(beast);
      updateScores();
      levels();
    }, 1000/getSavedInputValue("js-snake-speed"));
    setTimeout(function() {
      clearInterval(gameLoop);
      gameLoop = setInterval(function() {
        move(beast);
        draw(beast);
        updateScores();
        levels();
      }, 1000/getSavedInputValue("js-snake-speed"));
    }, 1000 * getSavedInputValue("js-snake-duration"));
    goToBelly();
    console.info("Powerup GO THROUGH EVERY WALL for " + getSavedInputValue("js-snake-duration") + " seconds");
    }

}

function draw() {
  ctx.fillStyle = colorBg;
  ctx.fillRect(0,0,boardWidth,boardHeight);

  if (level1 || level2 || level3 || level4) {
      ctx.lineWidth = cellSize * 2;
      ctx.strokeStyle = "red";
      // Top left X
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(100, 0);
      ctx.stroke();
      // Top left Y
      ctx.moveTo(0, 0);
      ctx.lineTo(0, 100);
      ctx.stroke();
      // Top right X
      ctx.moveTo(500, 0);
      ctx.lineTo(400, 0);
      ctx.stroke();
      ctx.closePath();
      // Top right Y
      ctx.beginPath();
      ctx.moveTo(500, 0);
      ctx.lineTo(500, 100);
      ctx.stroke();
      // Bottom right X
      ctx.moveTo(500, 500);
      ctx.lineTo(400, 500);
      ctx.stroke();
      // Bottom right Y
      ctx.moveTo(500, 500);
      ctx.lineTo(500, 400);
      ctx.stroke();
      // Bottom left X
      ctx.moveTo(0, 500);
      ctx.lineTo(100, 500);
      ctx.stroke();
      // Bottom left Y
      ctx.moveTo(0, 500);
      ctx.lineTo(0, 400);
      ctx.stroke();
      ctx.closePath();
    }

  if (level2 || level3 || level4) {
    ctx.lineWidth = cellSize;
    ctx.strokeStyle = "red";
    // Top center
    ctx.beginPath();
    ctx.moveTo(100, 105);
    ctx.lineTo(400, 105);
    ctx.stroke();
    ctx.closePath();
    // Bottom center
    ctx.beginPath();
    ctx.moveTo(400, 395);
    ctx.lineTo(100, 395);
    ctx.stroke();
    ctx.closePath();
  }

  if (level3 || level4) {
    ctx.lineWidth = cellSize;
    ctx.strokeStyle = "red";
    // Left center
    ctx.beginPath();
    ctx.moveTo(55, 110);
    ctx.lineTo(55, 390);
    ctx.stroke();
    ctx.closePath();
    // Right center
    ctx.beginPath();
    ctx.moveTo(445, 110);
    ctx.lineTo(445, 390);
    ctx.stroke();
    ctx.closePath();
  }

  if ( level4) {
      ctx.lineWidth = cellSize * 2;
      ctx.strokeStyle = "red";
      ctx.beginPath();
      // Top left y
      ctx.moveTo(0, 0);
      ctx.lineTo(0, 500);
      // Bottom left X
      ctx.moveTo(0, 500);
      ctx.lineTo(500, 500);
      // Bottom top Y
      ctx.moveTo(500, 500);
      ctx.lineTo(500, 0);
      // Top right X
      ctx.moveTo(500, 0);
      ctx.lineTo(0, 0);
      ctx.stroke();
      ctx.closePath();
  }

  if (isGameOver) {
    ctx.fillStyle = "red";
    ctx.textBaseline= "bottom";
    ctx.textAlign = "center";
    ctx.font = "bold 60px serif";
    ctx.fillText("Game over!", 250, 250);
    ctx.font = "15px sans-serif"
    ctx.fillStyle = colorSnake;
    ctx.fillText("Press SPACE to play again", 250, 270);
  }

  else if (!isGameOver){

    ctx.fillStyle = colorSnake;
    for (let a = 0; a < apple.length; a++) {
      ctx.fillRect(apple[a][0],apple[a][1],cellSize,cellSize)
    }

    for (let h = 0; h < powerups.length; h++) {
      switch (powerups[h][2]) {
        case 1: ctx.fillStyle = "green";
        break;
        case 2: ctx.fillStyle = "orange";
        break;
        case 3: ctx.fillStyle = "red";
        break;
        case 4: ctx.fillStyle = "purple";
        break;
        case 5: ctx.fillStyle = "blue";
        break;
        case 6: ctx.fillStyle = "pink";
        break;
      }
      ctx.fillRect(powerups[h][0],powerups[h][1],cellSize,cellSize);
    }

    ctx.lineWidth = 0.7;
    ctx.strokeStyle = colorBg;
    ctx.fillStyle = colorSnake;
    for (let k = 0; k < arguments.length; k++) {
      for (let i = 0; i < arguments[k].tail.length; i++) {
        ctx.fillRect(arguments[k].tail[i][0],arguments[k].tail[i][1],cellSize,cellSize);
        ctx.strokeRect(arguments[k].tail[i][0],arguments[k].tail[i][1],cellSize,cellSize);
      }
      if (arguments[k].stop > 0) {(arguments[k].stop)--;}
    }
  }

// let hue = 0;
// ctx.strokeStyle = `hsl(${hue}, 100%, 50%)`;
// hue += 10;
// console.log(hue);

}

function updateScores() {
  document.getElementById("score").innerHTML = score;
  document.getElementById("highest").innerHTML = highest;

  if(score >= highest)  {
    sessionStorage.setItem("highest", score);
    highest = score;
  }
}

reset();
if (sessionStorage.highest > highest) {
  highest = sessionStorage.highest;
}
let gameLoop = setInterval( function() {
  move(beast);
  draw(beast);
  updateScores();
  startScreen();
  levels();
}, 1000/getSavedInputValue("js-snake-speed"));

function levels() {
  if(score >= 10) {
    level1 = true;
  }
  if(score >= 20) {
    level2 = true;
  }
  if(score >= 30) {
    level3 = true;
  }
  if(score >= 40) {
    level4 = true;
  }
  if ((parseInt(getSavedSelectValue("js-snake-level-select"))) == 0) {
    level0 = true;
    level1 = false;
    level2 = false;
    level3 = false;
    level4 = false;
  }
  if ((parseInt(getSavedSelectValue("js-snake-level-select"))) == 1) {
    level0 = false;
    level1 = true;
    level2 = false;
    level3 = false;
    level4 = false;
  }
  if ((parseInt(getSavedSelectValue("js-snake-level-select"))) == 2) {
    level0 = false;
    level1 = false;
    level2 = true;
    level3 = false;
    level4 = false;
  }
  if ((parseInt(getSavedSelectValue("js-snake-level-select"))) == 3) {
    level0 = false;
    level1 = false;
    level2 = false;
    level3 = true;
    level4 = false;
  }
  if ((parseInt(getSavedSelectValue("js-snake-level-select"))) == 4) {
    level0 = false;
    level1 = false;
    level2 = false;
    level3 = false;
    level4 = true;
  }
}
