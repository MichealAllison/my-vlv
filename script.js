document.addEventListener('DOMContentLoaded', () => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Document transition ---------- */
  const transition = document.createElement('div');
  transition.className = 'page-transition';
  transition.setAttribute('aria-hidden', 'true');
  transition.innerHTML = '<span></span><span></span><span></span>';
  document.body.appendChild(transition);
  if (!reduceMotion){
    document.body.classList.add('is-entering');
    requestAnimationFrame(() => transition.classList.add('is-ready'));
  }

  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || link.target === '_blank') return;
    link.addEventListener('click', (event) => {
      const destination = new URL(href, window.location.href);
      if (destination.origin !== window.location.origin || destination.pathname === window.location.pathname && destination.hash) return;
      if (reduceMotion) return;
      event.preventDefault();
      transition.classList.remove('is-ready');
      transition.classList.add('is-leaving');
      window.setTimeout(() => { window.location.href = destination.href; }, 620);
    });
  });

  /* ---------- Page intro ---------- */
  const loader = document.querySelector('.page-loader');
  if (loader){
    document.body.classList.add('is-loading');
    const count = loader.querySelector('.page-loader__count');
    const startedAt = performance.now();
    let progressTimer;
    if (count && !reduceMotion){
      progressTimer = window.setInterval(() => {
        const progress = Math.min(99, Math.round(((performance.now() - startedAt) / 1550) * 100));
        count.textContent = String(progress).padStart(2, '0');
      }, 40);
    }
    const exitLoader = () => {
      const wait = reduceMotion ? 0 : Math.max(0, 1750 - (performance.now() - startedAt));
      window.setTimeout(() => {
        if (progressTimer) window.clearInterval(progressTimer);
        if (count) count.textContent = '100';
        loader.classList.add('is-exiting');
        document.body.classList.remove('is-loading');
        window.setTimeout(() => loader.remove(), reduceMotion ? 0 : 850);
      }, wait);
    };
    if (document.readyState === 'complete') exitLoader();
    else window.addEventListener('load', exitLoader, { once: true });
  }

  /* ---------- Mobile nav ---------- */
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links){
    toggle.addEventListener('click', () => {
      const open = links.classList.toggle('is-open');
      toggle.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', open);
    });
    links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      links.classList.remove('is-open');
      toggle.classList.remove('is-open');
    }));
  }

  /* ---------- Hero entrance ---------- */
  const heroWordmark = document.querySelector('.hero-wordmark');
  if (heroWordmark && !reduceMotion){
    heroWordmark.style.opacity = '0';
    heroWordmark.style.transform = 'translateY(40px)';
    heroWordmark.style.transition = 'opacity 1s cubic-bezier(.22,1,.36,1) .3s, transform 1s cubic-bezier(.22,1,.36,1) .3s';
    requestAnimationFrame(() => requestAnimationFrame(() => {
      heroWordmark.style.opacity = '1';
      heroWordmark.style.transform = 'none';
    }));
  }
  document.querySelectorAll('.hero-kicker-top, .hero-lede-abs, .hero-badge-side').forEach((el, i) => {
    if (reduceMotion) return;
    el.style.opacity = '0';
    el.style.transform = 'translateY(16px)';
    el.style.transition = `opacity .8s ease ${0.5 + i * 0.15}s, transform .8s cubic-bezier(.22,1,.36,1) ${0.5 + i * 0.15}s`;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    }));
  });

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion){
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting){
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach((el, i) => {
      el.style.transitionDelay = `${(i % 4) * 90}ms`;
      io.observe(el);
    });
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  /* ---------- Custom cursor ---------- */
  const cursor = document.querySelector('.cursor-dot');
  if (cursor && window.matchMedia('(hover:hover)').matches){
    let x = 0, y = 0;
    window.addEventListener('mousemove', (e) => {
      x = e.clientX; y = e.clientY;
      cursor.style.left = x + 'px';
      cursor.style.top = y + 'px';
      cursor.classList.add('is-active');
    });
    document.querySelectorAll('a, button, .work-item, .post-card').forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('is-big'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('is-big'));
    });
    document.addEventListener('mouseleave', () => cursor.classList.remove('is-active'));
  }

  /* ---------- Header shrink on scroll ---------- */
  const header = document.querySelector('.site-header');
  if (header){
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      header.style.boxShadow = (y > 8 && !header.classList.contains('site-header--overlay')) ? '0 1px 0 rgba(22,37,29,0.06)' : 'none';
      header.classList.toggle('is-scrolled', y > 40);
    }, { passive: true });
  }

  /* ---------- Blog category filter ---------- */
  const filterBar = document.querySelector('.filter-bar');
  if (filterBar){
    const buttons = filterBar.querySelectorAll('button');
    const cards = document.querySelectorAll('.post-card');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.setAttribute('aria-pressed', 'false'));
        btn.setAttribute('aria-pressed', 'true');
        const cat = btn.dataset.filter;
        cards.forEach(card => {
          const match = cat === 'all' || card.dataset.category === cat;
          card.classList.toggle('is-hidden', !match);
        });
      });
    });
  }

  /* ---------- Carousel (services) ---------- */
  document.querySelectorAll('.carousel').forEach(carousel => {
    const track = carousel.querySelector('.carousel-track');
    const cards = Array.from(track.querySelectorAll('.car-card'));
    const dotsWrap = carousel.querySelector('.carousel-dots');
    const btns = carousel.querySelectorAll('.cnav');
    if (!track || !cards.length) return;

    cards.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      dot.setAttribute('aria-current', i === 0 ? 'true' : 'false');
      dot.addEventListener('click', () => cards[i].scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', inline: 'center', block: 'nearest' }));
      dotsWrap.appendChild(dot);
    });
    const dots = Array.from(dotsWrap.children);

    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        const dir = parseInt(btn.dataset.dir, 10);
        const cardWidth = cards[0].getBoundingClientRect().width + 24;
        track.scrollBy({ left: dir * cardWidth, behavior: reduceMotion ? 'auto' : 'smooth' });
      });
    });

    if ('IntersectionObserver' in window){
      const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting){
            const idx = cards.indexOf(entry.target);
            dots.forEach((d, i) => d.setAttribute('aria-current', i === idx ? 'true' : 'false'));
          }
        });
      }, { root: track, threshold: 0.6 });
      cards.forEach(c => io.observe(c));
    }
  });

  /* ---------- Testimonial slider ---------- */
  document.querySelectorAll('.testimonial-slider').forEach(slider => {
    const slides = Array.from(slider.querySelectorAll('.testimonial-slide'));
    const dotsWrap = slider.parentElement.querySelector('.testimonial-dots');
    const previous = slider.querySelector('.testimonial-arrow--prev');
    const next = slider.querySelector('.testimonial-arrow--next');
    let current = 0;
    if (!slides.length || !dotsWrap) return;

    const showSlide = (index) => {
      current = (index + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle('is-active', i === current));
      Array.from(dotsWrap.children).forEach((dot, i) => dot.setAttribute('aria-current', i === current ? 'true' : 'false'));
    };
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('aria-label', `Go to testimonial ${i + 1}`);
      dot.setAttribute('aria-current', i === 0 ? 'true' : 'false');
      dot.addEventListener('click', () => showSlide(i));
      dotsWrap.appendChild(dot);
    });
    previous.addEventListener('click', () => showSlide(current - 1));
    next.addEventListener('click', () => showSlide(current + 1));
  });

  /* ---------- Contact form (demo submit) ---------- */
  const form = document.querySelector('.contact-form');
  if (form){
    const status = form.querySelector('.form-status');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      status.textContent = 'Sending…';
      setTimeout(() => {
        status.textContent = `Thanks — your message has been received.`;
        form.reset();
      }, 700);
    });
  }

  /* ---------- Hero image gentle parallax on mouse ---------- */
  const heroPhoto = document.querySelector('.hero-photo-wrap img');
  if (heroPhoto && !reduceMotion && window.matchMedia('(hover:hover)').matches){
    const wrap = document.querySelector('.hero-photo-wrap');
    heroPhoto.style.transition = 'transform .6s cubic-bezier(.22,1,.36,1)';
    wrap.addEventListener('mousemove', (e) => {
      const r = wrap.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      heroPhoto.style.transform = `scale(1.06) translate(${px * -14}px, ${py * -10}px)`;
    });
    wrap.addEventListener('mouseleave', () => { heroPhoto.style.transform = 'scale(1.06) translate(0,0)'; });
  }
});