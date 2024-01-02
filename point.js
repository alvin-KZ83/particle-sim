class Point {
    /**
     * Constructs a simple point that gets added to the DLList
     * @param {*} pos PVector variable denoting position 
     * @param {*} p_mass float variable that determines the mass
     * @param {*} growth_f Pvector growth direction with magnitude
     */
    constructor(pos, p_mass, growth_f) {
        this.show = false;
        this.prev = null; //pointer to prev
        this.next = null; //pointer to next
        //point properties
        this.mass = p_mass;
        this.growth = growth_f;
        this.pos = pos;
        this.vel = createVector(0.0, 0.0);
        this.acc = createVector(0.0, 0.0);
        this.quad_prefix = "";
        //age, starts at 1 and keeps decreasing based on random
        this.age = 1.0
    }

    /**
     * Draws the point as a circle
     */
    display() {
        strokeWeight(2)
        if (this.show) {
            stroke(255,0,0)
            circle(this.pos.x, this.pos.y, this.mass)
        } else {
            stroke(255)
            circle(this.pos.x, this.pos.y, this.mass)
        }
    }

    grow() {
        this.applyForce(this.growth);
    }

    attract(point) {
        let force = p5.Vector.sub(point.pos, this.pos);
        let distance = force.mag();

        // If the distance is very small or zero, we skip the attraction to avoid extreme forces
        if (distance < 10) return;

        // Attraction force decreases as they get closer to each other
        let attractionStrength = map(distance, 0, 10, 0, speed);
        force.normalize();
        force.mult(attractionStrength);

        this.applyForce(force);
    }

    repel(point) {
        let force = p5.Vector.sub(this.pos, point.pos);
        let distance = force.mag();
        
        // If the distance is very small or zero, we skip the repulsion to avoid extreme forces
        if (distance > 10) return;
    
        // Repulsion force decreases as they get further away from each other
        force.div(distance * distance);
        force.limit(speed);  // Limit the magnitude of repulsion force
        
        this.applyForce(force);
    }

    update(flow) {
        if (frameCount % (decay * 60) == 0) {
            this.age -= (age_factor * noise(this.pos.x, this.pos.decay));
            this.age = Math.max(0.0, this.age);
        }
        this.grow();
        this.applyForce(flow.get_flow(this.pos.x, this.pos.y));
        // this.vel.add(this.acc);
        // this.pos.add(this.vel);
        // this.acc.mult(0.0);
    }

    reset_p() {
        this.growth.mult(0.0);
    }

    /**
     * 
     * @param {*} force PVector parameter that gives the dir and mag of the force
     */
    applyForce(force) {
        this.acc.add(force);
    }
}