# {Poetic/Project name}
Presented in partial fulfillment of the requirements of the CSCI 2408: Computer Graphics course at [ADA University School of IT and Engineering](https://www.ada.edu.az/site).
|     |     |     |
|:--- |:--- |:--- |
| **Team member** | **Contribution to the project** | **Estimated %** |
| {Student Name 1} | {Description of the work contributed} | {X}% |
| {Student Name 2} | {Description of the work contributed} | {X}% |
| {Student Name 3} | {Description of the work contributed} | {X}% |
| {Student Name 4} | {Description of the work contributed} | {X}% |

25 November 2026
25 November 2026
---
We discussed how we would organize our work as a team and agreed to aim for at least two meaningful commits each working day. We also agreed to stay in regular contact, share responsibilities, and help each other understand and solve problems whenever any of us faces difficulties.

26 November 2026
---
We watched the Katamari Damacy gameplay together and discussed how we could implement the main game mechanics in WebGL.

Lala renamed the main HTML and JavaScript files according to our team name (C2) and worked on the initial HTML setup. She adjusted the canvas to fill the browser window,  and set up the vertex and fragment shaders. For now, we use normals to colour the objects and check their appearance before adding lighting.

27 November
---
Khavar set up the WebGL scene using the existing shaders. She enabled depth testing so closer surfaces appear in front. She also made the canvas and viewport resize with the browser window. She used the mesh methods to create the sphere and ground plane, then uploaded both meshes to the GPU. She placed a fixed perspective camera behind and above the sphere. She raised the sphere by one radius so it rests on the ground. The render loop sends the matrices to the shader and draws both meshes each frame.

Gunel implemented the `Mesh` class in `mesh.js`. She created the methods for generating sphere and ground plane geometry. For the sphere, she used stacks and slices to divide its surface into triangles. She also defined the vertex positions, normal vectors, and texture coordinates for both meshes. Additionally, she implemented the GPU buffer initialization and the drawing method to transfer the mesh data to the GPU and render the geometry using WebGL.

28 November
---
Initially, we planned to create a separate branch for each feature and merge it into `main` once completed. While the initial WebGL work was being done on the `sphere-mesh` branch, we continued updating `README.md` on `main`, since the Developer Log is shared across the entire team and covers everyone's daily progress, regardless of which branch they work on. The work on `sphere-mesh` included `katamari-C2.html`, `katamari-C2.js`, and `mesh.js`. We have now successfully merged that branch into `main`. After discussing our workflow, we decided to continue working directly on `main` for now, as our changes are not interfering with one another. We can introduce separate feature branches later if the need arises.<br>
*Link of AI chat where the branch marging and deleting decision was discussed*: https://chatgpt.com/share/6b0b010e-e5c8-83ed-89c2-8585015f3b38 

Khavar created sphere.js for the random balls used by placeSpheres() in the kamatari-C2.js. The constructor(position, radius) saves a ball’s center and size. getModelMatrix() scales the shared unit sphere to that radius and moves it to the saved position. intersects(otherPosition, otherRadius) finds the distance between two centers and compares it with the sum of their radii, so placeSpheres() can reject overlapping balls. draw(modelMatrix) draws one ball using the shared sphereMesh. It uses the ball’s saved position and radius unless a different matrix is provided.<br>
*Link of AI chat for sphere.js where methods, functions, distance calculations are discussed and partial codes're reviewed*: https://chatgpt.com/share/6b0b1640-2d90-83ed-b3cc-11d226452f01



{X} November 2026
---
{Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.}

{X} December 2026
---
{Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.}
