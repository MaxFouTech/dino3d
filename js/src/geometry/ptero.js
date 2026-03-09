load_manager.set_loader('ptero', ['ground','cactus'], function() {
  let frames = [];
  let framesCount = 5; // including 0

  let fontLoader = new THREE.FontLoader();
  fontLoader.load(config.base_path + 'libs/three/fonts/helvetiker_bold.typeface.json', function(font) {
    let geo = new THREE.TextBufferGeometry('overloaded_error', {
      font: font,
      size: 0.8,
      height: 0.4,
      curveSegments: 4,
      bevelEnabled: false
    });
    geo.center();
    geo.computeBoundingBox();
    geo.translate(0, (geo.boundingBox.max.y - geo.boundingBox.min.y) / 2, 0);
    geo.isTextObstacle = true;

    let mat = new THREE.MeshLambertMaterial({ color: 0xcc3333 });

    let builder = {
      geometry: geo,
      material: mat,
      createMesh: function() { return new THREE.Mesh(this.geometry, this.material); }
    };

    // Fill all frames with the same static text (no animation)
    for (let i = 0; i <= framesCount; i++) {
      frames[i] = builder;
    }

    load_manager.set_vox('ptero', frames);
    load_manager.set_status('ptero', true);
  });
});
