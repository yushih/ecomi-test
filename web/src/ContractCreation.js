import React, { Component } from 'react';
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
            return (<div>
              Organization contract created. Use <a href={link} target="_blank">{link}</a> to interact with it.
            </div>);
        }

        return (<div>
          <AddressList list={this.state.members}  />
          <button onClick={this.onCreate}>Create Organization</button>
          {this.state.pending &&
           "transaction pending..."
          }
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
        var addr;
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
          Member adddresses:
          <ul>
            {this.state.list.map((addr, i) =>
               (<li key={i}>
                 <span className="address">{addr}</span>
                 <button onClick={self.onDelete.bind(null, i)}>del</button>
              </li>)
            )}
          </ul>
          <input value={this.state.addressToAdd} type="text" onChange={this.onInputChange} placeholder="member address" />
          <button onClick={this.onAdd} disabled={!this.state.addressValidated}>Add</button>  
        </div>);
    }
}


export default ContractCreation;
