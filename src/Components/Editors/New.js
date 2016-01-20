import React from 'react';
import { connect } from 'react-redux';
import Immutable from 'immutable';
import _ from 'lodash';

import DataStore from '../../Store/Data';
import EditorStore from '../../Store/Editor';
import EditorFrame from '../EditorFrame';

import DataTypes from '../DataTypes';


class Editor extends React.Component {
  onSubmit() {
    let self = this;
    const schema = this.props.schema;
    if (!!schema.onNew){
      schema.onNew(this.props.microcastleEditor.get('tempState').toJS())
        .then((edited) => {
          _.forIn(edited, (value, entryID) => {
            const action = DataStore.actions.insertData(
              self.props.microcastleEditor.get('schema'),
              entryID,
              value
            );
            return self.props.dispatch(action);
          });
        });
    }

    const action = EditorStore.actions.close();
    return this.props.dispatch(action);
  }

  onCancel() {
    const action = EditorStore.actions.close();
    return this.props.dispatch(action);
  }

  onComponentChange(attributeName, value) {
    const editorTempState = this.props.microcastleEditor.get('tempState') || new Immutable.Map({});
    const newEditorTempState = editorTempState.set(attributeName, value);
    const action = EditorStore.actions.setTempState(newEditorTempState);
    return this.props.dispatch(action);
  }

  getOr(it, def, arr) {
    if (!it) return def;
    if (arr.length === 1) return it.get(arr[0]);
    return this.getOr(it.get(arr[0]), def, arr.shift());
  }

  getCurrentValue(attributeName, defaultValue) {
    return this.props.microcastleEditor.getIn(['tempState', attributeName], defaultValue);
  }

  render() {
    const schema = this.props.schema.attributes;

    const editorComponents = _.values(_.mapValues(schema, (columnOptions, columnName) => {
      const ColumnComponent = DataTypes.stringToComponent(columnOptions.type);
      return (
        <span key={columnName}>
          <h2>{columnName}</h2>
          <ColumnComponent onChange={this.onComponentChange.bind(this, columnName)}
                           value={this.getCurrentValue(columnName, ColumnComponent.defaultValue())}
                           options={columnOptions.options} />
        </span>
      );
    }));

    return (
      <EditorFrame
      onSubmit={this.onSubmit.bind(this)}
      onCancel={this.onCancel.bind(this)}
      title="Creating New"
      open={true}>
        {editorComponents}
      </EditorFrame>
    );
  }

}

const connectReducers = connect((state) => {
  return {
    microcastleEditor: state.microcastleEditor,
  };
});

export default connectReducers(Editor);
