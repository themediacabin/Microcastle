import React from 'react';

let SimpleMDE = null
if (typeof window !== 'undefined') {
  SimpleMDE = require('simplemde/dist/simplemde.min');
}

export default class MarkdownEditor extends React.Component {
  componentDidMount() {
    this._editor = new SimpleMDE({ element: this._textarea });
    const self = this;
    this._editor.codemirror.on("change", () => {
      this.props.onChange(self._editor.value());
    });
    this._editor.value(this.props.value);
  }
  
  componentWillUnmount() {
    if (this._editor != null) {
      this._editor = null;
    }
  }
  
  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.value != this._editor.value()) {
      this._editor.value(nextProps.value);
    }
    return false;
  }
  
  render() {
    return <textarea ref={r => this._textarea = r} />
  }
};