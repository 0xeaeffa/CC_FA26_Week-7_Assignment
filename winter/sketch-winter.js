
var colors;

async function setup() {
  colors = await loadJSON('../utils/colors.json');
  console.log(colors);

  createCanvas(800, 600);
}

function draw() {
  background(colors.winterColor);
}
