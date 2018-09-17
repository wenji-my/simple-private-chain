/* ===== SHA256 with Crypto-js ===============================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js  |
|  =========================================================*/

const SHA256 = require('crypto-js/sha256');
const levelSandbox = require('./levelSandbox')

/* ===== Block Class ==============================
|  Class with a constructor for block 			   |
|  ===============================================*/

class Block{
	constructor(data){
     this.hash = "",
     this.height = 0,
     this.body = data,
     this.time = 0,
     this.previousBlockHash = ""
    }
}

/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain 		|
|  ================================================*/

class Blockchain{
  constructor(){
    this.chain = [];
    this.addBlock(new Block("First block in the chain - Genesis block"));
  }

  // Add new block
  addBlock(newBlock){
    // Block height
    newBlock.height = this.chain.length;
    // UTC timestamp
    newBlock.time = new Date().getTime().toString().slice(0,-3);
    // previous block hash
    if(this.chain.length>0){
      newBlock.previousBlockHash = this.chain[this.chain.length-1].hash;
    }
    // Block hash with SHA256 using newBlock and converting to a string
    newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
    // Adding block object to chain
    this.chain.push(newBlock);
    if (this.chain.length>0) {
      return levelSandbox.addDataToLevelDB(newBlock.height,JSON.stringify(newBlock).toString())
    }else {
      return levelSandbox.addDataToLevelDB(0,JSON.stringify(newBlock).toString())
    }
  }

  // Get block height
    getBlockHeight(){
      return levelSandbox.getDataArray().then(res => {
        this.chain = res
        return this.chain.length-1;
      })
    }

    // get block
    getBlock(blockHeight){
      // return object as a single string
      // return JSON.parse(JSON.stringify(this.chain[blockHeight]));
      return JSON.parse(levelSandbox.getLevelDBData(blockHeight))
    }

    // validate block
    validateBlock(blockHeight){
      // get block object
      let block = this.getBlock(blockHeight);
      // get block hash
      let blockHash = block.hash;
      // remove block hash to test block integrity
      block.hash = '';
      // generate block hash
      let validBlockHash = SHA256(JSON.stringify(block)).toString();
      // Compare
      if (blockHash===validBlockHash) {
          return true;
        } else {
          console.log('Block #'+blockHeight+' invalid hash:\n'+blockHash+'<>'+validBlockHash);
          return false;
        }
    }

   // Validate blockchain
    validateChain(){
      // get chain within the LevelDB
      levelSandbox.getDataArray().then(res => {
        this.chain = res
        let errorLog = [];
        for (var i = 0; i < this.chain.length-1; i++) {
          // validate block
          if (!this.validateBlock(i))errorLog.push(i);
          // compare blocks hash link
          let blockHash = this.chain[i].hash;
          let previousHash = this.chain[i+1].previousBlockHash;
          if (blockHash!==previousHash) {
            errorLog.push(i);
          }
        }
        if (errorLog.length>0) {
          console.log('Block errors = ' + errorLog.length);
          console.log('Blocks: '+errorLog);
        } else {
          console.log('No errors detected');
        }
      })
    }
}

let myBlockChain = new Blockchain();
(function theLoop(i) {
  setTimeout(() => {
    let blockTest = new Block("Test Block - " + (i + 1));
    myBlockChain.addBlock(blockTest).then(res => {
      console.log(res)
      i++;
      if (i < 10) theLoop(i);
    })
  }, 100);
})(0);

