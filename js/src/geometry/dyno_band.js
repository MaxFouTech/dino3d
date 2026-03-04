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

  // === BODY (flattened carapace, uniform color) ===
  boxes.push(clawdSTLBox(-18, -48, 8,  9, 48, 58, C.body, 0));
  // Claw tip protrusions
  boxes.push(clawdSTLBox(-18, -36, 43, 15, -24, 50, C.claw, 0));
  boxes.push(clawdSTLBox(-18,  24, 43, 15,  36, 50, C.claw, 0));

  // === EYES (black, protruding from front face) ===
  boxes.push(clawdSTLBox(-30, -30, 22, -18, -12, 36, C.pupil, 0));
  boxes.push(clawdSTLBox(-30,  12, 22, -18,  30, 36, C.pupil, 0));

  // === LEGS (orange, tucked under when ducking) ===
  var legSwing = Math.sin((frame / 8) * Math.PI * 2) * 3;
  boxes.push(clawdSTLBox(-18, -48, -6 + legSwing, -6, -36, 8 + legSwing, C.body, 0));
  boxes.push(clawdSTLBox(-18,  12, -6 + legSwing, -6,  24, 8 + legSwing, C.body, 0));
  boxes.push(clawdSTLBox( -6, -24, -6 - legSwing,  6, -12, 8 - legSwing, C.body, 0));
  boxes.push(clawdSTLBox( -6,  36, -6 - legSwing,  6,  48, 8 - legSwing, C.body, 0));

  // === CLAWS (lower, spread wider) ===
  boxes.push(clawdSTLBox(-18, -78, 22, -6, -48, 36, C.claw, clawBob));
  boxes.push(clawdSTLBox(-18, -78, 36, -6, -48, 43, C.claw, clawBob));
  boxes.push(clawdSTLBox(-18,  48, 22, -6,  78, 36, C.claw, clawBob));
  boxes.push(clawdSTLBox(-18,  48, 36, -6,  78, 43, C.claw, clawBob));

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
