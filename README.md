# Sonos-Display

A fullscreen web display for the currently playing Sonos track. Click the left side of the screen for the previous track, the right side for the next track, and the center to play/pause.

![Sonos Display showing the currently playing track](docs/screenshot.png)

## Features

- Album art with blurred backdrop, track title, artist, and album
- Click zones: left = previous, right = next, center = play/pause
- Two-finger swipe up/down to change volume
- Click the room name to switch between any speaker in the house
- Keyboard: ← previous, → next, space play/pause
- Progress bar along the bottom

See the [User Guide](docs/USER_GUIDE.md) for full usage details.

## Run

```bash
npm install
npm start
```

Then open http://localhost:3000.

## Options

| Env var | Purpose | Example |
|---------|---------|---------|
| `PORT` | Server port (default 3000) | `PORT=8080 npm start` |
| `SONOS_HOST` | IP of the speaker to connect to at startup | `SONOS_HOST=192.168.1.50 npm start` |

Find a speaker's IP in the Sonos app under Settings → System → About My System. Once running you can switch rooms from the UI by clicking the room name, so the startup IP just needs to be any speaker in the household.

## Docker / ZimaOS

```bash
git clone https://github.com/brezneyviegas/Sonos-Display.git
cd Sonos-Display
# edit SONOS_HOST in docker-compose.yml to one of your speaker IPs
docker compose up -d --build
```

Then open `http://<host-ip>:3000`.

**On ZimaOS:** SSH into the box (or use the web terminal), run the commands
above, and the container appears under Docker apps. Alternatively use the
dashboard: App Store → ⋮ → *Install a customized app* → *Import* and paste
the contents of `docker-compose.yml`, replacing `build: .` with a prebuilt
image if you've pushed one to a registry. The container only needs outbound
HTTP to the speakers on port 1400, so the default bridge network works —
just make sure `SONOS_HOST` points at a speaker on the same LAN.

Note for macOS: Docker Desktop traffic is subject to the same Local Network
privacy gate described below, so testing the container on a Mac may fail to
reach speakers even when the image is fine.

## How it talks to Sonos

The server controls speakers directly over their local UPnP/SOAP API (port 1400) — no Sonos account or cloud API needed. All speaker HTTP is shelled out to `curl` because macOS Local Network privacy blocks unsigned CLI binaries like `node` from reaching LAN devices, while Apple-signed `curl` is exempt. Album art is proxied through the server so the browser never needs direct speaker access.
