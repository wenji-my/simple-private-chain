/* ===== Persist data with LevelDB ===================================
|  Learn more: level: https://github.com/Level/level     |
|  =============================================================*/

const level = require('level');
const chainDB = './chaindata';
const db = level(chainDB);

// Add data to levelDB with key/value pair
function addLevelDBData(key,value){
  db.put(key, value, function(err) {
    if (err) return console.log('Block ' + key + ' submission failed', err);
  })
}

// Get data from levelDB with key
async function getLevelDBData(key){
  return await db.get(key)
}
// Add data to levelDB with value
function addDataToLevelDB(key, value) {
  let i = key;
  let dataArray = [];
    return new Promise((resolve, reject) => {
      db.createReadStream().on('data', function(data) {
            i++;
            dataArray.push(data)
          }).on('error', function(err) {
              return console.log('Unable to read data stream!', err)
          }).on('close', function() {
            addLevelDBData(key, value)
            resolve(dataArray)
          });
      
    })
}

function getDataArray() {
  let dataArray = [];
  return new Promise((resolve, reject) => {
    db.createReadStream().on('data', function(data) {
          dataArray.push(data)
        }).on('error', function(err) {
            return console.log('Unable to read data stream!', err)
        }).on('close', function() {
          resolve(dataArray)
        });
  })
}

/* ===== Testing ==============================================================|
|  - Self-invoking function to add blocks to chain                             |
|  - Learn more:                                                               |
|   https://scottiestech.info/2014/07/01/javascript-fun-looping-with-a-delay/  |
|                                                                              |
|  * 100 Milliseconds loop = 36,000 blocks per hour                            |
|     (13.89 hours for 500,000 blocks)                                         |
|    Bitcoin blockchain adds 8640 blocks per day                               |
|     ( new block every 10 minutes )                                           |
|  ===========================================================================*/

module.exports = {
  addDataToLevelDB, getLevelDBData, getDataArray
}
