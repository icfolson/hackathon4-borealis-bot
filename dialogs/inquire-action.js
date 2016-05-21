

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
            
    if (intake.activity == ACTIVITY_TYPE_SOLO) {
        builder.Prompts.text(session, 'Some text?');
    }
};


const intake = (session, results, next) => {
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

module.exports = {
    handle: handle,
    intake: intake
};