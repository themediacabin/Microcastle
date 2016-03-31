import React from 'react';
import { connect } from 'react-redux';
import Immutable from 'immutable';
import _ from 'lodash';

import Store from '../Store/Store';

import EditorFrame from './EditorFrame';
import NewEditor from './Editors/New';
import SingleEditor from './Editors/Single';
import EntryEditor from './Editors/Entry';

import HTML5Backend from 'react-dnd-html5-backend';
import {DragDropContext} from 'react-dnd';

class Editor extends React.Component {

  isOpen() {
    return this.props.microcastle.get('editor').get('open');
  }

  getCurrentSchema() {
    const schema = this.props.microcastle.get('editor').get('schema');
    return this.props.schemas[schema];
  }

  getEditor() {
    switch (this.props.microcastle.get('editor').get('action')) {
      case 'EDIT_SINGLE':
        return SingleEditor;
      case 'EDIT_ENTRY':
        return EntryEditor;
      case 'CREATE_NEW':
        return NewEditor;
    }
    return NewEditor;
  }

  onSubmit() {
    this._editor.onSubmit();
    const action = Store.actions.close();
    return this.props.dispatch(action);
  }

  onCancel() {
    const action = Store.actions.close();
    return this.props.dispatch(action);
  }

  onChangeTempState(newState) {
    const action = Store.actions.setTempState(newState);
    return this.props.dispatch(action);
  }

  render() {
    if (!this.isOpen()) return null;
    const self = this;

    const CurrentEditor = this.getEditor();

    return <EditorFrame
              onSubmit={self.onSubmit.bind(self)}
              onCancel={self.onCancel.bind(self)}
              title="Microcastle Editor"
              open={true}>
              <CurrentEditor schema={this.getCurrentSchema()}
                             microcastleSchema={this.props.schemas}
                             microcastleStore={this.props.microcastle}
                             changeTempState={this.onChangeTempState.bind(this)}
                             dispatch={this.props.dispatch}
                             ref={c => this._editor = c}/>
    </EditorFrame>
  }
}

const connectReducers = connect((state) => {
  return {
    microcastle: state.microcastle,
  };
});
export default DragDropContext(HTML5Backend)(connectReducers(Editor))
