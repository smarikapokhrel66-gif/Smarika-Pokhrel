/* ==========================================================================
   SMARIKA POKHREL - ACADEMIC RESEARCHER INTERACTIVE ENGINE (app.js)
   Author: Smarika Pokhrel (smarikapokhrel.com.np)
   Features: 3D Card Tilt, Spotlight Tracking, Animated Stats Counter,
             Silky Subtab Transitions, Sliding Tab Pill, Scroll Reveal Engine,
             Lightbox Gallery, LocalStorage Persistence, Toast Alerts
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // --- 1. DOM ELEMENTS ---
  const navTabBtns = document.querySelectorAll('.nav-tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');
  const themeToggle = document.getElementById('theme-toggle');
  const globalSearch = document.getElementById('global-search');
  const searchCountBadge = document.getElementById('search-count');

  // Modals
  const uploadModal = document.getElementById('upload-modal');
  const lightboxModal = document.getElementById('lightbox-modal');
  const dnsModal = document.getElementById('dns-modal');
  const closeModalBtns = document.querySelectorAll('.close-modal-btn');

  // Triggers
  const openUploadBtn = document.getElementById('open-upload-modal-btn');
  const navAddEventBtn = document.getElementById('add-event-nav-btn');
  const dnsInfoBtn = document.getElementById('dns-info-btn');
  const footerDnsLink = document.getElementById('footer-dns-link');
  const openContactBtn = document.getElementById('open-contact-btn');
  const downloadCvBtn = document.getElementById('download-cv-btn');
  const cvPrintBtn = document.getElementById('cv-print-btn');

  // Lightbox Elements
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxPrev = document.getElementById('lightbox-prev');
  const lightboxNext = document.getElementById('lightbox-next');
  let currentGalleryImages = [];
  let currentImageIndex = 0;


  // --- 2. 3D CARD PERSPECTIVE TILT & SPOTLIGHT MOUSE ENGINE ---
  function init3DTiltEngine() {
    const tiltCards = document.querySelectorAll('.tilt-card');
    
    tiltCards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Mouse Spotlight percentages
        const xPercent = (x / rect.width) * 100;
        const yPercent = (y / rect.height) * 100;

        card.style.setProperty('--mouse-x', `${xPercent}%`);
        card.style.setProperty('--mouse-y', `${yPercent}%`);

        // 3D Tilt rotation calculation (max 6 deg)
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -6;
        const rotateY = ((x - centerX) / centerX) * 6;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.015, 1.015, 1.015)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      });
    });
  }

  init3DTiltEngine();


  // --- 3. ANIMATED STATS COUNTER ---
  function initStatsCounter() {
    const statCards = document.querySelectorAll('.stat-glass-card');
    let hasAnimated = false;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !hasAnimated) {
          hasAnimated = true;
          document.querySelectorAll('.stat-number[data-target]').forEach(counter => {
            const target = parseFloat(counter.getAttribute('data-target'));
            const isFloat = counter.textContent.includes('.');
            const hasPercent = counter.textContent.includes('%');
            const hasPlus = counter.textContent.includes('+');

            let current = 0;
            const duration = 1500; // ms
            const stepTime = 20;
            const steps = duration / stepTime;
            const increment = target / steps;

            const timer = setInterval(() => {
              current += increment;
              if (current >= target) {
                current = target;
                clearInterval(timer);
              }
              
              let displayVal = isFloat ? current.toFixed(1) : Math.floor(current);
              if (hasPercent) displayVal += '%';
              if (hasPlus) displayVal += '+';
              counter.textContent = displayVal;
            }, stepTime);
          });
        }
      });
    }, { threshold: 0.3 });

    statCards.forEach(card => observer.observe(card));
  }

  initStatsCounter();


  // --- 4. SILKY SUBTAB SWITCHING & SLIDING TAB PILL ---
  let isSwitchingTab = false;

  function updateTabIndicator() {
    const activeBtn = document.querySelector('.nav-tab-btn.active');
    const wrapper = document.querySelector('.tabs-glass-wrapper');
    if (!wrapper || !activeBtn) return;

    let indicator = wrapper.querySelector('.tab-slide-indicator');
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.className = 'tab-slide-indicator';
      wrapper.appendChild(indicator);
    }

    const wrapperRect = wrapper.getBoundingClientRect();
    const btnRect = activeBtn.getBoundingClientRect();

    const left = btnRect.left - wrapperRect.left + wrapper.scrollLeft;
    const width = btnRect.width;

    indicator.style.left = `${left}px`;
    indicator.style.width = `${width}px`;
  }

  function switchTab(tabId) {
    if (isSwitchingTab) return;

    const currentActive = document.querySelector('.tab-panel.active');
    const targetPanel = document.getElementById(`tab-${tabId}`);

    if (!targetPanel || currentActive === targetPanel) return;

    isSwitchingTab = true;

    // Update Nav Buttons
    navTabBtns.forEach(btn => {
      if (btn.getAttribute('data-tab') === tabId) {
        btn.classList.add('active');
        btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      } else {
        btn.classList.remove('active');
      }
    });

    updateTabIndicator();

    if (currentActive) {
      currentActive.classList.add('tab-leaving');
      currentActive.classList.remove('active');

      setTimeout(() => {
        currentActive.style.display = 'none';
        currentActive.classList.remove('tab-leaving');
        showTargetPanel(targetPanel);
      }, 180);
    } else {
      showTargetPanel(targetPanel);
    }
  }

  function showTargetPanel(targetPanel) {
    targetPanel.style.display = 'block';
    targetPanel.classList.add('tab-entering');

    // Force browser reflow to apply CSS transition
    void targetPanel.offsetHeight;

    requestAnimationFrame(() => {
      targetPanel.classList.remove('tab-entering');
      targetPanel.classList.add('active');

      initScrollReveal();

      setTimeout(() => {
        isSwitchingTab = false;
      }, 350);
    });

    // Smooth scroll back up to hero or tabs if scrolled down
    const heroElem = document.getElementById('hero-section');
    if (heroElem && window.scrollY > 250) {
      window.scrollTo({
        top: heroElem.offsetTop - 90,
        behavior: 'smooth'
      });
    }
  }

  navTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.getAttribute('data-tab');
      switchTab(tabId);
    });
  });

  document.querySelectorAll('.view-tab-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetTab = link.getAttribute('data-tab') || 'overview';
      switchTab(targetTab);
    });
  });

  window.addEventListener('resize', updateTabIndicator);
  setTimeout(updateTabIndicator, 100);


  // --- 5. SCROLL REVEAL ANIMATION ENGINE ---
  function initScrollReveal() {
    const revealElements = document.querySelectorAll(
      '.material-card, .portfolio-card, .stat-glass-card, .timeline-item, .skill-category-card, .gallery-card, .section-header-banner, .hero-profile-card'
    );

    revealElements.forEach((el, index) => {
      if (!el.classList.contains('reveal-on-scroll')) {
        el.classList.add('reveal-on-scroll');
        const gridDelay = (index % 4) + 1;
        el.classList.add(`reveal-delay-${gridDelay}`);
      }
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -30px 0px'
    });

    revealElements.forEach(el => observer.observe(el));
  }

  initScrollReveal();

  // Header Sticky Scroll Effect
  window.addEventListener('scroll', () => {
    const header = document.querySelector('.site-header');
    if (!header) return;
    if (window.scrollY > 30) {
      header.classList.add('header-scrolled');
    } else {
      header.classList.remove('header-scrolled');
    }
  });


  // --- 6. THEME SWITCHER (OBSIDIAN DARK / PEARL LIGHT) ---
  const savedTheme = localStorage.getItem('smarika_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('smarika_theme', newTheme);
    updateThemeIcon(newTheme);
    showToast(`Switched to ${newTheme === 'dark' ? 'Obsidian Dark' : 'Pearl Light'} mode`);
  });

  function updateThemeIcon(theme) {
    const icon = themeToggle.querySelector('i');
    if (theme === 'dark') {
      icon.className = 'fa-solid fa-sun';
      themeToggle.title = 'Switch to Light Mode';
    } else {
      icon.className = 'fa-solid fa-moon';
      themeToggle.title = 'Switch to Dark Mode';
    }
  }


  // --- 7. PORTFOLIO CATEGORY FILTERING ---
  const filterBtns = document.querySelectorAll('#portfolio-filters .filter-pill-btn');
  const portfolioItems = document.querySelectorAll('.portfolio-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');
      portfolioItems.forEach(item => {
        if (filter === 'all' || item.getAttribute('data-category') === filter) {
          item.style.display = 'flex';
          item.style.opacity = '1';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });


  // --- 8. GLOBAL SEARCH FILTER ---
  globalSearch.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase().trim();
    let matchesCount = 0;

    if (!term) {
      document.querySelectorAll('.portfolio-card, .timeline-item, .skill-category-card').forEach(el => {
        el.style.display = '';
      });
      searchCountBadge.style.display = 'none';
      return;
    }

    // Filter publications
    document.querySelectorAll('.portfolio-card').forEach(card => {
      const text = card.textContent.toLowerCase();
      const match = text.includes(term);
      card.style.display = match ? 'flex' : 'none';
      if (match) matchesCount++;
    });

    // Filter events & CV timeline
    document.querySelectorAll('.timeline-item').forEach(item => {
      const text = item.textContent.toLowerCase();
      const match = text.includes(term);
      item.style.display = match ? 'block' : 'none';
      if (match) matchesCount++;
    });

    searchCountBadge.textContent = `${matchesCount} match${matchesCount !== 1 ? 'es' : ''}`;
    searchCountBadge.style.display = 'block';
  });


  // --- 9. MODALS MANAGEMENT ---
  function openModal(modal) {
    if (!modal) return;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  closeModalBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.modal-overlay').forEach(closeModal);
    });
  });

  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal(overlay);
    });
  });

  if (openUploadBtn) openUploadBtn.addEventListener('click', () => openModal(uploadModal));
  if (navAddEventBtn) navAddEventBtn.addEventListener('click', () => openModal(uploadModal));
  if (dnsInfoBtn) dnsInfoBtn.addEventListener('click', () => openModal(dnsModal));
  if (footerDnsLink) footerDnsLink.addEventListener('click', (e) => { e.preventDefault(); openModal(dnsModal); });
  if (openContactBtn) openContactBtn.addEventListener('click', () => switchTab('contact'));


  // --- 10. PAPER & EVENT UPLOAD PERSISTENCE ---
  const eventUploadForm = document.getElementById('event-upload-form');
  const eventsContainer = document.getElementById('events-list-container');
  const fullGalleryGrid = document.getElementById('full-gallery-grid');
  
  loadStoredEvents();

  if (eventUploadForm) {
    eventUploadForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const title = document.getElementById('event-title').value;
      const role = document.getElementById('event-role').value;
      const location = document.getElementById('event-location').value;
      const description = document.getElementById('event-description').value;
      const files = document.getElementById('event-photos').files;

      const photos = [];
      if (files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          const base64 = await convertFileToBase64(files[i]);
          photos.push(base64);
        }
      }

      const newEvent = {
        id: Date.now(),
        title,
        role,
        location,
        description,
        photos
      };

      saveEventToStorage(newEvent);
      renderEventCard(newEvent, true);
      renderGalleryItems(newEvent);

      eventUploadForm.reset();
      closeModal(uploadModal);
      updateStatsCounter();
      init3DTiltEngine();
      initScrollReveal();
      showToast('Paper / Research event published successfully!');
    });
  }

  function convertFileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  }

  function saveEventToStorage(eventObj) {
    const existing = JSON.parse(localStorage.getItem('smarika_events_data') || '[]');
    existing.unshift(eventObj);
    localStorage.setItem('smarika_events_data', JSON.stringify(existing));
  }

  function loadStoredEvents() {
    const stored = JSON.parse(localStorage.getItem('smarika_events_data') || '[]');
    stored.forEach(evt => {
      renderEventCard(evt, false);
      renderGalleryItems(evt);
    });
    updateStatsCounter();
    attachLightboxListeners();
  }

  function renderEventCard(evt, prepend = false) {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'timeline-item';

    let photosHtml = '';
    if (evt.photos && evt.photos.length > 0) {
      photosHtml = `
        <div>
          <h4 style="font-size: 0.85rem; color: var(--text-tertiary); margin-bottom: 8px;">Attached Paper / Lab Photos:</h4>
          <div class="event-photos-grid">
            ${evt.photos.map((p, idx) => `
              <img src="${p}" alt="${evt.title} Photo ${idx+1}" class="event-photo-thumb lightbox-trigger" data-full="${p}" data-caption="${evt.title} - ${evt.location}">
            `).join('')}
          </div>
        </div>
      `;
    }

    itemDiv.innerHTML = `
      <div class="timeline-dot"></div>
      <div class="material-card tilt-card">
        <div class="card-header-flex">
          <div>
            <h3 class="card-title">${escapeHtml(evt.title)}</h3>
            <p class="card-subtitle"><i class="fa-solid fa-location-dot"></i> ${escapeHtml(evt.location)}</p>
          </div>
          <span class="card-badge">${escapeHtml(evt.role)}</span>
        </div>
        <p class="card-description">${escapeHtml(evt.description)}</p>
        ${photosHtml}
      </div>
    `;

    if (prepend && eventsContainer.firstChild) {
      eventsContainer.insertBefore(itemDiv, eventsContainer.firstChild);
    } else {
      eventsContainer.appendChild(itemDiv);
    }

    attachLightboxListeners();
  }

  function renderGalleryItems(evt) {
    if (!evt.photos || evt.photos.length === 0) return;

    evt.photos.forEach((photoSrc, idx) => {
      const card = document.createElement('div');
      card.className = 'gallery-card lightbox-trigger';
      card.setAttribute('data-full', photoSrc);
      card.setAttribute('data-caption', `${evt.title} - Photo ${idx+1}`);

      card.innerHTML = `
        <img src="${photoSrc}" alt="${evt.title}">
        <div class="gallery-overlay">
          <div class="gallery-title">${escapeHtml(evt.title)}</div>
          <div class="gallery-sub">${escapeHtml(evt.location)}</div>
        </div>
      `;

      fullGalleryGrid.insertBefore(card, fullGalleryGrid.firstChild);
    });

    attachLightboxListeners();
  }

  function updateStatsCounter() {
    const totalEvents = document.querySelectorAll('.event-card, #events-list-container .timeline-item').length;
    const eventsCounter = document.getElementById('stat-events-count');
    if (eventsCounter) eventsCounter.textContent = totalEvents;
  }


  // --- 11. LIGHTBOX GALLERY VIEWER ---
  function attachLightboxListeners() {
    const triggers = document.querySelectorAll('.lightbox-trigger');
    triggers.forEach((trigger) => {
      trigger.removeEventListener('click', openLightboxHandler);
      trigger.addEventListener('click', openLightboxHandler);
    });
  }

  function openLightboxHandler(e) {
    e.stopPropagation();
    const allTriggers = Array.from(document.querySelectorAll('.lightbox-trigger'));
    currentGalleryImages = allTriggers.map(el => ({
      src: el.getAttribute('data-full') || el.src,
      caption: el.getAttribute('data-caption') || 'Gallery Image'
    }));

    const clickedSrc = this.getAttribute('data-full') || this.src;
    currentImageIndex = currentGalleryImages.findIndex(img => img.src === clickedSrc);
    if (currentImageIndex === -1) currentImageIndex = 0;

    showLightboxImage(currentImageIndex);
    openModal(lightboxModal);
  }

  function showLightboxImage(index) {
    if (!currentGalleryImages[index]) return;
    lightboxImg.src = currentGalleryImages[index].src;
    lightboxCaption.textContent = currentGalleryImages[index].caption;
  }

  if (lightboxPrev) {
    lightboxPrev.addEventListener('click', (e) => {
      e.stopPropagation();
      currentImageIndex = (currentImageIndex - 1 + currentGalleryImages.length) % currentGalleryImages.length;
      showLightboxImage(currentImageIndex);
    });
  }

  if (lightboxNext) {
    lightboxNext.addEventListener('click', (e) => {
      e.stopPropagation();
      currentImageIndex = (currentImageIndex + 1) % currentGalleryImages.length;
      showLightboxImage(currentImageIndex);
    });
  }

  document.addEventListener('keydown', (e) => {
    if (!lightboxModal || !lightboxModal.classList.contains('active')) return;
    if (e.key === 'ArrowLeft' && lightboxPrev) lightboxPrev.click();
    if (e.key === 'ArrowRight' && lightboxNext) lightboxNext.click();
    if (e.key === 'Escape') closeModal(lightboxModal);
  });


  // --- 12. PRINT & DOWNLOAD CV ---
  if (cvPrintBtn) {
    cvPrintBtn.addEventListener('click', () => {
      window.print();
    });
  }

  if (downloadCvBtn) {
    downloadCvBtn.addEventListener('click', () => {
      switchTab('cv');
      setTimeout(() => {
        window.print();
      }, 400);
    });
  }


  // --- 13. CONTACT FORM & TOAST NOTIFICATIONS ---
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      showToast('Thank you! Your message has been sent to Smarika Pokhrel.');
      contactForm.reset();
    });
  }

  function showToast(message) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.innerHTML = `<i class="fa-solid fa-circle-check" style="color: var(--accent-cyan);"></i> <span>${escapeHtml(message)}</span>`;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(20px)';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  // HTML Escape Helper
  function escapeHtml(str) {
    return str ? str.replace(/[&<>"']/g, function(m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m];
    }) : '';
  }

  // Initial trigger setup
  attachLightboxListeners();
});
