import React from 'react';
import { connect } from 'react-redux';
import Immutable from 'immutable';
import _ from 'lodash';

import Store from '../../Store/Store';
import EditorFrame from '../EditorFrame';
import ItemFrame from '../ItemFrame';

import DataTypes from '../DataTypes';


class NewEditor extends React.Component {
  onSubmit() {
    let self = this;
    const schema = this.props.schema;
    if (!!schema.onNew){
      return new Promise((resolve, reject) => {
        schema.onNew(this.getTempState().toJS()).then((edited) => {
            _.forIn(edited, (value, entryID) => {
              const action = Store.actions.insertData(
                self.props.microcastleStore.get('editor').get('schema'),
                entryID,
                value
              );
              self.props.dispatch(action);
              resolve(edited);
            });
        });
      });
    }
  }

  getTempState() {
    return this.props.microcastleStore.get('editor').get('tempState') || Immutable.Map({});
  }

  onComponentChange(attributeName, value) {
    const editorTempState = this.getTempState();
    const newEditorTempState = editorTempState.set(attributeName, value);
    this.props.changeTempState(newEditorTempState);
  }

  getCurrentValue(attributeName, defaultValue) {
    return this.props.microcastleStore.get('editor').getIn(['tempState', attributeName], defaultValue);
  }

  render() {
    const schema = this.props.schema.attributes;

    const editorComponents = _.values(_.mapValues(schema, (columnOptions, columnName) => {
      const ColumnComponent = DataTypes.stringToComponent(columnOptions.type);
      return (
        <ItemFrame title={columnName} key={columnName}>
          <ColumnComponent onChange={this.onComponentChange.bind(this, columnName)}
                           value={this.getCurrentValue(columnName, ColumnComponent.defaultValue())}
                           options={columnOptions}
                           microcastleStore={this.props.microcastleStore}
                           microcastleSchema={this.props.microcastleSchema}
                           dispatch={this.props.dispatch} />
        </ItemFrame>
      );
    }));

    return (<div>
        {editorComponents}</div>
    );
  }
}

export default NewEditor;
