const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
const windowPadding = 1.6; // rem

let colors;
let width, height;

async function setup() {
  colors = await loadJSON('../utils/colors.json');
  width = windowWidth - rem * windowPadding * 2;
  height = width / 2;
  // console.log(`width: ${width}, height: ${height}`);

  createCanvas(width, height);
  angleMode(DEGREES);
  background(colors.winterColor);

  var grad = drawingContext.createRadialGradient(
    -width / 2,
    height / 2,
    0,
    0,
    height / 2,
    width / 2,
  );
  grad.addColorStop(0, colors.springColor);
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  drawingContext.fillStyle = grad;
  // translate(-(width/8), 0);
  noStroke();
  rect(0, 0, width, height);

  resetMatrix();
  strokeCap(ROUND);
  translate(width / 4, height / 2);
  for (let i = 0; i < 6; i++) {
    push();
    rotate(i * (360 / 6));
    stroke('#222');

    strokeWeight(3);
    line(0, 0, 0, 16);
    line(0, 16, 10, 20);
    line(0, 16, -10, 20);

    strokeWeight(2.5);
    line(0, 16, 0, 22);
    line(0, 22, 9, 25);
    line(0, 22, -9, 25);

    strokeWeight(2);
    line(0, 22, 0, 27);
    line(0, 27, 7, 29);
    line(0, 27, -7, 29);

    strokeWeight(1);
    line(0, 27, 0, 31);
    line(0, 31, 6, 33);
    line(0, 31, -6, 33);

    line(0, 31, 0, 36);
    pop();
  }

  resetMatrix();
  strokeCap(ROUND);
  translate(width / 2, height / 2);
  stroke('#222');
  strokeWeight(2);
  for (let i = 0; i < 6; i++) {
    push();
    rotate(i * (360 / 6));
    let stem = 12;
    line(0, 0, 0, stem);

    let angle = 45;
    let length = stem;
    let step = 6;
    let branch = 12;
    for (let j = 0; j < 3; j++) {
      stroke(80 + j * 60);
      line(0, length, 0, length + step);
      push();
      translate(0, length);
      rotate(angle);
      line(0, 0, 0, branch);
      pop();
      push();
      translate(0, length);
      rotate(-angle);
      line(0, 0, 0, branch);
      pop();

      branch -= 3;
      length += step;
    }
    line(0, length, 0, length + 6);
    pop();
  }
}

function draw() {}

function windowResized() {
  width = windowWidth - rem * windowPadding * 2;
  height = width / 2;
  resizeCanvas(width, height);
  background(colors.winterColor);
}
