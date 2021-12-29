const canvas = document.querySelector("canvas"); //selectionne la canvas dans la page html
canvas.width = window.innerWidth; //redefinit la tailel de la canvas
canvas.height = window.innerHeight;
const c = canvas.getContext("2d");

const center = { x: canvas.width / 2, y: canvas.height / 2, z: 0 };
var timeStep = 1; //si on veux accelerer la simulation
var score = 0;
let isScoreUpdatable = true;

class Player {
    constructor() {
        this.pos = center;
        this.color = "white";
        this.radius = 20;
        
        this.direction = 1.5 * Math.PI; //timePIzed
        this.magnitude = 0;
        this.vec = { x: 0, y: 0 };
        this.acceleration = { x: 0, y: 0 };
    }
    
    draw() {
        this.cornerCoordonates = [];
        //this.dimension.firstAngle = this.direction;
        
        this.cornerCoordonates[0] = { x: this.pos.x + this.radius * Math.cos(this.direction + 0.00 * Math.PI), y: this.pos.y + this.radius * Math.sin(this.direction + 0.00 * Math.PI) };
        this.cornerCoordonates[1] = { x: this.pos.x + this.radius * Math.cos(this.direction + 0.80 * Math.PI), y: this.pos.y + this.radius * Math.sin(this.direction + 0.80 * Math.PI) };
        this.cornerCoordonates[2] = { x: this.pos.x + this.radius * Math.cos(this.direction - 0.80 * Math.PI), y: this.pos.y + this.radius * Math.sin(this.direction - 0.80 * Math.PI) };
        
        c.beginPath();
        c.strokeStyle  = this.color;
        c.moveTo(this.cornerCoordonates[0].x, this.cornerCoordonates[0].y);
        c.lineTo(this.cornerCoordonates[1].x, this.cornerCoordonates[1].y);
        c.lineTo(this.cornerCoordonates[2].x, this.cornerCoordonates[2].y);
        c.lineTo(this.cornerCoordonates[0].x, this.cornerCoordonates[0].y);
        c.stroke();
    }
    
    convertPolarToXY() {
        this.vec.x = Math.cos(this.direction) * this.magnitude;
        this.vec.y = Math.sin(this.direction) * this.magnitude;
        
    }
    update(){
        this.vec.x += this.acceleration.x * timeStep; //multiplication par le pas de temps désiré
        
        //probablement parce que le triangle (conceptuel) utilisé pour calculer acos est inversé
        
        this.vec.y += this.acceleration.y * timeStep;
        
    }
    
    updatePos() { //modifie la position sur le canvas
        //this.convertPolarToXY();
        
        this.pos.x = this.pos.x + this.vec.x; //position initial + le décalage indiqué en x et en y
        this.pos.y = this.pos.y + this.vec.y;
    }
    
    teleporte() {
        if (this.pos.x > canvas.width) {
            this.pos.x = 0;
        } else if (this.pos.x < 0) {
            this.pos.x = canvas.width;
        }
        if (this.pos.y > canvas.height) {
            this.pos.y = 0;
        } else if (this.pos.y < 0) {
            this.pos.y = canvas.height;
        }
    }
}

class Laser {
    constructor(pos, dir){
        this.dir = dir;
        this.pos = pos;
        this.vec = {x:0,y:0};
        this.magnitude = 10;
    }
    
    
    draw(){
        c.beginPath();
        c.strokeStyle  = "white";
        c.moveTo(this.pos.x,this.pos.y);
        c.lineTo(this.pos.x + Math.cos(this.dir) * 30,this.pos.y+ Math.sin(this.dir) * 30);
        c.stroke();
    }
    convertPolarToXY() {
        this.vec.x = Math.cos(this.dir) * this.magnitude;
        this.vec.y = Math.sin(this.dir) * this.magnitude;
        
    }
    
    updatePos() { //modifie la position sur le canvas
        this.pos.x = this.pos.x + this.vec.x; //position initial + le décalage indiqué en x et en y
        this.pos.y = this.pos.y + this.vec.y;
    }

    outOfBound(){
        if(this.pos.x > canvas.width || this.pos.x < 0 || this.pos.y > canvas.height || this.pos.y < 0 ){  
            return true;
        }
        return false;
    }

}

class Asteroid {
    constructor(size, pos, dir){
        this.size = size;
        this.pos = pos;
        this.dir = dir;
        this.magnitude = 2/this.size;
        this.vec = {x:0,y:0};
        this.radius = 20;
    }
    convertPolarToXY() {
        this.vec.x = Math.cos(this.dir) * this.magnitude;
        this.vec.y = Math.sin(this.dir) * this.magnitude; 
    }

    updatePos() { //modifie la position sur le canvas
        this.pos.x = this.pos.x + this.vec.x; //position initial + le décalage indiqué en x et en y
        this.pos.y = this.pos.y + this.vec.y;
    }
    outOfBound(){
        if(this.pos.x > canvas.width + 50 || this.pos.x < 0-50 || this.pos.y > canvas.height + 50 || this.pos.y < 0 - 50 ){  
            return true;
        }
        return false;
    }

    draw(){
        c.beginPath();
        c.arc(this.pos.x, this.pos.y , this.size * this.radius, 0, Math.PI * 2, false);
        c.strokeStyle = "white";
        c.stroke();
    }

    laserified(laser){
        if (laser.pos.x < this.pos.x + this.size * this.radius && laser.pos.x > this.pos.x -  this.size * this.radius && laser.pos.y < this.pos.y + this.size * this.radius && laser.pos.y > this.pos.y -  this.size * this.radius){
            return true;
        }
        return false;
    }

    splitAsteroid(){
        return [new Asteroid(this.size-1,{...this.pos},this.dir + Math.PI / 3 ),new Asteroid(this.size-1,{...this.pos},this.dir - Math.PI / 3 )];
    }

    crash(player){
        if (player.pos.x < this.pos.x + this.size * this.radius && player.pos.x > this.pos.x -  this.size * this.radius && player.pos.y < this.pos.y + this.size * this.radius && player.pos.y > this.pos.y -  this.size * this.radius){
            return true;
        }
        return false;
    }
}



let lasers = [];
let asteroids = [];
let p1 = new Player();


function animate() {
    c.clearRect(0, 0, canvas.width, canvas.height); // raffraichisment de la canvas
    
    p1.updatePos();
    p1.teleporte();
    p1.draw();
    lasers.forEach(laser => { //on update chaque corps
        laser.updatePos();
        if(laser.outOfBound()){
            //console.log("remove laser")
            lasers.splice(lasers.findIndex(el => el === laser), 1);
        }
        laser.draw();
    });
    
    if(asteroids.length < 10){
        let wall = Math.floor(Math.random() * (4));

        let xx = 0;
        let yy = 0;
        let dirr = 0;

        switch (wall) {
            case 0: //gauche
                xx = -50;
                yddddy = Math.random() * canvas.height;
                dirr = Math.random() * (Math.PI) - Math.PI / 2;

                break;
            case 1: //haut
                xx = Math.random() * canvas.width;
                yy =  -50;
                dirr = Math.random() * (Math.PI);
                break;
            case 2: //droite
                xx = canvas.width + 50;
                yy = Math.random() * canvas.height;
                dirr = Math.random() * (Math.PI) + Math.PI/2;
                break;
            case 3: //bas
                xx = Math.random() * canvas.width;
                yy = canvas.height + 50;
                dirr = Math.random() * (Math.PI) - Math.PI;
                break;
            
            default:
                break;
        }

    let asteroid = new Asteroid(Math.floor(Math.random() * (4 - 1) + 1), {x:xx, y:yy }, dirr);
    asteroid.convertPolarToXY();
    asteroids.push(asteroid);
    };

    continu = true;
    asteroids.forEach(asteroid => {
        lasers.forEach(laser => {
            if(asteroid.laserified(laser)){
                console.log("boom");
                if(isScoreUpdatable){
                    score += Math.floor(10 / asteroid.size);
                }
                updateScore();
                lasers.splice(lasers.findIndex(el => el === laser), 1);
                let childs = asteroid.splitAsteroid();
                childs.forEach(child => {
                    if (child.size > 0){
                        child.convertPolarToXY();
                        asteroids.push(child);
                    }
                })

                asteroids.splice(asteroids.findIndex(el => el === asteroid), 1); //supression du parent
                continu = false;
            }
        });
        if (continu){
            if(p1){
                if (asteroid.crash(p1)){
                    gameOver();
                }else{
                    asteroid.updatePos();
                    if(asteroid.outOfBound()){
                        asteroids.splice(asteroids.findIndex(el => el === asteroid), 1);
                    }
                    asteroid.draw();
                }
            }
        }
    });
    
    
    setTimeout(function() {
        requestAnimationFrame(animate);
    }, 0000);
}
animate();


function updateScore(){
    document.getElementById("score").innerText = score;
}

function gameOver(){
    document.getElementById("gameOver").innerText = "GAME OVER";
    isScoreUpdatable =false;
}


//controls
window.addEventListener('keydown', (event) => {
    const keyName = event.key;  
    if (keyName === 'z') {
        p1.acceleration = {x: Math.cos(p1.direction) ,y:Math.sin(p1.direction)}
        p1.update();
    }
    if (keyName === 's') {
        let laser = new Laser({...p1.pos},p1.direction);
        laser.convertPolarToXY();
        lasers.push(laser);
    }
    if (keyName === 'd') {
        p1.direction += 0.1 * Math.PI;
    }
    if (keyName === 'q') {
        p1.direction -= 0.1 *Math.PI;
    }
});



