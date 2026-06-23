document.addEventListener("DOMContentLoaded", function () {
  /* =========================================
     0. MODE GELAP (DARK MODE)
     Disimpan di localStorage supaya pilihan
     pengguna tetap diingat saat kembali ke situs.
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
    // Update aria-label tombol agar pembaca layar tahu kondisi aktif
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
    } catch (e) {
      // localStorage mungkin diblokir (mode privat dsb) — abaikan saja
    }
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
      } catch (e) {
        // abaikan jika localStorage tidak tersedia
      }
    });
  }

  /* =========================================
     1. MESIN SCROLL TERPADU
     (header auto-hide, parallax hero, progress
     bar, tombol kembali ke atas — digabung jadi
     satu listener ber-rAF supaya ringan)
     ========================================= */
  const siteHeader = document.getElementById("site-header");
  const heroSection = document.getElementById("beranda");
  const heroContour = document.querySelector(".hero-contour");
  const heroContent = document.querySelector(".hero-content");
  const scrollProgressEl = document.getElementById("scroll-progress");
  const backToTopBtn = document.getElementById("back-to-top");

  let lastScrollY = window.scrollY;
  let scrollFrameQueued = false;
  const HIDE_THRESHOLD = 80; // mulai auto-hide setelah scroll sejauh ini

  function updateHeaderState(currentScrollY) {
    if (!siteHeader) return;

    // Background solid setelah sedikit scroll
    if (currentScrollY > 24) {
      siteHeader.classList.add("is-scrolled");
    } else {
      siteHeader.classList.remove("is-scrolled");
    }

    // Auto-hide: sembunyikan hanya jika scroll ke bawah cukup signifikan,
    // tampilkan lagi begitu user scroll ke atas (selisih kecil diabaikan
    // supaya header tidak "kedip" hilang-muncul tiap beberapa pixel)
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
    const heroHeight = heroSection.offsetHeight || 1;
    const progress = Math.min(currentScrollY / heroHeight, 1);

    // Garis kontur bergerak lebih lambat dari scroll (efek kedalaman)
    if (heroContour) {
      heroContour.style.setProperty(
        "--parallax-offset",
        (currentScrollY * 0.18).toFixed(1) + "px",
      );
    }

    // Catatan: efek fade/transform inline pada .hero-content sudah
    // DIHAPUS dari sini. Sebelumnya, style ini menimpa langsung
    // opacity & transform yang sama dipakai oleh elemen [data-reveal]
    // / .reveal di dalam hero (judul, deskripsi, tombol) — sehingga
    // begitu kamu scroll naik/turun melewati hero, konten yang sudah
    // "is-visible" jadi terlihat redup/hilang lagi karena inline
    // style ini menang dari CSS transition reveal. Kalau nanti mau
    // efek fade hero lagi, terapkan di elemen LAIN (bukan
    // .hero-content), misalnya wrapper terpisah yang tidak dipakai
    // sistem reveal.
  }

  const ringProgressEl = document.querySelector(".ring-progress");
  const RING_CIRCUMFERENCE = 131.95; // 2 * PI * r(21), sudah cocok dengan stroke-dasharray di CSS

  function updateBackToTop(currentScrollY) {
    if (!backToTopBtn) return;
    if (currentScrollY > window.innerHeight * 0.6) {
      backToTopBtn.classList.add("is-visible");
    } else {
      backToTopBtn.classList.remove("is-visible");
    }

    // Isi cincin emas di sekeliling tombol sesuai persentase scroll halaman
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

  // Jalankan sekali di awal supaya state langsung sesuai posisi scroll saat ini
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
    // Fallback untuk browser tanpa dukungan :has(): pastikan header (yang
    // membungkus drawer .main-nav) naik di atas .nav-backdrop saat drawer aktif,
    // supaya drawer tidak ikut "ketutup" blur dan tetap bisa diklik.
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
    if (openDropdown) {
      openDropdown.classList.remove("open");
      const toggleBtn = openDropdown.querySelector(".dropdown-toggle");
      if (toggleBtn) toggleBtn.setAttribute("aria-expanded", "false");
    }
  }

  if (menuToggle && navMenu) {
    menuToggle.addEventListener("click", function () {
      const isOpen = navMenu.classList.contains("active");
      if (isOpen) {
        closeMobileNav();
      } else {
        openMobileNav();
      }
    });

    if (navClose) {
      navClose.addEventListener("click", closeMobileNav);
    }
    if (navBackdrop) {
      navBackdrop.addEventListener("click", closeMobileNav);
    }
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMobileNav();
    });

    navLinks.forEach(function (link) {
      link.addEventListener("click", function () {
        closeMobileNav();
      });
    });
  }

  /* =========================================
     2B. NAV-PILL & SCROLLSPY
     (pil emas meluncur ke tautan yang aktif
     sesuai posisi scroll halaman, plus efek
     hover mengikuti kursor)
     ========================================= */
  const navPill = document.getElementById("nav-pill");
  const navListEl = document.querySelector(".main-nav > ul");
  const navLinkEls = document.querySelectorAll(".main-nav .nav-link");
  const spySections = document.querySelectorAll("main > section[id]");

  function movePillTo(targetEl) {
    if (!navPill || !navListEl || !targetEl) return;
    const listRect = navListEl.getBoundingClientRect();
    const targetRect = targetEl.getBoundingClientRect();
    navPill.style.width = targetRect.width + "px";
    navPill.style.transform =
      "translateX(" + (targetRect.left - listRect.left) + "px)";
    navPill.classList.add("is-active");
  }

  function hidePill() {
    if (!navPill) return;
    navPill.classList.remove("is-active");
  }

  // Hover: pil mengikuti tautan yang disentuh kursor
  navLinkEls.forEach(function (link) {
    link.addEventListener("mouseenter", function () {
      movePillTo(link);
    });
  });
  if (navListEl) {
    navListEl.addEventListener("mouseleave", function () {
      const activeLink = document.querySelector(".nav-link.active");
      if (activeLink && window.innerWidth > 768) {
        movePillTo(activeLink);
      } else {
        hidePill();
      }
    });
  }

  // Scrollspy: tandai tautan aktif sesuai section yang sedang terlihat
  function updateActiveNavLink() {
    if (!spySections.length) return;

    let currentId = spySections[0].id;
    const scrollPos = window.scrollY + window.innerHeight * 0.35;

    spySections.forEach(function (section) {
      if (section.offsetTop <= scrollPos) {
        currentId = section.id;
      }
    });

    navLinkEls.forEach(function (link) {
      const isMatch = link.getAttribute("href") === "#" + currentId;
      link.classList.toggle("active", isMatch);
      if (isMatch && window.innerWidth > 768) {
        movePillTo(link);
      }
    });
  }

  window.addEventListener("scroll", updateActiveNavLink, { passive: true });
  window.addEventListener("resize", updateActiveNavLink, { passive: true });
  updateActiveNavLink();

  /* =========================================
     3B. EFEK TILT 3D + KILAU KURSOR
     (program-card & gallery-tile sudah punya
     CSS untuk --mx/--my dan class is-tilting,
     di sini kita hidupkan lewat mousemove)
     ========================================= */
  const tiltTargets = document.querySelectorAll(".program-card, .gallery-tile");
  const MAX_TILT = 8; // derajat kemiringan maksimum

  tiltTargets.forEach(function (card) {
    card.addEventListener("mouseenter", function () {
      card.classList.add("is-tilting");
    });

    card.addEventListener("mousemove", function (event) {
      const rect = card.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width; // 0..1
      const py = (event.clientY - rect.top) / rect.height; // 0..1

      // Posisi kilau cahaya mengikuti kursor
      card.style.setProperty("--mx", (px * 100).toFixed(1) + "%");
      card.style.setProperty("--my", (py * 100).toFixed(1) + "%");

      // Kemiringan 3D ringan menuju arah kursor
      const tiltX = (py - 0.5) * -MAX_TILT;
      const tiltY = (px - 0.5) * MAX_TILT;
      card.style.transform =
        "perspective(1400px) rotateX(" +
        tiltX.toFixed(2) +
        "deg) rotateY(" +
        tiltY.toFixed(2) +
        "deg) translateY(-4px)";
    });

    card.addEventListener("mouseleave", function () {
      card.classList.remove("is-tilting");
      card.style.transform = "";
    });
  });

  /* =========================================
     3C. MAGNETIC BUTTON
     (tombol .btn-solid & .btn-ghost sedikit
     "tertarik" mengikuti kursor saat di-hover)
     ========================================= */
  const magneticButtons = document.querySelectorAll(".btn");
  const MAGNET_STRENGTH = 0.25;

  magneticButtons.forEach(function (btn) {
    btn.addEventListener("mousemove", function (event) {
      const rect = btn.getBoundingClientRect();
      const offsetX = event.clientX - (rect.left + rect.width / 2);
      const offsetY = event.clientY - (rect.top + rect.height / 2);
      btn.style.transform =
        "translate(" +
        (offsetX * MAGNET_STRENGTH).toFixed(1) +
        "px, " +
        (offsetY * MAGNET_STRENGTH - 3).toFixed(1) +
        "px)";
    });
    btn.addEventListener("mouseleave", function () {
      btn.style.transform = "";
    });
  });

  /* =========================================
     3D. AURORA GLOW MENGIKUTI KURSOR DI HERO
     ========================================= */
  const heroAuroraTarget = document.getElementById("beranda");
  if (heroAuroraTarget) {
    heroAuroraTarget.addEventListener("mousemove", function (event) {
      const rect = heroAuroraTarget.getBoundingClientRect();
      const px = ((event.clientX - rect.left) / rect.width) * 100;
      const py = ((event.clientY - rect.top) / rect.height) * 100;
      heroAuroraTarget.style.setProperty("--cursor-x", px.toFixed(1) + "%");
      heroAuroraTarget.style.setProperty("--cursor-y", py.toFixed(1) + "%");
    });
  }

  /* =========================================
     3E. SCROLL REVEAL (RINGAN, SATU OBSERVER)
     ========================================= */

  // --- Pecah teks .section-title jadi per-kata dibungkus
  //     word-mask/word-inner, supaya CSS bisa menganimasikan
  //     tiap kata "naik" satu-satu dari balik mask saat tampil.
  const sectionTitles = document.querySelectorAll(".section-title");
  sectionTitles.forEach(function (title) {
    // Lindungi dari proses ganda jika fungsi ini terpanggil lebih dari sekali
    if (title.dataset.split === "true") return;
    title.dataset.split = "true";

    const teksAsli = title.textContent;
    const kataKata = teksAsli.trim().split(/\s+/);

    title.innerHTML = "";
    kataKata.forEach(function (kata, index) {
      const mask = document.createElement("span");
      mask.className = "word-mask";

      const inner = document.createElement("span");
      inner.className = "word-inner";
      inner.style.setProperty("--word-i", index);
      inner.textContent = kata;

      mask.appendChild(inner);
      title.appendChild(mask);

      // Spasi antar kata (di luar mask supaya tidak ikut "terangkat")
      if (index < kataKata.length - 1) {
        title.appendChild(document.createTextNode(" "));
      }
    });
  });

  // --- Beri index stagger otomatis (var(--reveal-i)) untuk tiap
  //     grup kartu/galeri, supaya kemunculannya satu-satu berurutan
  //     bukan langsung serentak bersamaan.
  function pasangStaggerIndex(groupSelector, itemSelector) {
    document.querySelectorAll(groupSelector).forEach(function (group) {
      const items = group.querySelectorAll(itemSelector);
      items.forEach(function (item, index) {
        item.style.setProperty("--reveal-i", index);
      });
    });
  }
  pasangStaggerIndex(".card-grid", ".program-card");
  pasangStaggerIndex(".gallery-grid", ".gallery-tile");

  // --- Satu IntersectionObserver dipakai bersama untuk semua target:
  //     section-inner, kartu, galeri, .reveal polos, dan [data-reveal]
  //     (termasuk varian left/right/zoom/blur/flip/pop) serta judul
  //     section yang baru saja dipecah jadi word-mask di atas.
  const revealTargets = document.querySelectorAll(
    ".section-inner, .program-card, .gallery-tile, .reveal, [data-reveal], .section-title",
  );

  const revealObserver = new IntersectionObserver(
    function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { root: null, rootMargin: "0px 0px -60px 0px", threshold: 0.12 },
  );

  revealTargets.forEach(function (el) {
    // .section-title sengaja TIDAK diberi class umum "reveal" —
    // animasinya sendiri (word-mask) sudah diatur lewat .is-visible
    // langsung di CSS [.section-title.is-visible .word-inner].
    if (!el.classList.contains("section-title")) {
      el.classList.add("reveal");
    }
    revealObserver.observe(el);
  });

  /* =========================================
     5. DROPDOWN MENU "STRUKTUR"
     ========================================= */
  const strukturDropdown = document.querySelector(".has-dropdown");
  const strukturToggle = document.getElementById("struktur-toggle");
  const strukturMenu = document.getElementById("struktur-menu");

  if (strukturDropdown && strukturToggle && strukturMenu) {
    strukturToggle.addEventListener("click", function (event) {
      event.stopPropagation();
      const isOpen = strukturDropdown.classList.toggle("open");
      strukturToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    document.addEventListener("click", function (event) {
      if (!strukturDropdown.contains(event.target)) {
        strukturDropdown.classList.remove("open");
        strukturToggle.setAttribute("aria-expanded", "false");
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        strukturDropdown.classList.remove("open");
        strukturToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* =========================================
     6. MODAL STRUKTUR DIVISI
     ========================================= */
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

  // Urutan kunci divisi, dipakai untuk navigasi sebelumnya/berikutnya di modal
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

  const strukturModal = document.getElementById("struktur-modal");
  const modalCloseBtn = document.getElementById("modal-close-btn");
  const modalPrevBtn = document.getElementById("modal-prev-btn");
  const modalNextBtn = document.getElementById("modal-next-btn");
  const modalDivisiImg = document.getElementById("modal-divisi-img");
  const modalDivisiTitle = document.getElementById("modal-divisi-title");
  const modalDivisiEyebrow = document.getElementById("modal-divisi-eyebrow");
  const modalAnggotaList = document.getElementById("modal-anggota-list");
  const dropdownItems = document.querySelectorAll(".dropdown-item");
  const strukturCtaBtn = document.getElementById("struktur-cta-btn");

  let divisiAktif = null; // kunci divisi yang sedang ditampilkan di modal

  // Ikon kamera default, dipakai sebagai placeholder selama foto asli belum diisi
  const IKON_KAMERA = `
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 8 H7 L8.5 5.5 H15.5 L17 8 H20 C20.55 8 21 8.45 21 9 V18 C21 18.55 20.55 19 20 19 H4 C3.45 19 3 18.55 3 18 V9 C3 8.45 3.45 8 4 8 Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
      <circle cx="12" cy="13.5" r="3.2" stroke="currentColor" stroke-width="1.6"/>
    </svg>`;

  // Ikon Instagram sederhana, dipakai pada tombol IG placeholder
  const IKON_INSTAGRAM = `
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" stroke="currentColor" stroke-width="1.6"/>
      <circle cx="12" cy="12" r="3.6" stroke="currentColor" stroke-width="1.6"/>
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor"/>
    </svg>`;

  function renderDaftarAnggota(anggotaList) {
    if (!modalAnggotaList) return;
    modalAnggotaList.innerHTML = "";

    anggotaList.forEach(function (orang, index) {
      const li = document.createElement("li");
      // Urutan tampil (dipakai CSS untuk delay stagger var(--i))
      li.style.setProperty("--i", index);

      // 1. Canvas foto placeholder (bulat) — isi `orang.foto` dengan path gambar nanti
      const fotoDiv = document.createElement("div");
      fotoDiv.className = "anggota-photo";
      if (orang.foto) {
        const img = document.createElement("img");
        img.src = orang.foto;
        img.alt = orang.nama;
        fotoDiv.appendChild(img);
      } else {
        fotoDiv.innerHTML = IKON_KAMERA;
      }
      li.appendChild(fotoDiv);

      // 2. Info: peran (jika ada) + nama
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

      // 3. Tombol IG placeholder — isi `orang.ig` dengan link Instagram nanti
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
        igLink.addEventListener("click", function (event) {
          event.preventDefault();
        });
      }
      li.appendChild(igLink);

      modalAnggotaList.appendChild(li);
    });

    // Pancing reflow lalu nyalakan animasi masuk satu-satu (stagger).
    // Tanpa requestAnimationFrame, class is-visible akan langsung aktif
    // di frame yang sama dengan pembuatan elemen sehingga transition CSS
    // tidak sempat terpicu (elemen langsung tampil tanpa animasi).
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

    if (modalDivisiImg) {
      modalDivisiImg.src = divisi.gambar;
      modalDivisiImg.alt = divisi.nama;
    }
    if (modalDivisiTitle) {
      modalDivisiTitle.textContent = divisi.nama;
    }
    // Isi eyebrow dengan label divisi — sebelumnya tidak di-update sehingga
    // selalu menampilkan teks default "Divisi" dan memunculkan error di console
    if (modalDivisiEyebrow) {
      modalDivisiEyebrow.textContent = divisi.nama;
    }
    if (modalAnggotaList) {
      renderDaftarAnggota(divisi.anggota);
    }

    strukturModal.classList.add("active");
    strukturModal.setAttribute("aria-hidden", "false");
  }

  function bukaDivisiRelatif(arah) {
    if (!divisiAktif) return;
    const indeksSaatIni = urutanDivisi.indexOf(divisiAktif);
    if (indeksSaatIni === -1) return;

    const total = urutanDivisi.length;
    const indeksBaru = (indeksSaatIni + arah + total) % total;
    bukaModalDivisi(urutanDivisi[indeksBaru]);
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

      // Guard null untuk strukturDropdown DAN strukturToggle secara terpisah
      // agar tidak throw "Cannot read properties of null" di console
      if (strukturDropdown) {
        strukturDropdown.classList.remove("open");
      }
      if (strukturToggle) {
        strukturToggle.setAttribute("aria-expanded", "false");
      }
    });
  });

  if (strukturCtaBtn) {
    strukturCtaBtn.addEventListener("click", function () {
      bukaModalDivisi("ketua");
    });
  }

  if (modalPrevBtn) {
    modalPrevBtn.addEventListener("click", function () {
      bukaDivisiRelatif(-1);
    });
  }

  if (modalNextBtn) {
    modalNextBtn.addEventListener("click", function () {
      bukaDivisiRelatif(1);
    });
  }

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener("click", tutupModalDivisi);
  }

  if (strukturModal) {
    strukturModal.addEventListener("click", function (event) {
      if (event.target === strukturModal) {
        tutupModalDivisi();
      }
    });
  }

  document.addEventListener("keydown", function (event) {
    if (!strukturModal || !strukturModal.classList.contains("active")) return;

    if (event.key === "Escape") {
      tutupModalDivisi();
    } else if (event.key === "ArrowLeft") {
      bukaDivisiRelatif(-1);
    } else if (event.key === "ArrowRight") {
      bukaDivisiRelatif(1);
    }
  });
});
