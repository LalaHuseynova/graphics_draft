/*
    CSCI 2408 Computer Graphics Fall 2026
    (c)2026 by Team C2 (Group 10): Lala Huseynova, Khavar Jabbarli, Gunel Zeynalzada, Fikrat Rustamli
    Submitted in partial fulfillment of the requirements of the course.

    config.js: every tunable number of the game lives here, so balancing the
    game never means hunting through the classes.
    Owner: Member 3 (camera & world boundary). Member 1 added the scene values
    below for Minimum Requirement 1; Member 3 adds camera and speed values.

    Shared conventions (from the team plan):
      - Y is up, the ground is the plane y = 0, units are metres.
      - Angles passed to MV.js are in degrees.
*/

// ---------------------------------------------------------------------------
// World size
// ---------------------------------------------------------------------------

// Radius of the whole playable world (m). The skybox (A4) will be a sphere of
// this radius, and the camera's far plane is based on it.
const WORLD_R = 60;

// Half the side length of the square ground plane (m). The plan says to keep
// it <= WORLD_R so the plane never pokes through the skybox dome.
const PLANE_HALF_SIZE = 50;

// Size of one ground tile (m). Used for the plane's texture coordinates so a
// texture repeats every TILE_SIZE metres (A3). Also the grid line spacing now.
const TILE_SIZE = 5;

// ---------------------------------------------------------------------------
// Random spheres (Minimum Requirement 1)
// ---------------------------------------------------------------------------

// How many spheres the world tries to place on the plane.
const SPHERE_COUNT = 45;

// Each sphere gets a random radius in [SPHERE_MIN_R, SPHERE_MAX_R] (m).
// A spread of sizes lets the katamari eat small ones first and big ones later.
// The katamari starts with radius 1 m, so spheres range from about a third
// of its size (eat at once) to twice its size (bounce off until it grows).
// 2.5 m was too big: such spheres filled the whole screen when close.
const SPHERE_MIN_R = 0.3;
const SPHERE_MAX_R = 2.0;

// Spheres are scattered inside a disc of this radius around the origin (m).
// A disc (not the full square) keeps every sphere inside the round skybox.
const PLACEMENT_R = 42;

// Minimum empty space between the surfaces of two spheres (m), so no two
// spheres touch, not just "do not intersect".
const SPHERE_GAP = 0.2;

// Radius of an empty circle around the origin (m) where no sphere is placed.
// The player's katamari starts at the origin, so it must not spawn inside one,
// AND the camera starts 9 m behind it: with only 4 m a sphere could be placed
// around the camera and fill the whole screen. 12 m = camera distance 9 m +
// a 3 m margin, so the start view is always clear (still fits all 45 spheres).
const SPAWN_CLEAR_R = 12;

// Safety limit for rejection sampling: how many random positions we try in
// total before giving up (prevents an endless loop if the plane is too full).
const MAX_PLACEMENT_TRIES = 5000;

// ---------------------------------------------------------------------------
// Sphere mesh (the polyhedron that approximates every sphere)
// ---------------------------------------------------------------------------

// Number of horizontal rings (latitude bands) and vertical slices (longitude
// bands) of the sphere polyhedron. More bands = rounder sphere, more triangles.
// 16 x 24 gives 768 triangles: round enough, but facets are still visible.
const SPHERE_LAT_BANDS = 16;
const SPHERE_LON_BANDS = 24;
