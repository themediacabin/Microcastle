import React from 'react';
import Textarea from 'react-textarea-autosize';

import { connect } from 'react-redux';
import { getViewValue } from '../../Store/View';
import { changeView } from '../../Store/Store';

const style = {
  base: {
    boxSizing: 'border-box',
    width: '100%',
    border: 'none',
    borderBottom: '1px solid #ccc',
    fontSize: '0.9em',
  },
};

export class TextEditor extends React.Component {
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
    return <Textarea
      minRows={1}
      maxRows={12}
      value={this.props.value}
      onChange={this.onChange.bind(this)}
      style={style.base} />;
  }
}

const connectComponent = connect((state, props) => {
  return {
    value: getViewValue(state.microcastle, props.view),
  };
});

export default connectComponent(TextEditor);
