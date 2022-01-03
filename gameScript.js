const canvas = document.querySelector("canvas"); //selectionne la canvas dans la page html
canvas.width = window.innerWidth; //redefinit la tailel de la canvas
canvas.height = window.innerHeight;
const c = canvas.getContext("2d");

const CENTER = { x: canvas.width / 2, y: canvas.height / 2, z: 0 };
var timeStep = 1; // if you want to speed up the simulation
var score = 0; // modify your score with this varaible
let isScoreUpdatable = true; // turn false when the game is over


const MARGIN_PIXEL_OF_CANVAS = 100;
const NUMBER_OF_EDGE_ON_A_SCREEN = 4;
const SPACESHIP_ROTATION_ANGLE_FACTOR = 0.1;
const DELAY_BETWEEN_FRAME_UPDATE = 0;
const OUT_OF_BOUND_MAX = 50;
const ASTEROID_STARTING_MARGIN = 50;
const ASTEROID_ANGLE_OF_CHILD_AFTER_SPLIT = 3;
const ASTEROID_DEFAULT_RADIUS = 20;
const ASTEROID_DEFAULT_MAGNITUDE_FACTOR = 5;
const LASER_LENGTH = 30;
const LASER_DEFAULT_MAGNITUDE = 10;
const PLAYER_OOB_TELEPORT_BORDER_MARGIN_WHEN_OUT = 0;
const PLAYER_OOB_TELEPORT_BORDER_MARGIN_WHEN_IN = 0;
const PLAYER_TRIANGLE_EDGE_ANGLE = 0.80;
const PLAYER_DEFAULT_RADIUS = 20;
const PLAYER_DEFAULT_DIRECTION_TIME_PI = 1.5;
const PLAYER_DEFAULT_MAGNITUDE = 0;
const DEFAULT_COLOR = "white";
const NUMBER_OF_ASTEROID_AT_THE_SAME_TIME = 30;

class Player {
    constructor() {
        this.pos = CENTER;
        this.color = DEFAULT_COLOR;
        this.radius = PLAYER_DEFAULT_RADIUS;
        
        this.direction = PLAYER_DEFAULT_DIRECTION_TIME_PI * Math.PI; //timePIzed
        this.magnitude = PLAYER_DEFAULT_MAGNITUDE;
        this.vec = { x: 0, y: 0 };
        this.acceleration = { x: 0, y: 0 };
    }
    
    draw() {
        let cornerCoordonates = [];
        
        cornerCoordonates[0] = { x: this.pos.x + this.radius * Math.cos(this.direction + 0.00 * Math.PI), y: this.pos.y + this.radius * Math.sin(this.direction + 0.00 * Math.PI) };
        cornerCoordonates[1] = { x: this.pos.x + this.radius * Math.cos(this.direction + PLAYER_TRIANGLE_EDGE_ANGLE * Math.PI), y: this.pos.y + this.radius * Math.sin(this.direction + PLAYER_TRIANGLE_EDGE_ANGLE * Math.PI) };
        cornerCoordonates[2] = { x: this.pos.x + this.radius * Math.cos(this.direction - PLAYER_TRIANGLE_EDGE_ANGLE * Math.PI), y: this.pos.y + this.radius * Math.sin(this.direction - PLAYER_TRIANGLE_EDGE_ANGLE * Math.PI) };
        
        c.beginPath();
        c.strokeStyle  = this.color;
        c.moveTo(cornerCoordonates[0].x, cornerCoordonates[0].y);
        c.lineTo(cornerCoordonates[1].x, cornerCoordonates[1].y);
        c.lineTo(cornerCoordonates[2].x, cornerCoordonates[2].y);
        c.lineTo(cornerCoordonates[0].x, cornerCoordonates[0].y);
        c.stroke();
    }
    
    
    convertPolarToXY() {
        this.vec.x = Math.cos(this.direction) * this.magnitude;
        this.vec.y = Math.sin(this.direction) * this.magnitude;
        
    }
    update(){
        this.vec.x += this.acceleration.x * timeStep; //multiply by the timeStep to speed up or slow the simulation.
        this.vec.y += this.acceleration.y * timeStep;
    }
    
    updatePos() { //modify the position on the canvas
        this.pos.x = this.pos.x + this.vec.x; // initial position + modidificatino in x and y
        this.pos.y = this.pos.y + this.vec.y; 
    }
    
    teleporte() { // when the player hit a edge of the screen, it teleporte to the other edge.
        if (this.pos.x > canvas.width + PLAYER_OOB_TELEPORT_BORDER_MARGIN_WHEN_OUT) { //the constant OUT indicate if the player is teleported after (+) passing the edge or before (-)
            this.pos.x = 0 - PLAYER_OOB_TELEPORT_BORDER_MARGIN_WHEN_IN; //the constant IN indicate where the player will be teleported (outside or inside the canvas)
        } else if (this.pos.x < 0 - PLAYER_OOB_TELEPORT_BORDER_MARGIN_WHEN_OUT) {
            this.pos.x = canvas.width + PLAYER_OOB_TELEPORT_BORDER_MARGIN_WHEN_IN;
        }
        if (this.pos.y > canvas.height + PLAYER_OOB_TELEPORT_BORDER_MARGIN_WHEN_OUT) {
            this.pos.y = 0 - PLAYER_OOB_TELEPORT_BORDER_MARGIN_WHEN_IN;
        } else if (this.pos.y < 0 + PLAYER_OOB_TELEPORT_BORDER_MARGIN_WHEN_OUT) {
            this.pos.y = canvas.height + PLAYER_OOB_TELEPORT_BORDER_MARGIN_WHEN_IN;
        }
    }
}//end of Player


class Laser {
    constructor(pos, dir){
        this.dir = dir;
        this.pos = pos;
        this.vec = {x:0,y:0};
        this.magnitude = LASER_DEFAULT_MAGNITUDE;
        
        this.convertPolarToXY();
    }
    
    draw(){
        c.beginPath();
        c.strokeStyle  = DEFAULT_COLOR;
        c.moveTo(this.pos.x,this.pos.y);
        c.lineTo(this.pos.x + Math.cos(this.dir) * LASER_LENGTH,this.pos.y+ Math.sin(this.dir) * LASER_LENGTH);
        c.stroke();
    }
    
    convertPolarToXY() {
        this.vec.x = Math.cos(this.dir) * this.magnitude;
        this.vec.y = Math.sin(this.dir) * this.magnitude;
    }
    
    updatePos() { 
        this.pos.x = this.pos.x + this.vec.x;
        this.pos.y = this.pos.y + this.vec.y;
    }
    
    outOfBound(){ // check if the laser is outside the canvas and must be erased or not
        if(this.pos.x > canvas.width || this.pos.x < 0 || this.pos.y > canvas.height || this.pos.y < 0 ){  
            return true;
        }
        return false;
    }
    
}//end Laser




class Asteroid {
    constructor(size, pos, dir){
        this.size = size;
        this.pos = pos;
        this.dir = dir;
        this.magnitude = ASTEROID_DEFAULT_MAGNITUDE_FACTOR/this.size;
        this.vec = {x:0,y:0};
        this.radius = ASTEROID_DEFAULT_RADIUS;
        
        this.convertPolarToXY();
    }
    
    draw(){
        c.beginPath();
        c.arc(this.pos.x, this.pos.y , this.size * this.radius, 0, Math.PI * 2, false);
        c.strokeStyle = DEFAULT_COLOR;
        c.stroke();
    }
    
    convertPolarToXY() {
        this.vec.x = Math.cos(this.dir) * this.magnitude;
        this.vec.y = Math.sin(this.dir) * this.magnitude; 
    }
    
    updatePos() {
        this.pos.x = this.pos.x + this.vec.x; 
        this.pos.y = this.pos.y + this.vec.y;
    }
    
    outOfBound(){ // check if the asteroid is outside the canvas, to be delete
        if(this.pos.x > canvas.width + OUT_OF_BOUND_MAX || this.pos.x < -OUT_OF_BOUND_MAX || this.pos.y > canvas.height + OUT_OF_BOUND_MAX || this.pos.y <  - OUT_OF_BOUND_MAX ){  
            return true;
        }
        return false;
    }
    
    laserified(laser){ // check if a laser hit the asteroid.
        if (laser.pos.x < this.pos.x + this.size * this.radius && laser.pos.x > this.pos.x -  this.size * this.radius && laser.pos.y < this.pos.y + this.size * this.radius && laser.pos.y > this.pos.y -  this.size * this.radius){
            return true;
        }
        return false;
    }
    
    splitAsteroid(){ // return 2 new smaller asteroids.
        return [new Asteroid(this.size-1,{...this.pos},this.dir + Math.PI / ASTEROID_ANGLE_OF_CHILD_AFTER_SPLIT ),new Asteroid(this.size-1,{...this.pos},this.dir - Math.PI / ASTEROID_ANGLE_OF_CHILD_AFTER_SPLIT )];
    }
    
    crash(player){ // check if the player hit the asteroid
        if (player.pos.x < this.pos.x + this.size * this.radius && player.pos.x > this.pos.x -  this.size * this.radius && player.pos.y < this.pos.y + this.size * this.radius && player.pos.y > this.pos.y -  this.size * this.radius){
            return true;
        }
        return false;
    }
}


// Elements of the games displayed on the canvas
let player = new Player();
let lasers = []; 
let asteroids = []; 


function animate() {
    c.clearRect(-MARGIN_PIXEL_OF_CANVAS, -MARGIN_PIXEL_OF_CANVAS, canvas.width + MARGIN_PIXEL_OF_CANVAS, canvas.height + MARGIN_PIXEL_OF_CANVAS); // cleaning of the canvas between each frame
    
    player.updatePos();
    player.teleporte();
    player.draw();
    
    lasers.forEach(laser => {
        laser.updatePos();
        if(laser.outOfBound()){ //check if the current laser must be remove
            lasers.splice(lasers.findIndex(el => el === laser), 1); //remove element in array with same object properties
        }else{
            laser.draw();
        }
    });
    
    //creation of new asteroids if needed
    if(asteroids.length < NUMBER_OF_ASTEROID_AT_THE_SAME_TIME){
        
        let xx = 0; //default values
        let yy = 0;
        let dirr = 0;
        
        switch (Math.floor(Math.random() * (NUMBER_OF_EDGE_ON_A_SCREEN))) { //select between 4 possibility. One for each edge of the screen
            case 0: //left
            xx = -ASTEROID_STARTING_MARGIN;
            yy = Math.random() * canvas.height;
            dirr = Math.random() * (Math.PI) - Math.PI / 2;
            break;
            case 1: //top
            xx = Math.random() * canvas.width;
            yy =  -ASTEROID_STARTING_MARGIN;
            dirr = Math.random() * (Math.PI);
            break;
            case 2: //right
            xx = canvas.width + ASTEROID_STARTING_MARGIN;
            yy = Math.random() * canvas.height;
            dirr = Math.random() * (Math.PI) + Math.PI/2;
            break;
            case 3: //bottom
            xx = Math.random() * canvas.width;
            yy = canvas.height + ASTEROID_STARTING_MARGIN;
            dirr = Math.random() * (Math.PI) - Math.PI;
            break;
            
            default:
            console.log("ERROR : must be only 4 edges on the screen");
            break;
        }
        
        let asteroid = new Asteroid(Math.floor(Math.random() * (NUMBER_OF_EDGE_ON_A_SCREEN - 1) + 1), {x:xx, y:yy }, dirr);
        asteroids.push(asteroid);
    };
    
    asteroids.forEach(asteroid => {
        if (player){
            if (asteroid.crash(player)){ //player hit asteroid
                gameOver();
            }  
        }
        
        
        lasers.forEach(laser => {
            if(asteroid.laserified(laser)){ // laser hit asteroid
                
                if(isScoreUpdatable){
                    score += Math.floor(10 / asteroid.size);
                }
                updateScore();
                
                lasers.splice(lasers.findIndex(el => el === laser), 1); // a laser is removed after it hit an asteroid
                
                let childs = asteroid.splitAsteroid(); //the asteroid is split into two.
                childs.forEach(child => {
                    if (child.size > 0){
                        asteroids.push(child);
                    }
                })
                
                asteroids.splice(asteroids.findIndex(el => el === asteroid), 1); //delete of parent asteroid
                return; //skip iteration to the next because the current/parent asteroid no longer exist
            }
        });
        
        
        asteroid.updatePos();
        if(asteroid.outOfBound()){
            asteroids.splice(asteroids.findIndex(el => el === asteroid), 1);
        }else{
            asteroid.draw();
        }
        
    });
    
    
    setTimeout(function() {
        requestAnimationFrame(animate);
    }, DELAY_BETWEEN_FRAME_UPDATE);
}
animate();


function updateScore(){
    document.getElementById("score").innerText = score;
}

function gameOver(){
    document.getElementById("gameOver").innerText = "GAME OVER";
    document.getElementById("replay").innerText = "new game";
    isScoreUpdatable = false;
}
document.getElementById("replay").addEventListener("click", () => {
    location.reload();
})


//controls with keyboard
window.addEventListener('keydown', (event) => {
    const keyName = event.key;  
    if (keyName === 'z') {
        player.acceleration = {x: Math.cos(player.direction) ,y:Math.sin(player.direction)}
        player.update();
    }
    if (keyName === 's') {
        let laser = new Laser({...player.pos},player.direction);
        lasers.push(laser);
    }
    if (keyName === 'd') {
        player.direction += SPACESHIP_ROTATION_ANGLE_FACTOR * Math.PI;
    }
    if (keyName === 'q') {
        player.direction -= SPACESHIP_ROTATION_ANGLE_FACTOR *Math.PI;
    }
});

// controls with mouse
window.onwheel = (event) => {
    if (event.deltaY > 0){
        player.direction += SPACESHIP_ROTATION_ANGLE_FACTOR * 2*Math.PI;
    }else{
        player.direction -= SPACESHIP_ROTATION_ANGLE_FACTOR *2* Math.PI;
    }
}

window.addEventListener('contextmenu', function(event) {
    event.preventDefault();
    let laser = new Laser({...player.pos},player.direction);
        lasers.push(laser);
    return false;
}, false);

window.addEventListener('click', function(event) {
    event.preventDefault();
    player.acceleration = {x: Math.cos(player.direction) ,y:Math.sin(player.direction)}
    player.update();
    return false;
}, false);