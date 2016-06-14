import React from 'react';
import Textarea from 'react-textarea-autosize';

const style = {
  base: {
    boxSizing: 'border-box',
    width: '100%',
    border: 'none',
    borderBottom: '1px solid #ccc',
    fontSize: '0.9em',
  },
};

class TextEditor extends React.Component {
  static defaultValue() {
    return '';
  }

  onSave() {
    return new Promise((resolve) => resolve());
  }

  onChange(event) {
    this.props.onChange(event.target.value);
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

export default TextEditor;
