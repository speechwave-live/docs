---
title: Authentication
parent: Codebase explainer
grand_parent: For developers
nav_order: 3
---

# Authentication

Speechwave never asks anyone for a password. There are two ways to sign in, and a third path just for the Chrome extension, which isn't a web page and can't use either one.

<div class="two-col">
  <div class="info-card">
    <div class="info-card-label">Magic link</div>
    <p>Enter your email, get a one-time link. Clicking it logs you in. The token is single-use and gets deleted the moment it's consumed.</p>
  </div>
  <div class="info-card">
    <div class="info-card-label">OAuth</div>
    <p>Sign in with Google, Microsoft, or GitHub, handled through the Assent library. Works the same way whether it's your first visit or your fiftieth.</p>
  </div>
</div>

## Routing

<div class="code-block"><span class="label">Auth routes</span>
GET    /users/log-in                 UserLive.Login, :new
GET    /users/magic_link/:token      UserSessionController, :magic_link
DELETE /users/log-out                UserSessionController, :delete
GET    /auth/:provider               UserSessionController, :oauth_authorize
GET    /auth/:provider/callback      UserSessionController, :oauth_callback
</div>

## The magic link flow

<div class="stepper">
  <div class="stepper-header">
    <div class="stepper-title">Magic link walkthrough</div>
    <div class="stepper-dots"></div>
  </div>
  <div class="stepper-body">
    <div class="stepper-step active">
      <div class="step-title">1. Submit an email</div>
      <div class="step-diagram">
        <div class="node active">Browser</div>
        <div class="arrow">→</div>
        <div class="node">/users/log-in</div>
      </div>
      <div class="step-desc">The user enters an email address. The server finds or creates an account for it. A link goes out either way, whether or not the account already existed, so a stranger can't use the response to guess who has a Speechwave account.</div>
    </div>
    <div class="stepper-step">
      <div class="step-title">2. Email goes out</div>
      <div class="step-diagram">
        <div class="node dim">Browser</div>
        <div class="arrow">→</div>
        <div class="node active">Server</div>
        <div class="arrow">→</div>
        <div class="node">Inbox</div>
      </div>
      <div class="step-desc">The server creates a token record and emails the link through Swoosh. The token is short-lived, so an old link sitting in an inbox stops being useful before long.</div>
    </div>
    <div class="stepper-step">
      <div class="step-title">3. Click the link</div>
      <div class="step-diagram">
        <div class="node dim">Inbox</div>
        <div class="arrow">→</div>
        <div class="node active">/users/magic_link/:token</div>
      </div>
      <div class="step-desc">UserSessionController consumes the token. It's single-use: the moment it's checked, it's deleted, so a link can't be replayed.</div>
    </div>
    <div class="stepper-step">
      <div class="step-title">4. Session starts</div>
      <div class="step-diagram">
        <div class="node dim">Token consumed</div>
        <div class="arrow">→</div>
        <div class="node active">/dashboard</div>
      </div>
      <div class="step-desc">A session is created and the browser is redirected to the dashboard, signed in.</div>
    </div>
  </div>
  <div class="stepper-footer">
    <div class="step-counter">Step 1 of 4</div>
    <div class="step-btns">
      <button class="btn-step btn-prev">← Previous</button>
      <button class="btn-step btn-next">Next →</button>
    </div>
  </div>
</div>

## OAuth

OAuth covers two different situations with the same provider code:

- **Login**: find or create an account by provider and provider account id, or match an existing account by email and link the new provider to it.
- **Connect**: an already signed-in user adds another provider from Settings, so they can log in either way later.

<div class="callout">
  <div class="callout-label">Email verification guard</div>
  <p>OAuth login requires the provider to claim the email is verified. If that claim is missing or false, the login is rejected. Otherwise a provider could vouch for an email address nobody actually controls.</p>
</div>

## The Scope struct

Every context function that touches user-owned data takes a <code>%Scope{user: user}</code> as its first argument, so filtering by ownership is explicit instead of something you have to remember. This is a standard Phoenix 1.8 convention, not anything unique to Speechwave, but it's worth knowing because you'll see it everywhere in the codebase.

<div class="code-block"><span class="label">accounts/scope.ex</span>
defmodule Speechwave.Accounts.Scope do
  defstruct user: nil
end

def list_talks(%Scope{user: user}) do
  Talk
  |> where(user_id: ^user.id)
  |> Repo.all()
end
</div>

## Users and linked identities

<table class="schema-table">
  <thead>
    <tr><th>Field</th><th>Type</th><th>Notes</th></tr>
  </thead>
  <tbody>
    <tr><td class="field">email</td><td class="type">string</td><td>The login identity, no password stored alongside it</td></tr>
    <tr><td class="field">plan</td><td class="type">atom</td><td>free, pro, or org, see Plans and limits</td></tr>
    <tr><td class="field">api_key</td><td class="type">string</td><td>A long random key, auto-generated, used by the Chrome extension</td></tr>
  </tbody>
</table>

<table class="schema-table">
  <thead>
    <tr><th>Field</th><th>Type</th><th>Notes</th></tr>
  </thead>
  <tbody>
    <tr><td class="field">provider</td><td class="type">string</td><td>google, microsoft, or github</td></tr>
    <tr><td class="field">uid</td><td class="type">string</td><td>The provider's account id</td></tr>
    <tr><td class="field">user_id</td><td class="type">references</td><td>The linked account</td></tr>
  </tbody>
</table>

## Chrome extension auth

The extension can't do magic links or OAuth, since it isn't a web page. Instead, every user gets an API key, auto-generated and visible in Account Settings, and the extension sends it as a join parameter when it connects to the Channel socket. See [WebSockets](/dev/explainer/websockets.html) for the exact check chain that key goes through.

## Where the code lives

<ul>
  <li><a href="https://github.com/speechwave-live/speechwave/blob/main/lib/speechwave/accounts.ex">lib/speechwave/accounts.ex</a></li>
  <li><a href="https://github.com/speechwave-live/speechwave/blob/main/lib/speechwave/accounts/scope.ex">lib/speechwave/accounts/scope.ex</a></li>
  <li><a href="https://github.com/speechwave-live/speechwave/blob/main/lib/speechwave/accounts/user_token.ex">lib/speechwave/accounts/user_token.ex</a></li>
  <li><a href="https://github.com/speechwave-live/speechwave/blob/main/lib/speechwave/accounts/user_identity.ex">lib/speechwave/accounts/user_identity.ex</a></li>
  <li><a href="https://github.com/speechwave-live/speechwave/blob/main/lib/speechwave_web/controllers/user_session_controller.ex">lib/speechwave_web/controllers/user_session_controller.ex</a></li>
  <li><a href="https://github.com/speechwave-live/speechwave/blob/main/lib/speechwave_web/live/user_live/login.ex">lib/speechwave_web/live/user_live/login.ex</a></li>
  <li><a href="https://github.com/speechwave-live/speechwave/blob/main/lib/speechwave_web/user_auth.ex">lib/speechwave_web/user_auth.ex</a></li>
</ul>
