'use strict';


const hashKeys = {
    urine: 'urine',
    alcohol: 'alcohol',
    laughing: 'laughing'
};

const synonymHash = {
    [hashKeys.urine]: ['urine', 'pee', 'piss', 'leaks', 'incontinence', 'discharge', 'waste', 'secretion'],
    [hashKeys.alcohol]: ['whiskey', 'vodka', 'coke', 'rum', 'jameson', 'jaeger', 'beer', 'champagne', 'alcohol', 'hangover',
        'hungover', 'absolute', 'drinking', 'smoking', 'smoke', 'drink', 'beers']
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
                foundKey = keys[j]; // finds the associated key int he hash 
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