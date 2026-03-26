/* ═══════════════════════════════════════════════════════════
   HAROUNA THIAM — personal site interactions
   ═══════════════════════════════════════════════════════════ */

/* ── Scroll progress bar ───────────────────────────────── */
const progressBar = document.createElement("div");
progressBar.className = "scroll-progress";
document.body.prepend(progressBar);

window.addEventListener("scroll", () => {
  const scrolled = window.scrollY;
  const total = document.documentElement.scrollHeight - window.innerHeight;
  progressBar.style.width = `${(scrolled / total) * 100}%`;
}, { passive: true });

/* ── Custom cursor ─────────────────────────────────────── */
const dot  = document.createElement("div");
const ring = document.createElement("div");
dot.className  = "cursor-dot";
ring.className = "cursor-ring";
document.body.append(dot, ring);

let mx = -100, my = -100, rx = -100, ry = -100;

document.addEventListener("mousemove", (e) => {
  mx = e.clientX;
  my = e.clientY;
  dot.style.transform = `translate(${mx}px, ${my}px)`;
});

(function animateRing() {
  rx += (mx - rx) * 0.12;
  ry += (my - ry) * 0.12;
  ring.style.transform = `translate(${rx}px, ${ry}px)`;
  requestAnimationFrame(animateRing);
})();

document.querySelectorAll("a, button, .polaroid, .logo-tile, .sticky-note, .timeline-card, #chat-toggle, #chat-form button").forEach((el) => {
  el.addEventListener("mouseenter", () => ring.classList.add("cursor-hover"));
  el.addEventListener("mouseleave", () => ring.classList.remove("cursor-hover"));
});

/* ── Neural network canvas ─────────────────────────────── */
const canvas = document.getElementById("hero-canvas");
const ctx    = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width  = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas, { passive: true });

const NODE_COUNT = 70;
const MAX_DIST   = 130;
const nodes = Array.from({ length: NODE_COUNT }, () => ({
  x:  Math.random() * canvas.width,
  y:  Math.random() * canvas.height,
  vx: (Math.random() - 0.5) * 0.45,
  vy: (Math.random() - 0.5) * 0.45,
  r:  Math.random() * 1.8 + 0.8,
  pulse: Math.random() * Math.PI * 2,
}));

// Mouse repulsion
let heroMouseX = -999, heroMouseY = -999;
canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  heroMouseX = e.clientX - rect.left;
  heroMouseY = e.clientY - rect.top;
});
canvas.addEventListener("mouseleave", () => { heroMouseX = -999; heroMouseY = -999; });

function drawCanvas(ts) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Edges
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dx = nodes[i].x - nodes[j].x;
      const dy = nodes[i].y - nodes[j].y;
      const d  = Math.hypot(dx, dy);
      if (d < MAX_DIST) {
        const alpha = (1 - d / MAX_DIST) * 0.28;
        ctx.beginPath();
        ctx.moveTo(nodes[i].x, nodes[i].y);
        ctx.lineTo(nodes[j].x, nodes[j].y);
        ctx.strokeStyle = `rgba(196,160,106,${alpha})`;
        ctx.lineWidth   = 0.7;
        ctx.stroke();
      }
    }
  }

  // Nodes
  nodes.forEach((n) => {
    n.pulse += 0.025;
    const glow = 0.4 + 0.3 * Math.sin(n.pulse);

    ctx.beginPath();
    ctx.arc(n.x, n.y, n.r + 1.5, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(196,160,106,${glow * 0.25})`;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(210,180,120,${glow})`;
    ctx.fill();

    // Mouse repulsion
    const mdx = n.x - heroMouseX;
    const mdy = n.y - heroMouseY;
    const md  = Math.hypot(mdx, mdy);
    if (md < 90) {
      const force = (90 - md) / 90 * 0.8;
      n.vx += (mdx / md) * force;
      n.vy += (mdy / md) * force;
    }

    // Speed cap
    const speed = Math.hypot(n.vx, n.vy);
    if (speed > 1.4) { n.vx = (n.vx / speed) * 1.4; n.vy = (n.vy / speed) * 1.4; }

    n.x += n.vx;
    n.y += n.vy;
    if (n.x < 0 || n.x > canvas.width)  n.vx *= -1;
    if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
  });

  requestAnimationFrame(drawCanvas);
}
requestAnimationFrame(drawCanvas);

/* ── Typewriter ────────────────────────────────────────── */
const phrases = [
  "SDE intern @ AWS EKS · Kubernetes at scale.",
  "CS + AI/ML @ Duke University.",
  "LLMs · RAG pipelines · distributed systems.",
  "AWS Bedrock · Step Functions · Lambda.",
  "builder of things that matter.",
];

let phraseIndex = 0, charIndex = 0, deleting = false;
const typer = document.getElementById("typewriter");

function typeWriter() {
  const current = phrases[phraseIndex];
  if (deleting) {
    typer.textContent = current.slice(0, charIndex--);
    if (charIndex < 0) {
      deleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      setTimeout(typeWriter, 500);
      return;
    }
    setTimeout(typeWriter, 40);
  } else {
    typer.textContent = current.slice(0, charIndex++);
    if (charIndex > current.length) {
      deleting = true;
      setTimeout(typeWriter, 2000);
      return;
    }
    setTimeout(typeWriter, 75);
  }
}
setTimeout(typeWriter, 1200);

/* ── Scroll reveal ─────────────────────────────────────── */
const revealEls = document.querySelectorAll(".reveal");
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
);
revealEls.forEach((el) => revealObserver.observe(el));

/* ── Active nav highlight ──────────────────────────────── */
const sections  = document.querySelectorAll("section[id]");
const navLinks  = document.querySelectorAll(".tape-strip a");

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        navLinks.forEach((link) => {
          link.classList.remove("nav-active");
          if (link.getAttribute("href") === `#${entry.target.id}`) {
            link.classList.add("nav-active");
          }
        });
      }
    });
  },
  { threshold: 0.35 }
);
sections.forEach((s) => sectionObserver.observe(s));

/* ── Stats counter ─────────────────────────────────────── */
function runCounter(el, target, suffix) {
  const start = performance.now();
  const dur   = 1600;
  function step(now) {
    const t = Math.min((now - start) / dur, 1);
    const ease = 1 - Math.pow(1 - t, 4); // ease-out quart
    el.textContent = Math.floor(ease * target) + suffix;
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

const statsObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      statsObserver.unobserve(entry.target);
      const nums = entry.target.querySelectorAll(".stat-num[data-target]");
      nums.forEach((n) => runCounter(n, +n.dataset.target, n.dataset.suffix || ""));
    });
  },
  { threshold: 0.5 }
);
const statsStrip = document.querySelector(".stats-strip");
if (statsStrip) statsObserver.observe(statsStrip);

/* ── Aceternity-style 3D card tilt ─────────────────────── */
document.querySelectorAll(".pol-container").forEach((container) => {
  const card = container.querySelector(".polaroid");
  // Read --rot from the container (that's where it's declared in HTML)
  const rot  = parseFloat(
    getComputedStyle(container).getPropertyValue("--rot").trim()
  ) || 0;

  container.addEventListener("mousemove", (e) => {
    const r = container.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width  - 0.5) * 28;
    const y = ((e.clientY - r.top)  / r.height - 0.5) * 28;
    card.style.transition = "transform 0.07s linear";
    card.style.transform  = `rotateZ(${rot}deg) rotateY(${x}deg) rotateX(${-y}deg)`;
    card.style.boxShadow  = `${-x * 0.5}px ${y * 0.5 + 14}px 40px rgba(60,32,16,0.22)`;
  });

  container.addEventListener("mouseleave", () => {
    card.style.transition = "transform 0.7s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.4s";
    card.style.transform  = `rotateZ(${rot}deg) rotateY(0deg) rotateX(0deg)`;
    card.style.boxShadow  = "";
  });
});

/* ── Full-page dot-grid background (with parallax) ─────── */
(function dotBackground() {
  const bg  = document.createElement('canvas');
  bg.id     = 'dot-bg';
  document.body.prepend(bg);
  const ctx = bg.getContext('2d');

  const GAP            = 34;    // CSS px between dots
  const DOT_R          = 1.6;   // CSS px dot radius
  const MOUSE_R        = 100;   // CSS px influence radius
  const STRENGTH       = 52;
  const RETURN         = 0.07;
  const PULSE_CHANCE   = 0.0007;
  const PARALLAX_RATE  = 0.3;   // dots scroll at 30% of page scroll speed

  let W, H, dots = [], bgMx = -9999, bgMy = -9999;

  function resize() {
    const dpr = devicePixelRatio;
    W = bg.width  = Math.round(window.innerWidth  * dpr);
    H = bg.height = Math.round(window.innerHeight * dpr);
    buildGrid();
  }

  function buildGrid() {
    const dpr = devicePixelRatio;
    const g   = GAP * dpr;

    // Extend grid well below the viewport so dots fill in as the
    // parallax shift slides the visible window upward during scroll.
    // Extra height = estimated max shift = page height × rate.
    const pageH   = Math.round(document.body.scrollHeight * dpr);
    const extraH  = pageH * PARALLAX_RATE;
    const totalH  = H + extraH;

    const cols = Math.floor(W / g);
    const rows = Math.floor(totalH / g);
    const ox   = (W - cols * g) / 2;

    dots = [];
    for (let r = 0; r <= rows; r++) {
      for (let c = 0; c <= cols; c++) {
        const x = ox + c * g;
        const y = r * g;           // grid starts at y = 0, extends below viewport
        dots.push({
          ox: x, oy: y, x, y, vx: 0, vy: 0,
          bright: 0.18 + Math.random() * 0.12,
          pulse: 0,
          ps: 0.030 + Math.random() * 0.025,
        });
      }
    }
  }

  document.addEventListener('mousemove', (e) => {
    const dpr = devicePixelRatio;
    bgMx = e.clientX * dpr;
    bgMy = e.clientY * dpr;
  }, { passive: true });

  function tick() {
    const dpr   = devicePixelRatio;
    const mr    = MOUSE_R * dpr;
    // How far the dot layer has drifted upward relative to the viewport
    const shift = window.scrollY * PARALLAX_RATE * dpr;
    // Mouse position in dot-grid space (compensate for the layer shift)
    const gridMy = bgMy + shift;

    // Fill the viewport with the background colour (unshifted)
    ctx.fillStyle = '#FDF6E3';
    ctx.fillRect(0, 0, W, H);

    // Shift all subsequent drawing so the grid scrolls at PARALLAX_RATE
    ctx.save();
    ctx.translate(0, -shift);

    for (const d of dots) {
      // Only process dots that are within or near the visible window
      if (d.y < shift - mr || d.y > shift + H + mr) continue;

      const dx   = d.x - bgMx;
      const dy   = d.y - gridMy;   // compare in grid space
      const dist = Math.hypot(dx, dy);

      if (dist < mr && dist > 0) {
        const f = (mr - dist) / mr;
        d.vx += (dx / dist) * f * STRENGTH * 0.15;
        d.vy += (dy / dist) * f * STRENGTH * 0.15;
      }
      d.vx += (d.ox - d.x) * RETURN;
      d.vy += (d.oy - d.y) * RETURN;
      d.vx *= 0.75; d.vy *= 0.75;
      d.x  += d.vx;  d.y  += d.vy;

      if (Math.random() < PULSE_CHANCE) d.pulse = 1;
      if (d.pulse > 0) d.pulse = Math.max(0, d.pulse - d.ps);

      const b  = d.bright + d.pulse * 0.65;
      const mf = dist < mr ? 0.4 * (1 - dist / mr) : 0;
      const fb = Math.min(1, b + mf);

      // kraft #C4A06A (196,160,106) → rust #A0431E (160,67,30) at peak
      const rr = Math.round(196 - fb * 36);
      const gg = Math.round(160 - fb * 93);
      const bb = Math.round(106 - fb * 76);
      const aa = 0.10 + fb * 0.60;

      ctx.beginPath();
      ctx.arc(d.x, d.y, (DOT_R + d.pulse * 0.6) * dpr, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${rr},${gg},${bb},${aa})`;
      ctx.fill();
    }

    ctx.restore();
    requestAnimationFrame(tick);
  }

  resize();
  window.addEventListener('resize', resize, { passive: true });
  requestAnimationFrame(tick);
})();

/* ── Hero parallax rings ───────────────────────────────── */
const rings = document.querySelectorAll(".coffee-ring");
window.addEventListener("scroll", () => {
  const y = window.scrollY;
  if (rings[0]) rings[0].style.transform = `translateY(${y * 0.18}px)`;
  if (rings[1]) rings[1].style.transform = `translateY(${y * 0.09}px)`;
}, { passive: true });

/* ── Chat Widget ───────────────────────────────────────── */
(function chatWidget() {
  const widget      = document.getElementById("chat-widget");
  const toggle      = document.getElementById("chat-toggle");
  const panel       = document.getElementById("chat-panel");
  const messages    = document.getElementById("chat-messages");
  const suggestions = document.getElementById("chat-suggestions");
  const form     = document.getElementById("chat-form");
  const input    = document.getElementById("chat-input");

  const MSG_CAP = 10;
  let isOpen    = true;
  let isLoading = false;
  let msgCount  = 0;
  const history = []; // { role, content }[]

  // Start open
  widget.classList.add("open");
  panel.hidden = false;

  toggle.addEventListener("click", () => {
    isOpen = !isOpen;
    widget.classList.toggle("open", isOpen);
    panel.hidden = !isOpen;
    if (isOpen) {
      setTimeout(() => input.focus(), 280);
    }
  });

  function addMsg(text, role) {
    const div = document.createElement("div");
    div.className = `chat-msg chat-msg--${role}`;
    div.innerHTML = `<p>${text}</p>`;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
    return div;
  }

  function addTyping() {
    const div = document.createElement("div");
    div.className = "chat-msg chat-msg--bot chat-msg--typing";
    div.innerHTML = `<div class="chat-dots"><span></span><span></span><span></span></div>`;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
    return div;
  }

  function lockChat() {
    input.disabled = true;
    input.placeholder = "Message limit reached — reach out via email!";
    form.querySelector("button[type='submit']").disabled = true;
  }

  // Suggestion chips — click to send
  suggestions.querySelectorAll(".suggestion-chip").forEach((chip) => {
    chip.addEventListener("mouseenter", () => ring.classList.add("cursor-hover"));
    chip.addEventListener("mouseleave", () => ring.classList.remove("cursor-hover"));
    chip.addEventListener("click", () => {
      input.value = chip.textContent;
      suggestions.classList.add("hidden");
      form.dispatchEvent(new Event("submit", { cancelable: true }));
    });
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text || isLoading || msgCount >= MSG_CAP) return;

    input.value = "";
    suggestions.classList.add("hidden");
    isLoading = true;
    msgCount++;
    addMsg(text, "user");
    history.push({ role: "user", content: text });

    const typingEl = addTyping();

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history: history.slice(-6) }),
      });
      const data = await res.json();
      typingEl.remove();

      const reply = data.reply || "Sorry, something went wrong.";
      addMsg(reply, "bot");
      history.push({ role: "assistant", content: reply });

      if (msgCount >= MSG_CAP) {
        addMsg("That's the limit for this session! Feel free to email me at thiamharouna201@gmail.com.", "bot");
        lockChat();
      }
    } catch {
      typingEl.remove();
      msgCount--; // don't count failed requests
      addMsg("Hmm, I couldn't connect. Try again in a moment.", "bot");
    } finally {
      isLoading = false;
    }
  });
})();

/* ── Timeline dot click ripple ─────────────────────────── */
document.querySelectorAll(".timeline-card").forEach((card) => {
  card.addEventListener("click", (e) => {
    const ripple = document.createElement("span");
    ripple.className = "ripple";
    const rect = card.getBoundingClientRect();
    ripple.style.left = `${e.clientX - rect.left}px`;
    ripple.style.top  = `${e.clientY - rect.top}px`;
    card.appendChild(ripple);
    ripple.addEventListener("animationend", () => ripple.remove());
  });
});
