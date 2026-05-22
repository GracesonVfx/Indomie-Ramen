import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import Lenis from "lenis";
import "./style.css";

// 📦 Preload large images into browser cache to prevent scroll/rotation transition glitches
const imagesToPreload = [
  "/images/Ramen1.webp",
  "/images/Ramen2.webp",
  "/images/Ramen3.webp",
  "/images/Ramen4.webp",
  "/images/Ramen5.webp",
  "/images/WOOD.webp",
  "/images/hero-bg.webp"
];
imagesToPreload.forEach((src) => {
  const img = new Image();
  img.src = src;
});

// 🔌 Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

// 🌀 Initialize Lenis smooth scroll
const lenis = new Lenis({
  duration: 1.5,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
});

lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => {
  lenis.raf(time * 1000); // convert to ms
});
gsap.ticker.lagSmoothing(0);

// --- 🌌 Interactive Gold Dust Particles Engine ---
const canvas = document.getElementById("bg-particles");
const ctx = canvas.getContext("2d");
let particles = [];
let mouse = { x: -1000, y: -1000, active: false };

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// Mouse movements for repulsion
window.addEventListener("mousemove", (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
  mouse.active = true;
});
window.addEventListener("mouseleave", () => {
  mouse.active = false;
});

class Particle {
  constructor(isBurst = false, burstX = 0, burstY = 0) {
    this.isBurst = isBurst;
    this.x = isBurst ? burstX + (Math.random() - 0.5) * 50 : Math.random() * canvas.width;
    this.y = isBurst ? burstY + (Math.random() - 0.5) * 50 : canvas.height + Math.random() * 100;
    this.size = Math.random() * (isBurst ? 5 : 3) + 1;
    this.speedY = isBurst ? -(Math.random() * 5 + 3) : -(Math.random() * 0.8 + 0.3);
    this.speedX = isBurst ? (Math.random() - 0.5) * 6 : (Math.random() - 0.5) * 0.6;
    this.wobbleSpeed = Math.random() * 0.02 + 0.005;
    this.wobbleRange = Math.random() * 1.5 + 0.5;
    this.angle = Math.random() * Math.PI * 2;
    this.opacity = isBurst ? 1.0 : Math.random() * 0.35 + 0.1;
    this.decay = isBurst ? Math.random() * 0.025 + 0.015 : 0;
    
    // Warm golden color palette (hues 35-55)
    const hue = Math.random() * 20 + 35;
    this.color = `hsla(${hue}, 100%, 70%, `;
  }

  update() {
    if (this.isBurst) {
      this.x += this.speedX;
      this.y += this.speedY;
      this.opacity -= this.decay;
    } else {
      this.y += this.speedY;
      this.angle += this.wobbleSpeed;
      this.x += this.speedX + Math.sin(this.angle) * 0.3;

      // Cursor Repulsion Effect
      if (mouse.active) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 130;
        if (dist < maxDist) {
          const force = (maxDist - dist) / maxDist;
          const angle = Math.atan2(dy, dx);
          this.x += Math.cos(angle) * force * 3;
          this.y += Math.sin(angle) * force * 3;
        }
      }

      // Recycle particles
      if (this.y < -10) {
        this.y = canvas.height + 10;
        this.x = Math.random() * canvas.width;
        this.opacity = Math.random() * 0.35 + 0.1;
      }
    }
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = this.color + this.opacity + ")";
    ctx.shadowBlur = this.isBurst ? 15 : 6;
    ctx.shadowColor = `rgba(255, 180, 50, 0.45)`;
    ctx.fill();
    ctx.shadowBlur = 0; // reset
  }
}

// Populate initial screen particles
for (let i = 0; i < 75; i++) {
  particles.push(new Particle());
}

function triggerSteamBurst(x, y) {
  // Translate absolute document coords to viewport coords for canvas drawing
  const viewportX = x - window.scrollX;
  const viewportY = y - window.scrollY;
  for (let i = 0; i < 30; i++) {
    particles.push(new Particle(true, viewportX, viewportY));
  }
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].draw();
    if (particles[i].isBurst && particles[i].opacity <= 0) {
      particles.splice(i, 1);
    }
  }
  requestAnimationFrame(animateParticles);
}
animateParticles();

// --- 🪞 3D Tilt Card Interactions ---
const cards = document.querySelectorAll(".menu-card");

cards.forEach((card) => {
  card.addEventListener("mousemove", (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left; // cursor x relative to card
    const y = e.clientY - rect.top;  // cursor y relative to card
    
    // Set spotlight center
    card.style.setProperty("--mouse-x", `${x}px`);
    card.style.setProperty("--mouse-y", `${y}px`);

    const width = rect.width;
    const height = rect.height;

    // Calculate rotation angle (max 10 degrees tilt)
    const rotateY = ((x - width / 2) / (width / 2)) * 12;
    const rotateX = -((y - height / 2) / (height / 2)) * 12;

    gsap.to(card, {
      rotateX: rotateX,
      rotateY: rotateY,
      translateY: -8,
      boxShadow: "0 25px 45px rgba(255, 221, 181, 0.1), 0 15px 25px rgba(0, 0, 0, 0.6)",
      borderColor: "rgba(255, 221, 181, 0.35)",
      duration: 0.3,
      ease: "power2.out",
      overwrite: "auto",
    });
  });

  card.addEventListener("mouseleave", () => {
    gsap.to(card, {
      rotateX: 0,
      rotateY: 0,
      translateY: 0,
      boxShadow: "0 15px 35px rgba(0, 0, 0, 0.5)",
      borderColor: "rgba(255, 255, 255, 0.04)",
      duration: 0.5,
      ease: "power2.out",
      overwrite: "auto",
    });
  });
});

// --- 🥣 Bowls & Lazy Susan Spin Logic ---
const bowls = document.querySelectorAll("#bowls img");
const transitionBowl = document.getElementById("transition-bowl");
const radius = 160;
let angle = 90;
let activeIndex = 0;
let scrollTween;
let isRotating = false;

// Center bowls
gsap.set(bowls, { xPercent: -50, yPercent: -50 });
gsap.set(transitionBowl, { xPercent: -50, yPercent: -50 });

// Initialize wood plate
gsap.set("#wood", { rotate: angle, scale: 3, y: -330, xPercent: -50 });

function positionBowls() {
  bowls.forEach((bowl, i) => {
    const angleRad = (i / bowls.length) * Math.PI * 2;
    const x = Math.cos(angleRad) * radius;
    const y = Math.sin(angleRad) * radius;
    bowl.style.left = `calc(50% + ${x}px)`;
    bowl.style.top = `calc(50% + ${y}px)`;
  });
}
positionBowls();

// Update zoom and keep all bowls upright
function updateZoom() {
  bowls.forEach((bowl, i) => {
    const isActive = (i === activeIndex);
    gsap.to(bowl, {
      scale: isActive ? 1.7 : 1.0,
      rotate: -angle, // keeps bowls upright
      duration: 0.6,
      ease: isActive ? "power2.out" : "power3.out",
    });
  });
}

// Update scroll-driven transition path
function updateScrollTrigger() {
  if (scrollTween) {
    scrollTween.scrollTrigger.kill();
    scrollTween.kill();
  }

  const activeBowl = bowls[activeIndex];
  const target = document.getElementById("bowlTarget");

  if (!activeBowl || !target) return;

  const scrollY = window.scrollY || window.pageYOffset;
  const scrollX = window.scrollX || window.pageXOffset;

  const activeRect = activeBowl.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();

  // Document-relative coordinates of centers
  const startX = activeRect.left + activeRect.width / 2 + scrollX;
  const startY = activeRect.top + activeRect.height / 2 + scrollY;
  const endX = targetRect.left + targetRect.width / 2 + scrollX;
  const endY = targetRect.top + targetRect.height / 2 + scrollY;

  // Set transition flyer initial source, position, and scale (preventing size jump!)
  transitionBowl.src = activeBowl.src;

  gsap.set(transitionBowl, {
    x: 0,
    y: 0,
    left: startX,
    top: startY,
    width: 80, // base size
    height: 80,
    scale: activeRect.width / 80, // exactly matches rendered active size!
    rotate: 0, // starts upright relative to screen
    display: "none",
  });

  // Create ScrollTrigger tween
  scrollTween = gsap.to(transitionBowl, {
    x: endX - startX,
    y: endY - startY,
    scale: 300 / 80, // scale to target width (300px)
    rotate: 360, // spins and ends upright relative to screen
    ease: "none",
    scrollTrigger: {
      trigger: "#about",
      start: "top bottom",
      end: "top top",
      scrub: true,
      onEnter: () => {
        activeBowl.style.opacity = 0;
        transitionBowl.style.display = "block";
      },
      onLeaveBack: () => {
        activeBowl.style.opacity = 1;
        transitionBowl.style.display = "none";
      },
      onLeave: () => {
        transitionBowl.style.display = "block";
        triggerSteamBurst(endX, endY); // golden steam burst on landing!
      },
      onEnterBack: () => {
        activeBowl.style.opacity = 0;
        transitionBowl.style.display = "block";
      },
    },
  });
}

// Select bowl with shortest-path rotation and scroll locks
function selectBowl(i) {
  if (isRotating) return;
  if (window.scrollY > 50) return; // only allow interaction when at the top
  if (i === activeIndex) return;

  isRotating = true;
  lenis.stop(); // Lock scroll during Lazy Susan animation

  let diff = i - activeIndex;
  if (diff > 3) diff -= 6;
  if (diff <= -3) diff += 6;

  angle -= diff * 60;
  activeIndex = i;

  // Spin Lazy Susan wood plate
  gsap.to("#wood", {
    rotate: angle,
    duration: 1.0,
    ease: "power2.inOut",
    onUpdate: () => {
      // Keep bowls upright during wood rotation
      const currentWoodRotate = gsap.getProperty("#wood", "rotate");
      bowls.forEach((bowl) => {
        gsap.set(bowl, { rotate: -currentWoodRotate });
      });
    },
    onComplete: () => {
      updateZoom();
      updateScrollTrigger();
      isRotating = false;
      lenis.start(); // Unlock scroll once rotation finishes!
    }
  });

  updateZoom();
}

// ⌨️ Keyboard controls
document.addEventListener("keydown", (e) => {
  if (window.scrollY > window.innerHeight / 2) return;

  if (e.key === "ArrowRight") {
    const nextIdx = (activeIndex - 1 + bowls.length) % bowls.length;
    selectBowl(nextIdx);
  } else if (e.key === "ArrowLeft") {
    const nextIdx = (activeIndex + 1) % bowls.length;
    selectBowl(nextIdx);
  }
});

// Bowls click controls
bowls.forEach((bowl, i) => {
  bowl.addEventListener("click", () => {
    selectBowl(i);
  });
});

// Smooth scroll bindings
document.querySelector("#nextBtn").addEventListener("click", () => {
  lenis.scrollTo("#about");
});

// Navbar scroll style change
window.addEventListener("scroll", () => {
  const navbar = document.getElementById("navbar");
  if (navbar) {
    if (window.scrollY > 50) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  }
});

// Hamburger menu logic
const menuToggle = document.getElementById("menu-toggle");
const mobileMenu = document.getElementById("mobile-menu");
const mobileLinks = document.querySelectorAll(".mobile-nav-link");

if (menuToggle && mobileMenu) {
  menuToggle.addEventListener("click", () => {
    const isOpen = mobileMenu.classList.toggle("open");
    menuToggle.classList.toggle("open", isOpen);
    if (isOpen) {
      lenis.stop(); // Lock page scrolling while drawer is open
    } else {
      lenis.start();
    }
  });

  mobileLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const targetId = link.getAttribute("href");
      
      // Close menu & restore scrolling
      mobileMenu.classList.remove("open");
      menuToggle.classList.remove("open");
      lenis.start();

      // Scroll smoothly to target
      lenis.scrollTo(targetId);
    });
  });
}

// Bind desktop navbar links
document.querySelectorAll(".nav-link").forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const targetId = link.getAttribute("href");
    lenis.scrollTo(targetId);
  });
});

// Active Link Highlighting with GSAP ScrollTrigger
const sections = ["home", "about", "menu", "contact"];
sections.forEach((id) => {
  ScrollTrigger.create({
    trigger: `#${id}`,
    start: "top 40%",
    end: "bottom 40%",
    onEnter: () => activateLink(id),
    onEnterBack: () => activateLink(id),
  });
});

function activateLink(id) {
  document.querySelectorAll(".nav-link, .mobile-nav-link").forEach((link) => {
    if (link.getAttribute("href") === `#${id}`) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
}

// Re-calculate coordinate fly path on window resize
window.addEventListener("resize", () => {
  updateScrollTrigger();
});

// 🟢 Initial Setup
updateZoom();
setTimeout(updateScrollTrigger, 100);
