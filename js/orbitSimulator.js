const canvas = document.getElementById("orbit-canvas");
const ctx = canvas.getContext("2d");

canvas.width = 900;
canvas.height = 600;

const centerX = canvas.width / 2;
const centerY = canvas.height / 2;

const planets = [

{ name:"Mercury", radius:80, speed:0.02, size:3 },
{ name:"Venus", radius:120, speed:0.015, size:5 },
{ name:"Earth", radius:170, speed:0.01, size:6 },
{ name:"Mars", radius:220, speed:0.008, size:5 }

];

let angle = 0;

function draw(){

ctx.clearRect(0,0,canvas.width,canvas.height);

ctx.fillStyle="yellow";
ctx.beginPath();
ctx.arc(centerX,centerY,15,0,Math.PI*2);
ctx.fill();

planets.forEach(planet=>{

let x=centerX + Math.cos(angle*planet.speed)*planet.radius;
let y=centerY + Math.sin(angle*planet.speed)*planet.radius;

ctx.strokeStyle="#444";

ctx.beginPath();
ctx.arc(centerX,centerY,planet.radius,0,Math.PI*2);
ctx.stroke();

ctx.fillStyle="#4da3ff";

ctx.beginPath();
ctx.arc(x,y,planet.size,0,Math.PI*2);
ctx.fill();

});

angle++;

requestAnimationFrame(draw);

}

draw();