load_manager.set_loader('cactus', ['ground'], function() {
  let parser = new vox.Parser();
  let ground = scene.getObjectByName('ground');

  let cactus = [];
  let cactusFiles = ['cactus','cactus_tall','cactus_thin','fcactus','fcactus_tall','fcactus_thin'];
  let totalToLoad = cactusFiles.length + 1; // +1 for 3D text
  let loadedCount = 0;

  function checkAllLoaded() {
    loadedCount++;
    if(loadedCount >= totalToLoad) {
      load_manager.set_vox('cactus', cactus);
      load_manager.set_status('cactus', true);
    }
  }

  for(let i = 0; i <= cactusFiles.length - 1; i++) {
    // load all cactuses
    parser.parse(config.base_path + 'objects/cactus/' + cactusFiles[i] + '.vox').then(function(voxelData) {
      let builder = new vox.MeshBuilder(voxelData, {voxelSize: .09});
      let material = new THREE.MeshLambertMaterial();
      material.map = vox.MeshBuilder.textureFactory.getTexture(voxelData);
      builder.material = material;

      cactus[i] = builder;
      checkAllLoaded();
    });
  }

  // Load 3D text "5h Limit" as an additional cactus variant
  let fontLoader = new THREE.FontLoader();
  fontLoader.load(config.base_path + 'libs/three/fonts/helvetiker_bold.typeface.json', function(font) {
    let textGeometry = new THREE.TextBufferGeometry('5h Limit', {
      font: font,
      size: 0.8,
      height: 0.4,
      curveSegments: 4,
      bevelEnabled: false
    });
    textGeometry.center();
    // Shift geometry up so bottom edge sits at y=0 (above ground)
    textGeometry.computeBoundingBox();
    let textHeight = textGeometry.boundingBox.max.y - textGeometry.boundingBox.min.y;
    textGeometry.translate(0, textHeight / 2, 0);

    let textMaterial = new THREE.MeshLambertMaterial({ color: 0xcc3333 });

    // Wrapper mimicking vox.MeshBuilder interface for compatibility
    let textBuilder = {
      geometry: textGeometry,
      material: textMaterial,
      createMesh: function() {
        return new THREE.Mesh(this.geometry, this.material);
      }
    };

    cactus[cactusFiles.length] = textBuilder;
    checkAllLoaded();
  });
});