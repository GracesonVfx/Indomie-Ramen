import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
// import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import Lenis from "lenis";
import "./style.css";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

document.body.classList.add("noscroll");

const lenis = new Lenis();
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => {
  lenis.raf(time * 1000); // Convert time from seconds to milliseconds
});
gsap.ticker.lagSmoothing(0);

const bowls = document.querySelectorAll("#bowls img");
const radius = 150;
let angle = 90;
let activeIndex = 0;
const wrappers = document.querySelectorAll(".bowl-wrapper");

// 🍜 Position bowls in circle
function positionBowls() {
  bowls.forEach((bowl, i) => {
    const angle = (i / bowls.length) * Math.PI * 2;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    bowl.style.left = `${50 + x}px`;
    bowl.style.top = `${50 + y}px`;
  });
}

positionBowls();

// 🔍 Zoom in center bowl
function updateZoom() {
  bowls.forEach((bowl, i) => {
    if (i === activeIndex) {
      gsap.to(bowl, {
        rotate: "+=50",
        scale: 1.7,
        duration: 0.5,
        ease: "power1.inOut",
      });
    } else {
      gsap.to(bowl, {rotate: "-=50", scale: 1, duration: 0.5, ease: "power2.out" });
    }
  });
}

gsap.set("#wood", { rotate: 90, scale: 3, y: -200 });

// 🎮 Keyboard Controls
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight") {
    angle += 60;
    activeIndex = (activeIndex - 1 + bowls.length) % bowls.length;
  } else if (e.key === "ArrowLeft") {
    angle -= 60;
    activeIndex = (activeIndex + 1) % bowls.length;
  } else {
    return;
  }

  gsap.to("#wood", {
    rotate: angle,
    duration: 1,
    ease: "power2.inOut",
  });

  updateZoom();
});

// 🟢 Initial zoom
updateZoom();

document.querySelector("#nextBtn").addEventListener("click", () => {
  // gsap.to(window, { duration: 2, scrollTo: "#about" });
  document.body.classList.remove("noscroll");
  

  const centerBowl = bowls[activeIndex];
  const bowlRect = centerBowl.getBoundingClientRect();

  // Clone the bowl
  const clone = centerBowl.cloneNode(true);
  clone.classList.add("clone");
  document.body.appendChild(clone);

  // Match computed styles (for transforms applied by GSAP)
  const computedStyle = window.getComputedStyle(document.querySelector("img"));
  console.log(computedStyle);
  const scale = gsap.getProperty(centerBowl, "scale");

  gsap.set(clone, {
    position: "absolute",
    top: bowlRect.top + "px",
    left: bowlRect.left + "px",
    width: bowlRect.width + "px",
    height: bowlRect.height + "px",
    rotate: "+=90",
    scale: scale - 1,
    zIndex: 1000,
  });

  centerBowl.style.opacity = 0;

  // Get target position in about section
  const target = document.getElementById("bowlTarget");
  const targetRect = target.getBoundingClientRect();

  const scrollY = window.scrollY;
  const scrollX = window.scrollX;

  const deltaX = -450;
  const deltaY =.5 * window.innerHeight;

  gsap.to(clone, {
    x: target.getBoundingClientRect().left + deltaX,
    y: target.getBoundingClientRect().top - deltaY,
    scale: 1,
    rotate: 0,
    duration: 3,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -5 * t)), // same ease as GSAP
  });
  console.log(target.getBoundingClientRect().left + deltaX);
  console.log(target.getBoundingClientRect().top - deltaY);

  lenis.scrollTo("#about", {
    offset: 0,
    duration: 2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -12 * t)), // same ease as GSAP
  });
});
