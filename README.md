# Dynamic

An iPhone-first mobility PWA. The static app is in `dist/`.

## Run locally

From this folder, run `python -m http.server 4173 --bind 127.0.0.1 --directory dist`, then open `http://127.0.0.1:4173`.

For iPhone installation, serve `dist/` over HTTPS and use Safari's **Add to Home Screen** action. Open the app online once to cache the routines. Session history, duration and reminder preferences are stored on the current device. Reminders appear while Dynamic is open.
