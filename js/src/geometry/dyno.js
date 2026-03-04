/**
 * Clawd the Crab - Procedural 3D Model
 * Replaces the T-Rex with Claude Code's crab mascot
 */

// === Shared crab model utilities (used by dyno.js, dyno_band.js, dyno_wow.js) ===

var ClawdColors = {
  body:     {r: 0.91, g: 0.48, b: 0.21},  // #E87B35 warm orange
  shellTop: {r: 0.98, g: 0.58, b: 0.28},  // lighter shell highlight
  belly:    {r: 0.96, g: 0.65, b: 0.40},  // light orange underbelly
  claw:     {r: 0.80, g: 0.35, b: 0.12},  // darker orange claws
  leg:      {r: 0.75, g: 0.33, b: 0.09},  // dark orange legs
  eyeWhite: {r: 1.0,  g: 1.0,  b: 1.0},  // white
  pupil:    {r: 0.05, g: 0.05, b: 0.05},  // near black
  mouth:    {r: 0.60, g: 0.25, b: 0.08}   // dark mouth area
};

function clawdCreateBox(cx, cy, cz, w, h, d, color) {
  var geo = new THREE.BoxBufferGeometry(w, h, d);
  geo.translate(cx, cy, cz);
  return {geometry: geo, color: color};
}

function clawdMergeBoxes(boxes) {
  var vertsPerBox = 24; // BoxGeometry: 4 verts * 6 faces
  var idxPerBox = 36;   // BoxGeometry: 2 tris * 3 idx * 6 faces
  var totalVerts = boxes.length * vertsPerBox;
  var totalIdx = boxes.length * idxPerBox;

  var positions = new Float32Array(totalVerts * 3);
  var normals = new Float32Array(totalVerts * 3);
  var colors = new Float32Array(totalVerts * 3);
  var indices = totalVerts > 65535 ? new Uint32Array(totalIdx) : new Uint16Array(totalIdx);

  var vertOffset = 0;
  var idxOffset = 0;

  for (var b = 0; b < boxes.length; b++) {
    var geo = boxes[b].geometry;
    var c = boxes[b].color;
    var pos = geo.attributes.position.array;
    var norm = geo.attributes.normal.array;
    var idx = geo.index.array;

    positions.set(pos, vertOffset * 3);
    normals.set(norm, vertOffset * 3);

    for (var i = 0; i < geo.attributes.position.count; i++) {
      colors[(vertOffset + i) * 3]     = c.r;
      colors[(vertOffset + i) * 3 + 1] = c.g;
      colors[(vertOffset + i) * 3 + 2] = c.b;
    }

    for (var j = 0; j < idx.length; j++) {
      indices[idxOffset + j] = idx[j] + vertOffset;
    }

    vertOffset += geo.attributes.position.count;
    idxOffset += idx.length;
  }

  var merged = new THREE.BufferGeometry();
  merged.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  merged.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
  merged.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  merged.setIndex(new THREE.BufferAttribute(indices, 1));

  return merged;
}

function clawdBuildRunFrame(frame) {
  var C = ClawdColors;
  var boxes = [];

  // Animation phases
  var phase = (frame / 8) * Math.PI * 2;
  var legA = Math.sin(phase) * 0.04;           // front+back legs
  var legB = Math.sin(phase + Math.PI) * 0.04;  // middle legs (opposite)
  var clawBob = Math.sin(phase) * 0.025;        // gentle claw bobbing
  var bodyBob = Math.sin(phase * 2) * 0.01;     // subtle body bounce

  // === BODY ===
  // Main carapace - wide dome
  boxes.push(clawdCreateBox(0, 0.70 + bodyBob, 0,    1.0, 0.50, 0.80, C.body));
  // Upper shell ridge
  boxes.push(clawdCreateBox(0, 0.98 + bodyBob, 0,    0.70, 0.15, 0.55, C.shellTop));
  // Underbelly
  boxes.push(clawdCreateBox(0, 0.42 + bodyBob, 0,    0.75, 0.12, 0.55, C.belly));
  // Front face plate
  boxes.push(clawdCreateBox(0, 0.72 + bodyBob, -0.32, 0.55, 0.30, 0.12, C.body));

  // === EYES ===
  // Left eye stalk
  boxes.push(clawdCreateBox(-0.16, 1.10 + bodyBob, -0.28, 0.08, 0.18, 0.08, C.body));
  // Left eyeball
  boxes.push(clawdCreateBox(-0.16, 1.24 + bodyBob, -0.30, 0.13, 0.13, 0.13, C.eyeWhite));
  // Left pupil
  boxes.push(clawdCreateBox(-0.16, 1.24 + bodyBob, -0.38, 0.07, 0.08, 0.03, C.pupil));
  // Right eye stalk
  boxes.push(clawdCreateBox(0.16, 1.10 + bodyBob, -0.28, 0.08, 0.18, 0.08, C.body));
  // Right eyeball
  boxes.push(clawdCreateBox(0.16, 1.24 + bodyBob, -0.30, 0.13, 0.13, 0.13, C.eyeWhite));
  // Right pupil
  boxes.push(clawdCreateBox(0.16, 1.24 + bodyBob, -0.38, 0.07, 0.08, 0.03, C.pupil));

  // === MOUTH ===
  boxes.push(clawdCreateBox(0, 0.55 + bodyBob, -0.38, 0.18, 0.06, 0.04, C.mouth));

  // === LEFT CLAW ===
  // Shoulder joint
  boxes.push(clawdCreateBox(-0.55, 0.75 + bodyBob, 0,   0.20, 0.18, 0.18, C.claw));
  // Upper arm (vertical)
  boxes.push(clawdCreateBox(-0.65, 1.00 + clawBob, 0,   0.15, 0.38, 0.15, C.claw));
  // Upper pincer
  boxes.push(clawdCreateBox(-0.73, 1.26 + clawBob, -0.02, 0.22, 0.08, 0.12, C.claw));
  // Lower pincer
  boxes.push(clawdCreateBox(-0.73, 1.14 + clawBob, -0.02, 0.22, 0.08, 0.12, C.claw));

  // === RIGHT CLAW ===
  boxes.push(clawdCreateBox(0.55, 0.75 + bodyBob, 0,   0.20, 0.18, 0.18, C.claw));
  boxes.push(clawdCreateBox(0.65, 1.00 + clawBob, 0,   0.15, 0.38, 0.15, C.claw));
  boxes.push(clawdCreateBox(0.73, 1.26 + clawBob, -0.02, 0.22, 0.08, 0.12, C.claw));
  boxes.push(clawdCreateBox(0.73, 1.14 + clawBob, -0.02, 0.22, 0.08, 0.12, C.claw));

  // === LEGS (3 pairs) ===
  // Front pair (legA phase)
  boxes.push(clawdCreateBox(-0.38, 0.30 + legA, -0.25,  0.16, 0.18, 0.10, C.leg));
  boxes.push(clawdCreateBox(-0.46, 0.12 + legA, -0.25,  0.10, 0.18, 0.10, C.leg));
  boxes.push(clawdCreateBox( 0.38, 0.30 + legA, -0.25,  0.16, 0.18, 0.10, C.leg));
  boxes.push(clawdCreateBox( 0.46, 0.12 + legA, -0.25,  0.10, 0.18, 0.10, C.leg));

  // Middle pair (legB phase - opposite)
  boxes.push(clawdCreateBox(-0.42, 0.30 + legB, 0,      0.16, 0.18, 0.10, C.leg));
  boxes.push(clawdCreateBox(-0.50, 0.12 + legB, 0,      0.10, 0.18, 0.10, C.leg));
  boxes.push(clawdCreateBox( 0.42, 0.30 + legB, 0,      0.16, 0.18, 0.10, C.leg));
  boxes.push(clawdCreateBox( 0.50, 0.12 + legB, 0,      0.10, 0.18, 0.10, C.leg));

  // Back pair (legA phase - same as front)
  boxes.push(clawdCreateBox(-0.38, 0.30 + legA, 0.25,   0.16, 0.18, 0.10, C.leg));
  boxes.push(clawdCreateBox(-0.46, 0.12 + legA, 0.25,   0.10, 0.18, 0.10, C.leg));
  boxes.push(clawdCreateBox( 0.38, 0.30 + legA, 0.25,   0.16, 0.18, 0.10, C.leg));
  boxes.push(clawdCreateBox( 0.46, 0.12 + legA, 0.25,   0.10, 0.18, 0.10, C.leg));

  return clawdMergeBoxes(boxes);
}

// === LOADER ===
load_manager.set_loader('dyno', ['ground'], function() {
  var frames = [];

  for (var i = 0; i <= 7; i++) {
    var geometry = clawdBuildRunFrame(i);
    var material = new THREE.MeshLambertMaterial({vertexColors: THREE.VertexColors});
    var mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    frames[i] = mesh;
  }

  load_manager.set_mesh('dyno', frames);
  load_manager.set_status('dyno', true);
  player.setPlayerFrames(load_manager.get_vox('dyno'));
});
