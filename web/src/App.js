// DApp entry point. Check the environment and dispatch to other components.
import React, { Component } from 'react';
import Organization from './Organization';
import Proposal from './Proposal';
import ContractCreation from './ContractCreation';
import * as utils from './utils';

class App extends Component {
    constructor (props) {
        super(props);

        const {addr, proposal} = utils.getParams();
        const hasMetamask = !!window.web3;
        this.state = {addr, proposal, hasMetamask};
    }

    render() {
        if (!this.state.hasMetamask) {
            return (
                <div>Need MetaMask.</div>
            );
        }
        if (!this.state.addr) {
            return (
                <ContractCreation />
            );
        }
        if (!!this.state.proposal) {
            return (
                <Proposal addr={this.state.addr} name={this.state.proposal} />
            );
        }
        return (<Organization addr={this.state.addr} />);
    }
}

export default App;
