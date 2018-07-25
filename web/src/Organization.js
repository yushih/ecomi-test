// The organization interface.
import React, { Component } from 'react';
import Modal from 'react-modal';
import YesNo from './YesNo';
import './Organization.css';
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
        this.state = {vote: 'yes', proposal: ''};

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
                    self.setState({txPending: false});
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
            return (<div className="alert alert-primary">
              Proposal "{this.state.proposal}" has been submitted. Use link <a href={link} target="_blank">{link}</a> to vote and check status.
            </div>);
        }

        return (<div>
          <Modal isOpen={this.state.txPending}>
            <div className="text-center">
              <h1>transaction pending...</h1>
            </div>
          </Modal>

          <h1 className="h3">Propose a new task:</h1>
          <div>
            <input type="text" onChange={this.onProposalChange} placeholder="Task name" />
          </div>

          <div className="vote">
            My vote:
            <YesNo selectedValue={this.state.vote} onChange={this.onVoteChange} />
          </div>
          <div>
            <button disabled={this.state.proposal===''} className="btn btn-primary my-4" onClick={this.onPropose}>Propose</button>
          </div>
        </div>);
    }
}
