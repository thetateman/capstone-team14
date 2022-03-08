const fs = require('fs');
const http = require("http");
const express = require("express");
const MessagingResponse = require("twilio").twiml.MessagingResponse;
const bodyParser = require("body-parser");
require('dotenv').config()

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const targetNumber = process.env.TARGET_NUMBER;
const sourceNumber = process.env.SOURCE_NUMBER;

const client = require('twilio')(accountSid, authToken);

// Simple function to read and parse a json document
function readQuestions(fileName) {
    try {
        const data = fs.readFileSync('question-dictionary.json', 'utf8')
        return JSON.parse(data);
    } catch (err) {
        console.error(err)
    }
}

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));

const questionDict = readQuestions("question-dictionary.json");
let waitingForResponse = false;
let correctAnswers = 0;
let currentQuestion = 0;

//Handle user response
app.post("/handle_sms", (req, res) => {
    waitingForResponse = false;
    const twiml = new MessagingResponse();
    
    
    if (req.body.Body == questionDict['question'][currentQuestion]['correct-answer']) {
        twiml.message("That is correct!\n\n" + questionDict['question'][currentQuestion]['explanation']);
        correctAnswers++;
    } else {
        twiml.message("That answer is incorrect!\n\n" + questionDict['question'][currentQuestion]['explanation']);
    }
    
    res.writeHead(200, { "Content-Type": "text/xml" });
    res.end(twiml.toString());
});

http.createServer(app).listen(1337, () => {
    console.log("Express server listening on port 1337");
});

// Send questions to user.
async function sendQuestions() {
    for(let i=0; i<questionDict['question'].length; i++) {
        if(waitingForResponse) {
            i--;
            console.log("waiting....")
        }
        else {
        client.messages
            .create({
                body: questionDict['question'][i]['body'] + "\n\n" + questionDict['question'][i]['choice-a']
                        + "\n" + questionDict['question'][i]['choice-b'] + "\n" + questionDict['question'][i]['choice-c'] + "\n" + questionDict['question'][i]['choice-d'],
                from: sourceNumber,
                to: targetNumber
            })
            .then(message => console.log(message.sid));
            currentQuestion = i;
            waitingForResponse = true;
        }
        await new Promise(resolve => setTimeout(resolve, 10000));
    }
    console.log(`User answered ${correctAnswers} out of ${questionDict['question'].length} questions correctly.`)
}
sendQuestions();
