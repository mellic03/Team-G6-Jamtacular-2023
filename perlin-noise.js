let map = null;
let noiseScale = 1 / 100;
let ocean = [0, 0, 0, 255];
let shore = "#DC1EF3";
let sand  = "#1E78F3";
let grass = "#F31E6F";
let stone = "#2150CD";
let snow  = "#676767";

function makeMap() {
  map = [];
  for (let i = 0; i < width; i++) {
    map[i] = [];
    for (let j = 0; j < height; j++) {
      map[i][j] = pickColor(i, j);
    }
  }
}

function pickColor(i, j) {
  let h = noise((i) * noiseScale, (j) * noiseScale);
  let c = "#ffffff";

  if (h < 0.2) {
    c = ocean;
  }
  else if (h < 0.3) {
    if (random() > pow(h - 0.2, 2) * 100) {
      c = ocean;
    }
    else {
      c = shore;
    }
  }
  else if (h < 0.4) {
    if (random() > pow(h - 0.3, 2) * 100) {
      c = shore;
    }
    else {
      c = sand;
    }
  }
  else if (h < 0.5) {
    if (random() > pow(h - 0.4, 2) * 100) {
      c = sand;
    }
    else {
      c = grass;
    }
  }
  else if (h < 0.6) {
    if (random() > pow(h - 0.5, 2) * 100) {
      c = grass;
    }
    else {
      c = stone;
    }
  }
  else if (h < 0.7) {
    if (random() > pow(h - 0.6, 2) * 100) {
      c = stone;
    }
    else {
      c = snow;
    }
  }
  else {
    c = snow;
  }

  return color(c);
}

function drawMap() {
  for (let i = 0; i < width; i++) {
    for (let j = 0; j < height; j++) {
      set(i, j, map[i][j])
    }
  }
  updatePixels();
}

function setup() {
  createCanvas(1000, 100);

  noStroke();

  background(0);

  noiseDetail(10,0.1);

  makeMap();

  drawMap();
}