# Shayan & Kavya — Wedding Invitation

A responsive, static wedding invitation website built with HTML, CSS and vanilla JavaScript.

## Preview locally

Open `index.html` in a browser. For a local server, run `python -m http.server 8000` from this folder and visit `http://localhost:8000`.

## Configure WhatsApp

Edit `config.js` and set `whatsappNumber` to the family's WhatsApp number in international format, digits only. Example format: `919876543210`. Do not add `+`, spaces or dashes. The configured family contact is the supplied Indian mobile number, stored in international format as `919400707943`. Because this number is embedded in the public website, guests who visit the site can use it to contact the family.

## Publish free with GitHub Pages

1. Create a public GitHub repository, for example `shayan-kavya-invitation`.
2. Upload the contents of this folder (keep the `assets` folder).
3. In repository Settings → Pages, choose **Deploy from a branch**, select `main` and `/ (root)`, then Save.
4. Wait for GitHub Pages to publish and use the URL shown in Settings → Pages.

Netlify alternative: create a free account, then drag this folder into Netlify's manual deploy area.

## Venue map and travel time

The "Find your way to us" section shows an embedded Google map of Sooraj Auditorium and a **Use my location** button.

- Location access is requested only after the guest taps the button.
- With permission, the browser sends the guest's coordinates to the public OSRM routing service to estimate driving distance and time. The page then updates the map and the Google Maps directions link. Nothing is stored by the site.
- Without permission, or if the route service is unavailable, guests still see the map, the full address, and written directions by train, air and road.
- Drive times are estimates only and do not account for live traffic. The directions link opens Google Maps for turn-by-turn guidance.

## Countdown

The countdown targets **11:00 AM IST on Sunday, 13 December 2026** (`2026-12-13T11:00:00+05:30`). Update the date in `index.html` (hero, details card and `<time>` element) and the target constant at the top of the countdown block in `script.js` if it changes.

## Important content verification notes

- Groom name is **Shayan Prakash**. Bride name is **Kavya Das**.
- The site currently shows **Sunday, 13 December 2026**, 11:00 AM–12:00 PM IST. The supplied source invitation shows Monday, 13 December 2021, so confirm the 2026 date with the family before publishing.
- The venue is **Sooraj Auditorium**, 26/169-D, Mubarak Road, Koyilandy, Panthalayini, Kozhikode, Kerala 673305. The map uses coordinates `11.442457, 75.691581`; confirm the precise entrance/address with the family or venue before publishing.
- The "original invitation" section is currently a **placeholder**. The earlier photograph is still at `assets/original-invitation.jpg` but is not displayed; replace the placeholder with the final scan when it is provided.
- The handwritten reception note is unclear, so reception details have deliberately not been published.
- The handwritten bride's-parent names are difficult to read and have not been included pending confirmation.
