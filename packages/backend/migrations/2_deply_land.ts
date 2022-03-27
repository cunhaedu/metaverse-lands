const Land = artifacts.require("Land");

module.exports = function (deployer: Truffle.Deployer) {
  const NAME = 'Metaverse Buildings';
  const SYMBOL = 'MBS';
  const COST = web3.utils.toWei('1', 'ether');

  deployer.deploy(Land, NAME, SYMBOL, COST);
} as Truffle.Migration;
