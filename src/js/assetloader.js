import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';

class AssetLoader {
  constructor(assets) {
    this.loadCount = Object.keys(assets).length;
    this.assets = {};

    var loader = new GLTFLoader();
    loader._assetLoader = this;

    for (let name in assets) {
      loader.load(assets[name].href, function(gltf) {
        const model = gltf.scene;
        for (let mesh of model.children) {
          if (!('isCamera' in mesh)) {
            mesh.material = new THREE.MeshPhysicalMaterial({ color: mesh.material.color });
            mesh.material.castShadow = true;
            mesh.material.receiveShadow = true;
          }
        }

        const assetLoader = loader._assetLoader;
        assetLoader.assets[name] = model;
        assetLoader.loadCount--;
        if (assetLoader.loadCount == 0) {
          assetLoader.onload(assetLoader.assets);
        }
      });
    }
  }

  onload(assets) {}
}

module.exports = { AssetLoader };
