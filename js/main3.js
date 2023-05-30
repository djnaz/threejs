import "../styles/scss/main.scss";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { Fancybox } from "@fancyapps/ui";
import "@fancyapps/ui/dist/fancybox/fancybox.css";
// import { forEach } from "lodash-es";

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
    //Create scene
    scene = new THREE.Scene();

    // const axesHelper = new THREE.AxesHelper(5);
    // scene.add(axesHelper);

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

    // setup camera
    const fov = 9;
    const aspect = 1 / 1;
    const near = 0.1;
    const far = 200;

    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(0, 0, 75);
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
    const plane = new THREE.PlaneGeometry(28, 13.78125);
    let texturePath;
    let grassMap;
    let grassMap2;
    let grassMaterial;
    if (window.viewportWidth < 1181) {
      texturePath = "/images/threejs/rsm-grass-texture-2.webp";
      const textureLoader = new THREE.TextureLoader();
        grassMap = textureLoader.load(
        texturePath,
        function (loadedTexture) {
          // This function will be called when the texture is loaded
          let grassMaterial = new THREE.MeshStandardMaterial({
            map: grassMap,
          });
          grassMaterial.map.encoding = THREE.sRGBEncoding;
          let ground = new THREE.Mesh(plane, grassMaterial);
          ground.receiveShadow = true;
          ground.position.set(0, 0, 0);
          scene.add(ground);
          onResize();
        },
        undefined,
        function (error) {
          // This function will be called if there's an error loading the texture
          console.error("Error Loading Texture", error);
        }
      );
    } else {
      texturePath = "/images/threejs/rsm-grass-texture-1.webp";
      const textureLoader = new THREE.TextureLoader();
        grassMap = textureLoader.load(
        texturePath,
        function (loadedTexture) {
          // This function will be called when the texture is loaded
          let grassMaterial = new THREE.MeshStandardMaterial({
            map: grassMap,
          });
          grassMaterial.map.encoding = THREE.sRGBEncoding;
          let ground = new THREE.Mesh(plane, grassMaterial);
          ground.receiveShadow = true;
          ground.position.set(0, 0, 0);
          scene.add(ground);
          onResize();
        },
        undefined,
        function (error) {
          // This function will be called if there's an error loading the texture
          console.error("Error Loading Texture", error);
        }
      );
    }

    let viewportWidth;
    let viewportHeight;
    let resizeWidth;
    let containerWidth;
    let containerHeight;
    // on Resize
    const onResize = () => {
      resizeWidth = window.innerWidth;
      viewportHeight = window.innerHeight;

      if (resizeWidth !== viewportWidth) {
        viewportWidth = resizeWidth;

        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        if (viewportWidth > 2000) {
          containerWidth = 2000;
        } else {
          containerWidth = viewportWidth;
        }

        containerHeight = container.offsetHeight;
        console.log(containerHeight);

        if (viewportWidth < 1181) {
          grassMaterial.map = grassMap2;
          grassMaterial.map.encoding = THREE.sRGBEncoding;
          grassMaterial.map.needsUpdate = true;
        } else {
          grassMaterial.map = grassMap;
          grassMaterial.map.encoding = THREE.sRGBEncoding;
          grassMaterial.map.needsUpdate = true;
        }

        camera.aspect = containerWidth / containerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(containerWidth, containerHeight);

        if (visualViewport.width < 1181) {
          camera.position.set(0, 1.25, 69);
        } else if (visualViewport.width < 1601) {
          camera.position.set(0, 0, 69);
        } else {
          camera.position.set(0, 0, 69);
        }

        renderer.render(scene, camera);
        ScrollTrigger.refresh();
      }
    };

    window.addEventListener("resize", onResize);
    onResize();

    // detect orientation change
    let portrait = window.matchMedia("(orientation: portrait)");
    portrait.addEventListener("change", function (e) {
      if (e.matches) {
        onResize();
        // Portrait mode
      } else {
        onResize();
        // Landscape
      }
    });

    Fancybox.bind("[data-fancybox]", {
      // custom options
      Toolbar: {
        display: {
          left: [],
          middle: [],
          right: ["fullscreen", "thumbs", "close"],
        },
      },
      Thumbs: {
        type: "classic",
        showOnStart: false,
      },
    });

    // load Golf Ball Model
    const loadGolfBall = new GLTFLoader();

    loadGolfBall.load("/images/threejs/golfball4.glb", (gltfScene) => {
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

  init();

  // golfball anmiation
  function golfballanim() {
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
    // ScrollTrigger.normalizeScroll(true);
    ScrollTrigger.config({
      ignoreMobileResize: true,
    });
    ScrollTrigger.defaults({
      immediateRender: false,
      ease: "power2.inOut",
      scrub: 3,
      // preventOverlaps: true
    });
    ScrollTrigger.refresh();

    golfball.position.set(0, -7, 1);
    golfball.scale.set(0.7, 0.7, 0.7);

    let mm = gsap.matchMedia();

    // DESKTOP ANIMATION //////////////////////////////////////////////////////
    mm.add("(min-width: 801px)", () => {
      // intro anim
      gsap.to(golfball.rotation, {
        x: -Math.PI * 2 * 4.5,
        scrollTrigger: {
          start: "0",
          end: "+=2000",
        },
        onUpdate: () => {
          renderer.render(scene, camera);
          // console.log(window.pageYOffset)
        },
      });

      gsap.to(golfball.position, {
        y: -0.5,
        scrollTrigger: {
          start: "0",
          end: "+=1000",
        },
      });

      gsap.to(camera.position, {
        y: 0,
        z: -4,
        scrollTrigger: {
          start: "800",
          end: "+=700",
          invalidateOnRefresh: true,
        },
      });

      gsap.to(golfball.scale, {
        x: 0.5,
        y: 0.5,
        z: 0.5,
        scrollTrigger: {
          start: "800",
          end: "+=700",
        },
      });

      gsap.to(".scroll-circle", {
        opacity: 0,
        scrollTrigger: {
          start: "0",
          end: "+=200",
        },
      });

      gsap.to(".golf-intro", {
        opacity: 0,
        scrollTrigger: {
          start: "1200",
          end: "+=300",
          onLeave: () => {
            const golfIntro = document.querySelector(".golf-intro");
            golfIntro.style.zIndex = "0";
          },
          onEnterBack: () => {
            const golfIntro = document.querySelector(".golf-intro");
            golfIntro.style.zIndex = "99";
          },
        },
      });

      gsap.to("section", {
        opacity: 1,
        scrollTrigger: {
          start: "1300",
          end: "+=200",
        },
      });

      gsap.to(".section-one picture img", {
        scale: 1.4,
        scrollTrigger: {
          start: "1300",
          end: "+=2000",
        },
      });

      // Section 1

      gsap.to(".section-one", {
        scrollTrigger: {
          trigger: ".section-one",
          start: "top top",
          end: "+=2800",
          pin: true,
        },
      });

      const rsvpCard = document.querySelector(".section-one .rsvp-card");
      gsap.set(rsvpCard, { xPercent: 200, opacity: 0 });
      gsap.to(rsvpCard, {
        xPercent: 0,
        opacity: 1,
        scrollTrigger: {
          start: "2000",
          end: "+=400",
        },
      });

      // Section 2

      gsap.to(".section-two", {
        scrollTrigger: {
          trigger: ".section-two",
          start: "top top",
          end: "+=400",
          pin: true,
        },
      });

      const section2left = document.querySelector(".section-two .content-left");
      gsap.set(section2left, { x: -200, opacity: 0 });
      gsap.to(section2left, {
        x: 0,
        opacity: 1,
        scrollTrigger: {
          trigger: ".section-two",
          start: "top 75%",
          end: "+=400",
        },
      });

      gsap.set(".gallery1 > a", { x: 200, opacity: 0 });
      ScrollTrigger.batch(".gallery1 > a", {
        onEnter: (elements, triggers) =>
          gsap.to(elements, {
            x: 0,
            opacity: 1,
            stagger: 0.15,
            ease: "Power3.inOut",
            scrollTrigger: {
              trigger: elements[0],
              start: "top 75%",
              end: "+=400",
              scrub: 2,
              fastScrollEnd: true,
            },
            overwrite: true,
          }),
      });

      // Section 3

      gsap.to(".section-three", {
        scrollTrigger: {
          trigger: ".section-three",
          start: "top top",
          end: "+=400",
          pin: true,
        },
      });

      const section3center = document.querySelector(
        ".section-three .content-center"
      );
      gsap.set(section3center, { y: 200, opacity: 0 });
      gsap.to(section3center, {
        y: 0,
        opacity: 1,
        scrollTrigger: {
          trigger: ".section-three",
          start: "top 80%",
          end: "+=400",
        },
      });

      // Section 4
      gsap.to(".section-four", {
        scrollTrigger: {
          trigger: ".section-four",
          start: "top top",
          end: "+=1000",
          pin: true,
        },
      });

      gsap.set(".section-four > picture .overlay", { opacity: 0 });
      gsap.to(".section-four > picture .overlay", {
        opacity: 0.35,
        scrollTrigger: {
          trigger: ".section-four .content-left",
          start: "top top",
          end: "+=400",
          scrub: 3,
          fastScrollEnd: true,
        },
        overwrite: true,
      });
      gsap.set(".section-four .content-left", { xPercent: -100, opacity: 0 });
      gsap.to(".section-four .content-left", {
        xPercent: 0,
        opacity: 1,
        scrollTrigger: {
          trigger: ".section-four .content-left",
          start: "top 25%",
          end: "+=400",
          scrub: 3,
          fastScrollEnd: true,
        },
        overwrite: true,
      });
      gsap.set(".gallery2 > a", { x: 200, opacity: 0 });
      ScrollTrigger.batch(".gallery2 > a", {
        onEnter: (elements, triggers) =>
          gsap.to(elements, {
            x: 0,
            opacity: 1,
            stagger: 0.15,
            scrollTrigger: {
              trigger: elements[0],
              start: "top 20%",
              end: "+=400",
              scrub: 3,
              fastScrollEnd: true,
            },
            overwrite: true,
          }),
      });

      // Section 5

      gsap.to(".section-five", {
        scrollTrigger: {
          trigger: ".section-five",
          start: "top top",
          end: "+=400",
          pin: true,
        },
      });

      const section5left = document.querySelector(
        ".section-five .content-left"
      );
      gsap.set(section5left, { x: -200, opacity: 0 });
      gsap.to(section5left, {
        x: 0,
        opacity: 1,
        scrollTrigger: {
          trigger: ".section-five",
          start: "top 75%",
          end: "+=400",
        },
      });
      const section5right = document.querySelector(
        ".section-five .content-right"
      );
      gsap.set(section5right, { x: 200, opacity: 0 });
      gsap.to(section5right, {
        x: 0,
        opacity: 1,
        scrollTrigger: {
          trigger: ".section-five",
          start: "top center",
          end: "+=400",
        },
      });

      // Section 6

      gsap.to(".section-six", {
        scrollTrigger: {
          trigger: ".section-six",
          start: "top top",
          end: "+=400",
          pin: true,
        },
      });

      const section6form = document.querySelector(".section-six .form-wrapper");
      gsap.set(section6form, { y: 200, opacity: 0 });
      gsap.to(section6form, {
        y: 0,
        opacity: 1,
        scrollTrigger: {
          trigger: ".section-six",
          start: "top 25%",
          end: "+=200",
        },
      });

      // when ScrollTrigger does a refresh(), it maps all the positioning data which
      // factors in transforms, but in this example we're initially setting all the ".box"
      // elements to a "y" of 100 solely for the animation in which would throw off the normal
      // positioning, so we use a "refreshInit" listener to reset the y temporarily. When we
      // return a gsap.set() in the listener, it'll automatically revert it after the refresh()!
      ScrollTrigger.addEventListener("refreshInit", () => {
        gsap.set(".section-four .content-left", { xPercent: -100, opacity: 0 });
        gsap.set(".gallery1 > a", { x: 200, opacity: 0 });
        gsap.set(".gallery2 > a", { x: 200, opacity: 0 });
      });

      return () => {
        // when changing from mobile to desktop, reset scrollbar to top
        window.scrollTo(0, 0);
      };
    });

    // MOBILE ANIMATION //////////////////////////////////////////////////////

    mm.add("(max-width: 800px)", () => {
      // intro anim
      gsap.to(golfball.rotation, {
        x: -Math.PI * 2 * 4.5,
        scrollTrigger: {
          start: "0",
          end: "+=2000",
        },
        onUpdate: () => {
          renderer.render(scene, camera);
          // console.log(window.pageYOffset)
        },
      });

      gsap.to(golfball.position, {
        y: -0.5,
        scrollTrigger: {
          start: "0",
          end: "+=1000",
        },
      });

      gsap.to(camera.position, {
        y: 0,
        z: -4,
        scrollTrigger: {
          start: "800",
          end: "+=700",
          invalidateOnRefresh: true,
        },
      });

      gsap.to(golfball.scale, {
        x: 0.5,
        y: 0.5,
        z: 0.5,
        scrollTrigger: {
          start: "800",
          end: "+=700",
        },
      });

      gsap.to(".scroll-circle", {
        opacity: 0,
        scrollTrigger: {
          start: "0",
          end: "+=200",
        },
      });

      gsap.to(".golf-intro", {
        opacity: 0,
        scrollTrigger: {
          start: "1200",
          end: "+=300",
          onLeave: () => {
            const golfIntro = document.querySelector(".golf-intro");
            golfIntro.style.zIndex = "0";
          },
          onEnterBack: () => {
            const golfIntro = document.querySelector(".golf-intro");
            golfIntro.style.zIndex = "99";
          },
        },
      });

      gsap.to("section", {
        opacity: 1,
        scrollTrigger: {
          start: "1300",
          end: "+=200",
        },
      });

      gsap.to(".section-one picture img", {
        scale: 1.4,
        scrollTrigger: {
          start: "1300",
          end: "+=2000",
        },
      });

      // Section 1

      gsap.to(".section-one", {
        scrollTrigger: {
          trigger: ".section-one",
          start: "top top",
          end: "+=2800",
          pin: true,
        },
      });

      const rsvpCard = document.querySelector(".section-one .rsvp-card");
      gsap.set(rsvpCard, { xPercent: 200, opacity: 0 });
      gsap.to(rsvpCard, {
        xPercent: 0,
        opacity: 1,
        scrollTrigger: {
          start: "2000",
          end: "+=400",
        },
      });

      // Section 2

      // Section 3

      const section3center = document.querySelector(
        ".section-three .content-center"
      );
      gsap.set(section3center, { y: 100, opacity: 0 });
      gsap.to(section3center, {
        y: 0,
        opacity: 1,
        scrollTrigger: {
          trigger: ".section-three",
          start: "top 80%",
          end: "+=200",
        },
      });

      // Section 4

      // Section 5

      gsap.to(".section-five", {
        scrollTrigger: {
          trigger: ".section-five",
          start: "top top",
          end: "+=400",
        },
      });

      const section5left = document.querySelector(
        ".section-five .content-left"
      );
      gsap.set(section5left, { x: -200, opacity: 0 });
      gsap.to(section5left, {
        x: 0,
        opacity: 1,
        scrollTrigger: {
          trigger: ".section-five",
          start: "top 75%",
          end: "+=400",
        },
      });
      const section5right = document.querySelector(
        ".section-five .content-right"
      );
      gsap.set(section5right, { x: 200, opacity: 0 });
      gsap.to(section5right, {
        x: 0,
        opacity: 1,
        scrollTrigger: {
          trigger: ".section-five",
          start: "top center",
          end: "+=400",
        },
      });

      // Section 6

      // when ScrollTrigger does a refresh(), it maps all the positioning data which
      // factors in transforms, but in this example we're initially setting all the ".box"
      // elements to a "y" of 100 solely for the animation in which would throw off the normal
      // positioning, so we use a "refreshInit" listener to reset the y temporarily. When we
      // return a gsap.set() in the listener, it'll automatically revert it after the refresh()!
      ScrollTrigger.addEventListener("refreshInit", () => {
        gsap.set(".section-four .content-left", { xPercent: 0, opacity: 1 });
        gsap.set(".gallery1 > a", { x: 0, opacity: 1 });
        gsap.set(".gallery2 > a", { x: 0, opacity: 1 });
      });

      return () => {
        // when changing from mobile to desktop, reset scrollbar to top
        window.scrollTo(0, 0);
      };
    });

    // Ballmarker Anim
    const ballmarker = document.querySelector(".ballmarker");
    const navlinks = document.querySelector(".nav-links > div");
    ballmarker.addEventListener("click", () => {
      if (ballmarker.classList.contains("active")) {
        gsap.to(navlinks, {
          duration: 0.5,
          xPercent: -100,
          opacity: 0,
        });
      } else {
        gsap.to(navlinks, {
          duration: 0.5,
          xPercent: 0,
          opacity: 1,
        });
      }
      ballmarker.classList.toggle("active");
    });

    // Button links
    const rsvpBtns = document.querySelectorAll(".rsvp-btn");
    rsvpBtns.forEach((rsvpbtn) => {
      rsvpbtn.addEventListener("click", function (e) {
        gsap.to(window, {
          duration: 0,
          scrollTo: {
            y: "#section-six",
            offsetY: -400,
          },
        });
      });
    });
    const alinks = document.querySelectorAll(".alink.o400");
    alinks.forEach((alink) => {
      const dataVal = alink.getAttribute("data-linkval");
      alink.addEventListener("click", function (e) {
        gsap.to(window, {
          duration: 0,
          scrollTo: {
            y: dataVal,
            offsetY: -400,
          },
        });
      });
    });
    const alinks2 = document.querySelectorAll(".alink.o1000");
    alinks2.forEach((alink) => {
      const dataVal = alink.getAttribute("data-linkval");
      alink.addEventListener("click", function (e) {
        gsap.to(window, {
          duration: 0,
          scrollTo: {
            y: dataVal,
            offsetY: -400,
          },
        });
      });
    });

    // Scroll Arrow Anim
    const scrollCircle = document.querySelector(".scroll-circle");
    const tlScroll = gsap.timeline({
      repeat: -1,
      yoyo: true,
    });
    tlScroll.add("start").to(scrollCircle, {
      duration: 0.5,
      y: -10,
    });
  }
}

setupScene();
