import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// prevents the last scroll location on the page to be restored
history.scrollRestoration = 'manual';

function addModelToBG() {
  //Variables for setup

  let container;
  let camera;
  let renderer;
  let scene;
  let golfball;

  function init() {
    container = document.querySelector(".scene.one");

    //Create scene
    scene = new THREE.Scene();

    const axesHelper = new THREE.AxesHelper( 5 );
    scene.add( axesHelper );

    const fov = 10;
    const aspect = container.clientWidth / container.clientHeight;
    const near = 0.1;
    const far = 200;

    //Camera setup
    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(0,0,100);
    let cameraTarget = new THREE.Vector3(0, 0, 1);
    scene.add(camera);

    //Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.useLegacyLights = true;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.CineonToneMapping;
    renderer.shadowMap.enabled = true;
    renderer.shadowMapSoft = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    container.appendChild(renderer.domElement);

    function render() {
      renderer.render(scene, camera);
    }

    // add lights
    const color = 0xffffff;
    const intensity = 1;
    const directionalLight = new THREE.DirectionalLight(color, intensity / 1.5);
    directionalLight.castShadow = true;
    const d = 10;
    directionalLight.shadow.camera.left = -d;
    directionalLight.shadow.camera.right = d;
    directionalLight.shadow.camera.top = d;
    directionalLight.shadow.camera.bottom = -d;
    directionalLight.shadow.camera.far = 10000;
    directionalLight.shadow.mapSize.set(512, 512);
    directionalLight.shadow.normalBias = 0.05;
    directionalLight.position.set(2000, 2000, 2000);
    scene.add(directionalLight);

    const ambientIntensity = 0.2;
    const ambientLight = new THREE.AmbientLight(color, ambientIntensity); // soft white light
    scene.add(ambientLight);

    animate();

    // add ground
    const plane = new THREE.PlaneGeometry(30, 30);
    //const groundMaterial = new THREE.MeshStandardMaterial({color: colorGround});
    const grassMap = new THREE.TextureLoader().load("./grass.webp");
    const grassMaterial = new THREE.MeshStandardMaterial({ map: grassMap });
    grassMaterial.map.encoding = THREE.sRGBEncoding;
    const ground = new THREE.Mesh(plane, grassMaterial);
    ground.receiveShadow = true;
    ground.position.set(0, 2, 0);
    ground.rotation.set(0,Math.PI * 0.5,1,-Math.PI * 0.5);
    scene.add(ground);

    // load Golf Ball Model
    const loadGolfBall = new GLTFLoader();

    loadGolfBall.load("./golfball4.glb", (gltfScene) => {
      golfball = gltfScene.scene;
      console.log(gltfScene);
      golfball.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.receiveShadow = true;
          child.castShadow = true;
        }
      });
      scene.add(golfball);
      golfballanim();
    });
  }

  function animate() {
    requestAnimationFrame(animate);
    // box.rotation.z += 0.005;

    // console.log('X: ' +camera.position.x)
    // console.log('Y: ' +camera.position.y)
    // console.log('Z: ' +camera.position.z)

    renderer.render(scene, camera);
  }

  init();

  function onWindowResize() {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
    ScrollTrigger.refresh();
  }

  window.addEventListener("resize", onWindowResize);

  // function onWindowScroll() {
  // }

  // window.addEventListener("scroll", onWindowScroll);

  function golfballanim() {
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.normalizeScroll(true);
    ScrollTrigger.config({
    ignoreMobileResize: true
    });

    scene.position.set(0, 0, 1);
    golfball.position.set(0,-10,1);
    // scene.rotation.set(0, 1.88, 0)
    // camera.position.set(0,0,5)

    let car_anim = gsap.timeline();

    // Full Height

    car_anim.to(golfball.rotation, {
      x: -Math.PI*4,
      scrollTrigger: {
        trigger: ".section-two",
        scrub:4,
        // snap: 1,
        start: "top bottom",
        end: "top top",
        markers: true
      },
    });

    // Slide 2

    car_anim.to(golfball.position, {
      y: 0,
      scrollTrigger: {
        trigger: ".section-two",
        scrub: 4,
        // snap: 1,
        start: "top bottom",
        end: "top top",
        markers: true
      },
    });

    // Slide 3

    // car_anim.to(golfball.rotation, {
    //   z: 1.6,
    //   ease: "power1.inOut",
    //   scrollTrigger: {
    //     trigger: ".section-three",
    //     scrub: 1,

    //     start: "top bottom",
    //     end: "top top",
    //   },
    // });

    // // Slide 4 - The problem child

    // car_anim.to(golfball.rotation, {
    //   z: 0.02,
    //   y: 3.1,
    //   ease: "power1.inOut",
    //   scrollTrigger: {
    //     trigger: ".section-four",
    //     scrub: 1,

    //     start: "top 50%",
    //     end: "top top",
    //   },
    // });

    // car_anim.to(camera.position, {
    //   x: 0,
    //   ease: "power1.inOut",
    //   scrollTrigger: {
    //     trigger: ".section-four",
    //     scrub: 1,

    //     start: "top top",
    //     end: "bottom top",
    //   },
    // });
  }

  // car_anim.progress(1).progress(0);
}
addModelToBG();
