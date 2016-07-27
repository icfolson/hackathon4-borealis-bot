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
    next: `Okay, this is very helpful information.  We’ll make sure to follow up during your appointment.`
};

const endOfDialog = (session, next) => {
    session.userData.flags.frequency = false;
    session.endDialog(phrases.next);
};

const begin = (session, args, next) => {
    if (!session.userData.flags.frequency) {
        session.endDialog(luisConstants.getPhraseBasedOnFlag(session.userData.flags));
    }
    else {
        session.userData.entities = args.entities;
        next();
    }    
}

/**
 * BEGIN: Frequency Dialog
 */
const frequencyDialog = (session, results, next) => {
    if (!session.userData.intake) {
        const address = session.message;
        session.userData.intake = {
            personId: session.message.address.user.id,
            conversationId: session.message.address.conversation.id
        };
    }

    luisConstants.getEntityValue(session.userData.entities, luisConstants.LUIS_ENTITY_TYPES.frequency)
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
    begin,
    frequencyDialog,
    confirmFrequency,
    endOfDialog
];