/**
 * Clawd the Crab - Procedural 3D Model (based on clawd_large.stl)
 * Replaces the T-Rex with Claude Code's crab mascot
 *
 * STL coordinate mapping:
 *   STL X (front=-18, back=15) -> game Z (front is -Z, toward camera after Y rotation)
 *   STL Y (left=-72, right=72) -> game X (left-right)
 *   STL Z (bottom=-6, top=90) -> game Y (height)
 *   Scale: 1.3/96 ≈ 0.01354 per STL unit
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

var CLAWD_SCALE = 1.3 / 96.0; // Scale STL to ~1.3 game units tall

function clawdCreateBox(cx, cy, cz, w, h, d, color) {
  var geo = new THREE.BoxBufferGeometry(w, h, d);
  geo.translate(cx, cy, cz);
  return {geometry: geo, color: color};
}

// Convert STL box bounds to game coordinates
// stl_x: front(-18) to back(15), stl_y: left(-72) to right(72), stl_z: bottom(-6) to top(90)
function clawdSTLBox(x1, y1, z1, x2, y2, z2, color, dyOff) {
  var s = CLAWD_SCALE;
  var dy = dyOff || 0;
  var cx = ((y1 + y2) / 2) * s;
  var cy = ((z1 + z2) / 2 + 6) * s + dy;
  var cz = ((x1 + x2) / 2 + 1.5) * s;  // STL front(-18) → negative Z (toward camera)
  var w = Math.abs(y2 - y1) * s;
  var h = Math.abs(z2 - z1) * s;
  var d = Math.abs(x2 - x1) * s;
  return clawdCreateBox(cx, cy, cz, w, h, d, color);
}

function clawdMergeBoxes(boxes) {
  var vertsPerBox = 24;
  var idxPerBox = 36;
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

// Create a leg box that rotates around the hip (top edge) pivot
function clawdLegBox(x1, y1, z1, x2, y2, z2, color, angle) {
  var s = CLAWD_SCALE;
  var w = Math.abs(y2 - y1) * s;
  var h = Math.abs(z2 - z1) * s;
  var d = Math.abs(x2 - x1) * s;

  var geo = new THREE.BoxBufferGeometry(w, h, d);
  // Place pivot at top of leg (translate so top edge is at y=0)
  geo.translate(0, -h / 2, 0);

  // Rotate around X axis to swing leg backward
  if (angle) {
    var mat = new THREE.Matrix4();
    mat.makeRotationZ(-angle);
    geo.applyMatrix(mat);
  }

  // Move to final position (pivot = top of leg where it meets body)
  var topZ = Math.max(z1, z2);
  geo.translate(
    ((y1 + y2) / 2) * s,
    (topZ + 6) * s,
    ((x1 + x2) / 2 + 1.5) * s
  );

  return {geometry: geo, color: color};
}

function clawdBuildRunFrame(frame) {
  var C = ClawdColors;
  var boxes = [];

  // Animation
  var phase = (frame / 8) * Math.PI * 2;
  var clawBob = Math.sin(phase) * 0.02;
  var bodyBob = Math.sin(phase * 2) * 0.008;
  // Leg animation: alternating pairs rotate from ground (0°) to 90° back
  var legAngleA = (Math.sin(phase) * 0.5 + 0.5) * (Math.PI / 2);
  var legAngleB = (Math.sin(phase + Math.PI) * 0.5 + 0.5) * (Math.PI / 2);

  // === BODY (from STL: merged into one solid block, uniform color) ===
  // Main carapace: STL Y[-48,48] Z[18,90] X[-18,9]
  boxes.push(clawdSTLBox(-18, -48, 18,  9, 48, 90, C.body, bodyBob));
  // Claw tip protrusions (wider at Z[66,78])
  boxes.push(clawdSTLBox(5, -32, 60, 13, -20, 78, C.pupil, bodyBob));
  boxes.push(clawdSTLBox(5,  20, 60, 13,  32, 78, C.pupil, bodyBob));

  // === LEGS (rotating at hip, foot swings from ground to 90° back) ===
  // Front pair (legAngleA)
  boxes.push(clawdLegBox(-18, -48, -6, -6, -36, 18, C.body, legAngleA));
  boxes.push(clawdLegBox(-18,  12, -6, -6,  24, 18, C.body, legAngleA));
  // Inner pair (legAngleB - opposite phase)
  boxes.push(clawdLegBox( -6, -24, -6,  6, -12, 18, C.body, legAngleB));
  boxes.push(clawdLegBox( -6,  36, -6,  6,  48, 18, C.body, legAngleB));

  // === CLAWS (side appendages, 2 stacked boxes per side) ===
  boxes.push(clawdSTLBox(-18, -72, 38, -6, -48, 46, C.claw, clawBob));
  boxes.push(clawdSTLBox(-18, -72, 46, -6, -48, 57, C.claw, clawBob));
  boxes.push(clawdSTLBox(-18,  48, 38, -6,  72, 46, C.claw, clawBob));
  boxes.push(clawdSTLBox(-18,  48, 46, -6,  72, 57, C.claw, clawBob));

  return clawdMergeBoxes(boxes);
}

// Create a claw box that rotates around the body attachment (shoulder) pivot
// isLeft: true for left claw (negative Y side), false for right
// angle: rotation in radians, positive = down, negative = up
function clawdClawBox(x1, y1, z1, x2, y2, z2, color, angle, pivotY, pivotZ) {
  var s = CLAWD_SCALE;
  var w = Math.abs(y2 - y1) * s;
  var h = Math.abs(z2 - z1) * s;
  var d = Math.abs(x2 - x1) * s;

  var centerY = (y1 + y2) / 2;
  var centerZ = (z1 + z2) / 2;
  var centerX = (x1 + x2) / 2;

  var geo = new THREE.BoxBufferGeometry(w, h, d);
  // Translate so pivot is at origin (in game X-Y plane)
  geo.translate((centerY - pivotY) * s, (centerZ - pivotZ) * s, 0);

  if (angle) {
    var mat = new THREE.Matrix4();
    mat.makeRotationZ(angle);
    geo.applyMatrix(mat);
  }

  // Move pivot to world position
  geo.translate(pivotY * s, (pivotZ + 6) * s, (centerX + 1.5) * s);
  return {geometry: geo, color: color};
}

// Build a jump frame with claws rotated by clawAngle (positive = down)
function clawdBuildJumpFrame(clawAngle) {
  var C = ClawdColors;
  var boxes = [];

  boxes.push(clawdSTLBox(-18, -48, 18,  9, 48, 90, C.body, 0));
  boxes.push(clawdSTLBox(5, -32, 60, 13, -20, 78, C.pupil, 0));
  boxes.push(clawdSTLBox(5,  20, 60, 13,  32, 78, C.pupil, 0));

  // Legs tucked
  boxes.push(clawdSTLBox(-18, -48, -6, -6, -36, 18, C.body, 0));
  boxes.push(clawdSTLBox(-18,  12, -6, -6,  24, 18, C.body, 0));
  boxes.push(clawdSTLBox( -6, -24, -6,  6, -12, 18, C.body, 0));
  boxes.push(clawdSTLBox( -6,  36, -6,  6,  48, 18, C.body, 0));

  // Left claw (pivot at Y=-48, Z=47.5) — angle is positive for down
  var pivotZ = 47.5;
  boxes.push(clawdClawBox(-18, -72, 38, -6, -48, 46, C.claw, clawAngle, -48, pivotZ));
  boxes.push(clawdClawBox(-18, -72, 46, -6, -48, 57, C.claw, clawAngle, -48, pivotZ));
  // Right claw (pivot at Y=48, Z=47.5) — angle is negated for right side
  boxes.push(clawdClawBox(-18, 48, 38, -6, 72, 46, C.claw, -clawAngle, 48, pivotZ));
  boxes.push(clawdClawBox(-18, 48, 46, -6, 72, 57, C.claw, -clawAngle, 48, pivotZ));

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

  // Jump frames: arms rotate down when ascending, up when descending
  var jumpFrames = {
    armsDown: clawdBuildJumpFrame(Math.PI / 4),
    armsUp: clawdBuildJumpFrame(-Math.PI / 4)
  };

  load_manager.set_mesh('dyno', frames);
  load_manager.set_status('dyno', true);
  player.setPlayerFrames(load_manager.get_vox('dyno'));
  player.jump_frames = jumpFrames;
});
