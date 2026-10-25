let grass = [];
let colors;
let grassColor;
const NUM_GRASS_BLADES = 400;
let FLOWER_COLOR; 
const FLOWER_DENSITY_INVERSE = 40; 

class GrassBlade {
	constructor(x, y, h) {
		this.x = x;
		this.y = y;
		this.h = h;
		this.noiseOffset = random(1000);
		
		// ⭐ NEW: Decide if this blade gets a flower
		this.hasFlower = (random(FLOWER_DENSITY_INVERSE) < 1);
		this.flowerSize = this.hasFlower ? random(10, 16) : 0;
		this.stemHeight = -this.h * random(0.8, 1.0); // Flower sits near the top
	}

	updateAndDraw() {
		push();
		// Move coordinate system to the base of the grass blade
		translate(this.x, this.y);

		// 1. Natural Wind (Subtle, time-based Perlin Noise)
		let noiseValue = noise(this.noiseOffset, frameCount * 0.005);
		let naturalSway = map(noiseValue, 0, 1, -0.15, 0.15); 

		// 2. Mouse Wind (Simulates a gust of wind blowing away from the cursor)
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

		// Total rotation angle
		let totalSway = naturalSway + mouseWind;

		// Apply rotation around the base (THIS IS THE KEY MOVEMENT)
		rotate(totalSway);
		
		
		rectMode(CENTER);
		
		// Darker base
		fill(red(grassColor) - 10, green(grassColor) - 10, blue(grassColor) - 10);
		rect(0, 0, 2, -this.h * 0.03); 

		// Main blade
		fill(grassColor);
		rect(0, -this.h / 2, 2, this.h); 
		
		// Pointy tip
		triangle(-1, -this.h, 1, -this.h, 0, -this.h - 5);


			if (this.hasFlower) {
			noStroke();
			fill(FLOWER_COLOR); 
			
			ellipse(0, this.stemHeight, this.flowerSize, this.flowerSize);
		}

		pop(); // Restore previous drawing settings
	}
}

// --- Setup Function (Runs Once) ---

async function setup() {
	colors = await loadJSON("../utils/colors.json");

	let canvasWidth = Math.min(window.innerWidth * 0.9, window.innerHeight * 1.8);
	let canvasHeight = canvasWidth / 2;
	createCanvas(canvasWidth, canvasHeight);
	
	// Set up drawing styles
	noStroke();
	colorMode(RGB, 255);
	
	// Initialize color variables
	FLOWER_COLOR = color(220, 240, 60); // Bright Yellow
	grassColor = color(87,158,25); // A bright green color

	// Initialize grass blades
	for (let i = 0; i < NUM_GRASS_BLADES; i++) {
		let x = random(width);
		let y = random(height * 0.3, height * 1.1); 
		let h = random(60, 150);
		// GrassBlade handles its own flower logic now
		grass.push(new GrassBlade(x, y, h));
	}
	
	// NOTE: Flower initialization loop is removed!
}

// --- Draw Function (Runs Repeatedly) ---
function draw() {
	background(colors.summerColor);

	// Draw all the grass blades (which now draw their own flowers)
	for (let blade of grass) {
		blade.updateAndDraw();
	}
}

// --- Utility Functions ---
function windowResized() {
	// Keep the canvas at a 2:1 width-to-height ratio.
	let newCanvasWidth = Math.min(window.innerWidth * 0.9, window.innerHeight * 1.8);
	let newCanvasHeight = newCanvasWidth / 2;
	resizeCanvas(newCanvasWidth, newCanvasHeight);
}
