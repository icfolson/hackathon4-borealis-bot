'use strict';


const hashKeys = {
    urine: 'urine',
    alcohol: 'Alcohol',
    laughing: 'Laughing',
    beverages: 'Drinking certain beverages ',
    smoking: 'Smoking',
    temperature: 'Temperature',
    sex: 'sex',
    sleeping: 'Sleeping',
    lVolume: 'largeVolume',
    sVolume: 'smallVolume',
    pads: `Pads`,
    pills: 'Pills',
    emotions: 'emotions'
};

const synonymHash = {
    [hashKeys.urine]: ['urine', 'pee', 'piss', 'leaks', 'incontinence', 'discharge', 'waste', 'secretion'],
    [hashKeys.alcohol]: ['whiskey', 'vodka', 'coke', 'rum', 'jameson', 'jaeger', 'beer', 'champagne', 'alcohol', 'hangover',
        'hungover', 'absolute', 'drinking', 'smoking', 'smoke', 'drink', 'beers'],
    [hashKeys.sex]: ['sex', 'intercourse', 'fucking', 'fuck', 'making love', 'banging'],
    [hashKeys.beverages]: ['drink water', 'drink water', 'drink pop', 'drink soda', 'drinking soda', 'drinking pop', 'water', 'pop', 'tea', 'soda'],
    [hashKeys.smoking]: ['marijuana', 'weed', 'heaters', 'darts', 'joints', 
        'mary jane', 'reefer', 'chron', 'chronic', 'pinners', 'cowboy killers', 'cigarettes', 'cigars', 'cubans', 'smoking'],
    [hashKeys.temperature]: ['hot', 'cold', 'warm', 'freezing', 'scolding'],
    [hashKeys.sleeping]: ['bed', 'night', 'sleep', 'sleeping'],
    [hashKeys.lVolume]: ['a lot', 'loads', 'tons', 'a bunch', 'too much'],
    [hashKeys.sVolume]: ['a bit', 'not much', 'some', 'a little'],
    [hashKeys.pads]: ['maxi pads', 'poise pads', 'depends', 'diapers', 'pads'],
    [hashKeys.pills]: ['oxy', 'oxycontin', 'painkillers', 'pills', 'percocet'],
    [hashKeys.emotions]: ['scared', 'sad', 'nervous', 'anxious', 'angry', 'upset', 'happy', 'laugh', 'cry', 'anxiety', 'unhappy', 'unloved', 'loved']
};

/**
 * Checks if a key exists
 */
const containsKey = (key) => {
    return synonymHash[key];
};

/**
 * Returns the key corresponding to the value in the hash if it exists
 */
const containsValue = (value) => {
    const keys = Object.keys(synonymHash);
    let foundKey;
    for (let j = 0; j < keys.length; j++) {
        const arr = synonymHash[keys[j]];
        const arrLength = arr.length;
        for(let i = 0; i < arrLength; i++) {
            if (arr[i] === value) {
                foundKey = keys[j]; // finds the associated key with a value in the hash
            }
        }
        if (foundKey)
            return foundKey;
    }
    return false;
};

module.exports = {
    hashKeys,
    containsKey,
    containsValue
};