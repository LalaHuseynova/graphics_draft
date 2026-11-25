/*
    CSCI 2408 Computer Graphics Fall 2026
    (c)2026 by Team C2 (Group 10): Lala Huseynova, Khavar Jabbarli, Gunel Zeynalzada, Fikrat Rustamli
    Submitted in partial fulfillment of the requirements of the course.

    Mesh.js: geometry stored in GPU buffers, plus the two shapes we need:
      - Mesh.createSphere(): a UNIT sphere (radius 1, centre at the origin)
        approximated by a polyhedron built from latitude/longitude bands.
      - Mesh.createPlane(): a flat square grid on y = 0 (the ground).
    Owner: Member 1 (rendering & light).

    Every sphere in the game shares ONE sphere mesh. Its size and position come
    from the model matrix: model = translate(x, y, z) * scalem(r, r, r).

    Each vertex stores:
      position vec4(x, y, z, 1)  where it is
      normal   vec3(x, y, z)     which way the surface faces (for A1 lighting)
      uv       vec2(u, v)        texture coordinates (for A3 textures)
    Normals and UVs are not used by the Minimum shaders yet, but are built now
    so Members 1 and 4 can add lighting and textures without changing Mesh.

    Reference: E. Angel & D. Shreiner, Interactive Computer Graphics, 7th ed.,
    ch. 5-6 (approximating a sphere with a polyhedron, latitude/longitude).
    Generative AI: Claude (Claude Code), 25 Nov 2026, helped write this file.
    See README Developer Log, 25 November 2026.
*/

class Mesh {
    /**
     * Uploads geometry to the GPU.
     * @param {WebGLRenderingContext} gl
     * @param {{positions: vec4[], normals: vec3[], uvs: vec2[],
     *          indices: number[], edges: number[]}} data
     *        indices: 3 vertex numbers per triangle (filled drawing)
     *        edges:   2 vertex numbers per line (wireframe drawing)
     */
    constructor(gl, data) {
        this.gl = gl;
        this.vertexCount = data.positions.length;
        this.indexCount = data.indices.length;
        this.edgeCount = data.edges.length;

        // One buffer per attribute. flatten() (MV.js) turns an array of
        // vectors into a Float32Array the GPU understands.
        this.positionBuffer = Mesh._makeBuffer(gl, gl.ARRAY_BUFFER, flatten(data.positions));
        this.normalBuffer   = Mesh._makeBuffer(gl, gl.ARRAY_BUFFER, flatten(data.normals));
        this.uvBuffer       = Mesh._makeBuffer(gl, gl.ARRAY_BUFFER, flatten(data.uvs));

        // Index buffers let triangles share vertices. WebGL 1 only allows
        // 16-bit indices by default, so a mesh may have at most 65 536 vertices.
        this.indexBuffer = Mesh._makeBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(data.indices));
        this.edgeBuffer  = Mesh._makeBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(data.edges));
    }

    /** Creates a GPU buffer of the given kind and fills it with data. */
    static _makeBuffer(gl, target, typedArray) {
        const buffer = gl.createBuffer();
        gl.bindBuffer(target, buffer);
        gl.bufferData(target, typedArray, gl.STATIC_DRAW);
        return buffer;
    }

    /**
     * Connects this mesh's buffers to the shader's attributes.
     * Attributes the shader does not use (location -1) are skipped.
     */
    _bindAttributes(shader) {
        const gl = this.gl;
        const bind = (location, buffer, size) => {
            if (location === undefined || location < 0) return;
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(location);
        };
        bind(shader.attrib.vPosition, this.positionBuffer, 4);
        bind(shader.attrib.vNormal,   this.normalBuffer,   3);
        bind(shader.attrib.vTexCoord, this.uvBuffer,       2);
    }

    /** Draws the mesh as filled triangles. */
    draw(shader) {
        const gl = this.gl;
        this._bindAttributes(shader);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.drawElements(gl.TRIANGLES, this.indexCount, gl.UNSIGNED_SHORT, 0);
    }

    /** Draws only the edges of the mesh as lines ("line mode"). */
    drawEdges(shader) {
        const gl = this.gl;
        this._bindAttributes(shader);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.edgeBuffer);
        gl.drawElements(gl.LINES, this.edgeCount, gl.UNSIGNED_SHORT, 0);
    }

    // -----------------------------------------------------------------------
    // Shape builders
    // -----------------------------------------------------------------------

    /**
     * Builds a unit sphere polyhedron (radius 1, centred at the origin).
     *
     * Picture a globe: latBands horizontal rings from the north pole to the
     * south pole, and lonBands vertical slices around the equator. Where a
     * ring meets a slice we place a vertex; every little patch between two
     * rings and two slices becomes 2 triangles. The result is a polyhedron
     * whose vertices all lie exactly on the sphere.
     *
     * @param {WebGLRenderingContext} gl
     * @param {number} latBands  rings from pole to pole (>= 2)
     * @param {number} lonBands  slices around the axis (>= 3)
     */
    static createSphere(gl, latBands, lonBands) {
        const positions = [], normals = [], uvs = [], indices = [];

        for (let lat = 0; lat <= latBands; lat++) {
            // theta: angle from the north pole, 0 .. PI (radians for Math.*)
            const theta = lat * Math.PI / latBands;
            const sinT = Math.sin(theta), cosT = Math.cos(theta);

            for (let lon = 0; lon <= lonBands; lon++) {
                // phi: angle around the vertical (Y) axis, 0 .. 2*PI
                const phi = lon * 2 * Math.PI / lonBands;
                const x = Math.cos(phi) * sinT;
                const y = cosT;               // Y is up
                const z = Math.sin(phi) * sinT;

                positions.push(vec4(x, y, z, 1));
                // On a unit sphere the outward normal equals the position.
                normals.push(vec3(x, y, z));
                // u wraps once around, v goes top (1) to bottom (0).
                uvs.push(vec2(1 - lon / lonBands, 1 - lat / latBands));
            }
        }
        // Note: the last slice (lon = lonBands) repeats the first one at the
        // same place. That duplicate seam lets the texture wrap from u=1 to 0.

        const rowLength = lonBands + 1;          // vertices per ring
        for (let lat = 0; lat < latBands; lat++) {
            for (let lon = 0; lon < lonBands; lon++) {
                const a = lat * rowLength + lon; // top-left of the patch
                const b = a + rowLength;         // bottom-left (next ring)
                indices.push(a, b, a + 1);       // first triangle
                indices.push(b, b + 1, a + 1);   // second triangle
            }
        }

        return new Mesh(gl, {
            positions, normals, uvs, indices,
            edges: Mesh._edgesFromTriangles(indices)
        });
    }

    /**
     * Builds a flat square ground on y = 0, from -halfSize to +halfSize on
     * x and z, split into square tiles of size tileSize.
     *
     * The plane is a grid (not just 2 triangles) so lighting computed per
     * vertex looks smooth later, and the wireframe shows a helpful grid.
     *
     * @param {WebGLRenderingContext} gl
     * @param {number} halfSize  half of the side length (m)
     * @param {number} tileSize  side length of one tile (m)
     */
    static createPlane(gl, halfSize, tileSize) {
        const positions = [], normals = [], uvs = [], indices = [], edges = [];
        const tiles = Math.max(1, Math.round(2 * halfSize / tileSize)); // per side
        const step = 2 * halfSize / tiles;
        const rowLength = tiles + 1;

        for (let row = 0; row <= tiles; row++) {
            for (let col = 0; col <= tiles; col++) {
                const x = -halfSize + col * step;
                const z = -halfSize + row * step;
                positions.push(vec4(x, 0, z, 1));
                normals.push(vec3(0, 1, 0));                 // faces straight up
                uvs.push(vec2(x / tileSize, z / tileSize));  // one texture per tile (A3 uses REPEAT)
            }
        }

        for (let row = 0; row < tiles; row++) {
            for (let col = 0; col < tiles; col++) {
                const a = row * rowLength + col;
                const b = a + rowLength;
                indices.push(a, b, a + 1);
                indices.push(b, b + 1, a + 1);
            }
        }

        // Grid lines only (no diagonals) so the wireframe reads as tiles.
        for (let row = 0; row <= tiles; row++) {
            for (let col = 0; col <= tiles; col++) {
                const v = row * rowLength + col;
                if (col < tiles) edges.push(v, v + 1);          // along x
                if (row < tiles) edges.push(v, v + rowLength);  // along z
            }
        }

        return new Mesh(gl, { positions, normals, uvs, indices, edges });
    }

    /**
     * Turns a triangle index list into a line index list with each edge once
     * (two triangles share an edge, so we skip duplicates).
     */
    static _edgesFromTriangles(indices) {
        const seen = new Set();
        const edges = [];
        const addEdge = (i, j) => {
            if (i === j) return;
            const key = i < j ? i + "," + j : j + "," + i;
            if (seen.has(key)) return;
            seen.add(key);
            edges.push(i, j);
        };
        for (let t = 0; t < indices.length; t += 3) {
            const a = indices[t], b = indices[t + 1], c = indices[t + 2];
            addEdge(a, b);
            addEdge(b, c);
            addEdge(c, a);
        }
        return edges;
    }
}
