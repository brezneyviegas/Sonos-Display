# Sonos-Display

A fullscreen web display for the currently playing Sonos track. Click the left side of the screen for the previous track, the right side for the next track, and the center to play/pause.

## Features

- Album art with blurred backdrop, track title, artist, and album
- Click zones: left = previous, right = next, center = play/pause
- Keyboard: ← previous, → next, space play/pause
- Progress bar along the bottom
- Auto-discovers your Sonos speaker on the local network

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
| `SONOS_HOST` | Skip discovery, use a specific speaker IP | `SONOS_HOST=192.168.1.50 npm start` |
| `SONOS_ROOM` | Pick a speaker by room name | `SONOS_ROOM="Living Room" npm start` |

Discovery uses SSDP multicast, so the server must run on the same network as your Sonos speakers. If discovery fails (e.g. due to a firewall or VPN), find your speaker's IP in the Sonos app under Settings → System → About My System and set `SONOS_HOST`.
