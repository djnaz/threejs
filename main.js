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

// SCENE

let size = {width: 0, height: 0};

const scene = new THREE.Scene();

// const axesHelper = new THREE.AxesHelper( 5 );
// scene.add( axesHelper );

// setup canvas 
const renderer = new THREE.WebGLRenderer({antialias: true});

renderer.useLegacyLights = true;
renderer.outputEcoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.CineonToneMapping;
renderer.toneMappingExposure = 5;
renderer.shadowMap.enabled = true;
renderer.shadowMapSoft = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// const container = document.querySelector('.canvas-wrapper');
// container.appendChild(renderer.domElement);
document.body.appendChild( renderer.domElement );

// setup camera
const fov = 10;
const aspect = size.width / size.height;  // the canvas default
const near = 0.1;
const far = 200;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.set(0,100,0);
let cameraTarget = new THREE.Vector3(0, 1, 0);
scene.add(camera);

// add lights
const color = 0xFFFFFF;
const intensity = .4;
const directionalLight = new THREE.DirectionalLight(color, intensity/3);
directionalLight.castShadow = true;
const d = 10;
directionalLight.shadow.camera.left = - d;
directionalLight.shadow.camera.right = d;
directionalLight.shadow.camera.top = d;
directionalLight.shadow.camera.bottom = - d;
directionalLight.shadow.camera.far = 10000;
directionalLight.shadow.mapSize.set(512, 512);
directionalLight.shadow.normalBias = 0.05;
directionalLight.position.set(2000, 8000, -2000);
scene.add(directionalLight);

// Camera Helper
// scene.add( new THREE.CameraHelper( directionalLight.shadow.camera ) );

const ambientIntensity = 0.05;
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
scene.add(ground);

// on Resize
const onResize = () => {
  // size.width = container.clientWidth;
  // size.height = container.clientHeight;
  size.width = window.innerWidth;
  size.height = window.innerHeight;
  camera.aspect = size.width / size.height;
  camera.updateProjectionMatrix();
  renderer.setSize(size.width, size.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  ScrollTrigger.refresh();
}

window.addEventListener('resize', onResize);
onResize();

const tick = () => {
  camera.lookAt(cameraTarget);
  renderer.render(scene, camera);
  window.requestAnimationFrame(() => tick());
}

tick();

// load Golf Ball Model
const loadGolfBall = new GLTFLoader();

loadGolfBall.load('./golfball3.gltf', (gltfScene) => {
  const golfball = gltfScene.scene;
  const roll = PI*2;
  console.log(golfball);
  golfball.traverse(child => {
    if(child instanceof THREE.Mesh){
      child.receiveShadow = true;
      child.castShadow = true;
    }
  });
  golfball.position.set(0,1,10);
  // golfball.rotation.set(-PI*2.48,-5.75,0);
  scene.add(golfball);

  //golfball.rotation.x = roll*1; // rotate around x axis 4 times

  const golfballAnimation = () => {
    let section = 0;
    const tl = gsap.timeline({
      default: {
        duration: 2,
        ease: 'power2.inOut'
      },
      scrollTrigger: {
        trigger: '.intro',
        start: 'start -4px',
        end: 'bottom bottom',
        scrub: 8,

        markers: true,
        invalidateOnRefresh: true
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