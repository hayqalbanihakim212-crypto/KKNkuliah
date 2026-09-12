document.addEventListener("DOMContentLoaded", function () {
  /* =========================================
     0. MODE GELAP (DARK MODE)
     ========================================= */
  const THEME_STORAGE_KEY = "kkn2026-theme";
  const themeToggleBtn = document.getElementById("theme-toggle");
  const htmlEl = document.documentElement;

  function applyTheme(theme) {
    if (theme === "dark") {
      htmlEl.setAttribute("data-theme", "dark");
    } else {
      htmlEl.removeAttribute("data-theme");
    }
    if (themeToggleBtn) {
      themeToggleBtn.setAttribute(
        "aria-label",
        theme === "dark" ? "Ganti ke tema terang" : "Ganti ke tema gelap",
      );
    }
  }

  function getPreferredTheme() {
    try {
      const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === "dark" || saved === "light") return saved;
    } catch (e) {}
    const prefersDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    return prefersDark ? "dark" : "light";
  }

  let currentTheme = getPreferredTheme();
  applyTheme(currentTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", function () {
      currentTheme = currentTheme === "dark" ? "light" : "dark";
      applyTheme(currentTheme);
      try {
        window.localStorage.setItem(THEME_STORAGE_KEY, currentTheme);
      } catch (e) {}
    });
  }

  /* =========================================
     1. MESIN SCROLL TERPADU
     ========================================= */
  const siteHeader = document.getElementById("site-header");
  const heroSection = document.getElementById("beranda");
  const heroContour = document.querySelector(".hero-contour");
  const scrollProgressEl = document.getElementById("scroll-progress");
  const backToTopBtn = document.getElementById("back-to-top");

  let lastScrollY = window.scrollY;
  let scrollFrameQueued = false;
  const HIDE_THRESHOLD = 80;

  function updateHeaderState(currentScrollY) {
    if (!siteHeader) return;
    if (currentScrollY > 24) {
      siteHeader.classList.add("is-scrolled");
    } else {
      siteHeader.classList.remove("is-scrolled");
    }
    const scrollDelta = currentScrollY - lastScrollY;
    if (currentScrollY > HIDE_THRESHOLD && scrollDelta > 6) {
      siteHeader.classList.add("is-hidden");
    } else if (scrollDelta < -6 || currentScrollY <= HIDE_THRESHOLD) {
      siteHeader.classList.remove("is-hidden");
    }
  }

  function updateScrollProgress() {
    if (!scrollProgressEl) return;
    const scrollableHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    const ratio =
      scrollableHeight > 0
        ? Math.min(Math.max(window.scrollY / scrollableHeight, 0), 1)
        : 0;
    scrollProgressEl.style.transform = "scaleX(" + ratio.toFixed(4) + ")";
  }

  function updateHeroParallax(currentScrollY) {
    if (!heroSection) return;
    if (heroContour) {
      heroContour.style.setProperty(
        "--parallax-offset",
        (currentScrollY * 0.18).toFixed(1) + "px",
      );
    }
  }

  const ringProgressEl = document.querySelector(".ring-progress");
  const RING_CIRCUMFERENCE = 131.95;

  function updateBackToTop(currentScrollY) {
    if (!backToTopBtn) return;
    if (currentScrollY > window.innerHeight * 0.6) {
      backToTopBtn.classList.add("is-visible");
    } else {
      backToTopBtn.classList.remove("is-visible");
    }
    if (ringProgressEl) {
      const scrollableHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const ratio =
        scrollableHeight > 0
          ? Math.min(Math.max(currentScrollY / scrollableHeight, 0), 1)
          : 0;
      const offset = RING_CIRCUMFERENCE * (1 - ratio);
      ringProgressEl.style.strokeDashoffset = offset.toFixed(2);
    }
  }

  function handleScrollFrame() {
    const currentScrollY = window.scrollY;
    updateHeaderState(currentScrollY);
    updateScrollProgress();
    updateHeroParallax(currentScrollY);
    updateBackToTop(currentScrollY);
    lastScrollY = currentScrollY;
    scrollFrameQueued = false;
  }

  function onScroll() {
    if (!scrollFrameQueued) {
      scrollFrameQueued = true;
      window.requestAnimationFrame(handleScrollFrame);
    }
  }

  handleScrollFrame();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });

  if (backToTopBtn) {
    backToTopBtn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* =========================================
     2. MENU TOGGLE (MOBILE)
     ========================================= */
  const menuToggle = document.getElementById("menu-toggle");
  const navMenu = document.getElementById("main-nav");
  const navBackdrop = document.getElementById("nav-backdrop");
  const navClose = document.getElementById("main-nav-close");
  const navLinks = document.querySelectorAll(".main-nav a.nav-link");
  const siteHeaderEl = document.getElementById("site-header");

  function openMobileNav() {
    if (!navMenu) return;
    navMenu.classList.add("active");
    navMenu.scrollTop = 0;
    if (navBackdrop) navBackdrop.classList.add("active");
    if (menuToggle) {
      menuToggle.classList.add("active");
      menuToggle.setAttribute("aria-expanded", "true");
    }
    if (siteHeaderEl) siteHeaderEl.classList.add("nav-open");
    document.body.style.overflow = "hidden";
  }

  function closeMobileNav() {
    if (!navMenu) return;
    navMenu.classList.remove("active");
    if (navBackdrop) navBackdrop.classList.remove("active");
    if (menuToggle) {
      menuToggle.classList.remove("active");
      menuToggle.setAttribute("aria-expanded", "false");
    }
    if (siteHeaderEl) siteHeaderEl.classList.remove("nav-open");
    document.body.style.overflow = "";
    const openDropdown = document.querySelector(".has-dropdown.open");
    if (openDropdown) openDropdown.classList.remove("open");
    const openToggle = document.querySelector("[aria-expanded='true']");
    if (openToggle && openToggle !== menuToggle) {
      openToggle.setAttribute("aria-expanded", "false");
    }
  }

  if (menuToggle) {
    menuToggle.addEventListener("click", function () {
      if (navMenu && navMenu.classList.contains("active")) {
        closeMobileNav();
      } else {
        openMobileNav();
      }
    });
  }
  if (navClose) navClose.addEventListener("click", closeMobileNav);
  if (navBackdrop) navBackdrop.addEventListener("click", closeMobileNav);
  navLinks.forEach(function (link) {
    link.addEventListener("click", closeMobileNav);
  });

  /* =========================================
     3. DROPDOWN MENU (DESKTOP)
     ========================================= */
  const strukturDropdown = document.querySelector(".has-dropdown");
  const strukturToggle = document.getElementById("struktur-toggle");
  const strukturMenu = document.getElementById("struktur-menu");

  if (strukturDropdown && strukturToggle && strukturMenu) {
    strukturToggle.addEventListener("click", function () {
      const isOpen = strukturDropdown.classList.contains("open");
      strukturDropdown.classList.toggle("open");
      strukturToggle.setAttribute("aria-expanded", !isOpen);
      if (!isOpen) {
        window.addEventListener("click", closeDropdownOnClickOutside);
      } else {
        window.removeEventListener("click", closeDropdownOnClickOutside);
      }
    });

    function closeDropdownOnClickOutside(event) {
      if (!strukturDropdown.contains(event.target)) {
        strukturDropdown.classList.remove("open");
        strukturToggle.setAttribute("aria-expanded", "false");
        window.removeEventListener("click", closeDropdownOnClickOutside);
      }
    }
  }

  // Stagger index dropdown items
  (function () {
    const items = document.querySelectorAll(".dropdown-item");
    items.forEach(function (item, index) {
      item.style.setProperty("--reveal-i", index);
    });
  })();

  // Stagger untuk carousel & galeri
  function pasangStaggerIndex(groupSelector, itemSelector) {
    document.querySelectorAll(groupSelector).forEach(function (group) {
      const items = group.querySelectorAll(itemSelector);
      items.forEach(function (item, index) {
        item.style.setProperty("--reveal-i", index);
      });
    });
  }
  pasangStaggerIndex(".proker-carousel-track", ".program-card");
  pasangStaggerIndex(".gallery-grid", ".gallery-tile");
  pasangStaggerIndex(".neo-gallery", ".gallery-tile");
  pasangStaggerIndex(".program-grid", ".neo-program-card");
  pasangStaggerIndex(".doc-grid", ".doc-card");

  /* =========================================
     4. PROKER CAROUSEL INLINE
     ========================================= */
  (function () {
    var track = document.getElementById("proker-car-track");
    var prevBtn = document.getElementById("proker-car-prev");
    var nextBtn = document.getElementById("proker-car-next");
    var dotsWrap = document.getElementById("proker-car-dots");
    if (!track) return;

    var cards = track.querySelectorAll(".program-card");
    var totalCards = cards.length;
    var currentIdx = 0;

    function perPage() {
      var w = window.innerWidth;
      if (w <= 600) return 1;
      if (w <= 900) return 2;
      return 3;
    }
    function maxIdx() {
      return Math.max(0, totalCards - perPage());
    }
    function renderDots() {
      if (!dotsWrap) return;
      dotsWrap.innerHTML = "";
      var total = maxIdx() + 1;
      for (var i = 0; i < total; i++) {
        var dot = document.createElement("button");
        dot.className =
          "proker-carousel-dot" + (i === currentIdx ? " active" : "");
        dot.setAttribute("aria-label", "Ke slide " + (i + 1));
        dot.setAttribute("type", "button");
        (function (idx) {
          dot.addEventListener("click", function () {
            goTo(idx);
          });
        })(i);
        dotsWrap.appendChild(dot);
      }
    }
    function updateDots() {
      if (!dotsWrap) return;
      dotsWrap
        .querySelectorAll(".proker-carousel-dot")
        .forEach(function (d, i) {
          d.classList.toggle("active", i === currentIdx);
        });
    }
    function updateButtons() {
      if (prevBtn) prevBtn.classList.toggle("is-disabled", currentIdx === 0);
      if (nextBtn)
        nextBtn.classList.toggle("is-disabled", currentIdx >= maxIdx());
    }
    function goTo(idx) {
      currentIdx = Math.max(0, Math.min(idx, maxIdx()));
      var gap = 28;
      var cardW =
        (track.getBoundingClientRect().width - gap * (perPage() - 1)) /
        perPage();
      track.style.transform =
        "translateX(-" + currentIdx * (cardW + gap) + "px)";
      updateDots();
      updateButtons();
    }
    if (prevBtn)
      prevBtn.addEventListener("click", function () {
        goTo(currentIdx - 1);
      });
    if (nextBtn)
      nextBtn.addEventListener("click", function () {
        goTo(currentIdx + 1);
      });

    var dragStart = null;
    var dragOrigin = 0;
    track.addEventListener("mousedown", function (e) {
      dragStart = e.clientX;
      dragOrigin = currentIdx;
      track.classList.add("is-dragging");
    });
    window.addEventListener("mousemove", function (e) {
      if (dragStart === null) return;
      var diff = e.clientX - dragStart;
      var gap = 28;
      var cardW =
        (track.getBoundingClientRect().width - gap * (perPage() - 1)) /
        perPage();
      var base = dragOrigin * (cardW + gap);
      track.style.transform = "translateX(-" + (base - diff) + "px)";
    });
    window.addEventListener("mouseup", function (e) {
      if (dragStart === null) return;
      var diff = e.clientX - dragStart;
      var cardW =
        (track.getBoundingClientRect().width - 28 * (perPage() - 1)) /
        perPage();
      if (Math.abs(diff) > cardW * 0.25) {
        goTo(diff < 0 ? dragOrigin + 1 : dragOrigin - 1);
      } else {
        goTo(dragOrigin);
      }
      dragStart = null;
      track.classList.remove("is-dragging");
    });
    track.addEventListener(
      "touchstart",
      function (e) {
        dragStart = e.touches[0].clientX;
        dragOrigin = currentIdx;
      },
      { passive: true },
    );
    track.addEventListener(
      "touchend",
      function (e) {
        if (dragStart === null) return;
        var diff = e.changedTouches[0].clientX - dragStart;
        var cardW =
          (track.getBoundingClientRect().width - 28 * (perPage() - 1)) /
          perPage();
        if (Math.abs(diff) > cardW * 0.25) {
          goTo(diff < 0 ? dragOrigin + 1 : dragOrigin - 1);
        } else {
          goTo(dragOrigin);
        }
        dragStart = null;
      },
      { passive: true },
    );
    window.addEventListener(
      "resize",
      function () {
        renderDots();
        goTo(Math.min(currentIdx, maxIdx()));
      },
      { passive: true },
    );
    renderDots();
    updateButtons();
  })();

  /* =========================================
     5. LAZY LOADING — PERBAIKAN MODEL
     
     Menggunakan IntersectionObserver TERPISAH
     untuk tiga fungsi berbeda:
     
     A) lazyImgObserver  → lazy load <img data-src>
     B) revealObserver   → reveal animasi scroll
     C) sectionObserver  → section overlap parallax
     ========================================= */

  // ── A) LAZY IMAGE LOADING ──────────────────────
  // Semua <img> yang sudah punya loading="lazy" browser
  // sudah handle native, tapi untuk gambar di dalam
  // viewport awal atau yang perlu fallback, kita gunakan
  // observer manual untuk data-src pattern.

  const lazyImgObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        const img = entry.target;

        // Jika ada data-src, swap ke src
        if (img.dataset.src) {
          img.src = img.dataset.src;
          delete img.dataset.src;
        }
        // Jika ada data-srcset, swap ke srcset
        if (img.dataset.srcset) {
          img.srcset = img.dataset.srcset;
          delete img.dataset.srcset;
        }

        img.classList.add("img-loaded");
        lazyImgObserver.unobserve(img);
      });
    },
    {
      root: null,
      rootMargin: "200px 0px 200px 0px", // Pre-load 200px sebelum masuk viewport
      threshold: 0,
    },
  );

  // Pasang native lazy + observer untuk semua gambar
  document.querySelectorAll("img").forEach(function (img) {
    // Tambahkan loading="lazy" jika belum ada
    if (!img.hasAttribute("loading")) {
      img.setAttribute("loading", "lazy");
    }
    // Jika gambar pakai data-src (pattern lazy manual), observe
    if (img.dataset.src) {
      lazyImgObserver.observe(img);
    }
    // Tambah kelas img-reveal untuk fade-in
    img.classList.add("img-reveal");
    // Jika sudah complete (cache), langsung tampilkan
    if (img.complete && img.naturalHeight !== 0) {
      img.classList.add("img-loaded");
    } else {
      img.addEventListener("load", function () {
        img.classList.add("img-loaded");
      });
      img.addEventListener("error", function () {
        img.classList.add("img-error");
      });
    }
  });

  // ── B) SCROLL REVEAL OBSERVER ─────────────────────
  const revealObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        requestAnimationFrame(function () {
          entry.target.classList.add("is-visible");
        });
        revealObserver.unobserve(entry.target);
      });
    },
    {
      root: null,
      rootMargin: "0px 0px -60px 0px",
      threshold: 0.06,
    },
  );

  // Kumpulkan elemen yang perlu di-reveal
  const revealedSet = new WeakSet();

  // Section-title: animasi word-by-word → split per kata
  document
    .querySelectorAll(".section-title:not([data-split-done])")
    .forEach(function (el) {
      const words = el.innerHTML.split(/(\s+)/);
      el.innerHTML = words
        .map(function (word, i) {
          if (word.trim() === "") return word;
          return (
            '<span class="word-mask"><span class="word-inner" style="--word-i:' +
            i +
            '">' +
            word +
            "</span></span>"
          );
        })
        .join("");
      el.setAttribute("data-split-done", "true");
      if (!revealedSet.has(el)) {
        revealedSet.add(el);
        revealObserver.observe(el);
      }
    });

  // Semua elemen dengan [data-reveal] dan class .reveal
  document.querySelectorAll("[data-reveal], .reveal").forEach(function (el) {
    if (revealedSet.has(el)) return;
    revealedSet.add(el);
    revealObserver.observe(el);
  });

  // Elemen tambahan (cards, tiles, section-inner)
  const extraRevealSelectors = [
    ".section-inner",
    ".neo-program-card",
    ".gallery-tile",
    ".doc-card",
    ".timeline-item",
    ".contact-card",
    ".faq-item",
    ".story-card",
    ".mini-stats div",
    ".img-card",
  ];

  document
    .querySelectorAll(extraRevealSelectors.join(","))
    .forEach(function (el) {
      if (revealedSet.has(el)) return;
      revealedSet.add(el);
      el.classList.add("reveal");
      revealObserver.observe(el);
    });

  // ── C) SECTION OVERLAP / PARALLAX OBSERVER ──────────
  // Efek smooth overlapping: section berikutnya "naik" dari bawah
  const sectionObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        const section = entry.target;
        if (entry.isIntersecting) {
          section.classList.add("section-entered");
        }
        // Paralaks berdasarkan posisi relatif viewport
        const rect = entry.boundingClientRect;
        const vp = window.innerHeight;
        // Progress: 0 saat baru masuk bawah, 1 saat sudah di tengah
        const progress = Math.max(0, Math.min(1, 1 - rect.top / vp));
        const parallax = (1 - progress) * 32; // max 32px dari bawah
        section.style.setProperty("--section-slide", parallax + "px");
      });
    },
    {
      root: null,
      rootMargin: "0px 0px 0px 0px",
      threshold: Array.from({ length: 21 }, function (_, i) {
        return i * 0.05;
      }),
    },
  );

  document
    .querySelectorAll(".section, .neo-section, .neo-hero")
    .forEach(function (el) {
      sectionObserver.observe(el);
    });

  // Scrollspy untuk nav-link aktif
  const navSections = document.querySelectorAll("section[id]");
  const allNavLinks = document.querySelectorAll(".nav-link[href^='#']");
  const navPill = document.getElementById("nav-pill");

  const scrollspyObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        allNavLinks.forEach(function (link) {
          const isActive = link.getAttribute("href") === "#" + id;
          link.classList.toggle("active", isActive);

          // Animasikan nav-pill
          if (isActive && navPill && window.innerWidth > 768) {
            const rect = link.getBoundingClientRect();
            const parentRect = link.closest("ul").getBoundingClientRect();
            navPill.style.width = rect.width + "px";
            navPill.style.transform =
              "translateX(" + (rect.left - parentRect.left) + "px)";
            navPill.classList.add("is-active");
          }
        });
      });
    },
    {
      root: null,
      rootMargin: "-40% 0px -40% 0px",
      threshold: 0,
    },
  );

  navSections.forEach(function (section) {
    scrollspyObserver.observe(section);
  });

  /* =========================================
     6. FOOTER BATIK ANIMATION
     ========================================= */
  const footerBatik = document.querySelector(".footer-batik");
  if (footerBatik) {
    const polygons = footerBatik.querySelectorAll("polygon");
    polygons.forEach(function (p, i) {
      p.style.setProperty("--i", i);
    });
    const footerObserver = new IntersectionObserver(
      function (entries) {
        if (entries[0].isIntersecting) {
          footerBatik.classList.add("is-animated");
          footerObserver.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    footerObserver.observe(footerBatik);
  }

  /* =========================================
     7. HERO KURSOR CAHAYA
     ========================================= */
  const heroEl = document.querySelector(".hero");
  if (heroEl) {
    heroEl.addEventListener("mousemove", function (e) {
      const rect = heroEl.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      heroEl.style.setProperty("--cursor-x", x + "%");
      heroEl.style.setProperty("--cursor-y", y + "%");
    });
  }

  /* =========================================
     8. TILT 3D CARDS (program-card & gallery-tile)
     ========================================= */
  function setupTiltCard(selector) {
    document.querySelectorAll(selector).forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.setProperty("--mx", (x + 0.5) * 100 + "%");
        card.style.setProperty("--my", (y + 0.5) * 100 + "%");
        card.classList.add("is-tilting");
        card.style.transform =
          "perspective(1000px) rotateY(" +
          (x * 12).toFixed(1) +
          "deg) rotateX(" +
          (-y * 8).toFixed(1) +
          "deg) translateZ(6px)";
      });
      card.addEventListener("mouseleave", function () {
        card.classList.remove("is-tilting");
        card.style.transform = "";
      });
    });
  }
  setupTiltCard(".program-card");
  setupTiltCard(".gallery-tile");

  /* =========================================
     9. DROPDOWN MENU "STRUKTUR"
     ========================================= */
  const strukturCtaBtn = document.getElementById("struktur-cta-btn");

  const dataDivisi = {
    ketua: {
      gambar: "png/ketua.jpeg",
      anggota: [
        {
          peran: "Ketua",
          nama: "Fathur Rahman An Naufal",
          foto: "png/keanggotaan/fatur.jpeg",
          ig: "https://www.instagram.com/fathurannaufal_?igsh=cmg5amlsaHh1aXo3",
        },
      ],
    },
    sekretaris: {
      gambar: "png/sekretaris.jpeg",
      anggota: [
        {
          peran: "Sekretaris 1",
          nama: "Muhammad Hayqal Bani Hakim Tanjung",
          foto: "png/keanggotaan/qal.jpeg",
          ig: "https://www.instagram.com/qarlbanihakim?igsh=OG05bmEyczZ4ZHNi",
        },
        {
          peran: "Sekretaris 2",
          nama: "Afriza Br. Harahap",
          foto: "png/keanggotaan/riza.jpeg",
          ig: "https://www.instagram.com/rizhrp04?utm_source=qr&igsh=MTV0aGpuZm1oM2x0Zg==",
        },
      ],
    },
    bendahara: {
      gambar: "png/bendahara.jpeg",
      anggota: [
        {
          peran: "Bendahara 1",
          nama: "Avria Damayani",
          foto: "png/keanggotaan/avria.jpeg",
          ig: "https://www.instagram.com/avria.damayani?igsh=NzdraTE3cWFreml4&utm_source=qr",
        },
        {
          peran: "Bendahara 2",
          nama: "Siti Aisyah",
          foto: "png/keanggotaan/siti.jpeg",
          ig: "https://www.instagram.com/sitiaisaa__?igsh=OGJtZ3F6ZXMzczFk",
        },
      ],
    },
    acara: {
      gambar: "png/acara.jpeg",
      anggota: [
        {
          nama: "Dhafa Aulia",
          foto: "png/keanggotaan/dapa.jpeg",
          ig: "https://www.instagram.com/dhfaulia27?igsh=dWRmbWI2cjZldXc5&utm_source=qr",
        },
        {
          nama: "M.Pryansyah",
          foto: "png/keanggotaan/priansyah.jpeg",
          ig: "https://www.instagram.com/mhd_prians?igsh=MWNmOTN2eWVkbDUwNA%3D%3D&utm_source=qr",
        },
        {
          nama: "Fathiyah Hanin Munthe",
          foto: "png/keanggotaan/fatia.jpeg",
          ig: "https://www.instagram.com/haninmunthee_?igsh=MWtvdHJxY25keDd6dw==",
        },
        {
          nama: "Viani Alya Mayshara",
          foto: "png/keanggotaan/alya.jpeg",
          ig: "https://www.instagram.com/viaramaysha?igsh=ZmVrNjd3ZGV6YnN4",
        },
        {
          nama: "Khadifa Maissy Tanjung",
          foto: "png/keanggotaan/dipa.jpeg",
          ig: "https://www.instagram.com/khdffamssy_?igsh=MTFiNHh4ZXVsNmt2aA==",
        },
        {
          nama: "Saripah Aini",
          foto: "png/keanggotaan/sarifa.jpeg",
          ig: "https://www.instagram.com/syaaii16?igsh=MWNtOGd3OWIxa3U3OA==",
        },
      ],
    },
    humas: {
      gambar: "png/humas.jpeg",
      anggota: [
        {
          nama: "M. Harianda Amru",
          foto: "png/keanggotaan/amru.jpeg",
          ig: "https://www.instagram.com/muhammadamru_13?igsh=bzZ5MmRlcGdtdHM3",
        },
        {
          nama: "Uswatun Hasanah",
          foto: "png/keanggotaan/uswa.jpeg",
          ig: "https://www.instagram.com/uswh_hsn?igsh=Y25laTZxZjF5NG5u",
        },
        {
          nama: "Dhabita Syazanatara",
          foto: "png/keanggotaan/dhabita.jpeg",
          ig: "https://www.instagram.com/dhabita_s?igsh=MWRkbGV1MTRkcTdiMg==",
        },
        {
          nama: "Saskiya Nur Yashifa",
          foto: "png/keanggotaan/saskia.jpeg",
          ig: "https://www.instagram.com/saskianryshfa?igsh=MTk3NHJpMHl3c29vNA==",
        },
      ],
    },
    konsumsi: {
      gambar: "png/konsumsi.jpeg",
      anggota: [
        {
          nama: "Emmi Saidatul Khairi",
          foto: "png/keanggotaan/emi.jpeg",
          ig: "https://www.instagram.com/emmikhairi?igsh=aGx2czNmODZvbnY3",
        },
        {
          nama: "Ardelia Maheswari Faustina",
          foto: "png/keanggotaan/adel.jpeg",
          ig: "https://www.instagram.com/rotioverthinker_?igsh=MWozNW4ybnpmbXFjZw==",
        },
        {
          nama: "Marsella Simanjuntak",
          foto: "png/keanggotaan/sella.jpeg",
          ig: "https://www.instagram.com/sella_smnjntk?igsh=eXBxb3Y3MWU2YXY2",
        },
        {
          nama: "Dina Rahmita",
          foto: "png/keanggotaan/dina.jpeg",
          ig: "https://www.instagram.com/youronlymyta?igsh=MTVuOXNkeW5udng1Yw==",
        },
        {
          nama: "Nur Riadoh Rangkuti",
          foto: "png/keanggotaan/nurangkuti.jpeg",
          ig: "https://www.instagram.com/nurriadohrangkuti_?igsh=MTBwbW03Z2R5ejZmbQ==",
        },
        { nama: "Elysa Rahmayani", foto: "png/keanggotaan/elsa.jpeg", ig: "" },
      ],
    },
    pdd: {
      gambar: "png/pdd.jpeg",
      anggota: [
        {
          nama: "Tri Alya Prasita Devi",
          foto: "png/keanggotaan/tembung.jpeg",
          ig: "https://www.instagram.com/alyak.tri?igsh=djU5bTRhYjllbGxn",
        },
        {
          nama: "Shofiiya Naailah",
          foto: "png/keanggotaan/sofi.jpeg",
          ig: "https://www.instagram.com/sofnay_05?igsh=b3NkY3AwcHhrNnBj",
        },
      ],
    },
    perlengkapan: {
      gambar: "png/perlengkapan.jpeg",
      anggota: [
        {
          nama: "Mhd Arifin Hasibuan",
          foto: "png/keanggotaan/arifin.jpeg",
          ig: "https://www.instagram.com/arifinhasibuan18?igsh=MTJrZTQwYXU3Z2g2Zg%3D%3D&utm_source=qr&wa_status_inline=true",
        },
        {
          nama: "M. Fahri Manurung",
          foto: "png/keanggotaan/fahri.jpeg",
          ig: "https://www.instagram.com/koiiii678?igsh=aWt3eTBpdDR2cDV3",
        },
        {
          nama: "Ahmad Huzaifah Tanjung",
          foto: "png/keanggotaan/ahmad.jpeg",
          ig: "https://www.instagram.com/thenjunggg?igsh=a215Z2h0YTF3djJ0",
        },
        {
          nama: "M.Rizky Fazlim Yusran",
          foto: "png/keanggotaan/fazlim.jpeg",
          ig: "https://www.instagram.com/fazliimm_10?igsh=M3BsbTZ5OTE0dnd1 ",
        },
        {
          nama: "Intan Sufikana Zahra",
          foto: "png/keanggotaan/intan.jpeg",
          ig: "https://www.instagram.com/intansufiza_?igsh=M2R0N2t4OWhhdDdi",
        },
        {
          nama: "Aulia Rachmadina",
          foto: "png/keanggotaan/aulia.jpeg",
          ig: "https://www.instagram.com/auliaarhdn?igsh=MTlwazEwa2w3a2J0eg==",
        },
      ],
    },
  };

  const urutanDivisi = [
    "ketua",
    "sekretaris",
    "bendahara",
    "acara",
    "humas",
    "konsumsi",
    "pdd",
    "perlengkapan",
  ];

  const labelDivisi = {
    ketua: "Ketua",
    sekretaris: "Sekretaris",
    bendahara: "Bendahara",
    acara: "Acara",
    humas: "Humas",
    konsumsi: "Konsumsi",
    pdd: "PDD",
    perlengkapan: "Perlengkapan",
  };

  const strukturModal = document.getElementById("struktur-modal");
  const modalCloseBtn = document.getElementById("modal-close-btn");
  const modalPrevBtn = document.getElementById("modal-prev-btn");
  const modalNextBtn = document.getElementById("modal-next-btn");
  const modalDivisiImg = document.getElementById("modal-divisi-img");
  const modalDivisiTitle = document.getElementById("modal-divisi-title");
  const modalDivisiEyebrow = document.getElementById("modal-divisi-eyebrow");
  const modalAnggotaList = document.getElementById("modal-anggota-list");
  const dropdownItems = document.querySelectorAll(".dropdown-item");

  let divisiAktif = null;

  const IKON_KAMERA = `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 8 H7 L8.5 5.5 H15.5 L17 8 H20 C20.55 8 21 8.45 21 9 V18 C21 18.55 20.55 19 20 19 H4 C3.45 19 3 18.55 3 18 V9 C3 8.45 3.45 8 4 8 Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><circle cx="12" cy="13.5" r="3.2" stroke="currentColor" stroke-width="1.6"/></svg>`;
  const IKON_INSTAGRAM = `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="5" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="12" r="3.6" stroke="currentColor" stroke-width="1.6"/><circle cx="17.2" cy="6.8" r="1" fill="currentColor"/></svg>`;

  function renderDaftarAnggota(anggotaList) {
    if (!modalAnggotaList) return;
    modalAnggotaList.innerHTML = "";
    anggotaList.forEach(function (orang, index) {
      const li = document.createElement("li");
      li.style.setProperty("--i", index);

      const fotoDiv = document.createElement("div");
      fotoDiv.className = "anggota-photo";
      if (orang.foto) {
        const img = document.createElement("img");
        img.alt = orang.nama;
        img.loading = "lazy";
        img.classList.add("img-reveal");
        // Set src langsung karena modal sudah dibuka user (on-demand)
        img.src = orang.foto;
        img.addEventListener("load", function () {
          img.classList.add("img-loaded");
        });
        fotoDiv.appendChild(img);
      } else {
        fotoDiv.innerHTML = IKON_KAMERA;
      }
      li.appendChild(fotoDiv);

      const infoDiv = document.createElement("div");
      infoDiv.className = "anggota-info";
      if (orang.peran) {
        const peranSpan = document.createElement("span");
        peranSpan.className = "anggota-role";
        peranSpan.textContent = orang.peran;
        infoDiv.appendChild(peranSpan);
      }
      const namaSpan = document.createElement("span");
      namaSpan.className = "anggota-nama";
      namaSpan.textContent = orang.nama;
      infoDiv.appendChild(namaSpan);
      li.appendChild(infoDiv);

      const igLink = document.createElement("a");
      igLink.className = "anggota-ig";
      igLink.innerHTML = IKON_INSTAGRAM;
      if (orang.ig) {
        igLink.href = orang.ig;
        igLink.target = "_blank";
        igLink.rel = "noopener noreferrer";
        igLink.setAttribute("aria-label", "Instagram " + orang.nama);
      } else {
        igLink.href = "#";
        igLink.setAttribute("aria-disabled", "true");
        igLink.setAttribute("aria-label", "Instagram belum tersedia");
        igLink.addEventListener("click", function (e) {
          e.preventDefault();
        });
      }
      li.appendChild(igLink);
      modalAnggotaList.appendChild(li);
    });

    // Double rAF untuk trigger animasi masuk
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        modalAnggotaList.querySelectorAll("li").forEach(function (li) {
          li.classList.add("is-visible");
        });
      });
    });
  }

  function bukaModalDivisi(kunciDivisi) {
    const divisi = dataDivisi[kunciDivisi];
    if (!divisi || !strukturModal) return;
    divisiAktif = kunciDivisi;
    const namaDivisi = labelDivisi[kunciDivisi] || kunciDivisi;

    if (modalDivisiImg) {
      modalDivisiImg.src = divisi.gambar;
      modalDivisiImg.alt = namaDivisi;
      modalDivisiImg.loading = "lazy";
    }
    if (modalDivisiTitle) modalDivisiTitle.textContent = namaDivisi;
    if (modalDivisiEyebrow) modalDivisiEyebrow.textContent = namaDivisi;
    if (modalAnggotaList) renderDaftarAnggota(divisi.anggota);

    strukturModal.classList.add("active");
    strukturModal.setAttribute("aria-hidden", "false");
  }

  function bukaDivisiRelatif(arah) {
    if (!divisiAktif) return;
    const idx = urutanDivisi.indexOf(divisiAktif);
    if (idx === -1) return;
    const total = urutanDivisi.length;
    bukaModalDivisi(urutanDivisi[(idx + arah + total) % total]);
  }

  function tutupModalDivisi() {
    if (!strukturModal) return;
    strukturModal.classList.remove("active");
    strukturModal.setAttribute("aria-hidden", "true");
    divisiAktif = null;
  }

  dropdownItems.forEach(function (item) {
    item.addEventListener("click", function () {
      const kunciDivisi = item.getAttribute("data-divisi");
      bukaModalDivisi(kunciDivisi);
      if (strukturDropdown) strukturDropdown.classList.remove("open");
      if (strukturToggle) strukturToggle.setAttribute("aria-expanded", "false");
    });
  });

  if (strukturCtaBtn) {
    strukturCtaBtn.addEventListener("click", function () {
      bukaModalDivisi("ketua");
    });
  }

  if (modalPrevBtn)
    modalPrevBtn.addEventListener("click", function () {
      bukaDivisiRelatif(-1);
    });
  if (modalNextBtn)
    modalNextBtn.addEventListener("click", function () {
      bukaDivisiRelatif(1);
    });
  if (modalCloseBtn) modalCloseBtn.addEventListener("click", tutupModalDivisi);

  if (strukturModal) {
    strukturModal.addEventListener("click", function (e) {
      if (e.target === strukturModal) tutupModalDivisi();
    });
  }

  document.addEventListener("keydown", function (e) {
    if (!strukturModal || !strukturModal.classList.contains("active")) return;
    if (e.key === "Escape") tutupModalDivisi();
    else if (e.key === "ArrowLeft") bukaDivisiRelatif(-1);
    else if (e.key === "ArrowRight") bukaDivisiRelatif(1);
  });

  /* =========================================================
     DOKUMENTASI KEGIATAN — FLIP CARD + NAVIGASI TANGGAL
     28 Juli 2026 – 28 Agustus 2026 (32 hari)
     
     Struktur data:
       dataDok[tanggal] = [
         { foto: "url", caption: "teks" },  // foto 1 (depan)
         { foto: "url", caption: "teks" },  // foto 2
         { foto: "url", caption: "teks" },  // foto 3
       ]
     
     Jika foto kosong/null → tampil placeholder.
     Klik kartu → flip ke foto berikutnya (loop 1→2→3→1).
     ========================================================= */
  (function () {
    /* ── 1. GENERATE DAFTAR TANGGAL ── */
    function buatDaftarTanggal(mulai, akhir) {
      const daftar = [];
      const cur = new Date(mulai);
      const end = new Date(akhir);
      while (cur <= end) {
        daftar.push(new Date(cur));
        cur.setDate(cur.getDate() + 1);
      }
      return daftar;
    }

    const daftarTanggal = buatDaftarTanggal("2026-07-28", "2026-08-28");

    /* ── 2. FORMAT TANGGAL ── */
    const HARI_SINGKAT = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
    const BULAN_SINGKAT = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "Mei",
      "Jun",
      "Jul",
      "Agt",
      "Sep",
      "Okt",
      "Nov",
      "Des",
    ];

    function formatTabLabel(d) {
      return {
        hari: HARI_SINGKAT[d.getDay()],
        tanggal: d.getDate() + " " + BULAN_SINGKAT[d.getMonth()],
      };
    }

    function formatTanggalLengkap(d) {
      const namaHari = [
        "Minggu",
        "Senin",
        "Selasa",
        "Rabu",
        "Kamis",
        "Jumat",
        "Sabtu",
      ];
      const namaBulan = [
        "Januari",
        "Februari",
        "Maret",
        "April",
        "Mei",
        "Juni",
        "Juli",
        "Agustus",
        "September",
        "Oktober",
        "November",
        "Desember",
      ];
      return (
        namaHari[d.getDay()] +
        ", " +
        d.getDate() +
        " " +
        namaBulan[d.getMonth()] +
        " " +
        d.getFullYear()
      );
    }

    /* ── 3. DATA FOTO PER TANGGAL ── */
    // Format key: "YYYY-MM-DD"
    function keyTanggal(d) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      return y + "-" + m + "-" + dd;
    }

    // ── ISI DATA FOTO DI SINI ──
    // Hapus null & ganti dengan path foto asli saat tersedia.
    // Contoh: { foto: "png/dok/28-jul-1.jpg", caption: "Tiba di lokasi KKN" }
    const dataDok = {
      "2026-07-28": [
        {
          foto: "png/proker/umum/pelepasan_pamong2.jpg",
          caption: "Pembekalan & pelepasan peserta KKN",
        },
        {
          foto: "png/proker/umum/pelepasanpamong.jpg",
          caption: "Pelepasan oleh Desa Pamong",
        },
        {
          foto: "png/proker/umum/pelepasan_pamong3.jpg",
          caption: "Pesan Kesan dari PamongUntuk Mahasiswa KKN",
        },
      ],
      // Tanggal lain akan otomatis tampil placeholder kosong
      "2026-07-29": [
        {
          foto: "png/proker/umum/sambutan_lurah.jpg",
          caption: "Sambutan hangat lurah",
        },
        {
          foto: "png/proker/umum/kantorlurahcwk.jpg",
          caption: "Kekompakan di Kantor Lurah",
        },
        {
          foto: "png/proker/umum/lurah2.jpg",
          caption: "Kunjungan ke Kantor Lurah",
        },
      ],
      "2026-07-30": [
        {
          foto: "png/proker/umum/sd.jpeg",
          caption: "Sambutan Hangat  dari Siswa Sekolah Dasar",
        },
        {
          foto: "png/proker/umum/apelsdimpres.jpg",
          caption:
            "Ikut serta dala m Apel Pagi Bersama Tenaga Pendidik Sd Wilayah KKN",
        },
        {
          foto: null,
          caption: "",
        },
      ],
      "2026-07-31": [
        {
          foto: "png/proker/umum/sd_impres.jpg",
          caption: "Apel Pagi Bersama Tenaga Pendidik Sd Wilayah KKN",
        },
        {
          foto: null,
          caption: "kosong",
        },
        {
          foto: null,
          caption: "belum diisi",
        },
      ],
      "2026-08-01": [
        {
          foto: null,
          caption: "kosong",
        },
        {
          foto: null,
          caption: "kosong",
        },
        {
          foto: null,
          caption: "belum diisi",
        },
      ],
      "2026-08-02": [
        {
          foto: "png/proker/islami/senam.jpg",
          caption: "Senam bersama warga desa",
        },
        {
          foto: null,
          caption: "kosong",
        },
        {
          foto: null,
          caption: "belum diisi",
        },
      ],
      "2026-08-03": [
        {
          foto: "png/proker/islami/smp.jpeg",
          caption: "Permohonan ikut serta dalam kegiatan SMP",
        },
        {
          foto: "png/proker/islami/smp2.jpg",
          caption: "ikut serta dalam kegiatan edukasi SMP",
        },
        {
          foto: "png/proker/islami/smp_carauseljpg",
          caption: "Silaturahmi dengan Kepala sekolah SMP dan seluruh staf SMP",
        },
      ],
      "2026-08-04": [
        {
          foto: "png /proke/umum/uwak_vespa.jpg",
          caption: "Silaturahmi dengan warga desa",
        },
        {
          foto: null,
          caption: "kosong",
        },
        {
          foto: null,
          caption: "belum diisi",
        },
      ],
      "2026-08-05": [
        {
          foto: "/png/proker/umum/perpisahan_sd.jpg",
          caption: "Perpisahan dengan Staf Sd",
        },
        {
          foto: "png/proker/umum/tong_sampah.jpg",
          caption: "Pembuatan Tong Sampah dari BarangBekas",
        },
        {
          foto: null,
          caption: "belum diisi",
        },
      ],
      "2026-08-06": [
        {
          foto: null,
          caption: "kosong",
        },
        {
          foto: null,
          caption: "kosong",
        },
        {
          foto: null,
          caption: "belum diisi",
        },
      ],
      "2026-08-07": [
        {
          foto: null,
          caption: "kosong",
        },
        {
          foto: null,
          caption: "kosong",
        },
        {
          foto: null,
          caption: "belum diisi",
        },
      ],
      "2026-08-08": [
        {
          foto: null,
          caption: "kosong",
        },
        {
          foto: null,
          caption: "kosong",
        },
        {
          foto: null,
          caption: "belum diisi",
        },
      ],
      "2026-08-09": [
        {
          foto: null,
          caption: "kosong",
        },
        {
          foto: null,
          caption: "kosong",
        },
        {
          foto: null,
          caption: "belum diisi",
        },
      ],
      "2026-08-10": [
        {
          foto: "png/proker/islami/kua3.jpg",
          caption: "Silaturahmi ke Kantor KUA dengan Seluruh staf KUA",
        },
        {
          foto: "png/proker/islami/kua2.jpg",
          caption: "Diskusi Singkat tentang Hakikat KKn bersama staf KUA",
        },
        {
          foto: "png/proker/islami/sosialisasi_kua.jpg",
          caption: "Berbincang dengan staf KUA tentang Hakikat KUA",
        },
      ],
      "2026-08-11": [
        {
          foto: null,
          caption: "kosong",
        },
        {
          foto: null,
          caption: "kosong",
        },
        {
          foto: null,
          caption: "belum diisi",
        },
      ],
      "2026-08-12": [
        {
          foto: "png/proker/umum/posyandu1.jpg",
          caption:
            "Ikut Serta dalam program stunting dari pihak Posyandu Kelurahan",
        },
        {
          foto: "png/proker/umum/posyandu2.jpg",
          caption:
            "Penyuluhan Kesehatan Ibu dan Anak oleh Tim Posyandu dan Tim KKN",
        },
        {
          foto: "png/proker/umum/posyandu3.jpg",
          caption:
            "ikut serta dalam pelaksanaan Posyandu dengan aparatur negara wilayah KKN",
        },
      ],
      "2026-08-13": [
        {
          foto: "png/proker/islami/pesantren1.jpg",
          caption:
            "Silaturahmi ke Pondok Pesantren dengan Seluruh Staf Pengajar",
        },
        {
          foto: "png/proker/islami/pesantren2.jpg",
          caption: "ikut Serta dalam program Pesatren dengan mahasiswa KKN",
        },
        {
          foto: "png/proker/islami/pesantren3.jpg",
          caption:
            "sosialisasi Mahsiswa KKN dengan Siswa Pesatren tingkat SMA tentang Beasiswa dan Universitas",
        },
      ],
      "2026-08-14": [
        {
          foto: null,
          caption: "kosong",
        },
        {
          foto: null,
          caption: "kosong",
        },
        {
          foto: null,
          caption: "belum diisi",
        },
      ],
      "2026-08-15": [
        {
          foto: null,
          caption: "kosong",
        },
        {
          foto: "png/proker/umum/partisipasi_pemupukan.jpg",
          caption:
            "ikut serta dalam event pemupukan tanaman bersama warga desa",
        },
        {
          foto: null,
          caption: "belum diisi",
        },
      ],
      "2026-08-16": [
        {
          foto: null,
          caption: "kosong",
        },
        {
          foto: null,
          caption: "kosong",
        },
        {
          foto: null,
          caption: "belum diisi",
        },
      ],
      "2026-08-17": [
        {
          foto: "png/proker/umum/17an.jpg",
          caption:
            "Ikut serta dalam kegiatan  17an bersama yang diselenggarakan Desa",
        },
        {
          foto: "png/proker/umum/17an2.jpg",
          caption: "Pawai dalam kegiatan 17an bersama warga desa",
        },
        {
          foto: null,
          caption: "belum diisi",
        },
      ],
      "2026-08-18": [
        {
          foto: null,
          caption: "kosong",
        },
        {
          foto: null,
          caption: "kosong",
        },
        {
          foto: null,
          caption: "belum diisi",
        },
      ],
      "2026-08-19": [
        {
          foto: null,
          caption: "kosong",
        },
        {
          foto: null,
          caption: "kosong",
        },
        {
          foto: null,
          caption: "belum diisi",
        },
      ],
      "2026-08-20": [
        {
          foto: null,
          caption: "kosong",
        },
        {
          foto: null,
          caption: "kosong",
        },
        {
          foto: null,
          caption: "belum diisi",
        },
      ],
      "2026-08-21": [
        {
          foto: null,
          caption: "kosong",
        },
        {
          foto: null,
          caption: "kosong",
        },
        {
          foto: null,
          caption: "belum diisi",
        },
      ],
      "2026-08-22": [
        {
          foto: null,
          caption: "kosong",
        },
        {
          foto: null,
          caption: "kosong",
        },
        {
          foto: null,
          caption: "belum diisi",
        },
      ],
      "2026-08-23": [
        {
          foto: null,
          caption: "kosong",
        },
        {
          foto: null,
          caption: "kosong",
        },
        {
          foto: null,
          caption: "belum diisi",
        },
      ],
      "2026-08-24": [
        {
          foto: "png/proker/islami/fasih.jpg",
          caption:
            "Melaksanakan Festival anak Sholeholeh Mahasiswa KKN di Desa",
        },
        {
          foto: "png/proker/islami/fasih2.jpg",
          caption:
            "Pelaksaan Loma dalam kegiatan Festival anak Sholeh oleh Mahasiswa KKN di Desa",
        },
        {
          foto: "png/proker/islami/fasih3.jpg",
          caption:
            "Pemberian Hadiah kepada pemenang lomba Festival anak Sholeh oleh Mahasiswa KKN di Desa",
        },
      ],
      "2026-08-25": [
        {
          foto: "png/proker/islami/maulid.jpg",
          caption: "Pelaksaan Maulid Nabi Muhammad SAW di Desa",
        },
        {
          foto: "png/proker/islami/maulidDan_perpisahan.jpg",
          caption:
            "Pelaksaan Maulid Nabi Muhammad SAW dan Perpisahan dengan Warga Desa",
        },
        {
          foto: null,
          caption: "belum diisi",
        },
      ],
      "2026-08-26": [
        {
          foto: null,
          caption: "kosong",
        },
        {
          foto: null,
          caption: "kosong",
        },
        {
          foto: null,
          caption: "belum diisi",
        },
      ],
      "2026-08-27": [
        {
          foto: null,
          caption: "kosong",
        },
        {
          foto: null,
          caption: "kosong",
        },
        {
          foto: null,
          caption: "belum diisi",
        },
      ],
      "2026-08-28": [
        {
          foto: null,
          caption: "kosong",
        },
        {
          foto: null,
          caption: "kosong",
        },
        {
          foto: null,
          caption: "belum diisi",
        },
      ],
    };
    function getFoto(d) {
      const key = keyTanggal(d);
      if (dataDok[key]) return dataDok[key];
      // Default: 3 slot kosong
      return [
        {
          foto: null,
          caption: "foto kegitan #1",
        },
        { foto: null, caption: "Foto kegiatan #2" },
        { foto: null, caption: "Foto kegiatan #3" },
      ];
    }

    /* ── 4. ELEMEN DOM ── */
    const tabScroll = document.getElementById("dok-tab-scroll");
    const dokGrid = document.getElementById("dok-grid");
    const indikator = document.getElementById("dok-indicator");
    const prevBtn = document.getElementById("dok-prev");
    const nextBtn = document.getElementById("dok-next");
    if (!tabScroll || !dokGrid) return;

    /* ── 5. ICON SVG ── */
    const ICON_KAMERA = `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
      <circle cx="12" cy="13" r="4" stroke="currentColor" stroke-width="1.6"/>
    </svg>`;

    const ICON_FLIP = `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M1 4v6h6M23 20v-6h-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M20.49 9A9 9 0 005.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 013.51 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;

    /* ── 6. BUILD TABS ── */
    let tabAktif = 0;
    const tabBtns = [];

    daftarTanggal.forEach(function (d, i) {
      const label = formatTabLabel(d);
      const btn = document.createElement("button");
      btn.className = "dok-tab-btn" + (i === 0 ? " is-active" : "");
      btn.setAttribute("role", "tab");
      btn.setAttribute("aria-selected", i === 0 ? "true" : "false");
      btn.setAttribute("aria-controls", "dok-grid");
      btn.setAttribute("type", "button");
      btn.innerHTML =
        '<span class="tab-day">' +
        label.hari +
        "</span>" +
        '<span class="tab-date">' +
        label.tanggal +
        "</span>";

      btn.addEventListener("click", function () {
        pindahTab(i);
      });

      tabScroll.appendChild(btn);
      tabBtns.push(btn);
    });

    /* ── 7. RENDER KARTU ── */
    function buatFace(nomor, dataFoto, tanggalStr, indexHari) {
      const face = document.createElement("div");
      face.className = "dok-face dok-face-" + nomor;

      // Badge nomor
      const badge = document.createElement("span");
      badge.className = "dok-face-badge";
      badge.textContent = "Foto " + nomor;
      face.appendChild(badge);

      // Foto atau placeholder
      if (dataFoto && dataFoto.foto) {
        const img = document.createElement("img");
        img.className = "dok-face-img img-reveal";
        img.src = dataFoto.foto;
        img.alt = dataFoto.caption || "Dokumentasi hari ke-" + (indexHari + 1);
        img.loading = "lazy";
        img.addEventListener("load", function () {
          img.classList.add("img-loaded");
        });
        face.appendChild(img);
      } else {
        const ph = document.createElement("div");
        ph.className = "dok-placeholder";
        ph.innerHTML =
          ICON_KAMERA +
          '<span class="dok-placeholder-label">Hari ke-' +
          (indexHari + 1) +
          "<br>" +
          tanggalStr +
          "</span>";
        face.appendChild(ph);
      }

      // Caption
      const caption = document.createElement("div");
      caption.className = "dok-face-caption";
      const capLabel = document.createElement("span");
      capLabel.className = "cap-label";
      capLabel.textContent = tanggalStr;
      caption.appendChild(capLabel);
      const capText = document.createElement("span");
      capText.textContent =
        dataFoto && dataFoto.caption ? dataFoto.caption : "—";
      caption.appendChild(capText);

      // Hint flip di semua face — pengguna selalu tahu bisa klik lagi
      const hint = document.createElement("div");
      hint.className = "dok-flip-hint";
      hint.innerHTML =
        ICON_FLIP +
        (nomor === 3
          ? "Klik untuk kembali ke foto pertama"
          : "Klik untuk foto berikutnya");
      caption.appendChild(hint);

      face.appendChild(caption);
      return face;
    }

    function renderGrid(indexTanggal) {
      const d = daftarTanggal[indexTanggal];
      const fotos = getFoto(d);
      const tanggalStr = formatTanggalLengkap(d);

      dokGrid.innerHTML = "";

      // 1 CARD per tanggal.
      // Foto 1 tampil di depan. Klik → Foto 2. Klik lagi → Foto 3. Klik lagi → kembali Foto 1.
      const card = document.createElement("div");
      card.className = "dok-card";
      card.setAttribute("role", "button");
      card.setAttribute("tabindex", "0");
      card.setAttribute(
        "aria-label",
        tanggalStr + " · Klik untuk foto berikutnya",
      );

      const inner = document.createElement("div");
      inner.className = "dok-card-inner";

      const face1 = buatFace(1, fotos[0], tanggalStr, indexTanggal);
      const face2 = buatFace(2, fotos[1], tanggalStr, indexTanggal);
      const face3 = buatFace(3, fotos[2], tanggalStr, indexTanggal);
      inner.appendChild(face1);
      inner.appendChild(face2);
      inner.appendChild(face3);

      card.appendChild(inner);

      let current = 0;
      const faces = [face1, face2, face3];

      function doFlip() {
        var leaving = faces[current];
        current = (current + 1) % 3;
        var entering = faces[current];

        leaving.classList.remove("is-active");
        leaving.classList.add("is-leaving");
        var onEnd = function () {
          leaving.classList.remove("is-leaving");
          leaving.removeEventListener("transitionend", onEnd);
        };
        leaving.addEventListener("transitionend", onEnd);
        entering.classList.add("is-active");
      }

      card.addEventListener("click", doFlip);
      card.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          doFlip();
        }
      });

      dokGrid.appendChild(card);

      // Face pertama langsung aktif — tanpa delay agar tidak ada blank flash
      face1.classList.add("is-active");

      // Reveal animation
      card.style.setProperty("--reveal-i", 0);
      card.classList.add("reveal");
      setTimeout(function () {
        card.classList.add("is-visible");
      }, 80);

      // Update indikator titik
      renderIndikator(indexTanggal);
    }

    /* ── 8. INDIKATOR TITIK ── */
    function renderIndikator(aktif) {
      if (!indikator) return;
      indikator.innerHTML = "";
      // Tampilkan max 7 titik (current ± 3)
      const total = daftarTanggal.length;
      const start = Math.max(0, Math.min(aktif - 3, total - 7));
      const end = Math.min(total - 1, start + 6);

      for (let i = start; i <= end; i++) {
        const dot = document.createElement("button");
        dot.className = "dok-dot" + (i === aktif ? " is-active" : "");
        dot.setAttribute("type", "button");
        dot.setAttribute(
          "aria-label",
          "Ke tanggal " + formatTabLabel(daftarTanggal[i]).tanggal,
        );
        (function (idx) {
          dot.addEventListener("click", function () {
            pindahTab(idx);
          });
        })(i);
        indikator.appendChild(dot);
      }
    }

    /* ── 9. PINDAH TAB ── */
    function pindahTab(idx) {
      if (idx === tabAktif) return;

      // Update tab button styles
      tabBtns[tabAktif].classList.remove("is-active");
      tabBtns[tabAktif].setAttribute("aria-selected", "false");
      tabAktif = idx;
      tabBtns[tabAktif].classList.add("is-active");
      tabBtns[tabAktif].setAttribute("aria-selected", "true");

      // Scroll tab ke posisi aktif
      tabBtns[tabAktif].scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });

      // Update panah
      if (prevBtn) prevBtn.classList.toggle("is-disabled", tabAktif === 0);
      if (nextBtn)
        nextBtn.classList.toggle(
          "is-disabled",
          tabAktif === daftarTanggal.length - 1,
        );

      // Render grid dengan animasi fade
      dokGrid.style.opacity = "0";
      dokGrid.style.transform = "translateY(10px)";
      dokGrid.style.transition = "opacity 0.2s ease, transform 0.2s ease";
      setTimeout(function () {
        renderGrid(tabAktif);
        dokGrid.style.opacity = "1";
        dokGrid.style.transform = "translateY(0)";
      }, 200);
    }

    /* ── 10. PANAH NAVIGASI ── */
    if (prevBtn) {
      prevBtn.classList.add("is-disabled");
      prevBtn.addEventListener("click", function () {
        if (tabAktif > 0) pindahTab(tabAktif - 1);
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        if (tabAktif < daftarTanggal.length - 1) pindahTab(tabAktif + 1);
      });
    }

    /* ── 11. SCROLL TAB DENGAN MOUSE DRAG ── */
    let isTabDragging = false;
    let tabDragStart = 0;
    let tabScrollStart = 0;

    tabScroll.addEventListener("mousedown", function (e) {
      isTabDragging = true;
      tabDragStart = e.clientX;
      tabScrollStart = tabScroll.scrollLeft;
      tabScroll.style.cursor = "grabbing";
    });
    window.addEventListener("mousemove", function (e) {
      if (!isTabDragging) return;
      tabScroll.scrollLeft = tabScrollStart - (e.clientX - tabDragStart);
    });
    window.addEventListener("mouseup", function () {
      isTabDragging = false;
      tabScroll.style.cursor = "";
    });

    /* ── 12. INITIAL RENDER ── */
    renderGrid(0);
  })(); // end IIFE dokumentasi
});
