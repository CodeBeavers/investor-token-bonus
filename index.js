const Web3 = require('web3');
const config = require("./config.js");
const BigNumber = require('bignumber.js');

const etherBonus = new BigNumber(config.etherForBonus).mul(10**18);

const web3 = new Web3(new Web3.providers.HttpProvider(config.ethereumNodeAddress));
const tokenContract =  web3.eth.contract(config.tokenAbi).at(config.tokenAddress);

let latestBlockNumber = web3.eth.blockNumber;
let investorsCount = tokenContract.tokenHoldersCount.call({}, latestBlockNumber);
let tokenOwner = tokenContract.owner.call();

let beneficiaries = [];
let tokensInMarket = new BigNumber();
for(let investorIndex = 0; investorIndex < investorsCount; investorIndex ++){
    let investorAddress = tokenContract.indexedTokenHolders.call(investorIndex, {}, latestBlockNumber);
    let balance = tokenContract.balanceOf.call(investorAddress, {}, latestBlockNumber);

    if(balance.gt(0) && investorAddress !== tokenOwner){
        tokensInMarket = tokensInMarket.add(balance);
        beneficiaries.push({
            address : investorAddress,
            balance : balance
        })
    }
}

beneficiaries.forEach(beneficiary => {
        let bonus = beneficiary.balance.mul(etherBonus);
        beneficiary.bonus = bonus.div(tokensInMarket).toFixed(0);
});

//or send ether as bonus

require('fs').writeFile(

    './beneficiaries.json',

    JSON.stringify(beneficiaries),

    function (err) {
        if (err) {
            console.error('Crap happens');
        }
    }
);
