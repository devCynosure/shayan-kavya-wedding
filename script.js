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

  const render = () => {
    const remaining = target.getTime() - Date.now();
    if (remaining <= 0) {
      Object.values(parts).forEach(el => { el.textContent = '00'; });
      if (kicker) kicker.textContent = 'THE DAY IS HERE';
      document.getElementById('countdown').classList.add('is-complete');
      clearInterval(timer);
      return;
    }
    const totalSeconds = Math.floor(remaining / 1000);
    parts.days.textContent = pad(Math.floor(totalSeconds / 86400));
    parts.hours.textContent = pad(Math.floor((totalSeconds % 86400) / 3600));
    parts.minutes.textContent = pad(Math.floor((totalSeconds % 3600) / 60));
    parts.seconds.textContent = pad(totalSeconds % 60);
  };

  render();
  timer = setInterval(render, 1000);
})();

(() => {
  const VENUE = { lat: 11.442457, lng: 75.691581 };
  const ADDRESS = 'Sooraj Auditorium, 26/169-D, Mubarak Road, Koyilandy, Panthalayini, Kozhikode, Kerala 673305';
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
  const calendarButton = document.getElementById('add-calendar');
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

  const flashButton = (el, text) => {
    if (!el.dataset.label) el.dataset.label = el.textContent;
    el.textContent = text;
    el.disabled = true;
    setTimeout(() => {
      el.textContent = el.dataset.label;
      el.disabled = false;
    }, 2200);
  };

  if (copyButton) {
    copyButton.addEventListener('click', async () => {
      try {
        await copyText(ADDRESS);
        flashButton(copyButton, 'Address copied ✓');
      } catch (error) {
        flashButton(copyButton, 'Copy failed');
      }
    });
  }

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
      while (end < bytes.length && (bytes[end] & 0xC0) === 0x80) end--;
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
    ].map(foldLine).join('\r\n');
  };

  if (calendarButton) {
    calendarButton.addEventListener('click', () => {
      const blob = new Blob([calendarFile()], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const download = document.createElement('a');
      download.href = url;
      download.download = 'shayan-kavya-wedding.ics';
      document.body.appendChild(download);
      download.click();
      download.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1500);
      flashButton(calendarButton, 'Calendar saved ✓');
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
