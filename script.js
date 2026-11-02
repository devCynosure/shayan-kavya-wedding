(() => {
  const link = document.getElementById('whatsapp-link');
  const config = window.INVITATION_CONFIG || {};
  const number = String(config.whatsappNumber || '').replace(/\D/g, '');
  const message = config.whatsappMessage || "Hello! We're looking forward to celebrating with Shayan and Kavya.";
  if (number) {
    link.href = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
  } else {
    link.href = `https://wa.me/?text=${encodeURIComponent(message)}`;
    link.title = 'Add the family WhatsApp number in config.js to direct guests to the right contact.';
  }
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
  const button = document.getElementById('locate-button');
  const statusEl = document.getElementById('route-status');
  const resultEl = document.getElementById('route-result');
  const distanceEl = document.getElementById('route-distance');
  const durationEl = document.getElementById('route-duration');
  const mapEl = document.getElementById('venue-map');
  const directionsEl = document.getElementById('directions-link');
  if (!button || !statusEl || !resultEl) return;

  const directionsUrl = origin =>
    `https://www.google.com/maps/dir/?api=1${origin ? `&origin=${origin.lat},${origin.lng}` : ''}` +
    `&destination=${VENUE.lat},${VENUE.lng}&travelmode=driving`;

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
    directionsEl.href = directionsUrl(position);
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
        'Estimated driving time from your location. Open Google Maps for live traffic and turn-by-turn directions.',
        'success'
      );
    } catch (error) {
      directionsEl.href = directionsUrl(origin);
      setStatus(
        'We couldn’t estimate the drive time right now. Use the directions link for live guidance.',
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
