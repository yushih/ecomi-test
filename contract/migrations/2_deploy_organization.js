const Organization = artifacts.require('./Organization.sol');

module.exports = function (deployer, _network, accounts) {
    deployer.deploy(Organization, accounts);
};
