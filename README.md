# A PSTN phone in your browser

This app allows you to make and receive phone calls in your browser. It has been tested with Chrome only.

## Prerequisites

* Sign up for a [Twilio account](https://twilio.com/)
* Install [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart)
* Install Twilio Serverless CLI plugin: `twilio plugins:install @twilio-labs/plugin-serverless`
* Log in with `twilio profiles:add` and follow instructions

## Setup

Run:
    npm install

then:
    npm run setup

That's all. You now have a working VoIP phone that you can access from your browser. Open the URL printed at the end. A numeric random code is generated as a simple security measure. Copy it from the terminal and paste it into the password field on the web page.

NOTE: The setup script will buy a US phone number which costs $1.00 / month. Calls to and from this app will incur charges on your Twilio account.

## Clean up

You can get rid of everything by running:

    npm run destroy

Just joking. You must run

    npm run destroy-really

Have fun.
