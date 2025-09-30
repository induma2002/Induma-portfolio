const nav = document.querySelector('.site-nav');
const toggle = document.querySelector('.nav-toggle');
const menu = document.querySelector('.site-nav ul');
const scrollTopBtn = document.querySelector('.scroll-top');
const yearLabel = document.getElementById('year');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const pointerFine = window.matchMedia('(pointer: fine)');

const closeMenu = () => {
  nav?.setAttribute('aria-expanded', 'false');
  toggle?.setAttribute('aria-expanded', 'false');
  toggle?.classList.remove('is-open');
};

if (toggle && nav && menu) {
  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    nav.setAttribute('aria-expanded', String(!expanded));
    toggle.classList.toggle('is-open');
  });

  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });
}

const handleScroll = () => {
  if (window.scrollY > 500) {
    scrollTopBtn?.classList.add('is-visible');
  } else {
    scrollTopBtn?.classList.remove('is-visible');
  }
};

window.addEventListener('scroll', handleScroll);

scrollTopBtn?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

if (yearLabel) {
  yearLabel.textContent = String(new Date().getFullYear());
}

const interactiveSelector = 'a, button, .btn, input, textarea, select, [role="button"]';
let customCursorInitialized = false;
let cursorDot = null;
let allowSmoke = !prefersReducedMotion.matches;
let lastSmokeTime = 0;

const isFinePointer = (event) =>
  !event.pointerType || event.pointerType === 'mouse' || event.pointerType === 'pen';

const createSmoke = (x, y) => {
  if (!allowSmoke || !document.body.contains(cursorDot)) {
    return;
  }

  const smoke = document.createElement('span');
  smoke.className = 'cursor-smoke';
  const size = 28 + Math.random() * 52;
  smoke.style.width = `${size}px`;
  smoke.style.height = `${size}px`;
  smoke.style.left = `${x}px`;
  smoke.style.top = `${y}px`;

  const hue = Math.floor(220 + Math.random() * 110);
  const hueAlt = (hue + 40 + Math.random() * 30) % 360;

  smoke.style.setProperty('--hue', String(hue));
  smoke.style.setProperty('--hue-alt', String(hueAlt));
  smoke.style.setProperty('--duration', `${0.9 + Math.random() * 0.6}s`);
  smoke.style.setProperty('--scale-start', (0.3 + Math.random() * 0.2).toFixed(2));
  smoke.style.setProperty('--scale-end', (1.5 + Math.random() * 0.8).toFixed(2));
  smoke.style.setProperty('--blur', `${18 + Math.random() * 10}px`);
  smoke.style.setProperty('--tx-origin', `${(Math.random() - 0.5) * 18}px`);
  smoke.style.setProperty('--ty-origin', `${(Math.random() - 0.5) * 18}px`);
  smoke.style.setProperty('--tx', `${(Math.random() - 0.5) * 260}px`);
  smoke.style.setProperty('--ty', `${(Math.random() - 0.5) * 260}px`);

  document.body.appendChild(smoke);
  smoke.addEventListener('animationend', () => smoke.remove());
};

const pointerHandlers = {
  move(event) {
    if (!cursorDot || !isFinePointer(event)) {
      return;
    }

    const { clientX, clientY } = event;
    cursorDot.style.left = `${clientX}px`;
    cursorDot.style.top = `${clientY}px`;
    cursorDot.classList.add('is-visible');

    const interactive = event.target.closest(interactiveSelector);
    cursorDot.classList.toggle('is-link', Boolean(interactive));

    const now = performance.now();
    if (now - lastSmokeTime > 45) {
      createSmoke(clientX, clientY);
      lastSmokeTime = now;
    }
  },
  leave() {
    if (!cursorDot) {
      return;
    }
    cursorDot.classList.remove('is-visible', 'is-link', 'is-pressed');
  },
  down(event) {
    if (!cursorDot || !isFinePointer(event)) {
      return;
    }
    cursorDot.classList.add('is-pressed');
  },
  up(event) {
    if (!cursorDot || !isFinePointer(event)) {
      return;
    }
    cursorDot.classList.remove('is-pressed');
  },
};

const setupCustomCursor = () => {
  if (customCursorInitialized || !pointerFine.matches) {
    return;
  }

  customCursorInitialized = true;
  document.body.dataset.hasCustomCursor = 'true';
  cursorDot = document.createElement('div');
  cursorDot.className = 'cursor-dot';
  document.body.appendChild(cursorDot);
  lastSmokeTime = 0;

  window.addEventListener('pointermove', pointerHandlers.move);
  window.addEventListener('pointerleave', pointerHandlers.leave);
  window.addEventListener('pointerdown', pointerHandlers.down);
  window.addEventListener('pointerup', pointerHandlers.up);
};

const teardownCustomCursor = () => {
  if (!customCursorInitialized) {
    return;
  }

  customCursorInitialized = false;
  window.removeEventListener('pointermove', pointerHandlers.move);
  window.removeEventListener('pointerleave', pointerHandlers.leave);
  window.removeEventListener('pointerdown', pointerHandlers.down);
  window.removeEventListener('pointerup', pointerHandlers.up);
  cursorDot?.remove();
  cursorDot = null;
  delete document.body.dataset.hasCustomCursor;
};

if (pointerFine.matches) {
  setupCustomCursor();
}

pointerFine.addEventListener('change', (event) => {
  if (event.matches) {
    setupCustomCursor();
  } else {
    teardownCustomCursor();
  }
});

prefersReducedMotion.addEventListener('change', (event) => {
  allowSmoke = !event.matches;
});


if (!prefersReducedMotion.matches) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
        }
      });
    },
    {
      threshold: 0.15,
    }
  );

  document.querySelectorAll('.skill-card, .work-card, .step').forEach((item) => {
    item.classList.add('will-animate');
    observer.observe(item);
  });
}
