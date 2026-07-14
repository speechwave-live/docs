---
title: Slide tracking
parent: Codebase explainer
grand_parent: For developers
nav_order: 6
---

# Slide tracking

Every reaction gets tagged with a slide number, so a speaker can later see which slide got the biggest reaction. That number comes from a parallel data path, separate from the emoji tap itself: the extension watches the slide deck, reports changes up to the server, and the server broadcasts the current slide back down to the attendee's page.

## The adapter registry

Different presentation tools expose the current slide number differently, so the extension picks an adapter based on the page URL.

<div class="code-block"><span class="label">adapters/index.js</span>
function getAdapter(url) {
  if (url.includes("docs.google.com/presentation")) return GoogleSlidesAdapter;
  return { getSlide: () => 0 };  // fallback for unknown platforms
}
</div>

<div class="collapsible">
  <div class="collapsible-trigger"><span class="collapsible-icon">▶</span> How the Google Slides adapter reads the slide number</div>
  <div class="collapsible-body">
    <p>The Google Slides adapter reads the slide number from an accessibility element's <code>aria-label</code>, searching both the main document and any accessible same-origin iframes:</p>
    <div class="code-block"><span class="label">adapters/google_slides.js</span>
const el = doc.querySelector('.punch-viewer-svgpage-a11yelement[aria-label*="Slide"]');
// aria-label matches /^Slide (\d+)/
    </div>
    <p>That accessibility element only exists once the slideshow is actually running, in fullscreen or windowed presentation mode. It isn't present in the Slides editor view, so slide tracking does nothing until the speaker actually starts presenting.</p>
    <p>This approach is inherently a little brittle, since it depends on Google's DOM structure rather than a first-party API, but it's the only option available. Fixture-based Jest tests snapshot the relevant DOM so a Google-side change gets caught before it ships.</p>
  </div>
</div>

## Polling, not watching

The content script polls the adapter on an interval and reports changes up to the background worker, rather than pushing straight to the Channel.

<div class="code-block"><span class="label">content.js</span>
function checkSlide() {
  const slide = adapter.getSlide();
  if (slide !== currentSlide) {
    currentSlide = slide;
    chrome.runtime.sendMessage({ type: "SLIDE_CHANGED", slide: currentSlide }, () => {
      void chrome.runtime.lastError;
    });
  }
}
checkSlide();
slideInterval = setInterval(checkSlide, 500);
</div>

The background worker is the one that actually pushes to the channel, with <code>channel.push('slide_changed', { slide: currentSlide })</code>, and it also tells the popup, which shows the current slide number live. That popup readout doubles as a sanity check that the adapter is actually reading the deck correctly.

## Server-side handling

<div class="code-block"><span class="label">reaction_channel.ex</span>
def handle_in("slide_changed", %{"slide" => slide}, socket)
    when is_integer(slide) and slide > 0 do
  SpeechwaveWeb.Endpoint.broadcast!("slides:#{socket.assigns.talk.slug}", "slide_changed", %{slide: slide})
  {:reply, :ok, socket}
end
</div>

Slide <code>0</code> is the sentinel for unknown, so the guard means it's never broadcast; a second clause just acknowledges it without broadcasting. <code>TalkLive</code> subscribes to the <code>slides:#{slug}</code> topic (see the mount walkthrough in [Emoji journey](/dev/explainer/emoji-journey.html)) and updates its <code>current_slide</code> assign, so the next reaction tap carries the right slide number. There's a small, natural lag between a slide change and the first reaction tagged with it, which is expected given the polling interval.

## Where the code lives

<ul>
  <li>chrome-extension repo: <a href="https://github.com/speechwave-live/chrome-extension/blob/main/adapters/index.js">adapters/index.js</a>, <a href="https://github.com/speechwave-live/chrome-extension/blob/main/adapters/google_slides.js">adapters/google_slides.js</a>, <a href="https://github.com/speechwave-live/chrome-extension/blob/main/content/content.js">content/content.js</a>, <a href="https://github.com/speechwave-live/chrome-extension/blob/main/background/background.js">background/background.js</a></li>
  <li><a href="https://github.com/speechwave-live/speechwave/blob/main/lib/speechwave_web/channels/reaction_channel.ex">lib/speechwave_web/channels/reaction_channel.ex</a></li>
  <li><a href="https://github.com/speechwave-live/speechwave/blob/main/lib/speechwave_web/live/talk_live.ex">lib/speechwave_web/live/talk_live.ex</a></li>
</ul>
