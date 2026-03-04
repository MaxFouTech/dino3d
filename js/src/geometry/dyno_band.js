/**
 * Clawd the Crab - Ducking Animation (8 frames)
 * Flattened pose when holding DOWN key
 */

function clawdBuildDuckFrame(frame) {
  var C = ClawdColors;
  var boxes = [];

  var phase = (frame / 8) * Math.PI * 2;
  var legA = Math.sin(phase) * 0.03;
  var legB = Math.sin(phase + Math.PI) * 0.03;

  // === BODY (flattened) ===
  boxes.push(clawdCreateBox(0, 0.38, 0,      1.15, 0.30, 0.90, C.body));
  boxes.push(clawdCreateBox(0, 0.56, 0,      0.85, 0.10, 0.70, C.shellTop));
  boxes.push(clawdCreateBox(0, 0.22, 0,      0.90, 0.08, 0.70, C.belly));
  boxes.push(clawdCreateBox(0, 0.40, -0.38,  0.60, 0.20, 0.12, C.body));

  // === EYES (retracted, lower) ===
  boxes.push(clawdCreateBox(-0.16, 0.64, -0.32, 0.08, 0.10, 0.08, C.body));
  boxes.push(clawdCreateBox(-0.16, 0.72, -0.34, 0.12, 0.11, 0.12, C.eyeWhite));
  boxes.push(clawdCreateBox(-0.16, 0.72, -0.41, 0.06, 0.07, 0.03, C.pupil));
  boxes.push(clawdCreateBox( 0.16, 0.64, -0.32, 0.08, 0.10, 0.08, C.body));
  boxes.push(clawdCreateBox( 0.16, 0.72, -0.34, 0.12, 0.11, 0.12, C.eyeWhite));
  boxes.push(clawdCreateBox( 0.16, 0.72, -0.41, 0.06, 0.07, 0.03, C.pupil));

  // === MOUTH ===
  boxes.push(clawdCreateBox(0, 0.28, -0.44, 0.18, 0.06, 0.04, C.mouth));

  // === CLAWS (lowered, spread wide) ===
  boxes.push(clawdCreateBox(-0.62, 0.40, 0,   0.20, 0.15, 0.18, C.claw));
  boxes.push(clawdCreateBox(-0.75, 0.50, 0,   0.15, 0.22, 0.15, C.claw));
  boxes.push(clawdCreateBox(-0.82, 0.66, -0.02, 0.20, 0.07, 0.12, C.claw));
  boxes.push(clawdCreateBox(-0.82, 0.56, -0.02, 0.20, 0.07, 0.12, C.claw));

  boxes.push(clawdCreateBox( 0.62, 0.40, 0,   0.20, 0.15, 0.18, C.claw));
  boxes.push(clawdCreateBox( 0.75, 0.50, 0,   0.15, 0.22, 0.15, C.claw));
  boxes.push(clawdCreateBox( 0.82, 0.66, -0.02, 0.20, 0.07, 0.12, C.claw));
  boxes.push(clawdCreateBox( 0.82, 0.56, -0.02, 0.20, 0.07, 0.12, C.claw));

  // === LEGS (spread wider, shorter) ===
  // Front pair
  boxes.push(clawdCreateBox(-0.45, 0.18 + legA, -0.28, 0.16, 0.14, 0.10, C.leg));
  boxes.push(clawdCreateBox(-0.54, 0.07 + legA, -0.28, 0.10, 0.12, 0.10, C.leg));
  boxes.push(clawdCreateBox( 0.45, 0.18 + legA, -0.28, 0.16, 0.14, 0.10, C.leg));
  boxes.push(clawdCreateBox( 0.54, 0.07 + legA, -0.28, 0.10, 0.12, 0.10, C.leg));

  // Middle pair
  boxes.push(clawdCreateBox(-0.50, 0.18 + legB, 0,     0.16, 0.14, 0.10, C.leg));
  boxes.push(clawdCreateBox(-0.58, 0.07 + legB, 0,     0.10, 0.12, 0.10, C.leg));
  boxes.push(clawdCreateBox( 0.50, 0.18 + legB, 0,     0.16, 0.14, 0.10, C.leg));
  boxes.push(clawdCreateBox( 0.58, 0.07 + legB, 0,     0.10, 0.12, 0.10, C.leg));

  // Back pair
  boxes.push(clawdCreateBox(-0.45, 0.18 + legA, 0.28,  0.16, 0.14, 0.10, C.leg));
  boxes.push(clawdCreateBox(-0.54, 0.07 + legA, 0.28,  0.10, 0.12, 0.10, C.leg));
  boxes.push(clawdCreateBox( 0.45, 0.18 + legA, 0.28,  0.16, 0.14, 0.10, C.leg));
  boxes.push(clawdCreateBox( 0.54, 0.07 + legA, 0.28,  0.10, 0.12, 0.10, C.leg));

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
