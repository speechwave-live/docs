---
title: Chrome extension
parent: Codebase explainer
grand_parent: For developers
nav_order: 11
---

# Chrome extension

The Chrome extension is what turns a broadcast reaction into an emoji floating across a slide. It lives in its own repository, <a href="https://github.com/speechwave-live/chrome-extension">speechwave-live/chrome-extension</a>, and it's built as three cooperating pieces rather than one script.

<div class="arch-diagram">
  <div class="arch-node">
    <span class="arch-node-emoji">🎛️</span>
    <span class="arch-node-label">Popup</span>
  </div>
  <div class="arch-arrow"><span class="arch-arrow-line">→</span></div>
  <div class="arch-node highlight">
    <span class="arch-node-emoji">⚙️</span>
    <span class="arch-node-label">Background worker</span>
  </div>
  <div class="arch-arrow"><span class="arch-arrow-line">↔</span></div>
  <div class="arch-node">
    <span class="arch-node-emoji">🖥️</span>
    <span class="arch-node-label">Phoenix server</span>
  </div>
</div>
<div class="arch-diagram">
  <div class="arch-node highlight">
    <span class="arch-node-emoji">⚙️</span>
    <span class="arch-node-label">Background worker</span>
  </div>
  <div class="arch-arrow"><span class="arch-arrow-line">→</span></div>
  <div class="arch-node">
    <span class="arch-node-emoji">📄</span>
    <span class="arch-node-label">Content script</span>
  </div>
  <div class="arch-arrow"><span class="arch-arrow-line">→</span></div>
  <div class="arch-node">
    <span class="arch-node-emoji">🎉</span>
    <span class="arch-node-label">Overlay on slide</span>
  </div>
</div>

<div class="two-col">
  <div class="info-card">
    <div class="info-card-label">Popup</div>
    <p><code>popup.html</code> and <code>popup.js</code>. The speaker enters a talk slug and API key here, validated client-side as long hex string. Everything the speaker does gets sent to the background worker, not straight to the content script.</p>
  </div>
  <div class="info-card">
    <div class="info-card-label">Content script</div>
    <p><code>content.js</code>, injected into Google Slides pages. Renders the emoji overlay, polls the current slide (see <a href="/dev/explainer/slide-tracking.html">Slide tracking</a>), and toggles fireworks. It owns no socket connection of its own.</p>
  </div>
</div>

## The background service worker does the heavy lifting

<code>background/background.js</code> owns the Phoenix Socket and Channel connection for the extension's entire lifetime, not just for one open tab. It:

- Connects to <code>wss://speechwave.live/socket</code>
- Joins <code>reactions:${slug}</code> with the API key
- Relays incoming <code>new_reaction</code> events to every open Google Slides tab via <code>chrome.tabs.sendMessage</code>
- Relays <code>start_session</code>, <code>stop_session</code>, and <code>slide_changed</code> messages on behalf of the popup and content script

Because Chrome can kill and restart a Manifest V3 service worker independently of any open tab, the background worker has explicit reconnect and rejoin logic, and it guards against acting on a stale socket left over from before a restart.

## Fireworks animation

When enough reactions of the same emoji land in a short window, the content script triggers a fireworks burst instead of just the usual float animation.

<div class="collapsible">
  <div class="collapsible-trigger"><span class="collapsible-icon">▶</span> Why the compound trigger condition?</div>
  <div class="collapsible-body">
    <p>Fireworks fire when an emoji's in-flight count crosses a minimum threshold <em>and</em> that emoji makes up a large enough share of everything currently animating. Requiring both conditions means a single emoji spamming the screen triggers fireworks, but a big mixed burst of many different emojis doesn't, since no single emoji dominates it.</p>
    <p>A global cooldown keeps it to one burst at a time, and in-flight counts are tracked by incrementing on spawn and decrementing when the animation ends, so the count naturally settles as animations finish. The trigger logic is extracted into a pure function in <code>lib/fireworks.js</code>, dual-exported for both Jest and the browser, the same pattern used by the extension's adapter modules.</p>
    <p>The burst itself renders sixteen particles using the Web Animations API rather than CSS keyframes, because each particle needs its own computed target position, something plain CSS keyframes can't parameterize per element. A safety timeout resets the "fireworks active" flag a couple of seconds later, in case an animation-end event doesn't fire, for example if the overlay gets re-parented mid-transition.</p>
  </div>
</div>

The speaker can turn fireworks off from a popup checkbox, which is written to <code>chrome.storage.sync</code> and read back by the content script on load, so the preference survives reloads.

## Fullscreen re-parenting

Google Slides fullscreen mode creates a new stacking context, which makes a <code>position: fixed</code> overlay attached to <code>&lt;body&gt;</code> invisible. The extension handles this by re-parenting the overlay element into the fullscreen element on <code>fullscreenchange</code>, and moving it back to <code>&lt;body&gt;</code> on exit.

## Where the code lives

All of this lives in the separate chrome-extension repository:

<ul>
  <li><a href="https://github.com/speechwave-live/chrome-extension/blob/main/background/background.js">background/background.js</a></li>
  <li><a href="https://github.com/speechwave-live/chrome-extension/blob/main/adapters/google_slides.js">adapters/google_slides.js</a></li>
  <li><a href="https://github.com/speechwave-live/chrome-extension/blob/main/adapters/index.js">adapters/index.js</a></li>
  <li><a href="https://github.com/speechwave-live/chrome-extension/blob/main/lib/fireworks.js">lib/fireworks.js</a></li>
  <li><a href="https://github.com/speechwave-live/chrome-extension/blob/main/lib/phoenix.js">lib/phoenix.js</a></li>
  <li><a href="https://github.com/speechwave-live/chrome-extension/blob/main/content/content.js">content/content.js</a></li>
  <li><a href="https://github.com/speechwave-live/chrome-extension/blob/main/popup/popup.js">popup/popup.js</a></li>
  <li><a href="https://github.com/speechwave-live/chrome-extension/blob/main/manifest.json">manifest.json</a></li>
</ul>
