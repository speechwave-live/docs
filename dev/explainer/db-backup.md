---
title: DB backup
parent: Codebase explainer
grand_parent: For developers
nav_order: 10
---

# DB backup

Speechwave runs on SQLite, and in production, <code>Speechwave.DbBackup</code> keeps that database backed up on a schedule. It's a GenServer, and it only starts when the right storage configuration is present, which means it never runs in local development.

## The schedule

After boot, the first backup runs a short time later, and then on a repeating hourly interval after that.

<div class="code-block"><span class="label">db_backup.ex</span><pre>
@initial_delay :timer.minutes(5)
@interval :timer.hours(1)
</pre></div>

## How the snapshot gets taken

The backup uses SQLite's <code>VACUUM INTO</code> to produce the snapshot.

<div class="callout">
  <div class="callout-label">Why VACUUM INTO and not a file copy?</div>
  <p>A plain file copy of a live SQLite database can catch it mid-write and produce a corrupt snapshot. <code>VACUUM INTO</code> produces a consistent, compacted copy without locking the database or causing any downtime, which makes it a much safer way to snapshot a database that's actively being written to.</p>
</div>

Once the snapshot file is written, it gets uploaded to S3-compatible object storage using a signed upload. The temporary file is always deleted afterward, whether or not the upload succeeded, so a failed upload doesn't leave anything behind on disk.

Failures are caught and logged. A failed backup doesn't crash the GenServer or affect the running database in any way, it just means that cycle's snapshot didn't make it to storage. See [Supervision tree](/dev/explainer/supervision-tree.html) for what happens if the process itself crashes.

## Manual trigger

<code>run_now/0</code> is exposed so a backup can be triggered on demand from IEx or a Mix task, without waiting for the timer.

<div class="code-block"><span class="label">iex</span><pre>
Speechwave.DbBackup.run_now()
</pre></div>

## Where the code lives

<ul>
  <li><a href="https://github.com/speechwave-live/speechwave/blob/main/lib/speechwave/db_backup.ex">lib/speechwave/db_backup.ex</a></li>
  <li><a href="https://github.com/speechwave-live/speechwave/blob/main/lib/speechwave/application.ex">lib/speechwave/application.ex</a></li>
</ul>
