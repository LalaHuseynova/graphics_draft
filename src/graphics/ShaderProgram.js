/*
CSCI 2408 Computer Graphics Fall 2026
Team C2: Lala Huseynova, Khavar Jabbarli, Gunel Zeynalzada, Fikrat Rustamli

ShaderProgram.js - handles shader initialization and stores attribute and uniform locations.
Reference: initShaders.js (Angel & Shreiner).
*/

class ShaderProgram {
    constructor(gl, vertexId, fragmentId, attribNames, uniformNames) {
        this.gl = gl;
        this.program = initShaders(gl, vertexId, fragmentId);

        // We store attribute locations once so we don't have to look them up every frame.
        // And we get -1 when attribute isn't active in shader.
        this.attrib = {};
        for (const name of attribNames) {
            this.attrib[name] = gl.getAttribLocation(this.program, name);
        }

        // Same for uniforms, but here we get null if the uniform is not used.
        this.uniform = {};
        for (const name of uniformNames) {
            this.uniform[name] = gl.getUniformLocation(this.program, name);
        }
    }

    // use this shader program for the next draw calls.
    use() {
        this.gl.useProgram(this.program);
    }
}
