/*
    CSCI 2408 Computer Graphics Fall 2026
    (c)2026 by Lala Huseynova, Khavar Jabbarli, Gunel Zeynalzada, Fikrat Rustamli (team C2)
    Submitted in partial fulfillment of the requirements of the course.
*/

"use strict";
// The purpose of "use strict" is to indicate that the code should be executed in "strict mode".
// With strict mode, you can not, for example, use undeclared variables.

var canvas;
var gl;
var program;

// Matrices, named like in the gl-rotation lab
var matrixProjection = mat4();  // camera space -> clip space (perspective)
var matrixView = mat4();        // world -> camera space, only the camera (we need it alone later for lighting)
var matrixModelview = mat4();   // matrixView * model matrix of the object we are drawing

// Attribute and uniform locations, with the same names as in the shaders (gl-texture lab style)
var aPosition;
var aNormal;
var aTexCoord;
var uModelView;
var uProjection;

// The two shapes of the game (Mesh class in mesh.js)
var sphereMesh;   // unit sphere (radius 1), shared by every ball
var planeMesh;    // ground plane

// Time of the previous frame in milliseconds, we use it to get dt
var lastTime = 0;

// Biggest time step we allow in seconds. If the tab was hidden for a while,
// dt would be huge and everything would jump, so we cut it here.
const MAX_DT = 0.05;

// Polyhedron resolution of the unit sphere: 24 x 48 x 6 = 6912 vertices, round enough and cheap
const SPHERE_STACKS = 24;   // horizontal bands from top to bottom
const SPHERE_SLICES = 48;   // cuts around the y-axis

// Ground plane size in metres. 60 m matches the sky radius planned for Phase 9.
const PLANE_HALF_SIZE = 60.0;

// Camera and projection settings for now (Phase 4 replaces them with the real third-person camera)
const FOVY = 90.0;    // vertical field of view in degrees
const NEAR = 0.1;     // near clipping plane in metres, anything closer is cut off
const FAR = 200.0;    // far clipping plane in metres, must reach the far corners of the plane

window.onload = init;

function init() {
    console.log("init... Begin");
    // Get reference to the WebGL context of the canvas
    canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); return; }

    // Make the canvas as big as the window before we draw anything
    resizeCanvas();
    // When the browser window changes size, the canvas has to follow it.
    // Set here and not at the top, because resizeCanvas() needs gl to exist.
    window.onresize = resizeCanvas;

    //  Configure WebGL

    // Set the color value used when clearing color buffers (black).
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    // Turn on hidden surface removal, so faces behind other faces are not drawn on top.
    // It stays on for the whole game, so we set it once here and not in render().
    gl.enable(gl.DEPTH_TEST);

    //  Load shaders and get the attribute and uniform locations
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    aPosition   = gl.getAttribLocation(program, "aPosition");
    aNormal     = gl.getAttribLocation(program, "aNormal");
    // -1 for now, because the shader does not use the texture coordinate yet (Mesh.draw checks it)
    aTexCoord   = gl.getAttribLocation(program, "aTexCoord");
    uModelView  = gl.getUniformLocation(program, "uModelView");
    uProjection = gl.getUniformLocation(program, "uProjection");

    // Build the unit sphere once and copy it into the GPU
    sphereMesh = new Mesh();
    sphereMesh.makeSphere(SPHERE_STACKS, SPHERE_SLICES);
    sphereMesh.loadToGPU();

    // Build the ground plane. 1 = the texture is shown once (Phase 8 makes it repeat).
    planeMesh = new Mesh();
    planeMesh.makePlane(PLANE_HALF_SIZE, 1.0);
    planeMesh.loadToGPU();

    // Start the clock, then draw the first frame. render() keeps itself going after that.
    lastTime = Date.now();
    render();

    console.log("init... End");
}

// Make the drawing size of the canvas match the window size.
// Called once in init() and again every time the window changes size.
function resizeCanvas() {
    // CSS already stretches the canvas, but the real number of pixels we draw into
    // is canvas.width x canvas.height. Without this the picture would be blurry.
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    // Tell WebGL to draw into the whole new canvas area: x, y of the corner, then width, height in pixels
    gl.viewport(0, 0, canvas.width, canvas.height);
}

// Compute the projection and view matrices for this frame
function transform() {
    // Projection: fovy in degrees, aspect ratio, near and far planes.
    // We use the canvas width-to-height ratio so the picture is not stretched (like in the gl-rotation lab).
    matrixProjection = perspective(FOVY, canvas.width / canvas.height, NEAR, FAR);

    // Camera: a fixed camera for now (Phase 4 replaces it with one that follows the ball).
    // eye = where the camera stands: 4 m behind the ball and 4 m up.
    // at = the point it looks at: 6 m in front of the ball and 1.5 m up, so the view is almost
    //      level. This puts the ball at the bottom centre and leaves the top part for the sky.
    //      Higher at.y = more sky, lower at.y = less sky (keep it below the eye height 4 m).
    // up = which way is up (y-axis)
    matrixView = lookAt(vec3(0.0, 4.0, 4.0), vec3(0.0, 1.5, -6.0), vec3(0.0, 1.0, 0.0));
}

// Send the model-view matrix of one object to the shader.
// modelMatrix: places the object in the world (move, turn, scale).
function setModelView(modelMatrix) {
    // mult(A, B) applies B first: first the model matrix, then the camera
    matrixModelview = mult(matrixView, modelMatrix);
    // false = do not transpose (flatten already does it for us)
    gl.uniformMatrix4fv(uModelView, false, flatten(matrixModelview));
}

// Draw one frame. requestAnimFrame calls this again before every screen refresh.
function render() {
    // Time step in seconds since the previous frame (Date.now() gives milliseconds).
    // Nothing moves yet; from Phase 6 every movement is speed * dt, so the game
    // runs the same at 30 or 144 frames per second.
    var now = Date.now();
    var dt = Math.min((now - lastTime) / 1000.0, MAX_DT);
    lastTime = now;

    // Clear color and depth buffers. The depth buffer must be cleared too,
    // or with depth test on nothing new gets drawn after the first frame.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    transform();

    // The projection is the same for every object in this frame, so send it once
    gl.uniformMatrix4fv(uProjection, false, flatten(matrixProjection));

    // The plane is already built in world coordinates, so its model matrix is the identity
    setModelView(mat4());
    planeMesh.draw();

    // The ball: unit sphere moved up by 1 m, so it rests on the ground (centre at y = radius)
    setModelView(translate(0.0, 1.0, 0.0));
    sphereMesh.draw();

    // Ask the browser to call render() again before the next repaint (common/webgl-utils.js).
    // Only here, once per frame, otherwise the game would speed up.
    requestAnimFrame(render);
}
