'use strict';

// Table storage!!

var uuid = require('node-uuid');
var tableName = "intakes"; // 'TABLE_NAME'
var partitionKey = "myintakes"; // 'PARTITION_KEY'
var accountName = "borealiststest"; // 'STORAGE_NAME'
var accountKey = "kqVzaboKITxfcNdgq9Ws2zX/DGsemwBsXIfGO8CpAmuTZEBnX/ozO2zT1hE1gSi5k2PuRYeDfFnQxuawxvDM7Q=="; // 'STORAGE_KEY'
var azure = require('azure-storage');
var async = require('async');
var Entity = require('../models/entity');
var q = require('q');

var builder = require('botbuilder');

var Intake = require('../models/intake');
var intakeTable = new Intake(azure.createTableService(accountName, accountKey), tableName, partitionKey);

var activitySubDialog = require('./inquire-activity');
var sourceSubDialog = require('./inquire-source');

const LUIS_ENTITY_ACTIVITY = 'borealis.activity';
const LUIS_ENTITY_SOURCE = 'borealis.source';

const _buildLuisEntities = (entities, entityName) => {
    let entity = new Entity(azure.createTableService(accountName, accountKey), 'entities', entityName);
    
    let dfd = q.defer();
    let parsedEntity = builder.EntityRecognizer.findEntity(entities, entityName);
    let entityValue = parsedEntity ? parsedEntity.entity : null;
    
    console.log('looking up entity ' + entityName + ' with value ' + entityValue);
    
    if( entityValue ) {
        let azureQuery = new azure.TableQuery();
            
        let query = azureQuery.where("RowKey eq ?", entityValue);
        
        let thing = entity.find(query, (error, res) => {
            console.log(JSON.stringify(res));
            let value = res && res.length > 0 ? res[0].Type._ : null;
            dfd.resolve(value);
        }); 
    } else {
        console.log('did not recieve anything from luis for ' + entityName);
        dfd.resolve(null);
    }
    
    return dfd.promise;
};

const _parseArguments = (newIntake, args) => {
    let dfd = q.defer();
    let entities = args ? args.entities : [];
    
    _buildLuisEntities(entities, LUIS_ENTITY_SOURCE).then((x) => {
        console.log('parsed source.');
        newIntake.source = x;
        
        return _buildLuisEntities(entities, LUIS_ENTITY_ACTIVITY);
    }).then((x) => {
        console.log("parsed activity");
        newIntake.activity = x;
        
        dfd.resolve();
    });
    
    return dfd.promise;
};

/* BEGIN: Intake */
const initializeIntake = (session, args, next) => {
    if (!session.dialogData.intake) {
        session.dialogData.intake = {
            personId: session.message.from.id,
            conversationId: session.message.conversationId
        };
    }
    
    console.log(JSON.stringify(args));
    let intake = session.dialogData.intake;
    
    _parseArguments(intake, args).then((x) => {
        console.log('updating the intake.');
        intakeTable.addOrUpdateItem(intake, (error) => {
            if(error) {
                throw error;
            }
        });

        activitySubDialog.handle(session);
        
        next(session);
    });
};

const intakeActivity = (session, results, next) => {
    activitySubDialog.intake(session, results);

    sourceSubDialog.handle(session);
    
    next(session);
};

const intakeSource = (session, results, next) => {
    sourceSubDialog.intake(session, results);
    
    next(session);    
};

const endConversation = (session, results, next) => {
    session.endDialog('Let’s chat more about this during your visit. Is there anything else you would like to share?');
};

/* END: Intake */

module.exports = [
    initializeIntake,
    intakeActivity,    
    intakeSource,
    endConversation
];