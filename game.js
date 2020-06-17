//TO DO LIST:
// - mobile touch support
// - add all the voices !
// - panning
// - dynamic scaling for huge/tiny windows
// - make it look pretty!
// - window rescaling

//declarations
let canvas = document.getElementById("myCanvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let ctx = canvas.getContext("2d");
let camera = {x:0, y:0};
let megaphones = [];
let speedmult = 10;
let speed = {x:0, y:0};
let doneLoading = false;
let filesLoaded = 0;
let listener = null;
const soundMultiplier = 500000;

// user input stuff:
window.addEventListener("keydown", keyPressed, true);
window.addEventListener("keyup", keyReleased, true)

function keyReleased (e) {
  if ( e.keyCode == 87 || e.keyCode == 38) { //W or up arrow
    speed.y = 0;
  }

  if ( e.keyCode == 83 || e.keyCode == 40) { //S
    speed.y = 0;
  }

  if ( e.keyCode == 65 || e.keyCode == 37) { //A
    speed.x = 0;
  }

  if ( e.keyCode == 68 || e.keyCode == 39) { //D
    speed.x = 0;
  }
}


function keyPressed (e) {
  if ( e.keyCode == 87 || e.keyCode == 38) { //W or up arrow
    if (speed.y == 0) {
      speed.y = -1 * speedmult;
    }
  }

  if ( e.keyCode == 83 || e.keyCode == 40) { //S
    if (speed.y == 0) {
      speed.y = speedmult;
    }
  }

  if ( e.keyCode == 65 || e.keyCode == 37) { //A
    if (speed.x == 0) {
      speed.x = -1 * speedmult;
    }
  }

  if ( e.keyCode == 68 || e.keyCode == 39) { //D
    if (speed.x == 0) {
      speed.x = speedmult;
    }
  }
}

//mouse drag controls
let firstClicked = false;
let mouse = {oldx:0, oldy:0, x:0, y:0, dragging:false};

canvas.addEventListener('mousemove', function(e){
  var rect = canvas.getBoundingClientRect();
  scaleX = canvas.width / rect.width;
  scaleY = canvas.height / rect.height;
  mouse.x = (e.clientX - rect.left)*scaleX;
  mouse.y = (e.clientY - rect.top)*scaleY;
});

canvas.addEventListener('mousedown', function(e){
  mouse.oldx = mouse.x;
  mouse.oldy = mouse.y;
  camera.oldx = camera.x;
  camera.oldy = camera.y;
  mouse.dragging = true;
  if ((firstClicked == false) && (doneLoading == true)){
    firstClicked = true;
    OnFirstClick();
  }
});

canvas.addEventListener('mouseup', function(e){
  mouse.dragging = false;
});


// set up all the megaphones
let names = [
  "adelaidaantunezegurbide",
  "mollyirwinclark",
  "emmaclayton",
  "ziax",
  "lottejohnson",
  "frangibson",
  "anaiscomer",
  "rosairwinclark",
  "kitfalck",
  "nadiaberri",
  "poppycockburn",
  "jenibainbridge",
  "ninascott",
  "kitdenison",
  "agaujma",
  "debsgrayson",
  "mtanner",
  "jennymoore",
  "biancastephens",
  "asherfynn"
];

for (let j = 0; j < names.length; j++) { // assign random position to each megaphone
  let randx = Math.floor(( Math.random() - 0.5 ) * 7000);
  let randy = Math.floor(( Math.random() - 0.5 ) * 7000);
  let path = "singers/" + names[j] + ".wav";
  megaphones.push({x:randx, y:randy, url:path});
}

//create audio context
var audioContext;
try {
  // Fix up for prefixing
  window.AudioContext = window.AudioContext||window.webkitAudioContext;
  audioContext = new AudioContext();
}
catch(e) {
  alert('Web Audio API is not supported in this browser');
}

//display loading
ctx.font = "30px Helvetica";
ctx.fillStyle = "red";
ctx.textAlign = "center";
ctx.fillText("Loading! Headphones Recommended", canvas.width/2, canvas.height/2);
ctx.fillRect(0,(canvas.height - 30),200,30);


//load audioData
for (let i = 0; i < megaphones.length; i++) {   //for each megaphone
  console.log("loading number " + i);
  megaphones[i].request = new XMLHttpRequest();
  megaphones[i].request.open('GET', megaphones[i].url, true);
  megaphones[i].request.responseType = 'arraybuffer';

  // Decode asynchronously
  megaphones[i].request.onload = function() {
    audioContext.decodeAudioData(megaphones[i].request.response, function(buffer) {
      megaphones[i].buffer = buffer;

      filesLoaded ++;

      // draw progress bar
      ctx.fillRect(0,(canvas.height - 30),200 + ((canvas.width - 200) * (filesLoaded / megaphones.length)),30);

      // see if everything's loaded
      if (filesLoaded >= megaphones.length) {
        allLoaded();
      }
    });
  }
  megaphones[i].request.send();
}


function allLoaded () {
  // clear screen
  ctx.clearRect(0, 0, canvas.width, canvas.height); //clears screen
  //display click to start
  ctx.font = "30px Helvetica";
  ctx.fillStyle = "red";
  ctx.textAlign = "center";
  ctx.fillText("Click to Start", canvas.width/2, canvas.height/2);

  doneLoading = true;
}


function OnFirstClick () {

  // create the listener
  listener = audioContext.listener;
  listener.setPosition(0,0,-500);

  for (i = 0; i < megaphones.length; i++) {   //for each megaphone

    console.log("connecting and playing" + megaphones[i].url)
    //create the source
    megaphones[i].source = audioContext.createBufferSource();

    //set buffer to the megaphone buffer
    megaphones[i].source.buffer = megaphones[i].buffer

    // add the panner node
    megaphones[i].panner = audioContext.createPanner();

    megaphones[i].panner.panningModel = 'HRTF';
    megaphones[i].panner.distanceModel = 'inverse';
    megaphones[i].panner.refDistance = 200;
    megaphones[i].panner.maxDistance = 3000;
    megaphones[i].panner.rolloffFactor = 1;
    megaphones[i].panner.coneInnerAngle = 360;
    megaphones[i].panner.coneOuterAngle = 0;
    megaphones[i].panner.coneOuterGain = 0;
    megaphones[i].panner.setPosition(megaphones[i].x,megaphones[i].y,0);

    //connect it to the destination, play and loop
    megaphones[i].source.connect(megaphones[i].panner).connect(audioContext.destination);
    megaphones[i].source.start(0);
    megaphones[i].source.loop = true;
  }

  window.requestAnimationFrame(gameLoop); //trigger first loop
}

function gameLoop (timeStamp) {
  move ();
  setVolumes ();
  draw ();
  window.requestAnimationFrame(gameLoop);
}

function move () {
  if (mouse.dragging) {
    camera.x = camera.oldx - (mouse.x - mouse.oldx);
    camera.y = camera.oldy - (mouse.y - mouse.oldy);

  } else {
    camera.x += speed.x;
    camera.y += speed.y;
  }
}

function setVolumes () {
//  listener.positionX.value = camera.x;
//  listener.positionY.value = camera.y;
  listener.setPosition(camera.x,camera.y,-500);

}

//DRAWING EVERYTHING

function draw () {
  ctx.clearRect(0, 0, canvas.width, canvas.height); //clears screen
  drawMegaphones();
  //draw centre
//  ctx.fillStyle = "#ff00ff";
//  ctx.beginPath();
//  ctx.arc((canvas.width/2), (canvas.height/2), 10, 0, 2 * Math.PI);
//  ctx.fill();
}

function drawMegaphones() {
  for (i = 0; i < megaphones.length; i++) {
    ctx.fillStyle = "#ff0000";
    ctx.beginPath();
    ctx.arc(megaphones[i].x - camera.x + (canvas.width/2), megaphones[i].y - camera.y + (canvas.height/2), 25, 0, 2 * Math.PI);
    ctx.fill();
  }
}
