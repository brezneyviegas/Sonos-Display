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

## How it talks to Sonos

The server controls speakers directly over their local UPnP/SOAP API (port 1400) — no Sonos account or cloud API needed. All speaker HTTP is shelled out to `curl` because macOS Local Network privacy blocks unsigned CLI binaries like `node` from reaching LAN devices, while Apple-signed `curl` is exempt. Album art is proxied through the server so the browser never needs direct speaker access.
