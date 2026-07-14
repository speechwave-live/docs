---
title: Dashboard flow
parent: Codebase explainer
grand_parent: For developers
nav_order: 12
---

# Dashboard flow

The dashboard is where a speaker's day starts, before a single attendee has opened a link. It's a different LiveView, and a different part of the workflow, than [Analytics](/dev/explainer/analytics.html): the dashboard is about setting a talk up, analytics is about reviewing it afterward.

Reaching <code>/dashboard</code> requires a signed-in user, using the same login covered in [Authentication](/dev/explainer/authentication.html): a magic link or an OAuth provider, no separate password.

## Creating a talk

A speaker enters a title, and the slug auto-generates from it. The talk is scoped to the logged-in user through <code>Talks.create_talk(scope, attrs)</code>, which sets the owning user id from the current scope rather than from anything client-supplied, the same Scope pattern covered in [Authentication](/dev/explainer/authentication.html).

## Getting a QR code

Each talk gets a QR code, meant for display on the speaker's first slide so attendees can scan it and land straight on the talk's page. The <code>QRCode</code> module wraps the <code>EQRCode</code> library to produce a PNG encoded as a base64 data URI, ready to drop into an <code>&lt;img&gt;</code> tag or offer as a download.

<div class="code-block"><span class="label">qr_code.ex</span><pre>
url = SpeechwaveWeb.Endpoint.url() <> "/t/#{talk.slug}"
# e.g. https://speechwave.live/t/my-talk
</pre></div>

## Where the code lives

<ul>
  <li><a href="https://github.com/speechwave-live/speechwave/blob/main/lib/speechwave_web/live/dashboard_live.ex">lib/speechwave_web/live/dashboard_live.ex</a></li>
  <li><a href="https://github.com/speechwave-live/speechwave/blob/main/lib/speechwave/talks.ex">lib/speechwave/talks.ex</a></li>
  <li><a href="https://github.com/speechwave-live/speechwave/blob/main/lib/speechwave/qr_code.ex">lib/speechwave/qr_code.ex</a></li>
</ul>
