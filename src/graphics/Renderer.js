/*
    CSCI 2408 Computer Graphics Fall 2026
    (c)2026 by Team C2 (Group 10): Lala Huseynova, Khavar Jabbarli, Gunel Zeynalzada, Fikrat Rustamli
    Submitted in partial fulfillment of the requirements of the course.

    Renderer.js: owns the WebGL context, the shader program and the shared
    meshes, and draws the World every frame.
    Owner: Member 1 (rendering & light).

    Drawing one object = send its model matrix and colour to the shader, then
    draw its mesh. The vertex shader computes
        gl_Position = projection * view * model * vPosition
    (Angel & Shreiner, ch. 4-5: model-view-projection pipeline).

    Generative AI: Claude (Claude Code), 25 Nov 2026, helped write this file.
    See README Developer Log, 25 November 2026.
*/

class Renderer {
    /** @param {HTMLCanvasElement} canvas */
    constructor(canvas) {
        this.canvas = canvas;

        // WebGLUtils.setupWebGL (common/webgl-utils.js) creates the context
        // and shows a helpful message if the browser has no WebGL.
        this.gl = WebGLUtils.setupWebGL(canvas);
        if (!this.gl) {
            alert("WebGL isn't available");
            return;
        }
        const gl = this.gl;

        this.resize();                          // match the window size, set the viewport
        // Clear to fully transparent, so the CSS sky gradient behind the
        // canvas (katamari-C2.html) shows through. TEMPORARY until the skybox (A4).
        gl.clearColor(0.0, 0.0, 0.0, 0.0);
        gl.enable(gl.DEPTH_TEST);               // near objects hide far ones

        // Push filled triangles slightly back in depth so the wireframe lines
        // drawn on top of them are not hidden ("z-fighting").
        gl.enable(gl.POLYGON_OFFSET_FILL);
        gl.polygonOffset(1.0, 1.0);

        this.shader = new ShaderProgram(gl, "vertex-shader", "fragment-shader",
            ["vPosition", "vNormal", "vTexCoord"],
            ["uModel", "uView", "uProjection", "uColor"]);
        this.shader.use();

        // Shared meshes: ONE sphere polyhedron for every sphere, one plane.
        this.sphereMesh = Mesh.createSphere(gl, SPHERE_LAT_BANDS, SPHERE_LON_BANDS);
        this.planeMesh  = Mesh.createPlane(gl, PLANE_HALF_SIZE, TILE_SIZE);

        // When true, polyhedron edges are drawn on top of the filled faces so
        // the facets are visible (no lighting yet to show them).
        this.showEdges = true;
    }

    /**
     * Makes the canvas drawing buffer as big as the canvas on screen (the
     * whole window), so the picture is sharp and not stretched, and sets the
     * WebGL viewport to match. Called at start-up and at the start of every
     * frame, BEFORE the camera builds its projection (the projection's aspect
     * ratio is canvas.width / canvas.height). It only
     * does work when the size changed (window resized or browser zoomed).
     *
     * devicePixelRatio is how many real screen pixels make one CSS pixel
     * (2 on most Retina screens). It is capped at 2 so 4K screens do not
     * render far more pixels than needed.
     */
    resize() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const width  = Math.floor(this.canvas.clientWidth  * dpr);
        const height = Math.floor(this.canvas.clientHeight * dpr);
        if (this.canvas.width !== width || this.canvas.height !== height) {
            this.canvas.width = width;
            this.canvas.height = height;
        }
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }

    /** Clears colour and depth before a new frame. */
    clear() {
        const gl = this.gl;
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    }

    /**
     * Sets the camera matrices for the whole frame.
     * flatten() already transposes MV.js matrices, so we pass false.
     */
    setCamera(view, projection) {
        const gl = this.gl;
        gl.uniformMatrix4fv(this.shader.uniform.uView, false, flatten(view));
        gl.uniformMatrix4fv(this.shader.uniform.uProjection, false, flatten(projection));
    }

    /**
     * Draws one mesh with a model matrix and a colour; if edges are on, draws
     * its edges in a darker shade of the same colour.
     */
    drawMesh(mesh, model, color) {
        const gl = this.gl;
        gl.uniformMatrix4fv(this.shader.uniform.uModel, false, flatten(model));

        gl.uniform4fv(this.shader.uniform.uColor, flatten(color));
        mesh.draw(this.shader);

        if (this.showEdges) {
            const edgeColor = vec4(color[0] * 0.55, color[1] * 0.55, color[2] * 0.55, 1.0);
            gl.uniform4fv(this.shader.uniform.uColor, flatten(edgeColor));
            mesh.drawEdges(this.shader);
        }
    }

    /**
     * Draws the whole world: the ground plane, then every sphere.
     * @param {World} world
     * @param {mat4} view        camera view matrix (lookAt)
     * @param {mat4} projection  perspective projection matrix
     */
    render(world, view, projection) {
        this.clear();
        this.setCamera(view, projection);

        // The plane is built at its final place, so its model matrix is identity.
        this.drawMesh(this.planeMesh, mat4(), world.planeColor);

        for (const sphere of world.spheres) {
            this.drawMesh(this.sphereMesh, sphere.modelMatrix(), sphere.color);
        }
    }
}
