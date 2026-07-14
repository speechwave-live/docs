---
title: Plans and limits
parent: Codebase explainer
grand_parent: For developers
nav_order: 8
---

# Plans and limits

Speechwave has three plan tiers, free, pro, and org, and two things they gate: how many people can join a talk at once, and how many full sessions can be recorded in a month.

<table class="schema-table">
  <thead>
    <tr><th>Feature</th><th>Free</th><th>Pro / Org</th><th>Enforced where</th></tr>
  </thead>
  <tbody>
    <tr>
      <td class="field">Participants per talk</td>
      <td>Capped, see <a href="https://speechwave.live/pricing">pricing</a></td>
      <td>Unlimited</td>
      <td><code>ReactionChannel.join/3</code></td>
    </tr>
    <tr>
      <td class="field">Full sessions per month</td>
      <td>Capped, see <a href="https://speechwave.live/pricing">pricing</a></td>
      <td>Unlimited</td>
      <td>The channel's <code>start_session</code> handler</td>
    </tr>
  </tbody>
</table>

Pro and org accounts share the same unlimited treatment on both of these, so if you're comparing plans for participant or session caps, the only real distinction is free versus paid. Current numbers live on the <a href="https://speechwave.live/pricing">pricing page</a> rather than here, since this chapter is about how the checks work, not what the thresholds happen to be today.

## Where each limit is enforced

The **participant cap** is checked when the Chrome extension tries to join the reactions Channel, against a live headcount from Presence. A join beyond the limit fails with a capacity error. See [WebSockets](/dev/explainer/websockets.html) for the full join check chain.

The **session cap** is checked when the extension sends a <code>start_session</code> message (see [Talk sessions](/dev/explainer/talk-sessions.html)). A session only counts toward that monthly total once it's run long enough to be considered "full", short recordings don't count against it.

<div class="callout">
  <div class="callout-label">Where the check fires</div>
  <p><code>start_session</code> is rejected with a session-limit error once the monthly cap is hit, and the dashboard reads the same count at page load so a speaker can see their usage before they hit the wall.</p>
</div>

## Where the code lives

<ul>
  <li><a href="https://github.com/speechwave-live/speechwave/blob/main/lib/speechwave/plans.ex">lib/speechwave/plans.ex</a></li>
  <li><a href="https://github.com/speechwave-live/speechwave/blob/main/lib/speechwave_web/channels/reaction_channel.ex">lib/speechwave_web/channels/reaction_channel.ex</a></li>
  <li><a href="https://github.com/speechwave-live/speechwave/blob/main/lib/speechwave_web/presence.ex">lib/speechwave_web/presence.ex</a></li>
  <li><a href="https://github.com/speechwave-live/speechwave/blob/main/lib/speechwave/talks.ex">lib/speechwave/talks.ex</a></li>
</ul>
