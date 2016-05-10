import React from 'react';

import marked from 'marked';
import MarkdownEditor from '../MarkdownEditor';

const style = {
  base: {
    verticalAlign: 'top',
    display: 'flex',
  },
  textAreaContainer: {
    flex: '1 0',
    display: 'flex',
    flexDirection: 'column',
  },
  previewContainer: {
    flex: '1 0',
    paddingLeft: 15,
  },
  textArea: {
    boxSizing: 'border-box',
    border: 'none',
    borderBottom: '1px solid #ccc',
    fontSize: '0.9em',
    flex: '1 0',
    width: '100%',
  },
  preview: {
    boxSizing: 'border-box',
    border: 'none',
    fontSize: '0.9em',
    display: 'inline-block',
    verticalAlign: 'top',
    flex: '1 0',
  },
  fieldLabel: {
    margin: 0,
    marginBottom: 3,
    padding: 0,
    fontSize: '0.9em',
    color: 'gray',
    flex: '0 0',
  },
};

class TextEditor extends React.Component {
  static defaultValue() {
    return '';
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
