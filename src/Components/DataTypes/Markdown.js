import React from 'react';

import marked from 'marked';

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

  onChange(event) {
    this.props.onChange(event.target.value);
  }

  render() {
    return <span>
      <div style={style.base}>
        <div style={style.textAreaContainer}>
          <p style={style.fieldLabel}>
            Markdown (<a href='http://commonmark.org/help/' target='_blank'>?</a>)
          </p>
          <textarea
            value={this.props.value}
            onChange={this.onChange.bind(this)}
            style={style.textArea} />
        </div>
        <div style={style.previewContainer}>
          <p style={style.fieldLabel}>Preview</p>
          <div style={style.preview}
            dangerouslySetInnerHTML={{ __html: marked(this.props.value) }} />
        </div>
      </div>
    </span>;
  }
}

export default TextEditor;
