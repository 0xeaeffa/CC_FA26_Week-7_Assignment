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
  
}

function draw() {
  
}

function windowResized() {
  width = windowWidth - rem * windowPadding * 2;
  height = width / 2;
  resizeCanvas(width, height);
  background(colors.winterColor);
}
