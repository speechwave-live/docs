---
title: Supervision tree
parent: Codebase explainer
grand_parent: For developers
nav_order: 9
---

# Supervision tree

Every long-lived process in Elixir and OTP lives under a supervisor, and Speechwave is no exception. Here's the top level of the tree, straight from <code>Speechwave.Application</code>.

<div class="code-block"><span class="label">application.ex, :one_for_one</span><pre>
Speechwave.Application (supervisor)
├── Telemetry supervisor
├── Speechwave.Repo               (Ecto / SQLite)
├── DNSCluster                    (multi-node discovery)
├── Phoenix.PubSub                (name: Speechwave.PubSub)
├── Speechwave.RateLimiter        (GenServer + ETS)
├── Speechwave.AuthThrottle       (magic-link send throttling)
├── SpeechwaveWeb.Endpoint        (HTTP + both WebSocket endpoints)
├── SpeechwaveWeb.Presence        (Channel capacity tracking)
└── Speechwave.DbBackup           (only in production, once storage is configured)
</pre></div>

The strategy is <code>:one_for_one</code>: if one child crashes, only that child restarts. That works here because there's no shared state between children beyond PubSub, and PubSub is itself supervised.

<div class="callout">
  <div class="callout-label">Why :one_for_one is safe here</div>
  <p>A one_for_one strategy assumes children are mostly independent. Speechwave's children fit that assumption well: RateLimiter, Presence, and DbBackup don't depend on each other, they each just do their own job and get restarted on their own if something goes wrong.</p>
</div>

## What happens when each child crashes

<table class="schema-table">
  <thead>
    <tr><th>Process</th><th>On crash</th><th>Data loss?</th></tr>
  </thead>
  <tbody>
    <tr>
      <td class="field">RateLimiter</td>
      <td>Restarts, its ETS table is recreated empty</td>
      <td>Cooldown state is lost; everyone effectively gets a fresh window. Acceptable by design.</td>
    </tr>
    <tr>
      <td class="field">Presence</td>
      <td>Restarts, tracked presences clear</td>
      <td>Participant count resets to zero until extensions reconnect, so capacity checks are briefly more permissive than usual.</td>
    </tr>
    <tr>
      <td class="field">DbBackup</td>
      <td>Restarts, its timer resets</td>
      <td>No database data is lost, a snapshot just doesn't get uploaded that cycle. See <a href="/dev/explainer/db-backup.html">DB backup</a>.</td>
    </tr>
    <tr>
      <td class="field">Repo</td>
      <td>Connections are re-established</td>
      <td>Any in-flight transaction is rolled back.</td>
    </tr>
  </tbody>
</table>

<code>AuthThrottle</code>'s crash behavior isn't covered here, since it hasn't been specifically verified against the rest of this table.

## Where the code lives

<ul>
  <li><a href="https://github.com/speechwave-live/speechwave/blob/main/lib/speechwave/application.ex">lib/speechwave/application.ex</a></li>
  <li><a href="https://github.com/speechwave-live/speechwave/blob/main/lib/speechwave/rate_limiter.ex">lib/speechwave/rate_limiter.ex</a></li>
  <li><a href="https://github.com/speechwave-live/speechwave/blob/main/lib/speechwave/auth_throttle.ex">lib/speechwave/auth_throttle.ex</a></li>
  <li><a href="https://github.com/speechwave-live/speechwave/blob/main/lib/speechwave_web/presence.ex">lib/speechwave_web/presence.ex</a></li>
  <li><a href="https://github.com/speechwave-live/speechwave/blob/main/lib/speechwave/db_backup.ex">lib/speechwave/db_backup.ex</a></li>
</ul>
