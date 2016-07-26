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
    session.endDialog(phrases.next);
};

const phrases = {
    misunderstood: `Sorry, I don't understand.  What do you think may be causing your incontinence?`,
    next: `About how much leakage are you experiencing when this happens? Just a little bit, or a noticeable amount?`,
    [keys.sleeping]: `These things sometimes happen when we sleep.`,
    [keys.alcohol]: `Alcohol can play a major role in urinary incontinence`,
    [keys.beverages]: `Often times beverages can play a role in urinary incontinence`,
    [keys.smoking]: 'Smoking can play a major role in urinary incontinence',
    [keys.temperature]: `How our body responds to temperature can directly impact out ability to hold our bladder.`
};

/**
 * BEGIN: Cause Dialog
 */
const causeDialog = (session, args, next) => {
    if (!session.userData.intake) {
        const address = session.message.address;
        session.userData.intake = {
            personId: address.user.id,
            conversationId: address.conversation.id
        };
    }
    //console.log(`received entities:`, args.entities);
    luisConstants.getEntityValue(args.entities, luisConstants.LUIS_ENTITY_TYPES.cause)
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
    causeDialog,
    confirmCause,
    endOfDialog
];
