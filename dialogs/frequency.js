'use strict';

var builder = require('botbuilder');

const LUIS_ENTITY_ACTIVITY = 'borealis.activity';
const LUIS_ENTITY_SOURCE = 'borealis.source';


/* BEGIN: Intake */
const initializeOrder = (session, args, next) => {
    //save to state somehow
    
    console.log(JSON.stringify(args));    
    session.send('Ok, thanks for that information. [in frequency]');
};
/* END: Intake */


module.exports = [
    initializeOrder
];