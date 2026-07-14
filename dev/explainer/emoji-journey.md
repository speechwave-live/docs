---
title: Emoji journey
parent: Codebase explainer
grand_parent: For developers
nav_order: 4
---

# Emoji journey

This is the core loop of the whole product: an attendee taps an emoji on their phone, and a second later it's animating on the speaker's slide. Here's how that trip actually works, from the moment the page loads to the moment it lands on Google Slides.

## How the attendee's page gets wired up

When an attendee opens <code>/t/my-talk</code>, <code>TalkLive.mount/3</code> runs twice: once for the initial HTTP render, and again once the WebSocket connects.

<div class="code-block"><span class="label">talk_live.ex</span><pre>
def mount(%{"slug" => slug}, _session, socket) do
  case Talks.get_talk_by_slug(slug) do
    nil -> {:ok, redirect(socket, to: "/")}
    talk ->
      if connected?(socket) do
        Phoenix.PubSub.subscribe(Speechwave.PubSub, "reactions:#{slug}")
        Phoenix.PubSub.subscribe(Speechwave.PubSub, "slides:#{slug}")
      end
      {:ok, assign(socket, talk: talk, emojis: @emojis, session_id: socket.id, current_slide: 0)}
  end
end
</pre></div>

<code>connected?(socket)</code> is false on the first render and true once the socket upgrades, so subscribing only when connected avoids subscribing twice. Two PubSub topics get subscribed here: <code>reactions:#{slug}</code>, which this chapter is about, and <code>slides:#{slug}</code>, covered in [Slide tracking](/dev/explainer/slide-tracking.html). An unknown slug redirects home instead of erroring. And <code>session_id: socket.id</code> gets set once here, then used throughout as the rate limiter's bucket key.

## The tap to emoji flow

<div class="stepper">
  <div class="stepper-header">
    <div class="stepper-title">Tap to emoji walkthrough</div>
    <div class="stepper-dots"></div>
  </div>
  <div class="stepper-body">
    <div class="stepper-step active">
      <div class="step-title">1. Tap</div>
      <div class="step-diagram">
        <div class="node active">Attendee's phone</div>
        <div class="arrow">→</div>
        <div class="node">TalkLive.handle_event</div>
      </div>
      <div class="step-desc"><code>phx-click="react"</code> with <code>phx-value-emoji="🔥"</code> fires over the existing WebSocket. No HTTP request involved.</div>
    </div>
    <div class="stepper-step">
      <div class="step-title">2. Rate limit check</div>
      <div class="step-diagram">
        <div class="node dim">Tap received</div>
        <div class="arrow">→</div>
        <div class="node active">RateLimiter.allow?</div>
      </div>
      <div class="step-desc">If the tap falls inside the cooldown window, it's silently dropped. No error is shown; the client-side disabled button is the only signal. See [WebSockets](/dev/explainer/websockets.html) for how the cooldown is enforced.</div>
    </div>
    <div class="stepper-step">
      <div class="step-title">3. Persist, if a session is active</div>
      <div class="step-diagram">
        <div class="node dim">Rate limit passed</div>
        <div class="arrow">→</div>
        <div class="node active">Reactions.create_reaction</div>
      </div>
      <div class="step-desc">If a talk session is currently recording, the reaction is stored with its slide number. If not, the tap still gets broadcast live, it just isn't saved for analytics later.</div>
    </div>
    <div class="stepper-step">
      <div class="step-title">4. Broadcast</div>
      <div class="step-diagram">
        <div class="node dim">Reaction handled</div>
        <div class="arrow">→</div>
        <div class="node active">Endpoint.broadcast!</div>
      </div>
      <div class="step-desc"><code>Endpoint.broadcast!("reactions:#{slug}", "new_reaction", %{emoji: emoji})</code> goes out to every subscriber on the topic, regardless of whether it's a LiveView or a Channel process.</div>
    </div>
    <div class="stepper-step">
      <div class="step-title">5. Back to the attendee</div>
      <div class="step-diagram">
        <div class="node dim">Broadcast</div>
        <div class="arrow">→</div>
        <div class="node active">EmojiStream hook</div>
      </div>
      <div class="step-desc">TalkLive's <code>handle_info/2</code> receives the broadcast and calls <code>push_event(socket, "new_reaction", %{emoji: emoji})</code>. The EmojiStream JS hook animates it client-side.</div>
    </div>
    <div class="stepper-step">
      <div class="step-title">6. Out to the speaker</div>
      <div class="step-diagram">
        <div class="node dim">Broadcast</div>
        <div class="arrow">→</div>
        <div class="node active">ReactionChannel → extension</div>
      </div>
      <div class="step-desc">ReactionChannel, joined by the extension, receives the same broadcast and pushes it over the Channel socket. The extension's content script calls <code>spawnEmoji()</code> on the slide.</div>
    </div>
  </div>
  <div class="stepper-footer">
    <div class="step-counter">Step 1 of 6</div>
    <div class="step-btns">
      <button class="btn-step btn-prev">← Previous</button>
      <button class="btn-step btn-next">Next →</button>
    </div>
  </div>
</div>

<div class="callout">
  <div class="callout-label">Why this matters</div>
  <p><code>Endpoint.broadcast!/3</code> doesn't know or care whether a subscriber is a LiveView process or a Channel process. That single fact is what keeps <code>TalkLive.handle_event</code> completely decoupled from the extension's existence. The LiveView code would work identically if the extension didn't exist at all.</p>
</div>

## Where the code lives

<ul>
  <li><a href="https://github.com/speechwave-live/speechwave/blob/main/lib/speechwave_web/live/talk_live.ex">lib/speechwave_web/live/talk_live.ex</a></li>
  <li><a href="https://github.com/speechwave-live/speechwave/blob/main/lib/speechwave/rate_limiter.ex">lib/speechwave/rate_limiter.ex</a></li>
  <li><a href="https://github.com/speechwave-live/speechwave/blob/main/lib/speechwave/reactions.ex">lib/speechwave/reactions.ex</a></li>
  <li><a href="https://github.com/speechwave-live/speechwave/blob/main/lib/speechwave/talks.ex">lib/speechwave/talks.ex</a></li>
  <li><a href="https://github.com/speechwave-live/speechwave/blob/main/lib/speechwave_web/channels/reaction_channel.ex">lib/speechwave_web/channels/reaction_channel.ex</a></li>
  <li><a href="https://github.com/speechwave-live/speechwave/blob/main/assets/js/hooks/emoji_stream.js">assets/js/hooks/emoji_stream.js</a></li>
  <li><a href="https://github.com/speechwave-live/speechwave/blob/main/assets/js/hooks/emoji_buttons.js">assets/js/hooks/emoji_buttons.js</a></li>
</ul>
