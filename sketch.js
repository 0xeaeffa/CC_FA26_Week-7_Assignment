let pMapper;
let quadMap1, quadMap2;
let quadMapFall1, quadMapFall2;

let springBuf;
let surface3, surface4;

let winterBuf;
let qmWinter1, qmWinter2;
let sfWinter1, sfWinter2;
let fallBuf, surface7, surface8;

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

  qmWinter1 = pMapper.createQuadMap(400, 400, 20, 20);
  qmWinter2 = pMapper.createQuadMap(400, 400, 20, 20);

  winterBuf = createGraphics(800, 400);
  sfWinter1 = createGraphics(400, 400);
  sfWinter2 = createGraphics(400, 400);
  initWinter(winterBuf, 800, 400);

  // surface of fall
  quadMapFall1 = pMapper.createQuadMap(400, 400, 20, 20);
  quadMapFall2 = pMapper.createQuadMap(400, 400, 20, 20);

  fallBuf = createGraphics(400, 800);
  surface7 = createGraphics(400, 400);
  surface8 = createGraphics(400, 400);

  initFall();
}

function draw() {
  background(0);

  renderSpring(springBuf);
  surface3.image(springBuf, 0, 0, 400, 400, 0, 0, 400, 400);

  surface4.image(springBuf, 0, 0, 400, 400, 0, 400, 400, 400);

  quadMap1.displayTexture(surface3);
  quadMap2.displayTexture(surface4);

  renderFall(fallBuf);

  // top half of the fall buffer -> surface 7
  surface7.image(fallBuf, 0, 0, 400, 400, 0, 0, 400, 400);

  // bottom half of the fall buffer -> surface 8
  surface8.image(fallBuf, 0, 0, 400, 400, 0, 400, 400, 400);

  quadMapFall1.displayTexture(surface7);
  quadMapFall2.displayTexture(surface8);

  renderWinter(winterBuf, 800, 400);
  sfWinter1.image(winterBuf, 0, 0, 400, 400, 0, 0, 400, 400);
  sfWinter2.image(winterBuf, 0, 0, 400, 400, 400, 0, 400, 400);
  qmWinter2.displayTexture(sfWinter2);
  qmWinter1.displayTexture(sfWinter1);
}

function keyPressed() {
  if (key === 'c') pMapper.toggleCalibration();
  if (key === 's') pMapper.save('map.json');
  if (key === 'l') pMapper.load('maps/map.json');
  if (key === 'f') fullscreen(!fullscreen());

  if (key === 'r' || key === 'R') {
    restartAnimation();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
