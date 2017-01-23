import React from 'react';
import Immutable from 'immutable';
import _ from 'lodash';
import DataTypes from '../DataTypes';

import { connect } from 'react-redux';

import { getViewValue, getSchemaFromView } from '../../Store/View';
import { changeView } from '../../Store/Store';

const style = {
  base: {
    boxSizing: 'border-box',
    width: '100%',
    border: 'none',
    borderBottom: '1px solid #ccc',
    fontSize: '0.9em',
  },
  title: {
    color: '#333',
    padding: 0,
    fontWeight: '200',
    fontSize: '0.9em',
    marginTop: '1em',    
    marginBottom: '0.5em',
  }
};

class FlexEditor extends React.Component {
  static defaultValue() {
    return new Immutable.fromJS({_flex_type: undefined});
  }

  static validate(scheme, val) {
    if (scheme.required && (!val || val.get('_flex_type') == undefined))
      return ['required'];
    return [];
  }

  onChangeFlexType(event) {
    const result = event.target.value === 'Select One' ? undefined : event.target.value; 
    this.props.dispatch(changeView(this.props.view, new Immutable.fromJS({_flex_type: result})));
  }
  
  renderFields() {
    const schema = this.props.currentSchema;
    const scheme = schema['flexes'][this.props.value.get('_flex_type')];

    const fields = _.map(scheme, (val, key) => {
      const FieldComponent = DataTypes.stringToComponent(val.type);
      const childView = this.props.view.update('part', (l = new Immutable.List()) => l.push(key));

      return <div key={key}>
        <h4 style={style.title}>{key}</h4>
        <div>
          <FieldComponent
                view={childView}
                schema={this.props.schema}
                />
        </div>
      </div>;
    });
    
    return <div>
      {fields}
    </div>;
  }

  render() {
    const schema = this.props.currentSchema;

    const flexTypes = _.map(_.concat(['Select One'], _.keys(schema.flexes)), (title) => {
      return <option key={title} value={title}>{title}</option>;
    });
    
    return <div>
      <div>
        <select value={this.props.value.get('_flex_type')} onChange={this.onChangeFlexType.bind(this)}>{flexTypes}</select>
      </div>
      {this.props.value.get('_flex_type') == undefined ? null : this.renderFields()}
    </div>;
  }
}

const connectFlexEditor = connect((state, props) => {
  return {
    value: getViewValue(state.microcastle, props.view),
    currentSchema: getSchemaFromView(props.schema, state.microcastle, props.view)
  };
});


export default connectFlexEditor(FlexEditor);


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
