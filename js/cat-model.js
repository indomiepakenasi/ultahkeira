/* ============================================
   THREE.JS CAT MODEL — Keira's 21st Cat-verse
   ============================================ */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export class CatModel {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.scene = new THREE.Scene();
    
    // Camera
    this.camera = new THREE.PerspectiveCamera(45, this.container.clientWidth / this.container.clientHeight, 0.1, 100);
    this.camera.position.set(0, 2, 6);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // optimize
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);

    // Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.enablePan = false;
    this.controls.enableZoom = false;
    // Limit vertical rotation so user can't look under or over too much
    this.controls.minPolarAngle = Math.PI / 3;
    this.controls.maxPolarAngle = Math.PI / 2 + 0.1;

    // Lighting
    const ambientLight = new THREE.HemisphereLight(0xffffff, 0xdddddd, 1.2);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(2, 5, 5);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    this.scene.add(dirLight);

    // Add invisible floor to catch shadows
    const floorGeo = new THREE.PlaneGeometry(20, 20);
    const floorMat = new THREE.ShadowMaterial({ opacity: 0.15 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.63; // Align exactly under the cat's paws
    floor.receiveShadow = true;
    this.scene.add(floor);

    this.catGroup = new THREE.Group();
    this.scene.add(this.catGroup);

    this.createProceduralCat();

    // Animation Loop
    this.animationId = null;
    this.mixer = null;
    this.clock = new THREE.Clock();

    window.addEventListener('resize', () => this.resize());
  }

  // Fallback procedural cat if no GLB is available yet
  createProceduralCat() {
    const baseColor = 0xffffff;
    const patchColor = 0xdb7b58; // Brownish orange calico
    const darkColor = 0x222222;
    const innerEarColor = 0xff9494;

    const baseMat = new THREE.MeshStandardMaterial({ color: baseColor, roughness: 1.0, metalness: 0.0 });
    const patchMat = new THREE.MeshStandardMaterial({ color: patchColor, roughness: 1.0, metalness: 0.0 });
    const darkMat = new THREE.MeshStandardMaterial({ color: darkColor, roughness: 0.5, metalness: 0.2 });
    const highlightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const pinkMat = new THREE.MeshStandardMaterial({ color: innerEarColor, roughness: 1.0, metalness: 0.0 });

    // Body (facing +Z)
    const bodyGeo = new THREE.CapsuleGeometry(0.7, 1.2, 4, 16);
    this.bodyMesh = new THREE.Mesh(bodyGeo, baseMat);
    this.bodyMesh.rotation.x = Math.PI / 2;
    this.bodyMesh.position.set(0, 0.7, -0.3); 
    this.bodyMesh.castShadow = true;
    this.catGroup.add(this.bodyMesh);

    // --- HEAD ---
    this.headGroup = new THREE.Group();
    this.headGroup.position.set(0, 1.35, 0.8);
    this.catGroup.add(this.headGroup);
    this.headMesh = this.headGroup; // For animations

    // Main Head Sphere (squashed)
    const headGeo = new THREE.SphereGeometry(0.75, 32, 32);
    const headBase = new THREE.Mesh(headGeo, baseMat);
    headBase.scale.set(1.2, 0.9, 0.95); 
    headBase.castShadow = true;
    this.headGroup.add(headBase);

    // Orange Patch (Flush with head, covering forehead like reference)
    const patchGeo = new THREE.SphereGeometry(0.758, 32, 32, Math.PI * 0.55, Math.PI * 1.1, 0, Math.PI * 0.58);
    const patchMesh = new THREE.Mesh(patchGeo, patchMat);
    patchMesh.scale.set(1.2, 0.9, 0.95);
    patchMesh.castShadow = true;
    this.headGroup.add(patchMesh);

    // Cheek Tufts (Smaller, fluffy)
    const tuftGeo = new THREE.ConeGeometry(0.08, 0.25, 16);
    
    const tuftL = new THREE.Mesh(tuftGeo, baseMat);
    tuftL.position.set(-0.85, -0.2, 0.1);
    tuftL.rotation.set(0, 0, Math.PI/2 + 0.3);
    this.headGroup.add(tuftL);
    
    const tuftR = new THREE.Mesh(tuftGeo, baseMat);
    tuftR.position.set(0.85, -0.2, 0.1);
    tuftR.rotation.set(0, 0, -Math.PI/2 - 0.3);
    this.headGroup.add(tuftR);
    
    const tuftL2 = new THREE.Mesh(tuftGeo, baseMat);
    tuftL2.position.set(-0.75, -0.4, 0.15);
    tuftL2.rotation.set(0, 0, Math.PI/2 + 0.6);
    this.headGroup.add(tuftL2);
    
    const tuftR2 = new THREE.Mesh(tuftGeo, baseMat);
    tuftR2.position.set(0.75, -0.4, 0.15);
    tuftR2.rotation.set(0, 0, -Math.PI/2 - 0.6);
    this.headGroup.add(tuftR2);

    // --- EARS ---
    const earGeo = new THREE.ConeGeometry(0.25, 0.5, 16);
    const innerEarGeo = new THREE.ConeGeometry(0.12, 0.35, 16);

    const earL = new THREE.Mesh(earGeo, patchMat);
    earL.position.set(-0.55, 0.55, 0);
    earL.rotation.set(0.1, 0, 0.4);
    const earLInner = new THREE.Mesh(innerEarGeo, pinkMat);
    earLInner.position.set(0, 0.05, 0.12);
    earL.add(earLInner);
    this.headGroup.add(earL);

    const earR = new THREE.Mesh(earGeo, baseMat);
    earR.position.set(0.55, 0.55, 0);
    earR.rotation.set(0.1, 0, -0.4);
    const earRInner = new THREE.Mesh(innerEarGeo, pinkMat);
    earRInner.position.set(0, 0.05, 0.12);
    earR.add(earRInner);
    this.headGroup.add(earR);

    // Tail
    const tailGeo = new THREE.CapsuleGeometry(0.15, 1, 4, 8);
    const tailMesh = new THREE.Mesh(tailGeo, baseMat);
    tailMesh.position.set(0, 1, -1.2);
    tailMesh.rotation.x = -Math.PI / 4;
    this.catGroup.add(tailMesh);
    this.tailMesh = tailMesh;

    // --- LEGS ---
    const legGeo = new THREE.CapsuleGeometry(0.18, 0.3, 4, 8);
    const pawGeo = new THREE.SphereGeometry(0.2, 16, 16);
    const pawPadGeo = new THREE.SphereGeometry(0.08, 8, 8);
    const toePadGeo = new THREE.SphereGeometry(0.04, 8, 8);

    const createLeg = (x, z) => {
        const legGroup = new THREE.Group();
        
        // Leg cylinder
        const leg = new THREE.Mesh(legGeo, baseMat);
        leg.castShadow = true;
        legGroup.add(leg);
        
        // Paw (round bottom)
        const paw = new THREE.Mesh(pawGeo, baseMat);
        paw.scale.set(1, 0.5, 1.1);
        paw.position.set(0, -0.22, 0.05);
        paw.castShadow = true;
        legGroup.add(paw);
        
        // Pink paw pad (bottom)
        const pawPad = new THREE.Mesh(pawPadGeo, pinkMat);
        pawPad.scale.set(1.1, 0.5, 1);
        pawPad.position.set(0, -0.28, 0.08);
        legGroup.add(pawPad);
        
        // Toe pads
        for (let i = -1; i <= 1; i++) {
            const toe = new THREE.Mesh(toePadGeo, pinkMat);
            toe.scale.set(1, 0.5, 1);
            toe.position.set(i * 0.07, -0.27, 0.18);
            legGroup.add(toe);
        }
        
        legGroup.position.set(x, 0.05, z);
        return legGroup;
    };

    // Front legs
    this.catGroup.add(createLeg(-0.35, 0.45));
    this.catGroup.add(createLeg(0.35, 0.45));
    // Back legs
    this.catGroup.add(createLeg(-0.38, -1.0));
    this.catGroup.add(createLeg(0.38, -1.0));

    // --- EYES ---
    const createEye = (x) => {
        const eyeGroup = new THREE.Group();
        
        const eyeBaseGeo = new THREE.SphereGeometry(0.13, 16, 16);
        const eyeBase = new THREE.Mesh(eyeBaseGeo, darkMat);
        eyeBase.scale.set(0.85, 1.2, 0.5); 
        eyeGroup.add(eyeBase);

        const hl1Geo = new THREE.SphereGeometry(0.045, 8, 8);
        const hl1 = new THREE.Mesh(hl1Geo, highlightMat);
        hl1.position.set(0.02, 0.05, 0.06);
        eyeGroup.add(hl1);

        const hl2Geo = new THREE.SphereGeometry(0.02, 8, 8);
        const hl2 = new THREE.Mesh(hl2Geo, highlightMat);
        hl2.position.set(0.02, -0.06, 0.06);
        eyeGroup.add(hl2);

        eyeGroup.position.set(x, 0.0, 0.70);
        eyeGroup.rotation.y = (x < 0) ? 0.1 : -0.1;
        
        return eyeGroup;
    };

    this.headGroup.add(createEye(-0.28)); 
    this.headGroup.add(createEye(0.28));  

    // --- NOSE ---
    const noseGeo = new THREE.SphereGeometry(0.05, 16, 16);
    const nose = new THREE.Mesh(noseGeo, darkMat);
    nose.scale.set(1.4, 0.8, 0.5);
    nose.position.set(0, -0.15, 0.73);
    this.headGroup.add(nose);

    // --- MOUTH ---
    const mouthGeo = new THREE.TorusGeometry(0.06, 0.02, 8, 16, Math.PI); 
    const mouthL = new THREE.Mesh(mouthGeo, darkMat);
    mouthL.rotation.x = Math.PI; 
    mouthL.position.set(-0.06, -0.17, 0.72);
    this.headGroup.add(mouthL);
    
    const mouthR = new THREE.Mesh(mouthGeo, darkMat);
    mouthR.rotation.x = Math.PI; 
    mouthR.position.set(0.06, -0.17, 0.72);
    this.headGroup.add(mouthR);

    this.catGroup.position.y = -0.4;
  }

  resize() {
    if (!this.container) return;
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  start() {
    this.resize();
    if (!this.animationId) {
      this.loop();
    }
  }

  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  loop() {
    const delta = this.clock.getDelta();
    const time = this.clock.getElapsedTime();
    
    if (this.mixer) this.mixer.update(delta);
    this.controls.update();

    // Idle animation for procedural cat
    if (this.headMesh && this.tailMesh) {
      this.headMesh.rotation.x = Math.sin(time * 2) * 0.05;
      this.tailMesh.rotation.x = Math.sin(time * 4) * 0.1;
      this.tailMesh.rotation.z = -Math.PI / 4 + Math.sin(time * 2) * 0.1;
    }

    this.renderer.render(this.scene, this.camera);
    this.animationId = requestAnimationFrame(() => this.loop());
  }

  animateEat() {
    if (this.headMesh) {
      gsap.to(this.headMesh.position, {
        y: 1.0,
        duration: 0.2,
        yoyo: true,
        repeat: 3
      });
      gsap.to(this.headMesh.rotation, {
        x: 0.3,
        duration: 0.2,
        yoyo: true,
        repeat: 3
      });
    }
  }

  animateHappy() {
    if (this.catGroup) {
      gsap.to(this.catGroup.position, {
        y: 1.5,
        duration: 0.3,
        ease: "power2.out",
        yoyo: true,
        repeat: 1
      });
      gsap.to(this.tailMesh.rotation, {
        x: 0.5,
        duration: 0.1,
        yoyo: true,
        repeat: 5
      });
    }
  }
}
