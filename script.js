/* ---------- Shared helpers ---------- */
(() => {
  const ADDRESS =
    'Sooraj Auditorium, 26/169-D, Mubarak Road, Koyilandy, Panthalayini, Kozhikode, Kerala 673305';

  const copyText = async text => {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return;
      } catch (error) {
        // Fall through to the legacy path when clipboard permission is unavailable.
      }
    }
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0';
    document.body.appendChild(area);
    area.select();
    const copied = document.execCommand('copy');
    area.remove();
    if (!copied) throw new Error('Copy failed');
  };

  const flashButton = (el, html, duration = 2200) => {
    if (!el) return;
    if (!el.dataset.originalHtml) el.dataset.originalHtml = el.innerHTML;
    el.innerHTML = html;
    el.disabled = true;
    clearTimeout(el.flashTimer);
    el.flashTimer = setTimeout(() => {
      el.innerHTML = el.dataset.originalHtml;
      el.disabled = false;
    }, duration);
  };

  const icsEscape = value =>
    String(value).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');

  const foldLine = line => {
    const bytes = new TextEncoder().encode(line);
    if (bytes.length <= 75) return line;
    const decoder = new TextDecoder();
    const chunks = [];
    let start = 0;
    while (start < bytes.length) {
      let end = Math.min(start + 73, bytes.length);
      while (end < bytes.length && (bytes[end] & 0xc0) === 0x80) end--;
      chunks.push(decoder.decode(bytes.slice(start, end)));
      start = end;
    }
    return chunks.join('\r\n ');
  };

  const calendarFile = () => {
    const stamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    return [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Shayan and Kavya//Wedding//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      'UID:shayan-kavya-wedding-20261213@shayan-kavya',
      `DTSTAMP:${stamp}`,
      'DTSTART:20261213T053000Z',
      'DTEND:20261213T063000Z',
      'SUMMARY:Shayan & Kavya — Wedding',
      `LOCATION:${icsEscape(ADDRESS)}`,
      'DESCRIPTION:Wedding of Shayan Prakash and Kavya Das. With love and blessings\\, both families.',
      'END:VEVENT',
      'END:VCALENDAR'
    ]
      .map(foldLine)
      .join('\r\n');
  };

  const downloadCalendar = button => {
    const blob = new Blob([calendarFile()], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const download = document.createElement('a');
    download.href = url;
    download.download = 'shayan-kavya-wedding.ics';
    document.body.appendChild(download);
    download.click();
    download.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
    flashButton(button, 'Calendar saved ✓');
  };

  document.querySelectorAll('[data-add-calendar]').forEach(button => {
    button.addEventListener('click', () => downloadCalendar(button));
  });

  window.WeddingUtils = { ADDRESS, copyText, flashButton };
})();

/* ---------- Personal WhatsApp links ---------- */
(() => {
  const config = window.INVITATION_CONFIG || {};
  const number = String(config.whatsappNumber || '').replace(/\D/g, '');
  const message = config.whatsappMessage || "Hello! We're looking forward to celebrating with Shayan and Kavya.";
  const helpMessage = config.whatsappHelpMessage || 'Hi Shayan, I need help finding Sooraj Auditorium.';
  const whatsappUrl = text => `https://wa.me/${number}?text=${encodeURIComponent(text)}`;

  const link = document.getElementById('whatsapp-link');
  const helpLink = document.getElementById('travel-whatsapp');
  if (link) {
    link.href = whatsappUrl(message);
    if (!number) {
      link.title = 'Add the family WhatsApp number in config.js to direct guests to the right contact.';
    }
  }
  if (helpLink) helpLink.href = whatsappUrl(helpMessage);
})();

/* ---------- Countdown ---------- */
(() => {
  const target = new Date('2026-12-13T11:00:00+05:30');
  const kicker = document.getElementById('countdown-kicker');
  const parts = {
    days: document.getElementById('countdown-days'),
    hours: document.getElementById('countdown-hours'),
    minutes: document.getElementById('countdown-minutes'),
    seconds: document.getElementById('countdown-seconds')
  };
  if (!parts.days) return;

  const pad = value => String(value).padStart(2, '0');
  let timer;
  let previousSeconds = null;

  const render = () => {
    const remaining = target.getTime() - Date.now();
    if (remaining <= 0) {
      Object.values(parts).forEach(el => {
        el.textContent = '00';
        el.classList.remove('is-ticking');
      });
      if (kicker) kicker.textContent = 'THE DAY IS HERE';
      document.getElementById('countdown').classList.add('is-complete');
      clearInterval(timer);
      return;
    }
    const totalSeconds = Math.floor(remaining / 1000);
    const seconds = pad(totalSeconds % 60);
    parts.days.textContent = pad(Math.floor(totalSeconds / 86400));
    parts.hours.textContent = pad(Math.floor((totalSeconds % 86400) / 3600));
    parts.minutes.textContent = pad(Math.floor((totalSeconds % 3600) / 60));
    parts.seconds.textContent = seconds;

    if (previousSeconds !== null && previousSeconds !== seconds) {
      parts.seconds.classList.remove('is-ticking');
      void parts.seconds.offsetWidth;
      parts.seconds.classList.add('is-ticking');
    }
    previousSeconds = seconds;
  };

  render();
  timer = setInterval(render, 1000);
})();

/* ---------- Venue, routes, copy and calendar ---------- */
(() => {
  const utils = window.WeddingUtils || {};
  const VENUE = { lat: 11.442457, lng: 75.691581 };
  const ADDRESS = utils.ADDRESS || 'Sooraj Auditorium, Mubarak Road, Koyilandy, Kerala 673305';
  const button = document.getElementById('locate-button');
  const statusEl = document.getElementById('route-status');
  const resultEl = document.getElementById('route-result');
  const distanceEl = document.getElementById('route-distance');
  const durationEl = document.getElementById('route-duration');
  const mapEl = document.getElementById('venue-map');
  const directionsEl = document.getElementById('directions-link');
  const appleEl = document.getElementById('apple-link');
  const routeOpenEl = document.getElementById('route-open');
  const copyButton = document.getElementById('copy-address');
  if (!button || !statusEl || !resultEl) return;

  const directionsUrl = origin =>
    `https://www.google.com/maps/dir/?api=1${origin ? `&origin=${origin.lat},${origin.lng}` : ''}` +
    `&destination=${VENUE.lat},${VENUE.lng}&travelmode=driving`;

  const appleUrl = origin =>
    `https://maps.apple.com/?${origin ? `saddr=${origin.lat},${origin.lng}&` : ''}` +
    `daddr=${VENUE.lat},${VENUE.lng}&dirflg=d`;

  const applyOrigin = origin => {
    const google = directionsUrl(origin);
    directionsEl.href = google;
    if (appleEl) appleEl.href = appleUrl(origin);
    if (routeOpenEl) routeOpenEl.href = google;
  };

  applyOrigin(null);

  const setStatus = (text, state) => {
    statusEl.textContent = text;
    if (state) {
      statusEl.dataset.state = state;
    } else {
      delete statusEl.dataset.state;
    }
  };

  const formatDistance = metres => {
    if (metres < 1000) return `${Math.max(10, Math.round(metres / 10) * 10)} m`;
    return `${(metres / 1000).toFixed(metres < 10000 ? 1 : 0)} km`;
  };

  const formatDuration = seconds => {
    const minutes = Math.max(1, Math.round(seconds / 60));
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    return rest ? `${hours} hr ${rest} min` : `${hours} hr`;
  };

  const requestRoute = async (lat, lng) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 9000);
    try {
      const url =
        `https://router.project-osrm.org/route/v1/driving/` +
        `${lng},${lat};${VENUE.lng},${VENUE.lat}?overview=false`;
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) throw new Error('Routing service unavailable');
      const data = await response.json();
      if (!data.routes || !data.routes.length) throw new Error('No route found');
      return data.routes[0];
    } finally {
      clearTimeout(timeout);
    }
  };

  const showRoute = (position, route) => {
    distanceEl.textContent = formatDistance(route.distance);
    durationEl.textContent = formatDuration(route.duration);
    resultEl.hidden = false;
    applyOrigin(position);
    if (mapEl) {
      mapEl.src =
        `https://maps.google.com/maps?saddr=${position.lat},${position.lng}` +
        `&daddr=${VENUE.lat},${VENUE.lng}&z=12&output=embed`;
    }
  };

  const onSuccess = async position => {
    const origin = { lat: position.coords.latitude, lng: position.coords.longitude };
    setStatus('Location found. Calculating your route…', 'loading');
    try {
      const route = await requestRoute(origin.lat, origin.lng);
      showRoute(origin, route);
      setStatus(
        'Estimated driving time from your location. Open the route for live traffic and turn-by-turn directions.',
        'success'
      );
    } catch (error) {
      applyOrigin(origin);
      setStatus(
        'We couldn’t estimate the drive time right now. Use the directions links for live guidance.',
        'error'
      );
    } finally {
      button.disabled = false;
    }
  };

  const onError = error => {
    const messages = {
      1: 'Location access wasn’t shared. No problem — explore the map and use the directions below.',
      2: 'Your location couldn’t be determined. Use the map and directions below instead.',
      3: 'The location request timed out. Please try again or use the map and directions below.'
    };
    setStatus(messages[error.code] || messages[2], 'error');
    button.disabled = false;
  };

  if (copyButton) {
    copyButton.addEventListener('click', async () => {
      try {
        await utils.copyText(ADDRESS);
        utils.flashButton(copyButton, 'Address copied ✓');
      } catch (error) {
        utils.flashButton(copyButton, 'Copy failed');
      }
    });
  }

  if (!navigator.geolocation) {
    button.disabled = true;
    setStatus('This browser can’t share your location. Use the map and directions below instead.', 'error');
    return;
  }

  button.addEventListener('click', () => {
    button.disabled = true;
    setStatus('Finding your location…', 'loading');
    navigator.geolocation.getCurrentPosition(onSuccess, onError, {
      enableHighAccuracy: false,
      timeout: 12000,
      maximumAge: 300000
    });
  });
})();

/* ---------- Scroll, reveal and touch interactions ---------- */
(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const revealEls = Array.from(document.querySelectorAll('[data-reveal]'));

  if ('IntersectionObserver' in window && !reduceMotion.matches) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -6% 0px' }
    );
    revealEls.forEach(el => revealObserver.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  const header = document.getElementById('site-header');
  const progressBar = document.getElementById('scroll-progress-bar');
  const backToTop = document.getElementById('back-to-top');
  const navLinks = Array.from(document.querySelectorAll('.top-link'));
  const navSections = navLinks
    .map(link => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);
  let activeSection = '';

  const setActiveSection = id => {
    if (id === activeSection) return;
    activeSection = id;
    navLinks.forEach(link => {
      const matches = link.getAttribute('href') === `#${id}`;
      if (matches) {
        link.setAttribute('aria-current', 'true');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  };

  let ticking = false;
  const updateOnScroll = () => {
    ticking = false;
    const y = window.scrollY || window.pageYOffset || 0;
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;

    if (progressBar) {
      progressBar.style.width = `${scrollable > 0 ? Math.min(100, (y / scrollable) * 100) : 0}%`;
    }
    if (header) header.classList.toggle('is-stuck', y > 6);
    if (backToTop) backToTop.classList.toggle('is-visible', y > 520);

    const marker = window.innerHeight * 0.42;
    let current = '';
    navSections.forEach(section => {
      const rect = section.getBoundingClientRect();
      if (rect.top <= marker && rect.bottom > marker) current = section.id;
    });
    setActiveSection(current);
  };

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(updateOnScroll);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  updateOnScroll();

  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', event => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      event.preventDefault();
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
      target.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'start' });
      if (history.replaceState) history.replaceState(null, '', link.getAttribute('href'));
    });
  });

  const shareButton = document.getElementById('share-button');
  if (shareButton) {
    shareButton.addEventListener('click', async () => {
      const shareData = {
        title: 'Shayan & Kavya — Wedding Invitation',
        text: 'Join Shayan and Kavya on Sunday, 13 December 2026 at Sooraj Auditorium, Koyilandy.',
        url: `${location.origin}${location.pathname}`
      };
      if (navigator.share) {
        try {
          await navigator.share(shareData);
          return;
        } catch (error) {
          if (error && error.name === 'AbortError') return;
        }
      }
      try {
        await window.WeddingUtils.copyText(shareData.url);
        window.WeddingUtils.flashButton(shareButton, 'Link copied ✓');
      } catch (error) {
        window.WeddingUtils.flashButton(shareButton, 'Copy failed');
      }
    });
  }

  const hero = document.querySelector('.hero');
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)');
  if (hero && canHover.matches && !reduceMotion.matches) {
    let frame = 0;
    hero.addEventListener('pointermove', event => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const rect = hero.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        hero.style.setProperty('--hx', (x * 28).toFixed(1));
        hero.style.setProperty('--hy', (y * 20).toFixed(1));
      });
    });
    hero.addEventListener('pointerleave', () => {
      if (frame) {
        window.cancelAnimationFrame(frame);
        frame = 0;
      }
      hero.style.setProperty('--hx', '0');
      hero.style.setProperty('--hy', '0');
    });
  }
})();

/* ---------- Petals that follow a touch ---------- */
(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduceMotion.matches) return;

  const canvas = document.createElement('canvas');
  canvas.className = 'petal-layer';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let width = 0;
  let height = 0;
  let rafId = 0;
  let lastFrame = 0;
  let activePointer = null;
  let lastSpawn = 0;
  const petals = [];
  const MAX_PETALS = 150;
  const COLORS = ['#b08f5e', '#c9a3a3', '#d8c3a5', '#a98750', '#d9b7a7', '#c4b39a'];
  const random = (min, max) => min + Math.random() * (max - min);

  const resize = () => {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.max(1, Math.round(width * ratio));
    canvas.height = Math.max(1, Math.round(height * ratio));
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  };

  const createPetal = (x, y) => ({
    x,
    y,
    vx: random(-1.1, 1.1),
    vy: random(-2.4, -0.5),
    gravity: random(0.035, 0.075),
    drag: random(0.982, 0.994),
    sway: random(0.5, 1.5),
    phase: random(0, Math.PI * 2),
    rotation: random(0, Math.PI * 2),
    spin: random(-0.09, 0.09),
    size: random(4, 9),
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    life: 0,
    ttl: random(80, 140),
    flower: Math.random() < 0.24,
    renderX: x
  });

  const spawn = (x, y, count) => {
    for (let i = 0; i < count; i += 1) {
      petals.push(createPetal(x + random(-16, 16), y + random(-12, 12)));
    }
    if (petals.length > MAX_PETALS) petals.splice(0, petals.length - MAX_PETALS);
    if (!rafId) {
      lastFrame = performance.now();
      rafId = window.requestAnimationFrame(animate);
    }
  };

  const drawPetal = petal => {
    const alpha = Math.min(1, petal.life / 6) * Math.min(1, (petal.ttl - petal.life) / 18);
    if (alpha <= 0) return;
    ctx.save();
    ctx.translate(petal.renderX, petal.y);
    ctx.rotate(petal.rotation);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = petal.color;

    if (petal.flower) {
      for (let i = 0; i < 5; i += 1) {
        ctx.save();
        ctx.rotate((i * Math.PI * 2) / 5);
        ctx.beginPath();
        ctx.ellipse(0, -petal.size * 0.72, petal.size * 0.4, petal.size * 0.68, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      ctx.fillStyle = '#a98750';
      ctx.beginPath();
      ctx.arc(0, 0, petal.size * 0.2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.moveTo(0, -petal.size);
      ctx.bezierCurveTo(
        petal.size * 0.85,
        -petal.size * 0.55,
        petal.size * 0.65,
        petal.size * 0.55,
        0,
        petal.size
      );
      ctx.bezierCurveTo(
        -petal.size * 0.65,
        petal.size * 0.55,
        -petal.size * 0.85,
        -petal.size * 0.55,
        0,
        -petal.size
      );
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  };

  const animate = now => {
    const delta = Math.min(2.5, (now - lastFrame) / 16.667 || 1);
    lastFrame = now;
    ctx.clearRect(0, 0, width, height);

    for (let i = petals.length - 1; i >= 0; i -= 1) {
      const petal = petals[i];
      petal.vy += petal.gravity * delta;
      petal.vx *= petal.drag;
      petal.vy *= 0.998;
      petal.x += petal.vx * delta;
      petal.y += petal.vy * delta;
      petal.renderX = petal.x + Math.sin(petal.life * 0.055 + petal.phase) * petal.sway * 5;
      petal.rotation += petal.spin * delta;
      petal.life += delta;

      if (petal.life >= petal.ttl || petal.y > height + 40) {
        petals.splice(i, 1);
        continue;
      }
      drawPetal(petal);
    }

    if (petals.length) {
      rafId = window.requestAnimationFrame(animate);
    } else {
      rafId = 0;
      ctx.clearRect(0, 0, width, height);
    }
  };

  window.addEventListener('resize', resize, { passive: true });

  window.addEventListener(
    'pointerdown',
    event => {
      if (reduceMotion.matches || !event.isPrimary) return;
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      activePointer = event.pointerId;
      lastSpawn = performance.now();
      spawn(event.clientX, event.clientY, event.pointerType === 'mouse' ? 8 : 11);
    },
    { passive: true }
  );

  window.addEventListener(
    'pointermove',
    event => {
      if (activePointer !== event.pointerId) return;
      if (event.pointerType === 'mouse' && event.buttons === 0) {
        activePointer = null;
        return;
      }
      if (reduceMotion.matches) return;
      const now = performance.now();
      if (now - lastSpawn < 65) return;
      lastSpawn = now;
      spawn(event.clientX, event.clientY, 3);
    },
    { passive: true }
  );

  const releasePointer = event => {
    if (activePointer === event.pointerId) activePointer = null;
  };
  window.addEventListener('pointerup', releasePointer, { passive: true });
  window.addEventListener('pointercancel', releasePointer, { passive: true });
  window.addEventListener('blur', () => { activePointer = null; });

  resize();
})();
