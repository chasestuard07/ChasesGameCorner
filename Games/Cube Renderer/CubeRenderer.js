'use strict';

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext('2d');

let camZ = 100;
const cameraDirection = { x: 0, y: 0, z: -1};


const cubeSize = 50;


/*                                            Vertices                                            */
function Vertex(x, y, z) {
    //functional coordinates 
    this.x = x;
    this.y = y;
    this.z = z;
};

Vertex.prototype.translate = function(dx, dy, dz) {
    this.x += dx;
    this.y += dy;
    this.z += dz;
}

Vertex.prototype.scale = function(mx, my, mz) {
    this.x = mx * this.x;
    this.y = my * this.y;
    this.z = mz * this.z;
}

Vertex.prototype.rotate = function (rx, ry, rz) {
    let x = this.x;
    let y = this.y;
    let z = this.z;

    // X-axis rotation
    let newY = y * Math.cos(rx) - z * Math.sin(rx);
    let newZ = y * Math.sin(rx) + z * Math.cos(rx);
    y = newY;
    z = newZ;

    // Y-axis rotation
    let newX = x * Math.cos(ry) + z * Math.sin(ry);
    newZ = -x * Math.sin(ry) + z * Math.cos(ry);
    x = newX;
    z = newZ;

    // Z-axis rotation
    newX = x * Math.cos(rz) - y * Math.sin(rz);
    newY = x * Math.sin(rz) + y * Math.cos(rz);
    x = newX;
    y = newY;

    // Update the vertex with rotated coordinates
    this.x = x;
    this.y = y;
    this.z = z;
};


/*                                            Voxels                                            */
function Voxel(id, gridX, gridY, gridZ) {
    this.id = null;
    this.vertices = [];
    this.edges = [];
    this.faces = [];
}

let voxels = [];

createVoxel(0,0,0);



function gameLoop() {
    applyRotations(0.01, 0.001, 0.005);
    drawBackground();
    drawVoxels();
    requestAnimationFrame(gameLoop);
}

gameLoop();


function drawBackground() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'grey';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

/*                                                      VOXEL DRAWING FUNCTIONS                                              */
function drawVoxels () {
    ctx.save();
    
    ctx.translate(canvas.width / 2, canvas.height / 2);

    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'white';

    ctx.beginPath();

    for(let voxel of voxels){
        //quad drawing
        for(let [p1, p2, p3, p4] of voxel.faces){
            let projectedA = projectVertex(voxel.vertices[p1]);
            let projectedB = projectVertex(voxel.vertices[p2]);
            let projectedC = projectVertex(voxel.vertices[p3]);
            let projectedD = projectVertex(voxel.vertices[p4]);

            let normal = calculateNormal(voxel.vertices[p1], voxel.vertices[p2], voxel.vertices[p3]);
            if (!calculateVisible(normal)) continue;

            ctx.moveTo(projectedA[0], projectedA[1]);
            ctx.lineTo(projectedB[0], projectedB[1]);
            ctx.lineTo(projectedC[0], projectedC[1]);
            ctx.lineTo(projectedD[0], projectedD[1]);
            ctx.closePath();
            ctx.fill();
        }

        ctx.strokeStyle = 'black';
        for (let [start, end] of voxel.edges) {
            let vStart = projectVertex(voxel.vertices[start]);
            let vEnd = projectVertex(voxel.vertices[end]);

            ctx.moveTo(vStart[0], vStart[1]);
            ctx.lineTo(vEnd[0], vEnd[1]);
        }
    }

    ctx.stroke();
    ctx.restore();
}

function projectVertex (v) {
    let scale = camZ / (v.z + camZ);
    let x = v.x * scale;
    let y = v.y * scale;

    return [x, y];
}

function calculateNormal (v0, v1, v2) {
    let a = {
        x: v1.x - v0.x,
        y: v1.y - v0.y,
        z: v1.z - v0.z
    };

    let b = {
        x: v2.x - v0.x,
        y: v2.y - v0.y,
        z: v2.z - v0.z
    };

    return {
        x: a.y * b.z - a.z * b.y,
        y: a.z * b.x - a.x * b.z,
        z: a.x * b.y - a.y * b.x
    };
}

function calculateVisible (normal) {
    let dot = normal.x * cameraDirection.x +
              normal.y * cameraDirection.y +
              normal.z * cameraDirection.z;
    return dot < 0; // facing toward camera
}


/*                                                      TRANSFORMATION FUNCTIONS                                             */
function applyTranslations(x, y, z) {
    for (let voxel of voxels) {
        for(let vertex of voxel.vertices){
            vertex.translate(x, y, z);
        }
    }
}

function applyScales(x, y, z){
    for (let voxel of voxels) {
        for(let vertex of voxel.vertices){
            vertex.scale(x, y, z);
        }
    }
}

function applyRotations(x, y, z){
    for (let voxel of voxels) {
        for(let vertex of voxel.vertices){
            vertex.rotate(x, y, z);
        }
    }
}


/*                                                      VOXEL CREATION FUNCTIONS                                             */
function createVoxel(gridX, gridY, gridZ) {
    let voxel = new Voxel(voxels.length, gridX, gridY, gridZ);

    voxel.edges.push(
    [0, 1], [1, 3], [3, 2], [2, 0], // right face edges
    [4, 5], [5, 7], [7, 6], [6, 4], // left face edges
    [0, 4], [1, 5], [2, 6], [3, 7]  // connecting edges
    );

    
    voxel.vertices.push( 
        new Vertex(2*gridX*cubeSize + cubeSize, 2*gridY*cubeSize + cubeSize, 2*gridZ*cubeSize + cubeSize), //top front right
        new Vertex(2*gridX*cubeSize + cubeSize, 2*gridY*cubeSize + cubeSize, 2*gridZ*cubeSize - cubeSize), //top back right
        new Vertex(2*gridX*cubeSize + cubeSize, 2*gridY*cubeSize - cubeSize, 2*gridZ*cubeSize + cubeSize), //bottom front right
        new Vertex(2*gridX*cubeSize + cubeSize, 2*gridY*cubeSize - cubeSize, 2*gridZ*cubeSize - cubeSize), //bottom back right
        new Vertex(2*gridX*cubeSize - cubeSize, 2*gridY*cubeSize + cubeSize, 2*gridZ*cubeSize + cubeSize), //top front left
        new Vertex(2*gridX*cubeSize - cubeSize, 2*gridY*cubeSize + cubeSize, 2*gridZ*cubeSize - cubeSize), //top back left
        new Vertex(2*gridX*cubeSize - cubeSize, 2*gridY*cubeSize - cubeSize, 2*gridZ*cubeSize + cubeSize), //bottom front left
        new Vertex(2*gridX*cubeSize - cubeSize, 2*gridY*cubeSize - cubeSize, 2*gridZ*cubeSize - cubeSize) //bottom back left
    );


    voxel.faces.push(
        [0, 2, 6, 4], // front
        [1, 5, 7, 3], // back
        [0, 4, 5, 1], // top
        [2, 3, 7, 6], // bottom
        [0, 1, 3, 2], // right
        [4, 6, 7, 5]  // left
    );

    voxels.push(voxel);
}