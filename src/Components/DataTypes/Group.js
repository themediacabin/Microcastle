import React from 'react';
import DataTypes from '../DataTypes';
import I from 'immutable';
import _ from 'lodash';
import R from 'ramda';
import { connect } from 'react-redux';

import { stringToComponent } from '../DataTypes';
import { getViewValue, getSchemaFromView } from '../../Store/View';

const style = {
  image: {
    maxHeight: '300px',
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

class GroupEditor extends React.Component {
  static defaultValue(schema) {
    return R.pipe(
      R.mapObjIndexed(v => stringToComponent(v.type).defaultValue(v)),
      I.fromJS
    )(schema.members);
  }

  static validate() {
    return [];
  }
  
  onChangeIndividual(key, value) {
    this.props.onChange(this.props.value.set(key, value));
  }

  render() {
    const schema = this.props.currentSchema;
    const editors = _.map(schema.members, (val, key) => {
      const TypeEditor = DataTypes.stringToComponent(val.type);
      const view = this.props.view.update('part', (part = new I.List()) => {
        return part.push(key);      
      });
      
      return <div key={key}>
                <h3 style={style.title}>{key}</h3>
                <TypeEditor
                  schema={schema}
                  view={view} />
              </div>;
    });        
    return (
      <div>
        {editors}
      </div>
    );
  }
}

const connectGroupEditor = connect((state, props) => {
  return {
    value: getViewValue(state.microcastle, props.view),
    currentSchema: getSchemaFromView(props.schema, state.microcastle, props.view)
  };
});

export default connectGroupEditor(GroupEditor);
