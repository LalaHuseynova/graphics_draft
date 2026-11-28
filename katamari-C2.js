/*
    CSCI 2408 Computer Graphics Fall 2026
    (c)2026 by Lala Huseynova, Khavar Jabbarli, Gunel Zeynalzada, Fikrat Rustamli (team C2) 
    Submitted in partial fulfillment of the requirements of the course.
*/
"use strict";

var canvas;
var gl;
var program;

// Transformation matrices
var matrixProjection = mat4(); // camera space to clip space
var matrixView = mat4(); // world to camera space
var matrixModelview = mat4(); // matrixView * model matrix

// Shader atribute and uniform locations
var aPosition;
var aNormal;
var aTexCoord;
var uModelView;
var uProjection;

// Meshes for the unit sphere and the ground plane
var sphereMesh;
var planeMesh;

// All random balls lying on the plane
var spheres = [];

// Time of the previous frame in milliseconds
var lastTime = 0;

// Limit dt(in sec) so objects don't jump when we return to the tab
const MAX_DT = 0.05;

const SPHERE_STACKS = 24; // bands from top to bottom
const SPHERE_SLICES = 48; // division around y-axis

// Size of the scene in metres, the sky later will have the same radius
const SKY_RADIUS = 60.0;
// Half size of the ground plane, same as the sky so the ground reaches it
const PLANE_HALF_SIZE = SKY_RADIUS;
// Empty space between the balls and the sky
const PLAY_MARGIN = 2.0;

// Number of balls at the start
const SPHERE_COUNT = 40;
// Smallest and largest radius of the balls in metres
const SPHERE_MIN_RADIUS = 0.3;
const SPHERE_MAX_RADIUS = 3.0;
// Radius of the player ball at the start
const PLAYER_RADIUS = 1.0;
// Keep this much empty space around the start position
const START_GAP = 3.0;
// Stop trying after this many random positions
const MAX_ATTEMPTS = 10000;

// Projection settings for the temporary camera from above, Phase 4 changes it
// Vertical field of view in degrees
const FOVY = 60.0;
// Near and far clipping distance in metres
const NEAR = 0.1;
const FAR = 3.0 * SKY_RADIUS;

window.onload = init;

function init() {
    canvas = document.getElementById("gl-canvas");
    
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available" ); return;}

    resizeCanvas();
    window.onresize = resizeCanvas;

    // Configure WebGL
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    // Load shaders and get the attribute and uniform locations
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);
    aPosition = gl.getAttribLocation(program, "aPosition");
    aNormal = gl.getAttribLocation(program, "aNormal");
    aTexCoord = gl.getAttribLocation(program, "aTexCoord"); //-1 if the shader doesn't use this attribute
    uModelView = gl.getUniformLocation(program, "uModelView");
    uProjection = gl.getUniformLocation(program, "uProjection");

    // Build meshes and load them into the GPU
    sphereMesh = new Mesh();
    sphereMesh.makeSphere(SPHERE_STACKS, SPHERE_SLICES);
    sphereMesh.loadToGPU();

    planeMesh = new Mesh();
    planeMesh.makePlane(PLANE_HALF_SIZE, 1.0); //1 texture tile per side
    planeMesh.loadToGPU();

    // Put the random balls on the plane
    placeSpheres();

    lastTime = Date.now();
    render();
    console.log("init... End");
}

// Resize the canvas and viewport to fit the window
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
}

// Update the projection and view matrices
function transform() {
    matrixProjection = perspective(FOVY, canvas.width / canvas.height, NEAR, FAR);

    // Temporary camera high above, so we can see all the balls
    matrixView = lookAt(vec3(0.0, 70.0, 70.0), vec3(0.0, 0.0, 0.0), vec3(0.0, 1.0, 0.0));
}

// Put SPHERE_COUNT balls at random places on the plane, no two of them can touch
// We pick a random place and radius, if it touches another ball we throw it away and try again
function placeSpheres() {
    spheres = [];
    var attempts = 0;
    while (spheres.length < SPHERE_COUNT && attempts < MAX_ATTEMPTS) {
        attempts++;
        var r = SPHERE_MIN_RADIUS + Math.random() * (SPHERE_MAX_RADIUS - SPHERE_MIN_RADIUS);
        var angle = Math.random() * 2.0 * Math.PI;
        // sqrt() spreads the balls evenly, without it most of them end up near the centre
        var dist = Math.sqrt(Math.random()) * (SKY_RADIUS - PLAY_MARGIN - r);
        // Turn the angle and distance into x and z on the plane
        var x = dist * Math.cos(angle);
        var z = dist * Math.sin(angle);
        // y is the radius so the ball sits on the plane, not inside it
        var y = r;
        // New ball to check
        var candidate = new Sphere(vec3(x, y, z), r);

        // The start position of the player must stay empty
        var free = !candidate.intersects(vec3(0.0, PLAYER_RADIUS, 0.0), PLAYER_RADIUS + START_GAP);
        for (var k = 0; free && k < spheres.length; k++) {
            if (candidate.intersects(spheres[k].position, spheres[k].radius)) {
                free = false;
            }
        }
        if (free) {
            spheres.push(candidate);
        }
    }
    console.log("placeSpheres: " + spheres.length + " spheres after " + attempts + " attempts");
}

// pass the object's model-view matrix to the shader
function setModelView(modelMatrix) {
    matrixModelview = mult(matrixView, modelMatrix);
    // Send the model-view matrix to the shader
    gl.uniformMatrix4fv(uModelView, false, flatten(matrixModelview));
}

function render() {
    // Time since the last frame in seconds, not bigger than MAX_DT
    var now = Date.now();
    var dt = Math.min((now - lastTime) / 1000.0, MAX_DT);
    lastTime = now;

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    transform();
    gl.uniformMatrix4fv(uProjection, false, flatten(matrixProjection));

    // The plane vertices in world coordinates
    setModelView(mat4());
    planeMesh.draw();

    // Player ball at the start, moved up by its radius so it sits on the ground
    setModelView(mult(translate(0.0, PLAYER_RADIUS, 0.0), scalem(PLAYER_RADIUS, PLAYER_RADIUS, PLAYER_RADIUS)));
    sphereMesh.draw();

    // Draw all the random balls
    for (var i = 0; i < spheres.length; i++) {
        spheres[i].draw();
    }

    requestAnimFrame(render);
}