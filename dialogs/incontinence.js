'use strict';

/**
 * Node modules
 */
var async = require('async');
var q = require('q');
var builder = require('botbuilder');

/**
 * Sub dialogs
 */

var inquireWhat = require('./sub_dialogs/inquire-what');

/**
 * LUIS entity Types
 */

const EntityTypes = {
 LUIS_ENTITY_WHAT       : "incontinence.what", 
 LUIS_ENTITY_WHO        : "incontinence.who",
 LUIS_ENTITY_EMOTION    : "incontinence.emotion",
 LUIS_ENTITY_OTHER      : "incontinence.other",
 LUIS_ENTITY_GREETING   : "incontinence.greeting"
};

/**
 * Entity flags
 */

const EntityFlags = {
    LUIS_ENTITY_WHAT    : false,
    LUIS_ENTITY_WHO     : false,
    LUIS_ENTITY_EMOTION : false,
    LUIS_ENTITY_OTHER   : false
};

/**
 * Storage in Memory
 */

const EntityStorage = {
    incontinence    : "",
    what            : "URINARY",
    emotion         : "",
    other           : ""
};

/**
 * Utility Functions
 */


/**
 * Parses the entities LUIS sends based on the entity type
 */
const parseEntities = (entities, entityType, entityFlag, entityStorage) => {

    const dfd = q.defer();

    console.log(`Flag: ${entityFlag}`);
    console.log(`entities:`, entities);
    console.log(`entityStorage`, entityStorage);
    console.log(`Looking up entityType: ${entityType}`);
    // try to find the entity based on the entity type (first occurrence)
    let parsedEntity = builder.EntityRecognizer.findEntity(entities, entityType);
    console.log(`Parsed Entity`);
    // get the value of entity 
    let entityValue = parsedEntity ? parsedEntity.entity : null;
    console.log(`entityValue: ${entityValue}`);
    entityFlag = entityValue !== null;
    entityStorage = entityValue;
    dfd.resolve(entityValue);
    return dfd.promise;
}



/**
 * Initial Entry point to incontinence dialog (LUIS calls this)
 */
const initializeIntake = (session, args, next) => {
    // create an intake field for user data if it doesn't exist
    if (!session.userData.intake) {
        session.userData.intake = {
            personId: session.message.from.id,
            conversationId: session.message.conversationId
        };
    }

    // intake arguments (LUIS entities)
    console.log(`LUIS transmitted: ${JSON.stringify(args.entities)} `);
    let intake = session.userData.intake;
    
    /** 
     * parse the arguments to find the entity we want
     * then query the database to find the entity we want
     * what are we doing with the resolved value here?
     */
    parseEntities(args.entities, EntityTypes.LUIS_ENTITY_WHAT,
                        EntityFlags.LUIS_ENTITY_WHAT, EntityStorage.what).then((value) => {
        console.log('Updating the intake.');
        // finally send the message through the waterfall...
        inquireWhat.handle(session, value);
        // going to end conversation for now
        next(session);
    });
};

const endConversation = (session, results, next) => {
    session.endDialog('Let’s chat more about this during your visit. Is there anything else you would like to share?');
};


module.exports = [
    initializeIntake,
    endConversation
]