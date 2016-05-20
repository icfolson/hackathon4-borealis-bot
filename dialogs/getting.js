'use strict';

var builder = require('botbuilder');

const LUIS_ENTITY_ACTIVITY = 'borealis.activity';
const LUIS_ENTITY_SOURCE = 'borealis.source';


const _handleAlcoholSource = (session) => {
    session.send('Alcohol is a common factor in erectile dysfunction.  How often does this occur?');
};


/* BEGIN: Intake */
const initializeOrder = (session, args, next) => {
    if (!session.dialogData.order) {
        session.dialogData.order = {};
    }

    if (!session.dialogData.luisEntities) {
        session.dialogData.luisEntities = {};
    }

    let activity = builder.EntityRecognizer.findEntity(args.entities, LUIS_ENTITY_ACTIVITY);
    let source = builder.EntityRecognizer.findEntity(args.entities, LUIS_ENTITY_SOURCE);

    let luisEntities = session.dialogData.luisEntities;

    if (activity) {
        luisEntities.activity = activity.entity;
    }

    if (source) {
        luisEntities.source = source.entity;
    }

    _handleAlcoholSource(session);
};
/* END: Intake */


module.exports = [
    initializeOrder
];