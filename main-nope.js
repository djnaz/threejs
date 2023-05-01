import './styles/scss/main.scss';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { throttle } from 'lodash-es';

function setCanvasDimensions(
  canvas,
  width,
  height,
  set2dTransform = false
) {
  const ratio = window.devicePixelRatio;
  canvas.width = width * ratio;
  canvas.height = height * ratio;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  if (set2dTransform) {
    canvas.getContext('2d').setTransform(ratio, 0, 0, ratio, 0, 0);
  }
}

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.normalizeScroll(true);
ScrollTrigger.config({
  ignoreMobileResize: true
});

const PI = Math.PI;

// SCENE

let size = {width: 0, height: 0};

const scene = new THREE.Scene();

// const axesHelper = new THREE.AxesHelper( 5 );
// scene.add( axesHelper );

// setup canvas 
const renderer = new THREE.WebGLRenderer({antialias: true});

renderer.useLegacyLights = true;
renderer.outputEcoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.toneMappingExposure = 5;
renderer.shadowMap.enabled = true;
renderer.shadowMapSoft = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const container = document.querySelector('.canvas-wrapper');
container.appendChild(renderer.domElement);

// setup camera
const fov = 10;
const aspect = size.width / size.height;  // the canvas default
const near = 0.1;
const far = 100;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.set(0,50,0);
let cameraTarget = new THREE.Vector3(0, 1, 0);
scene.add(camera);

// add lights
const color = 0xFFFFFF;
const intensity = 1;
const directionalLight = new THREE.DirectionalLight(color, intensity/3);
directionalLight.castShadow = true;
directionalLight.shadow.camera.far = 10000;
directionalLight.shadow.mapSize.set(512, 512);
directionalLight.shadow.normalBias = 0.05;
directionalLight.position.set(2000, 8000, -2000);
scene.add(directionalLight);

const colorSky = '#c2c2ee';
const colorGround = '#337233';
const hemisphericalLight = new THREE.HemisphereLight(colorSky, colorGround, intensity/8);
scene.add(hemisphericalLight);

const ambientIntensity = 0.01;
const ambientLight = new THREE.AmbientLight( color, ambientIntensity ); // soft white light
scene.add(ambientLight);

// add ground
const plane = new THREE.PlaneGeometry(100, 100);
const groundMaterial = new THREE.MeshStandardMaterial({color: colorGround});
const ground = new THREE.Mesh(plane, groundMaterial);
ground.receiveShadow = true;
ground.rotateX(-PI * 0.5);
scene.add(ground);

// on Resize
const resizeUpdateInterval = 500;

const onResize = () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  setCanvasDimensions(renderer.domElement, width, height);
}
onResize();

window.addEventListener(
  'resize',
  throttle(
    onResize,
    resizeUpdateInterval,
    { trailing: true }
  )
);

const tick = () => {
  camera.lookAt(cameraTarget);
  renderer.render(scene, camera);
  window.requestAnimationFrame(() => tick());
}

tick();


// set canvas drawingbuffer size to match html canvas
// function resizeRendererToDisplaySize(renderer) {
//   const canvas = renderer.domElement;
//   const width = canvas.clientWidth;
//   const height = canvas.clientHeight;
//   const needResize = canvas.width !== width || canvas.height !== height;
//   if (needResize) {
//     renderer.setSize(width, height, false);
//   }
//   return needResize;
// }

// load Golf Ball Model
const loadGolfBall = new GLTFLoader();

loadGolfBall.load('./golfball.gltf', (gltfScene) => {
  const golfball = gltfScene.scene;
  const roll = PI*2;
  console.log(golfball);
  golfball.traverse(child => {
    if(child instanceof THREE.Mesh){
      child.receiveShadow = true;
      child.castShadow = true;
    }
  });
  golfball.position.set(0,1,4);
  // golfball.rotation.set(-PI*2.48,-5.75,0);
  scene.add(golfball);

  //golfball.rotation.x = roll*1; // rotate around x axis 4 times
  
  const setupAnimation = () => {

  }

  const golfballAnimation = () => {
    let section = 0;
    const tl = gsap.timeline({
      default: {
        duration: 1,
        ease: 'power2.inOut'
      },
      scrollTrigger: {
        trigger: '.main',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 3,
        snap: "labelsDirectional",
        markers: true,
        pin: true
      }
    })

    tl
      .addLabel("startLabel", 0)
      .addLabel("endLabel", 1)
      .to(golfball.position, {z: -0}, section)
      .to(golfball.rotation, {x: -PI*4.5}, section)
  }
  golfballAnimation();
  
})

renderer.render(scene, camera);