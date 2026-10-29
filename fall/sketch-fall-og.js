// same from winter to set margin
const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
const windowPadding = 1.6; // rem

let fallingLeaves = []; // falling leave array
let groundLeaves = []; // ground leaves array
let groundHeight = []; // height of eeach piles of array
let gradient = []; // gradient colors
let colors;

const maxFallingLeaf = 40; // most leaves in air
const spawnChance = 0.08; // chances of leaf spawn each frame

// leaf pile variables
const pileHeight = 0.12; // fractiono f canvas hright
const pileCount = 220; // num of leaves in the pile
const fadeSpeed = 3; // how fast a falling leave fades at th ebottom of screen

// leaf blown to the left
const blownChance = 0.8;

// colors for leaves, each blend two colors
const leafColors = [
  '#E8A33A', 
  '#D9B44A', 
  '#E2702B', 
  '#C4472B', 
  '#9C3A22', 
  '#7A4A2A'];

async function setup() {
  // load color file
  colors = await loadJSON('../utils/colors.json');

  // window width height ratio 1:2
  createCanvas(canvasSize()/2, canvasSize());

  // initialize base fall color gradient
  gradient = [
    colors.summerColor, // top edge that connects with summer
    '#F2B134',
    colors.fallColor,
    '#B5432A',
    '#4B2A26',
  ]

  // build leave piles on ground
  buildLeavePile();

}

function draw() {
  drawSummerGradient();
  drawWinterGradient();

  // draw leave pile
  for(const groundLeaf of groundLeaves) {
    groundLeaf.show();
  }

  // add new leaf above top edge
  if (fallingLeaves.length < maxFallingLeaf && random() < spawnChance){
    fallingLeaves.push(new leaf(random(width), -height * 0.06));
  }

  // make leaves fall
  for(const leaf of fallingLeaves){
    leaf.update();
    // check if fade leave when reac the pile height
    if(!leaf.blown && leaf.y + leaf.size * 0.2 >= height *(1-pileHeight)){
      leaf.fading = true;
    }
    if(leaf.fading) {
      leaf.alpha -= fadeSpeed;
    }
    leaf.show();
  }

  // remove leaves fallen past the bottom, or that faded out, or that blown away to the side
  for(let i = fallingLeaves.length-1; i >= 0; i --) {
    if(fallingLeaves[i].y > height + fallingLeaves[i].size 
      || fallingLeaves[i].alpha <=0 
      || fallingLeaves[i].swayCenter < -(fallingLeaves[i].size + fallingLeaves[i].dev)){
      fallingLeaves.splice(i, 1); // remove the leaf at position i 
    }
  }
}

// fuunction for canvas resize
function canvasSize(){
  // height is windowheight minus top and bottom margin
  const h = windowHeight - rem * windowPadding * 2;
  return h; // return height
}

// paint the vertical gradient in the gradient array
function drawSummerGradient() {
  // a gradient line from top to bottom
  const grad = drawingContext.createLinearGradient(0, 0, 0, height);
  // spread color evenly from top to bottom
  for(let i = 0; i < gradient.length; i++){
    grad.addColorStop(i/(gradient.length - 1), gradient[i]);
  }
  // fill the whole canvas using grad as paint
  drawingContext.fillStyle = grad;
  drawingContext.fillRect(0, 0, width, height);
}

function drawWinterGradient() {
  // end gradient half way across the top, so it fades into the top of the winter scene
  const winterGrad = drawingContext.createRadialGradient(0, height*0.25, 0, 0, height*0.25, height*0.25);
  // start with solid winter color
  winterGrad.addColorStop(0, colors.winterColor);
  winterGrad.addColorStop(0.3, colors.winterColor);
  // end with transparent winter color
  winterGrad.addColorStop(1, 'rgba(242, 246, 255, 0)'); 

  // paint the gradient
  drawingContext.fillStyle = winterGrad; // use winter gradient as a fill
  drawingContext.fillRect(0, 0, width, height); // fill the canvas
}

// leaves class
class leaf {
  constructor(x, y){
    // position
    this.x = x;
    this.y = y;
    // size of leaf in proportion to the canvas
    this.size = random(0.06, 0.11) * width;
    // random rotation of elaves
    this.angle = random(TWO_PI);
    // transparency variable for fading later
    this.alpha = 255;
    this.fading = false; // true when leaves touch ground pile to trigger fading

    // maple leaf chance
    this.isMaple = random() < 0.4;

    // blown chance
    this.blown = random() < blownChance;
    this.blownStartX = x;

    // leaf movement
    this.swayCenter = x; // x spawn coord of leave is the center line it sways around
    // falling speed
    this.vy = random(0.6, 1.4) * (height/600);
    // left and right sway deviation
    this.dev = random(10, 40) *(width/400);
    // how fast it sways
    this.freq = random(0.02, 0.05);
    // start phase of sway
    this.phase = random(TWO_PI);
    // leave lean while falling
    this.lean = random(-0.4, 0.4);
    // frame since made
    this.frame = 0;
    // blend two random colors from the leave color array
    const col1 = color(random(leafColors));
    const col2 = color(random(leafColors));
    this.col = lerpColor(col1, col2, random());
  }

  // update the leaf every new frame
  update(){
    this.frame++;
    this.y += this.fading ? this.vy * random(0.1, 0.5) : this.vy; // fall down, or fading while slow fall down
    
    // blown leaves
    if (this.blown) {
      const fallenFraction = this.y / (height * (1-pileHeight)); // how far the blown leave have fallen scale from 0 to 1
      // move the center of swaying of the blown leave according to their callen progress
      // -(this.size + this.dev) is a spot just pass the left edge of the screen
      // fallenFraction * fallenFraction is a quadratic function that describes the blow curve
      // the drifts will left slowly at first, then gets swept out near the bottom
      this.swayCenter = lerp(this.blownStartX, -(this.size + this.dev), fallenFraction * fallenFraction);
    }
    // sway side to side
    this.x = this.swayCenter + this.dev * sin (this.phase + this.frame * this.freq);
    // rocking as swaying
    this.angle = this.lean + 0.6 * cos(this.phase + this.frame*this.freq)
  }
  // draw the leaf
  show() {
    const s = this.size;
    const c = this.col;

    push();
    translate(this.x, this.y);
    rotate(this.angle);

    // create shape of leave
    noStroke();
    fill(red(c), green(c), blue(c), this.alpha);

    // draw maple (10 points around a circle, consists of tip and notch)
    if(this.isMaple){
      beginShape();
      for (let i = 0; i < 14; i ++) {
        // angle of this point
        const angle = -HALF_PI + i * TWO_PI/14;
        const bottomTip = (1 - sin(angle)) / 2; // smaller tips near the bottom
        const r = i % 2 === 0 ? s * (0.3 + 0.22*bottomTip) : s * 0.2; // make even points a tip and odd poitns notch
        vertex(r * cos(angle), r * sin(angle));
      }
      endShape(CLOSE);

      // draw maple stem
      stroke(red(c) * 0.6, green(c) * 0.6, blue(c) * 0.6, this.alpha);
      strokeWeight(max(1, s * 0.04));
      line(0, 0, 0, s * 0.6);
    }
    else{
      beginShape();
      // draw the two arcs of a leave, tracing down the right side then back up the left
      // right half first
      for(let i = 0; i < 10; i ++){
        const div = i / 10; // divide right arc of the leaf into ten parts
        vertex(s * 0.3 * sin(PI*div), -s/2 + s*div); // x -> how far from the middle, y -> top to bottom leave be -s/2 and s/2
      }
      // left half
      for(let i = 10; i >= 0; i --){
        const div = i / 10; // divide left arc of the leaf into ten parts
        vertex(-s * 0.3 * sin(PI*div), -s/2 + s*div); // the other way round
      }

      endShape(CLOSE);

      // draw vein and stem, darker color
      stroke(red(c)*0.6, green(c)*0.6, blue(c)*0.6, this.alpha);
      strokeWeight(max(1, s *0.04));
      line(0, -s*0.45, 0, s*0.62);
    }
    pop();
  }
}

// build the leave pile at the bottom of the screen
function buildLeavePile() {
  // y level of where pile begines
  const pileTop = height * (1-pileHeight);
  for(let i = 0; i < pileCount; i++){
    const groundLeaf = new leaf(random(width), random(pileTop, height));
    // make color darker at the bottom to build depth of pile
    // darker toward the bottom
    groundLeaf.col = lerpColor(color(0), groundLeaf.col, map(groundLeaf.y, height, pileTop, 0.55, 1));
    // lie the leaves mostly flat
    groundLeaf.angle = HALF_PI + random(-0.5, 0.5);
    groundLeaves.push(groundLeaf); // push into ground leave array
  }
  

}