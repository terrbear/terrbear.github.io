---
title: AWS Lambda Error Handling and Monitoring
date: "2017-11-30"
---

This started as a simple “hey here’s how you make Sentry good in Lambda,” and then
I just kept going and now it’s how we manage all the things that could go wrong in
Lambda in production.

I’ve been doing a <em>lot</em> with <a href="https://aws.amazon.com/lambda/">AWS Lambda</a> lately. Coupling 
it with AWS’s <a href="https://aws.amazon.com/api-gateway/">API Gateway</a>, where 
I work we’ve built an entire API for our control plane. It’s been a lot of fun.

But error reporting in Lambda sucks. Without a little help. Here are a few things we’ve
done to make it better.

## Sentry

If you’re like me, the first thing you’ll try to do is install <a href="https://sentry.io/welcome/">Sentry</a> 
and just expect things to work. Except they won’t, because the <a href="https://github.com/getsentry/raven-node">Node Sentry client</a>
fires asynchronously and your Lambda’s going to exit more often than not before you even know something went
wrong.

I’ll write more later on how we manage our decently sized API, but here’s what the
error handling looks like now:

```js
const sentry = require("./sentry");

...
  try {
    return this.applyFilters(event)
      .then(() => this.dispatch(event))
      .catch((error) => {
        ...
        return sentry(error).then(() => ...);
      }
  } catch (err) { 
    return sentry(err).then(() => ...);
  }

```

This way we handle rejected promises and uncaught exceptions.  As with everything, 
reading the underlying code helps a lot (see below). Here’s what our sentry
wrapper looks like:

```js
const Raven = require("raven");
const Promise = require("bluebird");

const SENTRY_DSN = process.env.SENTRY_DSN;

Raven.config(SENTRY_DSN, { release: "RELEASE_SHA" }).install();

const capture = Promise.promisify(Raven.captureException, { context: Raven });

module.exports = function sentry(err, extra = {}) {
  if (process.env.NODE_ENV === "test") {
    return Promise.resolve();
  }

  console.log("sentrying!", err);
  return capture(err, extra);
};
```

It’s obvious in hindsight, but yes, there’s a <a href="https://github.com/getsentry/raven-node/blob/master/lib/client.js#L355">callback arg</a>
in the captureException call that you can promisify, and then you can keep on 
keeping your promises the rest of the time.

## Release Tracking

We publish each release to Lambda to Sentry, using their nifty <a href="https://docs.sentry.io/learn/releases/">release tracking</a> 
feature. This yelps us isolate defects to specific releases in specific branches. I just track our releases
with the git SHA. Because this is backend and we don’t deal with source maps, that’s as easy
as putting in the <code>release</code> in the extra data when configuring Raven.

Here’s the relevant <a href="https://webpack.js.org/">webpack</a> config section to keep Lambda error reporting 
tied to its commit (you’ll need to find the right envvar to track the SHA/commit yourself):

```js
[
  {
    test: /\.js$/,
    use: [
      ...
      {
        loader: StringReplacePlugin.replace({
          replacements: [
            {
              pattern: /RELEASE_SHA/g,
              replacement: function (match, offset, string) {
                return process.env.GIT_SHA;
              }
            }
          ]
        })
      }
    ],
  },
  ...
]
```

## Memory Limits and Timeouts

Lambda will (kinda) silently fail when you either (a) try to allocate more memory
than prescribed, or (b) run past your declared timeout. At this point you won’t 
get a chance to send an event to Sentry, so you’ll need to have another way to 
catch it when it happens.

(Really if you exceed any of their <a href="http://docs.aws.amazon.com/lambda/latest/dg/limits.html">limits</a>
it’ll blow up, but these are the causes we’ve run into most often.)

Fortunately, Lambda <em>will</em> log that it exited prematurely. We can use that!

We set up some <a href="https://aws.amazon.com/cloudwatch/">CloudWatch</a> subscriptions 
that look for premature exits. I’d suggest placing these in their own CF template 
because it’s easy to run into the CloudFormation template size limit.

Here’s an example CloudFormation log filter subscription definition (the 
important part is the filter pattern):

```json
"YourServicePrematureSubscriptionFilter": {
  "Type" : "AWS::Logs::SubscriptionFilter",
  "Properties" : {
    "DestinationArn" : {
      "Fn::Sub": "arn:aws:lambda:${AWS::Region}:${AWS::AccountId}:function:premature-catcher"
    },
    "FilterPattern" : "Process exited before completing",
    "LogGroupName" : "/aws/lambda/YourService"
  }
}
```

Any time that log message is seen, it gets sent to a Lambda that notifies us via 
Slack.

Here’s a sanitized version of the Lambda that gets invoked when the subscription
sees an event:

```js
const zlib    = require("zlib");

exports.handler = function handler(event, context, callback) {
  console.log("event: ", event);
  const payload = new Buffer(event.awslogs.data, "base64");

  zlib.gunzip(payload, (err, res) => {
    if (err) {
      return callback(err);
    }
    const parsed = JSON.parse(res.toString("utf8"));
    console.log("Decoded payload:", JSON.stringify(parsed));

    const msg = `Lambda premature exit detected in: ${parsed.logGroup} / ${parsed.logStream}`;

    return yourNotifyHook()
      .then(() => callback(null, `Successfully processed ${parsed.logEvents.length} log events.`));
  });
};
```

If you have Sentry, release tracking, and alert when Lambdas exit before they’re 
expected, you’ll know about a lot of errors at the same time your customers do,
instead of finding out after support does.

