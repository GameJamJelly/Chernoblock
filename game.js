const wallImageWidth = 64;
const wallImageHeight = 16;
const wallDepth = 16;
const potentialWallOpacity = 0.6;
const ballSpeed = 4;
const ballRadius = 8;
const startingHealth = 100;
const healthPerEnemyDestroyed = 50;
const enemyRows = 5;
const enemyColumns = 10;
const backgroundColor = [178, 200, 138];
const edgeColor = [0, 0, 0];
const defaultTextSize = 16;
const defaultTextColor = [0, 0, 0];
const defaultTextOutlineColor = [255, 255, 255];
const defaultButtonBackgroundColor = [75, 93, 93];
const defaultButtonTextColor = [255, 255, 255];
let ballImage;
let enemyImage;
let wallImage;
let game;
let htmlBGImage;
let comradeImage;
let menuBgImage;
let ingameBgImage;
let winImage;
let loseImage;
let collisionImage;
let mainFont;
let menuSound;
let winSound;
let soundImage;
let collisionSheet;
let testSheet;
let testAnimation;
let animationQueue;

function normalizeAngle(angle) {
  return angle - 2 * Math.PI * Math.floor(angle / (2 * Math.PI));
}

function limitLine(p1, p2, maxLength) {
  const potentialLine = new Line(p1, p2);

  if (Math.ceil(potentialLine.length()) <= maxLength) {
    return p2;
  }

  const angle = potentialLine.angle();
  const maxX = p1.x + maxLength * Math.cos(angle);
  const maxY = p1.y + maxLength * Math.sin(angle);

  return new Point(maxX, maxY);
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

function drawPotentialWall(x1, y1, x2, y2) {
  const rect = wallRect(x1, y1, x2, y2);
  const line = new Line(new Point(x1, y1), new Point(x2, y2));

  const x = (rect.l1.p1.x + rect.l3.p1.x) / 2;
  const y = (rect.l1.p1.y + rect.l3.p1.y) / 2;
  const rectWidth = rect.l2.length();
  const rectHeight = rect.l1.length();
  const rotation = normalizeAngle(
    Math.atan2(rect.l4.p1.y - rect.l4.p2.y, rect.l4.p1.x - rect.l4.p2.x)
  );
  let textRotation = rotation;
  const wallCost = Math.ceil(line.length());

  if (textRotation >= Math.PI / 2 && textRotation < (3 * Math.PI) / 2) {
    textRotation = normalizeAngle(textRotation + Math.PI);
  }

  push();

  imageMode(CENTER);
  translate(x, y);
  rotate(rotation);
  tint(255, potentialWallOpacity * 255);
  image(wallImage, 0, 0, rectWidth, rectHeight);

  pop();
  push();

  translate(x, y);
  rotate(textRotation);
  translate(0, wallDepth / 2 + 4);
  stroke(0);
  strokeWeight(0);
  fill(255);
  textAlign(CENTER, TOP);
  textSize(20);
  text(wallCost.toString(), 0, 0);

  pop();
}

function drawWall(rect) {
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

  centerPoint() {
    return new Point(
      (this.l1.p1.x + this.l3.p1.x) / 2,
      (this.l1.p1.y + this.l3.p1.y) / 2
    );
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
    if (game.healthMeter.health > 0) {
      const p1 = new Point(this.startX, this.startY);
      const p2 = new Point(x, y);
      const limitedP2 = limitLine(p1, p2, game.healthMeter.health);

      this.drawing = false;
      this.line = new Line(p1, limitedP2);
      this.rect = wallRect(p1.x, p1.y, limitedP2.x, limitedP2.y);
      this.startX = undefined;
      this.startY = undefined;

      game.healthMeter.use(Math.ceil(this.line.length()));
    } else {
      this.clearDrawing();
    }
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
      if (game.healthMeter.health > 0) {
        const p1 = new Point(this.startX, this.startY);
        const p2 = new Point(mouseX, mouseY);
        const limitedP2 = limitLine(p1, p2, game.healthMeter.health);

        drawPotentialWall(p1.x, p1.y, limitedP2.x, limitedP2.y);
      }
    } else if (this.rect !== undefined) {
      drawWall(this.rect);
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
    strokeWeight(0);
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

  bounce(line) {
    const perpendicularAngle = line.angle() + Math.PI;
    const angleDiff = perpendicularAngle - this.direction;
    this.direction = normalizeAngle(this.direction + 2 * angleDiff);
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

    if (game.drawingWall.rect !== undefined) {
      const collisionLine = game.drawingWall.rect.collisionWith(this.position);

      if (collisionLine !== null) {
        this.bounce(collisionLine);

        // Collision animation for wall destruction
        const wallCenter = game.drawingWall.rect.centerPoint();
        const collisionAnimation = new GameAnimation(
          collisionSheet,
          5,
          wallCenter.x,
          wallCenter.y
        );
        animationQueue.addAnimation(collisionAnimation);

        game.drawingWall.clearDrawing();
      }
    }

    for (let i = 0; i < game.enemies.length; i++) {
      const collisionLine = game.enemies[i].rect.collisionWith(this.position);

      if (collisionLine !== null) {
        this.bounce(collisionLine);
        const enemyCenter = game.enemies[i].rect.centerPoint();
        game.enemies.splice(i--, 1);

        // Collision animation for enemy destruction
        const collisionAnimation = new GameAnimation(
          collisionSheet,
          10,
          enemyCenter.x,
          enemyCenter.y
        );
        animationQueue.addAnimation(collisionAnimation);
        game.healthMeter.gain(healthPerEnemyDestroyed);
      }
    }
  }

  draw() {
    this.update();

    push();

    imageMode(CENTER);
    image(
      ballImage,
      this.position.x,
      this.position.y,
      ballRadius * 2,
      ballRadius * 2
    );

    pop();

    if (this.direction === undefined) {
      const lineStartDistance = 20;
      const lineEndDistance = 100;
      const headDistance = 15;
      const pointingAngle = new Line(
        new Point(this.position.x, this.position.y),
        new Point(mouseX, mouseY)
      ).angle();
      const arrowStartX =
        this.position.x + lineStartDistance * Math.cos(pointingAngle);
      const arrowStartY =
        this.position.y + lineStartDistance * Math.sin(pointingAngle);
      const arrowEndX =
        this.position.x + lineEndDistance * Math.cos(pointingAngle);
      const arrowEndY =
        this.position.y + lineEndDistance * Math.sin(pointingAngle);
      const headAngle1 = normalizeAngle(pointingAngle - (3 * Math.PI) / 4);
      const headAngle2 = normalizeAngle(pointingAngle + (3 * Math.PI) / 4);
      const head1X = arrowEndX + headDistance * Math.cos(headAngle1);
      const head1Y = arrowEndY + headDistance * Math.sin(headAngle1);
      const head2X = arrowEndX + headDistance * Math.cos(headAngle2);
      const head2Y = arrowEndY + headDistance * Math.sin(headAngle2);

      push();

      strokeWeight(3);
      stroke(255);
      line(arrowStartX, arrowStartY, arrowEndX, arrowEndY);
      line(arrowEndX, arrowEndY, head1X, head1Y);
      line(arrowEndX, arrowEndY, head2X, head2Y);

      pop();
    }
  }
}

class Enemy {
  constructor(index) {
    const enemyWidth = width / enemyColumns;
    const enemyHeight = enemyWidth * 0.6;
    const enemyTopOffset = 2 * enemyHeight;

    const row = Math.floor(index / enemyColumns);
    const column = index % enemyColumns;

    const p1 = new Point(
      enemyWidth * column,
      enemyHeight * row + enemyTopOffset
    );
    const p2 = new Point(
      enemyWidth * column,
      enemyHeight * (row + 1) + enemyTopOffset
    );
    const p3 = new Point(
      enemyWidth * (column + 1),
      enemyHeight * (row + 1) + enemyTopOffset
    );
    const p4 = new Point(
      enemyWidth * (column + 1),
      enemyHeight * row + enemyTopOffset
    );

    this.index = index;
    this.rect = new Rectangle(
      new Line(p1, p2),
      new Line(p2, p3),
      new Line(p3, p4),
      new Line(p4, p1)
    );
  }

  draw() {
    const enemyWidth = width / enemyColumns;
    const enemyHeight = enemyWidth * 0.6;
    const enemyTopOffset = 2 * enemyHeight;

    const row = Math.floor(this.index / enemyColumns);
    const column = this.index % enemyColumns;

    const imageX = enemyWidth * (column + 0.5);
    const imageY = enemyHeight * (row + 0.5) + enemyTopOffset;
    const imageSize = enemyHeight * 0.8;

    push();

    imageMode(CENTER);
    image(enemyImage, imageX, imageY, imageSize, imageSize);

    pop();
  }
}

class HealthMeter {
  constructor() {
    this.health = startingHealth;
  }

  gain(amount) {
    this.health += amount;
  }

  use(amount) {
    this.health = Math.max(this.health - amount, 0);
  }

  draw() {
    push();

    textAlign(RIGHT, CENTER);
    textSize(24);
    strokeWeight(0);
    if (this.health > 0) {
      fill(...defaultTextColor);
    } else {
      fill(255, 0, 0);
    }
    text(`${this.health} RUB`, width - 10, 18);

    pop();
  }
}

class IconButton {
  constructor(image, rect, onclick) {
    this.image = image;
    this.rect = rect;
    this.onclick = onclick;
    this.clicked = false;
  }

  draw() {
    image(this.image, this.rect[0], this.rect[1], this.rect[2], this.rect[3]);

    if (
      !this.clicked &&
      mouseIsPressed &&
      mouseX >= this.rect[0] &&
      mouseX < this.rect[0] + this.rect[2] &&
      mouseY >= this.rect[1] &&
      mouseY < this.rect[1] + this.rect[3]
    ) {
      this.clicked = true;
      this.onclick();
    }
  }
}

class Game {
  constructor() {
    this.played = false;
    this.playing = false;
    this.won = false;

    this.startText = new GameText({
      text: "Chernoblock",
      textSize: 72,
      pos: [400, 200],
    });
    this.startButton = new GameButton({
      text: "Start",
      textSize: 32,
      rect: [325, 350, 150, 50],
    });
    this.scoreText = new GameText({
      text: "",
      textSize: 32,
      textColor: [242, 203, 50],
      pos: [400, 185],
    });
    this.winPlayAgainButton = new GameButton({
      text: "Play again",
      textSize: 28,
      rect: [325, 215, 150, 50],
    });
    this.losePlayAgainButton = new GameButton({
      text: "Play again",
      textSize: 28,
      rect: [225, 527, 150, 50],
    });
    this.lieButton = new GameButton({
      text: "Lie",
      textSize: 28,
      rect: [425, 527, 150, 50],
    });
    this.soundIcon = new IconButton(soundImage, [745, 15, 40, 40], () => {
      menuSound.loop();
    });

    this.reset();
  }

  reset() {
    winSound.stop();

    this.drawingWall = new DrawingWall();
    this.ball = new Ball(new Point(width / 2, height - 100));
    this.healthMeter = new HealthMeter();
    this.enemies = [];

    for (let i = 0; i < enemyRows * enemyColumns; i++) {
      this.enemies.push(new Enemy(i));
    }
  }

  play() {
    this.reset();
    this.playing = true;

    if (!menuSound.isPlaying()) {
      menuSound.loop();
    }
  }

  win() {
    menuSound.stop();
    winSound.loop();
    this.played = true;
    this.playing = false;
    this.won = true;
    this.scoreText.text = `Money saved: ${this.healthMeter.health} RUB`;
  }

  lose() {
    menuSound.stop();
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

  setComradeImage(state) {
    const comradeCamContainer = document.getElementById(
      "comrade-cam-container"
    );
    const comradeCam = document.getElementById("comrade-cam");

    if (state === "win") {
      comradeImage = "assets/dyatlov_win.gif";
      comradeCam.style.backgroundImage = "url(" + comradeImage.toString() + ")";
    } else if (state === "lose") {
      comradeImage = "assets/dyatlov_rip.gif";
      comradeCam.style.backgroundImage = "url(" + comradeImage.toString() + ")";
    } else if (state === "ingame") {
      comradeCamContainer.style.display = "block"; // Unhide the comrade
      comradeImage = "assets/dyatlov_stare.gif";
      if (this.healthMeter.health < 50) {
        comradeImage = "assets/dyatlov_injured.gif";
      } else if (this.healthMeter.health < 150) {
        comradeImage = "assets/dyatlov_stare.gif";
      } else {
        comradeImage = "assets/dyatlov_win.gif";
      }
      comradeCam.style.backgroundImage = "url(" + comradeImage.toString() + ")";
    } else if (state === "menu") {
      comradeCamContainer.style.display = "none"; // Hide the comrade-cam
      comradeImage = "assets/dyatlov_stare.gif";
    }
  }

  setHTMLBackgroundImage(state) {
    let body = document.querySelector("body");
    if (state === "menu") {
      htmlBGImage = "assets/menu_screen_art_scaled.png";
      body.style.backgroundImage = "url(" + htmlBGImage.toString() + ")";
    } else if (state === "ingame") {
      htmlBGImage = "assets/background_wide_siteres2.gif";
      body.style.backgroundImage = "url(" + htmlBGImage.toString() + ")";
    }
  }

  setCanvasBackgroundImage(state) {
    if (state === "win") {
      background(winImage);
    } else if (state === "lose") {
      background(loseImage);
    } else if (state === "menu") {
      background(menuBgImage);
    } else if (state === "ingame") {
      background(ingameBgImage);
    } else {
      background(...backgroundColor);
    }
  }

  draw() {
    if (this.inMainMenu()) {
      document.body.classList.add("main-menu");

      this.setHTMLBackgroundImage("menu");
      this.setComradeImage("menu");
      this.setCanvasBackgroundImage("menu");

      this.soundIcon.draw();
      this.startText.draw();
      this.startButton.draw();
      if (this.startButton.clicking()) {
        this.play();
      }
    } else if (this.inGame()) {
      this.setComradeImage("ingame");
      this.setHTMLBackgroundImage("ingame");
      this.setCanvasBackgroundImage("ingame");
      document.body.classList.remove("main-menu");

      this.drawingWall.draw();
      this.ball.draw();

      for (const enemy of this.enemies) {
        enemy.draw();
      }

      this.healthMeter.draw();

      if (this.enemies.length === 0) {
        this.win();
      }
    } else if (this.inWinScreen()) {
      this.setComradeImage("win");
      this.setCanvasBackgroundImage("win");

      this.scoreText.draw();
      this.winPlayAgainButton.draw();

      if (this.winPlayAgainButton.clicking()) {
        this.play();
      }
    } else if (this.inLoseScreen()) {
      this.setComradeImage("lose");
      this.setCanvasBackgroundImage("lose");

      this.losePlayAgainButton.draw();
      this.lieButton.draw();

      if (this.losePlayAgainButton.clicking()) {
        this.play();
      } else if (this.lieButton.clicking()) {
        this.win();
      }
    }
  }
}

//class to read an image and break it down into frames
//need to implement support for multiple rows, prob can just change frameY to have an actual value
class SpriteSheet {
  constructor(image, imageWidth, frameWidth, frameHeight, center) {
    //breaking down is happening here mostly
    this.image = image;
    this.frameWidth = frameWidth;
    this.frameHeight = frameHeight;
    this.imageWidth = imageWidth;
    this.center = center;
    //count the number of sprites per spritesheet
    this.frames = Math.floor(imageWidth / frameWidth);
  }
  // draw a specific frame
  drawFrame(frame, x, y) {
    const frameX = frame * this.frameWidth;
    const frameY = 0;
    //draws the current frame at the given x and y by taking the width * current sprite # and always starts at 0 (unless there are multiple rows of sprites)

    push();

    if (this.center) {
      imageMode(CENTER);
    }

    image(
      this.image,
      x,
      y,
      this.frameWidth,
      this.frameHeight,
      frameX,
      frameY,
      this.frameWidth,
      this.frameHeight
    );

    pop();
  }
}

// takes a spritesheet and plays it frame by frame
class GameAnimation {
  constructor(spriteSheet, perSpriteFrames, x, y) {
    this.isDone = false;
    this.spriteSheet = spriteSheet;
    this.perSpriteFrames = perSpriteFrames;
    this.currentSpriteFrame = 0;
    this.frameCounter = frameCount;
    this.x = x;
    this.y = y;
  }
  //draws the current frame at the given x and y
  play() {
    this.spriteSheet.drawFrame(this.currentSpriteFrame, this.x, this.y);
    const deltaFrames = frameCount - this.frameCounter;
    if (deltaFrames >= this.perSpriteFrames) {
      // if enough frames have passed as per perSpriteFrames
      this.currentSpriteFrame++; // move to the next frame
      this.frameCounter = frameCount;
    }
    if (this.currentSpriteFrame >= this.spriteSheet.frames) {
      // if we are at the end of the animation
      this.currentSpriteFrame = 0; // go back to the start
      this.isDone = true; // set the animation to done
    }
  }
}

class AnimationPlayer {
  constructor() {
    this.animations = [];
  }
  addAnimation(animation) {
    this.animations.push(animation);
  }
  playAnimations() {
    for (const animation of this.animations) {
      if (animation.isDone) {
        this.animations.splice(this.animations.indexOf(animation), 1);
      } else {
        animation.play();
      }
    }
  }
}

function preload() {
  soundFormats("mp3");
  menuSound = loadSound("assets/chernoblock.mp3", () => {
    menuSound.setVolume(0.2);
  });
  winSound = loadSound("assets/win.mp3", () => {
    winSound.setVolume(0.15);
  });
}

function setup() {
  createCanvas(800, 600);
  stroke(255);
  frameRate(60);

  comradeImage = loadImage("assets/dyatlov_stare.png");
  ballImage = loadImage("assets/neutron.png");
  enemyImage = loadImage("assets/u235.png");
  wallImage = loadImage("assets/graphite.png");
  winImage = loadImage("assets/win.png");
  loseImage = loadImage("assets/loser.png");
  menuBgImage = loadImage("assets/main_menu_bg.png");
  ingameBgImage = loadImage("assets/ingame_bg.gif");
  collisionImage = loadImage("assets/graphite_particles_blue.png"); // Load the image as an animation
  mainFont = loadFont("assets/Comdotbold-JRW7.ttf");
  soundImage = loadImage("assets/sound.png");

  collisionSheet = new SpriteSheet(collisionImage, 512, 64, 64, true);
  animationQueue = new AnimationPlayer();

  textFont(mainFont);

  game = new Game();
}

function draw() {
  stroke(0);
  background(...backgroundColor);
  //play all queued animations
  animationQueue.playAnimations();
  game.draw();
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
