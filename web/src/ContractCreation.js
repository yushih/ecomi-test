import React, { Component } from 'react';
import Modal from 'react-modal';
import './ContractCreation.css';
import * as blockchain from './blockchain';
import * as utils from './utils';

class ContractCreation extends Component {
    constructor (props) {
        super(props);
        this.state = {members: []};

        this.onCreate = this.onCreate.bind(this);
    }

    onCreate () {
        const self = this;
        self.setState({pending: true});
        blockchain.create(this.state.members)
            .on('receipt', function (receipt) {
                self.setState({contractAddress: receipt.contractAddress, pending: false});
            })
            .on('error', function (error) {
                self.setState({error: error.message, pending: false});
            });
    }

    render () {
        // created
        if (!!this.state.contractAddress) {
            const link = utils.getUrlForOrganization(this.state.contractAddress);
            return (<div className="alert alert-primary m-4">
              Organization contract created. Use <a href={link} target="_blank">{link}</a> to interact with it.
            </div>);
        }

        return (<div>
          <AddressList list={this.state.members}  />
          <button className="btn btn-primary my-4" onClick={this.onCreate}>Create Organization</button>
          <Modal isOpen={this.state.pending}>
            <div className="text-center">
              <h1>transaction pending...</h1>
            </div>
           </Modal>
        </div>);
    }
}

class AddressList extends Component {
    constructor (props) {
        super(props);

        this.onAdd = this.onAdd.bind(this);
        this.onInputChange = this.onInputChange.bind(this);
        this.onDelete = this.onDelete.bind(this);

        this.state = {list: [], addressToAdd: '', addressValidated: false};
    }

    onInputChange (event) {
        this.setState({addressToAdd: event.target.value,
                       addressValidated: /^0x[0-9a-fA-F]{40}$/.test(event.target.value)});
    }

    onAdd () {
        this.props.list.push(this.state.addressToAdd);
        this.setState({list: this.state.list.concat(this.state.addressToAdd),
                       addressToAdd: '', addressValidated: false});
    }

    onDelete (i) {
        const updated = [...this.state.list];
        updated.splice(i, 1);
        this.setState({list: updated});

        this.props.list.splice(i, 1);
    }

    render () {
        const self = this;
        return (<div>
          <h1 className="h3 mb-4">Member adddresses:</h1>
          <ul className="list-group">
            {this.state.list.map((addr, i) =>
               (<li className="list-group-item" key={i}>
                 <code>{addr}</code>
                 <button className="btn" onClick={self.onDelete.bind(null, i)}>X</button>
                </li>)
            )}
            <li className="list-group-item">
              <div className="input-group">
                <input className="addressInput" value={this.state.addressToAdd} type="text" onChange={this.onInputChange} placeholder="member address" />
                <button className="btn" onClick={this.onAdd} disabled={!this.state.addressValidated}>Add</button>
              </div>
            </li>
          </ul>
        </div>);
    }
}


export default ContractCreation;
