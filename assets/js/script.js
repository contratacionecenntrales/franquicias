(() => {
  'use strict';

  /* ============ Header scroll state ============ */
  const header = document.getElementById('site-header');
  const onScroll = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 8);
    backToTop.classList.toggle('is-visible', window.scrollY > 480);
  };

  /* ============ Mobile nav toggle ============ */
  const navToggle = document.getElementById('nav-toggle');
  const nav = document.getElementById('main-nav');

  const closeNav = () => {
    nav.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Abrir menú');
  };

  navToggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
    navToggle.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
  });

  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeNav));

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeNav();
  });

  /* ============ Back to top ============ */
  const backToTop = document.getElementById('back-to-top');
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ============ Reveal on scroll ============ */
  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0, rootMargin: '0px 0px -10% 0px' });

    revealItems.forEach(item => revealObserver.observe(item));

    /* Safety net: guarantee nothing stays hidden if the observer
       misses a fast fling-scroll or instant jump. */
    let revealCheckPending = false;
    const revealFallbackCheck = () => {
      revealCheckPending = false;
      document.querySelectorAll('.reveal:not(.is-visible)').forEach(item => {
        const rect = item.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          item.classList.add('is-visible');
        }
      });
    };
    window.addEventListener('scroll', () => {
      if (revealCheckPending) return;
      revealCheckPending = true;
      requestAnimationFrame(revealFallbackCheck);
    }, { passive: true });
    window.addEventListener('load', () => window.setTimeout(revealFallbackCheck, 400));

    /* Ultimate guarantee: never leave content permanently hidden. */
    window.setTimeout(() => {
      document.querySelectorAll('.reveal:not(.is-visible)').forEach(item => {
        item.classList.add('is-visible');
      });
    }, 4000);
  } else {
    revealItems.forEach(item => item.classList.add('is-visible'));
  }

  /* ============ Animated counters ============ */
  const counters = document.querySelectorAll('[data-count]');
  const animateCounter = el => {
    const target = parseFloat(el.getAttribute('data-count'));
    const isDecimal = String(target).includes('.');
    const duration = 1400;
    const start = performance.now();

    const step = now => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = target * eased;
      el.textContent = isDecimal ? value.toFixed(1) : Math.round(value);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  if ('IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });

    counters.forEach(counter => counterObserver.observe(counter));
  } else {
    counters.forEach(animateCounter);
  }

  /* ============ Footer year ============ */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ============ Admission form validation ============ */
  const form = document.getElementById('admision-form');
  const successPanel = document.getElementById('form-success');

  const validators = {
    nombre: v => v.trim().length >= 2 || 'Introduce tu nombre.',
    apellidos: v => v.trim().length >= 2 || 'Introduce tus apellidos.',
    email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Introduce un correo válido.',
    telefono: v => /^[+\d][\d\s()-]{6,}$/.test(v) || 'Introduce un teléfono válido.',
    cargo: v => v.trim().length >= 2 || 'Indica tu cargo actual.',
    inversion: v => v !== '' || 'Selecciona un rango de inversión.',
    ciudad: v => v.trim().length >= 2 || 'Indica una ciudad o región.',
    privacidad: (v, el) => el.checked || 'Debes aceptar la política de privacidad.'
  };

  const setFieldError = (field, message) => {
    const wrap = field.closest('.field');
    const errorEl = wrap.querySelector('.field-error');
    wrap.classList.toggle('has-error', Boolean(message));
    errorEl.textContent = message || '';
  };

  const validateField = field => {
    const rule = validators[field.name];
    if (!rule) return true;
    const result = rule(field.value, field);
    const isValid = result === true;
    setFieldError(field, isValid ? '' : result);
    return isValid;
  };

  Object.keys(validators).forEach(name => {
    const field = form.elements[name];
    if (!field) return;
    const evt = field.type === 'checkbox' || field.tagName === 'SELECT' ? 'change' : 'blur';
    field.addEventListener(evt, () => validateField(field));
    field.addEventListener('input', () => {
      if (field.closest('.field').classList.contains('has-error')) validateField(field);
    });
  });

  form.addEventListener('submit', e => {
    e.preventDefault();

    let isFormValid = true;
    Object.keys(validators).forEach(name => {
      const field = form.elements[name];
      if (!field) return;
      if (!validateField(field)) isFormValid = false;
    });

    if (!isFormValid) {
      const firstError = form.querySelector('.field.has-error input, .field.has-error select');
      if (firstError) firstError.focus();
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    const label = submitBtn.querySelector('.btn-label');
    submitBtn.disabled = true;
    label.textContent = 'Enviando...';

    /* Simulated submission — replace with a real endpoint integration. */
    window.setTimeout(() => {
      form.hidden = true;
      successPanel.hidden = false;
      successPanel.setAttribute('tabindex', '-1');
      successPanel.focus();
    }, 900);
  });

})();
