document.addEventListener("DOMContentLoaded", function () {
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

    // Auto-hide: sembunyikan saat scroll ke bawah, tampilkan saat scroll ke atas
    if (currentScrollY > lastScrollY && currentScrollY > HIDE_THRESHOLD) {
      siteHeader.classList.add("is-hidden");
    } else {
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

  function openMobileNav() {
    if (!navMenu) return;
    navMenu.classList.add("active");
    if (navBackdrop) navBackdrop.classList.add("active");
    if (menuToggle) {
      menuToggle.classList.add("active");
      menuToggle.setAttribute("aria-expanded", "true");
    }
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
    document.body.style.overflow = "";
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
     4. FORM KONTAK (DEMO, BELUM ADA BACKEND)
     ========================================= */
  const kontakForm = document.getElementById("kontak-form");

  if (kontakForm) {
    kontakForm.addEventListener("submit", function (event) {
      event.preventDefault();
      alert(
        "Terima kasih! Pesan Anda telah diterima (demo, belum terhubung ke server).",
      );
      kontakForm.reset();
    });
  }

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
      nama: "Ketua",
      gambar: "png/ketua.jpeg",
      anggota: [{ peran: "Ketua", nama: "Fathur Rahman", foto: "", ig: "" }],
    },
    sekretaris: {
      nama: "Sekretaris",
      gambar: "png/sekretaris.jpeg",
      anggota: [
        { peran: "Sekretaris 1", nama: "Hayqal", foto: "", ig: "" },
        { peran: "Sekretaris 2", nama: "Afriza", foto: "", ig: "" },
      ],
    },
    bendahara: {
      nama: "Bendahara",
      gambar: "png/bendahara.jpeg",
      anggota: [
        { peran: "Bendahara 1", nama: "Afriya", foto: "", ig: "" },
        { peran: "Bendahara 2", nama: "Aisyah", foto: "", ig: "" },
      ],
    },
    acara: {
      nama: "Bidang Acara",
      gambar: "png/acara.jpeg",
      anggota: [
        { nama: "Dafa Aulia", foto: "", ig: "" },
        { nama: "Hanin", foto: "", ig: "" },
        { nama: "Alya", foto: "", ig: "" },
        { nama: "Khadifa", foto: "", ig: "" },
        { nama: "Saripah Aini", foto: "", ig: "" },
      ],
    },
    humas: {
      nama: "Bidang Humas",
      gambar: "png/humas.jpeg",
      anggota: [
        { nama: "Amru", foto: "", ig: "" },
        { nama: "Uswah", foto: "", ig: "" },
        { nama: "Dhabita", foto: "", ig: "" },
        { nama: "Saskia", foto: "", ig: "" },
      ],
    },
    konsumsi: {
      nama: "Bidang Konsumsi",
      gambar: "png/konsumsi.jpeg",
      anggota: [
        { nama: "Emmi", foto: "", ig: "" },
        { nama: "Ardelia", foto: "", ig: "" },
        { nama: "Sella", foto: "", ig: "" },
        { nama: "Dina", foto: "", ig: "" },
        { nama: "Nur Riadoh Rangkuti", foto: "", ig: "" },
        { nama: "Elysa Rahmayani", foto: "", ig: "" },
      ],
    },
    pdd: {
      nama: "Bidang PDD",
      gambar: "png/pdd.jpeg",
      anggota: [
        { nama: "Tri Alya", foto: "", ig: "" },
        { nama: "Sofiya", foto: "", ig: "" },
      ],
    },
    perlengkapan: {
      nama: "Bidang Perlengkapan",
      gambar: "png/perlengkapan.jpeg",
      anggota: [
        { nama: "Aripin", foto: "", ig: "" },
        { nama: "Fahri", foto: "", ig: "" },
        { nama: "Ahmad", foto: "", ig: "" },
        { nama: "Priansyah", foto: "", ig: "" },
        { nama: "Intan", foto: "", ig: "" },
        { nama: "Aulia Rahmadina", foto: "", ig: "" },
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

    modalDivisiImg.src = divisi.gambar;
    modalDivisiImg.alt = divisi.nama;
    modalDivisiTitle.textContent = divisi.nama;

    renderDaftarAnggota(divisi.anggota);

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

      if (strukturDropdown) {
        strukturDropdown.classList.remove("open");
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
