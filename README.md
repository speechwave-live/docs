# Speechwave docs

The documentation site for Speechwave, built with Jekyll.

Speechwave lets conference speakers collect live emoji reactions from their
audience and overlay them on Google Slides in real time. This repo holds the
Jekyll source for [docs.speechwave.live](https://docs.speechwave.live),
covering getting started, the speaker dashboard, the Chrome extension,
troubleshooting, and a developer explainer of how the main Speechwave app
works under the hood. It uses the just-the-docs theme and deploys
automatically to DreamHost via GitHub Actions on every push to `main`.

## Stack

- Jekyll 4.4
- just-the-docs theme
- Ruby 3.4.5

## Setup

Ruby 3.4.5 is pinned in `mise.toml`, so `mise install` picks up the right
version. Then install the gems:

```bash
bundle install
```

## Tasks

Start the local dev server:

```bash
pitchfork start web
```

This runs `bundle exec jekyll serve` at `http://localhost:4001`. That port is
pinned in `_config.yml` rather than the Jekyll default of 4000, so it doesn't
collide with the sibling speechwave app's `mix phx.server`, which also
defaults to 4000, when you want to run both locally at once.

Build the static site:

```bash
mise run build
```
