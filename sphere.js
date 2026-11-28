/*
    CSCI 2408 Computer Graphics Fall 2026
    (c)2026 by Lala Huseynova, Khavar Jabbarli, Gunel Zeynalzada, Fikrat Rustamli (team C2)
    Submitted in partial fulfillment of the requirements of the course.
*/

"use strict";

// Sphere class for every ball in the scene.Each ball uses the shared sphere mesh with its own position and size.
class Sphere {
    position;
    radius;

    constructor(position, radius) {
        this.position = position;
        this.radius = radius;
    }

    getModelMatrix() {
        return mult(translate(this.position), scalem(this.radius, this.radius, this.radius));
    }

    intersects(otherPosition, otherRadius) {
        var distance = length(subtract(this.position, otherPosition)); //distance between 2 centers
        var minDistance = this.radius + otherRadius;
        return distance < minDistance;
    }

    // Draw this ball's position and size by default()-if no modelMatrix given
    draw(modelMatrix) {
        if (modelMatrix === undefined) {
            modelMatrix = this.getModelMatrix();
        }
        setModelView(modelMatrix);
        sphereMesh.draw();
    }
}
