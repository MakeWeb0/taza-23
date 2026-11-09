/* Taza 23 — hero logo that draws itself over their reels, ritual steps, the cup builder, vitrina, carta tabs */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasGsap = !!window.gsap;
  const motion = hasGsap && !reduced;
  document.documentElement.classList.remove("no-js");
  if (!motion) document.documentElement.classList.add("reduced");
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);

  /* ---------------------------------------------------------- hero video (its source is picked inline in the HTML, before loading) */
  const hv = $("[data-hero]");
  // nothing heavy downloads until the hero can play through, so it never sits frozen on a first visit
  const heroReady = new Promise((ok) => {
    if (hv.readyState >= 4) return ok();
    hv.addEventListener("canplaythrough", ok, { once: true });
    setTimeout(ok, 8000);
  });

  /* ---------------------------------------------------------- videos play only when visible */
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    const v = e.target;
    if (e.isIntersecting) { v.preload = "auto"; const p = v.play(); if (p) p.catch(() => {}); } else v.pause();
  }), { threshold: 0.12 });
  $$("video").forEach((v) => { v.muted = true; if (!(motion && v.hasAttribute("data-rit-video"))) io.observe(v); });

  /* ---------------------------------------------------------- nav */
  const nav = $("[data-nav]");
  const burger = $(".burger"), menu = $("#menu");
  const setMenu = (open) => {
    burger.setAttribute("aria-expanded", open);
    burger.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    if (open) { menu.hidden = false; requestAnimationFrame(() => menu.classList.add("is-open")); }
    else { menu.classList.remove("is-open"); setTimeout(() => { if (!menu.classList.contains("is-open")) menu.hidden = true; }, 750); }
    document.body.style.overflow = open ? "hidden" : "";
    nav.classList.toggle("is-menu", open);
    themeAt();
  };
  burger.addEventListener("click", () => setMenu(burger.getAttribute("aria-expanded") !== "true"));
  $$("a", menu).forEach((a) => a.addEventListener("click", () => setMenu(false)));
  addEventListener("keydown", (e) => { if (e.key === "Escape" && burger.getAttribute("aria-expanded") === "true") { setMenu(false); burger.focus(); } });

  const hero = $(".hero");
  function themeAt() {
    if (nav.classList.contains("is-menu")) { nav.classList.remove("is-light", "is-scrolled", "is-top"); return; }
    const y = nav.offsetHeight / 2;
    const sec = $$("[data-theme]").find((s) => { const r = s.getBoundingClientRect(); return r.top <= y && r.bottom > y; });
    nav.classList.toggle("is-light", !!(sec && sec.dataset.theme === "light"));
    const inHero = scrollY < hero.offsetHeight * 0.55;
    nav.classList.toggle("is-top", inHero);
    nav.classList.toggle("is-scrolled", !(sec && sec === hero));
  }
  addEventListener("scroll", themeAt, { passive: true });
  addEventListener("resize", themeAt);
  themeAt();

  /* ---------------------------------------------------------- the cup drawing */
  const drawCup = (svg, tl, at = 0, dur = 1.5) => {
    const lines = $$(".draw .ln:not(.st)", svg), steam = $$(".st", svg), fill = $(".fill", svg);
    const per = dur / lines.length;
    lines.forEach((l, i) => tl.to(l, { strokeDashoffset: 0, duration: per * 1.6, ease: "power1.inOut" }, at + i * per));
    tl.to(fill, { opacity: 1, duration: 0.3 }, at + dur);
    steam.forEach((l, i) => tl.to(l, { strokeDashoffset: 0, duration: 1.1, ease: "power1.out" }, at + dur * 0.75 + i * 0.18));
    return at + dur;
  };
  const steamLoop = (svg) => {
    $$(".st", svg).forEach((l, i) => {
      gsap.timeline({ repeat: -1, delay: 1.2 + i * 0.5, repeatDelay: 0.4 })
        .to(l, { strokeDashoffset: -1, duration: 2.2, ease: "power1.in" })
        .set(l, { strokeDashoffset: 1 })
        .to(l, { strokeDashoffset: 0, duration: 1.6, ease: "power1.out" });
    });
  };

  /* ---------------------------------------------------------- hero */
  const hlogo = $(".hero__logo");
  if (motion) {
    const word = $(".wclip", hlogo), sub = $(".sub", hlogo);
    gsap.set(word, { attr: { width: 0 } });
    gsap.set(sub, { opacity: 0, y: 14 });
    gsap.set([".hero__claim", ".hero__cta", ".hero__foot"], { opacity: 0, y: 20 });
    gsap.set(hv, { scale: 1.12 });
    const tl = gsap.timeline({ delay: 0.2 });
    tl.to(hv, { scale: 1, duration: 3.2, ease: "power2.out" }, 0);
    const t = drawCup(hlogo, tl, 0.2, 1.3);
    tl.to(word, { attr: { width: 760 }, duration: 1.4, ease: "power2.inOut" }, t - 0.5)
      .to(sub, { opacity: 1, y: 0, duration: 0.9, ease: "power2.out" }, t + 0.5)
      .to([".hero__claim", ".hero__cta", ".hero__foot"], { opacity: 1, y: 0, duration: 1, stagger: 0.12, ease: "power2.out" }, t + 0.7)
      .add(() => steamLoop(hlogo));
    gsap.timeline({ scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true } })
      .to(".hero__inner", { yPercent: -18, opacity: 0, ease: "none" }, 0)
      .to(hv, { yPercent: 14, ease: "none" }, 0);
  } else {
    $(".wclip", hlogo).setAttribute("width", 760);
    $(".fill", hlogo).setAttribute("opacity", 1);
  }

  /* ---------------------------------------------------------- reveals */
  if (motion) {
    $$("main .display, main .h2, .bienvenida__copy > p, .cats, .tazas__copy > p, .vitrina__intro p").forEach((el) => {
      gsap.from(el, { opacity: 0, y: 34, duration: 1.1, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 88%" } });
    });
    const pops = ".print, .opiniones, .visita__map, .horario li";
    gsap.set(pops, { opacity: 0, y: 40 });
    ScrollTrigger.batch(pops, { start: "top 92%", once: true,
      onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 1.1, stagger: 0.07, ease: "power3.out" }) });
    // the two prints drift at different speeds
    gsap.to(".print--a", { yPercent: -8, ease: "none", scrollTrigger: { trigger: ".bienvenida", start: "top bottom", end: "bottom top", scrub: true } });
    gsap.to(".print--b", { yPercent: 10, ease: "none", scrollTrigger: { trigger: ".bienvenida", start: "top bottom", end: "bottom top", scrub: true } });
  }

  /* ---------------------------------------------------------- ritual: pinned; the card opens into a panel and the scroll drives the reel */
  const rit = $("[data-rit]"), rMedia = $("[data-rit-media]"), rVid = $("[data-rit-video]");
  const rWords = $$(".rit__w", rit), rLabels = $$(".rit__labels li", rit), rBar = $("[data-rit-bar]");
  const rTimes = rWords.map((w) => +w.dataset.t);
  const RDUR = +rit.dataset.dur;
  if (motion) {
    const geo = () => {
      const vw = innerWidth, vh = rit.offsetHeight, desk = vw > 860;
      const h = desk ? vh * 0.62 : vh * 0.38, w = h * 9 / 16;
      return { c: { left: (vw - w) / 2, top: (vh - h) / 2 - (desk ? 0 : vh * 0.02), width: w, height: h },
        f: desk ? { left: vw * 0.42, top: 0, width: vw * 0.58, height: vh } : { left: 0, top: 0, width: vw, height: vh } };
    };
    let G = geo();
    const proxy = { t: 0 };
    let want = 0;
    const seek = () => {
      want = proxy.t;
      if (rVid.readyState >= 1 && !rVid.seeking) rVid.currentTime = want;
      let k = 0; rTimes.forEach((s, i) => { if (want >= s - 0.05) k = i; });
      rLabels.forEach((li, i) => li.classList.toggle("is-on", i === k));
      rBar.style.transform = `scaleX(${want / RDUR})`;
    };
    // the whole clip as a blob: seeking is instant and does not depend on the server answering range requests
    const loadBlob = () => fetch(rVid.currentSrc || rVid.src).then((r) => r.blob()).then((b) => {
      rVid.src = URL.createObjectURL(b);
      rVid.addEventListener("loadeddata", seek, { once: true });
    }).catch(() => {});
    ScrollTrigger.create({ trigger: rit, start: "top 220%", once: true, onEnter: () => heroReady.then(loadBlob) });
    rVid.addEventListener("seeked", () => { if (Math.abs(rVid.currentTime - want) > 0.04) rVid.currentTime = want; });
    // iOS paints seeked frames only after one play()
    addEventListener("touchstart", () => { const p = rVid.play(); if (p) p.then(() => { rVid.pause(); seek(); }).catch(() => {}); }, { once: true, passive: true });

    const tl = gsap.timeline({ defaults: { ease: "none" },
      scrollTrigger: { trigger: rit, start: "top top", end: () => "+=" + innerHeight * 5.2, pin: true, scrub: 0.8, anticipatePin: 1,
        invalidateOnRefresh: true, onRefreshInit: () => { G = geo(); } } });
    tl.fromTo(rMedia, { left: () => G.c.left, top: () => G.c.top, width: () => G.c.width, height: () => G.c.height },
      { left: () => G.f.left, top: () => G.f.top, width: () => G.f.width, height: () => G.f.height, duration: 1, ease: "power2.inOut" }, 0)
      .to(".rit__l1", { xPercent: -25, opacity: 0, duration: 0.7, ease: "power1.in" }, 0)
      .to(".rit__l2", { xPercent: 25, opacity: 0, duration: 0.7, ease: "power1.in" }, 0)
      .to(".rit__lead", { opacity: 0, duration: 0.4 }, 0)
      .to(".rit__frame", { opacity: 0, duration: 0.5 }, 0.45)
      .to(".rit__shade", { opacity: 1, duration: 0.6 }, 0.5)
      .fromTo(rVid, { scale: 1.18 }, { scale: 1, duration: 7.4 }, 0)
      .fromTo(".rit__track", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4 }, 0.7);
    // one scroll beat per step: the reel runs from this step's moment to the next, the word rises in and leaves
    const ends = rTimes.slice(1).concat(RDUR);
    rWords.forEach((w, i) => tl.fromTo(proxy, { t: rTimes[i] }, { t: ends[i], duration: 1, onUpdate: seek, immediateRender: false }, 1 + i));
    const pos = (i) => 1 + i;
    rWords.forEach((w, i) => {
      const ch = $$(".ch", w), p = $("p", w);
      const at = i === 0 ? 0.75 : pos(i) - 0.02;
      tl.fromTo(ch, { yPercent: 118, rotate: 8 }, { yPercent: 0, rotate: 0, duration: 0.42, stagger: 0.035, ease: "power3.out" }, at)
        .fromTo(p, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }, at + 0.15);
      if (i < rWords.length - 1) {
        const out = pos(i + 1) - 0.28;
        tl.to(ch, { yPercent: -118, rotate: -6, duration: 0.26, stagger: 0.02, ease: "power2.in" }, out)
          .to(p, { opacity: 0, y: -10, duration: 0.2 }, out);
      }
    });
    tl.to({}, { duration: 0.5 });
    rVid.addEventListener("loadedmetadata", seek);
  } else {
    rVid.loop = true;
    rLabels.forEach((li) => li.classList.add("is-on"));
  }

  /* ---------------------------------------------------------- the cup builder */
  const data = JSON.parse($("#tazas-data").textContent);
  const COL = { e: "#2b170d", a: "#4b2b18", l: "#ead9c2", f: "#fbf5ec", c: "#e7cd98", k: "#b56c28", h: "#6e4128" };
  const layersEl = $("[data-layers]");
  const bars = [0, 1, 2].map(() => { const b = document.createElement("b"); layersEl.appendChild(b); return b; });
  const outN = $("[data-out-n]"), outP = $("[data-out-p]"), outD = $("[data-out-d]");
  const btns = $$("[data-taza-btn]");
  const builder = $(".taza--sm .cup-line");
  let current = null;
  const pour = (key, instant) => {
    if (key === current) return;
    current = key;
    const d = data[key];
    btns.forEach((b) => b.setAttribute("aria-pressed", b.dataset.tazaBtn === key));
    outN.textContent = d.n; outP.textContent = d.p; outD.textContent = d.d;
    let base = 0;
    bars.forEach((b, i) => {
      const L = d.l[i];
      const h = L ? L[1] * 100 : 0, bottom = base;
      if (L) b.style.background = COL[L[0]];
      base += h;
      if (motion && !instant) gsap.to(b, { height: h + "%", bottom: bottom + "%", duration: 0.9, delay: i * 0.12, ease: "power2.inOut" });
      else Object.assign(b.style, { height: h + "%", bottom: bottom + "%" });
    });
    if (motion && !instant) gsap.fromTo([outN, outP, outD], { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.06, ease: "power2.out" });
  };
  let auto = true, timer = null;
  const keys = Object.keys(data);
  btns.forEach((b) => b.addEventListener("click", () => { auto = false; clearInterval(timer); pour(b.dataset.tazaBtn); }));
  if (motion) {
    pour("leche", true);
    bars.forEach((b) => gsap.set(b, { height: 0 }));
    current = null;
    const btl = gsap.timeline({ paused: true });
    drawCup(builder, btl, 0, 1.2);
    ScrollTrigger.create({ trigger: ".tazas__stage", start: "top 75%", once: true,
      onEnter: () => { btl.play(); setTimeout(() => { if (auto) pour("leche"); }, 900); steamLoop(builder); } });
    ScrollTrigger.create({ trigger: ".tazas", start: "top 60%", end: "bottom 40%",
      onToggle: (s) => { clearInterval(timer); if (s.isActive && auto) timer = setInterval(() => pour(keys[(keys.indexOf(current) + 1) % keys.length]), 3400); } });
  } else {
    pour("leche", true);
    $(".fill", builder).setAttribute("opacity", 1);
  }

  /* ---------------------------------------------------------- vitrina: horizontal on desktop */
  if (motion) {
    ScrollTrigger.matchMedia({
      "(min-width: 861px)": () => {
        const track = $("[data-vtrack]");
        const dist = () => Math.max(0, track.scrollWidth - innerWidth);
        const tw = gsap.to(track, { x: () => -dist(), ease: "none",
          scrollTrigger: { trigger: "[data-vpin]", start: "top top", end: () => "+=" + dist(), pin: true, scrub: 0.6, invalidateOnRefresh: true, anticipatePin: 1 } });
        $$(".vit__img img").forEach((img) => gsap.fromTo(img, { xPercent: -6, scale: 1.12 }, { xPercent: 6, ease: "none",
          scrollTrigger: { trigger: img.parentNode, containerAnimation: tw, start: "left right", end: "right left", scrub: true } }));
        return () => tw.kill();
      },
    });
  }

  /* ---------------------------------------------------------- carta tabs */
  const tabs = $$('.carta__tabs [role="tab"]');
  const selectTab = (tab, focus) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute("aria-selected", on); t.tabIndex = on ? 0 : -1;
      $("#" + t.getAttribute("aria-controls")).hidden = !on;
    });
    if (focus) tab.focus();
    if (motion) {
      gsap.fromTo($$(".grp", $("#" + tab.getAttribute("aria-controls"))), { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.06, ease: "power2.out" });
      ScrollTrigger.refresh();
    }
  };
  tabs.forEach((t, i) => {
    t.addEventListener("click", () => selectTab(t));
    t.addEventListener("keydown", (e) => {
      const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if (d) { e.preventDefault(); selectTab(tabs[(i + d + tabs.length) % tabs.length], true); }
    });
  });

  /* ---------------------------------------------------------- reviews rotate */
  const qs = $$("[data-quotes] .q");
  let qi = 0;
  if (!reduced && qs.length > 1) setInterval(() => { qs[qi].classList.remove("is-on"); qi = (qi + 1) % qs.length; qs[qi].classList.add("is-on"); }, 5200);

  /* ---------------------------------------------------------- today */
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Madrid" }));
  const day = (now.getDay() + 6) % 7, mins = now.getHours() * 60 + now.getMinutes();
  const li = $(`.horario li[data-day="${day}"]`);
  if (li) li.classList.add("is-today");
  const status = $("[data-status]");
  let msg, dot = "#9a8d82";
  if (day === 1) msg = "Hoy martes cerramos · mañana desde las 8:00";
  else if (mins < 480) msg = "Abrimos hoy a las 8:00";
  else if (mins < 1260) { msg = "Abierto ahora · hasta las 21:00"; dot = "#5f8f5a"; }
  else msg = day === 0 ? "Cerrado · el miércoles desde las 8:00" : "Cerrado · mañana desde las 8:00";
  status.textContent = msg;
  status.style.setProperty("--dot", dot);

  addEventListener("load", () => hasGsap && ScrollTrigger.refresh());
})();
