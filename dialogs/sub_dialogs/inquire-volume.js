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
const keys = synonymHash.hashKeys;

const phrases = {
    misunderstood: `Sorry, I don't understand.  About how much urine would you say you lose during these experiences?`,
    next: `Have you done or tried anything to relieve your symptoms?  If so, what?`,
    [keys.sVolume]: `Though that's not necessarily anything to worry about, we'll still take note.`,
    [keys.lVolume]: `I will definitely relate that information to your doctor for you.`
};

const endOfDialog = (session, next) => {
    session.endDialog(phrases.next);
};


/**
 * BEGIN: Frequency Dialog
 */
const volumeDialog = (session, args, next) => {
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

    luisConstants.getEntityValue(args.entities, luisConstants.LUIS_ENTITY_TYPES.volume)
            .then(volume => {
                session.userData.intake.volume = volume;
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

const confirmVolume= (session, results, next) => {
    const volume = session.userData.intake.volume;
    const label = synonymHash.containsValue(volume);
    if (!!volume && !!label)
    {
        if (phrases[label]){
            session.send(phrases[label]);
        }
        else {
            session.send(phrases[keys.lVolume]);
        }
        next();
    }
    else {
        session.endDialog(`${phrases.misunderstood}`);
    }
};

module.exports = [
    volumeDialog,
    confirmVolume,
    endOfDialog
];