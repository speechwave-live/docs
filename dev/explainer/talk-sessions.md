---
title: Talk sessions
parent: Codebase explainer
grand_parent: For developers
nav_order: 5
---

# Talk sessions

A talk session is a recording window: the speaker starts one before presenting and stops it afterward. It's a longer-lived concept than a single emoji tap, with its own lifecycle, so it earns its own chapter rather than folding into [Emoji journey](/dev/explainer/emoji-journey.html).

Reactions tapped while a session is active get persisted with a slide number, ready for [Analytics](/dev/explainer/analytics.html) later. Reactions tapped with no active session still broadcast live on the spot, they just don't get saved.

## The lifecycle functions

All session logic lives in <code>Speechwave.Talks</code>.

<table class="schema-table">
  <thead>
    <tr><th>Function</th><th>Idempotent?</th><th>What it does</th></tr>
  </thead>
  <tbody>
    <tr><td class="field">start_session/1</td><td>Yes</td><td>Returns the existing active session if one's already open, otherwise creates a new one labeled "Session N"</td></tr>
    <tr><td class="field">stop_session/1</td><td>Yes</td><td>If <code>ended_at</code> is already set, returns the session unchanged instead of erroring</td></tr>
    <tr><td class="field">get_active_session/1</td><td>-</td><td>Finds the session with <code>ended_at IS NULL</code></td></tr>
    <tr><td class="field">list_sessions/1</td><td>-</td><td>All sessions for a talk with reaction counts, newest first</td></tr>
    <tr><td class="field">rename_session/2</td><td>-</td><td>Dashboard-only</td></tr>
    <tr><td class="field">delete_session/1</td><td>-</td><td>Dashboard-only</td></tr>
  </tbody>
</table>

Idempotency matters here because sessions get started and stopped from a Chrome extension popup, where a flaky connection or an eager double-click shouldn't create two sessions or throw an error on a second stop.

## Controlled from the extension

<code>ReactionChannel</code> exposes <code>start_session</code> and <code>stop_session</code> as channel messages, so the speaker's extension controls sessions directly, without needing to alt-tab to a browser tab mid-talk.

<div class="callout">
  <div class="callout-label">Where the check fires</div>
  <p>Before creating a session, the channel checks the talk owner's plan against how many full sessions they've already recorded this month. Free-tier accounts have a participant cap and a monthly session cap; paid tiers don't. See <a href="/dev/explainer/plans-limits.html">Plans and limits</a> for how that's enforced, and <a href="https://speechwave.live/pricing">the pricing page</a> for current numbers. If the cap is hit, the channel replies with <code>session_limit_reached</code> and no session is created. The dashboard also reads the count at page load, so a speaker can see their usage before they run into the wall.</p>
</div>

A "full" session, for the purposes of that monthly count, is one that runs past a short minimum length, so a session ended almost immediately doesn't count against the cap.

The channel also tracks each connected participant through <code>SpeechwaveWeb.Presence</code>, which feeds the participant-capacity check on join (see [WebSockets](/dev/explainer/websockets.html)), and it subscribes to a per-user disconnect topic, so a server-side logout or an API key regeneration force-disconnects the extension's channel right away.

## Where the code lives

<ul>
  <li><a href="https://github.com/speechwave-live/speechwave/blob/main/lib/speechwave/talks.ex">lib/speechwave/talks.ex</a></li>
  <li><a href="https://github.com/speechwave-live/speechwave/blob/main/lib/speechwave_web/channels/reaction_channel.ex">lib/speechwave_web/channels/reaction_channel.ex</a></li>
  <li><a href="https://github.com/speechwave-live/speechwave/blob/main/lib/speechwave/plans.ex">lib/speechwave/plans.ex</a></li>
</ul>
