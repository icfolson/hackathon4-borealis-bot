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

const _handleViceSource = (session, newIntake) => {
    let source = 'alcohol'
    
    session.dialogData.order.source = source;
    
    if (source == 'alcohol') {
        builder.Prompts.text(session, 'Drinking can be a cause. How often does this happen?');
    }
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
       
    var newIntake = { 
        personId: session.message.from.id,
        conversationId: session.message.conversationId,
        activity: _buildLuisEntities(args.entities, LUIS_ENTITY_ACTIVITY),
        source: _buildLuisEntities(args.entities, LUIS_ENTITY_SOURCE)
    };
            
    intake.addItem(newIntake, function intakeAdded (error) {
        if(error) {
            throw error;
        }
    });

    _handleViceSource(session, newIntake);
};

const intakeName = (session, results, next) => {
    let order = session.dialogData.order;

    if ( order.source ) {
        //get the intake ...
        
        var inTake = {
            source: results.response
        }
        
        //save the state back  
    }

    session.send('Let’s chat more about this during your visit. Is there anything else you would like to share?');

    next(session);
};

/* END: Intake */

module.exports = [
    initializeOrder,
    intakeName
];