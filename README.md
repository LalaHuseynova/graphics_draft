# {Poetic/Project name}
Presented in partial fulfillment of the requirements of the CSCI 2408: Computer Graphics course at [ADA University School of IT and Engineering](https://www.ada.edu.az/site).
|     |     |     |
|:--- |:--- |:--- |
| **Team member** | **Contribution to the project** | **Estimated %** |
| {Student Name 1} | {Description of the work contributed} | {X}% |
| {Student Name 2} | {Description of the work contributed} | {X}% |
| {Student Name 3} | {Description of the work contributed} | {X}% |
| {Student Name 4} | {Description of the work contributed} | {X}% |

{X} November 2026
---
The team started to work on the project.

26 November 2026
---
Reviewed the implementation plan against the assignment PDF and updated it: the perspective projection also changes with the katamari's size (M2), every idea and algorithm we did not invent gets a citation, and the submission steps check the ZIP contents and the README links.
Setup and render loop (branch sphere-mesh): katamari-C2.html and katamari-C2.js have Fall 2026 headers with references and "use strict"; the canvas fills the whole window and follows its size; the shaders are inline (aPosition, aNormal, aTexCoord, uModelView, uProjection); katamari-C2.js has init(), transform() and render() with requestAnimFrame and a time step dt in seconds (capped at 0.05 s). The render loop was first tested with the tetrahedron from the gl-rotation lab, then the tetrahedron was removed. Only common/MV.js, common/initShaders.js and common/webgl-utils.js are used; common/ was not changed. The src/ classes are not used by the plan's structure and were removed from the project (their last version is in commit 3b20915).
Sphere and ground plane (M1, first half): new mesh.js with class Mesh that builds a unit sphere polyhedron (24 x 48 latitude/longitude grid, 6912 vertices with normals and texture coordinates) and a 120 m x 120 m ground plane, loads them into WebGL buffers and draws them. The ball is coloured by its normals until lighting is added. The test camera was tuned so the ball is at the bottom centre; the real third-person camera comes later.
Generative AI: Claude Code (Claude Opus 5.5, Anthropic) was used to review the plan and write the setup, render loop and mesh code. Input: the assignment PDF, our plan, the lab code samples and the starter repository, with the request to check the plan against every requirement and implement them in the lab coding style. Link: {paste the link to the conversation}.

{X} November 2026
---
{Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.}

{X} December 2026
---
{Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.}
