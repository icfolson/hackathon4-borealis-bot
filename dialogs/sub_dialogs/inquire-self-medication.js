'use strict';
var uuid = require('node-uuid');
var builder = require('botbuilder');
var async = require('async');
var q = require('q');

/**
 * Attempts to collect any self medication the user may have tried
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
    base: `We'll make sure Dr. Strong has that information.`,
    misunderstood: `Sorry, I don't understand.  Have you tried to treat your incontinence?  If so, with what?`,
    next: `How often would you say you're experiencing your symptoms?`,
    [keys.pads]: `Using pads and diapers to counteract the effects of incontinence is perfectly reasonable.  We'll let your doctor know.`,
    [keys.pills]: `It's best to use caution when self medicating, especially with drugs. We'll relay this information to Dr. Strong.`
};


const endOfDialog = (session, next) => {
    session.beginDialog('/');
};


/**
 * BEGIN: Self-medication dialog
 */
const sMedDialog = (session, args, next) => {
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
    builder.EntityRecognizer.findEntity(entities, luisConstants.LUIS_ENTITY_TYPES.cause);
    const label = getLabelSMed()

    luisConstants.getEntityValue(args.entities, luisConstants.LUIS_ENTITY_TYPES.selfMedication)
            .then(selfMed => {
                session.userData.intake.selfMed = selfMed;
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

const confirmSelfMedication = (session, results, next) => {
    const selfMed = session.userData.intake.selfMed;
    const label = synonymHash.containsValue(selfMed);
    if (!!selfMed && !!label) {
        if (phrases[label])
            session.send(phrases[label]);
        else
            session.send(phrases.base);
        next();
    }
    else {
        session.endDialog(phrases.misunderstood);
    } 
};

module.exports = [
    sMedDialog,
    confirmSelfMedication,
    endOfDialog
];