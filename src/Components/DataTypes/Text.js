import React from 'react';

import TextField from 'material-ui/lib/text-field';

const style = {
  base: {
    width: '90%',
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
    return <TextField
      defaultValue={this.props.value}
      onChange={this.onChange.bind(this)}
      multiLine={true}
      style={style.base} />;
  }
}

export default TextEditor;
