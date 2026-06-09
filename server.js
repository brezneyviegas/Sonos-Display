const express = require('express');
const path = require('path');
const sonos = require('./sonos-curl');

const PORT = process.env.PORT || 3000;
// Initial speaker IP. Find yours in the Sonos app: Settings -> System -> About My System.
let HOST = process.env.SONOS_HOST || '192.168.5.242';

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

let roomName = '';
sonos.getRoomName(HOST).then(name => { roomName = name; }).catch(() => {});

app.get('/api/speakers', async (req, res) => {
  try {
    const speakers = await sonos.listSpeakers(HOST);
    res.json({ current: HOST, speakers });
  } catch (err) {
    res.status(503).json({ error: err.message });
  }
});

app.post('/api/speaker', async (req, res) => {
  try {
    const host = String(req.body.host || '');
    // Only allow hosts that the topology actually reports
    const speakers = await sonos.listSpeakers(HOST);
    const target = speakers.find(s => s.host === host);
    if (!target) return res.status(400).json({ error: 'Unknown speaker' });
    HOST = target.host;
    roomName = target.room;
    res.json({ ok: true, room: roomName });
  } catch (err) {
    res.status(503).json({ error: err.message });
  }
});

app.get('/api/state', async (req, res) => {
  try {
    const state = await sonos.getState(HOST);
    if (state.albumArt) {
      state.albumArt = '/api/art?u=' + encodeURIComponent(state.albumArt);
    }
    res.json({ room: roomName, ...state });
  } catch (err) {
    res.status(503).json({ error: err.message });
  }
});

// Proxy album art so the browser only ever talks to this server
app.get('/api/art', async (req, res) => {
  try {
    const buf = await sonos.fetchArt(req.query.u);
    res.set('Cache-Control', 'max-age=3600').type('image/jpeg').send(buf);
  } catch (err) {
    res.status(502).end();
  }
});

for (const [route, fn] of [
  ['next', sonos.next],
  ['previous', sonos.previous],
]) {
  app.post(`/api/${route}`, async (req, res) => {
    try {
      await fn(HOST);
      res.json({ ok: true });
    } catch (err) {
      res.status(503).json({ error: err.message });
    }
  });
}

app.get('/api/volume', async (req, res) => {
  try {
    res.json({ volume: await sonos.getVolume(HOST) });
  } catch (err) {
    res.status(503).json({ error: err.message });
  }
});

// Relative adjust done server-side so concurrent swipes can't race a stale
// client-cached value
app.post('/api/volume/adjust', async (req, res) => {
  try {
    const delta = Number(req.body.delta) || 0;
    const current = await sonos.getVolume(HOST);
    const target = Math.max(0, Math.min(100, current + delta));
    if (target !== current) await sonos.setVolume(HOST, target);
    res.json({ volume: target });
  } catch (err) {
    res.status(503).json({ error: err.message });
  }
});

app.post('/api/playpause', async (req, res) => {
  try {
    const { playing } = await sonos.getState(HOST);
    await (playing ? sonos.pause(HOST) : sonos.play(HOST));
    res.json({ ok: true });
  } catch (err) {
    res.status(503).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Sonos Display running at http://localhost:${PORT} (speaker: ${HOST})`);
});
