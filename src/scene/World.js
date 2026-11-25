/*
    CSCI 2408 Computer Graphics Fall 2026
    (c)2026 by Team C2 (Group 10): Lala Huseynova, Khavar Jabbarli, Gunel Zeynalzada, Fikrat Rustamli
    Submitted in partial fulfillment of the requirements of the course.

    World.js: what is in the scene, the ground plane and the list of spheres
    lying on it (Minimum Requirement 1).
    Owners: Member 1 (random placement), Member 4 (sphere list, used by
    CollisionSystem for B2).

    Placement uses REJECTION SAMPLING:
      1. pick a random radius and a random spot on the plane,
      2. if that sphere would intersect (or touch) one already placed, throw
         the candidate away and try again,
      3. otherwise keep it.
    Two spheres intersect when the distance between their centres is smaller
    than the sum of their radii:  |c1 - c2| < r1 + r2.

    Reference: rejection sampling, e.g. P. Shirley et al., Fundamentals of
    Computer Graphics, ch. 14 (sampling). Overlap test: standard
    sphere-sphere test, Angel & Shreiner.
    Generative AI: Claude (Claude Code), 25 Nov 2026, helped write this file.
    See README Developer Log, 25 November 2026.
*/

/**
 * One sphere lying on the ground. It touches the plane at one point, so its
 * centre is at height y = radius.
 */
class WorldSphere {
    /**
     * @param {vec3} position  centre of the sphere (m), position[1] === radius
     * @param {number} radius  radius (m)
     * @param {vec4} color     RGBA colour, each 0..1 (replaced by materials in A1)
     */
    constructor(position, radius, color) {
        this.position = position;
        this.radius = radius;
        this.color = color;
    }

    /**
     * Model matrix: scale the unit sphere mesh to this radius, then move it to
     * this position. MV.js mult(A, B) applies B first, so model = T * S.
     */
    modelMatrix() {
        const p = this.position;
        return mult(translate(p[0], p[1], p[2]),
                    scalem(this.radius, this.radius, this.radius));
    }
}

class World {
    constructor() {
        /** @type {WorldSphere[]} all spheres on the plane */
        this.spheres = [];

        // Soft colours for the spheres, alternating warm and cool like the
        // sketch in the assignment brief and our team mock-up.
        // Lighting and textures (A1, A3) replace them.
        this.palette = [
            vec4(0.86, 0.58, 0.44, 1.0),  // orange
            vec4(0.61, 0.77, 0.86, 1.0),  // sky blue
            vec4(0.87, 0.75, 0.50, 1.0),  // yellow
            vec4(0.81, 0.56, 0.65, 1.0)   // pink
        ];

        // Plane colour (soft grass green); replaced by a texture in A3.
        // The CSS sky gradient in katamari-C2.html ends in this same colour
        // (rgb 148, 184, 115) so the ground meets the horizon without a gap.
        this.planeColor = vec4(0.58, 0.72, 0.45, 1.0);
    }

    /** Random number in [min, max). */
    static randomRange(min, max) {
        return min + Math.random() * (max - min);
    }

    /**
     * Fills this.spheres with up to `count` random spheres that do not
     * intersect each other, using rejection sampling (see top of file).
     *
     * @param {number} count     how many spheres we want
     * @param {number} minR      smallest radius (m)
     * @param {number} maxR      largest radius (m)
     * @param {number} areaR     spheres stay fully inside a disc of this radius (m)
     * @param {number} gap       minimum free space between two surfaces (m)
     * @param {number} clearR    no sphere within this distance of the origin
     *                           (the player's start point) (m)
     * @param {number} maxTries  stop after this many candidates in total
     */
    placeSpheres(count, minR, maxR, areaR, gap, clearR, maxTries) {
        this.spheres = [];
        let tries = 0;

        while (this.spheres.length < count && tries < maxTries) {
            tries++;

            // 1. Random radius in [minR, maxR].
            const r = World.randomRange(minR, maxR);

            // Random point uniformly inside a disc of radius (areaR - r), so
            // the whole sphere stays inside areaR. sqrt() makes the points
            // spread evenly instead of bunching up near the centre.
            const maxDist = areaR - r;
            const dist = maxDist * Math.sqrt(Math.random());
            const angle = Math.random() * 2 * Math.PI;
            const x = dist * Math.cos(angle);
            const z = dist * Math.sin(angle);

            // Centre at height r: the sphere rests on the plane y = 0.
            const candidate = vec3(x, r, z);

            // 2a. Keep the player's start area empty.
            if (Math.hypot(x, z) < clearR + r) continue;

            // 2b. Reject if it would intersect or touch any placed sphere.
            if (this._overlapsAny(candidate, r, gap)) continue;

            // 3. Accept it.
            const color = this.palette[this.spheres.length % this.palette.length];
            this.spheres.push(new WorldSphere(candidate, r, color));
        }

        if (this.spheres.length < count) {
            console.warn(`World: placed only ${this.spheres.length} of ${count} spheres ` +
                         `after ${maxTries} tries. Lower SPHERE_COUNT or SPHERE_MAX_R in config.js.`);
        }
        return this.spheres;
    }

    /**
     * True if a sphere at `center` with radius `r` would come closer than
     * `gap` to any sphere already in the world.
     */
    _overlapsAny(center, r, gap) {
        for (const other of this.spheres) {
            // length() and subtract() are from MV.js.
            const d = length(subtract(center, other.position));
            if (d < r + other.radius + gap) return true;
        }
        return false;
    }

    /**
     * Self-check used after placement: returns the number of intersecting
     * pairs (should always be 0). Prints the result in the console.
     */
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
