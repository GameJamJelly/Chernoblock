function setup() {
    // put setup code here
    createCanvas(720, 400);
    stroke(255);
    noLoop();
    y = height * 0.5;
}

function draw() {
    // put drawing code here
    background(0);
    y = y - 4;
    if (y < 0) {
        y = height;
    }
    line(0, y, width, y);
}

function mousePressed() {
    redraw();
}
