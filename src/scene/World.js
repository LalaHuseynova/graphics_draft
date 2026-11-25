/*
CSCI 2408 Computer Graphics Fall 2026
Team C2: Lala Huseynova, Khavar Jabbarli, Gunel Zeynalzada, Fikrat Rustamli

World.js - manages the ground and random sphere placement.

References:
- Rejection sampling: Shirley et al., Fundamentals of Computer Graphics.
- Sphere overlap test: Angel & Shreiner.
*/

// The centre is at y = radius so the sphere rests on the ground.
class WorldSphere {
    constructor(position, radius, color) {
        this.position = position;
        this.radius = radius;
        this.color = color;
    }

    // Firstly scale the unit sphere, then move it to its position (T * S)
    modelMatrix() {
        const p = this.position;
        return mult(translate(p[0], p[1], p[2]),
                    scalem(this.radius, this.radius, this.radius));
    }
}

class World {
    constructor() {
        this.spheres = [];

        // Sphere colours based on our team mock-up
        this.palette = [
            vec4(0.86, 0.58, 0.44, 1.0),  // orange
            vec4(0.61, 0.77, 0.86, 1.0),  // sky blue
            vec4(0.87, 0.75, 0.50, 1.0),  // yellow
            vec4(0.81, 0.56, 0.65, 1.0)   // pink
        ];

        // We match the ground colour with the bottom of the sky gradient.
        this.planeColor = vec4(0.58, 0.72, 0.45, 1.0);
    }

    static randomRange(min, max) {
        return min + Math.random() * (max - min);
    }

    // For placing spheres without overlapping, we use rejection sampling.
    placeSpheres(count, minR, maxR, areaR, gap, clearR, maxTries) {
        this.spheres = [];
        let tries = 0;

        while (this.spheres.length < count && tries < maxTries) {
            tries++;
            const r = World.randomRange(minR, maxR);

            // We subtract r to keep the whole sphere inside the placement area
            const maxDist = areaR - r;
            // We use sqrt() to avoid clustering near the centre
            const dist = maxDist * Math.sqrt(Math.random());
            const angle = Math.random() * 2 * Math.PI;
            const x = dist * Math.cos(angle);
            const z = dist * Math.sin(angle);
            const candidate = vec3(x, r, z);

            // Need to keep the player's starting area empty
            if (Math.hypot(x, z) < clearR + r) continue;

            // If the sphere is too close to another one, try another position
            if (this._overlapsAny(candidate, r, gap)) continue;

            // Cycling through the available colours
            const color = this.palette[this.spheres.length % this.palette.length];
            this.spheres.push(new WorldSphere(candidate, r, color));
        }

        if (this.spheres.length < count) {
            console.warn(`World: placed only ${this.spheres.length} of ${count} spheres ` +
                         `after ${maxTries} tries. Lower SPHERE_COUNT or SPHERE_MAX_R in config.js.`);
        }
        return this.spheres;
    }

    _overlapsAny(center, r, gap) {
        for (const other of this.spheres) {
            const d = length(subtract(center, other.position));
            // Compare the centre distance with both radii and the required gap.
            if (d < r + other.radius + gap) return true;
        }
        return false;
    }

    // countOverlaps checks for overlapping pairs after placement we should get 0.
    countOverlaps() {
        let overlaps = 0;
        for (let i = 0; i < this.spheres.length; i++) {
            for (let j = i + 1; j < this.spheres.length; j++) {
                const a = this.spheres[i], b = this.spheres[j];
                if (length(subtract(a.position, b.position)) < a.radius + b.radius) overlaps++;
            }
        }
        return overlaps;
    }
}
