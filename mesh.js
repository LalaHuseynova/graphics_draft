/*
    CSCI 2408 Computer Graphics Fall 2026
    (c)2026 by Lala Huseynova, Khavar Jabbarli, Gunel Zeynalzada, Fikrat Rustamli (team C2)
    Submitted in partial fulfillment of the requirements of the course.
*/

"use strict";
// The purpose of "use strict" is to indicate that the code should be executed in "strict mode".
// With strict mode, you can not, for example, use undeclared variables.

// Mesh class to store the triangles of one shape and their WebGL buffers.
// The game needs only two meshes: a unit sphere (used for every ball and later the sky)
// and the ground plane. Each ball just scales the same unit sphere by its radius.
class Mesh {
    // Arrays for storing all triangle data (like triangleVertices / triangleTexCoords in the labs).
    // Three vertices in a row make one triangle, no index buffer (same as the labs).
    vertices;    // vec4 positions (x, y, z, 1)
    normals;     // vec3 unit normals, one per vertex, needed for lighting later (A1)
    texCoords;   // vec2 texture coordinates (s, t), one per vertex, needed for textures later (A3)
    // WebGL buffer ids, one buffer for each array
    bufferVertexId;
    bufferNormalId;
    bufferTexCoordId;

    constructor() {
        this.vertices = new Array();
        this.normals = new Array();
        this.texCoords = new Array();
    }

    // Build a polyhedron that looks like a sphere of radius 1 centred at the origin.
    // stacks: number of horizontal bands from top to bottom (latitude),
    // slices: number of cuts around the y-axis (longitude).
    // More stacks and slices = rounder ball, but more triangles to draw.
    makeSphere(stacks, slices) {
        for (var i = 0; i < stacks; i++) {
            for (var j = 0; j < slices; j++) {
                // The small patch between latitudes i, i+1 and longitudes j, j+1 is a quad,
                // and we split it into two triangles
                this.#addSpherePoint(i,j,stacks, slices);
                this.#addSpherePoint(i + 1, j, stacks, slices);
                this.#addSpherePoint(i + 1, j + 1, stacks, slices);
                this.#addSpherePoint(i, j, stacks, slices);
                this.#addSpherePoint(i + 1, j + 1, stacks, slices);
                this.#addSpherePoint(i, j + 1, stacks, slices);
            }
        }
    }

    // Add one point of the sphere grid: row i (0..stacks), column j (0..slices)
    #addSpherePoint(i, j, stacks, slices) {
        var theta = i * Math.PI / stacks;    // radians, 0 at the top (north pole), PI at the bottom
        var phi = j * 2.0 * Math.PI / slices;    // radians, angle around the y-axis, 0 to 2 PI
        var x = Math.sin(theta) * Math.cos(phi);
        var y = Math.cos(theta);
        var z = Math.sin(theta) * Math.sin(phi);
        this.vertices.push(vec4(x, y, z, 1.0));
        // On a unit sphere centred at the origin the normal is the same as the position
        this.normals.push(vec3(x, y, z));
        // s goes around the ball, t goes from top to bottom, both from 0 to 1
        this.texCoords.push(vec2(j / slices, i / stacks));
    }

    // Build a flat square on the ground (y = 0) from -halfSize to +halfSize metres in x and z.
    // tiles: how many times a texture will repeat along each side (used in Phase 8).
    makePlane(halfSize, tiles) {
        var corners = [
            vec4(-halfSize, 0.0, -halfSize, 1.0),
            vec4(-halfSize, 0.0, halfSize, 1.0),
            vec4( halfSize, 0.0, halfSize, 1.0),
            vec4( halfSize, 0.0, -halfSize, 1.0)
        ];
        var uvs = [vec2(0.0, 0.0), vec2(0.0, tiles), vec2(tiles, tiles), vec2(tiles, 0.0)];
        // Two triangles, listed corner by corner like the triangleVertices arrays in the labs
        var order = [0, 1, 2, 0, 2, 3];
        for (var k = 0; k < order.length; k++) {
            this.vertices.push(corners[order[k]]);
            // The ground is flat, so every normal points straight up
            this.normals.push(vec3(0.0, 1.0, 0.0));
            this.texCoords.push(uvs[order[k]]);
        }
    }

    // Load the triangle data into the GPU (same calls as in init() of the labs).
    // Called once after makeSphere() or makePlane(), because the shape never changes.
    loadToGPU() {
        // Create a buffer for the positions, bind it, and copy the data in.
        // flatten() turns the list of vectors into one Float32Array, STATIC_DRAW = upload once, draw many times.
        this.bufferVertexId = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferVertexId);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.vertices), gl.STATIC_DRAW);

        // Same for the normals
        this.bufferNormalId = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferNormalId);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.normals), gl.STATIC_DRAW);

        // Same for the texture coordinates
        this.bufferTexCoordId = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferTexCoordId);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.texCoords), gl.STATIC_DRAW);
    }

    // Connect this mesh's buffers to the shader attributes and draw its triangles.
    // Attribute pointers are shared WebGL state, so we must set them again for every mesh,
    // otherwise the plane would be drawn with the sphere's data.
    draw() {
        // Positions: 4 floats per vertex, not normalized, stride 0 and offset 0 (tightly packed)
        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferVertexId);
        gl.vertexAttribPointer(aPosition, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(aPosition);

        // Normals: 3 floats per vertex
        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferNormalId);
        gl.vertexAttribPointer(aNormal, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(aNormal);

        // Texture coordinates: 2 floats per vertex.
        // The shader compiler throws away attributes that are not used, and then
        // getAttribLocation gives -1. Using -1 here would be an error, so we skip it.
        if (aTexCoord != -1) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferTexCoordId);
            gl.vertexAttribPointer(aTexCoord, 2, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(aTexCoord);
        }

        // Render primitives from the array data: every 3 vertices make one triangle
        gl.drawArrays(gl.TRIANGLES, 0, this.vertices.length);
    }
}
