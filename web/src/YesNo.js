import React, { Component } from 'react';
import {RadioGroup, Radio} from 'react-radio-group';

class YesNo extends Component {
    render () {
        return <RadioGroup selectedValue={this.props.selectedValue} onChange={this.props.onChange}>
            <Radio value="yes" />Yes
            <Radio value="no" />No
        </RadioGroup>;
    }
}

export default YesNo;
