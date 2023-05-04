import './styles/scss/main.scss';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// prevents the last scroll location on the page to be restored
history.scrollRestoration = 'manual';

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.normalizeScroll(true);
ScrollTrigger.config({
  ignoreMobileResize: true
});

const PI = Math.PI;

// SCENES

const scene = new THREE.Scene();
const scene2 = new THREE.Scene();

const axesHelper = new THREE.AxesHelper( 5 );
scene.add( axesHelper );

// setup canvas 
const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.useLegacyLights = true;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.CineonToneMapping;
renderer.shadowMap.enabled = true;
renderer.shadowMapSoft = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const container = document.querySelector('.canvas-wrapper');
container.appendChild(renderer.domElement);
let canvasWidth = window.innerWidth; // set canvas size to fill viewport on load
let canvasHeight = window.innerHeight; // set canvas size to fill viewport on load
console.log(canvasWidth + '/' + canvasHeight);
renderer.setSize(canvasWidth, canvasHeight);

// setup camera
const fov = 10;
const aspect = canvasWidth / canvasHeight;
const near = 0.1;
const far = 200;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.set(0,100,0);
let cameraTarget = new THREE.Vector3(0, 1, 0);
scene.add(camera);

// add lights
const color = 0xFFFFFF;
const intensity = 1;
const directionalLight = new THREE.DirectionalLight(color, intensity/1.5);
directionalLight.castShadow = true;
const d = 10;
directionalLight.shadow.camera.left = - d;
directionalLight.shadow.camera.right = d;
directionalLight.shadow.camera.top = d;
directionalLight.shadow.camera.bottom = - d;
directionalLight.shadow.camera.far = 10000;
directionalLight.shadow.mapSize.set(512, 512);
directionalLight.shadow.normalBias = .05;
directionalLight.position.set(2000, 8000, -2000);
scene.add(directionalLight);

// Camera Helper
// scene.add( new THREE.CameraHelper( directionalLight.shadow.camera ) );

const ambientIntensity = 0.2;
const ambientLight = new THREE.AmbientLight( color, ambientIntensity ); // soft white light
scene.add(ambientLight);

// add ground
const plane = new THREE.PlaneGeometry(30, 30);
//const groundMaterial = new THREE.MeshStandardMaterial({color: colorGround});
const grassMap = new THREE.TextureLoader().load( './grass.webp' );
const grassMaterial = new THREE.MeshStandardMaterial( { map: grassMap } );
grassMaterial.map.encoding = THREE.sRGBEncoding;
const ground = new THREE.Mesh(plane, grassMaterial);
ground.receiveShadow = true;
ground.position.set(0,0,-2);
ground.rotateX(-PI * 0.5);
// scene.add(ground);

// on Resize
const onResize = () => {
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  canvasWidth = container.clientWidth; // set canvas size to fill canvas wrapper on resize
  canvasHeight = container.clientHeight; // set canvas size to fill canvas wrapper on resize
  camera.aspect = canvasWidth / canvasHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(canvasWidth, canvasHeight);
  ScrollTrigger.refresh();
}

window.addEventListener('resize', onResize);
onResize();

// load Golf Ball Model
const loadGolfBall = new GLTFLoader();
let golfball = {};

loadGolfBall.load('./golfball4.glb', (gltfScene) => {
  golfball = gltfScene.scene;
  console.log(gltfScene);
  golfball.traverse(child => {
    if(child instanceof THREE.Mesh){
      child.receiveShadow = true;
      child.castShadow = true;
    }
  });
  scene.add(golfball);

  golfballAnimation(); 
})

function golfballAnimation() {
  scene.position.set(0,1,10);
  ScrollTrigger.defaults({
    immediateRender: false,
    ease: "power1.inOut",
    scrub: true
  });
  const tl = gsap.timeline()

  tl
    // intro  
    .to(scene.position, {z: -0,
      scrollTrigger: {
        trigger: '.intro',
        start: 'start -4px',
        end: 'bottom bottom',

        markers: true,
        // invalidateOnRefresh: true
      }})
    .to(scene.rotation, {x: -PI*4.5,
      scrollTrigger: {
        trigger: '.intro',
        start: 'start -4px',
        end: 'bottom bottom',

        markers: true,
        // invalidateOnRefresh: true
      }})

      // fade
      // .to(scene.position, {z: -6,
      //   scrollTrigger: {
      //     trigger: '.fade',
      //     start: 'top top',
      //     end: 'bottom bottom',

      //     markers: true,
      //     // invalidateOnRefresh: true
      //   }})
      // .to(scene.rotation, {x: -PI*9,
      //   scrollTrigger: {
      //     trigger: '.fade',
      //     start: 'top top',
      //     end: 'bottom bottom',

      //     markers: true,
      //     // invalidateOnRefresh: true
      //   }})
}

// const tick = () => {
//   camera.lookAt(cameraTarget);
//   renderer.render(scene, camera);
//   window.requestAnimationFrame(() => tick());
// }
// tick();


function animate() {
  camera.lookAt(cameraTarget);
  requestAnimationFrame(animate);      
  renderer.render(scene, camera);
}
animate();