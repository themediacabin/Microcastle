import React from 'react';
import Immutable from 'immutable';
import _ from 'lodash';

import Store from '../../Store/Store';
import ItemFrame from '../ItemFrame';

import DataTypes from '../DataTypes';

const checkForErrors = (results) => {
      const flatResults = _.flattenDeep(results);
      let error = null;
      _.forEach(flatResults, (result) => {
        if (_.has(result, 'error')) error = result.error;
      });
      return error != null;
};

class NewEditor extends React.Component {
  onSubmit() {
    let self = this;
    const schema = this.props.schema;
    if (schema.onNew){
      const saveAllEditors = _.map(this._columns, (e) => e == null ? true : e.onSave());
      return Promise.all(saveAllEditors).then(checkForErrors)
      .then((err) => new Promise((resolve, reject) => {
        if (err) return reject('Not Saved');
        schema.onNew(this.getTempState().toJS()).then((edited) => {
            _.forIn(edited, (value, entryID) => {
              const action = Store.actions.insertData(
                self.props.microcastleStore.get('editor').get('schema'),
                entryID,
                value
              );
              self.props.dispatch(action);

              if (this.props.closeEditor != undefined) this.props.closeEditor();

              resolve(edited);
            });
        });
      })).catch(() => {});
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
    this._columns = [];

    const editorComponents = _.values(_.mapValues(schema, (columnOptions, columnName) => {
      const ColumnComponent = DataTypes.stringToComponent(columnOptions.type);
      return (
        <ItemFrame title={columnName} key={columnName}>
          <ColumnComponent ref={(r) => this._columns.push(r)}
                           onChange={this.onComponentChange.bind(this, columnName)}
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
