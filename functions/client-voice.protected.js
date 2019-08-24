exports.handler = function(context, event, callback) {
    let twiml = new Twilio.twiml.VoiceResponse();

    if(event.To !== context.CALLER_ID) {
      // outbound dial from browser
      twiml.dial({callerId: context.CALLER_ID})['number']({}, event.To)
    } else {
      // inbound call to browser
      twiml.dial({callerId: event.From })['client']({}, "the_user_id")
    }

    callback(null, twiml);
};
