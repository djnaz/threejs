import "./styles/scss/main.scss";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
// import { ScrollSmoother } from "gsap/ScrollSmoother";

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
    container = document.querySelector(".golf-intro");

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

    container = document.querySelector(".golf-intro");
    container.appendChild(renderer.domElement);
    let canvasWidth = window.innerWidth; // set canvas size to fill viewport on load
    let canvasHeight = window.innerHeight; // set canvas size to fill viewport on load
    console.log(canvasWidth + "/" + canvasHeight);
    renderer.setSize(canvasWidth, canvasHeight);

    // function render() {
    //   renderer.render(scene, camera);
    // }

    // setup camera
    const fov = 9;
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
    directionalLight.position.set(2000, 2000, 4000);
    scene.add(directionalLight);

    const ambientIntensity = 0.2;
    const ambientLight = new THREE.AmbientLight(color, ambientIntensity); // soft white light
    scene.add(ambientLight);

    // add ground
    const plane = new THREE.PlaneGeometry(32, 16);
    //const groundMaterial = new THREE.MeshStandardMaterial({color: colorGround});
    const grassMap = new THREE.TextureLoader().load("./turf.webp");
    const grassMaterial = new THREE.MeshStandardMaterial({ map: grassMap });
    grassMaterial.map.encoding = THREE.sRGBEncoding;
    const ground = new THREE.Mesh(plane, grassMaterial);
    ground.receiveShadow = true;
    ground.position.set(0, 0, 0);
    scene.add(ground);

    // on Resize
    const onResize = () => {
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      canvasWidth = container.clientWidth; // set canvas size to fill canvas wrapper on resize
      canvasHeight = container.clientHeight; // set canvas size to fill canvas wrapper on resize
      camera.aspect = canvasWidth / canvasHeight;
      if(window.visualViewport.width < 800) {
        camera.position.set(0,0,200);
      } else {
        camera.position.set(0,0,100);
      }   
      camera.updateProjectionMatrix();
      renderer.setSize(canvasWidth, canvasHeight);
      renderer.render(scene, camera);
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

  // let requestId;

  // function animate() {
  //   renderer.render(scene, camera);
  //   requestId = requestAnimationFrame(animate);
  // }
  
  // // start the animation loop
  // requestId = requestAnimationFrame(animate);

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
      scrub: 4,
      // preventOverlaps: true
    });

    // scene.position.set(0, 0, 1);
    golfball.position.set(0, -9, 1);

    let tl = gsap.timeline();

    // intro anim
    tl.to(golfball.rotation, {
      x: -Math.PI * 2 * 4.25,
      scrollTrigger: {
        trigger: ".section-one",
        start: "top top",
        end: "+=2000",
      },
      onUpdate: () => {
        renderer.render(scene, camera);
      }
    })
      .to(golfball.position, {
        y: -.5,
        scrollTrigger: {
          trigger: ".section-one",
          start: "top top",
          end: "+=1000",
        },
      })
      .to(camera.position, {
        y: 0,
        z: -4,
        scrollTrigger: {
          trigger: ".section-one",
          start: "800",
          end: "+=700",
          invalidateOnRefresh: true
        },
      })
      .to(golfball.scale, {
        x: 0.5,
        y: 0.5,
        z: 0.5,
        scrollTrigger: {
          trigger: ".section-one",
          start: "800",
          end: "+=700",
        },
      })
      .to(".golf-intro", {
        opacity: 0,
        scrollTrigger: {
          trigger: ".section-one",
          start: "1200",
          end: "+=300",
          // onLeave: () => {
          //   const golfIntro = document.querySelector(".golf-intro");
          //   golfIntro.style.display = "none";
          // },
          // onEnterBack: () => {
          //   const golfIntro = document.querySelector(".golf-intro");
          //   golfIntro.style.display = "block";
          // },
        }
      })
      .to("section", {
        opacity: 1,
        scrollTrigger: {
          trigger: ".section-one",
          start: "1300",
          end: "+=200",
        }
      })
      .to(".section-one img", {
        scale: 1.4,
        scrollTrigger: {
          trigger: ".section-one",
          start: "1300",
          end: "+=2000",
        },
        ease: "power3.out"
      })
      .to(".section-one", {
        scrollTrigger: {
          trigger: ".section-one",
          start: "top top",
          end: "+=6000",
          pin: true,
        },
      })


      // Section 2
      // timeline 6000
      .to(".section-two", {
        scrollTrigger: {
          trigger: ".section-two",
          start: "top top",
          end: "+=1000",
          pin: true,
        }
      })
      .to(".section-two h2", {
        x: 100,
        scrollTrigger: {
          trigger: ".section-two",
          start: "top top",
          end: "+=1000",
        },
      })

      // Section 3
      // timeline 7000
      .to(".section-three", {
        scrollTrigger: {
          trigger: ".section-three",
          start: "top top",
          end: "+=1000",
          pin: true,
        }
      })
      .to(".section-three h2", {
        x: -100,
        scrollTrigger: {
          trigger: ".section-three",
          start: "top top",
          end: "+=1000",
        },
      })

      // Section 4
      // timeline 8000
      .to(".section-four", {
        scrollTrigger: {
          trigger: ".section-four",
          start: "top top",
          end: "+=1000",
          pin: true,
        }
      })
      .to(".section-four h2", {
        x: 100,
        scrollTrigger: {
          trigger: ".section-four",
          start: "top top",
          end: "+=1000",
        },
      })

      // Section 5
      // timeline 9000



  }
}

setupScene();
