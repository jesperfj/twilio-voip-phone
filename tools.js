(async() => {
    if(process.argv[2] == "setup") {
        setup()
    } else if(process.argv[2] == "destroy") {
        destroy(null)
    } else if(process.argv[2] == "destroy-really") {
        destroy("-y")
    } else if(process.argv[2] == "info") {
        info()
    }
})()

async function info() {
    // Grab the service SID
    const fs = require('fs');
    const config = JSON.parse(fs.readFileSync('.twilio-functions'));

    // Grab the domain name
    let r = await execCmd("twilio api:serverless:v1:services:environments:list --service-sid "+
                        config.serviceSid+" -o json")
    const envInfo = JSON.parse(r.stdout)

    console.log("URL: https://"+envInfo[0].domainName+"/index.html")
    r = await execCmd("twilio api:serverless:v1:services:environments:variables:list"+
                      " --service-sid "+config.serviceSid+
                      " --environment-sid "+envInfo[0].sid+
                      " -o json")
    const secret = JSON.parse(r.stdout).find( (element) => { return element.key == "SECRET" }).value
    console.log("Secret: "+secret)
    r = await execCmd("twilio api:core:incoming-phone-numbers:list --friendly-name number-"+config.serviceSid+" -o json")
    const numbers = JSON.parse(r.stdout)
    console.log("Phone number: "+numbers[0].phoneNumber)
}

async function destroy(really) {
    if(really == "-y") {
        console.log("Destroying for real")
    } else {
        console.log("Planning a destroy. Run with -y to really destroy")
    }

    // Grab the service SID
    const fs = require('fs');
    const config = JSON.parse(fs.readFileSync('.twilio-functions'));

    // Delete the phone number
    let r = await execCmd("twilio api:core:incoming-phone-numbers:list --friendly-name number-"+config.serviceSid+" -o json")
    let number = null
    if(r.stdout) {
        const numbers = JSON.parse(r.stdout)
        if(numbers && numbers[0]) {
            number = numbers[0]
        }
    }

    r = await execCmd("twilio api:core:applications:list --friendly-name app-"+config.serviceSid+" -o json")
    let app = null
    if(r.stdout) {
        const apps = JSON.parse(r.stdout)
        if(apps && apps[0]) {
            app = apps[0]
        }
    }    

    if(really == "-y") {
        if(number) {
            await execCmd("twilio api:core:incoming-phone-numbers:remove --sid "+number.sid)
        } else {
            console.log("No number found named number-"+config.serviceSid)
        }
        if(app) {
            await execCmd("twilio api:core:applications:remove --sid "+app.sid)
        } else {
            console.log("No app found named app-"+config.serviceSid)            
        }
        await execCmd("twilio api:serverless:v1:services:remove --sid "+config.serviceSid)
        await execCmd("rm .twilio-functions")
    } else {
        console.log("Use npm run destroy-really to really destroy")
    }
    

}

async function setup() {
    // Deploy functions and assets
    let r = await execCmd("twilio serverless:deploy")
    console.log("Deployed assets and functions")

    // Grab the service SID
    const fs = require('fs');
    const config = JSON.parse(fs.readFileSync('.twilio-functions'));

    // Grab the domain name
    r = await execCmd("twilio api:serverless:v1:services:environments:list --service-sid "+
                        config.serviceSid+" -o json")
    const envInfo = JSON.parse(r.stdout)

    // Create a TwiML Application with Voice callback pointing to the client-voice service
    // and grab the sid
    r = await execCmd("twilio api:core:applications:create"+
                      " --friendly-name app-"+config.serviceSid+
                      " --voice-url https://"+envInfo[0].domainName+"/client-voice -o json")
    
    const appSid = JSON.parse(r.stdout)[0].sid
    console.log("Created TwiML app named app-"+config.serviceSid)

    // Buy a phone number
    r = await execCmd("twilio api:core:incoming-phone-numbers:create --area-code 323"+
                      " --voice-application-sid "+appSid+
                      " --friendly-name number-"+config.serviceSid+
                      " -o json")

    const number = JSON.parse(r.stdout)[0].phoneNumber
    console.log("Purchased phone number: "+number)

    // Set environment variables TWIML_APP_SID and CALLER_ID
    r = await execCmd("twilio api:serverless:v1:services:environments:variables:create"+
                      " --service-sid "+config.serviceSid+
                      " --environment-sid "+envInfo[0].sid+
                      " --key TWIML_APP_SID --value "+appSid)

    r = await execCmd("twilio api:serverless:v1:services:environments:variables:create"+
                      " --service-sid "+config.serviceSid+
                      " --environment-sid "+envInfo[0].sid+
                      " --key CALLER_ID --value "+number)

    const secret = Math.floor(Math.random() * 1000000);
    r = await execCmd("twilio api:serverless:v1:services:environments:variables:create"+
                      " --service-sid "+config.serviceSid+
                      " --environment-sid "+envInfo[0].sid+
                      " --key SECRET --value "+secret)

    console.log("SERVICE_SID="+config.serviceSid)
    console.log("ENVIRONMENT_SID="+envInfo[0].sid)
    console.log("DOMAIN="+envInfo[0].domainName)
    console.log("CALLER_ID="+number)
    console.log("SECRET="+secret)
    console.log("TWIML_APP_SID="+appSid)
    console.log("")
    console.log("Open the app at https://"+envInfo[0].domainName+"/index.html")
    console.log("Type the following secret code into the password field on the page: "+secret)
}


async function execCmd(cmd) {
    const exec = require('child_process').exec;
    return new Promise((resolve, reject) => {
     exec(cmd, (code, stdout, stderr) => {
      if (code) {
       console.warn(code);
      }
      resolve({code: code, stdout: stdout, stderr: stderr});
     });
    });
}

