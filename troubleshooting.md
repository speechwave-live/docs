---
title: Troubleshooting & FAQ
nav_order: 5
---

# Troubleshooting & FAQ

## Why aren't emojis appearing on Google Slides?

If you just installed, updated, or reloaded the extension, refresh any Google Slides tabs that were already open. Chrome doesn't load extension updates into tabs you already had open, so the reaction overlay won't appear on them until you reload the tab — reconnecting in the popup isn't enough on its own.

## Why does the extension say "Connected" but nothing shows on my slides?

- Make sure the Google Slides tab you're presenting from was opened, or refreshed, after the extension was installed. See above if it wasn't.
- Look for the overlay in the bottom-right corner of the slide — at some zoom levels it can end up hidden behind other Slides UI elements.
- In full-screen presentation mode, the overlay follows you automatically — no extra setup needed there.

## Why am I seeing "Invalid API key" after regenerating my key?

Regenerating your key on the [Account Settings](dashboard.html) page immediately invalidates the old one, so the extension needs the new key too:

1. Click **Change API key** in the extension popup.
2. Copy the new key from Account Settings using its copy button.
3. Paste it into the popup and save.
4. Click **Connect**.

You normally won't see any error while you're re-entering the key. If you do catch a brief flash of "Invalid API key," it clears up once the new key is saved and you click Connect.

## Why won't the extension connect?

A few different messages can show up here, each with its own fix:

- **Connecting just fails, with no specific message** — double-check the talk slug against the one on your [dashboard](dashboard.html); a mismatched slug is the most common cause.
- **"Invalid API key"** — copy your key fresh from [Account Settings](dashboard.html) and re-paste it into the popup; it may be out of date.
- **"Talk is at capacity"** — your plan's participant limit for this talk has been reached. You can review your plan's limits on your [dashboard](dashboard.html).
- **"Please confirm your email before using the extension"** — confirm your email using the link Speechwave sent you, then reconnect.

## Why is every reaction showing up twice on my slides?

If every reaction produces two emojis on the same Slides tab, an older version of the extension is most likely still running on that tab alongside the current one. This happens when the extension updates — during a new release or a Chrome auto-update — but the Slides tab isn't refreshed afterward. Refreshing the tab clears out the old version and resolves the duplicates.
