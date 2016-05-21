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

const LUIS_ENTITY_ACTIVITY = 'borealis.activity';
const LUIS_ENTITY_SOURCE = 'borealis.source';

const ACTIVITY_TYPE_SOLO = 'solo';
const ACTIVITY_TYPE_PARTNER = 'partner';

const SOURCE_TYPE_ALCOHOL = 'alcohol';
const SOURCE_TYPE_DRUGS = 'drugs';
const SOURCE_TYPE_SMOKING = 'smoking';
const SOURCE_TYPE_STRESS = 'stressed';
const SOURCE_TYPE_DISEASE = 'disease';
const SOURCE_TYPE_PRESCRIPTION = 'rx-drug';

const _handleViceSource = (session) => {
    let intake = session.dialogData.intake;
    
    console.log(JSON.stringify(intake));
    
    switch (intake.source) {
        case SOURCE_TYPE_ALCOHOL:
            builder.Prompts.text(session, 'Drinking can be a cause. How often does this happen?');
            break;
        case SOURCE_TYPE_DRUGS:
            builder.Prompts.text(session, 'Drug use can be a cause. How often does this happen?');
            break;
        case SOURCE_TYPE_SMOKING:
            builder.Prompts.text(session, 'Smoking can be a cause. How often does this happen?');
            break;
        case SOURCE_TYPE_DISEASE:
            builder.Prompts.text(session, 'Are you currently on any medications? If yes, what ones?');
            break;
        case SOURCE_TYPE_STRESS:
            builder.Prompts.text(session, 'Stress can impact performance. How often does this happen?');
            break;
        case SOURCE_TYPE_PRESCRIPTION:
            builder.Prompts.text(session, 'Medication can be a cause. What medications are you currently taking?');
            break;
        default:
            break;
    }
};

const _handleActivity = (session) => {
    let intake = session.dialogData.intake;
    
    console.log(JSON.stringify(intake));
            
    if (intake.activity === ACTIVITY_TYPE_SOLO) {
        builder.Prompts.text(session, 'Solo text');
    } else if (intake.activity === ACTIVITY_TYPE_PARTNER) {
        builder.Prompts.text(session, 'Partner text');
    }
};

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
    
    _buildLuisEntities(args.entities, LUIS_ENTITY_SOURCE).then((x) => {
        console.log('parsed source.');
        newIntake.source = x;
        
        return _buildLuisEntities(args.entities, LUIS_ENTITY_ACTIVITY);
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
       
    let intake = session.dialogData.intake;
    
    _parseArguments(intake, args).then((x) => {
        console.log('updating the intake.');
        intakeTable.addOrUpdateItem(intake, function intakeAdded (error) {
            if(error) {
                throw error;
            }
        });

        _handleActivity(session);
    });
};

const intakeActivity = (session, results, next) => {
    let intake = session.dialogData.intake;

    if ( intake.activity ) {
        intake.activityComment = results.response;
        
        intakeTable.addOrUpdateItem(intake, (error) => {
            if(error) {
                throw error;
            }
        });
        
        _handleViceSource(session);
    }

    next(session);
};

const intakeSource = (session, results, next) => {
    let intake = session.dialogData.intake;

    if ( intake.source ) {
        intake.sourceComment = results.response;
        
        intakeTable.addOrUpdateItem(intake, (error) => {
            if(error) {
                throw error;
            }
        });
    }
    
    next(session);    
};

const endConversation = (session, results, next) => {
    session.send('Let’s chat more about this during your visit. Is there anything else you would like to share?');
};

/* END: Intake */

module.exports = [
    initializeIntake,
    intakeActivity,    
    intakeSource,
    endConversation
];