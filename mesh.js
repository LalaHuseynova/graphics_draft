/*
    CSCI 2408 Computer Graphics Fall 2026
    (c)2026 by Lala Huseynova, Khavar Jabbarli, Gunel Zeynalzada, Fikrat Rustamli (team C2)
    Submitted in partial fulfillment of the requirements of the course.
*/

"use strict";

// Mesh class to store the triangles of a shape and their WebGL buffers
class Mesh {
    // Arrays to store vertex data, every 3 vertices make one triangle
    vertices;
    normals;
    texCoords; 

    // WebGL buffers for the vertex data
    bufferVertexId;
    bufferNormalId;
    bufferTexCoordId;

    constructor() {
        this.vertices = new Array();
        this.normals = new Array();
        this.texCoords = new Array();
    }

    // Create a unit sphere centered at the origin
    makeSphere(stacks, slices) {
        for (var i = 0; i < stacks; i++) {
            for (var j = 0; j < slices; j++) {
                // Split each quad of the grid into two triangles
                this.#addSpherePoint(i,j,stacks, slices);
                this.#addSpherePoint(i + 1, j, stacks, slices);
                this.#addSpherePoint(i + 1, j + 1, stacks, slices);
                this.#addSpherePoint(i, j, stacks, slices);
                this.#addSpherePoint(i + 1, j + 1, stacks, slices);
                this.#addSpherePoint(i, j + 1, stacks, slices);
            }
        }
    }

    // Add a point of the sphere grid
    #addSpherePoint(i, j, stacks, slices) {
        // Latitude angle from the top
        var theta = i * Math.PI / stacks;
        // Longitude angle around the y-axis
        var phi = j * 2.0 * Math.PI / slices;
        var x = Math.sin(theta) * Math.cos(phi);
        var y = Math.cos(theta);
        var z = Math.sin(theta) * Math.sin(phi);
        this.vertices.push(vec4(x, y, z, 1.0));

        // Use sphere's position as its normal
        this.normals.push(vec3(x, y, z));
        this.texCoords.push(vec2(j / slices, i / stacks));
    }

    // Create a flat square plane on the ground(y = 0)
    makePlane(halfSize, tiles) {
        var corners = [
            vec4(-halfSize, 0.0, -halfSize, 1.0),
            vec4(-halfSize, 0.0, halfSize, 1.0),
            vec4(halfSize, 0.0, halfSize, 1.0),
            vec4(halfSize, 0.0, -halfSize, 1.0)
        ];
        var uvs = [vec2(0.0, 0.0), vec2(0.0, tiles), vec2(tiles, tiles), vec2(tiles, 0.0)];
       // Create two triangles using the corners
        var order = [0, 1, 2, 0, 2, 3];
        for (var k = 0; k < order.length; k++) {
            this.vertices.push(corners[order[k]]);
            // All normals of the plane point up
            this.normals.push(vec3(0.0, 1.0, 0.0));
            this.texCoords.push(uvs[order[k]]);
        }
    }


    loadToGPU() {
        // Create and initalize a WebGL buffer for the vertex positions
        this.bufferVertexId = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferVertexId);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.vertices), gl.STATIC_DRAW);

        // Load the vertex normal data into the GPU
        this.bufferNormalId = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferNormalId);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.normals), gl.STATIC_DRAW);

        // Load the vertex texture coordinate data into the GPU
        this.bufferTexCoordId = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferTexCoordId);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.texCoords), gl.STATIC_DRAW);
    }

    // Connect the mesh buffers to the shader and draw the mesh
    draw() {
       // Connect vertex positions to the shader
        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferVertexId);
        gl.vertexAttribPointer(aPosition, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(aPosition);

        // Bind vertex normal buffer to the shader attribute
        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferNormalId);
        gl.vertexAttribPointer(aNormal, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(aNormal);

        // skip texure coordinates if the attribute is not used by the shader
        if (aTexCoord != -1) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferTexCoordId);
            gl.vertexAttribPointer(aTexCoord, 2, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(aTexCoord);
        }

        // Render primitives from the array data
        gl.drawArrays(gl.TRIANGLES, 0, this.vertices.length);
    }
}