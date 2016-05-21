
'use strict';

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

const ACTIVITY_TYPE_SOLO = 'solo';
const ACTIVITY_TYPE_PARTNER = 'partner';


const handle = (session) => {
    let intake = session.dialogData.intake;
    
    console.log('in activity sub dialog');
    console.log(JSON.stringify(intake));
            
    if (intake.activity === ACTIVITY_TYPE_SOLO) {
        builder.Prompts.text(session, 'Solo text');
    } else if (intake.activity === ACTIVITY_TYPE_PARTNER) {
        builder.Prompts.text(session, 'Are you able to stay hard the whole time you’re having sex?');
    }
};


const intake = (session, results) => {
    let intake = session.dialogData.intake;

    if ( intake.activity ) {
        intake.activityComment = results.response;
        
        intakeTable.addOrUpdateItem(intake, (error) => {
            if(error) {
                throw error;
            }
        });
        
        session.send('Thanks, we can chat about this at your visit.');
    }
};

module.exports = {
    handle: handle,
    intake: intake
};