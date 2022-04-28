FROM twilio/twilio-cli

RUN mkdir /team14
WORKDIR /team14
COPY . .
CMD 'node' 'sms'
