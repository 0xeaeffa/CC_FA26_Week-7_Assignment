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
const terrainLayers = 8;

let groundHeight = [];
let terrains = []; // this is an array of groundHeight arrays kms
let grasses = [];

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

  render(g) {
    g.stroke(`rgba(${this.color.x}, ${this.color.y}, ${this.color.z}, 1)`);

    g.scale(this.scale);
    g.strokeCap(ROUND);
    g.strokeWeight(this.weight);
    for (let i = 0; i < this.figAmount; i++) {
      g.push();
      g.rotate(i * (360 / this.figAmount));
      g.line(0, 0, 0, this.root);

      let stem = this.root;
      let bLength = this.branch;
      for (let j = 1; j <= this.branchAmount; j++) {
        let opacity = 0.8 - j * (0.7 / this.branchAmount);
        let c = `rgba(${this.color.x}, ${this.color.y}, ${this.color.z}, ${opacity})`;
        g.stroke(c);
        g.line(0, stem, 0, stem + this.step);

        g.push();
        g.translate(0, stem);
        g.rotate(this.branchAngle);
        g.line(0, 0, 0, bLength);
        g.pop();

        g.push();
        g.translate(0, stem);
        g.rotate(this.branchAngle * -1);
        g.line(0, 0, 0, bLength);
        g.pop();

        bLength -= this.branch / 4;
        stem += this.step;
      }
      // console.log(`sclae: ${this.scale}, ${this.branchAmount}`);
      g.line(0, stem, 0, stem + this.root / 2);
      g.pop();
    }
  }

  updateStartPos(pos) {
    this.startPos = pos;
  }

  spin(g, t) {
    g.push();
    g.rotate(this.rotate);

    let flipX = map(sin(this.flipSpeed * PI * t), -1, 1, 0.2, 1);
    g.scale(flipX, 1);
    this.render(g);
    g.pop();
    this.rotate += this.rotateSpeed;
  }
  update(g, t) {
    let x = this.pos.x;
    let y = this.pos.y;
    g.push();
    g.translate(x, y);
    this.spin(g, t);
    g.pop();

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

  render(g) {
    g.push();
    g.stroke(this.color);
    g.translate(this.pos.x, this.pos.y);
    g.rotate(180 + this.rot);

    for (let k = 0; k < this.num; k++) {
      g.push();
      let length = this.len;
      for (let i = 0; i < this.seg; i++) {
        let weight = map(i, 0, this.seg, 3, 0.1);
        g.strokeWeight(weight);
        g.line(0, 0, 0, length);
        g.translate(0, length);
        g.rotate(this.angle);
        length *= 0.8;
      }
      g.pop();
      // rotate(random(6, 18));
      g.rotate(this.rot); // i genuinely do not car anymore
    }
    g.pop();
  }
}

function initTerrain(g, w, h) {
  for (let i = terrainLayers; i > 0; i--) {
    // push();
    let heights = [];
    let heightScale = 1 - i * (0.8 / terrainLayers);
    let heightOffset = h * 0.75 - i * (h / 256);
    let strokeOp = heightScale * 0.2;
    // translate(0, heightOffset);
    // strokeWeight(4);
    // fill('rgba(255,255,255,0.2)');
    // stroke(`rgba(142, 165, 196,${strokeOp})`);

    // beginShape();
    let x = 0;
    for (let j = 0; j < groundHeight.length; j++) {
      let y = heightScale * groundHeight[j];

      let grassChance = random(0, 1);
      let fallOff = groundHeight.length / 8;
      if (j < fallOff && grassChance < map(j / fallOff, 0, 1, 0.2, 0.01)) {
        const m = g.drawingContext.getTransform();
        pd = g.pixelDensity();
        let gPos = createVector(x, y + m.f / pd);

        let gAngle = random(2, 12);
        let gLen = map(j / fallOff, 0, 1, h / 8, 4);
        let gSeg = floor(random(4, 7));
        let gRot = random(-10, 10);
        let gColor = `rgba(120, 215, 110,${strokeOp * 1.5})`;
        grasses.push(new Grass(gColor, gPos, gAngle, gLen, gSeg, gRot));
      }

      // vertex(x, y);
      heights.push(y);
      x += 4;
    }
    // vertex(width, height);
    // vertex(0, height);
    // endShape(CLOSE);
    // pop();
    terrains.push(heights);
  }
  resetMatrix();
}
function drawBackground(g, bgcolor, w, h) {
  g.background(bgcolor);
  var grad = g.drawingContext.createRadialGradient(
    w / 2,
    h * 0.8,
    h / 8,

    w / 2,
    h * 0.8,
    w,
  );
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(1, 'rgba(242,246,255,0)');
  g.drawingContext.fillStyle = grad;

  g.scale(2, 1);
  g.translate(-w / 4, 0);
  g.noStroke();
  g.rect(0, 0, w, h);
  g.resetMatrix();
}
function drawTerrain(g, w, h) {
  for (let i = terrainLayers; i > 0; i--) {
    push();
    let heightScale = 1 - i * (0.8 / terrainLayers);
    let heightOffset = h * 0.75 - i * (h / 256);
    let strokeOp = heightScale * 0.2;
    g.translate(0, heightOffset);
    g.strokeWeight(4);
    g.fill('rgba(255,255,255,0.2)');
    g.stroke(`rgba(142, 165, 196,${strokeOp})`);

    g.beginShape();
    let x = 0;
    for (let j = 0; j < groundHeight.length; j++) {
      // let y = heightScale * groundHeight[j];

      let y = terrains[i-1][j];
      // console.log(`(${x}, ${y})`)
      g.vertex(x, y);
      x += 4;
    }
    g.vertex(w, h);
    g.vertex(0, h);
    g.endShape(CLOSE);
    g.pop();
  }
  g.resetMatrix();

  for (let i = 0; i < grasses.length; i++) {
    grasses[i].render(g);
  }
}
function drawGradient(g, color, cx, cy, radius, w, h) {
  var grad = g.drawingContext.createRadialGradient(cx, cy, 0, cx, cy, radius);
  grad.addColorStop(0, color);
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.drawingContext.fillStyle = grad;

  g.noStroke();
  g.rect(0, 0, w, h);
  g.resetMatrix();
}

function initWinter(g, w, h) {
  g.angleMode(DEGREES);
  // frameRate(30);
  let width = w;
  let height = h;

  let noiseLevel = 128;
  let noiseScale = 0.006;
  for (let i = 0; i <= width + 4; i += 4) {
    let y = noiseLevel * noise(noiseScale * i);
    groundHeight.push(y);
  }
  initTerrain(g, w, h);

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

function renderWinter(g, w, h) {
  drawBackground(g, colors.winterColor, w, h);
  drawGradient(g, colors.springColor, -w / 3, h * 0.75, w, w, h);
  drawGradient(g, colors.fallColor, w * 1.75, h * 0.25, w, w, h);
  
  for (let i = 0; i < snowAmount; i++) {
    let s = snowflakes[i];
    s.update(g, frameCount);
  }
  drawTerrain(g, w, h);
}