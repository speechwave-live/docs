---
title: Overview
parent: Codebase explainer
grand_parent: For developers
nav_order: 1
---

# Overview

Speechwave lets a speaker's audience react to a talk in real time, with emojis that show up right on the slides. Under the hood, that experience comes from three actors talking to a Phoenix server.

<div class="arch-diagram">
  <div class="arch-node">
    <span class="arch-node-emoji">📱</span>
    <span class="arch-node-label">Attendee</span>
    <span class="arch-node-sub">Phone browser, /t/:slug</span>
  </div>
  <div class="arch-arrow">
    <span class="arch-arrow-line">→</span>
    <span class="arch-arrow-label">taps an emoji over /live</span>
  </div>
  <div class="arch-node highlight">
    <span class="arch-node-emoji">⚡</span>
    <span class="arch-node-label">Phoenix server</span>
    <span class="arch-node-sub">Rate-limits, persists, broadcasts</span>
  </div>
  <div class="arch-arrow">
    <span class="arch-arrow-line">→</span>
    <span class="arch-arrow-label">relays it over /socket</span>
  </div>
  <div class="arch-node">
    <span class="arch-node-emoji">💻</span>
    <span class="arch-node-label">Speaker</span>
    <span class="arch-node-sub">Chrome extension, overlays slides</span>
  </div>
</div>

The **attendee** opens a talk's URL on their phone and gets a plain web page powered by Phoenix LiveView. The **server** takes each tap, checks it against a rate limit, stores it if a session is recording, and broadcasts it to everyone listening. The **speaker** runs a Chrome extension on their laptop that listens for those broadcasts and draws the emoji on top of Google Slides.

Two separate WebSocket connections carry that traffic, and it's worth knowing them apart early, because later chapters refer back to this table constantly.

<table class="schema-table">
  <thead>
    <tr><th>Connection</th><th>Path</th><th>Protocol</th><th>Used by</th></tr>
  </thead>
  <tbody>
    <tr>
      <td class="field">LiveView socket</td>
      <td class="type">/live</td>
      <td>Phoenix LiveView</td>
      <td>The attendee's browser</td>
    </tr>
    <tr>
      <td class="field">Channel socket</td>
      <td class="type">/socket</td>
      <td>Phoenix Channel</td>
      <td>The Chrome extension</td>
    </tr>
  </tbody>
</table>

The full chapter on this is [WebSockets](/dev/explainer/websockets.html), but the short version: a single server-side broadcast reaches both kinds of listener without either side knowing the other exists.

## Project structure

Here's the shape of the codebase, trimmed to the parts these chapters actually walk through.

<div class="code-block"><span class="label">Project structure</span>
lib/speechwave/                     core domain logic, no web concerns
  application.ex                    supervision tree, see Supervision tree
  talks.ex                          talks and talk sessions
  reactions.ex                      emoji reactions and slide aggregation
  accounts.ex                       users, tokens, identities
  plans.ex                          plan tiers and limits
  rate_limiter.ex                   per-connection cooldown
  auth_throttle.ex                  magic-link send throttling
  db_backup.ex                      scheduled snapshot uploads

lib/speechwave_web/
  live/
    talk_live.ex                    the attendee's page
    dashboard_live.ex               the speaker's talk list
    session_analytics_live.ex       post-talk engagement review
  channels/
    user_socket.ex                  the /socket entry point
    reaction_channel.ex             join checks, session and slide messages
  endpoint.ex                       both socket mounts live here
  router.ex                         routes and live_session scopes

chrome-extension/                   separate repo, see Chrome extension
</div>

Each piece gets its own chapter. Start with <a href="https://github.com/speechwave-live/speechwave/blob/main/lib/speechwave/talks.ex">talks.ex</a> and <a href="https://github.com/speechwave-live/speechwave/blob/main/lib/speechwave/reactions.ex">reactions.ex</a> in [Data model](/dev/explainer/data-model.html) if you want to see how the pieces are actually stored.
