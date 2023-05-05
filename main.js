import "./styles/scss/main.scss";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";

// prevents the last scroll location on the page to be restored
history.scrollRestoration = "manual";

function setupScene() {
  //Variables for setup

  let container;
  let camera;
  let renderer;
  let scene;
  let golfball;

  function init() {
    container = document.querySelector(".canvas-wrapper");

    //Create scene
    scene = new THREE.Scene();

    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);

    //Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.useLegacyLights = true;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.CineonToneMapping;
    renderer.shadowMap.enabled = true;
    renderer.shadowMapSoft = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container = document.querySelector(".canvas-wrapper");
    container.appendChild(renderer.domElement);
    let canvasWidth = window.innerWidth; // set canvas size to fill viewport on load
    let canvasHeight = window.innerHeight; // set canvas size to fill viewport on load
    console.log(canvasWidth + "/" + canvasHeight);
    renderer.setSize(canvasWidth, canvasHeight);

    // function render() {
    //   renderer.render(scene, camera);
    // }

    // setup camera
    const fov = 10;
    const aspect = canvasWidth / canvasHeight;
    const near = 0.1;
    const far = 200;

    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(0, 0, 100);
    let cameraTarget = new THREE.Vector3(0, 0, -4);
    scene.add(camera);

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
    scene.add(ground);

    // on Resize
    const onResize = () => {
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      canvasWidth = container.clientWidth; // set canvas size to fill canvas wrapper on resize
      canvasHeight = container.clientHeight; // set canvas size to fill canvas wrapper on resize
      camera.aspect = canvasWidth / canvasHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(canvasWidth, canvasHeight);
      ScrollTrigger.refresh();
    };

    window.addEventListener("resize", onResize);
    onResize();

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
    renderer.render(scene, camera);
  }

  init();

  // golfball anmiation
  function golfballanim() {
    
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.normalizeScroll(true);
    ScrollTrigger.config({
      ignoreMobileResize: true,
    });
    ScrollTrigger.defaults({
      // immediateRender: false,
      ease: "power2.inOut",
      scrub: 2,
      end: '2000',
      markers: true,
      preventOverlaps: true
    });

    scene.position.set(0, 0, 1);
    golfball.position.set(0, -10, 1);

    // intro anim
    gsap.to(golfball.rotation, {
      x: -Math.PI * 2 * 4.1,
      scrollTrigger: {
        trigger: ".section-two",
        start: "top bottom",  
      }
    });
    gsap.to(golfball.position, {
      y: 1.7,
      scrollTrigger: {
        trigger: ".section-two",
        start: "top bottom",
      }
    });

    // gsap.to(golfball.position, {
    //   z: -4,
    //   scrollTrigger: {
    //     trigger: ".section-two",
    //     start: "top 30%",
    //     end: "top top"
    //   }
    // });

    // hole anim
    gsap.to(camera.position, {
      y: 2,
      z: -4,
      scrollTrigger: {
        trigger: ".section-two",
        start: "1000",
      }
    });
    gsap.to(golfball.scale, {
      x: .45,
      y: .45,
      z: .45,
      scrollTrigger: {
        trigger: ".section-two",
        start: "1000",
      }
    });
    gsap.to('.canvas-wrapper', {
      opacity: 0,
      scrollTrigger: {
        trigger: ".section-two",
        start: "1200",
        end: "1800"
      }
    });

    gsap.to('section', {
      opacity: 1,
      scrollTrigger: {
        trigger: ".section-two",
        start: "1600",
        end: "1800",
      }
    });
    gsap.to('section', {
      opacity: 1,
      scrollTrigger: {
        trigger: ".section-three",
        start: "top top",
        end: "1800",
      }
    });


  }

}

setupScene();
