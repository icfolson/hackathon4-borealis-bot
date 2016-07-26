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
    volume: 'intent.volume'
};

const getEntityValue = (entities, type) => {
    const dfd = q.defer();
    let value = builder.EntityRecognizer.findEntity(entities, type);
    value = !!value ? value.entity : value;
    dfd.resolve(value);
    return dfd.promise;
}

module.exports = {
    LUIS_ENTITY_TYPES,
    LUIS_INTENTS,
    getEntityValue
};