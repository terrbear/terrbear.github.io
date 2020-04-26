---
title: Historical Nest Usage
date: "2014-08-26"
---
The <a href="https://nest.com/">Nest</a> app and website give you 10 days of usage information for your thermostat(s). Unfortunately, they offer no way to view data beyond that, which sucks if you want to compare usage month to month, or measure changes longer than 10 days (e.g., “did my solar screens make a difference?”).

So, I pulled together a few APIs and now have data gathered every 30 minutes that should give me an understand of how changes in behavior/infrastructure affect energy consumption (at least as far as the thermostat is involved).

The repository is public on <a href="https://github.com">GitHub</a>: <a href="https://github.com/terrbear/nest_watcher">https://github.com/terrbear/nest_watcher</a>. Pull requests welcome.

Just clone the repository, copy the credentials_example.yml into a credentials.yml and add your own info (you can optionally post to <a href="https://www.stathat.com/">StatHat</a>, which I am because it’s awesome and free for under 10 stats), and start it up on a cronjob. You’ll need a <a href="http://www.wunderground.com/">Weather Underground</a> API token (free for personal use).

My cronjob is:

    */15 * * * * /usr/bin/ruby   /home/theath/nest_watcher/reporter.rb &gt;&gt; /home/theath/nest.txt

It outputs CSV that looks like:

    02AA01AC12140ACE, Upstairs, 74, 75, true, 78613, 86.6, 48, 2014-09-01 11:02:40 -0500
    02AA01AC131403XP, Downstairs, 72, 73, false, 78613, 86.6, 48, 2014-09-01 11:02:40 -0500

Which you can then pull into your own spreadsheet over time to see how things are working.
