let grass = [];
let grassColor;
let particles = [];

const NUM_PARTICLES = 100;
const NUM_GRASS_BLADES = 600;
let FLOWER_COLOR;
const FLOWER_DENSITY_INVERSE = 40;

const SUMMER_WIDTH = 800;
const SUMMER_HEIGHT = 400;

class GrassBlade {
  constructor(x, y, h) {
    this.x = x;
    this.y = y;
    this.h = h;
    this.noiseOffset = random(1000);

    this.hasFlower = random(FLOWER_DENSITY_INVERSE) < 1;
    this.flowerSize = this.hasFlower ? random(10, 16) : 0;
    this.stemHeight = -this.h * random(0.8, 1.0);
  }

  updateAndDraw(pg) {
    pg.push();
    pg.translate(this.x, this.y);

    let noiseValue = noise(this.noiseOffset, frameCount * 0.005);
    let naturalSway = map(noiseValue, 0, 1, -0.15, 0.15);

    let distToMouse = dist(this.x, this.y, mouseX, mouseY);
    const influenceRadius = 180;
    let mouseInfluence = 0;
    let mouseWind = 0;

    if (distToMouse < influenceRadius) {
      mouseInfluence = map(distToMouse, 0, influenceRadius, 1, 0);
      let angleToMouse = atan2(mouseY - this.y, mouseX - this.x);
      let blowDirection = angleToMouse + HALF_PI;
      mouseWind = sin(blowDirection) * mouseInfluence * 0.4 * -1;
    }

    let totalSway = naturalSway + mouseWind;
    pg.rotate(totalSway);

    pg.rectMode(CENTER);

    pg.fill(
      red(grassColor) - 10,
      green(grassColor) - 10,
      blue(grassColor) - 10
    );
    pg.rect(0, 0, 2, -this.h * 0.03);

    pg.fill(grassColor);
    pg.rect(0, -this.h / 2, 2, this.h);
    pg.triangle(-1, -this.h, 1, -this.h, 0, -this.h - 5);

    if (this.hasFlower) {
      pg.noStroke();
      pg.fill(FLOWER_COLOR);
      pg.ellipse(0, this.stemHeight, this.flowerSize, this.flowerSize);
    }

    pg.pop();
  }
}

function drawSunflower(pg, x, y, size, sway = 0) {
  pg.push();
  pg.translate(x, y);
  pg.rotate(sway);

  // 茎
  pg.stroke(55, 110, 45);
  pg.strokeWeight(5 * size);
  pg.line(0, 0, 0, -105 * size);
  pg.noStroke();

  // 叶子
  pg.fill(72, 135, 48);

  pg.push();
  pg.translate(-12 * size, -45 * size);
  pg.rotate(-0.5);
  pg.ellipse(0, 0, 38 * size, 14 * size);
  pg.pop();

  pg.push();
  pg.translate(12 * size, -68 * size);
  pg.rotate(0.5);
  pg.ellipse(0, 0, 38 * size, 14 * size);
  pg.pop();

  // 花瓣和花盘
  pg.push();
  pg.translate(0, -108 * size);

  for (let i = 0; i < 20; i++) {
    pg.push();
    pg.rotate(i * TWO_PI / 20);
    pg.translate(0, -37 * size);
    pg.fill(255, 191, 35);
    pg.ellipse(0, 0, 10 * size, 22 * size);
    pg.pop();
  }

  pg.noStroke();
  pg.fill(91, 56, 28);
  pg.circle(0, 0, 54 * size);

  // 花盘里的种子点
  for (let i = 0; i < 120; i++) {
    let angle = i * 2.399963;
    let radius = 25 * size * Math.sqrt(i / 120);

    if (i % 3 === 0) {
      pg.fill(213, 164, 68);
    } else {
      pg.fill(47, 31, 23);
    }

    pg.circle(
      Math.cos(angle) * radius,
      Math.sin(angle) * radius,
      2 * size
    );
  }

  pg.pop();
  pg.pop();
}

function initSummer() {
  grass = [];
  particles = [];

  FLOWER_COLOR = color(220, 240, 60);
  grassColor = color(87, 158, 25);

  for (let i = 0; i < NUM_PARTICLES; i++) {
    particles.push({
      x: random(SUMMER_WIDTH),
      y: random(SUMMER_HEIGHT),
      size: random(1.5, 3),
      speed: random(0.3, 1),
      drift: random(-0.2, 0.2),
      phase: random(TWO_PI)
    });
  }

  for (let i = 0; i < NUM_GRASS_BLADES; i++) {
    let x = random(SUMMER_WIDTH);
    let h = random(60, 150);
    let y = random(SUMMER_HEIGHT / 2 + h + 5, SUMMER_HEIGHT);
    grass.push(new GrassBlade(x, y, h));
  }
}

function drawFloatingParticles(pg) {
  pg.noStroke();

  for (let p of particles) {
    p.y -= p.speed;
    p.x += p.drift + sin(frameCount * 0.02 + p.phase) * 0.25;

    // 飘出顶部后，从底部重新出现
    if (p.y < -10) {
      p.y = pg.height + 10;
      p.x = random(pg.width);
    }
    if (p.x < 0) p.x = pg.width;
    if (p.x > pg.width) p.x = 0;

    // 三层半透明圆组成光晕
    pg.fill(255, 220, 120, 20);
    pg.circle(p.x, p.y, p.size * 6);

    pg.fill(255, 230, 150, 55);
    pg.circle(p.x, p.y, p.size * 3);

    pg.fill(255, 255, 220, 220);
    pg.circle(p.x, p.y, p.size);
  }
}

function drawSummerGradient(pg) {
  const topColor = color(colors.summerGradient.top);
  const bottomColor = color(colors.summerGradient.bottom);

  for (let y = 0; y < pg.height; y++) {
    const amount = y / (pg.height - 1);
    pg.stroke(lerpColor(topColor, bottomColor, amount));
    pg.line(0, y, pg.width, y);
  }

  pg.noStroke();
}

function renderSummer(pg) {
  pg.colorMode(RGB, 255);
  drawSummerGradient(pg);

  for (let blade of grass) {
    blade.updateAndDraw(pg);
  }

  drawSunflower(
    pg,
    pg.width * 0.2,
    pg.height * 0.96,
    1.0,
    sin(frameCount * 0.015) * 0.04
  );

  drawSunflower(
    pg,
    pg.width * 0,
    pg.height * 0.96,
    0.6,
    sin(frameCount * 0.015) * 0.04
  );

  drawSunflower(
    pg,
    pg.width * 0.9,
    pg.height * 0.96,
    1.0,
    sin(frameCount * 0.015) * 0.04
  );

  drawSunflower(
    pg,
    pg.width * 0.8,
    pg.height * 0.96,
    0.6,
    sin(frameCount * 0.015) * 0.04
  );

  drawFloatingParticles(pg);
}