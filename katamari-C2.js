/*
    CSCI 2408 Computer Graphics Fall 2026
    (c)2026 by Team C2 (Group 10): Lala Huseynova, Khavar Jabbarli, Gunel Zeynalzada, Fikrat Rustamli
    Submitted in partial fulfillment of the requirements of the course.

    katamari-C2.js: main file. Kept thin on purpose: it creates the objects,
    connects them and runs the render loop. The real work is in src/ (core/, graphics/, scene/).

    Generative AI: Claude (Claude Code), 25 Nov 2026, helped write this file.
    See README Developer Log, 25 November 2026.
*/

var canvas;
var renderer;   // Renderer: WebGL context, shaders, meshes
var world;      // World: ground plane + random spheres (M1)

window.onload = init;

function init() {
    canvas = document.getElementById("gl-canvas");

    renderer = new Renderer(canvas);
    if (!renderer.gl) return;

    world = new World();
    generateWorld();

    // Debug controls under the canvas (only for checking M1).
    document.getElementById("show-edges").onchange = (e) => {
        renderer.showEdges = e.target.checked;
    };
    document.getElementById("regenerate").onclick = generateWorld;

    // requestAnimFrame (common/webgl-utils.js) calls render about 60x per second.
    requestAnimFrame(render);
}

/** Places a new random set of non-intersecting spheres and checks the result. */
function generateWorld() {
    world.placeSpheres(SPHERE_COUNT, SPHERE_MIN_R, SPHERE_MAX_R, PLACEMENT_R,
                       SPHERE_GAP, SPAWN_CLEAR_R, MAX_PLACEMENT_TRIES);
    console.log(`World: ${world.spheres.length} spheres placed, ` +
                `${world.countOverlaps()} intersecting pairs (must be 0).`);
}

/**
 * TEMPORARY placeholder katamari: a teal sphere of radius 1 m resting at the
 * start point (the origin), drawn with the shared sphere mesh. It only shows
 * where the player will be. Member 2 replaces it with the Player class, so
 * delete it when Player.js is merged.
 */
const TEMP_PLAYER_R = 1;                              // radius (m)
const TEMP_PLAYER_COLOR = vec4(0.24, 0.49, 0.56, 1.0); // teal, like the brief's sketch

/**
 * TEMPORARY fixed third-person camera, so the M1 scene can be seen from
 * roughly where the real camera will be: low and behind the ball, looking
 * forward along -Z. With these numbers the ball sits at the bottom centre
 * (about 62-89 % down the screen) and the horizon near the middle (49 %).
 * Member 3 replaces this with the Camera class (M2: follows the ball,
 * mouse orbit), so delete this function when Camera.js is merged.
 */
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

/** One frame: draw the world and the placeholder ball from the camera. */
function render() {
    // Follow the window size first: the projection below uses its aspect ratio.
    renderer.resize();
    const cam = temporaryThirdPersonCamera();
    renderer.render(world, cam.view, cam.projection);

    // Placeholder katamari, resting on the ground: centre at y = radius.
    const r = TEMP_PLAYER_R;
    renderer.drawMesh(renderer.sphereMesh,
                      mult(translate(0, r, 0), scalem(r, r, r)), TEMP_PLAYER_COLOR);

    requestAnimFrame(render);
}
