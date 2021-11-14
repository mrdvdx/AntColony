class Place {
    constructor(x, y, color, type) {
        this.position = createVector(x, y);
        this.color = color;
        this.width = 10;
        this.type = type;
    }

    draw() {
        noStroke();
        fill(this.color);
        rect(
            this.position.x - this.width / 2,
            this.position.y - this.width / 2,
            this.width
        );
    }
}
