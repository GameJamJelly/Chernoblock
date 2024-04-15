const wallImageWidth = 64;
const wallImageHeight = 16;
const wallDepth = 16;
const startingHealth = 100;
const enemyRows = 5;
const enemyColumns = 10;
const defaultTextSize = 16;
const defaultTextColor = [255, 255, 255];
const defaultButtonBackgroundColor = [0, 191, 0];
const defaultButtonTextColor = [255, 255, 255];
let playerImage;
let ballImage;
let enemyImage;
let wallImage;

function wallRect(x1, y1, x2, y2) {
  const angle = Math.atan2(y2 - y1, x2 - x1) + Math.PI / 2;
  const p1 = new Point(
    x1 - (wallDepth / 2) * Math.cos(angle),
    y1 - (wallDepth / 2) * Math.sin(angle)
  );
  const p2 = new Point(
    x1 - (wallDepth / 2) * Math.cos(angle + Math.PI),
    y1 - (wallDepth / 2) * Math.sin(angle + Math.PI)
  );
  const p3 = new Point(
    x2 - (wallDepth / 2) * Math.cos(angle + Math.PI),
    y2 - (wallDepth / 2) * Math.sin(angle + Math.PI)
  );
  const p4 = new Point(
    x2 - (wallDepth / 2) * Math.cos(angle),
    y2 - (wallDepth / 2) * Math.sin(angle)
  );

  return new Rectangle(
    new Line(p1, p2),
    new Line(p2, p3),
    new Line(p3, p4),
    new Line(p4, p1)
  );
}

function drawWall(rect, opacity) {
  const x = (rect.l1.p1.x + rect.l3.p1.x) / 2;
  const y = (rect.l1.p1.y + rect.l3.p1.y) / 2;
  const rectWidth = rect.l2.length();
  const rectHeight = rect.l1.length();
  const rotation = Math.atan2(
    rect.l4.p1.y - rect.l4.p2.y,
    rect.l4.p1.x - rect.l4.p2.x
  );

  push();

  imageMode(CENTER);
  translate(x, y);
  rotate(rotation);
  tint(255, opacity * 255);
  image(wallImage, 0, 0, rectWidth, rectHeight);

  pop();
}

class Player {
  constructor(x, y, d, color) {
    this.x = x;
    this.y = y;
    this.d = d;
    this.r = d / 2;
    this.color = color;
    this.vel = {
      x: 1,
      y: 1,
    };
  }
}

class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

class Line {
  constructor(p1, p2) {
    this.p1 = p1;
    this.p2 = p2;
  }

  length() {
    return Math.sqrt(
      Math.pow(this.p2.x - this.p1.x, 2) + Math.pow(this.p2.y - this.p1.y, 2)
    );
  }
}

class Rectangle {
  constructor(l1, l2, l3, l4) {
    this.l1 = l1;
    this.l2 = l2;
    this.l3 = l3;
    this.l4 = l4;
  }

  pointInside(point) {
    const d1 =
      (this.l1.p2.x - this.l1.p1.x) * (point.y - this.l1.p1.y) -
      (this.l1.p2.y - this.l1.p1.y) * (point.x - this.l1.p1.x);
    const d2 =
      (this.l2.p2.x - this.l2.p1.x) * (point.y - this.l2.p1.y) -
      (this.l2.p2.y - this.l2.p1.y) * (point.x - this.l2.p1.x);
    const d3 =
      (this.l3.p2.x - this.l3.p1.x) * (point.y - this.l3.p1.y) -
      (this.l3.p2.y - this.l3.p1.y) * (point.x - this.l3.p1.x);
    const d4 =
      (this.l4.p2.x - this.l4.p1.x) * (point.y - this.l4.p1.y) -
      (this.l4.p2.y - this.l4.p1.y) * (point.x - this.l4.p1.x);

    return d1 <= 0 && d2 <= 0 && d3 <= 0 && d4 <= 0;
  }

  draw() {
    push();

    strokeWeight(2);
    stroke(255, 0, 0);
    line(this.l1.p1.x, this.l1.p1.y, this.l1.p2.x, this.l1.p2.y);
    stroke(0, 255, 0);
    line(this.l2.p1.x, this.l2.p1.y, this.l2.p2.x, this.l2.p2.y);
    stroke(0, 0, 255);
    line(this.l3.p1.x, this.l3.p1.y, this.l3.p2.x, this.l3.p2.y);
    stroke(255);
    line(this.l4.p1.x, this.l4.p1.y, this.l4.p2.x, this.l4.p2.y);

    pop();
  }
}

class DrawingWall {
  constructor() {
    this.drawing = false;
    this.line = undefined;
    this.rect = undefined;
    this.startX = undefined;
    this.startY = undefined;
  }

  drawStart(x, y) {
    this.drawing = true;
    this.line = undefined;
    this.rect = undefined;
    this.startX = x;
    this.startY = y;
  }

  drawEnd(x, y) {
    this.drawing = false;
    this.line = new Line(new Point(this.startX, this.startY), new Point(x, y));
    this.rect = wallRect(this.startX, this.startY, x, y);
    this.startX = undefined;
    this.startY = undefined;
  }

  clearDrawing() {
    this.drawing = false;
    this.line = undefined;
    this.rect = undefined;
    this.startX = undefined;
    this.startY = undefined;
  }
}

class GameText {
  constructor(options) {
    this.text = options.text ?? "";
    this.textSize = options.textSize ?? defaultTextSize;
    this.textColor = options.textColor ?? defaultTextColor;
    this.pos = options.pos;
  }

  draw() {
    push();

    textAlign(CENTER, CENTER);
    textSize(this.textSize);
    fill(...this.textColor);
    text(this.text, ...this.pos);

    pop();
  }
}

class GameButton {
  constructor(options) {
    this.text = options.text ?? "";
    this.textSize = options.textSize ?? defaultTextSize;
    this.backgroundColor =
      options.backgroundColor ?? defaultButtonBackgroundColor;
    this.textColor = options.textColor ?? defaultButtonTextColor;
    this.rect = options.rect;
  }

  clicking() {
    return (
      mouseIsPressed &&
      mouseX >= this.rect[0] &&
      mouseX < this.rect[0] + this.rect[2] &&
      mouseY >= this.rect[1] &&
      mouseY < this.rect[1] + this.rect[3]
    );
  }

  draw() {
    push();

    const buttonCenter = [
      this.rect[0] + this.rect[2] / 2,
      this.rect[1] + this.rect[3] / 2,
    ];

    strokeWeight(0);
    fill(...this.backgroundColor);
    rect(...this.rect);
    textAlign(CENTER, CENTER);
    textSize(this.textSize);
    fill(...this.textColor);
    text(this.text, ...buttonCenter);

    pop();
  }
}

class Game {
  constructor() {
    this.played = false;
    this.playing = false;
    this.won = false;

    this.startText = new GameText({
      text: "The Blockening",
      textSize: 48,
      pos: [400, 200],
    });
    this.startButton = new GameButton({
      text: "Start",
      textSize: 20,
      rect: [325, 350, 150, 50],
    });
    this.winText = new GameText({
      text: "You Win!",
      textSize: 48,
      pos: [400, 200],
    });
    this.loseText = new GameText({
      text: "Game Over!",
      textSize: 48,
      pos: [400, 200],
    });
    this.playAgainButton = new GameButton({
      text: "Play again",
      textSize: 20,
      rect: [325, 350, 150, 50],
    });

    // this.enemies = ;
    this.health = startingHealth;
  }

  play() {
    this.playing = true;
  }

  win() {
    this.played = true;
    this.playing = false;
    this.won = true;
  }

  lose() {
    this.played = true;
    this.playing = false;
    this.won = false;
  }

  inMainMenu() {
    return !this.played && !this.playing;
  }

  inGame() {
    return this.playing;
  }

  inWinScreen() {
    return !this.playing && this.won;
  }

  inLoseScreen() {
    return !this.playing && !this.won;
  }

  draw() {
    push();

    if (this.inMainMenu()) {
      // TODO: draw game start state in background
      this.startText.draw();
      this.startButton.draw();

      if (this.startButton.clicking()) {
        this.play();
      }
    } else if (this.inGame()) {
      // TODO: draw the game
    } else if (this.inWinScreen()) {
      // TODO: draw final game state in background
      this.winText.draw();
      this.playAgainButton.draw();

      if (this.playAgainButton.clicking()) {
        this.play();
      }
    } else if (this.inLoseScreen()) {
      // TODO: draw final game state in background
      this.loseText.draw();
      this.playAgainButton.draw();

      if (this.playAgainButton.clicking()) {
        this.play();
      }
    }

    pop();
  }
}

const game = new Game();
const drawingWall = new DrawingWall();
const circle1 = new Player(50, 50, 16, "red");

function setup() {
  createCanvas(800, 600);
  stroke(255);
  frameRate(30);

  playerImage = loadImage("assets/player.png");
  ballImage = loadImage("assets/ball.png");
  enemyImage = loadImage("assets/enemy.png");
  wallImage = loadImage("assets/wall.png");
}

function draw() {
  stroke(255);
  background(0);

  if (
    drawingWall.drawing &&
    !(drawingWall.startX === mouseX && drawingWall.startY === mouseY)
  ) {
    drawWall(
      wallRect(drawingWall.startX, drawingWall.startY, mouseX, mouseY),
      0.6
    );
  } else if (drawingWall.rect !== undefined) {
    drawWall(drawingWall.rect, 1.0);
  }

  strokeWeight(0);
  if (checkWallCollision()) {
    fill(63, 0, 255);
  } else {
    fill(255);
  }

  game.draw();
  updatePlayerCoor();
}

function updatePlayerCoor() {
  circle1.x = circle1.x + circle1.vel.x;
  circle1.y = circle1.y + circle1.vel.y;
  circle(circle1.x, circle1.y, circle1.d);
}

function checkWallCollision() {
  return drawingWall.rect !== undefined
    ? drawingWall.rect.pointInside(new Point(circle1.x, circle1.y))
    : false;
}

function mousePressed() {
  if (game.inGame()) {
    drawingWall.drawStart(mouseX, mouseY);
  }
}

function mouseReleased() {
  if (
    game.inGame() &&
    drawingWall.drawing &&
    !(drawingWall.startX === mouseX && drawingWall.startY === mouseY)
  ) {
    drawingWall.drawEnd(mouseX, mouseY);
  }
}
