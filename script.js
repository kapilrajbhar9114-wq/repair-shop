/* ==========================================================
   Repair Shop Website — script.js
   Features:
   - Page loader + smooth page transitions
   - Sticky navbar with scroll detection
   - Mobile menu toggle
   - Active nav link highlight
   - Scroll reveal (IntersectionObserver)
   - JS 3D tilt effect on cards
   - Count-up animation for stats
   - Typing effect for hero heading
   - Testimonial auto-slider with dots + controls
   - Scroll progress bar
   - Back to top button
   - Contact form validation
   ========================================================== */

(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* ─── PAGE LOADER ─── */
  window.addEventListener("load", () => {
    setTimeout(() => document.body.classList.add("page-ready"), 380);
  });

  function navigateWithTransition(url) {
    document.body.classList.remove("page-ready");
    document.body.classList.add("page-exiting");
    setTimeout(() => { window.location.href = url; }, 230);
  }

  $$("[data-navigate]").forEach(el => {
    el.addEventListener("click", e => {
      const href = el.getAttribute("href") || el.dataset.navigate;
      if (!href) return;
      if (/^https?:\/\//i.test(href) && el.getAttribute("target") === "_blank") return;
      e.preventDefault();
      navigateWithTransition(href);
    });
  });

  /* ─── SCROLL PROGRESS BAR ─── */
  const progressBar = $("#scrollProgress");
  function updateScrollProgress() {
    if (!progressBar) return;
    const scrollTop = window.scrollY;
    const docHeight = document.body.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = pct.toFixed(1) + "%";
  }

  /* ─── NAVBAR SCROLLED STATE ─── */
  const navbar = $("#navbar");
  function onScroll() {
    updateScrollProgress();
    if (navbar) navbar.classList.toggle("scrolled", window.scrollY > 40);
    // Back to top
    const btt = $("#backToTop");
    if (btt) btt.classList.toggle("visible", window.scrollY > 350);
  }
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ─── MOBILE MENU ─── */
  const mobileBtn = $("#mobileMenuBtn");
  const mobileMenu = $("#mobileMenu");
  if (mobileBtn && mobileMenu) {
    mobileBtn.addEventListener("click", () => {
      const expanded = mobileBtn.getAttribute("aria-expanded") === "true";
      mobileBtn.setAttribute("aria-expanded", String(!expanded));
      mobileMenu.classList.toggle("open", !expanded);
    });
    $$("#mobileMenu a.nav-link").forEach(a => {
      a.addEventListener("click", () => {
        mobileBtn.setAttribute("aria-expanded", "false");
        mobileMenu.classList.remove("open");
      });
    });
  }

  /* ─── ACTIVE NAV LINK ─── */
  const current = (window.location.pathname.split("/").pop() || "").toLowerCase();
  $$(".nav-link[data-page]").forEach(link => {
    const page = (link.getAttribute("data-page") || "").toLowerCase();
    if (page && current.endsWith(page)) link.classList.add("is-active");
  });

  /* ─── BACK TO TOP ─── */
  const btt = $("#backToTop");
  if (btt) {
    btt.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  /* ─── SCROLL REVEAL ─── */
  function setupScrollReveal() {
    const items = $$(".reveal");
    if (!("IntersectionObserver" in window) || items.length === 0) {
      items.forEach(el => el.classList.add("reveal-visible"));
      return;
    }
    const obs = new IntersectionObserver(entries => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add("reveal-visible");
          obs.unobserve(e.target);
        }
      }
    }, { threshold: 0.10 });
    items.forEach(el => obs.observe(el));
  }
  setupScrollReveal();

  /* ─── 3D TILT EFFECT ─── */
  function setupTilt() {
    if (window.matchMedia && window.matchMedia("(hover: none)").matches) return;
    $$("[data-tilt]").forEach(el => {
      const max = Number(el.dataset.tiltMax || 8);
      let raf = 0;
      function applyTilt(cx, cy) {
        const r = el.getBoundingClientRect();
        const px = (cx - r.left) / r.width;
        const py = (cy - r.top) / r.height;
        el.style.setProperty("--mx", `${Math.round(px * 100)}%`);
        el.style.setProperty("--my", `${Math.round(py * 100)}%`);
        el.style.setProperty("--rx", `${(-(py * 2 - 1) * max).toFixed(2)}deg`);
        el.style.setProperty("--ry", `${((px * 2 - 1) * max).toFixed(2)}deg`);
      }
      el.addEventListener("pointerenter", () => { el.dataset.tiltActive = "true"; });
      el.addEventListener("pointermove", e => {
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => applyTilt(e.clientX, e.clientY));
      });
      el.addEventListener("pointerleave", () => {
        el.dataset.tiltActive = "false";
        el.style.setProperty("--rx", "0deg");
        el.style.setProperty("--ry", "0deg");
        el.style.setProperty("--mx", "50%");
        el.style.setProperty("--my", "30%");
      });
    });
  }
  setupTilt();

  /* ─── COUNT-UP ANIMATION ─── */
  function setupCountUp() {
    const items = $$(".count-up");
    if (items.length === 0) return;
    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseFloat(el.dataset.target || "100");
        const decimals = Number(el.dataset.decimal || "0");
        // For rating tiles, HTML stores "48" for 4.8 (scaled by 10^decimals).
        const factor = Math.pow(10, decimals);
        const startVal = parseFloat(el.dataset.start || "0");
        const duration = 1600;
        let startTime = null;
        function tick(now) {
          if (!startTime) startTime = now;
          const elapsed = Math.min(now - startTime, duration);
          const progress = elapsed / duration;
          // Ease out quad
          const eased = 1 - (1 - progress) * (1 - progress);
          const scaledValue = startVal + (target - startVal) * eased;
          const displayValue = scaledValue / factor;
          el.textContent =
            decimals > 0 ? displayValue.toFixed(decimals) : Math.round(displayValue).toString();
          if (elapsed < duration) requestAnimationFrame(tick);
          else {
            const finalDisplay = target / factor;
            el.textContent =
              decimals > 0 ? finalDisplay.toFixed(decimals) : Math.round(finalDisplay).toString();
          }
        }
        requestAnimationFrame(tick);
        obs.unobserve(el);
      });
    }, { threshold: 0.3 });
    items.forEach(el => obs.observe(el));
  }
  setupCountUp();

  /* ─── TYPING EFFECT ─── */
  function setupTypingEffect() {
    const el = $("#typingText");
    if (!el) return;
    const reduceMotion =
      window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const word = el.dataset.typing || (el.textContent || "Smart Solution").trim();
    const typingSpeed = Number(el.dataset.typingSpeed || 65);

    if (reduceMotion) {
      el.textContent = word;
      return;
    }

    el.textContent = "";
    let i = 0;

    function typeNext() {
      i += 1;
      el.textContent = word.slice(0, i);
      if (i < word.length) setTimeout(typeNext, typingSpeed);
    }

    // Start after a small delay so page is ready
    setTimeout(typeNext, 650);
  }
  setupTypingEffect();

  /* ─── TESTIMONIAL SLIDER ─── */
  function setupTestimonialSlider() {
    const slider = $("#testimonialSlider");
    const dotsContainer = $("#sliderDots");
    const prevBtn = $("#prevBtn");
    const nextBtn = $("#nextBtn");
    if (!slider || !dotsContainer) return;

    const cards = $$(".testimonial-card", slider);
    if (cards.length === 0) return;

    let current = 0;
    let autoTimer = null;

    // Create dots
    cards.forEach((_, i) => {
      const dot = document.createElement("button");
      dot.className = "slider-dot" + (i === 0 ? " active" : "");
      dot.setAttribute("role", "tab");
      dot.setAttribute("aria-label", `Review ${i + 1}`);
      dot.addEventListener("click", () => goTo(i));
      dotsContainer.appendChild(dot);
    });

    function goTo(index) {
      current = (index + cards.length) % cards.length;
      slider.style.transform = `translateX(-${current * 100}%)`;
      $$(".slider-dot", dotsContainer).forEach((d, i) => d.classList.toggle("active", i === current));
    }

    function startAuto() {
      autoTimer = setInterval(() => goTo(current + 1), 4500);
    }
    function resetAuto() {
      clearInterval(autoTimer);
      startAuto();
    }

    if (prevBtn) prevBtn.addEventListener("click", () => { goTo(current - 1); resetAuto(); });
    if (nextBtn) nextBtn.addEventListener("click", () => { goTo(current + 1); resetAuto(); });

    // Touch/drag support
    let touchStartX = 0;
    slider.addEventListener("touchstart", e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    slider.addEventListener("touchend", e => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 40) { goTo(dx < 0 ? current + 1 : current - 1); resetAuto(); }
    }, { passive: true });

    startAuto();
  }
  setupTestimonialSlider();

  /* ─── CONTACT FORM VALIDATION ─── */
  function setupContactForm() {
    const form = $("#contactForm");
    if (!form) return;
    const nameInput = $("#contactName");
    const phoneInput = $("#contactPhone");
    const messageInput = $("#contactMessage");
    const toast = $("#formToast");
    const errName = $("#errName");
    const errPhone = $("#errPhone");
    const errMsg = $("#errMessage");

    function showToast(text) {
      toast.textContent = text;
      toast.classList.add("show");
      setTimeout(() => toast.classList.remove("show"), 3500);
    }
    function setError(el, msg) { if (el) el.textContent = msg || ""; }

    // Prefill from URL param
    const service = new URLSearchParams(window.location.search).get("service");
    if (service && messageInput && !messageInput.value.trim()) {
      messageInput.value = `Hi, I want to book a ${service} service. Please contact me.`;
    }

    form.addEventListener("submit", e => {
      e.preventDefault();
      setError(errName, ""); setError(errPhone, ""); setError(errMsg, "");
      const name = (nameInput?.value || "").trim();
      const phone = (phoneInput?.value || "").trim().replace(/\D/g, "");
      const msg = (messageInput?.value || "").trim();
      let hasErr = false;
      if (name.length < 2) { setError(errName, "Please enter your name."); hasErr = true; }
      if (phone.length < 10 || phone.length > 13) { setError(errPhone, "Enter a valid 10-13 digit number."); hasErr = true; }
      if (msg.length < 10) { setError(errMsg, "Message must be at least 10 characters."); hasErr = true; }
      if (!hasErr) { showToast("✅ Request submitted! We'll contact you soon."); form.reset(); }
    });
  }
  setupContactForm();

  /* ─── FOOTER YEAR (safety fallback) ─── */
  const yr = $("#year");
  if (yr && !yr.textContent) yr.textContent = String(new Date().getFullYear());

})();
