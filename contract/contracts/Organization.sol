pragma solidity ^0.4.22;

contract Organization {
    enum Vote { NO_VOTE, YES, NO }
    struct Task {
        uint voteCount;
        uint yesCount;
        mapping(address=>Vote) votes;
    }

    mapping(address=>bool) public membership;
    uint public memberCount;
    mapping(string=>Task) taskVotes;

    modifier memberOnly {
        require(membership[msg.sender]);
        _;
    }
       
    constructor (address[] members) public  {
        for (uint i=0; i<members.length; i++) {
            membership[members[i]] = true;
        }
        memberCount = members.length;
    }

    function propose (string taskName, bool voteYes) public memberOnly {
        require(taskVotes[taskName].voteCount==0); // task must not exist
        taskVotes[taskName] = Task({voteCount: 1, 
                                    yesCount: voteYes ? 1: 0});

        taskVotes[taskName].votes[msg.sender] = voteYes ? Vote.YES: Vote.NO;
    }

    function vote (string taskName, bool voteYes) public memberOnly {
        Task storage task = taskVotes[taskName];

        require(task.voteCount > 0); // must exist
        require(uint(task.votes[msg.sender]) == 0); // can only vote once
        
        task.votes[msg.sender] = voteYes ? Vote.YES: Vote.NO;
        task.voteCount += 1;
        if (voteYes) {
            task.yesCount += 1;
        }
    }

    function result (string taskName) public view
        returns (uint voteCount, uint yesCount, uint totalMemberCount) {
        Task storage task = taskVotes[taskName];

        require(task.voteCount > 0);
        return (task.voteCount, task.yesCount, memberCount);
    }
}