import * as THREE from 'three';

class Game {
  constructor(p) {
    p = p || {};
    this.scenes = p.scenes || [];
    this.currentSceneId = p.currentSceneId || 0;

    var renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.VSMShadowMap;
    renderer.gammaOutput = true;
    renderer.outputEncoding = THREE.sRGBEncoding;
    document.body.appendChild(renderer.domElement);
    this._renderer = renderer;
    this.rect = this._renderer.domElement.getBoundingClientRect();

    this.ui = document.getElementById("game-ui");

    this.width = 1080 * 4/3;
    this.height = 1080;
    this._renderer.setSize(this.width, this.height);
  }

  mousemove(e) {
    const currentScene = this.scenes[this.currentSceneId];
    if (currentScene) {
      currentScene.mousemove({
        x: (e.pageX - this.rect.left) / this.rect.width,
        y: (e.pageY - this.rect.top) / this.rect.height,
      });
    }
  }

  click(e) {
    const currentScene = this.scenes[this.currentSceneId];
    if (currentScene) {
      currentScene.click({
        button: e.button,
        x: (e.pageX - this.rect.left) / this.rect.width,
        y: (e.pageY - this.rect.top) / this.rect.height,
      });
    }
  }

  setScene(id) {
    const currentScene = this.scenes[this.currentSceneId];
    if (currentScene) {
      currentScene.end();
    }

    this.currentSceneId = id;
    this.scenes[id].start();

    const camera = this.scenes[id]._camera;
    camera.aspect = this.width/this.height;
    camera.left = this.width/-2;
    camera.right = this.width/2;
    camera.top = this.height/2;
    camera.bottom = this.height/-2;
    camera.updateProjectionMatrix();
  }

  resize() {
    var desiredAspectRatio = 4/3;
    var currentAspectRatio = window.innerWidth / window.innerHeight;

    var width, height;
    if (currentAspectRatio < desiredAspectRatio) {
      width = window.innerWidth;
      height = width / desiredAspectRatio;
    } else {
      height = window.innerHeight;
      width = height * desiredAspectRatio;
    }

    this._renderer.domElement.style.width = this.ui.style.width = width+"px";
    this._renderer.domElement.style.height = this.ui.style.height = height+"px";
    this.rect = this._renderer.domElement.getBoundingClientRect();
  }

  render() {
    const currentScene = this.scenes[this.currentSceneId];
    if (currentScene) {
      currentScene.render(this._renderer);
    }
  }
}

class Scene {
  constructor(game) {
    this.init_scene();
    this.init_camera();

    if (game) {
      game.scenes.push(this);
    }
  }

  init_scene() {
    var scene = new THREE.Scene();
    var ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);
    var sun = new THREE.DirectionalLight(0xdfebf0, 1);
    sun.castShadow = true;
    sun.position.set(10, 10, 0);
    scene.add(sun);

    this._scene = scene;
  }

  init_camera() {
    var camera = new THREE.PerspectiveCamera(45, 1, .1, 1000);
    camera.position.set(10, 0, 0);
    camera.lookAt(0, 0, 0);
    this._camera = camera;
  }

  addAsset(asset) {
    const mesh = asset.clone();
    this._scene.add(mesh);
    return mesh;
  }

  start() { }

  end() {
    document.body.classList.remove("pointer");
  }

  update() { }

  mousemove(e) { }

  click(e) { }

  raycast(e) {
    var raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(e.x * 2 - 1, -e.y * 2 + 1), this._camera);
    var intersects = raycaster.intersectObjects(this._scene.children);
    return intersects;
  }

  render(renderer) {
    this.update();
    renderer.render(this._scene, this._camera);
  }
}

module.exports = { Game, Scene };
