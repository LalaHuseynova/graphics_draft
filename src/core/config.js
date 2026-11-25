/*
 CSCI 2408 Computer Graphics Fall 2026
 Team C2: Lala Huseynova, Khavar Jabbarli, Gunel Zeynalzada, Fikrat Rustamli
 
 config.js - Settings used throughout the game.
 Keeping them here make it easier to adjust the game settings.
 
 Coordinate system:
 - Y is up, and the ground is at y = 0.
 - Distances are in metres.
 - MV.js rotation angles are in degrees.
 */


// World size

// Radius of the game world. Also used for the sky sphere
const WORLD_R = 60;

// Half the width and length of the ground plane.
const PLANE_HALF_SIZE = 50;

// Ground tile size and texture repeat distance in metres
const TILE_SIZE = 5;
const SPHERE_COUNT = 45;

// Smaller spheres can be collected first as the player grows.
const SPHERE_MIN_R = 0.3;
const SPHERE_MAX_R = 2.0;

// Radius of the area where we place the spheres.
const PLACEMENT_R = 42;

// Minimum gap between sphere surfaces
const SPHERE_GAP = 0.2;

// We keep the starting area clear for both the player and camera
const SPAWN_CLEAR_R = 12;

// Limit placement attempts to avoid an endless loop
const MAX_PLACEMENT_TRIES = 5000;

// Sphere mesh

// More divisions make the sphere smoother but require more triangles.
const SPHERE_LAT_BANDS = 16;
const SPHERE_LON_BANDS = 24;
