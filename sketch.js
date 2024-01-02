/// <reference path="./util/p5.global-mode.d.ts" />
let nodes; //array of all nodes
let points;
let speed;
let decay;
let point_mass;
let field;
let bounds;
let qtree;
let windowSize = 800;
let playing
let timer
let age_factor
let vector_choice;

// Restart all the Mover objects randomly
function reset() {
  //SETUP
  nodes = [];
  points = null;
  bounds = [];
  qtree = new Quadtree(createVector(0,0), createVector(800, 800), null, 1)
  timer = 0

  //MODIFIERS
  speed = 0.5;
  decay = 3;
  point_mass = 1;
  age_factor = 0.25;
  vector_choice = 2;

  //VECTOR FIELD
  field = new Flow(rows = 16, cols = 16, 0, width, 0, height);
  field.update_field(frameCount, choice = vector_choice);

  //INITIAL POINTS
  let x = width / 2;
  let y = height / 2;

  circle2D(x, y, n=10, r=20, split=30);
  //line2D(x, y, split=20);
  noLoop();
  playing = false;
}

function setup() {
  let cnv = createCanvas(windowSize, windowSize);
  cnv.position(0, 0);
  reset();
  frameRate(30);
}

function displayItems() {
  if (frameCount % (decay * 60) == 0) {
    speed *= 0.999;
  }
  
  field.display();
  for (let b of bounds) {
    b.display()
  }
  
  fill(255)
  textSize(50);
  text(points.length, 20, 50);
}

function draw() {
  background(50);
  noStroke();
  // console.log(directory)
  displayItems()

  field.update_field(
    frameCount, 
    choice = vector_choice);
  points.grow(
    closed = true, 
    render_line = false, 
    flow_field = field, 
    brute = false);
    if (points.length >= 1500) noLoop();
}

function mousePressed() {
    playing = true
    reset();
    loop();
}

function keyPressed() {
  noLoop();
  // this will download the first 5 seconds of the animation!
  if (key === 's') {
    // 10 is 600
    saveGif('mySketch', 600 / 60);
  }
}

/**
 * Default circle in 2D
 * @param {} x 
 * @param {} y 
 */
function circle2D(x, y, n, r, split) {
  let index = 0;
  for (let i = 0; i <= 2 * Math.PI; i+=(2 * Math.PI / n)) {
    let point = createVector(x + r * Math.cos(i), y + r * Math.sin(i));
    let dir = p5.Vector.sub(point, createVector(x, y)).limit(speed);
    nodes[index] = new Point(point, point_mass, dir);
    index++;
  }

  nodes[0].show = true;

  points = new Path(nodes[0], split);

  for (let j = 1; j < index - 1; j++) {
    points.append(nodes[j]);
  }

  let list = points.head;
  while (list) {
    qtree.insert(list);
    list = list.next;
  }
}

function line2D(x, y, split) {
  nodes[0] = new Point(createVector(x - 5, y), point_mass, createVector(-speed, 0.0));
  nodes[1] = new Point(createVector(x, y), point_mass, createVector(0.0, 0.0));
  nodes[2] = new Point(createVector(x + 5, y), point_mass, createVector(speed, 0.0));

  points = new Path(nodes[0], split);
  points.append(nodes[1]);
  points.append(nodes[2]);

  let list = points.head;
  while (list) {
    qtree.insert(list);
    list = list.next;
  }
}