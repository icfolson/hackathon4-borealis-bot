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
var intake = new Intake(azure.createTableService(accountName, accountKey), tableName, partitionKey);

const LUIS_ENTITY_ACTIVITY = 'borealis.activity';
const LUIS_ENTITY_SOURCE = 'borealis.source';

const _handleViceSource = (session, newIntake) => {
    let source = newIntake.source;
    
    console.log('the vice source is ' + source);
    
    session.dialogData.order.source = source;
    
    if (source == 'alcohol') {
        builder.Prompts.text(session, 'Drinking can be a cause. How often does this happen?');
    }
};

const _buildLuisEntities = (entities, entityName) => {
    let entity = new Entity(azure.createTableService(accountName, accountKey), 'entities', entityName);
    
    let dfd = q.defer();
    let parsedEntity = builder.EntityRecognizer.findEntity(entities, entityName);
    let entityValue = parsedEntity ? parsedEntity.entity : null;
    
    console.log('looking up entity ' + entityName);
    
    if( entityValue ) {
        let azureQuery = new azure.TableQuery();
            
        let query = azureQuery.where("RowKey eq ?", entityValue);
        
        let thing = entity.find(query, (error, res) => {
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
const initializeOrder = (session, args, next) => {
    if (!session.dialogData.order) {
        session.dialogData.order = {};
    }
       
    var newIntake = { 
        personId: session.message.from.id,
        conversationId: session.message.conversationId
    };
    
    _parseArguments(newIntake, args).then((x) => {
        intake.addOrUpdateItem(newIntake, function intakeAdded (error) {
            if(error) {
                throw error;
            }
        });

        _handleViceSource(session, newIntake);
    });
    
    
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