let home, food;
const ants = [];
const antsNumber = 300;

const homeMap = new Map();
const foodMap = new Map();

const homePheromonesMaxForce = 40;
const foodPheromonesMaxForce = 40;

const freshRate = 10;

const showFoodPheromones = false;
const showHomePheromones = false;

let img;
function preload() {
    img = loadImage("../world-states.png");
    //   img = loadImage('../assets/labirynt.png');
}

function setup() {
    createCanvas(img.width, img.height);
    // createCanvas(1000, 500);

    image(img, 0, 0);
    loadPixels();
    home = new Place(50, 50, `rgb(0, 0, 255)`, "home");
    food = new Place(200, 50, `rgb(0, 255, 0)`, "food");

    for (let i = 0; i < antsNumber; i++)
        ants[i] = new Ant(i, home.position.x, home.position.y, 0, 2, 130, 1.5);

    frameRate(120);
}

function getPixelsGrayScale(position) {
    const x = parseInt(position.x);
    const y = parseInt(position.y);
    const d = pixelDensity();

    for (let i = 0; i < d; i++) {
        for (let j = 0; j < d; j++) {
            const index = 4 * ((y * d + j) * width * d + (x * d + i));
            return (pixels[index] + pixels[index + 1] + pixels[index + 2]) / 3;
        }
    }
}

function mouseClicked() {
    console.log(`${mouseX}, ${mouseY}`);

    if (keyCode == CONTROL) {
        food.position.x = mouseX;
        food.position.y = mouseY;
        foodMap.clear();
        for (const ant of ants) ant.foodPheromonesForce = 0;
    } else if (keyCode == SHIFT) {
        home.position.x = mouseX;
        home.position.y = mouseY;
        homeMap.clear();
        ants.length = 0;
        for (let i = 0; i < antsNumber; i++)
            ants[i] = new Ant(
                i,
                home.position.x,
                home.position.y,
                0,
                2,
                0,
                1.5
            );

        for (const ant of ants) ant.homePheromonesForce = 0;
    }
}

function draw() {
    background(img);
    fill(0);
    stroke(0);
    text("FPS: " + frameRate().toFixed(2), 10, height - 10);

    home.draw();
    food.draw();
    for (const [key, pheromone] of homeMap) {
        if (showHomePheromones) pheromone.draw();
        pheromone.updateForce();
        if (pheromone.force < 0) {
            homeMap.delete(pheromone.mapKey);
        }
    }
    for (const [key, pheromone] of foodMap) {
        if (showFoodPheromones) pheromone.draw();
        pheromone.updateForce();
        if (pheromone.force < 0) {
            foodMap.delete(pheromone.mapKey);
        }
    }

    for (const ant of ants) {
        ant.draw();
        ant.move();
        if (ant.isInTheBorders(food)) {
            ant.foodPheromonesForce = foodPheromonesMaxForce;
            if (!ant.hasFood) ant.grabFood();
        }
        if (ant.isInTheBorders(home)) {
            ant.homePheromonesForce = homePheromonesMaxForce;
            if (ant.hasFood) ant.leaveFood();
        }

        if (ant.homePheromonesForce > 0 && frameCount % freshRate == 0) {
            const positionString = ant.generateMapKey(ant.position);
            if (
                !homeMap.has(positionString) ||
                homeMap.get(positionString).force < ant.homePheromonesForce
            )
                homeMap.set(positionString, ant.placePheromone("home"));
        }

        if (ant.foodPheromonesForce > 0 && frameCount % freshRate == 0) {
            const positionString = ant.generateMapKey(ant.position);
            if (
                !foodMap.has(positionString) ||
                foodMap.get(positionString).force < ant.foodPheromonesForce
            )
                foodMap.set(positionString, ant.placePheromone("food"));
        }

        if (
            ant.hasFood &&
            Math.floor(ant.id / (antsNumber / freshRate)) ==
                frameCount % freshRate
        )
            ant.searchForPheromones("home", home);
        if (
            !ant.hasFood &&
            Math.floor(ant.id / (antsNumber / freshRate)) ==
                frameCount % freshRate
        )
            ant.searchForPheromones("food", food);
    }
}
