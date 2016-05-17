import React from 'react';
import Textarea from 'react-textarea-autosize';
import Immutable from 'immutable';
import _ from 'lodash';
import DataTypes from '../DataTypes';

const style = {
  base: {
    boxSizing: 'border-box',
    width: '100%',
    border: 'none',
    borderBottom: '1px solid #ccc',
    fontSize: '0.9em',
  },
};

class FlexEditor extends React.Component {
  static defaultValue() {
    return new Immutable.fromJS({_flex_type: undefined});
  }

  onChangeFlexType(event) {
    const result = event.target.value === 'Select One' ? undefined : event.target.value; 
    this.props.onChange(new Immutable.fromJS({_flex_type: result}));
  }
  
  onChangeField(key, val) {
    this.props.onChange(this.props.value.set(key, val));
  }
  
  renderFields() {
    const flexTypes = this.props.options.flexes[this.props.value.get('_flex_type')];
    const fields = _.map(flexTypes, (val, key) => {
      const FieldComponent = DataTypes.stringToComponent(val.type);

      return <div key={key}>
        <h4>{key}</h4>
        <div>
          <FieldComponent
                onChange={this.onChangeField.bind(this, key)}
                value={this.props.value.get(key)}
                options={val}
                microcastleStore={this.props.microcastleStore}
                microcastleSchema={this.props.microcastleSchema}
                dispatch={this.props.dispatch} />
        </div>
      </div>;
    });
    
    return <div>
      {fields}
    </div>
  }

  render() {
    const flexTypes = _.map(_.concat(['Select One'], _.keys(this.props.options.flexes)), (title) => {
      return <option key={title} name={title}>{title}</option>;
    });
    
    return <div>
      <div><select value={this.props.value.get('_flex_type')} onChange={this.onChangeFlexType.bind(this)}>{flexTypes}</select></div>
      {this.props.value.get('_flex_type') == undefined ? null : this.renderFields()}
    </div>
  }
}

export default FlexEditor;

/*
  type: Flex
  flexes: {
    title: {type: text}
    paragraphs: {
      text: {type: text}
      title: {type: text}
    }
  }
  
  {
    _flex_type: paragraphs
    texT: 2
    title: 3
  }

*/