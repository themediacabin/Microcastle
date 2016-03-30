import React from 'react';

const style = {
  base: {
    boxSizing: 'border-box',
    width: '100%',
  },
};

class TextEditor extends React.Component {
  static defaultValue() {
    return '';
  }

  onChange(event) {
    this.props.onChange(event.target.value);
  }

  render() {
    return <input type='text'
      value={this.props.value}
      onChange={this.onChange.bind(this)}
      style={style.base} />;
  }
}

export default TextEditor;
