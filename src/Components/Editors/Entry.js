import React from 'react';
import Immutable from 'immutable';
import _ from 'lodash';

import Store from '../../Store/Store';
import ItemFrame from '../ItemFrame';

import DataTypes from '../DataTypes';

const style = {
  base: {
    background: 'white',
    flexDirection: 'column',
  }
};

const checkForErrors = (results) => {
      const flatResults = _.flattenDeep(results);
      let error = null;
      _.forEach(flatResults, (result) => {
        if (_.has(result, 'error')) error = result.error;
      });
      return error != null;
};

class EntryEditor extends React.Component {
  onSubmit() {
    let self = this;


    const saveAllEditors = _.map(this._columns, (e) => e == null ? true : e.onSave());
    return Promise.all(saveAllEditors).then(checkForErrors)
    .then((error) => {
      if (error) return;
      
      const entryID = self.props.microcastleStore.get('editor').get('entry');
      const schema = this.props.schema;
      if (schema.onEdit){
          schema.onEdit(this.getTempState().toJS(), {id: entryID})
            .then((edited) => {
              _.forIn(edited, (value, attributeName) => {
                const action = Store.actions.updateData(
                  self.props.microcastleStore.get('editor').get('schema'),
                  entryID,
                  attributeName,
                  Immutable.fromJS(value)
                );
                return self.props.dispatch(action);
              });
              if (this.props.closeEditor != undefined) this.props.closeEditor();
            });
      }
    }).catch(() => {});
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

    return (<div style={style.base}>
        {editorComponents}</div>
    );
  }
}

export default EntryEditor;
