'use strict'

var uuid = require('node-uuid');
var builder = require('botbuilder');
var async = require('async');
var q = require('q');

/**
 * Attempts to collect other symptoms of the incontinence
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
    misunderstood: `Sorry, I don't understand.  Are you experiencing any pain or discomfort having to do with incontinence?`,
    next: `Okay, this is helpful information.  We'll make sure to follow up during your appointment.`
};

const endOfDialog = (session, next) => {
    session.beginDialog('/');
};



/**
 * BEGIN: symptoms Dialog
 */
const symptomsDialog = (session, args, next) => {
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
       luisConstants.getEntityValue(args.entities, luisConstants.LUIS_ENTITY_TYPES.symptoms)
            .then(symptoms => {
                session.userData.intake.symptoms = symptoms;
                next();
            });
};

const confirmSymptoms = (session, results, next) => {
    const symptoms = session.userData.intake.symptoms;
    const label = synonymHash.containsValue(symptoms);
    if (!!symptoms && !!label) {
        session.send(`${phrases.next}`);
    }
    else {
        session.send(`${phrases.misunderstood}`);
    }
    next();
    
}

module.exports = [
    symptomsDialog,
    confirmSymptoms,
    endOfDialog
]