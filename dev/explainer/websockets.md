---
title: WebSockets
parent: Codebase explainer
grand_parent: For developers
nav_order: 7
---

# WebSockets

Two separate WebSocket connections power Speechwave, and they don't know about each other. This chapter goes one level deeper than the [Overview](/dev/explainer/overview.html) table into how each one is set up and gated.

## The LiveView socket (/live)

This one powers the attendee's page and is managed entirely by Phoenix LiveView. It handles <code>phx-click</code> events going up, <code>push_event</code> going down, and the diff-based page sync that makes LiveView feel instant without a page reload.

<div class="code-block"><span class="label">endpoint.ex</span>
socket "/live", Phoenix.LiveView.Socket,
  websocket: [connect_info: [session: @session_options]]
</div>

## The Channel socket (/socket)

This is a bare Phoenix Channel socket, built for the Chrome extension, which isn't a web page and can't use LiveView.

<div class="code-block"><span class="label">user_socket.ex</span>
defmodule SpeechwaveWeb.UserSocket do
  use Phoenix.Socket
  channel "reactions:*", SpeechwaveWeb.ReactionChannel

  def connect(_params, socket, _info), do: {:ok, socket}
  def id(_socket), do: nil
end
</div>

The <code>"reactions:*"</code> pattern means the extension can attempt to join any <code>reactions:&lt;slug&gt;</code> topic at the socket level, but joining is gated much more strictly by the channel itself.

<div class="code-block"><span class="label">reaction_channel.ex</span>
def join("reactions:" <> slug, %{"api_key" => api_key}, socket) do
  with {:talk, %Talks.Talk{} = talk} <- {:talk, Talks.get_talk_by_slug(slug)},
       {:user, %Accounts.User{} = user} <- {:user, Accounts.get_user_by_api_key(api_key)},
       {:owner, true} <- {:owner, talk.user_id == user.id},
       {:capacity, :ok} <-
         {:capacity, Plans.check(:max_participants, user.plan,
                       Presence.list("reactions:#{slug}") |> map_size())} do
    Phoenix.PubSub.subscribe(Speechwave.PubSub, "user:#{user.id}:disconnect")
    send(self(), :after_join)
    {:ok, assign(socket, talk: talk, user: user)}
  else
    {:talk, nil} -> {:error, %{reason: "not_found"}}
    {:user, nil} -> {:error, %{reason: "unauthorized"}}
    {:owner, false} -> {:error, %{reason: "unauthorized"}}
    {:capacity, {:error, :limit_reached}} -> {:error, %{reason: "capacity_reached"}}
  end
end
</div>

Four checks run in order, and each one has a specific failure reason:

<table class="schema-table">
  <thead>
    <tr><th>Reason</th><th>What it means</th></tr>
  </thead>
  <tbody>
    <tr><td class="field">not_found</td><td>The slug doesn't match any talk</td></tr>
    <tr><td class="field">unauthorized</td><td>The API key doesn't resolve, or resolves to a user who doesn't own this talk</td></tr>
    <tr><td class="field">capacity_reached</td><td>The owner's plan-based participant limit has been reached, tracked live via Presence. See <a href="/dev/explainer/plans-limits.html">Plans and limits</a> for how limits work.</td></tr>
  </tbody>
</table>

A successful join also subscribes the channel to a per-user disconnect topic. If the owner logs out or regenerates their API key somewhere else, that topic gets a broadcast and the channel force-disconnects, pushing the extension to reconnect with a fresh key.

<code>check_origin: false</code> is set specifically on this socket so a <code>chrome-extension://</code> origin isn't rejected, something the LiveView socket doesn't need since browsers hit it directly.

<div class="code-block"><span class="label">endpoint.ex</span>
socket "/socket", SpeechwaveWeb.UserSocket,
  websocket: [check_origin: false]
</div>

## Why PubSub connects them

<code>Endpoint.broadcast!/3</code> doesn't care whether a subscriber is a LiveView process or a Channel process, it just delivers to everyone on the topic. That's the whole trick behind [Emoji journey](/dev/explainer/emoji-journey.html): <code>TalkLive.handle_event</code> never needs to know the extension exists at all.

## Rate limiting

<div class="code-block"><span class="label">rate_limiter.ex</span>
defmodule Speechwave.RateLimiter do
  use GenServer
  @table :rate_limiter

  def allow?(session_id) do
    now = System.monotonic_time(:millisecond)
    case :ets.lookup(@table, session_id) do
      [{^session_id, last_at}] when now - last_at < @cooldown_ms -> false
      _ -> :ets.insert(@table, {session_id, now}); true
    end
  end
end
</div>

Each browser tab gets its own bucket, keyed by its connection id. Taps inside a short cooldown window are silently dropped; the button's client-side disabled state and countdown are the only UX signal, but the real enforcement happens here, server-side.

<div class="callout">
  <div class="callout-label">Why ETS and not the GenServer directly?</div>
  <p>The ETS table is public and readable concurrently, so any process calls <code>allow?/1</code> directly instead of going through the GenServer's mailbox. That avoids a bottleneck when a room full of people are tapping at once. The GenServer's only job is owning the table's lifetime.</p>
</div>

<div class="callout">
  <div class="callout-label">Attendee count via Presence</div>
  <p>The join-time capacity check above is backed by <code>Presence.track/3</code>, called once a join succeeds. Presence is what makes <code>Presence.list("reactions:#{slug}") |> map_size()</code> an accurate live headcount. See <a href="/dev/explainer/plans-limits.html">Plans and limits</a> for how that count gets compared against a plan's limit.</p>
</div>

There's also a client-side cooldown in the emoji buttons themselves, a disabled state plus a visible countdown, but that's UX polish. The ETS check above is the actual enforcement.

## Where the code lives

<ul>
  <li><a href="https://github.com/speechwave-live/speechwave/blob/main/lib/speechwave_web/endpoint.ex">lib/speechwave_web/endpoint.ex</a></li>
  <li><a href="https://github.com/speechwave-live/speechwave/blob/main/lib/speechwave_web/channels/user_socket.ex">lib/speechwave_web/channels/user_socket.ex</a></li>
  <li><a href="https://github.com/speechwave-live/speechwave/blob/main/lib/speechwave_web/channels/reaction_channel.ex">lib/speechwave_web/channels/reaction_channel.ex</a></li>
  <li><a href="https://github.com/speechwave-live/speechwave/blob/main/lib/speechwave/rate_limiter.ex">lib/speechwave/rate_limiter.ex</a></li>
  <li><a href="https://github.com/speechwave-live/speechwave/blob/main/lib/speechwave_web/presence.ex">lib/speechwave_web/presence.ex</a></li>
  <li><a href="https://github.com/speechwave-live/speechwave/blob/main/assets/js/hooks/emoji_buttons.js">assets/js/hooks/emoji_buttons.js</a></li>
</ul>
