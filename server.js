const fs = require("fs");
const path = require("path")
const http = require("http");
const express = require("express");
const MessagingResponse = require("twilio").twiml.MessagingResponse;
const bodyParser = require("body-parser");
cronJob = require("cron").CronJob;
require("dotenv").config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const targetNumber = process.env.TARGET_NUMBER;
const sourceNumber = process.env.SOURCE_NUMBER;

const client = require("twilio")(accountSid, authToken);

// Simple function to read and parse a json document
function readQuestions(fileName) {
    try {
        const data = fs.readFileSync("question-dictionary.json", "utf8");
        return JSON.parse(data);
    } catch (err) {
        console.error(err);
    }
}

// Twilio initialization
const app = express();
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/admin', (req, res) => {
    res.sendFile(path.resolve(`${__dirname}/index.html`));
});
// Update question list from Web UI
app.use('/updateQuestions', (req, res) => {
    let newQuestionList = req.body;
    console.log(newQuestionList);

    let oldQuestionDict = readQuestions("question-dictionary.json");

    oldQuestionDict["question"].push(
        {
            "body": newQuestionList["question"],
            "choice-a": newQuestionList["answerA"],
            "choice-b": newQuestionList["answerB"],
            "choice-c": newQuestionList["answerC"],
            "choice-d": newQuestionList["answerD"],
            "correct-answer": newQuestionList["correctAnswer"],
        }
    );
    oldQuestionDict["sendTime"] = newQuestionList["sendTime"];
    
    try {
        fs.writeFileSync('question-dictionary.json', JSON.stringify(oldQuestionDict))
        //file written successfully
      } catch (err) {
        console.error(err)
      }
    res.redirect('/admin');
    //return res.json({"success": "success"});
});

var numbers = [targetNumber];
//Update list of target numbers
app.use('/updateNumbers', (req, res) => {
    newNumber = JSON.stringify(req.body).number;
    console.log(newNumber);
    numbers.push(newNumber);
    res.redirect('/admin');
});


// Get question dict and intialize variables
const questionDict = readQuestions("question-dictionary.json");
let currentQuestion = 0;
let sendTime = "00 00";
// List of recipient numbers
var numbers = [targetNumber];

// Handle user response
app.post("/handle_sms", (req, res) => {
    const twiml = new MessagingResponse();

    // Check if the answer is correct or not
    if (req.body.Body ==questionDict["question"][currentQuestion]["correct-answer"]) {
        twiml.message("That is correct!\n\n" + questionDict["question"][currentQuestion]["explanation"]);
    } else {
        twiml.message("That answer is incorrect!\n\n" + questionDict["question"][currentQuestion]["explanation"]);
    }

    res.writeHead(200, { "Content-Type": "text/xml" });
    res.end(twiml.toString());
});

// Create the webhook server
http.createServer(app).listen(1337, () => {
    console.log("Express server listening on port 1337");
});

let j = 0;
// Send questions to user every day at a scheduled time
async function sendQuestions() {
    // The string input is the time of day to send. The format is minutes, hours. So "30 08" is 8:30 AM 
    // Note that this expects 24 HR time
    sendTime = questionDict["sendTime"]
    var textJob = new cronJob(`${sendTime} * * *`,
        function () {
            for (var i = 0; i < numbers.length; i++) {
                client.messages.create(
                    {
                        body: questionDict["question"][j]["body"] + "\n\n" +
                            questionDict["question"][j]["choice-a"] + "\n" +
                            questionDict["question"][j]["choice-b"] + "\n" +
                            questionDict["question"][j]["choice-c"] + "\n" +
                            questionDict["question"][j]["choice-d"],
                        to: numbers[i],
                        from: sourceNumber,
                    },
                    function (err, data) {
                        console.log(data.sid);
                    }
                );
            }
            ++j;
            // Reset to first question when we run out
            if (j == questionDict['question'].length) {
                j = 0;
            }
        },
        null,
        true
    );
}

sendQuestions();


