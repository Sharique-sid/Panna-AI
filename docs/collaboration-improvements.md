# Panna.ai Collaboration — Improvement Plan
> How to make it smooth like Excalidraw / Google Docs

---

## Current State (What We Have)

- Real-time text editing via Supabase Realtime broadcast
- Live cursors with color-coded names
- Shared sticky notes with drag
- Shared whiteboard with pen + line tools
- Guest access (no auth required)

**Core problem:** The implementation works but feels choppy because:
1. Cursor broadcasts fire on every single mouse pixel movement (60+ events/sec)
2. Every card/whiteboard change broadcasts the entire array
3. Canvas drawings are never saved — lost on refresh
4. No conflict resolution — simultaneous edits fight each other
5. No undo/redo

---

## Priority 1 — Fix What Makes It Feel Broken (Do First)

### 1.1 Throttle Cursor Broadcasts
**Problem:** Mouse move fires 60+ events/sec with no throttle. Kills performance.

**Fix:** Throttle cursor broadcasts to 30ms (≈33fps — smooth but not wasteful).

```ts
// In handleMouseMove
const lastCursorBroadcast = useRef(0);

const handleMouseMove = (e) => {
  const now = Date.now();
  if (now - lastCursorBroadcast.current < 30) return; // throttle to ~33fps
  lastCursorBroadcast.current = now;
  // ... broadcast cursor
};
```

**Impact:** 90% reduction in cursor events. Immediately smoother for everyone.

---

### 1.2 Smooth Cursor Interpolation (CSS Transitions)
**Problem:** Remote cursors teleport to new positions instead of gliding.

**Fix:** Add CSS transition to cursor elements.

```css
.remote-cursor {
  transition: transform 80ms linear;
  /* or use left/top with transition */
}
```

**Impact:** Cursors glide smoothly like in Figma/Excalidraw — the single biggest visual upgrade.

---

### 1.3 Save Canvas Drawings to Database
**Problem:** Whiteboard drawings are lost on page refresh. Supabase receives `data: ""`.

**Fix:** On draw stop, serialize the canvas to base64 and save to a `whiteboard_data` column (or store in the note's content as JSON).

```ts
// After stopDrawing()
const dataUrl = canvasRef.current.toDataURL('image/png');
// save to DB — either a separate table or note metadata
```

Or better: store whiteboards as JSON in a `collaborate_data` JSONB column on notes.

**Impact:** Drawings persist. Users can come back and continue work.

---

### 1.4 Debounce Card Content Broadcasts
**Problem:** Card content broadcasts on every keystroke with no debounce.

**Fix:** Debounce card content sync to 150ms (fast enough to feel live, slow enough to batch).

```ts
const debouncedCardSync = useDebouncedCallback((updatedCards) => {
  channel.send({ type: 'broadcast', event: 'card_update', payload: { cards: updatedCards } });
}, 150);
```

**Impact:** Reduces card sync events by ~10x during typing.

---

## Priority 2 — Big UX Upgrades (Do Second)

### 2.1 Undo / Redo (Most Requested Feature)
**Problem:** No undo. One mistake and you can't go back.

**Fix:** Maintain a local history stack. On `Ctrl+Z`, revert and broadcast the reverted state.

```ts
const history = useRef<string[]>([]);
const historyIndex = useRef(0);

// On content change, push to history
// On Ctrl+Z, pop from history and broadcast
```

This is local undo (each user has their own undo stack). Good enough for v1.

**Impact:** Makes the editor feel professional. This is table stakes for any editor.

---

### 2.2 Awareness Indicators (Who's Where)
**Problem:** You can't tell what part of the document your collaborators are reading/editing.

**Fix:** Show colored dots next to the user list indicating their current section (top/middle/bottom of doc), and a small "X is editing this section" tooltip near their cursor.

Also show an **online users panel** in the toolbar:
```
🟢 Sham  🟢 Ali  🟡 Guest
```

**Impact:** Feels like Google Docs. Users know who's active and where.

---

### 2.3 Infinite Whiteboard (Replace Fixed Canvas)
**Problem:** Whiteboard is a fixed 600×400px box. Feels cramped.

**Fix:** Use a CSS `transform: scale()` + pan approach on the canvas. No library needed.

- Scroll to zoom in/out
- Middle-click/space+drag to pan
- Canvas internally stays large (e.g. 4000×4000)
- Viewport is a windowed view

**Impact:** Feels like a real whiteboard. This alone makes it 10x more useful.

---

### 2.4 More Drawing Tools
**Problem:** Only pen and line. No shapes.

**Fix (minimal effort):** Add rectangle and circle tools using canvas `strokeRect` and `arc`.

```ts
// Rectangle
ctx.strokeRect(startX, startY, width, height);

// Circle
ctx.beginPath();
ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
ctx.stroke();
```

**Impact:** 4 tools total (pen, line, rect, circle). Covers 90% of whiteboard use cases.

---

### 2.5 Touch Support for Whiteboard
**Problem:** Whiteboard drawing doesn't work on mobile/tablet. No touch events.

**Fix:** Add `onTouchStart`, `onTouchMove`, `onTouchEnd` handlers alongside mouse events.

```ts
const getTouchPos = (e: TouchEvent) => ({
  x: e.touches[0].clientX - canvasRect.left,
  y: e.touches[0].clientY - canvasRect.top,
});
```

**Impact:** Works on iPad. Huge for actual whiteboarding sessions.

---

## Priority 3 — Architecture Improvements (Do Eventually)

### 3.1 Switch to CRDT for Text Editing (Yjs)
**Problem:** Currently uses full-state broadcast. Two users typing simultaneously = last-write-wins. One user's changes get deleted.

**Fix:** Integrate [Yjs](https://yjs.dev) with `y-supabase` provider.

```ts
import * as Y from 'yjs';
import { SupabaseProvider } from 'y-supabase';

const ydoc = new Y.Doc();
const provider = new SupabaseProvider(ydoc, supabase, { channel: `note-${noteId}` });
const ytext = ydoc.getText('content');
```

Yjs handles conflict resolution automatically — two people editing the same word = both changes merged intelligently.

**Impact:** Rock-solid collaboration. No more "my changes got deleted". This is what Google Docs uses.

**Effort:** Medium. Requires rethinking the editor binding, but Yjs has good docs.

---

### 3.2 Operational Transforms for Sticky Notes
**Problem:** Two users moving the same card = position conflict.

**Fix (simpler than Yjs):** Use a "last-write-wins with timestamp" strategy. Include `updatedAt` timestamp in broadcasts. Only apply remote position if `remote.updatedAt > local.updatedAt`.

```ts
if (remoteCard.updatedAt > localCard.updatedAt) {
  applyRemotePosition(remoteCard);
}
```

**Impact:** No more sticky note jumping when two users interact with same card.

---

### 3.3 Differential Updates (Patch-Based Sync)
**Problem:** Every change broadcasts the full `cards` array. With 20 cards, you're sending all 20 every time one changes.

**Fix:** Only broadcast what changed.

```ts
// Instead of:
{ event: 'card_update', payload: { cards: allCards } }

// Send:
{ event: 'card_patch', payload: { id: cardId, x: newX, y: newY } }
```

**Impact:** Massive bandwidth reduction at scale.

---

### 3.4 Reconnection & Offline Queue
**Problem:** If a user loses connection, changes are lost. No indicator of disconnection.

**Fix:**
1. Show a "Reconnecting..." banner when Supabase channel status changes to `CLOSED`
2. Queue changes locally while disconnected
3. On reconnect, flush the queue

```ts
channel.subscribe((status) => {
  if (status === 'CLOSED') showReconnecting();
  if (status === 'SUBSCRIBED') flushQueue();
});
```

---

## Implementation Order (Recommended)

```
Week 1 — Feel Fixes (small, big impact):
  ✅ 1.1 Throttle cursor broadcasts (30 min)
  ✅ 1.2 CSS cursor transitions (15 min)
  ✅ 1.4 Debounce card sync (20 min)
  ✅ 2.2 Online users panel (1 hour)

Week 2 — Feature Upgrades:
  ✅ 1.3 Persist canvas to DB (2 hours)
  ✅ 2.1 Undo/Redo (3 hours)
  ✅ 2.4 Rectangle + Circle tools (1 hour)
  ✅ 2.5 Touch support (1 hour)

Week 3 — Big Architecture:
  ✅ 2.3 Infinite whiteboard (4 hours)
  ✅ 3.2 Timestamp-based conflict resolution (2 hours)
  ✅ 3.3 Differential patch updates (2 hours)

Future:
  ⏳ 3.1 Yjs CRDT integration (1-2 days)
  ⏳ 3.4 Offline queue (1 day)
```

---

## Quick Wins Summary (Biggest Bang for Effort)

| Fix | Effort | Impact |
|-----|--------|--------|
| Throttle cursor broadcasts | 30 min | ⭐⭐⭐⭐⭐ |
| CSS cursor transitions | 15 min | ⭐⭐⭐⭐⭐ |
| Persist canvas drawings | 2 hrs | ⭐⭐⭐⭐ |
| Undo/Redo | 3 hrs | ⭐⭐⭐⭐ |
| Online users panel | 1 hr | ⭐⭐⭐⭐ |
| Rectangle + Circle tools | 1 hr | ⭐⭐⭐ |
| Infinite whiteboard | 4 hrs | ⭐⭐⭐⭐⭐ |
| Yjs CRDT | 2 days | ⭐⭐⭐⭐⭐ |

---

*The fastest path to "smooth like butter" is: throttle cursors + CSS transitions + undo/redo. Those three changes alone will make it feel completely different.*
