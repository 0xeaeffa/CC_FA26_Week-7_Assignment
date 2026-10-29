let grass = [];
let colors;
let grassColor;
let particles = [];
const NUM_PARTICLES = 100;
const NUM_GRASS_BLADES = 600;
let FLOWER_COLOR0;
const FLOWER_DENSITY_INVERSE = 40;

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

	updateAndDraw() {
		push();
		translate(this.x, this.y);

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
		rotate(totalSway);

		rectMode(CENTER);

		fill(red(grassColor) - 10, green(grassColor) - 10, blue(grassColor) - 10);
		rect(0, 0, 2, -this.h * 0.03);

		fill(grassColor);
		rect(0, -this.h / 2, 2, this.h);

		triangle(-1, -this.h, 1, -this.h, 0, -this.h - 5);

		if (this.hasFlower) {
			noStroke();
			fill(FLOWER_COLOR);
			ellipse(0, this.stemHeight, this.flowerSize, this.flowerSize);
		}

		pop();
	}
}

function drawSunflower(x, y, size, sway = 0) {
	push();
	translate(x, y);
	rotate(sway);

	// 茎
	stroke(55, 110, 45);
	strokeWeight(5 * size);
	line(0, 0, 0, -105 * size);
	noStroke();

	// 叶子
	fill(72, 135, 48);

	push();
	translate(-12 * size, -45 * size);
	rotate(-0.5);
	ellipse(0, 0, 38 * size, 14 * size);
	pop();

	push();
	translate(12 * size, -68 * size);
	rotate(0.5);
	ellipse(0, 0, 38 * size, 14 * size);
	pop();

	// 花瓣和花盘
	push();
	translate(0, -108 * size);

	for (let i = 0; i < 20; i++) {
		push();
		rotate(i * TWO_PI / 20);
		translate(0, -37 * size);
		fill(255, 191, 35);
		ellipse(0, 0, 10 * size, 22 * size);
		pop();
	}

	noStroke();
	fill(91, 56, 28);
	circle(0, 0, 54 * size);

	// 花盘里的种子点
	for (let i = 0; i < 120; i++) {
		let angle = i * 2.399963;
		let radius = 25 * size * Math.sqrt(i / 120);

		if (i % 3 === 0) {
			fill(213, 164, 68);
		} else {
			fill(47, 31, 23);
		}

		circle(
			Math.cos(angle) * radius,
			Math.sin(angle) * radius,
			2 * size
		);
	}

	pop();
	pop();
}

async function setup() {

	
	colors = await loadJSON("../utils/colors.json");

	let canvasWidth = Math.min(window.innerWidth * 0.9, window.innerHeight * 1.8);
	let canvasHeight = canvasWidth / 2;
	createCanvas(canvasWidth, canvasHeight);

	for (let i = 0; i < NUM_PARTICLES; i++) {
  particles.push({
    x: random(width),
    y: random(height),
    size: random(1.5, 3),
    speed: random(0.3, 1),
    drift: random(-0.2, 0.2),
    phase: random(TWO_PI)
  });
}

	noStroke();
	colorMode(RGB, 255);

	FLOWER_COLOR = color(220, 240, 60);
	grassColor = color(87, 158, 25);

	for (let i = 0; i < NUM_GRASS_BLADES; i++) {
		let x = random(width);
		let h = random(60, 150);
		let y = random(height / 2 + h + 5, height);
		grass.push(new GrassBlade(x, y, h));
	}
}
function drawFloatingParticles() {
  noStroke();

  for (let p of particles) {
    p.y -= p.speed;
    p.x += p.drift + sin(frameCount * 0.02 + p.phase) * 0.25;

    // 粒子飘出画布后，从底部重新出现
    if (p.y < -10) {
      p.y = height + 10;
      p.x = random(width);
    }
    if (p.x < 0) p.x = width;
    if (p.x > width) p.x = 0;

    // 三层圆叠发光效果
    fill(255, 220, 120, 20);
    circle(p.x, p.y, p.size * 6);

    fill(255, 230, 150, 55);
    circle(p.x, p.y, p.size * 3);

    fill(255, 255, 220, 220);
    circle(p.x, p.y, p.size);
  }
}
function draw() {
	function drawSummerGradient() {
  const topColor = color(colors.summerGradient.top);
  const bottomColor = color(colors.summerGradient.bottom);

  for (let y = 0; y < height; y++) {
    const amount = y / (height - 1);
    stroke(lerpColor(topColor, bottomColor, amount));
    line(0, y, width, y);
  }

  noStroke();
}
	drawSummerGradient();

	for (let blade of grass) {
		blade.updateAndDraw();
	}

	drawSunflower(
		width * 0.2,
		height * 0.96,
		1.0,
		sin(frameCount * 0.015) * 0.04
	);

	drawSunflower(
		width * 0,
		height * 0.96,
		0.6,
		sin(frameCount * 0.015) * 0.04
	);


	drawSunflower(
		width * 0.9,
		height * 0.96,
		1.0,
		sin(frameCount * 0.015) * 0.04
	);

	drawSunflower(
		width * 0.8,
		height * 0.96,
		0.6,
		sin(frameCount * 0.015) * 0.04
	);
	drawFloatingParticles();
}


function windowResized() {
	let newCanvasWidth = Math.min(window.innerWidth * 0.9, window.innerHeight * 1.8);
	let newCanvasHeight = newCanvasWidth / 2;
	resizeCanvas(newCanvasWidth, newCanvasHeight);
}