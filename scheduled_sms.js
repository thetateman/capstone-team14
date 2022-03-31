// Global vars
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const sourceNumber = process.env.SOURCE_NUMBER;
const targetNumber = process.env.TARGET_NUMBER;
const client = require("twilio")(accountSid, authToken);
cronJob = require("cron").CronJob;

// List of recipient numbers
var numbers = [targetNumber];

// Sends a message every day at a scheduled time
async function sendScheduledSms() {
    // The string input is the time of day to send. The format is minutes, hours. So "30 20" is 8:30 PM 
    var textJob = new cronJob("30 08 * * *",
        function () {
            for (var i = 0; i < numbers.length; i++) {
                client.messages.create({
                        to: numbers[i],
                        from: sourceNumber,
                        body: "Hello! Hope you're having a good day.",
                    },
                    function (err, data) {
                        console.log(data.sid);
                    }
                );
            }
        },
        null,
        true
    );
}

sendScheduledSms();
