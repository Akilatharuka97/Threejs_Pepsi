import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
gsap.registerPlugin(ScrollTrigger);

// DOM + Scene Setup
const canvas = document.querySelector("#webgl");
const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    100
);
camera.position.set(0, 0.2, 2);
scene.add(camera);

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// Resize Handler
window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Lighting
const ambientLight = new THREE.AmbientLight(0xadd8e6, 1.5);
const directionalLight = new THREE.DirectionalLight(0xffffff, 10);
directionalLight.position.set(5, 10, 7.5);
scene.add(ambientLight, directionalLight);

// Global vars
let model;
let isAutoRotating = true;

// Load Model
const loader = new GLTFLoader();
loader.load(
    "models/pepsi_can.glb",
    (gltf) => {
        model = gltf.scene;
        model.scale.set(0.009, 0.009, 0.009);
        model.position.set(0, 1, 0);
        scene.add(model);

        // Intro bounce
        gsap.to(model.position, {
            y: -0.7,
            duration: 2,
            ease: "bounce.out",
        });

        // Scroll Timeline
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: ".scroll-section",
                start: "top center",
                end: "bottom center",
                scrub: true,
                pin: true,
                onEnter: () => (isAutoRotating = false),
                onLeaveBack: () => (isAutoRotating = true),
            },
        });

        // Scale up slightly
        tl.to(
            model.scale,
            {
                x: 0.012,
                y: 0.012,
                z: 0.012,
                duration: 0.5,
                ease: "power2.out",
            },
            0
        );

        // Rotate (tilt) to angled position
        tl.to(
            model.rotation,
            {
                x: 0.3, // forward tilt
                z: -0.3, // right tilt
                y: 0.2, // slight twist
                duration: 1.5,
                ease: "power1.inOut",
            },
            0.3
        );

        // Move to left side of screen
        tl.to(
            model.position,
            {
                x: -1.2,
                duration: 1.2,
                ease: "power2.inOut",
            },
            0.5
        );

        // Scale back to normal
        tl.to(
            model.scale,
            {
                x: 0.009,
                y: 0.009,
                z: 0.009,
                duration: 0.5,
                ease: "power2.inOut",
            },
            0.8
        );

        // Blue section scroll timeline
        const tlBlue = gsap.timeline({
            scrollTrigger: {
                trigger: ".scroll-section-blue",
                start: "top center",
                end: "bottom center",
                scrub: true,
                pin: true,
                onEnter: () => (isAutoRotating = true), // enable auto rotation
                onLeaveBack: () => (isAutoRotating = true), // also enable when going back
                onLeave: () => (isAutoRotating = false), // disable after leaving section
            },
        });

        // Reset rotation to banner initial (front-facing)
        tlBlue.to(
            model.rotation,
            {
                x: 0,
                y: 0,
                z: 0,
                duration: 0.5,
                ease: "power1.inOut",
            },
            0
        );

        // Move can to right side
        tlBlue.to(
            model.position,
            {
                x: 1.2,
                duration: 1.2,
                ease: "power2.inOut",
            },
            0
        );

        // Scale up slightly and back to normal
        tlBlue.to(
            model.scale,
            {
                x: 0.012,
                y: 0.012,
                z: 0.012,
                duration: 0.6,
                ease: "power2.out",
            },
            0
        );

        tlBlue.to(
            model.scale,
            {
                x: 0.009,
                y: 0.009,
                z: 0.009,
                duration: 0.6,
                ease: "power2.inOut",
            },
            0.6
        );
    },
    undefined,
    (err) => {
        console.error("Failed to load model:", err);
    }
);

// Animate Loop
function animate() {
    requestAnimationFrame(animate);

    if (model && isAutoRotating) {
        model.rotation.y += 0.005;
    }

    renderer.render(scene, camera);
}
animate();

// Banner Text Scroll (infinite loop)
gsap.fromTo(
    ".banner-text",
    { x: "50vw" },
    {
        x: "-100%",
        duration: 40,
        ease: "none",
        repeat: -1,
    }
);

// Text fade/slide in
gsap.fromTo(
    ".about-text",
    {
        opacity: 0,
        y: 150,
    },
    {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
            trigger: ".scroll-section",
            start: "top 60%", // when section hits 60% from top
            toggleActions: "play none none reverse",
        },
    }
);

// Text fade/slide in from left (Blue section)
gsap.fromTo(
    ".scroll-section-blue .about-text",
    {
        opacity: 0,
        x: -300, // ← from left
    },
    {
        opacity: 1,
        x: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
            trigger: ".scroll-section-blue",
            start: "top 60%",
            toggleActions: "play none none reverse",
        },
    }
);

function createCircularText(elementSelector, radius = 130) {
    const container = document.querySelector(elementSelector);
    const text = container.textContent.trim();
    container.textContent = ""; // clear original text

    const characters = [...text];
    const angleStep = 360 / characters.length;

    characters.forEach((char, i) => {
        const span = document.createElement("span");
        span.textContent = char;
        // Rotate each letter by angleStep * index and translate outwards by radius
        span.style.position = "absolute";
        span.style.height = "20px";
        span.style.width = "20px";
        span.style.left = "50%";
        span.style.top = "50%";
        span.style.transformOrigin = `0 50%`;
        span.style.transform = `rotate(${i * angleStep
            }deg) translate(${radius}px) rotate(-${i * angleStep}deg)`;
        container.appendChild(span);
    });

    // Animate rotation with GSAP
    gsap.to(container, {
        rotation: 360,
        duration: 15,
        ease: "linear",
        repeat: -1,
        transformOrigin: "50% 50%",
    });
}

// Call after DOM ready
window.addEventListener("load", () => {
    createCircularText(".circle-text .text", 130);
});


var tl = gsap.timeline({ repeat: -1 });
tl.to("h1.title", 30, { backgroundPosition: "-960px 0" });


// Loader 2

// Setup second scene for .shop section
const canvas2 = document.querySelector("#webgl2");
const scene2 = new THREE.Scene();

const camera2 = new THREE.PerspectiveCamera(
    75,
    canvas2.clientWidth / canvas2.clientHeight,
    0.1,
    100
);
camera2.position.set(0, 1.2, 2);
scene2.add(camera2);

const renderer2 = new THREE.WebGLRenderer({
    canvas: canvas2,
    alpha: true,
    antialias: true,
});
renderer2.setSize(canvas2.clientWidth, canvas2.clientHeight);
renderer2.setPixelRatio(window.devicePixelRatio);

// Resize handling for second canvas
window.addEventListener("resize", () => {
    camera2.aspect = canvas2.clientWidth / canvas2.clientHeight;
    camera2.updateProjectionMatrix();
    renderer2.setSize(canvas2.clientWidth, canvas2.clientHeight);
});

// Lights
const ambient2 = new THREE.AmbientLight(0xadd8e6, 1.5);
const directional2 = new THREE.DirectionalLight(0xffffff, 10);
directional2.position.set(5, 10, 7.5);
scene2.add(ambient2, directional2);

// Load second model
const loader2 = new GLTFLoader();
let model2;

loader2.load(
    "models/pepsi_can.glb", // same model path
    (gltf) => {
        model2 = gltf.scene;
        model2.scale.set(0.010, 0.010, 0.010);
        model2.position.set(0, 1, 0);
        scene2.add(model2);
    },
    undefined,
    (err) => {
        console.error("Failed to load second model:", err);
    }
);

// Animate second scene (infinite rotate)
function animateSecondCan() {
    requestAnimationFrame(animateSecondCan);

    if (model2) {
        model2.rotation.y += 0.005;
    }

    renderer2.render(scene2, camera2);
}
animateSecondCan();