

var uuid = require('node-uuid');
var tableName = "intakes"; // 'TABLE_NAME'
var partitionKey = "myintakes"; // 'PARTITION_KEY'
var accountName = "borealiststest"; // 'STORAGE_NAME'
var accountKey = "kqVzaboKITxfcNdgq9Ws2zX/DGsemwBsXIfGO8CpAmuTZEBnX/ozO2zT1hE1gSi5k2PuRYeDfFnQxuawxvDM7Q=="; // 'STORAGE_KEY'
var azure = require('azure-storage');
var async = require('async');
var Entity = require('../models/entity');
var q = require('q');

var Intake = require('../models/intake');
var intakeTable = new Intake(azure.createTableService(accountName, accountKey), tableName, partitionKey);


const handle = (session) => {
    let intake = session.dialogData.intake;
    
    console.log(JSON.stringify(intake));
            
    if (intake.source == SOURCE_TYPE_ALCOHOL) {
        builder.Prompts.text(session, 'Drinking can be a cause. How often does this happen?');
    }
};


const intake = (session, results, next) => {
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

module.exports = {
    handle: handle,
    intake: intake
};