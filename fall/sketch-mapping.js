// keys: c = calibrate, s = save map, l = load map, f = fullscreen, r = restart

let pMapper;
let quadMap1, quadMap2;
let fallBuf, surface7, surface8;

async function setup() {
  colors = await loadJSON('../utils/colors.json');

  createCanvas(windowWidth, windowHeight, WEBGL);
  pMapper = createProjectionMapper(this);

  quadMap1 = pMapper.createQuadMap(400, 400, 20, 20); // surface 7
  quadMap2 = pMapper.createQuadMap(400, 400, 20, 20); // surface 8

  // surface of fall
  fallBuf = createGraphics(400, 800);
  surface7 = createGraphics(400, 400);
  surface8 = createGraphics(400, 400);

  initFall();

  // pMapper.load("maps/map.json");
}

function draw() {
  background(0);

  renderFall(fallBuf);

  // top half of the fall buffer -> surface 7
  surface7.image(
    fallBuf,
    0, 0, 400, 400,
    0, 0, 400, 400
  );

  // bottom half of the fall buffer -> surface 8
  surface8.image(
    fallBuf,
    0, 0, 400, 400,
    0, 400, 400, 400
  );

  quadMap1.displayTexture(surface7);
  quadMap2.displayTexture(surface8);
}

function keyPressed() {
  if (key === "c") pMapper.toggleCalibration();
  if (key === "s") pMapper.save("map.json");
  if (key === "l") pMapper.load("maps/map.json");
  if (key === "f") fullscreen(!fullscreen());

  if (key === "r" || key === "R") {
    initFall();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}