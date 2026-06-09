const express = require('express');
const path = require('path');
const { AsyncDeviceDiscovery, Sonos } = require('sonos');

const PORT = process.env.PORT || 3000;
// Optionally pin a speaker: SONOS_HOST=192.168.1.50 node server.js
const PINNED_HOST = process.env.SONOS_HOST;
// Optionally pick a room by name: SONOS_ROOM="Living Room" node server.js
const ROOM = process.env.SONOS_ROOM;

const app = express();
app.use(express.static(path.join(__dirname, 'public')));

let device = null;

async function getDevice() {
  if (device) return device;
  if (PINNED_HOST) {
    device = new Sonos(PINNED_HOST);
    return device;
  }
  const discovery = new AsyncDeviceDiscovery();
  if (ROOM) {
    const { devices } = await discovery.discoverMultiple({ timeout: 5000 });
    for (const d of devices) {
      const desc = await d.deviceDescription();
      if (desc.roomName.toLowerCase() === ROOM.toLowerCase()) {
        device = d;
        return device;
      }
    }
    throw new Error(`Room "${ROOM}" not found`);
  }
  device = await discovery.discover();
  return device;
}

// Reset cached device on failure so next request re-discovers
function dropDevice() {
  device = null;
}

app.get('/api/state', async (req, res) => {
  try {
    const d = await getDevice();
    const [track, state, desc] = await Promise.all([
      d.currentTrack(),
      d.getCurrentState(),
      d.deviceDescription(),
    ]);
    res.json({
      room: desc.roomName,
      playing: state === 'playing',
      title: track.title || '',
      artist: track.artist || '',
      album: track.album || '',
      albumArt: track.albumArtURL || '',
      position: track.position || 0,
      duration: track.duration || 0,
    });
  } catch (err) {
    dropDevice();
    res.status(503).json({ error: err.message });
  }
});

app.post('/api/next', async (req, res) => {
  try {
    const d = await getDevice();
    await d.next();
    res.json({ ok: true });
  } catch (err) {
    dropDevice();
    res.status(503).json({ error: err.message });
  }
});

app.post('/api/previous', async (req, res) => {
  try {
    const d = await getDevice();
    await d.previous();
    res.json({ ok: true });
  } catch (err) {
    dropDevice();
    res.status(503).json({ error: err.message });
  }
});

app.post('/api/playpause', async (req, res) => {
  try {
    const d = await getDevice();
    const state = await d.getCurrentState();
    if (state === 'playing') await d.pause();
    else await d.play();
    res.json({ ok: true });
  } catch (err) {
    dropDevice();
    res.status(503).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Sonos Display running at http://localhost:${PORT}`);
});
