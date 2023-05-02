import * as THREE from 'three';
import {Game, Scene} from './game.js';
import {AssetLoader} from './assetloader.js';

// load assets

var assets = {
  "office": new URL('../res/models/office.glb', import.meta.url),
  "bus": new URL('../res/models/bus.glb', import.meta.url)
};
var assetLoader = new AssetLoader(assets);
assetLoader.onload = function(a) {
  assets = a;
  start();
}

// runs after assets have loaded

var game;
var bus, office, mainmenu;

function start() {
  game = new Game();

  mainmenu = new MainMenu(game);
  office = new Office(game);
  bus = new Bus(game);

  game.setScene(0);

  document.addEventListener("click", function(e) { game.click(e) });
  document.addEventListener("mousemove", function(e) { game.mousemove(e) });
  window.addEventListener("resize", function() { game.resize(); });
  game.resize();
  draw();
}

function draw() {
  game.render();
  requestAnimationFrame(draw);
}

//

class Office extends Scene {
  constructor(game) {
    super(game);

    const officemesh = this.addAsset(assets["office"]);
    officemesh.position.set(0, -10, 0);
    this.domelement = document.getElementById("computer-screen");

    this._camera.position.set(-50, 50, -50);

    this.Computer;
    this.Player1;

    this.PlayerTime = 0;
    this.PlayerOrigin;
    this.PlayerDestination;

    this.CameraTime = -1;
    this.CameraDestination;
    this.CameraDestinationRotation;
    for (let mesh of officemesh.children) {
      switch (mesh.name) {
        case "Computer":
          this.Computer = mesh;
          this.CameraDestination = mesh.position.clone();
          this.CameraDestination.y -= 10;
          this.CameraDestination.x -= 6;

          let camrot = mesh.quaternion.clone();
          // camrot.w = 0;
          // camrot.y = 1;
          camrot.w = 0.707107;
          camrot.y = -0.707107;

          this.CameraDestinationRotation = camrot;
          break;
        case "Player1":
          this.PlayerOrigin = mesh.position.clone();
          this.Player1 = mesh;
          this.Player1.material.transparent = true;
          break;
        case "Player2":
          this.PlayerDestination = mesh.position;
          this._camera.lookAt(this.PlayerDestination.x, this.PlayerDestination.y, this.PlayerDestination.z);
          mesh.removeFromParent();
          break;
      }
    }

    this.CameraOrigin = this._camera.position.clone();
    this.CameraOriginRotation = this._camera.quaternion.clone();
  }

  start() {
    document.body.classList.add("office");
    if (this.CameraTime >= 1) {
      this.domelement.classList.remove("gone");
    }
  }

  end() {
    document.body.classList.remove("office");
    this.domelement.classList.add("gone");
  }

  update() {
    if (this.PlayerTime < 1) {
      this.PlayerTime += .01;

      let newpos = this.PlayerOrigin.clone();
      newpos.lerp(this.PlayerDestination, THREE.MathUtils.smoothstep(this.PlayerTime, 0, 1));
      this.Player1.position.set(newpos.x, newpos.y, newpos.z);

      if (this.PlayerTime >= 1) {
        this.CameraTime = 0;
      }
    }
    if (this.CameraTime != -1 && this.CameraTime < 1) {
      this.CameraTime += .01;
      const step = THREE.MathUtils.smoothstep(this.CameraTime, 0, 1);

      let newpos = this.CameraOrigin.clone();
      newpos.lerp(this.CameraDestination, step);

      let newrot = this.CameraOriginRotation.clone();
      newrot.slerp(this.CameraDestinationRotation, step);

      this._camera.position.set(newpos.x, newpos.y, newpos.z);
      this._camera.quaternion.set(newrot.x, newrot.y, newrot.z, newrot.w);
      this.Player1.material.opacity = (1 - step);

      if (this.CameraTime >= 1) {
        this.domelement.classList.remove("gone");
      }
    }
  }
}

class Bus extends Scene {
  constructor(game) {
    super(game);

    const busmesh = this.addAsset(assets["bus"]);

    this.Button;
    this.Phone;

    for (let mesh of busmesh.children) {
      if ('isCamera' in mesh) {
        const p = mesh.position;
        const r = mesh.rotation;

        this._camera.position.set(p.x, p.y + .2, p.z);
        this._camera.rotation.set(r.x, r.y, r.z);
      } else {
        if (mesh.name == "Button") {
          this.Button = mesh;
        } else if (mesh.name == "Screen") {
          this.Phone = mesh;
        }
      }
    }
  }

  start() {
    document.body.classList.add("clouds");
  }

  end() {
    document.body.classList.remove("clouds");
  }

  init_camera() {
    var camera = new THREE.PerspectiveCamera();
    camera.zoom = 2;
    this._camera = camera;
  }

  update() {

  }

  mousemove(e) {
    var intersects = this.raycast(e);
    if (intersects.length == 0) return;

    var buttonHovered = false;
    var phoneHovered = false;
    switch (intersects[0].object) {
      case this.Button:
        buttonHovered = true;
        break;
      case this.Phone:
        phoneHovered = true;
        break;
    }

    if (!buttonHovered) this.buttonUnhover();
    if (!phoneHovered) this.phoneUnhover();

    if (buttonHovered) this.buttonHover();
    if (phoneHovered) this.phoneHover();
  }

  click(e) {
    var intersects = this.raycast(e);
    if (intersects.length == 0) return;

    var buttonClicked = false;
    var phoneClicked = false;
    switch (intersects[0].object) {
      case this.Button:
        buttonClicked = true;
        break;
      case this.Phone:
        phoneClicked = true;
        break;
    }

    if (buttonClicked) this.buttonClick();
    if (phoneClicked) this.phoneClick();
  }

  buttonHover() {
    document.body.classList.add("pointer");
    this.Button.material.transmission = 1;
    this.Button.material.opacity = 0;
  }

  buttonUnhover() {
    document.body.classList.remove("pointer");
    this.Button.material.transmission = 0;
    this.Button.material.opacity = 1;
  }

  buttonClick() {

  }

  phoneHover() {
    document.body.classList.add("pointer");
    this.Phone.material.transmission = 1;
    this.Phone.material.opacity = 0;
  }

  phoneUnhover() {
    document.body.classList.remove("pointer");
    this.Phone.material.transmission = 0;
    this.Phone.material.opacity = 1;
  }

  phoneClick() {

  }
}

class MainMenu extends Bus {
  constructor(game) {
    super(game);
    this.domelement = document.getElementById("mainmenu");
  }

  start() {
    document.body.classList.add("clouds");
    this.domelement.classList.remove("gone");
  }

  end() {
    document.body.classList.remove("clouds");
    this.domelement.classList.add("gone");
    document.body.classList.remove("pointer");
  }

  buttonHover() { }
  buttonUnhover() { }

  phoneClick() {
    game.setScene(1);
  }
}
