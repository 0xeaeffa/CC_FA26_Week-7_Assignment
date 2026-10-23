const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
const windowPadding = 1.6; // rem

let colors;
let width, height;

let flak;

class Snowflake {
  figAmount;
  branchAmount;
  shade;
  weight;
  root;
  step;
  branch;
  angle;
  constructor(
    angle, // 40-58 or something
    figAmount = 6,
    branchAmount = 3,
    shade = 60,
    weight = 3,
    root = 12,
    step = 6, // prob 4-8
    branch = 12,
  ) {
    this.figAmount = figAmount;
    this.branchAmount = branchAmount;
    this.shade = shade;
    this.weight = weight;
    this.root = root;
    this.step = step;
    this.branch = branch;
    this.angle = angle;
  }

  show() {
    strokeCap(ROUND);
    stroke(this.shade);
    strokeWeight(this.weight);
    for (let i = 0; i < this.figAmount; i++) {
      push();
      rotate(i * (360 / this.figAmount));
      line(0, 0, 0, this.root);

      let stem = this.root;
      let bLength = this.branch;
      for (let j = 1; j <= this.branchAmount; j++) {
        stroke(this.shade + j * 48);
        line(0, stem, 0, stem + this.step);

        push();
        translate(0, stem);
        rotate(this.angle);
        line(0, 0, 0, bLength);
        pop();

        push();
        translate(0, stem);
        rotate(this.angle * -1);
        line(0, 0, 0, bLength);
        pop();

        bLength -= 3;
        stem += this.step;
      }
      line(0, stem, 0, stem + this.root / 2);
      pop();
    }
  }
}

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
  translate(width / 2, height / 2);

  flak = new Snowflake(58);
  flak.show();
}

function draw() {}

function windowResized() {
  width = windowWidth - rem * windowPadding * 2;
  height = width / 2;
  resizeCanvas(width, height);
  background(colors.winterColor);
}
