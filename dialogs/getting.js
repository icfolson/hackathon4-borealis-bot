'use strict';

// Table storage!!

var uuid = require('node-uuid');
var tableName = "intakes"; // 'TABLE_NAME'
var partitionKey = "myintakes"; // 'PARTITION_KEY'
var accountName = "borealiststest"; // 'STORAGE_NAME'
var accountKey = "kqVzaboKITxfcNdgq9Ws2zX/DGsemwBsXIfGO8CpAmuTZEBnX/ozO2zT1hE1gSi5k2PuRYeDfFnQxuawxvDM7Q=="; // 'STORAGE_KEY'
var azure = require('azure-storage');
var async = require('async');

var builder = require('botbuilder');

var Intake = require('../models/intake');
var intake = new Intake(azure.createTableService(accountName, accountKey), tableName, partitionKey);

const LUIS_ENTITY_ACTIVITY = 'borealis.activity';
const LUIS_ENTITY_SOURCE = 'borealis.source';

const _handleAlcoholSource = (session) => {
    session.endDialog('Alcohol is a common factor in erectile dysfunction.  How often does this occur?');
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
    
    var newIntake = { 
        personId: session.message.from.id,
        conversationId: session.message.conversationId,
    };
    
    if (activity) {
        luisEntities.activity = activity.entity;
        newIntake.activity = activity.entity;
    }

    if (source) {
        luisEntities.source = source.entity;
        newIntake.source = source.entity;
    }
    
    intake.addItem(newIntake, function intakeAdded (error) {
        if(error) {
            throw error;
        }
    });

    _handleAlcoholSource(session);
};
/* END: Intake */

module.exports = [
    initializeOrder
];