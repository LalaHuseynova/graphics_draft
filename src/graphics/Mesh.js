/*
CSCI 2408 - Computer Graphics, Fall 2026
Copyright (c) 2026 Team C2 (Group 10)

Team Members: Lala Huseynova, Khavar Jabbarli, Gunel Zeynalzada, Fikrat Rustamli

Submitted in partial fulfillment of the requirements of the course.

File: Mesh.js

Description:
Manages geometry stored in GPU buffers and provides sphere and plane meshes.
Uses shared sphere geometry with model transformations to control object size
and position. Stores vertex positions, normals, and texture coordinates to
support rendering, lighting, and texturing.

Reference:
- Angel & Shreiner, Interactive Computer Graphics, 7th ed., Chapters 5–6.
*/

class Mesh {
    // Initialize the mesh
    constructor(gl, data) {
        this.gl = gl;
        this.vertexCount = data.positions.length;
        this.indexCount = data.indices.length;
        this.edgeCount = data.edges.length;

        // Create a buffer
        this.positionBuffer = Mesh._makeBuffer(gl, gl.ARRAY_BUFFER, flatten(data.positions)); // for vertex positions
        this.normalBuffer = Mesh._makeBuffer(gl, gl.ARRAY_BUFFER, flatten(data.normals)); // for vertex normals
        this.uvBuffer = Mesh._makeBuffer(gl, gl.ARRAY_BUFFER, flatten(data.uvs));  // for texture coordinates

        // Store the indices 
        this.indexBuffer = Mesh._makeBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(data.indices)); // for drawing triangles
        this.edgeBuffer = Mesh._makeBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(data.edges)); // for drawing edges
    }

    static _makeBuffer(gl, target, typedArray) {
        const buffer = gl.createBuffer();
        gl.bindBuffer(target, buffer); // Bind buffer to specified target
        gl.bufferData(target, typedArray, gl.STATIC_DRAW);  // Upload the data to GPU for static use
        return buffer;
    }

    // connect the mesh data to the shader
    _bindAttributes(shader) {
        const gl = this.gl;

        const bind = (location, buffer, size) => {
            // Ignore attributes that the shader does not use
            if (location === undefined || location < 0) return;

            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

            gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0); // Tell WebGL how to read the vertex data
            gl.enableVertexAttribArray(location);
        };
        bind(shader.attrib.vPosition, this.positionBuffer, 4);

        bind(shader.attrib.vNormal, this.normalBuffer, 3);

        // Texture coordinates have 2 components (u, v)
        bind(shader.attrib.vTexCoord, this.uvBuffer, 2);
    }

    draw(shader) {  // Draw mesh with triangles
        const gl = this.gl;

        this._bindAttributes(shader);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);  // Select the buffer containing triangle indices

        // Draw all triangles using the stored indices
        gl.drawElements(gl.TRIANGLES, this.indexCount, gl.UNSIGNED_SHORT, 0);
    }

    // Draw the mesh edges as lines
    drawEdges(shader) {
        const gl = this.gl;
        this._bindAttributes(shader);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.edgeBuffer);
        gl.drawElements(gl.LINES, this.edgeCount, gl.UNSIGNED_SHORT, 0);
    }

    // Create a sphere with radius 1
    static createSphere(gl, latBands, lonBands) {
        const positions = [], normals = [], uvs = [], indices = [];

        for (let lat = 0; lat <= latBands; lat++) {
            const theta = lat * Math.PI / latBands; // Calculate the angle from the top of the sphere
            const sinT = Math.sin(theta), cosT = Math.cos(theta);

            for (let lon = 0; lon <= lonBands; lon++) {
                // Calculate the angle around the Y axis
                const phi = lon * 2 * Math.PI / lonBands;

                const x = Math.cos(phi) * sinT;
                const y = cosT;
                const z = Math.sin(phi) * sinT;

                positions.push(vec4(x, y, z, 1));

                normals.push(vec3(x, y, z));

                // Add the texture coordinates for this vertex
                uvs.push(vec2(1 - lon / lonBands, 1 - lat / latBands));
            }
        }

        // Calculate the number of vertices in one row
        const rowLength = lonBands + 1;

        // Loop through the latitude and longitude bands
        for (let lat = 0; lat < latBands; lat++) {
            for (let lon = 0; lon < lonBands; lon++) {
                // vertex index in the current row
                const a = lat * rowLength + lon;

                // vertex index in the next row
                const b = a + rowLength;

                indices.push(a, b, a + 1); // Add the indices of the first triangle
                indices.push(b, b + 1, a + 1);    // Add the indices of the second triangle
            }
        }

        // creates and gives sphere mesh
        return new Mesh(gl, {
            positions, normals, uvs, indices,
            edges: Mesh._edgesFromTriangles(indices) });
    }

     // Create the ground plane with square tiles
    static createPlane(gl, halfSize, tileSize) {
        const positions = [], normals = [], uvs = [], indices = [], edges = [];

        // how many tiles fit on each side
        const tiles = Math.max(1, Math.round(2 * halfSize / tileSize));

        //  distance between vertices
        const step = 2 * halfSize / tiles;

        // number of vertices in each row
        const rowLength = tiles + 1;

        // Loop through the rows and columns of the plane
        for (let row = 0; row <= tiles; row++) {
            for (let col = 0; col <= tiles; col++) {

                const x = -halfSize + col * step;
                const z = -halfSize + row * step;

                // add the vertex position (y is always 0)
                positions.push(vec4(x, 0, z, 1));

                // set the normal to point upwards
                normals.push(vec3(0, 1, 0));

                // add texture coordinates for each vertex
                uvs.push(vec2(x / tileSize, z / tileSize));
            }
        }

        // Build the triangles for each tile
        for (let row = 0; row < tiles; row++) {
            for (let col = 0; col < tiles; col++) {
                // get the vertex index in the current row
                const a = row * rowLength + col;

                // get the vertex index in the next row
                const b = a + rowLength;

                // add the first triangle
                indices.push(a, b, a + 1);

                // add the second triangle
                indices.push(b, b + 1, a + 1);
            }
        }

        for (let row = 0; row <= tiles; row++) {
            for (let col = 0; col <= tiles; col++) {
                // Get the current vertex index
                const v = row * rowLength + col;

                // Add an edge between neighboring vertices in the X direction
                if (col < tiles) edges.push(v, v + 1);

                // Add an edge between neighboring vertices in the Z direction
                if (row < tiles) edges.push(v, v + rowLength);
            }
        }

        // return the ground plane mesh
        return new Mesh(gl, {positions, normals, uvs, indices, edges});
    }

    // Find all edges of the triangles without duplicates
    static _edgesFromTriangles(indices) {
        const seen = new Set();
        const edges = [];

        // function to add an edge
        const addEdge = (i, j) => {
            if (i === j) return;

            // put the smaller index first to identify the same edge
            const key = i < j ? i + "," + j : j + "," + i;

            // skip edges that are already added
            if (seen.has(key)) return;

            seen.add(key);
            edges.push(i, j);
        };

        // Each triangle has three edges
        for (let t = 0; t < indices.length; t += 3) {
            const a = indices[t], b = indices[t + 1], c = indices[t + 2];   // Get the three vertices of the triangle

            addEdge(a, b);
            addEdge(b, c);
            addEdge(c, a);
        }

        return edges;
    }
}