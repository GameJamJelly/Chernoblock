const wallDepth = 16;

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

    stroke(255);
    strokeWeight(2);
    line(this.l1.p1.x, this.l1.p1.y, this.l1.p2.x, this.l1.p2.y);
    line(this.l2.p1.x, this.l2.p1.y, this.l2.p2.x, this.l2.p2.y);
    line(this.l3.p1.x, this.l3.p1.y, this.l3.p2.x, this.l3.p2.y);
    line(this.l4.p1.x, this.l4.p1.y, this.l4.p2.x, this.l4.p2.y);

    pop();
  }
}

class DrawingLine {
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
    const angle = Math.atan2(y - this.startY, x - this.startX) + Math.PI / 2;
    const p1 = new Point(
      this.startX - (wallDepth / 2) * Math.cos(angle),
      this.startY - (wallDepth / 2) * Math.sin(angle)
    );
    const p2 = new Point(
      this.startX - (wallDepth / 2) * Math.cos(angle + Math.PI),
      this.startY - (wallDepth / 2) * Math.sin(angle + Math.PI)
    );
    const p3 = new Point(
      x - (wallDepth / 2) * Math.cos(angle + Math.PI),
      y - (wallDepth / 2) * Math.sin(angle + Math.PI)
    );
    const p4 = new Point(
      x - (wallDepth / 2) * Math.cos(angle),
      y - (wallDepth / 2) * Math.sin(angle)
    );

    this.drawing = false;
    this.line = new Line(new Point(this.startX, this.startY), new Point(x, y));
    this.rect = new Rectangle(
      new Line(p1, p2),
      new Line(p2, p3),
      new Line(p3, p4),
      new Line(p4, p1)
    );
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

const drawing = new DrawingLine();
const circle1 = new Player(50, 50, 16, "red");

function setup() {
  createCanvas(800, 600);
  stroke(255);
  frameRate(30);
}

function draw() {
  stroke(255);
  background(0);

  if (drawing.drawing) {
    stroke(255, 0, 0);
    strokeWeight(2);
    line(drawing.startX, drawing.startY, mouseX, mouseY);
  } else if (drawing.rect !== undefined) {
    drawing.rect.draw();
    push();
    stroke(255, 0, 0);
    strokeWeight(2);
    line(
      drawing.line.p1.x,
      drawing.line.p1.y,
      drawing.line.p2.x,
      drawing.line.p2.y
    );
    pop();
  }

  strokeWeight(0);
  if (checkWallCollision()) {
    fill(63, 0, 255);
  } else {
    fill(255);
  }

  updatePlayerCoor();
}

function updatePlayerCoor() {
  circle1.x = circle1.x + circle1.vel.x;
  circle1.y = circle1.y + circle1.vel.y;
  circle(circle1.x, circle1.y, circle1.d);
}

function checkWallCollision() {
  return drawing.rect !== undefined
    ? drawing.rect.pointInside(new Point(circle1.x, circle1.y))
    : false;
}

function mousePressed() {
  drawing.drawStart(mouseX, mouseY);
}

function mouseReleased() {
  drawing.drawEnd(mouseX, mouseY);
}
