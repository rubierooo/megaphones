//declarations
let canvas = document.getElementById("myCanvas");
let ctx = canvas.getContext("2d");
let camera = {x:0, y:0};
let megaphones = [];
let speedmult = 10;
let speed = {x:0, y:0};
let gainNode = [];
let source = [];
const soundMultiplier = 50000;

ctx.font = "30px Helvetica";
ctx.fillStyle = "red";
ctx.textAlign = "center";
ctx.fillText("Click to Start - Headphones Recommended", canvas.width/2, canvas.height/2);


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
    firstClicked = true;
    OnFirstClick();
  }
});

canvas.addEventListener('mouseup', function(e){
  mouse.dragging = false;
});

megaphones.push({x:600, y:50, url:'singers/adelaidaantunezegurbide.wav'});
megaphones.push({x:1200, y:-400, url:'singers/mollyirwinclark.wav'});
megaphones.push({x:-40, y:100, url:'singers/emmaclayton.wav'});


function OnFirstClick () {
  // audio context
  var audioContext;

  // create audio context
  try {
    // Fix up for prefixing
    window.AudioContext = window.AudioContext||window.webkitAudioContext;
    audioContext = new AudioContext();
  }
  catch(e) {
    alert('Web Audio API is not supported in this browser');
  }

  for (i = 0; i < megaphones.length; i++) {   //for each megaphone, make a gain node and load the sound n connect it all up

    console.log(megaphones[i].url)
    //create the source
    source[i] = audioContext.createBufferSource();

    // add the gain node
    gainNode[i] = audioContext.createGain();

    //connect it to the destination so you can hear it.
    source[i].connect(gainNode[i]).connect(audioContext.destination);

    var request = new XMLHttpRequest();
    //open the request
    request.open('GET', megaphones[i].url , true);
    //webaudio paramaters
    request.responseType = 'arraybuffer';
    //Once the request has completed... do this
    request.onload = function() {
        var audioData = request.response;
        console.log(audioData);
        audioContext.decodeAudioData(audioData, function(buffer) {
            /* --- play the sound AFTER the buffer loaded --- */
            //set the buffer to the response we just received.
            source[i].buffer = buffer;
            //start(0) should play asap.
            source[i].start(0);
            source[i].loop = true;
        }, function () { console.error('The request failed:' + megaphones[i].url); } );
    }
    //Now that the request has been defined, actually make the request. (send it)
    request.send();
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
  for (i = 0; i < megaphones.length; i++) {   //for each megaphone
    var distanceSquared = ((camera.x - megaphones[i].x)*(camera.x - megaphones[i].x)) + ((camera.y - megaphones[i].y)*(camera.y - megaphones[i].y));
    gainNode[i].gain.value = 1 /((distanceSquared/soundMultiplier) + 1);
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
    ctx.arc(megaphones[i].x - camera.x + (canvas.width/2), megaphones[i].y - camera.y + (canvas.height/2), 25, 0, 2 * Math.PI);
    ctx.fill();
  }
}
