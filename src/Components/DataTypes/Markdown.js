import React from 'react';
import { connect } from 'react-redux';
import { getViewValue } from '../../Store/View';
import { changeView } from '../../Store/Store';
import MarkdownEditor from '../MarkdownEditor';

class Markdown extends React.Component {
  static defaultValue() {
    return '';
  }

  static validate(scheme, val) {
    if (scheme.required && (!val || val==''))
      return ['required'];
    return [];
  }

  onChange(value) {
    this.props.dispatch(changeView(this.props.view, value));
  }

  render() {
    return <span>
      <MarkdownEditor value={this.props.value}  onChange={this.onChange.bind(this)} />
    </span>;
  }
}

const connectComponent = connect((state, props) => {
  return {
    value: getViewValue(state.microcastle, props.view),
  };
});

export default connectComponent(Markdown);
