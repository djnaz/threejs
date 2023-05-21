import "./styles/scss/main.scss";
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
    const grassMap = new THREE.TextureLoader().load("./turf2.webp");
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
      canvasHeight = container.clientHeight + 100; // set canvas size to fill canvas wrapper on resize
      camera.aspect = canvasWidth / canvasHeight;
      // if(window.visualViewport.width < 800) {
      //   window.scrollTo(0, 0)
      // } else {
      //   window.scrollTo(0, 0)
      // }   
      camera.updateProjectionMatrix();
      renderer.setSize(canvasWidth, canvasHeight);
      renderer.render(scene, camera);
      // ScrollTrigger.refresh();
    };

    window.addEventListener("resize", onResize);
    onResize();

    Fancybox.bind("[data-fancybox]", {
      // Your custom options
    });

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
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
    // ScrollTrigger.normalizeScroll(true);
    ScrollTrigger.config({
      ignoreMobileResize: true,
    });
    ScrollTrigger.defaults({
      immediateRender: false,
      ease: "power2.inOut",
      scrub: 2,
      // preventOverlaps: true
    });
    ScrollTrigger.refresh();

    const gothere = document.querySelector('.gothere');
    gothere.addEventListener('click', () => {
      gsap.to(window, {
        duration: 2,
        scrollTo: "#section-six"
      })
    })

    // scene.position.set(0, 0, 1);
    golfball.position.set(0, -9, 1);


    // ScrollTrigger.saveStyles(".section-one, section-two, section-three, section-four, section-five");

    let mm = gsap.matchMedia();

    // DESKTOP ANIMATION
    mm.add("(min-width: 801px)", () => {

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
        // console.log(window.pageYOffset)
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
          onLeave: () => {
            const golfIntro = document.querySelector(".golf-intro");
            golfIntro.style.zIndex = "0";
          },
          onEnterBack: () => {
            const golfIntro = document.querySelector(".golf-intro");
            golfIntro.style.zIndex = "99";
          },
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
      // Section 1
      // timeline 6000
      .from(".rsvp-card", {
        xPercent: 200,
        scrollTrigger: {
          trigger: ".section-one",
          start: "2400",
          end: "+=200",
          markers: true
        }
      })
      .to(".section-one", {
        scrollTrigger: {
          trigger: ".section-one",
          start: "top top",
          end: "+=4000",
          pin: true,
        },
      })

      

      // Section 2
      // timeline 7000
      .to(".section-two", {
        scrollTrigger: {
          trigger: ".section-two",
          start: "top top",
          end: "+=1000",
          pin: true,
        }
      })

      // Section 3
      // timeline 8000
      .to(".section-three", {
        scrollTrigger: {
          trigger: ".section-three",
          start: "top top",
          end: "+=1000",
          pin: true,
        }
      })

      // Section 4
      // timeline 9000
      .to(".section-four", {
        scrollTrigger: {
          trigger: ".section-four",
          start: "top top",
          end: "+=2000",
          pin: true,
        }
      })

      // Section 5
      // timeline 10000
      .to(".section-five", {
        scrollTrigger: {
          trigger: ".section-five",
          start: "top top",
          end: "+=1000",
          pin: true,
        }
      })

      // Section 6
      // timeline 11000
      .to(".section-six", {
        scrollTrigger: {
          trigger: ".section-six",
          start: "top top",
          end: "+=1000",
          pin: true,
        }
      })

      return () => {
        // when changing from mobile to desktop, reset scrollbar to top
        window.scrollTo(0,0);
      }

      })

      gsap.set(".gallery2 > a", {x: 1000, opacity: 0});
      ScrollTrigger.batch(".gallery2 > a", {
        onEnter: batch => {
          gsap.to(batch, {
            x: 0,
            opacity: 1,
            stagger: 0.15,
            // scrollTrigger: {
            //   trigger: elements[0],
            //   start: "top center",
            //   end: "+=1000",
            //   scrub: 1,
            //   preventOverlaps: true
            // },
            // overwrite: true
          });
        }
      });


      // MOBILE ANIMATION
      mm.add("(max-width: 800px)", () => {

        let tl2 = gsap.timeline();
    
        // intro anim
        tl2.to(golfball.rotation, {
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
              onLeave: () => {
                const golfIntro = document.querySelector(".golf-intro");
                golfIntro.style.zIndex = "0";
              },
              onEnterBack: () => {
                const golfIntro = document.querySelector(".golf-intro");
                golfIntro.style.zIndex = "99";
              },
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
            }
          })
          // .to(".section-two h2", {
          //   x: 100,
          //   scrollTrigger: {
          //     trigger: ".section-two",
          //     start: "top top",
          //     end: "+=1000",
          //   },
          // })
    
          // Section 3
          // timeline 7000
          .to(".section-three", {
            scrollTrigger: {
              trigger: ".section-three",
              start: "top top",
              end: "+=1000",
            }
          })
          // .to(".section-three h2", {
          //   x: -100,
          //   scrollTrigger: {
          //     trigger: ".section-three",
          //     start: "top top",
          //     end: "+=1000",
          //   },
          // })
    
          // Section 4
          // timeline 8000
          .to(".section-four", {
            scrollTrigger: {
              trigger: ".section-four",
              start: "top top",
              end: "+=1000",
            }
          })
          // .to(".section-four h2", {
          //   x: 100,
          //   scrollTrigger: {
          //     trigger: ".section-four",
          //     start: "top top",
          //     end: "+=1000",
          //   },
          // })
    
          // Section 5
          // timeline 9000
    
          return () => {
            // when changing from mobile to desktop, reset scrollbar to top
            window.scrollTo(0,0);
          }
    
          });

          gsap.set(".gallery1 > a", {x: 200, opacity: 0});
          ScrollTrigger.batch(".gallery1 > a", {
            onEnter: (elements,triggers) => gsap.to(elements, {
                x: 0,
                opacity: 1,
                stagger: {
                  each: 0.15,
                },
                scrollTrigger: {
                  trigger: elements[0],
                  start: "top center",
                  scrub: 1,
                  fastScrollEnd: true
                },
                overwrite: true
              }),
          });
          gsap.set(".gallery2 > a", {x: 200, opacity: 0});
          ScrollTrigger.batch(".gallery2 > a", {
            onEnter: (elements,triggers) => gsap.to(elements, {
                x: 0,
                opacity: 1,
                stagger: 0.15,
                scrollTrigger: {
                  trigger: elements[0],
                  start: "top center",
                  scrub: 1,
                  fastScrollEnd: true
                },
                overwrite: true
              }),
          });
          // when ScrollTrigger does a refresh(), it maps all the positioning data which 
          // factors in transforms, but in this example we're initially setting all the ".box"
          // elements to a "y" of 100 solely for the animation in which would throw off the normal 
          // positioning, so we use a "refreshInit" listener to reset the y temporarily. When we 
          // return a gsap.set() in the listener, it'll automatically revert it after the refresh()!
          ScrollTrigger.addEventListener("refreshInit", () => {
            gsap.set(".gallery1 > a", {x: 200, opacity: 0});
            gsap.set(".gallery2 > a", {x: 200, opacity: 0});
          });



  }
}

setupScene();
