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
}

function mousePressed() {
  drawing.drawStart(mouseX, mouseY);
}

function mouseReleased() {
  drawing.drawEnd(mouseX, mouseY);
}
