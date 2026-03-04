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

    // Body (uniform color)
    boxes.push(clawdSTLBox(-18, -48, 18,  9, 48, 90, C.body, 0));
    // Claw tips
    boxes.push(clawdSTLBox(-18, -36, 66, 15, -24, 78, C.claw, 0));
    boxes.push(clawdSTLBox(-18,  24, 66, 15,  36, 78, C.claw, 0));

    // Eyes (black, protruding from front face)
    boxes.push(clawdSTLBox(-30, -30, 42, -18, -12, 60, C.pupil, 0));
    boxes.push(clawdSTLBox(-30,  12, 42, -18,  30, 60, C.pupil, 0));

    // Legs (orange)
    boxes.push(clawdSTLBox(-18, -48, -6, -6, -36, 18, C.body, 0));
    boxes.push(clawdSTLBox( -6, -24, -6,  6, -12, 18, C.body, 0));
    boxes.push(clawdSTLBox(-18,  12, -6, -6,  24, 18, C.body, 0));
    boxes.push(clawdSTLBox( -6,  36, -6,  6,  48, 18, C.body, 0));

    // Claws raised higher (surprise!)
    boxes.push(clawdSTLBox(-18, -72, 60, -6, -48, 72, C.claw, 0));
    boxes.push(clawdSTLBox(-18, -72, 72, -6, -48, 84, C.claw, 0));
    boxes.push(clawdSTLBox(-18,  48, 60, -6,  72, 72, C.claw, 0));
    boxes.push(clawdSTLBox(-18,  48, 72, -6,  72, 84, C.claw, 0));

  } else {
    // === DUCKING DEATH ===

    // Body (uniform color)
    boxes.push(clawdSTLBox(-18, -48, 8,  9, 48, 58, C.body, 0));
    // Claw tips
    boxes.push(clawdSTLBox(-18, -36, 43, 15, -24, 50, C.claw, 0));
    boxes.push(clawdSTLBox(-18,  24, 43, 15,  36, 50, C.claw, 0));

    // Eyes (black, protruding from front face)
    boxes.push(clawdSTLBox(-30, -30, 22, -18, -12, 36, C.pupil, 0));
    boxes.push(clawdSTLBox(-30,  12, 22, -18,  30, 36, C.pupil, 0));

    // Legs (orange)
    boxes.push(clawdSTLBox(-18, -48, -6, -6, -36, 8, C.body, 0));
    boxes.push(clawdSTLBox(-18,  12, -6, -6,  24, 8, C.body, 0));
    boxes.push(clawdSTLBox( -6, -24, -6,  6, -12, 8, C.body, 0));
    boxes.push(clawdSTLBox( -6,  36, -6,  6,  48, 8, C.body, 0));

    // Claws drooping
    boxes.push(clawdSTLBox(-18, -78, 22, -6, -48, 36, C.claw, 0));
    boxes.push(clawdSTLBox(-18, -78, 36, -6, -48, 43, C.claw, 0));
    boxes.push(clawdSTLBox(-18,  48, 22, -6,  78, 36, C.claw, 0));
    boxes.push(clawdSTLBox(-18,  48, 36, -6,  78, 43, C.claw, 0));
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
