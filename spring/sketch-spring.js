let canvasW = 400;
let canvasH = 800;

let colors;
let drops = [];
let dandelions = [];
let stems = [];

let rainCount = 60;
let paused = false;
let emptyStart = -1;

const RAIN_PHASE = 240;     
const RELEASE_PHASE = 320; 
const EMPTY_PHASE = 90;     
const TOTAL_PHASE = RAIN_PHASE + RELEASE_PHASE + EMPTY_PHASE;

async function setup() {
  colors = await loadJSON('../utils/colors.json');
  createCanvas(canvasW, canvasH);

  for (let i = 0; i < rainCount; i++) {
    drops[i] = new Drop();
  }
  //注意先画背景后画雨滴

  dandelions.push(new Dandelion(270, 800, 300));
  dandelions.push(new Dandelion(120, 800, 180));
  //花茎根部X,Y和蒲公英高度

  // 创建10株背景绿草
  for (let i = 0; i < 90; i++) {
    stems.push({
      x: random(0, 400),
      h: random(20, 120),
      depth: random(0, 1),
      phase: random(TWO_PI)
    });
  }
}

function draw() {
  background(colors.winterColor);
  noStroke();

//渐变背景
  let yellowGrad = drawingContext.createRadialGradient(
    0, 0, 0, 100, 0, 300
  );

  yellowGrad.addColorStop(0, '#f6df63');
  yellowGrad.addColorStop(1, 'rgba(246,223,99,0)');
  //0：起点，使用不透明黄色，1：终点，使用完全透明的黄色。

  drawingContext.fillStyle = yellowGrad;
  drawingContext.fillRect(0, 0, canvasW, canvasH);
  //createRadialGradient() 只创建渐变对象，不会自动把它绘制出来
  // 需要配合 fillStyle 或 strokeStyle

  let greenGrad = drawingContext.createRadialGradient(
    canvasW, canvasH, 0,
    canvasW, canvasH, 500
  );

  greenGrad.addColorStop(0, colors.springColor);
  greenGrad.addColorStop(1, 'rgba(246,184,196,0)');

  drawingContext.fillStyle = greenGrad;
  drawingContext.fillRect(0, 0, canvasW, canvasH);

//雨滴序列
  for (let i = 0; i < drops.length; i++) {
    drops[i].fall();
    drops[i].show();
  }

//绿草序列
  for (let s of stems) {

    let tipX = s.x + sin(frameCount * 0.025 + s.phase) * 12;
    let tipY = canvasH - s.h;

    // 后面的草较暗，前面的草较亮
    let grassColor = lerpColor(
      color(50, 100, 55),
      color(120, 215, 110),
      s.depth
    );

    push();
    noFill();
    stroke(grassColor);
    strokeWeight(map(s.depth, 0, 1, 2, 5));
    strokeCap(ROUND);

    bezier(
      s.x, canvasH,
      s.x, canvasH - s.h * 0.3,
      tipX, canvasH - s.h * 0.7,
      tipX, tipY
    );

    pop();
  }

//蒲公英序列
  for (let flower of dandelions) {
    flower.update();
    flower.show();
  }

  // 检查两株蒲公英是否全部脱落
  if (dandelions.every(flower => flower.released === flower.maxRelease)) {

    // 第一次全部脱落时，开始计时
    if (emptyStart === -1) {
      emptyStart = frameCount;
    }

    // 等待300帧后重新播放
    if (frameCount - emptyStart >= 480) {
      restartAnimation();
    }
  }
}

//雨滴
function Drop() {
 // Position
  this.x = random(0, width);
  this.y = random(-300, -600);
  //y小于0，雨滴在画布上方随机落下
 // Depth
  this.z = random(0, 20);
  //z值越大 雨滴越近
// Size and speed
  this.len = map(this.z, 0, 20, 10, 20);
  //将雨滴长度（10-20）与z值（0-20）map,保证z值越大，雨滴越近，雨滴长度越大
  this.yspeed = map(this.z, 0, 20, 2, 6);
  //雨滴下落速度也与z值map，进的雨滴下落的快
// Color based on depth
  this.r = map(this.z, 0, 20, 190, 90);
  this.g = map(this.z, 0, 20, 220, 150);
  this.b = map(this.z, 0, 20, 235, 210);
  this.alpha = map(this.z, 0, 20, 100, 220);
 // Movement
  this.fall = function() {
    this.x -= 4 + sin(frameCount * 0.02) * 1.5;
    //雨滴从右侧向左飘
    this.y += this.yspeed;
    //每一帧y值都要加speed 实现雨滴不断向下移动
    this.yspeed += 0.05;
    //重力加速度=0.05，y值越大雨滴越往下，下落速度越快
    
    if (this.x < -20 || this.y > height + 20) {
      this.x = random(width, width + 100);
      this.y = random(-300, 0);
      this.yspeed = map(this.z, 0, 20, 2, 6);
    }
    //当雨滴落出画布时，雨滴重新从画布顶端按照初始速度下落，而不是持续上一帧的底部最高速度 
  }
 // Drawing
  this.show = function() {
  var thick = map(this.z, 0, 20, 1, 3);
  strokeWeight(thick);
  //根据 Z 值决定雨滴线条粗细
  stroke(this.r, this.g, this.b, this.alpha);
  //255 * 1/thick：粗线条更加透明
  noFill();
  line(this.x, this.y, this.x - this.len * 0.5, this.y + this.len);
  }
}

//蒲公英
class Dandelion {
  // 初始化蒲公英
  constructor(x, y, h) {
    this.x = x;
    this.y = y;
    this.h = h;

  
    this.tipX = x;
    this.tipY = y - h;
    //计算花头位置

    this.seeds = [];
    this.released = 0;
    this.maxRelease = 60;
    this.age = 0;

    // 生成60颗围绕花头的种子
    for (let i = 0; i < 60; i++) {
      let angle = TWO_PI * i / 60;
      //随着i增加，每个种子旋转6度

      //将一个新对象添加到seeds数组的末尾
      this.seeds.push({
        angle: angle,
        radius: random(35, 48),
        //种子与花头中心的距离
        attached: true,
        //attached表示种子是否仍然附着在花头上
        x: 0, y: 0, vx: 0, vy: 0,
        //初始化种子的运动属性

        rotation: angle,
        spin: random(-0.04, 0.04),
        //rotation：当前旋转角度，spin：每帧改变多少旋转角度
        phase: random(TWO_PI)
        //让每颗种子从正弦波的不同位置开始运动，从而让它们的上下浮动错开。
      });
    }
  }

  // 更新蒲公英的位置与运动，随风摇摆
  update() {
    this.age++;

    let wind = sin(frameCount * 0.025) * 35;
    this.tipX = this.x + wind;
    this.tipY = this.y - this.h + sin(frameCount * 0.02) * 5;
    //花头位置水平周期摆动，竖向微微摆动

    if (
      this.age > 150 &&
      //蒲公英先完整地摇摆约2.5秒，再开始脱落。
      this.age % 35 === 0 &&
      //每35帧释放一颗种子
      this.released < this.maxRelease
      //最多脱落60颗种子
    ) {
      this.detachSeed();
    }

    for (let i = 0; i < this.seeds.length; i++) {
      let seed = this.seeds[i];
      if (!seed.attached) {
        //! 表示逻辑取反（NOT）只有脱落的种子才执行本组飞行代码
        seed.x += seed.vx;
        seed.y += seed.vy + sin(frameCount * 0.04 + seed.phase) * 0.5;
        //phase是0-2PI的随机值，让每颗种子从正弦波的不同位置开始运动，从而让它们的上下浮动错开。
        seed.vx -= 0.003;
        //向左的水平风力持续增强
        seed.rotation += seed.spin;
        //让种子随机以改变的角度在空中转动
      }
    }
    //脱落后，绒毛如何在空中飘动
  }

  // 如何让种子脱离
  detachSeed() {
    
    let attachedSeeds = this.seeds.filter(
      s => s.attached
    );
    //找到所有未脱落的种子

    if (attachedSeeds.length === 0) return;
    //如果=0说明所有种子都脱落了，那么return会直接结束detachSeed()，防止从空数组里选择种子。

    let seed = random(attachedSeeds);
    //从已附着的数组中随机选择一个种子


    seed.x = this.tipX + cos(seed.angle) * seed.radius;
    seed.y = this.tipY + sin(seed.angle) * seed.radius;
    //种子脱落瞬间的实际位置，radius：种子距离花头中心的距离

    seed.vx = random(-2.2, -1.2);
    seed.vy = random(-4, -0.6);
    //使绒毛向左上方飞走

    seed.attached = false;
    //将状态改为脱落
    this.released++;
    //已脱落数量加1

  }

  // 绘制蒲公英花茎、花头和种子
  show() {
    push();
    noFill();
    stroke(45, 145, 65);
    strokeWeight(5);
    strokeCap(ROUND);
    //线条末端使用圆形

    bezier(
      this.x, this.y,
      this.x - 20, this.y - this.h * 0.35,
      this.tipX - 35, this.tipY + 90,
      this.tipX, this.tipY
    );

    // 绘制小种子drawseed
    noStroke();
    fill(112, 143, 77);
    circle(this.tipX, this.tipY, 13);

    for (let seed of this.seeds) {
      if (seed.attached) {
        let sx = this.tipX + cos(seed.angle) * seed.radius;
        let sy = this.tipY + sin(seed.angle) * seed.radius;
        drawSeed(sx, sy, seed.angle + HALF_PI);
        //如果种子尚未脱离，根据当前花头位置计算出它的位置，继续附着在花头上，HALF_PI 表示90°，用于调整种子的朝向
      } 
      else {
        drawSeed(seed.x, seed.y, seed.rotation);
        //如果已经脱离，使用每个种子自己的飞行位置与旋转角度
      }
    }

    pop();
  }
}

// 如何绘制单颗种子
function drawSeed(x, y, angle) {
  push();

  translate(x, y);
  //绘制种子时的坐标系已经移到了花头的x和y值
  rotate(angle);

  // 绘制棕色椭圆种子
  noStroke();
  fill(169, 139, 95);
  ellipse(0, 0, 3, 6);

  // 绘制细杆
  stroke(145, 137, 112);
  strokeWeight(1);
  line(0, -2, 0, -16);
  //从种子上方2像素的位置，向上绘制到-16

  // 绘制绒毛
  stroke(185, 179, 155, 220);
  strokeWeight(0.8);

  for (let i = 0; i < 9; i++) {
    //循环9次，每次绘制一根绒毛
    let a = map(i, 0, 8, PI, TWO_PI);
    //将 i 从0～8映射到180°～360°，绒毛会沿着一个半圆展开。
    let px = cos(a) * 12;
    let py = -16 + sin(a) * 12;
    line(0, -16, px, py);
  }
  pop();
}


function restartAnimation() {
  // 重新创建雨滴
  drops = [];
  for (let i = 0; i < rainCount; i++) {
    drops[i] = new Drop();
  }

  // 重新创建完整蒲公英  
  dandelions = [];
  dandelions.push(new Dandelion(270, 800, 300));
  dandelions.push(new Dandelion(120, 800, 180));

  // 重置计时器
  emptyStart = -1;
  cycleFrame = 0;
}

function keyPressed() {
  // R：重新开始
  if (key === 'r' || key === 'R') {
    restartAnimation();
    paused = false;
    loop();
    return false;
  }
}
    