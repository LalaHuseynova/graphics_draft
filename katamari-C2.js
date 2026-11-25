/*
    CSCI 2408 Computer Graphics Fall 2026
    (c)2026 by Team C2 (Group 10): Lala Huseynova, Khavar Jabbarli, Gunel Zeynalzada, Fikrat Rustamli
    Submitted in partial fulfillment of the requirements of the course.
*/

var canvas;
var renderer;   // Renderer: WebGL context, shaders, meshes
var world;      // World: ground plane + random spheres

window.onload = init;

function init() {
    canvas = document.getElementById("gl-canvas");

    renderer = new Renderer(canvas);
    if (!renderer.gl) return;

    world = new World();
    generateWorld();

    // Debug controls under the canvas.
    document.getElementById("show-edges").onchange = (e) => {
        renderer.showEdges = e.target.checked;
    };
    document.getElementById("regenerate").onclick = generateWorld;

    // requestAnimFrame (common/webgl-utils.js) calls render about 60x per second.
    requestAnimFrame(render);
}

// Places a new random set of non-intersecting spheres and checks the result. 
function generateWorld() {
    world.placeSpheres(SPHERE_COUNT, SPHERE_MIN_R, SPHERE_MAX_R, PLACEMENT_R,
                       SPHERE_GAP, SPAWN_CLEAR_R, MAX_PLACEMENT_TRIES);
    console.log(`World: ${world.spheres.length} spheres placed, ` +
                `${world.countOverlaps()} intersecting pairs (must be 0).`);
}


const TEMP_PLAYER_R = 1;  // radius (m)
const TEMP_PLAYER_COLOR = vec4(0.24, 0.49, 0.56, 1.0); // teal, like the brief's sketch


function temporaryThirdPersonCamera() {
    const eye = vec3(0, 3, 9);       // 3 m up and 9 m behind the ball (m)
    const at  = vec3(0, 2.8, -10);   // a point ahead, almost level: wide view
    const up  = vec3(0, 1, 0);       // Y is up
    return {
        view: lookAt(eye, at, up),
        // fovy 45 degrees, canvas aspect, near 0.1 m, far 2.5 * WORLD_R
        projection: perspective(45, canvas.width / canvas.height, 0.1, 2.5 * WORLD_R)
    };
}

// Draw the world and the placeholder ball from the camera. 
function render() {
    // Follow the window size first, the projection below uses its aspect ratio.
    renderer.resize();
    const cam = temporaryThirdPersonCamera();
    renderer.render(world, cam.view, cam.projection);

    // Placeholder katamari, resting on the ground: centre at y = radius.
    const r = TEMP_PLAYER_R;
    renderer.drawMesh(renderer.sphereMesh,
                      mult(translate(0, r, 0), scalem(r, r, r)), TEMP_PLAYER_COLOR);

    requestAnimFrame(render);
}
