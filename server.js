const express = require('express');
const path = require('path');
const sonos = require('./sonos-curl');

const PORT = process.env.PORT || 3000;
// Speaker IP. Find yours in the Sonos app: Settings -> System -> About My System.
const HOST = process.env.SONOS_HOST || '192.168.5.242';

const app = express();
app.use(express.static(path.join(__dirname, 'public')));

let roomName = '';
sonos.getRoomName(HOST).then(name => { roomName = name; }).catch(() => {});

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
