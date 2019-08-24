# A PSTN phone in your browser

This app allows you to make and receive phone calls in your browser. It has been tested with Chrome only.

## Prerequisites

* Sign up for a Twilio account
* Install Node.js Twilio CLI
* Install Twilio Serverless CLI plugin

## Setup

Run:

    npm run setup

and open the URL printed at the end. A numeric random code is generated as a simple security measure. Copy it from the terminal and paste it into the field in the upper left corner of the web page.

NOTE: The setup script will buy a US phone number which costs $1.00 / month. Calls to and from this app will incur charges on your Twilio account.

## Clean up

You can get rid of everything by running:

    npm run destroy

Just joking. You must run

    npm run destroy-really

Have fun.
