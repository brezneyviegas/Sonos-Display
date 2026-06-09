// Minimal Sonos UPnP/SOAP client that shells out to curl for all HTTP.
// Used instead of node's http stack because macOS Local Network privacy
// blocks unsigned CLI binaries (node) while Apple-signed curl is exempt.
const { execFile } = require('child_process');

function curl(args, { binary = false } = {}) {
  return new Promise((resolve, reject) => {
    execFile('curl', ['-s', '--max-time', '5', ...args], {
      encoding: binary ? 'buffer' : 'utf8',
      maxBuffer: 20 * 1024 * 1024,
    }, (err, stdout) => {
      if (err) reject(new Error(`curl failed: ${err.message}`));
      else resolve(stdout);
    });
  });
}

function soap(host, action, body) {
  const envelope =
    '<?xml version="1.0" encoding="utf-8"?>' +
    '<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" ' +
    's:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/"><s:Body>' +
    `<u:${action} xmlns:u="urn:schemas-upnp-org:service:AVTransport:1">` +
    `<InstanceID>0</InstanceID>${body || ''}</u:${action}>` +
    '</s:Body></s:Envelope>';
  return curl([
    `http://${host}:1400/MediaRenderer/AVTransport/Control`,
    '-H', `SOAPACTION: "urn:schemas-upnp-org:service:AVTransport:1#${action}"`,
    '-H', 'Content-Type: text/xml; charset=utf-8',
    '--data-binary', envelope,
  ]);
}

function tag(xml, name) {
  const m = xml.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`));
  return m ? m[1] : '';
}

function decodeEntities(s) {
  return s
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(n))
    .replace(/&amp;/g, '&');
}

function hmsToSeconds(hms) {
  const parts = (hms || '').split(':').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return 0;
  return parts[0] * 3600 + parts[1] * 60 + parts[2];
}

async function getRoomName(host) {
  const xml = await curl([`http://${host}:1400/xml/device_description.xml`]);
  return tag(xml, 'roomName');
}

async function getState(host) {
  const [posXml, infoXml] = await Promise.all([
    soap(host, 'GetPositionInfo'),
    soap(host, 'GetTransportInfo'),
  ]);
  // Track metadata is DIDL-Lite XML, entity-escaped inside the SOAP response
  const didl = decodeEntities(tag(posXml, 'TrackMetaData'));
  let albumArt = decodeEntities(tag(didl, 'upnp:albumArtURI'));
  if (albumArt && albumArt.startsWith('/')) {
    albumArt = `http://${host}:1400${albumArt}`;
  }
  return {
    playing: tag(infoXml, 'CurrentTransportState') === 'PLAYING',
    title: decodeEntities(tag(didl, 'dc:title')),
    artist: decodeEntities(tag(didl, 'dc:creator')),
    album: decodeEntities(tag(didl, 'upnp:album')),
    albumArt,
    position: hmsToSeconds(tag(posXml, 'RelTime')),
    duration: hmsToSeconds(tag(posXml, 'TrackDuration')),
  };
}

const next = host => soap(host, 'Next');
const previous = host => soap(host, 'Previous');
const play = host => soap(host, 'Play', '<Speed>1</Speed>');
const pause = host => soap(host, 'Pause');

// Fetch album art bytes through curl so the browser never needs
// local-network access to the speaker itself.
async function fetchArt(url) {
  const u = new URL(url);
  if (u.protocol !== 'http:' && u.protocol !== 'https:') {
    throw new Error('Bad art URL');
  }
  return curl([url], { binary: true });
}

module.exports = { getRoomName, getState, next, previous, play, pause, fetchArt };
