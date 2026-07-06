---
title: Chrome extension
nav_order: 4
---

# Chrome extension

The Chrome extension runs on your laptop while you present. It shows the
audience's reactions on your Google Slides and it's where you start and stop the
sessions you'll see on your dashboard.

## Install

Add [Speechwave on the Chrome Web
Store](https://chromewebstore.google.com/detail/speechwave/iiilbjaimkcbpbfeophcfapppcdbnpje)
to Chrome. Once it's installed, the Speechwave icon appears in your toolbar.

## Connect your account

Click the Speechwave icon in your toolbar. The first time you open it, it asks
you to paste your Speechwave API key to get started, with a link to Account
Settings, where the key lives ([where to find your API key](dashboard.html)).
Paste your key into the field and click **Save Key**.

If you ever need to swap in a different key (say, after regenerating one),
click **Change API key** near the bottom of the popup.

![Speechwave Chrome extension popup prompting for an API key before it's
connected](/assets/images/screenshot-extension-popup-setup.png){: width="280" }

## Connect to a talk

Once your key is saved, the popup shows a **Talk Slug** field. Enter the slug
for the talk you're presenting (find it on your [dashboard](dashboard.html),
labeled "Slug for browser extension"), then click **Connect**.

The status dot turns green and the text next to it changes from "Disconnected"
to "Connected" once you're in. The same button turns into **Disconnect** if you
need to leave and connect to a different talk.

## Present

Open your Google Slides presentation. Reactions show up as a floating overlay
in the bottom-right corner of the slide, in both the normal editor view and
full-screen presentation mode.

**Important:** after installing or updating the extension, refresh any Google
Slides tabs you already had open before you connect. Chrome doesn't load the
update into tabs that were already open, so the overlay won't appear until you
reload them.

![A Google Slides presentation with a floating cluster of emoji reactions in
the bottom-right corner](/assets/images/screenshot-slides-overlay.png){:
width="700" }

## Sessions from the extension

Once you're connected, the popup shows a session area below the connect button.
Click **Start Session** to begin recording reactions for this run of your talk.
The button changes to **Stop Session** while one is running, along with a slide
indicator ("Slide 3", or "Slide —" if none is detected yet). Click **Stop
Session** when you're done presenting. Your [dashboard](dashboard.html) is
where you rename sessions and review their analytics afterward.

![Speechwave Chrome extension popup connected to a talk with an active session
running](/assets/images/screenshot-extension-popup-connected.png){: width="280"
}

## Common errors

If the popup shows **"Talk is at capacity,"** the talk has reached its
participant limit. See [troubleshooting](troubleshooting.html).

If you see **"Please confirm your email before using the extension,"** confirm
your email from the link Speechwave sent you, then reconnect. See
[troubleshooting](troubleshooting.html).

If you see **"Invalid API key or you don't own this talk,"** re-copy your key
from Account Settings and use **Change API key** to update it in the popup. See
[troubleshooting](troubleshooting.html).
