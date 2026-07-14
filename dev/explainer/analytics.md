---
title: Analytics
parent: Codebase explainer
grand_parent: For developers
nav_order: 13
---

# Analytics

Once a talk is over, a speaker can review exactly how each slide landed. That review happens at <code>/sessions/:id</code>, inside the same authenticated area as the dashboard, with one extra check layered on top.

<code>SessionAnalyticsLive.mount/3</code> calls <code>Talks.get_talk!(current_scope, session.talk_id)</code>, which raises if the session's talk isn't owned by the current user. Being logged in isn't enough on its own, you specifically have to own the talk the session belongs to.

## The aggregation query

<div class="code-block"><span class="label">reactions.ex</span><pre>
def slide_reaction_totals(session_id) do
  from(r in Reaction,
    where: r.talk_session_id == ^session_id,
    group_by: [r.slide_number, r.emoji],
    select: %{slide_number: r.slide_number, emoji: r.emoji, count: count(r.id)},
    order_by: [asc: r.slide_number]
  )
  |> Repo.all()
end
</pre></div>

<code>SessionAnalyticsLive</code> groups the results by slide number and renders a bar per slide using plain Tailwind classes, no JavaScript charting library involved. Each bar's height is relative to that slide's own maximum count, so a slide with fewer total reactions still shows a readable shape rather than a flat line next to a busier one.

<div class="callout">
  <div class="callout-label">Slide 0 means "General"</div>
  <p>Reactions with a slide number of 0 render under a "General" label instead of "Slide 0". That covers taps recorded before a session started, or any tap where the extension's adapter couldn't read a slide number at all.</p>
</div>

## Comparing two sessions

At <code>/sessions/:id/compare/:other_id</code>, both sessions load and render side by side. The set of slides shown is the union of slide numbers across both sessions, so a slide that got reactions in one run but not the other still shows up, rather than quietly disappearing from the comparison.

## Route placement

<div class="code-block"><span class="label">router.ex</span><pre>
live "/sessions/:id",                  SessionAnalyticsLive, :show
live "/sessions/:id/compare/:other_id", SessionAnalyticsLive, :compare
</pre></div>

Both routes sit inside the same authenticated live_session as the rest of the speaker-facing app.

## Where the code lives

<ul>
  <li><a href="https://github.com/speechwave-live/speechwave/blob/main/lib/speechwave_web/live/session_analytics_live.ex">lib/speechwave_web/live/session_analytics_live.ex</a></li>
  <li><a href="https://github.com/speechwave-live/speechwave/blob/main/lib/speechwave/reactions.ex">lib/speechwave/reactions.ex</a></li>
  <li><a href="https://github.com/speechwave-live/speechwave/blob/main/lib/speechwave/talks.ex">lib/speechwave/talks.ex</a></li>
</ul>
