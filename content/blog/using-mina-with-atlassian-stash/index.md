---
title: Using Mina with Atlassian Stash
date: "2014-08-26"
---

Internally I’m setting up Atlassian’s <a href="https://www.atlassian.com/software/stash">Stash</a>, and one of the first projects I wanted to get going was my own projects that were previously hosted on <a href="https://github.com/">Github</a>.

For Rails deployment, I love <a href="http://nadarei.co/mina/">Mina</a>, so I was hoping it’d be as simple as placing my public key on Stash and changing the repository URL in config.rb. Unfortunately, that’s not how Stash works (from what I can tell); it’s username/password driven.

Not willing to put a password into an explicit shell call for cloning, I <a href="https://confluence.atlassian.com/display/STASH/Permanently+authenticating+with+Git+repositories">dug around</a>, and turns out Git supports putting authentication values into a file ~/.netrc.

At first this is a little janky, but it’s not too different from a public key. It just means the inherent authorizations don’t match up immediately (ie, you can’t login to Github with a public key).

I created a user whose only job is to check out the repo, populated my .netrc as:

    machine my.stash.instance
    login deployer
    password BOOM

And authentication works magically.
