---
title: Speaker dashboard & analytics
nav_order: 3
---

# Speaker dashboard & analytics

Your dashboard is where you manage talks, connect the browser extension, and review how your audience reacted after each session.

## Your talks

The dashboard lists every talk you've created, with a form at the top for adding a new one. Just give it a title and Speechwave generates a URL slug (you can edit the slug if you'd like something more memorable). Select a talk from the list to open its panel, which shows:

- **The audience URL**: the link you share with attendees, with a button to copy it.
- **A QR code**: project it on a slide, or download it as a PNG for handouts or a title slide.
- **The talk slug**: labeled "Slug for browser extension," with its own copy button.

To delete a talk, select it and use the trash icon next to its name. Deleting a talk removes all of its sessions and reactions too, so double-check before confirming.

![Speechwave dashboard showing the Create a Talk form and a list of talks](/assets/images/screenshot-dashboard-talk-list.png){: width="700" }

## Finding your talk slug

The slug is the last part of your audience URL (`speechwave.live/t/<slug>`), and it's the one piece of information the browser extension needs to connect to the right talk. Select the talk in your dashboard and look for **"Slug for browser extension"** in its panel. Click the copy icon next to it and paste it straight into the extension.

![Speechwave dashboard talk panel showing the audience URL, QR code, and slug for the browser extension](/assets/images/screenshot-dashboard-talk-panel.png){: width="700" }

## Finding your API key

Your API key lives on the **Account Settings** page, under **Browser Extension API Key**. It authenticates the extension as you, so paste it in there and keep it private. Use the copy button next to the key field to grab it without mistyping.

Regenerating your key immediately invalidates the old one and disconnects any extension using it. Paste the new key into the extension before it can reconnect. See [troubleshooting](troubleshooting.html) if reactions stop showing up after a regeneration.

![Speechwave Account Settings page showing the Browser Extension API Key field](/assets/images/screenshot-account-settings-api-key.png){: width="700" }

## Sessions

Each talk panel has a Sessions list below the slug. A session is one continuous run of that talk: it's created automatically when you start presenting from the extension and closed when you stop. For each session you'll see:

- Its name (you can rename it) and the date it started.
- An **Active** badge while it's still running. This clears once you stop presenting from the extension.
- Its total reaction count so far.

You can rename or delete a session from this list; deleting removes its recorded reactions along with it. Sessions themselves are only started and stopped from the extension. The dashboard is where you review and manage them afterward.

## Session analytics

Click **Analytics** next to any session to see how your audience reacted. The page shows the session's total reaction count, then breaks reactions down slide by slide, with a count for each emoji your audience sent on that slide, so you can see exactly which moments landed.

If your talk has more than one session, you can also compare two sessions of the same talk side by side, with each session's slide-by-slide breakdown shown next to the other. That's a quick way to see how a reworked section of your talk performed against an earlier run.

![Speechwave session analytics page showing a slide-by-slide breakdown of reactions](/assets/images/screenshot-session-analytics.png){: width="700" }

## Plan usage

Your dashboard shows a running summary of your plan's usage for the current month: how many **full sessions** you've used (any session longer than 10 minutes) against your plan's monthly limit, and the maximum number of participants allowed per talk. Once you reach your monthly full-session limit, you won't be able to start new sessions until the next month begins.
