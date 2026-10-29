let pMapper;
let quadMap1, quadMap2;

let springBuf;
let surface3, surface4;

let colors;

async function setup() {
  colors = await loadJSON('./utils/colors.json');

  createCanvas(windowWidth, windowHeight, WEBGL);
  pMapper = createProjectionMapper(this);

  
  quadMap1 = pMapper.createQuadMap(400, 400, 20, 20);
  quadMap2 = pMapper.createQuadMap(400, 400, 20, 20);

  // surface of spring
  springBuf = createGraphics(400, 800);
  surface3 = createGraphics(400, 400);
  surface4 = createGraphics(400, 400);

  initSpring();
}

function draw() {
  background(0);

  renderSpring(springBuf);

  surface3.image(
    springBuf,
    0, 0, 400, 400,
    0, 0, 400, 400
  );

  surface4.image(
    springBuf,
    0, 0, 400, 400,
    0, 400, 400, 400
  );

  quadMap1.displayTexture(surface3);
  quadMap2.displayTexture(surface4);
}

function keyPressed() {
  if (key === "c") pMapper.toggleCalibration();
  if (key === "s") pMapper.save("map.json");
  if (key === "l") pMapper.load("maps/map.json");
  if (key === "f") fullscreen(!fullscreen());
  
  if (key === "r" || key === "R") {
    restartAnimation();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
