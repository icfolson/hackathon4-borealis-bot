'use strict';

var builder = require('botbuilder');

const LUIS_ENTITY_ACTIVITY = 'borealis.activity';
const LUIS_ENTITY_SOURCE = 'borealis.source';


const _handleAlcoholSource = (session) => {
    session.endDialog('Alcohol is a common factor in erectile dysfunction.  How often does this occur?');
};

const _buildLuisEntities = (entities, entityName) => {
    let parsedEntity = builder.EntityRecognizer.findEntity(entities, entityName);
    
    return parsedEntity ? parsedEntity.entity : null;
};


/* BEGIN: Intake */
const initializeOrder = (session, args, next) => {
    if (!session.dialogData.order) {
        session.dialogData.order = {};
    }

    if (!session.dialogData.luisEntities) {
        session.dialogData.luisEntities = {};
    }

    let luisEntities = session.dialogData.luisEntities;

    luisEntities.activity = _buildLuisEntities(args.entities, LUIS_ENTITY_ACTIVITY);
    luisEntities.source = _buildLuisEntities(args.entities, LUIS_ENTITY_SOURCE);

    _handleAlcoholSource(session);
};
/* END: Intake */


module.exports = [
    initializeOrder
];