const wallImageWidth = 64;
const wallImageHeight = 16;
const wallDepth = 16;
const ballSpeed = 4;
const ballRadius = 8;
const startingHealth = 100;
const enemyRows = 5;
const enemyColumns = 10;
const backgroundColor = [191, 191, 191];
const edgeColor = [0, 0, 0];
const defaultTextSize = 16;
const defaultTextColor = [0, 0, 0];
const defaultButtonBackgroundColor = [0, 191, 0];
const defaultButtonTextColor = [255, 255, 255];
let ballImage;
let enemyImage;
let wallImage;
let game;
let backgroundImage;
let menuImage;
let comradeImage;
let winImage;
let loseImage;

function normalizeAngle(angle) {
  return angle - 2 * Math.PI * Math.floor(angle / (2 * Math.PI));
}

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

  angle() {
    return normalizeAngle(
      Math.atan2(this.p2.y - this.p1.y, this.p2.x - this.p1.x)
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

  collisionWith(point) {
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

    if (d1 <= 0 && d2 <= 0 && d3 <= 0 && d4 <= 0) {
      const corner1 = new Line(point, this.l1.p1);
      const corner2 = new Line(point, this.l2.p1);
      const corner3 = new Line(point, this.l3.p1);
      const corner4 = new Line(point, this.l4.p1);
      const dist1 = corner1.length();
      const dist2 = corner2.length();
      const dist3 = corner3.length();
      const dist4 = corner4.length();

      if (dist1 <= dist2 && dist1 <= dist3 && dist1 <= dist4) {
        const line1 = new Line(this.l4.p1, this.l1.p1);
        const line2 = new Line(this.l2.p1, this.l1.p1);
        const angle1 = Math.abs(corner1.angle() - line1.angle());
        const angle2 = Math.abs(corner1.angle() - line2.angle());

        if (angle1 <= angle2) {
          return this.l4;
        } else {
          return this.l1;
        }
      } else if (dist2 <= dist1 && dist2 <= dist3 && dist2 <= dist4) {
        const line1 = new Line(this.l1.p1, this.l2.p1);
        const line2 = new Line(this.l3.p1, this.l2.p1);
        const angle1 = Math.abs(corner2.angle() - line1.angle());
        const angle2 = Math.abs(corner2.angle() - line2.angle());

        if (angle1 <= angle2) {
          return this.l1;
        } else {
          return this.l2;
        }
      } else if (dist3 <= dist1 && dist3 <= dist2 && dist3 <= dist4) {
        const line1 = new Line(this.l2.p1, this.l3.p1);
        const line2 = new Line(this.l4.p1, this.l3.p1);
        const angle1 = Math.abs(corner3.angle() - line1.angle());
        const angle2 = Math.abs(corner3.angle() - line2.angle());

        if (angle1 <= angle2) {
          return this.l2;
        } else {
          return this.l3;
        }
      } else if (dist4 <= dist1 && dist4 <= dist2 && dist4 <= dist3) {
        const line1 = new Line(this.l3.p1, this.l4.p1);
        const line2 = new Line(this.l1.p1, this.l4.p1);
        const angle1 = Math.abs(corner4.angle() - line1.angle());
        const angle2 = Math.abs(corner4.angle() - line2.angle());

        if (angle1 <= angle2) {
          return this.l3;
        } else {
          return this.l4;
        }
      }
    } else {
      return null;
    }
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

  draw() {
    if (this.drawing && !(this.startX === mouseX && this.startY === mouseY)) {
      drawWall(wallRect(this.startX, this.startY, mouseX, mouseY), 0.6);
    } else if (this.rect !== undefined) {
      drawWall(this.rect, 1.0);
    }
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

class Ball {
  constructor(position) {
    this.position = position;
    this.direction = undefined;
  }

  startMoving(x, y) {
    this.direction = normalizeAngle(
      Math.atan2(y - this.position.y, x - this.position.x)
    );
  }

  update() {
    if (this.direction !== undefined) {
      this.position = new Point(
        this.position.x + ballSpeed * Math.cos(this.direction),
        this.position.y + ballSpeed * Math.sin(this.direction)
      );
    }

    if (this.position.y >= height) {
      game.lose();
      return;
    }

    if (this.position.x < 0 || this.position.x >= width) {
      const directionX = Math.cos(this.direction);
      const directionY = Math.sin(this.direction);
      this.direction = normalizeAngle(Math.atan2(directionY, -directionX));
    }

    if (this.position.y < 0) {
      const directionX = Math.cos(this.direction);
      const directionY = Math.sin(this.direction);
      this.direction = normalizeAngle(Math.atan2(-directionY, directionX));
    }
  }

  draw() {
    this.update();

    push();

    // TODO: display image
    stroke(0);
    fill(255);
    circle(this.position.x, this.position.y, ballRadius * 2);

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

    this.reset();
  }

  reset() {
    this.drawingWall = new DrawingWall();
    this.ball = new Ball(new Point(width / 2, height - 100));
    // this.enemies = ;
    this.health = startingHealth;
  }

  play() {
    this.reset();
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
    let comradeCam = document.querySelector('#comrade-cam');

    if (this.inMainMenu()) {
      document.body.style.backgroundImage = "url('assets/menu_screen_art_scaled.png')";
      document.body.classList.add('main-menu');
      comradeCam.style.display = 'none'; // Hide the comrade-cam
      this.startText.draw();
      this.startButton.draw();

      if (this.startButton.clicking()) {
        this.play();
      }
    } else if (this.inGame()) {
      document.body.style.backgroundImage = "url('assets/background_wide_siteres2.gif')";
      document.body.classList.remove('main-menu');
      comradeCam.style.display = 'block'; // Unhide the comrade
      comradeCam.style.backgroundImage = 'url(' + comradeImage + ')';

      this.drawingWall.draw();
      this.ball.draw();
    } else if (this.inWinScreen()) {
      this.winText.draw();
      this.playAgainButton.draw();

      if (this.playAgainButton.clicking()) {
        this.play();
      }
    } else if (this.inLoseScreen()) {
      this.loseText.draw();
      this.playAgainButton.draw();
      comradeImage = "assets/dyatlov_rip.gif";
      comradeCam.style.backgroundImage = 'url(' + comradeImage + ')';
      background(loseImage);
      if (this.playAgainButton.clicking()) {
        this.play();
      }
    }
  }
}

function setup() {
  createCanvas(800, 600);
  stroke(255);
  frameRate(60);

  comradeImage = "assets/dyatlov_stare.png";
  ballImage = loadImage("assets/ball.png");
  enemyImage = loadImage("assets/enemy.png");
  wallImage = loadImage("assets/wall.png");
  winImage = loadImage("assets/win.png");
  loseImage = loadImage("assets/loser.png");
  game = new Game();
}

function draw() {
  stroke(0);
  background(...backgroundColor);

  game.draw();

  if (game.drawingWall.rect !== undefined) {
    const collision = game.drawingWall.rect.collisionWith(game.ball.position);

    if (collision !== null) {
      push();
      stroke(255, 0, 0);
      strokeWeight(4);
      line(collision.p1.x, collision.p1.y, collision.p2.x, collision.p2.y);
      pop();
    }
  }
}

function mousePressed() {
  if (game.inGame()) {
    if (game.ball.direction === undefined) {
      game.ball.startMoving(mouseX, mouseY);
    } else {
      game.drawingWall.drawStart(mouseX, mouseY);
    }
  }
}

function mouseReleased() {
  if (
    game.inGame() &&
    game.drawingWall.drawing &&
    !(game.drawingWall.startX === mouseX && game.drawingWall.startY === mouseY)
  ) {
    game.drawingWall.drawEnd(mouseX, mouseY);
  } else {
    game.drawingWall.clearDrawing();
  }
}
