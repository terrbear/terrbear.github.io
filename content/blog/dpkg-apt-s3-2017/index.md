---
title: Packaging dpkg for S3 in 2017
date: "2017-12-12"
---

Trying to make a Debian package and host it on <a href="https://aws.amazon.com/s3/">S3</a> 
is and should be easy. But finding up to date examples and docs hasn’t been. 
So, to save the next person some effort, here are some tools and ways to go about 
building your own Debian package, signing it, and hosting it on S3 such that
it can be installed with <a href="https://wiki.debian.org/Apt">Apt</a>, in 2017.

You can follow along here: <a href="https://github.com/terrbear/dpkg-example-2017">GitHub repo</a>

## Authoring the Package

Let’s make a currency bot service that logs the exchange rate of BTC and others 
using <a href="http://rate.sx">rate.sx</a> to /var/log/bubble.

Also, just for fun (and demo purposes), on installation we should print the 
current exchange rate.

To build the packages, you pass a directory to <a href="http://man7.org/linux/man-pages/man1/dpkg.1.html">dpkg</a> 
that has (1) a DEBIAN directory that has metadata about the package (dependencies, pre/post installation,
version info, etc) and (2) a map of what you want to lay out on the system.

Here’s a layout of our currencybot:

```shell
[14:47][theath@ego:~/code/dpkg-example/currencybot]$ ls -lR
total 0
drwxr-xr-x  4 theath  staff  136 Dec 12 14:47 DEBIAN
drwxr-xr-x  3 theath  staff  102 Dec 12 14:45 etc

./DEBIAN:
total 16
-rw-r--r--  1 theath  staff  193 Dec 12 14:47 control
-rwxr-xr-x  1 theath  staff   97 Dec 12 14:02 postinst

./etc:
total 0
drwxr-xr-x  3 theath  staff  102 Dec 12 14:46 cron.hourly

./etc/cron.hourly:
total 8
-rw-r--r--  1 theath  staff  45 Dec 12 14:46 currency
```

DEBIAN/control is required to build a package. Here’s a bare-bones version for
currencybot that shows it’s dependent on curl, and provides a bit of extra info
for anyone thinking about installing the package:

```
Package: currencybot
Version: $VERSION
Architecture: amd64
Maintainer: terry heath <theath@gmail.com>
Depends: curl
Homepage: http://terrbear.org
Description: Documents the BTC excitement of 2017
```

Note the $VERSION. We’ll use that later with <a href="https://www.gnu.org/software/gettext/manual/html_node/envsubst-Invocation.html">envsubst</a> 
to allow easy version revs.

And, as mentioned above, the fun immediate print-out of exchange rates goes into
postinst:

```bash
#!/bin/bash

curl rate.sx
```

Debian supports more install hooks than just postinst. You can read about all of
them at <a href="https://www.debian.org/doc/manuals/debian-faq/ch-pkg_basics.en.html">Debian.org</a>.

## Building the Package

Now that we have our package set up, we’ll need to use dpkg to build it. While
I imagine there are ways to install dpkg on OSX, why would you when we have 
<a href="https://www.docker.com">Docker</a>!?

Here’s our Dockerfile, which takes a build arg to create whatever version we need:

```docker
FROM ubuntu

ARG version

ENV VERSION ${version}

RUN apt-get update && \
    apt-get install -y gettext-base

ADD currencybot /currencybot-${version}

RUN chmod +x /currencybot-${version}/DEBIAN/postinst

RUN envsubst < currencybot-${version}/DEBIAN/control > currencybot-${version}/DEBIAN/control2 && \
    mv currencybot-${version}/DEBIAN/control2 currencybot-${version}/DEBIAN/control

RUN dpkg -b currencybot-${version}</code></pre></figure>

To go with it, a friendly build script:

<figure class="highlight"><pre><code class="language-bash" data-lang="bash">#!/bin/bash

if [ -z "$VERSION" ]; then
    echo "No version supplied"
    exit 1
fi

docker build --build-arg version=$VERSION -t currencybot:deb-build . && \
docker create --name deb currencybot:deb-build && \
docker cp deb:/currencybot-$VERSION.deb ./currencybot-$VERSION.deb && \
docker rm -f deb
```

We’ll build the package like: `VERSION=1.0.0 ./build.sh`

After that, it’s good to try to install it at least once. I don’t have a good reason for this,
but I like <a href="https://www.vagrantup.com/">Vagrant</a> for testing the installs. You could do this 
with Docker as well though!

(I’ve stripped out a bit of the nicer formatting because it translated poorly.)

```shell
ubuntu@ubuntu-xenial:/vagrant$ sudo dpkg -i currencybot-1.0.0.deb
Selecting previously unselected package currencybot.
(Reading database ... 53897 files and directories currently installed.)
Preparing to unpack currencybot-1.0.0.deb ...
Unpacking currencybot (1.0.0) ...
Setting up currencybot (1.0.0) ...

Market Cap: $497,632,208,810 ↑
24h Vol: $37,784,464,098 ↑
BTC Dominance: 58.8% ↑
┌──────┬───────┬─────────────┬──────────────┬─────────────┬──────────────────┬────────────┐
│ Rank │ Coin  │ Price (USD) │ Change (24H) │ Change (1H) │ Market Cap (USD) │ Spark (1H) │
├──────┼───────┼─────────────┼──────────────┼─────────────┼──────────────────┼────────────┤
│ 1    │ BTC   │ 17490.1     │ 1.41%        │ 0.19%       │ 292.731B         │ ▁▁▇▂▁▅▂▁▁▃ │
├──────┼───────┼─────────────┼──────────────┼─────────────┼──────────────────┼────────────┤
│ 2    │ ETH   │ 610.200     │ 27.67%       │ -0.65%      │ 58.762B          │ ▅▁▂▃▁▇▃▁▂▁ │
├──────┼───────┼─────────────┼──────────────┼─────────────┼──────────────────┼────────────┤
│ 3    │ BCH   │ 1632.96     │ 15.08%       │ 1.12%       │ 27.518B          │ ▁▃▅▃▃▁▇▁▁▃ │
├──────┼───────┼─────────────┼──────────────┼─────────────┼──────────────────┼────────────┤
│ 4    │ LTC   │ 331.171     │ 60.92%       │ -1.20%      │ 17.974B          │ ▂▁▇▁▁▂▁▁▁▂ │
├──────┼───────┼─────────────┼──────────────┼─────────────┼──────────────────┼────────────┤
│ 5    │ XRP   │ 0.375730    │ 49.85%       │ 8.02%       │ 14.555B          │ ▁▁▁▂▁▁▁▃▁▇ │
├──────┼───────┼─────────────┼──────────────┼─────────────┼──────────────────┼────────────┤
│ 6    │ MIOTA │ 4.59831     │ 5.93%        │ 1.50%       │ 12.781B          │ ▁▁▁▂▁▁▅▁▇▁ │
├──────┼───────┼─────────────┼──────────────┼─────────────┼──────────────────┼────────────┤
│ 7    │ DASH  │ 905.692     │ 20.63%       │ -1.08%      │ 7.019B           │ ▇▁▇▂▁▁▅▁▃▁ │
├──────┼───────┼─────────────┼──────────────┼─────────────┼──────────────────┼────────────┤
│ 8    │ XEM   │ 0.550592    │ 17.19%       │ 1.25%       │ 4.955B           │ ▂▁▂▁▁▇▁▁▂▁ │
├──────┼───────┼─────────────┼──────────────┼─────────────┼──────────────────┼────────────┤
│ 9    │ XMR   │ 305.197     │ 11.42%       │ 0.82%       │ 4.715B           │ ▇▁▃▁▁▁▁▁▇▃ │
├──────┼───────┼─────────────┼──────────────┼─────────────┼──────────────────┼────────────┤
│ 10   │ BTG   │ 272.704     │ 7.85%        │ 0.75%       │ 4.555B           │ ▅▁▃▇▂▅▂▂▁▁ │
└──────┴───────┴─────────────┴──────────────┴─────────────┴──────────────────┴────────────┘
2017-12-12 22:05:02.849983 UTC

See rate.sx/:help for help and disclaimer
[Follow @igor_chubin for rate.sx updates] [github.com/chubin/rate.sx]
```
