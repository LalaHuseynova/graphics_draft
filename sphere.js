/*
    CSCI 2408 Computer Graphics Fall 2026
    (c)2026 by Lala Huseynova, Khavar Jabbarli, Gunel Zeynalzada, Fikrat Rustamli (team C2)
    Submitted in partial fulfillment of the requirements of the course.
*/

"use strict";

// Sphere class for every ball in the scene
// All balls use the same unit sphere mesh, only the model matrix changes
class Sphere {
    // Centre of the sphere in world coordinates (metres)
    position;

    // Radius of the sphere in metres
    radius;

    constructor(position, radius) {
        this.position = position;
        this.radius = radius;
    }

    // Scale the unit sphere to the radius, then move it to the position
    getModelMatrix() {
        return mult(translate(this.position), scalem(this.radius, this.radius, this.radius));
    }

    // Check if this sphere touches another sphere
    // They overlap when the distance between centres is smaller than the sum of the two radii
    intersects(otherPosition, otherRadius) {
        // Distance between the two centres
        var distance = length(subtract(this.position, otherPosition));

        // Sum of the two radii
        var minDistance = this.radius + otherRadius;
        return distance < minDistance;
    }

    // draw the ball using the same sphere mesh
    // if no matrix is given we use the ball's own matrix
    draw(modelMatrix) {
        if (modelMatrix === undefined) {
            modelMatrix = this.getModelMatrix();
        }
        setModelView(modelMatrix);
        sphereMesh.draw();
    }
}
