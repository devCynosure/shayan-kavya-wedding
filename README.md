# Shayan & Kavya — Wedding Invitation

A responsive, static wedding invitation website built with HTML, CSS and vanilla JavaScript.

## Preview locally

Open `index.html` in a browser. For a local server, run `python -m http.server 8000` from this folder and visit `http://localhost:8000`.

## Configure WhatsApp

Edit `config.js` and set `whatsappNumber` to the WhatsApp number in international format, digits only. Example format: `919876543210`. Do not add `+`, spaces or dashes. The configured contact is Shayan's brother on +91 94960 44825, stored in international format as `919496044825`. Because this number is embedded in the public website, guests who visit the site can use it to contact him.

`whatsappMessage` is the general greeting used by the floating **Text Shayan's brother** button. `whatsappHelpMessage` is used by the **Text Shayan's brother** button in the travel section and should mention directions or the venue.

## Publish free with GitHub Pages

1. Create a public GitHub repository, for example `shayan-kavya-invitation`.
2. Upload the contents of this folder (keep the `assets` folder).
3. In repository Settings → Pages, choose **Deploy from a branch**, select `main` and `/ (root)`, then Save.
4. Wait for GitHub Pages to publish and use the URL shown in Settings → Pages.

Netlify alternative: create a free account, then drag this folder into Netlify's manual deploy area.

## Venue map and travel time

The "Find your way to us" section gives guests several ways to find the venue:

- An embedded Google map, the full address, and links to Google Maps and Apple Maps. **Get directions** opens turn-by-turn driving directions to the venue, while **Open larger map** opens the venue's Google Maps place page.
- **Use my location** asks for permission only when tapped. With permission, the browser sends the guest's coordinates to the public OSRM routing service to estimate driving distance and time. The page then updates the route map and the directions links. Nothing is stored by the site.
- **Copy address** copies the full venue address for pasting into Uber, Ola or another maps app.
- **Add to calendar** downloads a `.ics` event for Sunday, 13 December 2026, 11:00 AM–12:00 PM IST.
- One-tap route links from Koyilandy railway station (walking), Calicut International Airport (driving) and Kozhikode city (driving).
- Written directions by train, air and road remain visible even if location access or the routing service is unavailable.
- Drive times are estimates only and do not account for live traffic. The directions links open Google Maps, Apple Maps or the guest's maps app for live, turn-by-turn guidance.

## Countdown

The countdown targets **11:00 AM IST on Sunday, 13 December 2026** (`2026-12-13T11:00:00+05:30`). Update the date in `index.html` (hero, details card and `<time>` element) and the target constant at the top of the countdown block in `script.js` if it changes.

## Scrolling and interaction

The page adds a light interaction layer on top of the invitation content:

- A sticky, softly blurred header with active-section highlighting and a **Share** button. Sharing uses the browser's native share sheet when available and falls back to copying the page link.
- A gold scroll-progress bar, plus a floating back-to-top button once the guest has scrolled down.
- Sections and cards fade or rise into view as they enter the viewport. Cards also respond on hover and touch.
- Hero buttons for **Find your way** and **Add to calendar**, and a gentle pointer parallax on the decorative flowers.
- A soft shower of petals follows each tap and drag, drawn on a transparent canvas above the page but below the controls.
- A skip link, visible keyboard focus styles, and a live region for route status messages.
- All movement is disabled automatically when the guest's device requests reduced motion.

## Important content verification notes

- Groom name is **Shayan Prakash**. Bride name is **Kavya Das**.
- The site currently shows **Sunday, 13 December 2026**, 11:00 AM–12:00 PM IST. The supplied source invitation shows Monday, 13 December 2021, so confirm the 2026 date with the family before publishing.
- The venue is **Sooraj Auditorium**, 26/169-D, Mubarak Road, Koyilandy, Panthalayini, Kozhikode, Kerala 673305. The map uses coordinates `11.442457, 75.691581`; confirm the precise entrance/address with the family or venue before publishing.
- The "original invitation" section is currently a **placeholder**. The earlier photograph is still at `assets/original-invitation.jpg` but is not displayed; replace the placeholder with the final scan when it is provided.
- The handwritten reception note is unclear, so reception details have deliberately not been published.
- The handwritten bride's-parent names are difficult to read and have not been included pending confirmation.
