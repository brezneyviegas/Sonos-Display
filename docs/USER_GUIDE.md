# Sonos Display — User Guide

![Sonos Display showing the currently playing track](screenshot.png)

## Starting the app

```bash
npm install   # first time only
npm start
```

Open http://localhost:3000 in a browser. The display works best fullscreen
(press `F11`, or `⌃⌘F` on macOS).

By default the server connects to the speaker IP baked into `server.js`. To
start on a different speaker:

```bash
SONOS_HOST=192.168.1.50 npm start
```

The startup speaker only matters for the first connection — you can switch
rooms from the UI at any time.

## The display

| Element | Meaning |
|---------|---------|
| Top center label | Room currently being displayed/controlled |
| Large image | Album art for the current track (also blurred as backdrop) |
| Large text | Track title |
| Smaller text | Artist — Album |
| Thin bar at the bottom | Progress through the current track |
| Bottom text | Shows "Paused — tap center to play" when paused |

The display refreshes every 2 seconds, so changes made from the Sonos app or
by other people in the house appear automatically.

## Controls

### Skipping tracks

The screen is split into three invisible click zones:

```
+-----------+-----------+-----------+
|           |           |           |
|  ◀ PREV   |  PLAY /   |   NEXT ▶  |
|  (left    |  PAUSE    |   (right  |
|   35%)    |  (center) |    35%)   |
|           |           |           |
+-----------+-----------+-----------+
```

- **Click the left side** — previous track
- **Click the right side** — next track
- **Click the center** — toggle play/pause

Hover near an edge and an arrow fades in to show the zone.

### Volume

**Swipe up or down with two fingers** anywhere on the screen:

- Swipe **up** — volume up
- Swipe **down** — volume down

A vertical volume bar appears on the right edge while adjusting and fades
out after a moment. On a touchscreen, use a two-finger vertical drag.

> The swipe direction assumes macOS "natural scrolling". Volume changes are
> applied to the live speaker volume, so they play nicely with adjustments
> made from the Sonos app at the same time.

### Switching speakers

**Click the room name** at the top of the screen. A panel opens listing
every room in your Sonos household:

- The current room is highlighted with a checkmark
- Grouped rooms show their members (e.g. "Garden Room *+ Kitchen*")
- Click any room to switch the display and all controls to it
- Click outside the panel or press `Esc` to close it

Controls always target the group coordinator, so skipping or changing
volume on a grouped room affects the whole group correctly. Bonded devices
(Subs, surround speakers) are hidden — they aren't independently
controllable.

### Keyboard shortcuts

| Key | Action |
|-----|--------|
| `←` | Previous track |
| `→` | Next track |
| `Space` | Play / pause |
| `Esc` | Close the speaker picker |

## Troubleshooting

**"No Sonos found" / errors on screen** — the server can't reach the
speaker. Check the Mac is on the same network as your Sonos system, and
that the speaker IP is current (IPs can change after router reboots; find
the new one in the Sonos app under Settings → System → About My System and
restart with `SONOS_HOST=<new ip>`).

**Volume swipe feels inverted** — the direction is tuned for macOS natural
scrolling. If you've disabled natural scrolling, swipes will feel reversed.

**Nothing playing** — the display shows "Nothing playing" when the speaker
is stopped. Start something from the Sonos app or any music service, or tap
the center of the screen to resume the queue.
