const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
const windowPadding = 1.6; // rem

const snowflakes = [];
const snowAmount = 72;
const snowColors = [
  [142, 165, 196],
  [157, 176, 199],
  [184, 199, 227],
  [216, 229, 250],
  [213, 225, 244],
  [196, 210, 234],
];

let colors;
let groundHeight = [];
let grasses = [];

let width, height;
function getDimensions() {
  let width = window.innerWidth - rem * windowPadding * 2;
  let height = width / 2;
  if (height > window.innerHeight) {
    height = window.innerHeight - rem * windowPadding * 2;
    width = height * 2;
    return { width: width, height: height };
  }
  return { width: width, height: height };
}

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
      // console.log(`sclae: ${this.scale}, ${this.branchAmount}`);
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

class Grass {
  color;
  angle;
  len;
  seg;
  pos;
  rot;
  num;
  constructor(color, pos, angle, length, seg, rot = 0) {
    this.pos = pos;
    this.angle = angle;
    this.len = length;
    this.seg = seg;
    this.rot = rot;
    this.num = floor(random(1, 4));
    this.color = color;
  }

  render() {
    push();
    stroke(this.color);
    translate(this.pos.x, this.pos.y);
    rotate(180 + this.rot);

    for (let k = 0; k < this.num; k++) {
      push();
      let length = this.len;
      for (let i = 0; i < this.seg; i++) {
        let weight = map(i, 0, this.seg, 3, 0.1);
        strokeWeight(weight);
        line(0, 0, 0, length);
        translate(0, length);
        rotate(this.angle);
        length *= 0.8;
      }
      pop();
      // rotate(random(6, 18));
      rotate(this.rot); // i genuinely do not car anymore
    }
    pop();
  }
}

function drawBackground(bgcolor) {
  background(bgcolor);
  var grad = drawingContext.createRadialGradient(
    width / 2,
    height * 0.8,
    height / 8,

    width / 2,
    height * 0.8,
    width,
  );
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(1, 'rgba(242,246,255,0)');
  drawingContext.fillStyle = grad;

  scale(2, 1);
  translate(-width / 4, 0);
  noStroke();
  rect(0, 0, width, height);
  resetMatrix();
}
function drawTerrain(init = false) {
  const layers = 8;
  for (let i = layers; i > 0; i--) {
    push();
    let heightScale = 1 - i * (0.8 / layers);
    let heightOffset = height * 0.75 - i * (height / 256);
    let strokeOp = heightScale * 0.2;
    translate(0, heightOffset);
    strokeWeight(4);
    fill('rgba(255,255,255,0.2)');
    stroke(`rgba(142, 165, 196,${strokeOp})`);

    beginShape();
    let x = 0;
    for (let j = 0; j < groundHeight.length; j++) {
      let y = heightScale * groundHeight[j];

      if (init) {
        let grassChance = random(0, 1);
        let fallOff = groundHeight.length / 8;
        if (j < fallOff && grassChance < map(j / fallOff, 0, 1, 0.2, 0.01)) {
          const m = drawingContext.getTransform();
          pd = pixelDensity();
          let gPos = createVector(x, y + m.f / pd);

          let gAngle = random(2, 12);
          let gLen = map(j / fallOff, 0, 1, height / 8, 4);
          let gSeg = floor(random(4, 7));
          let gRot = random(-10, 10);
          let gColor = `rgba(120, 215, 110,${strokeOp * 1.5})`;
          grasses.push(new Grass(gColor, gPos, gAngle, gLen, gSeg, gRot));
        }
      }

      vertex(x, y);
      x += 4;
    }
    vertex(width, height);
    vertex(0, height);
    endShape(CLOSE);
    pop();
  }
  resetMatrix();

  for (let i = 0; i < grasses.length; i++) {
    grasses[i].render();
  }
}
function drawGradient(color, cx, cy, radius) {
  var grad = drawingContext.createRadialGradient(cx, cy, 0, cx, cy, radius);
  grad.addColorStop(0, color);
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  drawingContext.fillStyle = grad;

  noStroke();
  rect(0, 0, width, height);
  resetMatrix();
}

async function setup() {
  colors = await loadJSON('../utils/colors.json');
  width = getDimensions().width;
  height = getDimensions().height;
  // console.log(`width: ${width}, height: ${height}`);

  createCanvas(width, height);
  angleMode(DEGREES);
  frameRate(30);
  drawBackground(colors.winterColor);
  drawGradient(colors.springColor, -width / 3, height * 0.75, width);
  drawGradient(colors.fallColor, width * 1.75, height * 0.25, width);

  let noiseLevel = 128;
  let noiseScale = 0.006;
  for (let i = 0; i <= width + 4; i += 4) {
    let y = noiseLevel * noise(noiseScale * i);
    groundHeight.push(y);
  }
  drawTerrain(true);

  for (let i = 0; i < snowAmount; i++) {
    let angle = random(46, 58);
    let posX = random(width / 2, width);
    let pos = createVector(posX, -1 * (height / 8));
    let scale = random(0.3, 0.9);

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

    let root = round(random(12, 16));
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
  // resetMatrix();
}

function draw() {
  drawBackground(colors.winterColor);
  drawGradient(colors.springColor, -width / 3, height * 0.75, width);
  drawGradient(colors.fallColor, width * 1.75, height * 0.25, width);
  
  for (let i = 0; i < snowAmount; i++) {
    let s = snowflakes[i];
    s.update(frameCount);
  }
  drawTerrain();
}

function windowResized() {
  width = getDimensions().width;
  height = getDimensions().height;
  resizeCanvas(width, height);

  drawTerrain(true); // temp

  for (let i = 0; i < snowflakes.length; i++) {
    let posX = random(width / 2, width);
    let pos = createVector(posX, -1 * (height / 8));
    snowflakes[i].updateStartPos(pos);
  }
}

// <--- krill myslef? find out in this episode --->
function initWinter(g, w, h) {
  angleMode(DEGREES);
  frameRate(30);
  drawBackground(colors.winterColor);
  drawGradient(colors.springColor, -width / 3, height * 0.75, width);
  drawGradient(colors.fallColor, width * 1.75, height * 0.25, width);

  let noiseLevel = 128;
  let noiseScale = 0.006;
  for (let i = 0; i <= width + 4; i += 4) {
    let y = noiseLevel * noise(noiseScale * i);
    groundHeight.push(y);
  }
  drawTerrain(true);

  for (let i = 0; i < snowAmount; i++) {
    let angle = random(46, 58);
    let posX = random(width / 2, width);
    let pos = createVector(posX, -1 * (height / 8));
    let scale = random(0.3, 0.9);

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

    let root = round(random(12, 16));
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
}
function renderWinter(g) {

}
