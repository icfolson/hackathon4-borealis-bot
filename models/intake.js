var azure = require('azure-storage');
var uuid = require('node-uuid');
var entityGen = azure.TableUtilities.entityGenerator;

module.exports = Intake;

function Intake(storageClient, tableName, partitionKey) {
  this.storageClient = storageClient;
  this.tableName = tableName;
  this.partitionKey = partitionKey;
  this.storageClient.createTableIfNotExists(tableName, function tableCreated(error) {
    if(error) {
      throw error;
    }
  });
};

Intake.prototype = {
  find: function(query, callback) {
    self = this;
    self.storageClient.queryEntities(this.tableName, query, null, function entitiesQueried(error, result) {
      if(error) {
        callback(error);
      } else {
        callback(null, result.entries);
      }
    });
  },

  addOrUpdateItem: function(item, callback) {
    self = this;
    // use entityGenerator to set types
    // NOTE: RowKey must be a string type, even though
    // it contains a GUID in this example.
    var itemDescriptor = {
      PartitionKey: entityGen.String(self.partitionKey),
      RowKey: entityGen.String(uuid()),
      personId: entityGen.String(item.personId),
      conversationId: entityGen.String(item.conversationId),
      completed: entityGen.Boolean(false),
      activity: entityGen.String(item.activity ? item.activity : null),
      source: entityGen.String(item.source ? item.source : null),
    };

    self.storageClient.insertOrMergeEntity(self.tableName, itemDescriptor, function entityInserted(error) {
      if(error){  
        callback(error);
      }
      callback(null);
    });
  },

  updateItem: function(rKey, callback) {
    self = this;
    self.storageClient.retrieveEntity(self.tableName, self.partitionKey, rKey, function entityQueried(error, entity) {
      if(error) {
        callback(error);
      }
      entity.completed._ = true;
      self.storageClient.updateEntity(self.tableName, entity, function entityUpdated(error) {
        if(error) {
          callback(error);
        }
        callback(null);
      });
    });
  }
}