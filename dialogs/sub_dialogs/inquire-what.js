'use strict';

/**
 * This file represents a subdialog in the dialog stream used with LUIS 
 * in regards to incontinence.  
 * 
 * Goal: Acquire the TYPE of incontinence the user is experiencing.
 * 
 */

var uuid = require('node-uuid');
var builder = require('botbuilder');
var async = require('async');
var q = require('q');

/**
 * The screen prompter to send text to the user for more information
 */

/**
 * Utility function to han
 */
const promptUser = (session, value) => {
    builder.Prompts.text(session, `You mentioned ${value}.  Tell me more about that.`);
};


const ValidTypes = {
    FECAL   : "FECAL",
    URINARY : "URINARY"
};


const handle  = (session, value) => {
    let intake = session.userData.intake;
    promptUser(session, value);
};

// branch off the dialog tree

module.exports = {
    promptUser : promptUser,
    handle : handle
};

