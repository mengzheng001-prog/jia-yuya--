// Interaction & Animations
document.addEventListener('DOMContentLoaded', () => {
  // Mobile Nav Toggle
  const menuBtn = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (menuBtn && navLinks) {
    menuBtn.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });
  }

  // Scroll Reveal Observer
  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -10% 0px',
    threshold: 0
  };
  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.reveal, .section-reveal').forEach(el => {
    observer.observe(el);
  });

  // Lightbox for project gallery
  const galleryItems = document.querySelectorAll('.gallery-item');
  if (galleryItems.length > 0) {
    setupLightbox(galleryItems);
  }

  // Gallery filter
  setupGalleryFilter();

  // Other Projects: wheel → horizontal scroll
  setupHorizontalScroll();
});

function setupLightbox(galleryItems) {
  const lightbox = document.createElement('div');
  lightbox.className = 'lightbox';
  lightbox.innerHTML = `
    <button class="lightbox-close" aria-label="关闭">&times;</button>
    <button class="lightbox-prev" aria-label="上一张">&#10094;</button>
    <button class="lightbox-next" aria-label="下一张">&#10095;</button>
    <img alt="" />
    <div class="lightbox-counter"></div>
  `;
  document.body.appendChild(lightbox);

  const lbImg = lightbox.querySelector('img');
  const counter = lightbox.querySelector('.lightbox-counter');
  const closeBtn = lightbox.querySelector('.lightbox-close');
  const prevBtn = lightbox.querySelector('.lightbox-prev');
  const nextBtn = lightbox.querySelector('.lightbox-next');

  let currentList = [];
  let currentIdx = 0;

  function getVisibleItems() {
    return Array.from(document.querySelectorAll('.gallery-item:not([hidden])'));
  }

  function show(idx) {
    currentList = getVisibleItems();
    if (!currentList.length) return;
    currentIdx = (idx + currentList.length) % currentList.length;
    const item = currentList[currentIdx];
    const imgElement = item.querySelector('img');
    if (!imgElement) return;

    lbImg.src = imgElement.src;
    counter.textContent = `${currentIdx + 1} / ${currentList.length}`;
    
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      currentList = getVisibleItems();
      const visIdx = currentList.indexOf(item);
      show(visIdx >= 0 ? visIdx : 0);
    });
  });

  closeBtn.addEventListener('click', close);
  prevBtn.addEventListener('click', (e) => { e.stopPropagation(); show(currentIdx - 1); });
  nextBtn.addEventListener('click', (e) => { e.stopPropagation(); show(currentIdx + 1); });
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) close(); });

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(currentIdx - 1);
    if (e.key === 'ArrowRight') show(currentIdx + 1);
  });
}

function setupHorizontalScroll() {
  // 遍历所有 .other-grid-frame，让「其他项目」和「个人项目」两个区都生效
  document.querySelectorAll('.other-grid-frame').forEach((frame) => {
    const grid = frame.querySelector('.other-grid');
    if (!grid) return;

    // 卡片宽 380px + gap 24px = 404px 单次滚动距离
    const STEP = 404;
    const SCROLL_MULTIPLIER = 2.4; // 滚轮灵敏度倍数

    // === 鼠标滚轮 → 横向滚动 ===
    grid.addEventListener('wheel', (e) => {
      if (e.deltaY === 0 || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;

      const atStart = grid.scrollLeft <= 0;
      const atEnd = grid.scrollLeft + grid.clientWidth >= grid.scrollWidth - 1;

      if ((e.deltaY > 0 && atEnd) || (e.deltaY < 0 && atStart)) return;

      e.preventDefault();
      grid.scrollLeft += e.deltaY * SCROLL_MULTIPLIER;
    }, { passive: false });

    // === 左右箭头按钮（每个 frame 内独立查找）===
    const prevBtn = frame.querySelector('.grid-nav-prev');
    const nextBtn = frame.querySelector('.grid-nav-next');
    if (prevBtn && nextBtn) {
      prevBtn.addEventListener('click', () => {
        grid.scrollBy({ left: -STEP, behavior: 'smooth' });
      });
      nextBtn.addEventListener('click', () => {
        grid.scrollBy({ left: STEP, behavior: 'smooth' });
      });

      const updateBtns = () => {
        const atStart = grid.scrollLeft <= 2;
        const atEnd = grid.scrollLeft + grid.clientWidth >= grid.scrollWidth - 2;
        prevBtn.disabled = atStart;
        nextBtn.disabled = atEnd;
      };
      grid.addEventListener('scroll', updateBtns, { passive: true });
      window.addEventListener('resize', updateBtns);
      updateBtns();
      setTimeout(updateBtns, 100); // 等图片加载完后再校准
    }
  });
}

function setupGalleryFilter() {
  const toggles = document.querySelectorAll('.gallery-toggle');
  if (!toggles.length) return;

  toggles.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;
      toggles.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      document.querySelectorAll('.gallery-item').forEach(item => {
        if (filter === 'all' || item.dataset.group === filter) {
          item.hidden = false;
          // Trigger slight reflow to restart translate animation
          item.style.animation = 'none';
          item.offsetHeight; /* trigger reflow */
          item.style.animation = 'fadeUp 0.4s ease forwards';
        } else {
          item.hidden = true;
        }
      });
    });
  });
}
