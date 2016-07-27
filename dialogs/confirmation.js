'use strict';

/**
 * Command dialog that does nothing but confirm various types of user input.
 * 
 * If a user enters a valid affirmative or negative input as matched by the regular
 * expression below, the confirmation type will be stored in session.userData.intake.responseType
 * as a boolean flag that the parent dialog can interpret to branch
 * 
 * To call this dialog from within another dialog, use session.beginDialog('/confirm'),
 * as specified by the branch server.js
 */

/**
 * Node modules
 */
var async = require('async');
var q = require('q');
var builder = require('botbuilder');
const generalMessages = require('../misc/general-messages');

const RegExps = {
    AFFIRMATIVE : /yes|yeah|yup|yerp|ya|yeh|yep|yessir|affirmative|correct|sure|I think so/i,
    NEGATIVE    : /no|nah|nay|nope|negative|not/i
};


const confirmAffirmativeInput = (session)  => {
        session.userData.intake.responseType = true;
        session.endDialog();
};

const confirmNegativeInput = (session) => {
    session.userData.intake.responseType = false;
    session.endDialog();
};


const confirmationDialog = new builder.IntentDialog()
.matches(RegExps.AFFIRMATIVE, confirmAffirmativeInput)
.matches(RegExps.NEGATIVE, confirmNegativeInput)
.onDefault(session => console.log(`misunderstood`));

module.exports = {
    confirmationDialog  : confirmationDialog
};