class Player {
  constructor(x, y, d, color) {
    this.x = x;
    this.y = y;
    this.d = d;
    this.r = d / 2;
    this.color = color;
    this.vel = {
      x: 1,
      y: 1
    };
  }
}

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
  frameRate(30);
  circle1 = new Player(50, 50, 30, 'red');
}

function draw() {
  stroke(255);
  background(0);
  if (drawing.drawing) {
    line(drawing.startX, drawing.startY, mouseX, mouseY);
  } else if (drawing.line !== undefined) {
    line(drawing.line.x1, drawing.line.y1, drawing.line.x2, drawing.line.y2);
  }
  if (checkPaddleCollision()) {
    stroke('magenta');
  }
  updatePlayerCoor();
}

function updatePlayerCoor() {
  circle1.x = circle1.x + circle1.vel.x;
  circle1.y = circle1.y + circle1.vel.y;
  circle(circle1.x, circle1.y, circle1.d);
}

function checkPaddleCollision() {
  if (drawing.line == undefined) {
    return false;
  }

  let x1 = Math.min(drawing.line.x1, drawing.line.x2);
  let x2 = Math.max(drawing.line.x1, drawing.line.x2);
  let y1 = Math.min(drawing.line.y1, drawing.line.y2);
  let y2 = Math.max(drawing.line.y1, drawing.line.y2);

  //checking whether the line is vertical 
  if (x1 === x2) {

    //are interecepts within the radius of the circle?
    let yInt1 = circle1.y - Math.sqrt(circle1.r * circle1.r - (x1 - circle1.x) * (x1 - circle1.x));
    let y2 = circle1.y + Math.sqrt(circle1.r * circle1.r - (x1 - circle1.x) * (x1 - circle1.x));
    if ((y1 >= y1 && y1 <= y2) || (y2 >= y1 && y2 <= y2)) {
      //yes
      return true;
    }
  }
  else {
    //Line slope for perp distance calculation
    let m = (y2 - y1) / (x2 - x1);
    //Line y for perp distance calculation
    let b = y1 - m * x1;

    //perpendicular distance from ball to line
    let distance = Math.abs(circle1.y - m * circle1.x - b) / Math.sqrt(m * m + 1);
    //checks if the ball is 'inside' the line on the y axis
    if (distance <= circle1.r) {
      // if the line is vertical
      //getting 2 intercept points (x-bound)
      let y1 = m * circle1.x + b;
      let x1 = (y1 - b) / m;
      let y2 = m * (circle1.x + circle1.r) + b;
      let x2 = (y2 - b) / m;


      
      //special case: horizontal line. checks y interecepts instead of x since y would be touching the line sooner
      if (m === 0) {
        if ((y1 >= y1 && y1 <= y2) || (y2 >= y1 && y2 <= y2)) {
          return true;
        }
      }
      else {
        if ((x1 >= x1 && x1 <= x2) || (x2 >= x1 && x2 <= x2)) {
          return true;
        }
      }
    }
    return false;
  }
}

function mousePressed() {
  drawing.drawStart(mouseX, mouseY);
}

function mouseReleased() {
  drawing.drawEnd(mouseX, mouseY);
}
