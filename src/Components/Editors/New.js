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
      return new Promise((resolve, reject) => {
        schema.onNew(this.getTempState().toJS()).then((edited) => {
            _.forIn(edited, (value, entryID) => {
              const action = DataStore.actions.insertData(
                self.props.microcastleEditor.get('schema'),
                entryID,
                value
              );
              return self.props.dispatch(action);
              resolve(edited);
            });
        });
      });
    }
  }

  getTempState() {
    return this.props.microcastleEditor.get('tempState') || Immutable.Map({});
  }

  onComponentChange(attributeName, value) {
    const editorTempState = this.getTempState();
    const newEditorTempState = editorTempState.set(attributeName, value);
    this.props.changeTempState(newEditorTempState);
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
                           options={columnOptions.options}
                           microcastleStore={this.props.microcastleStore}
                           microcastleSchema={this.props.microcastleSchema}
                           dispatch={this.props.dispatch} />
        </span>
      );
    }));

    return (<div>
        {editorComponents}</div>
    );
  }
}

export default Editor;
