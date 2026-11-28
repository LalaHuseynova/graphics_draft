/*
    CSCI 2408 Computer Graphics Fall 2026
    (c)2026 by Lala Huseynova, Khavar Jabbarli, Gunel Zeynalzada, Fikrat Rustamli (team C2) 
    Submitted in partial fulfillment of the requirements of the course.
*/
"use strict"

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

// Time of the previous frame in milliseconds
var lastTime = 0;

// Limit dt(in sec) so objects don't jump when we return to the tab
const MAX_DT = 0.05;

const SPHERE_STACKS = 24; // bands from top to bottom
const SPHERE_SLICES = 48; // division around y-axis

const PLANE_HALF_SIZE = 60.0; // half-size of ground plane(metre)

// Projection settings for the temporary camera
const FOVY = 90.0; // vertical field of view
const NEAR = 0.1; // near clipping distance
const FAR = 200.0; // far clipping distance

window.onload = init;

function init() {
    // Get reference to the context of the canvas
    canvas = document.getElementById("gl-canvas");
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); return;}

    resizeCanvas();
    window.onresize = resizeCanvas;

    // Configure WebGL
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    // Load shaders and get the attribute and uniform locations
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);
    aPosition   = gl.getAttribLocation(program, "aPosition");
    aNormal     = gl.getAttribLocation(program, "aNormal");
    aTexCoord   = gl.getAttribLocation(program, "aTexCoord"); //-1 if the shader doesn't use this attribute
    uModelView  = gl.getUniformLocation(program, "uModelView");
    uProjection = gl.getUniformLocation(program, "uProjection");

    // Build meshes and load them into the GPU
    sphereMesh = new Mesh();
    sphereMesh.makeSphere(SPHERE_STACKS, SPHERE_SLICES);
    sphereMesh.loadToGPU();

    planeMesh = new Mesh();
    planeMesh.makePlane(PLANE_HALF_SIZE, 1.0); //1 texture tile per side
    planeMesh.loadToGPU();

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

    // Place the fixed camera behind and above the sphere
    matrixView = lookAt(vec3(0.0, 4.0, 4.0), vec3(0.0, 1.5, -6.0), vec3(0.0, 1.0, 0.0));
}

// pass the object's model-view matrix to the shader
function setModelView(modelMatrix) {
    matrixModelview = mult(matrixView, modelMatrix);
    // flatten() puts the matrix in column-major order.
    gl.uniformMatrix4fv(uModelView, false, flatten(matrixModelview));
}

function render() {
    // Calculate the time step(in seconds) and cap it at MAX_DT
    var now = Date.now();
    var dt = Math.min((now - lastTime) / 1000.0, MAX_DT);
    lastTime = now;

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    transform();
    gl.uniformMatrix4fv(uProjection, false, flatten(matrixProjection));

    // The plane vertices in world coordinates
    setModelView(mat4());
    planeMesh.draw();

    // Move the sphere up so it sits on the ground
    setModelView(translate(0.0, 1.0, 0.0));
    sphereMesh.draw();

    requestAnimFrame(render);
}