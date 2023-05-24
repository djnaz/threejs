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
    const grassMap = new THREE.TextureLoader().load("./rsm-grass-texture-1.webp");
    const grassMap2 = new THREE.TextureLoader().load("./rsm-grass-texture-2.webp");
    const grassMaterial = new THREE.MeshStandardMaterial({ map: grassMap });
    grassMaterial.map.encoding = THREE.sRGBEncoding;
    let ground = new THREE.Mesh(plane, grassMaterial);
    ground.receiveShadow = true;
    ground.position.set(0, 0, 0);
    scene.add(ground);

    // on Resize
    const onResize = () => {
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      let viewportWidth = window.innerWidth;
      let viewportHeight = window.innerHeight;
      let containerWidth;

      if(viewportWidth > 2000) {
        containerWidth = 2000;
      } else {
        containerWidth = viewportWidth;
      }

      if(viewportWidth < 1280) {
        grassMaterial.map = grassMap2;
        grassMaterial.map.encoding = THREE.sRGBEncoding;
        grassMaterial.map.needsUpdate = true;
      } else {
        grassMaterial.map = grassMap;
        grassMaterial.map.encoding = THREE.sRGBEncoding;
        grassMaterial.map.needsUpdate = true;
      }

      camera.aspect = containerWidth / viewportHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerWidth, viewportHeight);

      if(visualViewport.width < 1280) {
        camera.position.set(0, 1, 70);
      } else if(visualViewport.width < 1600) {
        camera.position.set(0, 0, 62);
      } else {
        camera.position.set(0, 0, 62);
      }

      renderer.render(scene, camera);
      ScrollTrigger.refresh();
    };

    window.addEventListener("resize", onResize);
    onResize();

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
        showOnStart: false
      }
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

    // scene.position.set(0, 0, 1);
    golfball.position.set(0, -9, 1);
    golfball.scale.set(.7,.7,.7);

    let mm = gsap.matchMedia();

    // DESKTOP ANIMATION
    mm.add("(min-width: 801px)", () => {

    let tl = gsap.timeline();

    // intro anim
    tl.to(golfball.rotation, {
      x: -Math.PI * 2 * 5.5,
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
      .to(".scroll-circle", {
        opacity: 0,
        scrollTrigger: {
          trigger: ".section-one",
          start: "top top",
          end: "+=200"
        }
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
      .to(".section-one picture img", {
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
          // pin: true,
        }
      })

      // Section 3
      // timeline 8000
      .to(".section-three", {
        scrollTrigger: {
          trigger: ".section-three",
          start: "top top",
          end: "+=1000",
          // pin: true,
        }
      })

      // Section 4
      // timeline 9000
      .to(".section-four", {
        scrollTrigger: {
          trigger: ".section-four",
          start: "top top",
          end: "+=2000",
          // pin: true,
        }
      })

      // Section 5
      // timeline 10000
      .to(".section-five", {
        scrollTrigger: {
          trigger: ".section-five",
          start: "top top",
          end: "+=1000",
          // pin: true,
        }
      })

      // Section 6
      // timeline 11000
      .to(".section-six", {
        scrollTrigger: {
          trigger: ".section-six",
          start: "top top",
          end: "+=1000",
          // pin: true,
        }
      })

      // Additional Animations

      gsap.set(".gallery1 > a", {x: 100, opacity: 0});
          ScrollTrigger.batch(".gallery1 > a", {
            onEnter: (elements,triggers) => gsap.to(elements, {
                x: 0,
                opacity: 1,
                stagger: {
                  each: 0.15,
                },
                ease: "Power3.inOut",
                scrollTrigger: {
                  trigger: elements[0],
                  start: "top 80%",
                  end: "top 70%",
                  scrub: 4,
                  fastScrollEnd: true
                },
                overwrite: true
              }),
          });
          gsap.set(".section-four .content-left", {xPercent: -100, opacity: 0});
          gsap.to(".section-four .content-left", {
            xPercent: 0,
            opacity: 1,
            scrollTrigger: {
              trigger: ".section-four .content-left",
              start: "top 50%",
              end: "top 40%",
              scrub: 4,
              fastScrollEnd: true
            },
            overwrite: true
          });
          gsap.set(".gallery2 > a", {x: 100, opacity: 0});
          ScrollTrigger.batch(".gallery2 > a", {
            onEnter: (elements,triggers) => gsap.to(elements, {
                x: 0,
                opacity: 1,
                stagger: 0.15,
                scrollTrigger: {
                  trigger: elements[0],
                  start: "top 80%",
                  end: "top 70%",
                  scrub: 4,
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
            gsap.set(".section-four .content-left", {xPercent: -100, opacity: 0});
            gsap.set(".gallery1 > a", {x: 200, opacity: 0});
            gsap.set(".gallery2 > a", {x: 200, opacity: 0});
          });

      return () => {
        // when changing from mobile to desktop, reset scrollbar to top
        window.scrollTo(0,0);
      }

      })

      


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
          .to(".scroll-circle", {
            opacity: 0,
            scrollTrigger: {
              trigger: ".section-one",
              start: "top top",
              end: "+=200"
            }
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
          .to(".section-one picture img", {
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
          // timeline 6000
          // .to(".section-two", {
          //   scrollTrigger: {
          //     trigger: ".section-two",
          //     start: "top top",
          //     end: "+=1000",
          //   }
          // })
    
          // Section 3
          // timeline 7000
          // .to(".section-three", {
          //   scrollTrigger: {
          //     trigger: ".section-three",
          //     start: "top top",
          //     end: "+=1000",
          //   }
          // })
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
          // .to(".section-four", {
          //   scrollTrigger: {
          //     trigger: ".section-four",
          //     start: "top top",
          //     end: "+=1000",
          //   }
          // })
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

          gsap.set(".gallery1 > a", {x: 0, opacity: 1});

          ScrollTrigger.addEventListener("refreshInit", () => {
            gsap.set(".section-four .content-left", {xPercent: 0, opacity: 1});
            gsap.set(".gallery1 > a", {x: 0, opacity: 1});
            gsap.set(".gallery2 > a", {x: 0, opacity: 1});
          });
    
          return () => {
            // when changing from mobile to desktop, reset scrollbar to top
            window.scrollTo(0,0);
          }
    
          });

          // Ballmarker Anim
          const ballmarker = document.querySelector('.ballmarker');
          const navlinks = document.querySelector('.nav-links > div');
          ballmarker.addEventListener('click', () => {
            if(ballmarker.classList.contains('active')) {
              gsap.to(navlinks, {
                duration: .5,
                xPercent: -100,
                opacity: 0
              });
            } else {
              gsap.to(navlinks, {
                duration: .5,
                xPercent: 0,
                opacity: 1
              });
            }    
            ballmarker.classList.toggle('active');  
          });

          // RSVP button links
          const gothere = document.querySelectorAll('.alink');
          gothere.forEach(link => {
            const alink = link.getAttribute('data-link');
            link.addEventListener('click', (e) => {
              e.preventDefault();
              console.log('success');
                gsap.to(window, {
                  duration: 0,
                  scrollTo: alink
                })
              })
          })

          



  }
}

setupScene();
