class Pheromone{
    constructor(x, y, type, force, frame){
        this.position = createVector(x, y);
        this.type = type;
        this.force = force;
        this.mappedForce;
        this.color;
        this.mapKey = this.generateMapKey();

        this.frame = frame;
        this.maxLife = 600;
    }

    draw(){
        this.mapForce();
        noStroke();
        fill(this.color);
        circle(this.position.x, this.position.y, 5);
    }

    updateForce(){
        const age = frameCount - this.frame;
        if(age > this.maxLife){
            this.force -= 0.1;
        }
    }

    mapForce(){
        this.mappedForce = map(this.force, 0, homePheromonesMaxForce, 0, 0.4)
        this.color = this.type == 'food' ? `rgba(0, 255, 0, ${this.mappedForce})` : `rgba(0, 0, 255, ${this.mappedForce})`;
    }

    generateMapKey(){
        return `${parseInt(this.position.x)}-${parseInt(this.position.y)}`;
    }
}