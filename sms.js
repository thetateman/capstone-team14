// Download the helper library from https://www.twilio.com/docs/node/install
// Find your Account SID and Auth Token at twilio.com/console
// and set the environment variables. See http://twil.io/secure
require('dotenv').config()

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const targetNumber = process.env.TARGET_NUMBER;
const sourceNumber = process.env.SOURCE_NUMBER;

const client = require('twilio')(accountSid, authToken);

client.messages
  .create({
     body: 'A 16-year-old girl presents to the ED after falling in a cheerleading competition. The patient landed on an outstretched leg after her partner failed to catch her' +  
            'during a stunt, causing the leg to hyperextend at the knee and dislocate. On exam, you note mild swelling of the knee with joint laxity but no obvious dislocation.' +
            'The knee radiograph shows a joint effusion, but no fracture or dislocation. There is fullness in the popliteal fossa, and you note a diminished dorsalis pedis pulse,' +
            'an absent posterior tibialis pulse, and cool toes. What is the next step in the management of this patient? Reply with the letter.' +
            '\n A. Arteriogram \n B. CT angiography \n C. Duplex ultrasound \n D. Emergent vascular surgery consult',
     from: sourceNumber,
     to: targetNumber
   })
  .then(message => console.log(message.sid));
