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
  background(colors.winterColor);

  var grad = drawingContext.createRadialGradient(0, height/2, 0, 0, height/2, width/2);
  grad.addColorStop(0, colors.springColor);
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  drawingContext.fillStyle = grad;
  // scale(0.8,1)
  // noStroke();
  rect(0,0,width, height);
  
  resetMatrix();
  translate(width / 2, height / 2);
  noStroke();
  fill('red');
  ellipse(0,0,5);
  fill('black');

  //bezier(x1, y1, x2, y2, x3, y3, x4, y4)
  bezier(0, 0, 5, 10, 10, 15, 0, 50);
}

function draw() {}

function windowResized() {
  width = windowWidth - rem * windowPadding * 2;
  height = width / 2;
  resizeCanvas(width, height);
  background(colors.winterColor);
}
