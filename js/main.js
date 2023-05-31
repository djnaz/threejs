import "../styles/scss/main.scss";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { Fancybox } from "@fancyapps/ui";
import "@fancyapps/ui/dist/fancybox/fancybox.css";

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
    let grassMap;
    let grassMap2;
    let grassMaterial;
    if (window.innerWidth < 1181) {
      grassMap2 = new THREE.TextureLoader().load(
        "/images/threejs/rsm-grass-texture-2.webp",
        onLoadCallback
      );
      grassMaterial = new THREE.MeshStandardMaterial({ map: grassMap2 });
      grassMap = new THREE.TextureLoader().load(
        "/images/threejs/rsm-grass-texture-1.webp"
      );
    } else {
      grassMap = new THREE.TextureLoader().load(
        "/images/threejs/rsm-grass-texture-1.webp",
        onLoadCallback
      );
      grassMaterial = new THREE.MeshStandardMaterial({ map: grassMap });
      grassMap2 = new THREE.TextureLoader().load(
        "/images/threejs/rsm-grass-texture-2.webp"
      );
    }
    function onLoadCallback() {
      // console.log('Texture loaded successfully.');
      onResize();
    }

    function pageOverlay() {
      gsap.to(".page-overlay", {
        duration: 1,
        autoAlpha: 0,
        ease: "easeIn"
      });
    }

    grassMaterial.map.encoding = THREE.sRGBEncoding;
    let ground = new THREE.Mesh(plane, grassMaterial);
    ground.receiveShadow = true;
    ground.position.set(0, 0, 0);
    scene.add(ground);

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

        if (viewportWidth < 1181) {
          if (grassMap2) {
            grassMaterial.map = grassMap2;
            grassMaterial.map.encoding = THREE.sRGBEncoding;
            grassMaterial.map.needsUpdate = true;
          } else {
            console.log("new animation request");
            requestAnimationFrame(onResize);
          }
        } else {
          if (grassMap) {
            grassMaterial.map = grassMap;
            grassMaterial.map.encoding = THREE.sRGBEncoding;
            grassMaterial.map.needsUpdate = true;
          } else {
            console.log("new animation request");
            requestAnimationFrame(onResize);
          }
        }

        camera.aspect = containerWidth / containerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(containerWidth, containerHeight);

        if (visualViewport.width < 1181) {
          camera.position.set(0, 1.3, 71);
        } else if (visualViewport.width < 1601) {
          camera.position.set(0, 0, 69);
        } else {
          camera.position.set(0, 0, 69);
        }

        renderer.render(scene, camera);
        ScrollTrigger.refresh();
        pageOverlay();
      }
    };

    window.addEventListener("resize", onResize);

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
    ScrollTrigger.normalizeScroll(true);
    ScrollTrigger.config({
      ignoreMobileResize: true,
    });
    ScrollTrigger.defaults({
      // immediateRender: false,
      // invalidateOnRefresh: true,
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

      gsap.to(".golf-intro .scroll-circle", {
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

      gsap.to(".section-one .scroll-circle", {
        opacity: 1,
        scrollTrigger: {
          start: "1400",
          end: "+=200",
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
      let gallery1 = gsap.timeline({
        scrollTrigger: {
          trigger: ".section-two",
          start: "top 75%",
          end: "+=800",
          scrub: 3,
        },
      });
      gallery1
        .to(
          ".gallery1 .image2",
          {
            duration: 2,
            x: 0,
            opacity: 1,
            ease: "power3InOut",
          },
          "<.5"
        )
        .to(
          ".gallery1 .image3",
          {
            duration: 2,
            x: 0,
            opacity: 1,
            ease: "power3InOut",
          },
          "<.5"
        )
        .to(
          ".gallery1 .image1",
          {
            duration: 2,
            x: 0,
            opacity: 1,
            ease: "power3InOut",
          },
          "<.5"
        )
        .to(
          ".gallery1 .image4",
          {
            duration: 1,
            x: 0,
            opacity: 1,
            ease: "power3InOut",
          },
          "<.5"
        );

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
        },
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
        },
      });

      gsap.set(".gallery2 > a", { x: 200, opacity: 0 });
      let gallery2 = gsap.timeline({
        scrollTrigger: {
          trigger: ".section-four",
          start: "top 20%",
          end: "+=800",
          scrub: 3,
        },
      });
      gallery2
        .to(
          ".gallery2 .image1",
          {
            duration: 2,
            x: 0,
            opacity: 1,
            ease: "power3InOut",
          },
          "<.5"
        )
        .to(
          ".gallery2 .image2",
          {
            duration: 2,
            x: 0,
            opacity: 1,
            ease: "power3InOut",
          },
          "<.5"
        )
        .to(
          ".gallery2 .image3",
          {
            duration: 2,
            x: 0,
            opacity: 1,
            ease: "power3InOut",
          },
          "<.5"
        )
        .to(
          ".gallery2 .image4",
          {
            duration: 1,
            x: 0,
            opacity: 1,
            ease: "power3InOut",
          },
          "<.5"
        )
        .to(
          ".gallery2 .image5",
          {
            duration: 1,
            x: 0,
            opacity: 1,
            ease: "power3InOut",
          },
          "<.5"
        )
        .to(
          ".gallery2 .image6",
          {
            duration: 1,
            x: 0,
            opacity: 1,
            ease: "power3InOut",
          },
          "<.5"
        )
        .to(
          ".gallery2 .image7",
          {
            duration: 1,
            x: 0,
            opacity: 1,
            ease: "power3InOut",
          },
          "<.5"
        )
        .to(
          ".gallery2 .image8",
          {
            duration: 1,
            x: 0,
            opacity: 1,
            ease: "power3InOut",
          },
          "<.5"
        )
        .to(
          ".gallery2 .image9",
          {
            duration: 1,
            x: 0,
            opacity: 1,
            ease: "power3InOut",
          },
          "<.5"
        );

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

      const section6form = document.querySelector(".section-six .form-wrapper");
      gsap.set(section6form, { y: 400, opacity: 0 });
      gsap.to(section6form, {
        y: 0,
        opacity: 1,
        scrollTrigger: {
          trigger: ".section-six",
          start: "top 15%",
          end: "top top",
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
        ScrollTrigger.refresh();
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

      gsap.to(".golf-intro .scroll-circle", {
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

      gsap.to(".section-one .scroll-circle", {
        opacity: 1,
        scrollTrigger: {
          start: "1400",
          end: "+=200",
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

      const section5left = document.querySelector(
        ".section-five .content-left"
      );
      const section5right = document.querySelector(
        ".section-five .content-right"
      );
      gsap.set([section5left,section5right], { y: 100, opacity: 0 });
      gsap.to([section5left,section5right], {
        y: 0,
        opacity: 1,
        scrollTrigger: {
          trigger: ".section-five",
          start: "top 80%",
          end: "+=200",
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
        ScrollTrigger.refresh();
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
          onComplete: () => {
            gsap.set(".gallery2 > a", { x: 200, opacity: 0 });
          },
        });
      });
    });
    // RSVP Links
    const rsvpBtns = document.querySelectorAll(".rsvp-btn");
    rsvpBtns.forEach((rsvpbtn) => {
      rsvpbtn.removeEventListener("click", function (e) {});
      rsvpbtn.addEventListener("click", function (e) {
        gsap.to(window, {
          duration: 0,
          scrollTo: {
            y: "#section-six",
            offsetY: 0,
          },
        });
      });
    });

    // Scroll Arrow Anim
    const scrollCircles = document.querySelectorAll(".scroll-circle");
    scrollCircles.forEach(scrollCircle => {
        const tlScroll = gsap.timeline({
            repeat: -1,
            yoyo: true,
          });
          tlScroll.add("start").to(scrollCircle, {
            duration: 0.5,
            y: -10,
          });
    })
  }
}

setupScene();
