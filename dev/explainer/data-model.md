---
title: Data model
parent: Codebase explainer
grand_parent: For developers
nav_order: 2
---

# Data model

Three tables carry the whole reaction flow: a talk, its sessions, and the reactions tapped during them. Account tables like <code>users</code> and <code>user_identities</code> live in [Authentication](/dev/explainer/authentication.html) instead, so they're covered once rather than twice.

## talks

One row per conference talk, owned by a user.

<table class="schema-table">
  <thead>
    <tr><th>Field</th><th>Type</th><th>Notes</th></tr>
  </thead>
  <tbody>
    <tr><td class="field">title</td><td class="type">string</td><td>What the speaker sees on their dashboard</td></tr>
    <tr><td class="field">slug</td><td class="type">string</td><td>Unique, auto-generated from the title, URL-safe</td></tr>
    <tr><td class="field">user_id</td><td class="type">references</td><td>Owning speaker</td></tr>
  </tbody>
</table>

The slug is the thread that ties all three actors together: it's in the attendee's URL, it's the PubSub topic name, and it's the Channel topic the extension joins. One string, three jobs.

## talk_sessions

A recording window within a talk. A speaker can run the same talk multiple times (a conference circuit, a rehearsal, the real thing) and each run gets its own session.

<table class="schema-table">
  <thead>
    <tr><th>Field</th><th>Type</th><th>Notes</th></tr>
  </thead>
  <tbody>
    <tr><td class="field">label</td><td class="type">string</td><td>Auto-increments "Session 1", "Session 2"... renameable from the dashboard</td></tr>
    <tr><td class="field">started_at</td><td class="type">datetime</td><td>Set when the session starts</td></tr>
    <tr><td class="field">ended_at</td><td class="type">datetime</td><td>Nil while the session is active</td></tr>
    <tr><td class="field">talk_id</td><td class="type">references</td><td>Parent talk</td></tr>
  </tbody>
</table>

See [Talk sessions](/dev/explainer/talk-sessions.html) for how sessions get started and stopped.

## reactions

One row per emoji tap, but only while a session is recording.

<table class="schema-table">
  <thead>
    <tr><th>Field</th><th>Type</th><th>Notes</th></tr>
  </thead>
  <tbody>
    <tr><td class="field">emoji</td><td class="type">string</td><td>The tapped emoji</td></tr>
    <tr><td class="field">slide_number</td><td class="type">integer</td><td>Defaults to 0, meaning unknown or before the session started</td></tr>
    <tr><td class="field">talk_session_id</td><td class="type">references</td><td>Deleted along with its session</td></tr>
  </tbody>
</table>

The full set the attendee can pick from, straight from <a href="https://github.com/speechwave-live/speechwave/blob/main/lib/speechwave_web/live/talk_live.ex">talk_live.ex</a>, is:

<div class="code-block"><span class="label">Attendee emoji set</span><pre>
❤️ 😂 👏 🤯 🎉 😮 🎯 🔥 💡
</pre></div>

## Where the code lives

<ul>
  <li><a href="https://github.com/speechwave-live/speechwave/blob/main/lib/speechwave/talks/talk.ex">lib/speechwave/talks/talk.ex</a></li>
  <li><a href="https://github.com/speechwave-live/speechwave/blob/main/lib/speechwave/talks/talk_session.ex">lib/speechwave/talks/talk_session.ex</a></li>
  <li><a href="https://github.com/speechwave-live/speechwave/blob/main/lib/speechwave/reactions/reaction.ex">lib/speechwave/reactions/reaction.ex</a></li>
</ul>
