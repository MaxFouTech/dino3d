/**
 * Clawd the Crab - Death Frames
 * "wow" = standing death, "wow-down" = ducking death
 */

function clawdBuildDeathFrame(isDucking) {
  var C = ClawdColors;
  var boxes = [];

  if (!isDucking) {
    // === STANDING DEATH: knocked back, claws up in surprise ===

    // Body (tilted back slightly - shift top back, bottom forward)
    boxes.push(clawdCreateBox(0, 0.68, 0.05,   1.0, 0.50, 0.80, C.body));
    boxes.push(clawdCreateBox(0, 0.96, 0.08,   0.70, 0.15, 0.55, C.shellTop));
    boxes.push(clawdCreateBox(0, 0.40, 0.02,   0.75, 0.12, 0.55, C.belly));
    boxes.push(clawdCreateBox(0, 0.70, -0.28,  0.55, 0.30, 0.12, C.body));

    // Eyes (wide, surprised - larger eyeballs, pupils up)
    boxes.push(clawdCreateBox(-0.18, 1.10, -0.25, 0.08, 0.20, 0.08, C.body));
    boxes.push(clawdCreateBox(-0.18, 1.26, -0.28, 0.15, 0.15, 0.15, C.eyeWhite));
    boxes.push(clawdCreateBox(-0.18, 1.28, -0.37, 0.06, 0.06, 0.03, C.pupil));
    boxes.push(clawdCreateBox( 0.18, 1.10, -0.25, 0.08, 0.20, 0.08, C.body));
    boxes.push(clawdCreateBox( 0.18, 1.26, -0.28, 0.15, 0.15, 0.15, C.eyeWhite));
    boxes.push(clawdCreateBox( 0.18, 1.28, -0.37, 0.06, 0.06, 0.03, C.pupil));

    // Mouth (open wide - surprised)
    boxes.push(clawdCreateBox(0, 0.52, -0.38, 0.22, 0.10, 0.06, C.mouth));

    // Claws (raised high, spread in surprise)
    boxes.push(clawdCreateBox(-0.60, 0.75, 0,    0.20, 0.18, 0.18, C.claw));
    boxes.push(clawdCreateBox(-0.72, 1.10, 0,    0.15, 0.48, 0.15, C.claw));
    boxes.push(clawdCreateBox(-0.80, 1.42, -0.02, 0.24, 0.09, 0.13, C.claw));
    boxes.push(clawdCreateBox(-0.80, 1.30, -0.02, 0.24, 0.09, 0.13, C.claw));

    boxes.push(clawdCreateBox( 0.60, 0.75, 0,    0.20, 0.18, 0.18, C.claw));
    boxes.push(clawdCreateBox( 0.72, 1.10, 0,    0.15, 0.48, 0.15, C.claw));
    boxes.push(clawdCreateBox( 0.80, 1.42, -0.02, 0.24, 0.09, 0.13, C.claw));
    boxes.push(clawdCreateBox( 0.80, 1.30, -0.02, 0.24, 0.09, 0.13, C.claw));

    // Legs (splayed out, limp)
    boxes.push(clawdCreateBox(-0.40, 0.28, -0.28, 0.16, 0.16, 0.10, C.leg));
    boxes.push(clawdCreateBox(-0.50, 0.12, -0.32, 0.10, 0.16, 0.10, C.leg));
    boxes.push(clawdCreateBox( 0.40, 0.28, -0.28, 0.16, 0.16, 0.10, C.leg));
    boxes.push(clawdCreateBox( 0.50, 0.12, -0.32, 0.10, 0.16, 0.10, C.leg));

    boxes.push(clawdCreateBox(-0.45, 0.28, 0,     0.16, 0.16, 0.10, C.leg));
    boxes.push(clawdCreateBox(-0.55, 0.12, 0,     0.10, 0.16, 0.10, C.leg));
    boxes.push(clawdCreateBox( 0.45, 0.28, 0,     0.16, 0.16, 0.10, C.leg));
    boxes.push(clawdCreateBox( 0.55, 0.12, 0,     0.10, 0.16, 0.10, C.leg));

    boxes.push(clawdCreateBox(-0.40, 0.28, 0.28,  0.16, 0.16, 0.10, C.leg));
    boxes.push(clawdCreateBox(-0.50, 0.12, 0.32,  0.10, 0.16, 0.10, C.leg));
    boxes.push(clawdCreateBox( 0.40, 0.28, 0.28,  0.16, 0.16, 0.10, C.leg));
    boxes.push(clawdCreateBox( 0.50, 0.12, 0.32,  0.10, 0.16, 0.10, C.leg));

  } else {
    // === DUCKING DEATH: flattened and knocked over ===

    // Body (very flat)
    boxes.push(clawdCreateBox(0, 0.35, 0.05,   1.20, 0.25, 0.95, C.body));
    boxes.push(clawdCreateBox(0, 0.50, 0.05,   0.85, 0.08, 0.70, C.shellTop));
    boxes.push(clawdCreateBox(0, 0.20, 0.02,   0.95, 0.08, 0.70, C.belly));
    boxes.push(clawdCreateBox(0, 0.36, -0.40,  0.55, 0.18, 0.10, C.body));

    // Eyes (dazed, lower)
    boxes.push(clawdCreateBox(-0.18, 0.56, -0.34, 0.08, 0.08, 0.08, C.body));
    boxes.push(clawdCreateBox(-0.18, 0.64, -0.36, 0.14, 0.14, 0.14, C.eyeWhite));
    boxes.push(clawdCreateBox(-0.18, 0.66, -0.44, 0.06, 0.06, 0.03, C.pupil));
    boxes.push(clawdCreateBox( 0.18, 0.56, -0.34, 0.08, 0.08, 0.08, C.body));
    boxes.push(clawdCreateBox( 0.18, 0.64, -0.36, 0.14, 0.14, 0.14, C.eyeWhite));
    boxes.push(clawdCreateBox( 0.18, 0.66, -0.44, 0.06, 0.06, 0.03, C.pupil));

    // Mouth
    boxes.push(clawdCreateBox(0, 0.24, -0.46, 0.20, 0.08, 0.04, C.mouth));

    // Claws (drooping to sides)
    boxes.push(clawdCreateBox(-0.65, 0.35, 0,   0.20, 0.12, 0.18, C.claw));
    boxes.push(clawdCreateBox(-0.80, 0.40, 0,   0.15, 0.18, 0.15, C.claw));
    boxes.push(clawdCreateBox(-0.88, 0.52, -0.02, 0.20, 0.07, 0.12, C.claw));
    boxes.push(clawdCreateBox(-0.88, 0.42, -0.02, 0.20, 0.07, 0.12, C.claw));

    boxes.push(clawdCreateBox( 0.65, 0.35, 0,   0.20, 0.12, 0.18, C.claw));
    boxes.push(clawdCreateBox( 0.80, 0.40, 0,   0.15, 0.18, 0.15, C.claw));
    boxes.push(clawdCreateBox( 0.88, 0.52, -0.02, 0.20, 0.07, 0.12, C.claw));
    boxes.push(clawdCreateBox( 0.88, 0.42, -0.02, 0.20, 0.07, 0.12, C.claw));

    // Legs (spread flat)
    boxes.push(clawdCreateBox(-0.50, 0.14, -0.30, 0.16, 0.10, 0.10, C.leg));
    boxes.push(clawdCreateBox(-0.60, 0.06, -0.34, 0.10, 0.10, 0.10, C.leg));
    boxes.push(clawdCreateBox( 0.50, 0.14, -0.30, 0.16, 0.10, 0.10, C.leg));
    boxes.push(clawdCreateBox( 0.60, 0.06, -0.34, 0.10, 0.10, 0.10, C.leg));

    boxes.push(clawdCreateBox(-0.55, 0.14, 0,     0.16, 0.10, 0.10, C.leg));
    boxes.push(clawdCreateBox(-0.65, 0.06, 0,     0.10, 0.10, 0.10, C.leg));
    boxes.push(clawdCreateBox( 0.55, 0.14, 0,     0.16, 0.10, 0.10, C.leg));
    boxes.push(clawdCreateBox( 0.65, 0.06, 0,     0.10, 0.10, 0.10, C.leg));

    boxes.push(clawdCreateBox(-0.50, 0.14, 0.30,  0.16, 0.10, 0.10, C.leg));
    boxes.push(clawdCreateBox(-0.60, 0.06, 0.34,  0.10, 0.10, 0.10, C.leg));
    boxes.push(clawdCreateBox( 0.50, 0.14, 0.30,  0.16, 0.10, 0.10, C.leg));
    boxes.push(clawdCreateBox( 0.60, 0.06, 0.34,  0.10, 0.10, 0.10, C.leg));
  }

  return clawdMergeBoxes(boxes);
}

load_manager.set_loader('dyno_death', ['ground'], function() {
  var frames = {
    "wow": null,
    "wow-down": null
  };

  var geoStand = clawdBuildDeathFrame(false);
  var matStand = new THREE.MeshLambertMaterial({vertexColors: THREE.VertexColors});
  var meshStand = new THREE.Mesh(geoStand, matStand);
  meshStand.castShadow = true;
  frames["wow"] = meshStand;

  var geoDuck = clawdBuildDeathFrame(true);
  var matDuck = new THREE.MeshLambertMaterial({vertexColors: THREE.VertexColors});
  var meshDuck = new THREE.Mesh(geoDuck, matDuck);
  meshDuck.castShadow = true;
  frames["wow-down"] = meshDuck;

  load_manager.set_mesh('dyno_death', frames);
  load_manager.set_status('dyno_death', true);
  player.setPlayerDeathFrames(frames);
});
