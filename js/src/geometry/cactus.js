load_manager.set_loader('cactus', ['ground'], function() {
  let cactus = [];
  let totalToLoad = 22;
  let loadedCount = 0;

  function checkAllLoaded() {
    loadedCount++;
    if(loadedCount >= totalToLoad) {
      load_manager.set_vox('cactus', cactus);
      load_manager.set_status('cactus', true);
    }
  }

  // Helper: create a single-line text obstacle
  function createSingleLine(text, color, size, height) {
    let geo = new THREE.TextBufferGeometry(text, {
      font: font,
      size: size,
      height: height,
      curveSegments: 4,
      bevelEnabled: false
    });
    geo.center();
    geo.computeBoundingBox();
    geo.translate(0, (geo.boundingBox.max.y - geo.boundingBox.min.y) / 2, 0);
    geo.isTextObstacle = true;

    let mat = new THREE.MeshLambertMaterial({ color: color });
    return {
      geometry: geo,
      material: mat,
      createMesh: function() { return new THREE.Mesh(this.geometry, this.material); }
    };
  }

  // Helper: create a multi-line text obstacle
  function createMultiLine(lines, color, lineSize, lineSpacing, height) {
    let merged = new THREE.Geometry();
    for (let l = 0; l < lines.length; l++) {
      let lineGeo = new THREE.TextGeometry(lines[l], {
        font: font,
        size: lineSize,
        height: height,
        curveSegments: 4,
        bevelEnabled: false
      });
      lineGeo.center();
      lineGeo.translate(0, (lines.length - 1 - l) * lineSpacing, 0);
      merged.merge(lineGeo);
    }

    let geo = new THREE.BufferGeometry().fromGeometry(merged);
    geo.computeBoundingBox();
    geo.translate(0, -geo.boundingBox.min.y, 0);
    geo.isTextObstacle = true;

    let mat = new THREE.MeshLambertMaterial({ color: color });
    return {
      geometry: geo,
      material: mat,
      createMesh: function() { return new THREE.Mesh(this.geometry, this.material); }
    };
  }

  // Helper: create rainbow per-letter text obstacle
  function createRainbowText(letters, colors, size, height) {
    let merged = new THREE.Geometry();
    let xOffset = 0;
    let spacing = size * 0.05;

    for (let i = 0; i < letters.length; i++) {
      let letterGeo = new THREE.TextGeometry(letters[i], {
        font: font,
        size: size,
        height: height,
        curveSegments: 4,
        bevelEnabled: false
      });
      letterGeo.computeBoundingBox();
      letterGeo.translate(xOffset - letterGeo.boundingBox.min.x, 0, 0);
      xOffset += (letterGeo.boundingBox.max.x - letterGeo.boundingBox.min.x) + spacing;

      let color = new THREE.Color(colors[i]);
      for (let f = 0; f < letterGeo.faces.length; f++) {
        letterGeo.faces[f].vertexColors = [color.clone(), color.clone(), color.clone()];
      }
      merged.merge(letterGeo);
    }

    merged.computeBoundingBox();
    let centerX = (merged.boundingBox.max.x + merged.boundingBox.min.x) / 2;
    merged.translate(-centerX, 0, 0);

    let geo = new THREE.BufferGeometry().fromGeometry(merged);
    geo.computeBoundingBox();
    geo.translate(0, -geo.boundingBox.min.y, 0);
    geo.isTextObstacle = true;

    let mat = new THREE.MeshLambertMaterial({ vertexColors: THREE.VertexColors });
    return {
      geometry: geo,
      material: mat,
      createMesh: function() { return new THREE.Mesh(this.geometry, this.material); }
    };
  }

  let font;
  let fontLoader = new THREE.FontLoader();
  fontLoader.load(config.base_path + 'libs/three/fonts/helvetiker_bold.typeface.json', function(loadedFont) {
    font = loadedFont;

    // Orange words
    cactus[0] = createSingleLine('Mustering\u2026', 0xff8c00, 1.56, 0.4);
    checkAllLoaded();
    cactus[1] = createSingleLine('Reticulating\u2026', 0xff8c00, 1.56, 0.4);
    checkAllLoaded();
    cactus[2] = createSingleLine('Honking\u2026', 0xff8c00, 1.56, 0.4);
    checkAllLoaded();
    cactus[3] = createSingleLine('Vibing\u2026', 0xff8c00, 1.56, 0.4);
    checkAllLoaded();

    // "You're / absolutely / right" - white, multi-line
    cactus[4] = createMultiLine(["You're", "absolutely", "right"], 0xffffff, 0.91, 0.85, 0.3);
    checkAllLoaded();

    // "5-hour limit reached - resets 3am" - red
    cactus[5] = createSingleLine('5-hour limit reached \u2219 resets 3am', 0xcc3333, 1.17, 0.4);
    checkAllLoaded();

    // "Context low (0% remaining) / Run /compact" - red, multi-line
    cactus[6] = createMultiLine(["Context low (0% remaining)", "Run /compact"], 0xcc3333, 0.91, 0.85, 0.3);
    checkAllLoaded();

    // "Flibbertigibbeting..." - red
    cactus[7] = createSingleLine('Flibbertigibbeting\u2026', 0xcc3333, 1.82, 0.5);
    checkAllLoaded();

    // "ultrathink" - rainbow per-letter colors
    cactus[8] = createRainbowText(
      ['u','l','t','r','a','t','h','i','n','k'],
      [0xd5352c, 0xfa8e32, 0xfcc82d, 0x80b23e, 0x1fa0cd, 0x9f2e68, 0xd5332a, 0xf78e32, 0xfdc838, 0x81b33c],
      1.17, 0.4
    );
    checkAllLoaded();

    // Slash commands - white
    cactus[9] = createSingleLine('/clear', 0xffffff, 0.84, 0.4);       // decreases context
    checkAllLoaded();
    cactus[10] = createSingleLine('/extra-usage', 0xffffff, 1.56, 0.4);
    checkAllLoaded();
    cactus[11] = createSingleLine('/fast', 0xffffff, 1.56, 0.4);
    checkAllLoaded();
    cactus[12] = createSingleLine('/rewind', 0xffffff, 0.84, 0.4);     // decreases context
    checkAllLoaded();
    cactus[13] = createSingleLine('/mcp', 0xffffff, 1.56, 0.4);
    checkAllLoaded();
    cactus[14] = createSingleLine('/init', 0xffffff, 1.56, 0.4);
    checkAllLoaded();
    // "Yes, clear context (x% used)" - 5 variants matching different context levels (decrease context)
    cactus[15] = createMultiLine(["Yes, clear context (80% used)", "and auto-accept edits"], 0xffffff, 0.49, 0.85, 0.3);
    checkAllLoaded();
    cactus[16] = createMultiLine(["Yes, clear context (85% used)", "and auto-accept edits"], 0xffffff, 0.49, 0.85, 0.3);
    checkAllLoaded();
    cactus[17] = createMultiLine(["Yes, clear context (90% used)", "and auto-accept edits"], 0xffffff, 0.49, 0.85, 0.3);
    checkAllLoaded();
    cactus[18] = createMultiLine(["Yes, clear context (95% used)", "and auto-accept edits"], 0xffffff, 0.49, 0.85, 0.3);
    checkAllLoaded();
    cactus[19] = createMultiLine(["Yes, clear context (99% used)", "and auto-accept edits"], 0xffffff, 0.49, 0.85, 0.3);
    checkAllLoaded();
    // "git commit and push" - decreases context
    cactus[20] = createSingleLine('git commit and push', 0xffffff, 0.63, 0.35);
    checkAllLoaded();
    // "/compact" - final boss, pre-baked large, spawned separately at 200k
    cactus[21] = createSingleLine('/compact', 0xffffff, 2.5, 1.0);
    checkAllLoaded();
  });
});
