'use strict';

/**
 * This file represents a subdialog in the dialog stream used with LUIS 
 * in regards to incontinence.  
 * 
 * Goal: Acquire if the patient has incontinence or not.
 * 
 */

var uuid = require('node-uuid');
var builder = require('botbuilder');
var async = require('async');
var q = require('q');

/**
 * The screen prompter to send text to the user for more information
 */

const prompter = builder.Prompts;

const TIMEOUT = 1000;

const prompts = {
    prompt0: `Great! Looks like you’re coming in for a general physical. `, 
    prompt1: `We want to make sure you have time to cover any concerns you may have. `,
    prompt2: `There are a few topics that come up regularly in appointments like yours. `,
    prompt3: `You may not be experiencing any of the following, but I’ll ask anyway. Just to be sure!`,
    prompt4: `Are you having any sleep issues – (snoring, insomnia, breathing during sleep, etc.)?`,
    prompt5: `Have you had any recent or ongoing experience related to urinary incontinence?`
};

const phrases = {
    next: 'Okay, tell me a little more about what you think might be causing it.'
};

const recursivePrompt = (num, numPrompts, session, next) => {
    for (let i= 0; i < numPrompts; i++)
    {
        // skipping alternative question for now
        if (i === numPrompts - 2)
            break;
        session.send(prompts[`prompt${i}`]);
    }
    builder.Prompts.text(session, prompts[`prompt${numPrompts-1}`]);
    // if (num === numPrompts) {
    //     setTimeout(() => {
    //         return;
    //     }, TIMEOUT);
    // }
    // setTimeout(() => {
    //     session.send(prompts[`prompt${num}`]);
    //     recursivePrompt(num + 1, numPrompts, session);
    // }, TIMEOUT);
};



/**
 * Utility function to han
 */
const promptUser = (session, args, next) => {
    recursivePrompt(0, 6, session, next);
};

const confirm = (session, results, next) => {
    session.beginDialog('/confirmIncontinence');
    next();
}

const processC  = (session, results, next) => {
    const confirmed = session.userData.intake.responseType;
    if (!confirmed) {
        session.endDialog(`That is great to hear.  I'll forward this information to your doctor.`);
    }
    else {
        session.send(phrases.next);
    }
};

const beginNext = (session, args, next) => {
    session.beginDialog('/');
}

// branch off the dialog tree

module.exports = [
    promptUser,
    confirm,
    processC,
    beginNext
];

