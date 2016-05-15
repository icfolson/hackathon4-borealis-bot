'use strict';

var azure = require('azure-storage');
var q = require('q');
var fs = require('fs');

const TABLE_ALIASES = 'table.aliases';
const TABLE_ORDERS = 'table.order';

var _tableSvc = azure.createTableService();

/*
 * Creates a table if needed, wrapped in a promise
 */
const _createTableIfNotExists = (tableName) => {
    let dfd = q.defer();
    
    tableSvc.createTableIfNotExists(tableName, (error, result, response) => {
        if(!error) {
            dfd.resolve();
        }
        else {
            dfd.reject();
        }
    });     
    
    return dfd.promise();
};

/*
 * Reads a JSON file from disk and loads it into the provided table
 */
const _batchLoadData = (tableName, jsonPath, mapEntity) => {
    let dfd = q.defer();    
    
    let entGen = azure.TableUtilities.entityGenerator;
    let content = fs.readFileSync(jsonPath);
    let data = JSON.parse(content);

    let batch = new azure.TableBatch();

    data.each((d) => {
        if(mapEntity) {
            var e = mapEntity(d, entGen);
                  
            batch.insertEntity(e); 
        }
    });

    tableSvc.executeBatch(tableName, batch, (error, result, response) => {
        if(!error) {
            dfd.resolve();
        }
        else {
            dfd.reject();
        }           
    });   
    
    return dfd.promise();      
};

/*
 * Maps an 'alais' to a table storage entity
 */
const _mapAliasJson = (data, entGen) => {
    return {
        PartitionKey: entGen.String(data.PartitionKey),
        RowKey: entGen.String(data.RowKey),
        Code: entGen.String(data.Code)                
    }; 
};

/*
 * Loads in all the master data
 */
const defineEntitiesAndAliases = () => {
    let dfd = q.defer();
    
    _createTableIfNotExists(TABLE_ALIASES).then(() => {
       return _batchLoadData(TABLE_ALIASES, '../data/cheese-aliases.json', _mapAliasJson); 
    }).then(() => {
        dfd.resolve();
    });
    
    return dfd.promise();
};

module.exports = {
    defineEntitiesAndAliases
};