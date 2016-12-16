import React from 'react';

import { connect } from 'react-redux';
import { getViewValue, getSchemaFromView } from '../../Store/View';
import { changeView } from '../../Store/Store';

class SelectEditor extends React.Component {
  static defaultValue() {
    return '';
  }

  static validate(scheme, val) {
    if (scheme.required && (!val || val==''))
      return ['required'];
    return [];
  }

  onChange(event) {
    this.props.dispatch(changeView(this.props.view, event.target.value));
  }

  render() {
    const schema = getSchemaFromView(this.props.schema, this.props.view);
    const options = schema.choices.map((name, i) => {
      return <option key={i} value={name}>{name}</option>;
    });

    return (
      <select value={this.props.value} onChange={this.onChange.bind(this)}>
        <option value=''>Choose One</option>
        {options}
      </select>
    );
  }
}

const connectComponent = connect((state, props) => {
  return {
    value: getViewValue(state.microcastle, props.view),
  };
});

export default connectComponent(SelectEditor);
