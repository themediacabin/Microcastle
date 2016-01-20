import React from 'react';
import { connect } from 'react-redux';
import Immutable from 'immutable';
import _ from 'lodash';

import DataStore from '../Store/Data';
import EditorStore from '../Store/Editor';

import EditorFrame from './EditorFrame';
import NewEditor from './Editors/New';
import SingleEditor from './Editors/Single';

class Editor extends React.Component {

  isOpen() {
    return this.props.microcastleEditor.get('open');
  }

  getCurrentSchema() {
    const schema = this.props.microcastleEditor.get('schema');
    return this.props.schemas[schema];
  }

  getEditor() {
    if (this.props.microcastleEditor.get('action') == 'EDIT_SINGLE') {
      return SingleEditor;
    }
    return NewEditor;
  }

  render() {
    if (!this.isOpen()) return false;

    const CurrentEditor = this.getEditor();
    return <CurrentEditor schema={this.getCurrentSchema()} />
  }
}

const connectReducers = connect((state) => {
  return {
    microcastleEditor: state.microcastleEditor,
  };
});

export default connectReducers(Editor);
