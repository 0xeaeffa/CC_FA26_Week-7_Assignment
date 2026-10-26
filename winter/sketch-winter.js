const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
const windowPadding = 1.6; // rem

const snowflakes = [];
const snowAmount = 48;
const snowColors = [
  // [207,225,237],
  // [228,238,245],
  // [103,152,180],
  // [67,106,132],
  // [119,160,180],
  // [199,220,235],
  [122,145,176],
  [157,176,199],
  [174,189,217],
  [196,209,230],
  [203,215,234],
  [186,200,224],
];

let colors;
let width, height;

class Snowflake {
  scale;
  startPos;
  figAmount;
  branchAmount;
  color;
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

    weight = 3,
    root = 12,
    step = 6, // prob 4-8
    branch = 12,

    rotateSpeed = 2,
    flipSpeed = 2,
    fallSpeed = 2,
    wave = 2,
    wind = -2,

    color = createVector(snowColors[0][0], snowColors[0][1], snowColors[0][2]),
  ) {
    this.startPos = startPos;
    this.scale = scale;
    this.figAmount = figAmount;
    this.branchAmount = branchAmount;
    this.color = color;

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
    stroke(`rgba(${this.color.x}, ${this.color.y}, ${this.color.z}, 1)`);

    scale(this.scale);
    strokeCap(ROUND);
    strokeWeight(this.weight);
    for (let i = 0; i < this.figAmount; i++) {
      push();
      rotate(i * (360 / this.figAmount));
      line(0, 0, 0, this.root);

      let stem = this.root;
      let bLength = this.branch;
      for (let j = 1; j <= this.branchAmount; j++) {
        let opacity = 0.8 - j * (0.7 / this.branchAmount);
        let c = `rgba(${this.color.x}, ${this.color.y}, ${this.color.z}, ${opacity})`;
        stroke(c);
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

        bLength -= this.branch / 4;
        stem += this.step;
      }
      console.log(`sclae: ${this.scale}, ${this.branchAmount}`);
      line(0, stem, 0, stem + this.root / 2);
      pop();
    }
  }

  updateStartPos(pos) {
    this.startPos = pos;
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
  grad.addColorStop(1, 'rgba(234,239,250,0)');
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

  for (let i = 0; i < snowAmount; i++) {
    let angle = random(48, 58);
    let posX = random(width / 2, width);
    let pos = createVector(posX, -1 * (height / 8));
    let scale = random(0.3, 0.6);

    let figPercent = random(0, 4);
    let figAmount = 6;
    if (figPercent > 3) {
      figAmount = 7;
    }

    let weight;
    if (scale < 0.45) {
      weight = 3;
    } else {
      weight = 4;
    }

    let root = round(random(12, 14));
    let branch = root;
    let step = root / 2;
    let branchAmount = ceil(root / 4);

    let rotateSpeed = scale * 2;
    let flipSpeed = random(0.5, 1.5) * (scale * 2);
    let fallSpeed = random(0.8, 2) * (scale * 2);
    let wave = random(1, 3);
    let wind = random(0, -3);

    let cIndex = floor(random(0, 5));
    let c = createVector(
      snowColors[cIndex][0],
      snowColors[cIndex][1],
      snowColors[cIndex][2],
    );

    snowflakes.push(
      new Snowflake(
        angle,
        pos,
        scale,
        figAmount,
        branchAmount,
        weight,
        root,
        step,
        branch,
        rotateSpeed,
        flipSpeed,
        fallSpeed,
        wave,
        wind,
        c,
      ),
    );
  }

  // translate(0, height / 2);
  // for (let i = 0; i < snowAmount; i++) {
  //   let s = snowflakes[i];
  //   push();
  //   translate(80 * (i + 1), 0);
  //   s.render();
  //   pop();
  // }
}

function draw() {
  background(colors.winterColor);
  drawGradient();

  for (let i = 0; i < snowAmount; i++) {
    let s = snowflakes[i];
    s.update(frameCount);
  }
}

function windowResized() {
  width = windowWidth - rem * windowPadding * 2;
  height = width / 2;
  resizeCanvas(width, height);

  for (let i = 0; i < snowflakes.length; i++) {
    let posX = random(width / 2, width);
    let pos = createVector(posX, -1 * (height / 8));
    snowflakes[i].updateStartPos(pos);
  }
}
