---
title: Setting up Ghost with Passenger
date: "2014-08-23"
description: Quickly set up Ghost to run on Phusion Passenger.
---
I wanted something simpler to blog with, so I’m trying out <a href="http://ghost.org">Ghost</a>. I’ve not hosted any <a href="http://nodejs.org/">Node</a> apps before, but I already had a server set up running <a href="https://www.phusionpassenger.com/">Passenger</a> and <a href="http://httpd.apache.org/">Apache</a> (I’ve not jumped on the Nginx bandwagon yet), so I wanted it to work nicely with that.

Having done maybe 2 hours of Node development in my life, I thought you _had_ to have an app.js, but not so.

Here’s my vhost xfile[1][2]:

    <VirtualHost *:80>
    ServerAdmin webmaster@localhost
    ServerName terrbear.org
    ServerAlias www.terrbear.org
    ServerAlias www.terrbear.ninja
    ServerAlias terrbear.ninja

    DocumentRoot /var/www/apps/ghost
    PassengerAppRoot /var/www/apps/ghost
    PassengerAppType node
    PassengerStartupFile index.js
    PassengerRestartDir /var/www/apps/ghost/tmp

    ErrorLog /var/log/apache2/error.log

    LogLevel warn

    CustomLog /var/log/apache2/access.log combined
    ServerSignature On
    </VirtualHost>

Because Passenger in hosted environments automatically sets NODE_ENV to production, there wasn't anything else to do here. I did update my config to use MySQL, which worked out of the box. If you're looking to do the same, copy the travis-ci stanza out and use your own values.

[1] New installations of Apache search for sites-enabled/\*.conf and mods-enabled/\*.conf, so if you copied your old vhost file and can't figure out why it's not working, that might be a hint.

[2] Yes, I own terrbear.ninja. No, I don't have DNS setup for it.
