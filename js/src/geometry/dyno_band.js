/**
 * Clawd the Crab - Ducking Animation (8 frames)
 * Flattened pose when holding DOWN key
 * Based on STL geometry, squished vertically to ~60%
 */

function clawdBuildDuckFrame(frame) {
  var C = ClawdColors;
  var boxes = [];

  var phase = (frame / 8) * Math.PI * 2;
  var clawBob = Math.sin(phase) * 0.015;

  // Ducking: compress Z (height) to ~60%, keeping X/Y same
  // Original STL Z range: -6 to 90 (96 units)
  // Ducked: -6 to 51.6 (57.6 units) → multiply Z by 0.6

  // === BODY (flattened carapace) ===
  boxes.push(clawdSTLBox(-18, -48, 8,  9, 48, 58, C.body, 0));
  // Eyes
  boxes.push(clawdSTLBox(5, -31, 35, 13, -24, 48, C.pupil, 0));
  boxes.push(clawdSTLBox(5,  24, 35, 13,  31, 48, C.pupil, 0));

  // === LEGS (tucked under when ducking) ===
  var legSwing = Math.sin((frame / 8) * Math.PI * 2) * 3;
  boxes.push(clawdSTLBox(-18, -46, -3 + legSwing, -6, -37, 8 + legSwing, C.body, 0));
  boxes.push(clawdSTLBox(-18,  14, -3 + legSwing, -6,  23, 8 + legSwing, C.body, 0));
  boxes.push(clawdSTLBox( -6, -22, -3 - legSwing,  6, -13, 8 - legSwing, C.body, 0));
  boxes.push(clawdSTLBox( -6,  31, -3 - legSwing,  6,  40, 8 - legSwing, C.body, 0));

  // === CLAWS (lower, spread wider) ===
  boxes.push(clawdSTLBox(-11, -70, 22, 1, -48, 30, C.claw, clawBob));
  boxes.push(clawdSTLBox(-11, -70, 30, 1, -48, 39, C.claw, clawBob));
  boxes.push(clawdSTLBox(-11,  48, 22, 1,  70, 30, C.claw, clawBob));
  boxes.push(clawdSTLBox(-11,  48, 30, 1,  70, 39, C.claw, clawBob));

  return clawdMergeBoxes(boxes);
}

load_manager.set_loader('dyno_band', ['dyno'], function() {
  var frames = [];

  for (var i = 0; i <= 7; i++) {
    var geometry = clawdBuildDuckFrame(i);
    var material = new THREE.MeshLambertMaterial({vertexColors: THREE.VertexColors});
    var mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    frames[i] = mesh;
  }

  load_manager.set_mesh('dyno_band', frames);
  load_manager.set_status('dyno_band', true);
  player.setPlayerFrames(frames, true);
});
