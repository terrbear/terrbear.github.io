---
title: AWS IoT Button + Pushover = Extra Laziness
date: "2016-05-23"
---

I’ve four kids (and we’re done). My oldest is 9, and my youngest is 2. The oldest always wakes up around 5am, and the toddler wakes up around 6:30. I don’t like waking up at 6:30, and the oldest can now get her out of the crib.

So, every morning around 6:30, I hear the two year old start crying and then get my phone and text my son, who goes to get her. This is mostly great, except I have to wake up enough to send a text message (even just to copy/paste a previous request from the day before).

I could suggest that he get her up any time she starts crying after 6:30, but there are circumstances where we don’t want that, so I still want to be manually involved to some extent.

Enter the <a href="https://aws.amazon.com/iot/button/">Amazon IoT Button</a>. I hooked that up to an <a href="https://aws.amazon.com/lambda/">AWS Lambda</a> function, which pings <a href="https://pushover.net/api">Pushover</a>, which sends a push notification to my son’s iPad. So, now instead of sending a text, I just push a button and go back to sleep.

The code itself is pretty simple. I didn’t really care about input, so it’s just an unused Java inputstream (note that all of the Lambda stuff requires plain Java interactions, so .asJava is necessary if you’re returning a non-primitive). Full repo on GitHub: <a href="https://github.com/terrbear/iot-pinger/">terrbear/iot-pinger</a>:

    package org.terrbear

    import dispatch._, Defaults._

    import scala.collection.JavaConverters._

    import com.amazonaws.services.lambda.runtime.Context

    object Natertot {
      def main(args: Array[String]): Unit = {
        val notifier = new Notifier
        val answer = notifier.notify(notifier.YES_PLZ)
        println(answer())
      }
    }

    class Notifier {
      val PUSHOVER_KEY = &quot;your-pushover-key&quot;
      val PUSHOVER_APP_KEY = &quot;your-pushover-app-key&quot;
      val YES_PLZ = &quot;Can you please get J out of bed?&quot;

      def lambda(input: java.io.InputStream, context: Context) : String = {
        val logger = context.getLogger
        logger.log(&quot;got a click!&quot;)
        logger.log(notify(YES_PLZ)())
        &quot;all done&quot;
      }

      def notify(msg: String): Future[String] = {
        val request = url(&quot;https://api.pushover.net/1/messages.json&quot;).POST &lt;&lt; Map(&quot;token&quot; -&gt; PUSHOVER_APP_KEY, &quot;user&quot; -&gt; PUSHOVER_KEY, &quot;message&quot; -&gt; msg)
        Http(request OK as.String)
      }
    }

I’m not really embracing <a href="http://dispatch.databinder.net/Dispatch.html">Dispatch</a>’s futures here, but that seemed reasonable for the way it’s running. Also, Lambda wants a class it can instantiate to call the handler method (from my tiny bit of experimentation).

Steps to reproduce:

1. Buy an IoT Button
1. Install Pushover and make an account and register an app
1. Make your own Lambda function - when you’re creating the Lambda function you’ll be given an opportunity to register your IoT Button.
1. Profit.

