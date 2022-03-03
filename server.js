const fs = require('fs');
const http = require("http");
const express = require("express");
const MessagingResponse = require("twilio").twiml.MessagingResponse;
const bodyParser = require("body-parser");

// Simple function to read and parse a json document
function readQuestions(fileName) {
    fs.readFile(fileName, "utf8", (error, data) => {
        if (error) {
            console.log(error);
            return;
        }
        return JSON.parse(data);
    });
}

let questionDict = readQuestions("question-dictionary.json");

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));

app.post("/sms", (req, res) => {
    const twiml = new MessagingResponse();

    if (req.body.Body == "D") {
        twiml.message("That is correct!");
    } else {
        twiml.message("That answer is incorrect!");
    }

    res.writeHead(200, { "Content-Type": "text/xml" });
    res.end(twiml.toString());
});

http.createServer(app).listen(1337, () => {
    console.log("Express server listening on port 1337");
});
