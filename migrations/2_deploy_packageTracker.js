var packageTracker = artifacts.require("./packageTracker.sol");

module.exports = function(deployer) {
  deployer.deploy(packageTracker);
};
