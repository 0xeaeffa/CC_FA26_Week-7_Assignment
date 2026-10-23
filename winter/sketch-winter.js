const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
const windowPadding = 1.6; // rem

let colors;
let width, height;

let flak;

class Snowflake {
  scale;
  startPos;
  figAmount;
  branchAmount;
  shade;
  weight;
  root;
  step;
  branch;
  branchAngle;

  rotateSpeed;
  flipSpeed;
  fallSpeed;
  wave;
  wind;

  rotate;
  pos;

  constructor(
    branchAngle, // 40-58 or something
    startPos,
    scale = 1,
    figAmount = 6,
    branchAmount = 3,

    shade = 60,
    weight = 3,
    root = 12,
    step = 6, // prob 4-8
    branch = 12,

    rotateSpeed = 2,
    flipSpeed = 2,
    fallSpeed = 2,
    wave = 2,
    wind = -2,
  ) {
    this.startPos = startPos;
    this.scale = scale;
    this.figAmount = figAmount;
    this.branchAmount = branchAmount;

    this.shade = shade;
    this.weight = weight;
    this.root = root;
    this.step = step;

    this.branch = branch;
    this.branchAngle = branchAngle;

    this.rotateSpeed = rotateSpeed;
    this.flipSpeed = flipSpeed;
    this.fallSpeed = fallSpeed; // pos.y
    this.wave = wave; // pos.x - wave freq
    this.wind = wind; //pos.x

    this.rotate = 0;
    this.pos = createVector(startPos.x, startPos.y);
  }

  render() {
    scale(this.scale);
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
        rotate(this.branchAngle);
        line(0, 0, 0, bLength);
        pop();

        push();
        translate(0, stem);
        rotate(this.branchAngle * -1);
        line(0, 0, 0, bLength);
        pop();

        bLength -= 3;
        stem += this.step;
      }
      line(0, stem, 0, stem + this.root / 2);
      pop();
    }
  }

  spin(t) {
    push();
    rotate(this.rotate);

    let flipX = map(sin(this.flipSpeed * PI * t), -1, 1, 0.2, 1);
    scale(flipX, 1);
    this.render();
    pop();
    this.rotate += this.rotateSpeed;
  }

  update(t) {
    let x = this.pos.x;
    let y = this.pos.y;
    push();
    translate(x, y);
    this.spin(t);
    pop();

    if (y > height + 100 || x < -100) {
      this.pos = createVector(this.startPos.x, this.startPos.y);
    }
    this.pos.x += 2 * sin(this.wave * PI * t) + this.wind;
    this.pos.y += this.fallSpeed;
  }
}

function drawGradient() {
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
}

async function setup() {
  colors = await loadJSON('../utils/colors.json');
  width = windowWidth - rem * windowPadding * 2;
  height = width / 2;
  // console.log(`width: ${width}, height: ${height}`);

  createCanvas(width, height);
  angleMode(DEGREES);
  frameRate(30);
  background(colors.winterColor);
  drawGradient();

  let pos = createVector((width * 3) / 4, 0);
  flak = new Snowflake(58, pos);
  // flak.render();
}

function draw() {
  background(colors.winterColor);
  // background('rgba(250,250,250,0.5)');
  drawGradient();

  flak.update(frameCount);
}

function windowResized() {
  width = windowWidth - rem * windowPadding * 2;
  height = width / 2;
  resizeCanvas(width, height);
  background(colors.winterColor);
}
