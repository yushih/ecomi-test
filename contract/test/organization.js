const Organization = artifacts.require('Organization');

contract('Organization', async function (accounts) {
    const TASKNAME = 'taskA';

    it('should allow to propose but not allow to re-propose with the same name', async function () {
        const instance = await Organization.deployed();
        await instance.propose(TASKNAME, true, {from: accounts[0]});

        try {
            await instance.propose(TASKNAME, true, {from: accounts[0]});
            assert.fail('should not reach here');
        } catch (e) {
        }
    });


    it('should allow to vote but not to re-vote', async function () {
        const instance = await Organization.deployed();

        const originalResult = await instance.result.call(TASKNAME);
        const originalVoteCount = originalResult[0].toNumber();
        const originalYesCount =  originalResult[1].toNumber();


        await instance.vote(TASKNAME, true, {from: accounts[1]});

        const result = await instance.result.call(TASKNAME);
        const voteCount = result[0].toNumber();
        const yesCount = result[1].toNumber();

        assert.equal(voteCount, originalVoteCount+1);
        assert.equal(yesCount, originalYesCount+1);

        try {
            await instance.vote(TASKNAME, true, {from: accounts[1]});
            assert.fail('should not reach here');
        } catch (e) {
        }
    });

    it('should allow all to vote', async function () {
        const instance = await Organization.deployed();
        
        for (var i=2; i<accounts.length; i++) {
            await instance.vote(TASKNAME, true, {from: accounts[i]});
        }

        const result = await instance.result.call(TASKNAME);
        const voteCount = result[0].toNumber();
        const yesCount = result[1].toNumber();
        const memberCount = result[2].toNumber();

        assert.equal(voteCount, accounts.length);
        assert.equal(yesCount, accounts.length);
        assert.equal(memberCount, accounts.length);
    });

});


