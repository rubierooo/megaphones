//declarations
let canvas = document.getElementById("myCanvas");
let ctx = canvas.getContext("2d");
let camera = {x:0, y:0};
let megaphones = [];
let speedmult = 10;
let speed = {x:0, y:0};





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
  if (firstClicked == false){
    firstClicked == true;
    OnFirstClick();
  }
});

canvas.addEventListener('mouseup', function(e){
  mouse.dragging = false;
});

megaphones.push({x:600, y:50});
megaphones.push({x:1200, y:-400});
megaphones.push({x:-40, y:100});


var url  = 'singers/adelaidaantunezegurbide.wav';


function OnFirstClick () {
  // audio context "actx"
  var audioContext;

  // create audio context "actx"
  try {
    // Fix up for prefixing
    window.AudioContext = window.AudioContext||window.webkitAudioContext;
    audioContext = new AudioContext();
  }
  catch(e) {
    alert('Web Audio API is not supported in this browser');
  }

  var source = audioContext.createBufferSource();
  //connect it to the destination so you can hear it.
  source.connect(audioContext.destination);

  var request = new XMLHttpRequest();
  //open the request
  request.open('GET', url, true);
  //webaudio paramaters
  request.responseType = 'arraybuffer';
  //Once the request has completed... do this
  request.onload = function() {
      audioContext.decodeAudioData(request.response, function(response) {
          /* --- play the sound AFTER the buffer loaded --- */
          //set the buffer to the response we just received.
          source.buffer = response;
          //start(0) should play asap.
          source.start(0);
          source.loop = true;
      }, function () { console.error('The request failed.'); } );
  }
  //Now that the request has been defined, actually make the request. (send it)
  request.send();

  window.requestAnimationFrame(gameLoop); //trigger first loop
}

function gameLoop (timeStamp) {
  move ();
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

//DRAWING EVERYTHING

function draw () {
  ctx.clearRect(0, 0, canvas.width, canvas.height); //clears screen
  drawMegaphones();
  //draw centre
  ctx.fillStyle = "#ff00ff";
  ctx.beginPath();
  ctx.arc((canvas.width/2), (canvas.height/2), 10, 0, 2 * Math.PI);
  ctx.fill();
}

function drawMegaphones() {
  for (i = 0; i < megaphones.length; i++) {
    ctx.fillStyle = "#ff0000";
    ctx.beginPath();
    ctx.arc(megaphones[i].x - camera.x + (canvas.width/2), megaphones[i].y - camera.y + (canvas.height/2), 50, 0, 2 * Math.PI);
    ctx.fill();
  }
}
