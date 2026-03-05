/**
 * Clawd the Crab - Death Frames
 * "wow" = standing death, "wow-down" = ducking death
 * Based on STL geometry
 */

function clawdBuildDeathFrame(isDucking) {
  var C = ClawdColors;
  var boxes = [];

  if (!isDucking) {
    // === STANDING DEATH ===

    // Body
    boxes.push(clawdSTLBox(-18, -48, 18,  9, 48, 90, C.body, 0));
    // Eyes
    boxes.push(clawdSTLBox(5, -31, 55, 13, -24, 73, C.pupil, 0));
    boxes.push(clawdSTLBox(5,  24, 55, 13,  31, 73, C.pupil, 0));

    // Legs
    boxes.push(clawdSTLBox(-18, -46, -3, -6, -37, 18, C.body, 0));
    boxes.push(clawdSTLBox( -6, -22, -3,  6, -13, 18, C.body, 0));
    boxes.push(clawdSTLBox(-18,  14, -3, -6,  23, 18, C.body, 0));
    boxes.push(clawdSTLBox( -6,  31, -3,  6,  40, 18, C.body, 0));

    // Claws raised higher (surprise!)
    boxes.push(clawdSTLBox(-11, -65, 60, 1, -48, 68, C.claw, 0));
    boxes.push(clawdSTLBox(-11, -65, 68, 1, -48, 77, C.claw, 0));
    boxes.push(clawdSTLBox(-11,  48, 60, 1,  65, 68, C.claw, 0));
    boxes.push(clawdSTLBox(-11,  48, 68, 1,  65, 77, C.claw, 0));

  } else {
    // === DUCKING DEATH ===

    // Body
    boxes.push(clawdSTLBox(-18, -48, 8,  9, 48, 58, C.body, 0));
    // Eyes
    boxes.push(clawdSTLBox(5, -31, 35, 13, -24, 48, C.pupil, 0));
    boxes.push(clawdSTLBox(5,  24, 35, 13,  31, 48, C.pupil, 0));

    // Legs
    boxes.push(clawdSTLBox(-18, -46, -3, -6, -37, 8, C.body, 0));
    boxes.push(clawdSTLBox(-18,  14, -3, -6,  23, 8, C.body, 0));
    boxes.push(clawdSTLBox( -6, -22, -3,  6, -13, 8, C.body, 0));
    boxes.push(clawdSTLBox( -6,  31, -3,  6,  40, 8, C.body, 0));

    // Claws drooping
    boxes.push(clawdSTLBox(-11, -70, 22, 1, -48, 30, C.claw, 0));
    boxes.push(clawdSTLBox(-11, -70, 30, 1, -48, 39, C.claw, 0));
    boxes.push(clawdSTLBox(-11,  48, 22, 1,  70, 30, C.claw, 0));
    boxes.push(clawdSTLBox(-11,  48, 30, 1,  70, 39, C.claw, 0));
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
