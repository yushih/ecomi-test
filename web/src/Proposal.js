//The proposed task interface. Showing voting status and allow user to vote if she hasn't.
import React, { Component } from 'react';
import Modal from 'react-modal';
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
              <h3>You have not voted yet.</h3>
              <VotePanel onVote={this.onVote} />
            </div>);
        } else if (this.state.myVote === '1') {
            return <h3>You have voted for approval.</h3>;
        } else {
            return <h3>You have voted for disapproval</h3>;
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
        return (<div>
          <Modal isOpen={this.state.initializing}>
            <h1>Fetching information from blockchain...</h1>
          </Modal>
          <div className="alert alert-secondary">
            <div>Number of members: {this.state.totalMemberCount}, votes: {this.state.voteCount}, approvals: {this.state.yesCount}.</div>
            <this.voteResult />
          </div>
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
        return (<div>
          <Modal isOpen={this.state.votePending}>
            <h1>Vote pending...</h1>
          </Modal>
          <div className="vote">
            Approve this task: <YesNo selectedValue={this.state.vote} onChange={this.onVoteChange} />
            <button className="btn btn-primary" onClick={this.onVote}>Vote</button>
          </div>
        </div>);
    }
}

export default Proposal;
