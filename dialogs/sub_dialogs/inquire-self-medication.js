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
    [keys.pills]: `It's best to use caution when self medicating, especially with pills, drugs, or alcohol. We'll relay this information to Dr. Strong.`
};


const endOfDialog = (session, next) => {
    session.userData.flags.selfMedication = false;
    session.userData.flags.frequency = true;
    session.endDialog(phrases.next);
};

const begin = (session, args, next) => {
    if (!session.userData.flags.selfMedication) {
        session.endDialog(luisConstants.getPhraseBasedOnFlag(session.userData.flags));
    }
    else {
        session.userData.entities = args.entities;
        next();
    }    
}


/**
 * BEGIN: Self-medication dialog
 */
const sMedDialog = (session, results, next) => {
    if (!session.userData.intake) {
        const address = session.message;
        session.userData.intake = {
            personId: session.message.address.user.id,
            conversationId: session.message.address.conversation.id
        };
    }
    luisConstants.getEntityValue(session.userData.entities, luisConstants.LUIS_ENTITY_TYPES.selfMedication)
            .then(selfMed => {
                session.userData.intake.selfMed = selfMed;
                next();
            });
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
    begin,
    sMedDialog,
    confirmSelfMedication,
    endOfDialog
];