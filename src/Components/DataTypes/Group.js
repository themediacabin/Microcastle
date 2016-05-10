import React from 'react';
import DataTypes from '../DataTypes';
import Immutable from 'immutable';
import _ from 'lodash';

const style = {
  image: {
    maxHeight: '300px',
  }
};

/*
{
  type: 'group',
  options: {
    members: {
      image: {type: image},
      something: {type: bob},
    }    
  }
}

{
  type: 'array'
  subtype: {type: car}
  
  type: 'relation'
  relative: 'bob'
  
  type: 'select'
  options: ['bob', 'car']
}
*/



class GroupEditor extends React.Component {
  static defaultValue() {
    return new Immutable.fromJS({});
  }
  
  onChangeIndividual(key, value) {
    this.props.onChange(this.props.value.set(key, value));
  }

  render() {
    const editors = _.map(this.props.options.members, (val, key) => {
      const TypeEditor = DataTypes.stringToComponent(val.type);
      const defaultValue = TypeEditor.defaultValue();
      const individualValue = this.props.value.get(key, defaultValue);
      
      return <div key={key}>
                <h3>{key}</h3>
                <TypeEditor
                  options={val.options}
                  value={individualValue}
                  onChange={this.onChangeIndividual.bind(this, key)}
                  microcastleStore={this.props.microcastleStore}
                  microcastleSchema={this.props.microcastleSchema}
                  dispatch={this.props.dispatch} />
              </div>
    });        
    return (
      <div>
        {editors}
      </div>
    );
  }
}

export default GroupEditor;
