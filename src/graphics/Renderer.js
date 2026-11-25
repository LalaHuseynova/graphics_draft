/*
CSCI 2408 - Computer Graphics, Fall 2026
Copyright (c) 2026 Team C2 (Group 10)
 
 Team Members:  Lala Huseynova, Khavar Jabbarli, Gunel Zeynalzada, Fikrat Rustamli

 Submitted in partial fulfillment of the requirements of the course.
 
 File: Renderer.js

 Description:
 Manages the WebGL context, shader program, shared meshes, and rendering of the game world using the model-view-projection 
 transformation pipeline.
 
 Reference:
 - Angel & Shreiner, Interactive Computer Graphics, Chapters 4–5.
 */

class Renderer {
     // Set up the renderer
    constructor(canvas) {
        this.canvas = canvas;

        // initialize WebGL
        this.gl = WebGLUtils.setupWebGL(canvas);
        if (!this.gl) {
            alert("WebGL isn't available");
            return;
        }
        const gl = this.gl;

        this.resize();

        // keep the background transparent so the CSS sky is visible
        gl.clearColor(0.0, 0.0, 0.0, 0.0);
        gl.enable(gl.DEPTH_TEST);

        // prevent the faces and edges from overlapping at the same depht
        gl.enable(gl.POLYGON_OFFSET_FILL);
        gl.polygonOffset(1.0, 1.0);

        // set up the shader program
        this.shader = new ShaderProgram(gl, "vertex-shader", "fragment-shader",
            ["vPosition", "vNormal", "vTexCoord"],
            ["uModel", "uView", "uProjection", "uColor"]);
        this.shader.use();

        // use one shared mesh for all spheres
        this.sphereMesh = Mesh.createSphere(gl, SPHERE_LAT_BANDS, SPHERE_LON_BANDS);
        this.planeMesh  = Mesh.createPlane(gl, PLANE_HALF_SIZE, TILE_SIZE);

        // show the edges of polyhedron
        this.showEdges = true;
    }

    // adjust the canvas size to match the screen
    resize() {
        // keep the pixel ratio at most 2 to reduce rendering costs
        const dpr = Math.min(window.devicePixelRatio || 1, 2);

        // Calculate the canvas width and height in pixels
        const width  = Math.floor(this.canvas.clientWidth  * dpr);
        const height = Math.floor(this.canvas.clientHeight * dpr);

        // update the canvas size only if it has changed
        if (this.canvas.width !== width || this.canvas.height !== height) {
            this.canvas.width = width;
            this.canvas.height = height;
        }

        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);    // set the viewport to match the canvas size
    }

    // Clear previous frame
    clear() {
        const gl = this.gl;
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    }

    // Set the camera matrices
    setCamera(view, projection) {
        const gl = this.gl;

        // flatten() handles the matrix transpose, so we use false

        gl.uniformMatrix4fv(this.shader.uniform.uView, false, flatten(view)); // Send the view matrix to the shader
        gl.uniformMatrix4fv(this.shader.uniform.uProjection, false, flatten(projection));   // Send the projection matrix to the shader
    }

    // Draw the mesh with its transformation and color
    drawMesh(mesh, model, color) {
        const gl = this.gl;
        gl.uniformMatrix4fv(this.shader.uniform.uModel, false, flatten(model)); // send the model matrix to the shader

        gl.uniform4fv(this.shader.uniform.uColor, flatten(color));     // set the color of the mesh
        mesh.draw(this.shader);

         // check if edge drawing is enabled
        if (this.showEdges) {
            const edgeColor = vec4(color[0] * 0.55, color[1] * 0.55, color[2] * 0.55, 1.0);
            gl.uniform4fv(this.shader.uniform.uColor, flatten(edgeColor));      // set the new color in the shader
            mesh.drawEdges(this.shader);        
        }
    }

    // render the ground and all spheres in the world
    render(world, view, projection) {
        this.clear();
        this.setCamera(view, projection);   // set the camera view and projection matrices

        // draw the ground using an identity matrix
        this.drawMesh(this.planeMesh, mat4(), world.planeColor);

        // Loop through each sphere in the scene
        for (const sphere of world.spheres) {
            this.drawMesh(this.sphereMesh, sphere.modelMatrix(), sphere.color);   // Render each sphere using its transformation and color
        }
    }
}