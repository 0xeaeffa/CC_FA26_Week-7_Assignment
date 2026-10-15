
var colors;

async function setup() {
  colors = await loadJSON('./utils/colors.json');
  console.log(colors);

  createCanvas(800, 600);
}

function draw() {
  // console.log(springColor);
  background(colors.springColor);
}
