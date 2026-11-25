/*
    CSCI 2408 Computer Graphics Fall 2026
    (c)2026 by Team C2 (Group 10): Lala Huseynova, Khavar Jabbarli, Gunel Zeynalzada, Fikrat Rustamli
    Submitted in partial fulfillment of the requirements of the course.

    ShaderProgram.js: a small wrapper around a compiled GLSL program.
    Owner: Member 1 (rendering & light).

    It compiles the shaders with initShaders() from common/initShaders.js
    (Angel & Shreiner) and looks up attribute and uniform locations once, so
    the rest of the code can write  shader.attrib.vPosition  or
    shader.uniform.uModel  instead of calling gl.get...Location every frame.

    Generative AI: Claude (Claude Code), 25 Nov 2026, helped structure this
    class. See README Developer Log, 25 November 2026.
*/

class ShaderProgram {
    /**
     * @param {WebGLRenderingContext} gl  the WebGL context
     * @param {string} vertexId    id of the <script> holding the vertex shader
     * @param {string} fragmentId  id of the <script> holding the fragment shader
     * @param {string[]} attribNames   attribute names used in the shaders
     * @param {string[]} uniformNames  uniform names used in the shaders
     */
    constructor(gl, vertexId, fragmentId, attribNames, uniformNames) {
        this.gl = gl;

        // initShaders compiles + links both shaders and returns the program
        // (or -1 and shows an alert if a shader has a syntax error).
        this.program = initShaders(gl, vertexId, fragmentId);

        // Attribute locations. A location of -1 means the shader does not use
        // that attribute (e.g. vNormal before lighting exists); Mesh skips it.
        this.attrib = {};
        for (const name of attribNames) {
            this.attrib[name] = gl.getAttribLocation(this.program, name);
        }

        // Uniform locations. null means the shader does not use the uniform.
        this.uniform = {};
        for (const name of uniformNames) {
            this.uniform[name] = gl.getUniformLocation(this.program, name);
        }
    }

    /** Makes this program the active one for the following draw calls. */
    use() {
        this.gl.useProgram(this.program);
    }
}
