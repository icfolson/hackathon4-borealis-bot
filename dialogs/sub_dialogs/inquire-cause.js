'use strict'

var uuid = require('node-uuid');
var builder = require('botbuilder');
var async = require('async');
var q = require('q');

/**
 * Attempts to collect the cause of the incontinence
 */

/**
 * Intents: cause
 * EntityTypes: cause
 * Synonyms: drinking, smoking, sex, diet
 */

const luisConstants = require('../LUIS/entity-types');
const synonymHash = require('../../data/synonym-hash');
const keys = synonymHash.hashKeys;

/**
 * End of dialog
 */
const endOfDialog = (session, next) => {
    session.userData.flags.cause = false;
    session.userData.flags.volume = true; // set next stage of conversation
    session.userData.nextPhrase = `How much liquid do you think you lose when you experience incontinence?`;
    session.endDialog(phrases.next);
};

const phrases = {
    misunderstood: `Sorry, I don't understand.  What do you think may be causing your incontinence?`,
    next: `About how much leakage are you experiencing when this happens? Just a little bit, or a noticeable amount?`,
    [keys.sleeping]: `These things sometimes happen when we sleep.`,
    [keys.alcohol]: `Alcohol can play a major role in urinary incontinence`,
    [keys.beverages]: `Often times beverages can play a role in urinary incontinence`,
    [keys.smoking]: 'Smoking can play a major role in urinary incontinence',
    [keys.temperature]: `How our body responds to temperature can directly impact out ability to hold our bladder.`,
    [keys.emotions]: `Sometimes emotions can cause our body to do unexpected things.  I'll relate this to your doctor`,
    alternate: `This could be a probable cause.  We'll send the info to your doctor.`
};

const altPhrases = {
    [keys.sleeping]: `As I mentioned before, ${phrases[keys.sleeping]}`
}

/**
 * BEGIN: Cause Dialog
 */

const begin = (session, args, next) => {
    if (!session.userData.flags.cause){
        session.endDialog(luisConstants.getPhraseBasedOnFlag(session.userData.flags));
    }
    else {
        session.userData.entities = args.entities;
        next();
    }
}

const causeDialog = (session, results, next) => {
    if (!session.userData.intake) {
        console.log(`here`);
        const address = session.message.address;
        session.userData.intake = {
            personId: address.user.id,
            conversationId: address.conversation.id
        };
    }
    //console.log(`received entities:`, args.entities);
    luisConstants.getEntityValue(session.userData.entities, luisConstants.LUIS_ENTITY_TYPES.cause)
            .then(cause => {
                session.userData.intake.cause = cause;
                next();
            });
};

const confirmCause = (session, results, next) => {
    const cause = session.userData.intake.cause;
    let label = synonymHash.containsValue(cause);
    
    if (!!label && !!cause) {
        session.send(`${phrases[label]}`);
        next();
    }
    else {
        session.endDialog(`${phrases.misunderstood}`);
    }
}

module.exports = [
    begin,
    causeDialog,
    confirmCause,
    endOfDialog
];
