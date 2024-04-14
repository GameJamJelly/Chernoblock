const defaultTextSize = 16;
const defaultTextColor = [255, 255, 255];
const defaultButtonBackgroundColor = [0, 191, 0];
const defaultButtonTextColor = [255, 255, 255];

class Line {
  constructor(x1, y1, x2, y2) {
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
  }

  length() {
    return Math.sqrt(
      Math.pow(this.x2 - this.x1, 2) + Math.pow(this.y2 - this.y1, 2)
    );
  }
}

class DrawingLine {
  constructor() {
    this.drawing = false;
    this.line = undefined;
    this.startX = undefined;
    this.startY = undefined;
  }

  drawStart(x, y) {
    this.drawing = true;
    this.line = undefined;
    this.startX = x;
    this.startY = y;
  }

  drawEnd(x, y) {
    this.drawing = false;
    this.line = new Line(this.startX, this.startY, x, y);
    this.startX = undefined;
    this.startY = undefined;
  }

  clearDrawing() {
    this.drawing = false;
    this.line = undefined;
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
const drawing = new DrawingLine();

function setup() {
  createCanvas(800, 600);
  stroke(255);
}

function draw() {
  background(0);

  if (drawing.drawing) {
    line(drawing.startX, drawing.startY, mouseX, mouseY);
  } else if (drawing.line !== undefined) {
    line(drawing.line.x1, drawing.line.y1, drawing.line.x2, drawing.line.y2);
  }

  game.draw();
}

function mousePressed() {
  drawing.drawStart(mouseX, mouseY);
}

function mouseReleased() {
  drawing.drawEnd(mouseX, mouseY);
}
