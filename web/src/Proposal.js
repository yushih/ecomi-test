//The proposed task interface. Showing voting status and allow user to vote if she hasn't.
import React, { Component } from 'react';
import YesNo from './YesNo';
import * as utils from './utils';
import * as blockchain from './blockchain';

class Proposal extends Component {
    constructor (props) {
        super(props);
        this.state = { initializing: true };

        this.onVote = this.onVote.bind(this);
        this.voteResult = this.voteResult.bind(this);
        this.myVote = this.myVote.bind(this);
    }

    async componentDidMount () {
        const {addr, proposal} = utils.getParams();
        const {voteCount, yesCount, totalMemberCount} = await blockchain.getResult(addr, proposal);
        const myVote = await blockchain.getMyVote(addr, proposal);

        this.setState({initializing: false,
                       myVote,
                       voteCount: Number(voteCount), 
                       yesCount: Number(yesCount), 
                       totalMemberCount: Number(totalMemberCount)});
    }

    onVote (voteYes) {
        //Note we can not simply refesh here because there is no
        //"read your write" guarantee and we may end up reading a stale 
        //stale state which confuses user.
        this.setState({myVote:voteYes?'1':'2',
                       voteCount: this.state.voteCount+1,
                       yesCount: this.state.yesCount+(voteYes?1:0)});
        
    }

    myVote () {
        if (this.state.myVote === '0') {
            return (<div>
              <div>You have not voted yet.</div>
              <VotePanel onVote={this.onVote} />
            </div>);
        } else if (this.state.myVote === '1') {
            return <div>You have voted for approval.</div>;
        } else {
            return <div>You have voted for disapproval</div>;
        }
    }

    voteResult () {
        if (this.state.voteCount === this.state.totalMemberCount) {
            if (this.state.yesCount === this.state.voteCount) {
                return <div>The Task is approved.</div>
            } else {
                return <div>The Task is not approved.</div>
            }
        } else {
            return <div>Voting has not concluded yet.</div>
        }
    }

    render () {
        if (this.state.initializing) {
            return <div>Fetching information from blockchain.</div>;
        } 
        return (<div>
          <div>Number of members: {this.state.totalMemberCount}, votes: {this.state.voteCount}, approvals: {this.state.yesCount}.</div>
          <this.voteResult />
          <this.myVote />
        </div>)
    }
}

// <VotePanel onVote={function (voteYes:bool) {}} />
class VotePanel extends Component {
    constructor (props) {
        super(props);
        this.onVote = this.onVote.bind(this);
        this.onVoteChange = this.onVoteChange.bind(this);
        
        this.state = {vote: 'yes'};
    }

    onVoteChange (value) {
        this.setState({vote: value});
    }

    onVote () {
        const {addr, proposal} = utils.getParams();
        this.setState({votePending: true});

        const self = this;
        const voteYes = this.state.vote==='yes';

        blockchain.vote(addr, proposal, voteYes)
            .on('receipt', function () {
                self.setState({votePending: false});
                self.props.onVote(voteYes);
            })
            .on('error', function (error) {
                self.setState({votePending: false, error: error.message});
            });
    }

    render () {
        if (this.state.votePending) {
            return (<div>Vote pending...</div>);
        }

        return (<div>
          Approve this task: <YesNo selectedValue={this.state.vote} onChange={this.onVoteChange} />
          <button onClick={this.onVote}>Vote</button>
        </div>);
    }
}

export default Proposal;
