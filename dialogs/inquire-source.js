
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


const SOURCE_TYPE_ALCOHOL = 'alcohol';
const SOURCE_TYPE_DRUGS = 'drugs';
const SOURCE_TYPE_SMOKING = 'smoking';
const SOURCE_TYPE_STRESS = 'stressed';
const SOURCE_TYPE_DISEASE = 'disease';
const SOURCE_TYPE_PRESCRIPTION = 'rx-drug';


const handle = (session) => {
    let intake = session.dialogData.intake;
    
    console.log('in source sub dialog');    
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


const intake = (session, results) => {
    let intake = session.dialogData.intake;

    if ( intake.source ) {      
        intake.sourceComment = results.response;
        
        intakeTable.addOrUpdateItem(intake, (error) => {
            if(error) {
                throw error;
            }
        });
    }
};

module.exports = {
    handle: handle,
    intake: intake
};