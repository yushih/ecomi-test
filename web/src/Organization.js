// The organization interface.
import React, { Component } from 'react';
import YesNo from './YesNo';
import * as blockchain from './blockchain';
import * as utils from './utils';

class Organization extends Component {
    constructor (props) {
        super(props);
    }

    render () {
        return <ProposePanel />
    }
}

export default Organization;


class ProposePanel extends Component {
    constructor (props) {
        super(props);
        this.state = { vote: 'yes'};

        this.onPropose = this.onPropose.bind(this);
        this.onProposalChange = this.onProposalChange.bind(this);
        this.onVoteChange = this.onVoteChange.bind(this);
    }

    onProposalChange ({target: {value}}) { 
        this.setState({proposal: value});
    }

    onVoteChange (value) {
        this.setState({vote: value});
    }

    async onPropose () {
        this.setState({txPending: true});

        const self = this;
        blockchain.propose(utils.getParams().addr, this.state.proposal, this.state.vote==='yes')
            .on('receipt', function (receipt) {
                console.log('receipt', receipt);
                self.setState({proposed: true, txPending: false});
            })
            .on('error', function (error) {
                if (blockchain.didUserCancelTx(error)) {
                    // user canceled, not error
                    return;
                }
                console.log('error', error);
                self.setState({error: error.message, txPending: false});
            });


    }

    render () {
        // proposed successfully
        if (this.state.proposed) {
            const link = utils.getUrlForProposal(this.state.proposal);
            return (<div>
              Proposal "{this.state.proposal}" has been submitted. Use link <a href={link} target="_blank">{link}</a> to vote and check status.
            </div>);
        }

        return (<div>
          { this.state.txPending &&
            <div>transaction pending...</div>
          }
          <div>
            <input type="text" onChange={this.onProposalChange} placeholder="Task name" />
          </div>

          <div>
            My vote:
            <YesNo selectedValue={this.state.vote} onChange={this.onVoteChange} />
          </div>
          <div>
            <button onClick={this.onPropose}>Propose</button>
          </div>
        </div>);
    }
}
