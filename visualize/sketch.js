/*
wiki-tSNE:: Wikipedia articles of political ideologies / philosophical concepts.
Converted to tf-idf matrix, then clustered by t-SNE.
*/

// first time you load the data, the exact positions have to be adjusted so set adjust to true
// after that, move the downloaded adjusted json file to the sketch folder and set adjust to be false
var filename = 'data_political';
var adjust = false;

// parameters
var zoom = {x:1.5, y:3.0};
var txtSize = 20;
var margin = {box:8, l:80, t:50, r:350, b:70};
var tx = 120;
var ty = 85;
var infoMargin = 36;  


////////////////////////////////////////
var canvas;
var data;
var boxes;
var info;
var tl, br;
var highlighted;
var infoHighlighted;
var ox, oy;

function preload() {
  if (adjust) { // slow, need to do this first time to get adjusted boxes which don't collide
    data = loadJSON(filename+".json");
  }
  else {  // load pre-adjusted data
    data = loadJSON(filename+"_adjusted.json");
  }
}

function setup() {
  var cw = 1440; //windowWidth;
  var ch = 800; //windowHeight;
  canvas = createCanvas(zoom.x * cw + margin.l + margin.r, zoom.y * ch + margin.t + margin.b);
  textSize(txtSize);  
  
  tl = {x:zoom.x*width, y:zoom.x*height};
  br = {x:-zoom.y*width, y:-zoom.y*height};
  
  var x = data.x;
  var y = data.y;
  var names = data.names;
  
  boxes = [];
  for (var i=0; i<x.length; i++) {
    var x_ = x[i];
    var y_ = y[i];
    if (adjust) { // originals are normalized to {0, 1}, so spread them
      x_ *= (zoom.x * width);
      y_ *= (zoom.y * height);
    }
    var w_ = textWidth(names[i]) + 2 * margin.box;
    var h_ = txtSize + 2 * margin.box;
    var box = {x:x_, y:y_, w:w_, h:h_, txt:names[i]};
    boxes.push(box);
  }
  
  // for unadjusted file, do overlapping procedure (this may take some time)
  if (adjust) {
    var hasOverlap = true;
    while (hasOverlap) {
      hasOverlap = step();
    }
  }
  
  // get bounds
  for (var i=0; i<boxes.length; i++) {
    if (boxes[i].x < tl.x)  tl.x = boxes[i].x;
    if (boxes[i].y < tl.y)  tl.y = boxes[i].y;
    if (boxes[i].x > br.x)  br.x = boxes[i].x;
    if (boxes[i].y > br.y)  br.y = boxes[i].y;
  }
  
  if (adjust) {
    // adjust to (0, 0), and save adusted boxes
    var x_adj = [];
    var y_adj = [];
    for (var i=0; i<boxes.length; i++) {
      boxes[i].x -= tl.x;
      boxes[i].y -= tl.y;
      x_adj.push(boxes[i].x);
      y_adj.push(boxes[i].y);
    }
    br.x -= tl.x;
    br.y -= tl.y;
    tl = {x:0, y:0};
    saveJSON({x:x_adj, y:y_adj, names:names}, filename+"_adjusted.json");  // move this file to your sketch folder
  }
  ox = tl.x - margin.l;
  oy = tl.y - margin.t;
  highlighted = -1;
  infoHighlighted = -1;
  
  // create info box on top left
  var line11 = "Wikipedia articles of ";
  var line12 = "political ideologies";
  var line13 = ",";
  var line21 = "converted to ";
  var line22 = "tf-idf";
  var line23 = ", then clustered by ";
  var line24 = "t-SNE";
  var line25 = ".";
  var line31 = "code: ";
  var line32 = "IPython notebook";
  var line33 = ", visualized with ";
  var line34 = "p5.js";
  var line35 = ".";
  var line41 = "by "
  var line42 = "@genekogan";
  info = [ ];
  info.push({txt:line11, x:tx, y:ty, link:null});
  info.push({txt:line12, x:tx + textWidth(line11), y:ty, link:"https://en.wikipedia.org/wiki/List_of_political_ideologies"});
  info.push({txt:line21, x:tx, y:ty + infoMargin, link:null});
  info.push({txt:line22, x:tx + textWidth(line21), y:ty + infoMargin, link:"https://en.wikipedia.org/wiki/Tf%E2%80%93idf"});
  info.push({txt:line23, x:tx + textWidth(line21) + textWidth(line22), y:ty + infoMargin, link:null});
  info.push({txt:line24, x:tx + textWidth(line21) + textWidth(line22) + textWidth(line23), y:ty + infoMargin, link:"https://en.wikipedia.org/wiki/T-distributed_stochastic_neighbor_embedding"});
  info.push({txt:line25, x:tx + textWidth(line21) + textWidth(line22) + textWidth(line23) + textWidth(line24), y:ty + infoMargin, link:null});
  info.push({txt:line31, x:tx, y:ty + 2*infoMargin, link:null});
  info.push({txt:line32, x:tx + textWidth(line31), y:ty + 2*infoMargin, link:"https://www.github.com/genekogan/wiki-tSNE"});
  info.push({txt:line33, x:tx + textWidth(line31) + textWidth(line32), y:ty + 2*infoMargin, link:null});
  info.push({txt:line34, x:tx + textWidth(line31) + textWidth(line32) + textWidth(line33), y:ty + 2*infoMargin, link:"http://www.p5js.org"});
  info.push({txt:line35, x:tx + textWidth(line31) + textWidth(line32) + textWidth(line33) + textWidth(line34), y:ty + 2*infoMargin, link:null});
  info.push({txt:line41, x:tx, y:ty + 3*infoMargin, link:null});
  info.push({txt:line42, x:tx + textWidth(line41), y:ty + 3*infoMargin, link:"https://www.twitter.com/genekogan"});

  // draw the screen and turn off frame loop
  drawScreen();
  noLoop();
}

function drawInfoText(txt, x, y, link) {
  push();
  if (link != null) {
    fill(0, 0, 255);
  }
  else {
    fill(0);
  }
  noStroke();
  text(txt, x, y);
  if (link != null) {
    stroke(0, 0, 255, 150);
    strokeWeight(2);
    line(x, y+6, x + textWidth(txt), y+6);
  }
  pop();
}

function drawScreen() {
  background(255);
  
  // draw info box
  push();
  fill(0, 15);
  rect(tx-20, ty-40, 500, 200)
  for (var i=0; i<info.length; i++) {
    drawInfoText(info[i].txt, info[i].x, info[i].y, info[i].link);
  }
  pop();
  
  // draw boxes
  push();
  translate(-ox, -oy);

  for (var i=0; i<boxes.length; i++) {
    //if (boxes[i].x - ox + boxes[i].w < scroll.x || boxes[i].x - ox > scroll.x + ww || boxes[i].y - oy + boxes[i].h < scroll.y || boxes[i].y - oy > scroll.y + wh) {
      //continue;
    //}
    noStroke();
    if (i == highlighted) {
      fill(0, 0, 150);
      text(boxes[i].txt, boxes[i].x + margin.box, boxes[i].y + txtSize + margin.box);
      stroke(0, 0, 255);
      strokeWeight(3);
    }
    else {
      fill(0);
      text(boxes[i].txt, boxes[i].x + margin.box, boxes[i].y + txtSize + margin.box);
      stroke(0, 80);
      strokeWeight(1);
    }
    noFill();
    rect(boxes[i].x, boxes[i].y, boxes[i].w, boxes[i].h);
  }
  pop();
}

function mouseMoved() {
  var mX = mouseX;
  var mY = mouseY+txtSize;
  for (var i=0; i<info.length; i++) {
    if (info[i].link != null) {
      if ((mX > info[i].x) && (mX < info[i].x + textWidth(info[i].txt)) && (mY > info[i].y) && (mY < info[i].y + txtSize + 9)) {
        if (infoHighlighted != i) {
          infoHighlighted = i;
          highlighted = -1;
          canvas.style("cursor", "pointer");
          return;
        }
        else {
          return;
        }
      }
    }
  }
  if (infoHighlighted != -1) {
    infoHighlighted = -1;
    canvas.style("cursor", "default");
    drawScreen();
  }
  mX = mouseX + ox;
  mY = mouseY + oy;
  for (var i=0; i<boxes.length; i++) {
    if ((mX > boxes[i].x) && (mX < boxes[i].x + boxes[i].w) && (mY > boxes[i].y) && (mY < boxes[i].y + boxes[i].h)) {
      if (highlighted != i) {
        highlighted = i;
        canvas.style("cursor", "pointer");
        drawScreen();
      }
      return;
    }
  }
  if (highlighted != -1) {
    highlighted = -1;
    canvas.style("cursor", "default");
    drawScreen();
  }
}

function mousePressed() {
  if (infoHighlighted == -1 && highlighted == -1) {
    return;
  }
  if (infoHighlighted != -1) {
    window.open(info[infoHighlighted].link,'_blank')
  }
  else if (highlighted != -1) {
    window.open('https://en.wikipedia.org/wiki/'+boxes[highlighted].txt,'_blank')
  }
  highlighted = -1;
  infoHighlighted = -1;
  canvas.style("cursor", "default");
  drawScreen();
}

function step() {
  var hasOverlap = false;
  var s = [];
  for (var i=0; i<boxes.length; i++) {
    var s_ = {x:0, y:0};
    for (var j=0; j<boxes.length; j++) {
      if (i==j) continue;
      var o = overlap(boxes[i], boxes[j]);
      if (o > 0) {
        hasOverlap = true;
        var a = atan2(boxes[i].y - boxes[j].y, boxes[i].x - boxes[j].x);
        var d = 1;
        s_.x += d * cos(a);
        s_.y += d * sin(a);
      } 
    }
    s.push(s_);
  }
  // make corrections
  for (var i=0; i<boxes.length; i++) {
    boxes[i].x += s[i].x;
    boxes[i].y += s[i].y;
  }
  return hasOverlap;
}

function overlap(R1, R2) {
  if (R1.x > (R2.x+R2.w) || R2.x > (R1.x+R1.w)) {
    return 0;
  }
  if (R1.y > (R2.y+R2.h) || R2.y > (R1.y+R1.h)) {
    return 0;
  }
  return dist(R1.x+R1.w/2, R1.y+R1.h/2, R2.x+R2.w/2, R2.y+R2.h/2);
}
