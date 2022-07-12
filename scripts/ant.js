class Ant {
    constructor(id, x, y, color, radius, direction, speed) {
        this.id = id;
        this.position = createVector(x, y);
        this.color = color;
        this.radius = radius;

        this.movingOffset = 10;

        this.pheromoneDistance = 30;
        this.pheromoneAngle = 180;

        this.searchDistance = 5;
        this.searchAngle = 30;

        this.hasFood = false;

        this.direction = direction || 0;
        this.speed = speed || 1;

        this.homePheromonesForce = 0;
        this.foodPheromonesForce = 0;
    }

    draw() {
        noStroke();
        fill(this.color);
        circle(this.position.x, this.position.y, this.radius);
    }

    move() {
        this.direction += random(-this.movingOffset, this.movingOffset);
        this.position.add(p5.Vector.fromAngle(radians(this.direction), this.speed));
        this.hitBorder();
        this.checkCountriesBorders();
    }

    grabFood() {
        this.color = "rgb(0, 255, 0)";
        this.hasFood = true;
        this.homePheromonesForce = 0;
        this.direction += 180;
    }

    leaveFood() {
        this.color = 0;
        this.hasFood = false;
        this.foodPheromonesForce = 0;
        this.direction += 180;
    }

    hitBorder() {
        if (this.hitHorizontalBorder()) this.direction = 90 - (180 - 90 - (0 - this.direction));

        if (this.hitVerticalBorder()) this.direction = 90 - (180 - 90 - (180 - this.direction));
    }

    hitHorizontalBorder() {
        return this.position.y <= 0 + this.radius / 2 || this.position.y >= height - this.radius / 2;
    }

    hitVerticalBorder() {
        return this.position.x >= width - this.radius / 2 || this.position.x <= 0 + this.radius / 2;
    }

    isInTheBorders(area) {
        return (
            this.position.x > area.position.x - area.width / 2 &&
            this.position.x < area.position.x + area.width / 2 &&
            this.position.y > area.position.y - area.width / 2 &&
            this.position.y < area.position.y + area.width / 2
        );
    }

    checkCountriesBorders() {
        let checkingPixel;
        let left = 0,
            right = 0;
        for (let i = -(this.searchAngle / 2); i < this.searchAngle / 2; i++) {
            const direction = this.direction + i;

            checkingPixel = this.position.copy().add(p5.Vector.fromAngle(radians(direction), this.searchDistance));
            if (getPixelsGrayScale(checkingPixel) < 250) {
                if (i > 0) right++;
                else left++;
            }
        }

        if (right != 0 || left != 0) {
            if (right > left) this.direction -= 25;
            if (right <= left) this.direction += 25;
        }

        checkingPixel = this.position.copy().add(p5.Vector.fromAngle(radians(this.direction), this.speed));
        if (getPixelsGrayScale(checkingPixel) < 250) {
            this.direction += 180;
        }
    }

    generateMapKey(position) {
        return `${parseInt(position.x)}-${parseInt(position.y)}`;
    }

    placePheromone(type) {
        const force = type == "home" ? this.homePheromonesForce : this.foodPheromonesForce;
        if (type == "home") {
            this.homePheromonesForce -= 0.025 * freshRate;
        } else if (type == "food") {
            this.foodPheromonesForce -= 0.025 * freshRate;
        }
        return new Pheromone(parseInt(this.position.x), parseInt(this.position.y), type, force, frameCount, this.id);
    }

    searchForPheromones(type, base, angle = this.pheromoneAngle, maxDistance = this.pheromoneDistance) {
        const foundPheromones = new Set();
        for (let i = 0; i < angle; i += 3) {
            for (let distance = 5; distance < maxDistance; distance += 3) {
                const direction = this.direction - angle / 2 + i;
                const searchingPosition = this.position.copy().add(p5.Vector.fromAngle(radians(direction), distance));
                const positionString = this.generateMapKey(searchingPosition);
                const pheromonesAnt = type == "home" ? homeMap.get(positionString) : foodMap.get(positionString);

                // stroke(255, 0 ,0)
                // strokeWeight(2)
                // line(this.position.x, this.position.y, searchingPosition.x, searchingPosition.y);

                if (base.position.dist(this.position) < 50)
                    foundPheromones.add({ force: foodPheromonesMaxForce + 10, position: base.position });
                else if (pheromonesAnt) foundPheromones.add(pheromonesAnt);
            }
        }

        if (foundPheromones.size > 0) {
            let bestPheromone = { force: 0 };
            for (const pheromone of foundPheromones) {
                if (bestPheromone.force < pheromone.force) {
                    bestPheromone = this.checkRouteBetweenThisAndPheromone(pheromone)
                        ? this.checkRouteBetweenThisAndPheromone(pheromone)
                        : bestPheromone;
                }
            }

            if (bestPheromone.force > 0) {
                const heading = this.getHeading(bestPheromone.position);

                this.direction = heading;
                // stroke(255, 0 ,0)
                // strokeWeight(2)
                // line(this.position.x, this.position.y, bestPheromone.position.x, bestPheromone.position.y);
            } else this.checkCountriesBorders();
        }
    }

    getHeading(position) {
        const x = position.x - this.position.x;
        const y = position.y - this.position.y;
        return degrees(createVector(x, y).heading());
    }

    checkRouteBetweenThisAndPheromone(pheromone) {
        const distance = parseInt(createVector(pheromone.position.x, pheromone.position.y).dist(this.position));
        let counter = 0;
        for (let j = 0; j < distance; j++) {
            const heading = this.getHeading(pheromone.position);
            const checkingPixel = this.position.copy().add(p5.Vector.fromAngle(radians(heading), j));
            const pixelsColor = getPixelsGrayScale(checkingPixel);
            if (pixelsColor > 220) counter++;
        }

        if (counter == distance) return pheromone;
    }
}
