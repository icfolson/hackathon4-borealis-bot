'use strict';

const async = require('async');
const q = require('q');
const builder = require('botbuilder');
var generalMessages = require('../misc/general-messages');

//------
// LUIS Entity
//------
const EntityTypes = {
    LUIS_ENTITY_GREETING:  "incontinence.greeting",
    LUIS_ENTITY_NAME: "incontinence.name"
};

const EntityFlags = {
    NAME: false
};

const prompt = builder.Prompts;

const doctorName = "Strong";
const appointmentReason = "general physical";
const commonGreeting = "I'm Luis"
const commonQuestion = `You've got an appointment scheduled tomorrow with Dr. ${doctorName}. Are you still able to make it?`;


const potentialGreetings = [    { greeting: "what's up", 
                                    response: `Hey there` },
                                { greeting: "sup", 
                                    response: `What's up`},
                                { greeting: "hello", 
                                    response: `Hello`},
                                { greeting: "good day", 
                                    response: `Good day to you`},
                                { greeting: "hi", 
                                    response: `Hi`},
                                { greeting: "yo", 
                                    response: `Yo`}
                            ]

/**
 * Utility methods
 */

/**
 * determines the greeting the bot should use depending on how the user inputted data
 */
const determineGreeting = (userHello) =>
{
    let response;
    for(let i = 0; i < potentialGreetings.length; i++)
        if (potentialGreetings[i].greeting === userHello) {
            response = potentialGreetings[i].response;
            break;
        }
    response  = response || `Hello, ${commonGreeting}`;
    return response;
};

/**
 * gets the response for the user 
 * Modifies session.user.intake.name to hold the user's name if they provided one
 */
const getResponseForUser = (session, entities) => {
    const dfd = q.defer();
    const userHello = builder.EntityRecognizer.findEntity(entities, EntityTypes.LUIS_ENTITY_GREETING);
    const userName = builder.EntityRecognizer.findEntity(entities, EntityTypes.LUIS_ENTITY_NAME);
    
    // checks for name
    if (userName !== null && userName.entity !== null)
    {
         session.userData.intake.name = userName.entity;   
         EntityFlags.NAME = true;
    }

    const response = determineGreeting(userHello.entity);
    dfd.resolve(response);
    return dfd.promise;
};

/**
 * Creates an appointment confirmation string.
 */
const createAppointmentConfirmationStrings = (confirmed) => {
    const responseArray = [];
    if (confirmed) {
        responseArray.push(generalMessages.AppointmentConfirmationMessages.positive);
        responseArray.push(`Looks like you're coming in for a ${appointmentReason}.`);
        responseArray.push(`We want to make sure you have time to cover any concerns you may have.`);
        responseArray.push(`There are a few topics that come up regularly in appointments like yours. You may not be` + 
        ` experiencing any of the following, but I'll ask.`);
    }
    else {
        responseArray.push(generalMessages.AppointmentConfirmationMessages.negative);
    }
    return responseArray;
}

const begin = (session, args, next) => {
    if (!session.userData.flags) {
        session.userData.flags = {
            greeting: false,
            what: false,
            volume: false,
            symptoms: false,
            selfMeds: false,
            frequency: false,
            cause: false
        };
    };
    if (session.userData.flags.greeting) {
        session.endDialog(`We've met before, haven't we?`); // end dialog if it's been done
    };
    session.userData.flags.greeting = true; // set the flag
    if (!session.userData.intake) {
        const address = session.message;
        session.userData.intake = {
            personId: session.message.address.user.id,
            conversationId: session.message.address.conversation.id
        };
    }
}

/**
 * BEGIN: Greeting Dialog
 */
const greetingDialog = (session, results, next) => {
    console.log(`received entities:`, args.entities);
    console.log(`conversation id: ${session.message.address.conversation.id}`);
    console.log(`personId: ${session.message.address.user.id}`);
    getResponseForUser(session, args.entities).then(
        (botGreeting) => {
            session.userData.intake.greeting = botGreeting;
            console.log(`botGreeting`, botGreeting);
            let userName = session.userData.intake.name;
            if (!EntityFlags.NAME) {
                prompt.text(session, `${botGreeting}. ${commonGreeting}. What's your name?`);
            }
            else {
                next(session);
            }
        }
    );
};

const processName = (session, results, next) => {
    let userName = session.userData.intake.name;
    let botGreeting = session.userData.intake.greeting;
    if (results && results.response && !EntityFlags.NAME) {
        session.userData.intake.name = results.response;
        userName = results.response;
        session.send(`Hi, ${userName}. ${commonQuestion}`);
    }
    else {
        session.send(`${botGreeting}, ${userName}. ${commonGreeting}. ${commonQuestion}`);
    }
    next();
}

const confirmAppointment = (session, results, next) => {
    session.beginDialog('/confirmAppointment');
}

const processConfirmation = (session, results, next) => {
    let confirmed = session.userData.intake.responseType;
    if (confirmed) {
        session.endDialog();
        session.replaceDialog('/what');
    }
    else
        session.endDialog(`Thank you for the information. I'll forward this to your doctor.`);
};

 

/**
 * END Greeting Dialog
 */

/**
 * This hooks in to the next dialog
 */
// const hookToNext = (session, results) => {
//     console.log(`hooked to next successfully`);
//     session.userData.intake.dialogHook = results.response;
//     session.endDialog("Okay, I'm going to ask you a few more questions.");
// }

/**
 * END: Greeting
 */

module.exports = [begin, greetingDialog, processName, confirmAppointment, processConfirmation];






