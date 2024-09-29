import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { OutlinePass } from 'three/addons/postprocessing/OutlinePass.js';

const gravity = 100;
let renderer, scene, camera, composer, tv, cube, clock, raycaster, mouse, outlinePass2, video;
let delta = 0;
let shouldFall = true;
let fallTrigger = false;
let shouldAnimate = false;
let animateToScreen = false;
let initialCameraPos;
let movToVideoInter = 0;
let videoPlaneTarget;
let initialTVRot = 0;
let hasClicked = false;

let hoveredObjects = [];

let acceleration = 0;
let rotations = 0;

let canvasSize;

const canvas = document.getElementById('desktop-device-only');

export function reset3D() {
  renderer.dispose();
  renderer = undefined;
  scene = undefined;
  camera = undefined;
  composer = undefined;
  tv = undefined;
  cube = undefined;
  clock = undefined;
  raycaster = undefined;
  mouse = undefined;
  outlinePass2 = undefined;
  video = undefined;
  canvasSize = undefined;
  delta = 0;
  shouldFall = true;
  fallTrigger = false;
  shouldAnimate = false;
  animateToScreen = false;
  initialCameraPos;
  movToVideoInter = 0;
  videoPlaneTarget;
  initialTVRot = 0;
  hasClicked = false;
  hoveredObjects = [];
  acceleration = 0;
  rotations = 0;

  canvas.removeChild(canvas.children[0]);
} 

window.addEventListener( 'resize', onWindowResize, false );

function onWindowResize(){
  if (renderer) {
    canvasSize = canvas.getBoundingClientRect();
    camera.aspect = canvasSize.width / canvasSize.height;
    camera.updateProjectionMatrix();
  
    renderer.setSize( canvasSize.width, canvasSize.height );
  }
}

function animate() {
  delta = clock.getDelta();

  if (shouldAnimate && !animateToScreen) {
    if (shouldFall) acceleration += gravity * delta;
    if (acceleration > 100) acceleration = 100;
    if (!shouldFall) {acceleration = 0;tv.position.y = 0;}
    if (Math.abs(acceleration) > 0.1) fallTrigger = true;
  
    if (acceleration > 0 && acceleration < 0.1 && fallTrigger) shouldFall = false;
    tv.position.y -= (acceleration / 100);
    if (tv.position.y < 0 && shouldFall) {
      if (acceleration > 10 && rotations < 3) {
        tv.rotation.y -= 0.05;
        rotations++;
      }
      acceleration *= -0.5;
      tv.position.y = 0;
    }
  }

  if (animateToScreen) {
    const t = Math.min(movToVideoInter / 5, 1);
    if (t === 1) {movToVideoInter = 0; animateToScreen = false;}
    const lerpedX = (initialCameraPos.x)*(1-t) + ((videoPlaneTarget.x) * t);
    const lerpedY = (initialCameraPos.y)*(1-t) + ((videoPlaneTarget.y) * t);
    const lerpedZ = (initialCameraPos.z)*(1-t) + ((videoPlaneTarget.z) * t);
    const lerpedRotation = (Math.PI/2.5)*(1-Math.min(t*10, 1)) + ((Math.PI / 2) * Math.min(t*10, 1));
    const lerpedTVRot = initialTVRot*(1-Math.min(t*10, 1));
    camera.position.set(lerpedX, lerpedY, lerpedZ);
    camera.rotation.y = lerpedRotation;
    tv.rotation.y = lerpedTVRot;
    movToVideoInter += 0.01;
  }

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObject(cube);
  if (intersects.length > 0 && !animateToScreen) {
    if (!hoveredObjects.includes(tv)) {
      hoveredObjects.push(tv);
    }
  } else {
    hoveredObjects = [];
  }

  outlinePass2.selectedObjects = hoveredObjects;
  
  renderer.render( scene, camera );
  composer.render();
}

export function startThree() {
  canvasSize = canvas.getBoundingClientRect()
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera( 75, canvasSize.width / canvasSize.height, 0.1, 1000 );
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.shadowMap.enabled = true;
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.setSize( canvasSize.width, canvasSize.height );
  canvas.appendChild( renderer.domElement );
  clock = new THREE.Clock();
  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  canvas.addEventListener('mousemove', (event) => {
    if (mouse && canvasSize) {
      mouse.x = ((event.clientX - canvasSize.left) / canvasSize.width) * 2 - 1;
      mouse.y = -((event.clientY - canvasSize.top) / canvasSize.height) * 2 + 1;
    }
  });

  canvas.addEventListener('click', () => {
    if (hoveredObjects.length > 0 && !hasClicked) {
      video.play();
      console.log('playing trailer');
      initialCameraPos = camera.position;
      animateToScreen = true;
      shouldAnimate = false;
      hasClicked = true;
    }
  });

  // add ambient light
  const light = new THREE.AmbientLight( 0x038745 );
  scene.add( light );

  const directionalLight = new THREE.DirectionalLight( 0xddffdd, 3 );
  directionalLight.position.z = -20
  directionalLight.position.y = 10
  directionalLight.position.x = 10
  scene.add( directionalLight );

  const loader = new GLTFLoader();
  loader.load('./assets/3d/CRTSquareTV.glb', function ( gltf ) {
    //rotate object 90 deg on z axis
    // gltf.scene.rotation.y = Math.PI / 2;
    // gltf.scene.rotation.z = Math.PI;
    tv = new THREE.Group();
    tv.add(gltf.scene);
    gltf.scene.scale.set(10, 10, 10);
    tv.position.y = 100;
    tv.position.z = -15;

    //create cube slight bigger than tv
    const geometry = new THREE.BoxGeometry( 5, 6, 5 );
    const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    material.transparent = true;
    material.opacity = 0;
    cube = new THREE.Mesh( geometry, material );
    cube.position.z = -15;
    scene.add( cube );

    // video plane
    video = document.getElementById('trailer-video');
    video.load();
    const texture = new THREE.VideoTexture(video);
    texture.needsUpdate = true;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.format = THREE.RGBAFormat;
    texture.crossOrigin = 'anonymous';

    const imageObject = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 2.5 * (9 / 16)), new THREE.MeshBasicMaterial({ map: texture }));
    imageObject.rotateY(Math.PI / 2);
    imageObject.position.x = 1.5;
    imageObject.position.y = 1;
    imageObject.position.z = -0.1;

    
    tv.add( imageObject );

    scene.add( tv );
    
    videoPlaneTarget = new THREE.Vector3()
    videoPlaneTarget.subVectors(tv.position, new THREE.Vector3(-2.5, 99, 0.05));
    
    //------------------------------

    composer = new EffectComposer( renderer );
    const renderPass = new RenderPass( scene, camera );
    composer.addPass( renderPass );

    outlinePass2 = new OutlinePass(new THREE.Vector2(canvasSize.width, canvasSize.height), scene, camera);
    outlinePass2.renderToScreen = true;
    outlinePass2.selectedObjects = [];
    outlinePass2.edgeStrength = 5.0;
    outlinePass2.edgeGlow = 1.0;
    outlinePass2.edgeThickness = 5.0;
    outlinePass2.pulsePeriod = 5;
    outlinePass2.usePatternTexture = false; // patter texture for an object mesh
    outlinePass2.visibleEdgeColor.set("#ffffff"); // set basic edge color
    outlinePass2.hiddenEdgeColor.set("#ffffff"); // set edge color when it hidden by other objects
    composer.addPass(outlinePass2);

    camera.position.x = 15;
    camera.position.y = 5;
    camera.position.z = 0;
    camera.rotateY(Math.PI / 2.5);

    setTimeout(() => { shouldAnimate = true;}, 500);
    setTimeout(() => { shouldFall = true;}, 5000);

    renderer.setAnimationLoop( animate );
  }, undefined, function ( error ) {
    console.error( error );
  });
}