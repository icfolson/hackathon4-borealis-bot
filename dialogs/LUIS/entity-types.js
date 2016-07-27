'use strict';
var uuid = require('node-uuid');
var builder = require('botbuilder');
var async = require('async');
var q = require('q');


const LUIS_ENTITY_TYPES = {
    selfMedication: 'incontinence.selfMedication',
    cause: 'incontinence.cause',
    frequency: 'incontinence.frequency',
    symptoms: 'incontinence.symptoms',
    volume: 'incontinence.volume'
};


const LUIS_INTENTS = {
    cause: 'intent.cause',
    selfMedication: 'intent.selfMedication',
    frequency: 'intent.frequency',
    symptoms: 'intent.symptoms',
    volume: 'intent.volume',
    reset: 'intent.reset'
};

const getEntityValue = (entities, type) => {
    const dfd = q.defer();
    let value = builder.EntityRecognizer.findEntity(entities, type);
    value = !!value ? value.entity : value;
    dfd.resolve(value);
    return dfd.promise;
}

const getPhraseBasedOnFlag = (flags) => {
    if (flags.greeting) {
        return `We should probably greet each other before getting into that.`;
    }
    else if (flags.cause) {
        return `Before getting into that, why don't you tell me what you think is causing your incontinence?`;
    }
    else if (flags.volume) {
        return `Let's hold off on that information for a moment.  How much fluid do you feel you lose during bouts of incontinence?`
    }
    else if (flags.selfMedication) {
        return `Before we talk more about that, would you mind telling me more about how you relieve your symptoms, if at all?`
    }
    else if (flags.frequency) {
        return `Before moving onto that subject, would you please describe how often your incontinence occurs?`
    }
    else {
        return `This dialog has finished and needs to be reset for another client.  Type \"reset luis dialog\" to reset.`
    };
};

module.exports = {
    LUIS_ENTITY_TYPES,
    LUIS_INTENTS,
    getEntityValue,
    getPhraseBasedOnFlag
};