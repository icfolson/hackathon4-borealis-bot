'use strict'

var uuid = require('node-uuid');
var builder = require('botbuilder');
var async = require('async');
var q = require('q');

/**
 * Attempts to collect the cause of the incontinence
 */


/**
 * 
 * EntityTypes.cause ->
cause labels: drinking, laughing, anxiety, sex
EntityTypes.selfMedication ->
selfMeds labels: pills, drugs, over-the-counter, etc
EntityTypes.frequency ->
labels: months, days, years,
EntityTypes.symptoms ->
labels: pain, anxiety,
 */

const luisConstants = require('../LUIS/entity-types');
const synonymHash = require('../../data/synonym-hash');

const phrases = {
    misunderstood: `Sorry, I don't understand.  About how often would you say you experience incontinence?`,
    next: `Have you done or tried anything to relieve your symptoms?`
};

const endOfDialog = (session, next) => {
    session.endDialog(phrases.next);
};


/**
 * BEGIN: Frequency Dialog
 */
const frequencyDialog = (session, args, next) => {
    if (!session.userData.intake) {
        const address = session.message;
        session.userData.intake = {
            personId: session.message.address.user.id,
            conversationId: session.message.address.conversation.id
        };
    }
    console.log(`received entities:`, args.entities);
    console.log(`conversation id: ${session.message.address.conversation.id}`);
    console.log(`personId: ${session.message.address.user.id}`);

    luisConstants.getEntityValue(args.entities, luisConstants.LUIS_ENTITY_TYPES.frequency)
            .then(freq => {
                session.userData.intake.frequency = freq;
                next();
            });
    // getResponseForUser(session, args.entities).then(
    //     (botGreeting) => {
    //         session.userData.intake.greeting = botGreeting;
    //         console.log(`botGreeting`, botGreeting);
    //         let userName = session.userData.intake.name;
    //         if (!EntityFlags.NAME) {
    //             prompt.text(session, `${botGreeting}. ${commonGreeting}. What's your name?`);
    //         }
    //         else {
    //             next(session);
    //         }
    //     }
    // );
};

const confirmFrequency = (session, results, next) => {
    if (!session.userData.intake.frequency)
    {
        session.endDialog(`${phrases.misunderstood}`);
    }
    else {
        next();
    }

}

module.exports = [
    frequencyDialog,
    confirmFrequency,
    endOfDialog
];