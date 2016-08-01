import React from 'react';

import MarkdownEditor from '../MarkdownEditor';

class TextEditor extends React.Component {
  static defaultValue() {
    return '';
  }

  onSave() {
    return new Promise((resolve) => resolve());
  }

  onChange(v) {
    this.props.onChange(v);
  }

  render() {
    return <span>
      <MarkdownEditor value={this.props.value}  onChange={this.onChange.bind(this)} />
    </span>;
  }
}

export default TextEditor;
